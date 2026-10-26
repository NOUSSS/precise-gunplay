// Résolution étirée automatique, même fonctionnement que ValStretch :
// 1. dès le lanceur VALORANT.exe (avant la fenêtre du jeu), les écrans sont désactivés dans le
//    Gestionnaire de périphériques (pilote générique) : le jeu accepte alors la résolution du bureau ;
// 2. quand le serveur de jeu signale une partie (core-game, ou la présence du client Riot s'il ne
//    répond pas), on attend la fin du chargement (30 s par défaut) puis on passe en résolution étirée ;
// 3. retour au menu : résolution native. Fermeture du jeu : résolution native + écrans réactivés.
// Rien ne touche au processus du jeu : liste des processus et titre de fenêtre (comme le Gestionnaire
// des tâches), réglages d'affichage Windows et lecture de l'état de partie, déjà utilisée par l'app.
const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const { spawn, execFile } = require('child_process');
const { globalShortcut } = require('electron');
const { myPresence } = require('./services');

const LAUNCHER = 'valorant.exe';
const GAME = 'valorant-win64-shipping.exe';
const TICK_MS = 250;
const SESSION_MS = 2000; // une requête core-game toutes les 2 s au plus, uniquement jeu lancé
const TEST_MS = 3000;
const PRESENCE_TRUST_MS = 10000; // la présence suit core-game avec du retard : elle ne le contredit pas aussitôt

// Tâches planifiées (droits administrateur) qui désactivent / réactivent les écrans.
const TASK = (mode) => `\\Precise Gunplay\\Ecrans ${mode}`;
const SHARED_DIR = path.join(process.env.ProgramData || 'C:\\ProgramData', 'Precise Gunplay');
const MONITORS_STATE = path.join(SHARED_DIR, 'monitors-state.json');
const MONITORS_RESULT = path.join(SHARED_DIR, 'monitors-result.json');
const MONITORS_TARGET = path.join(SHARED_DIR, 'monitors-target.json'); // écrans à préparer, modifiable par le compte

const VALORANT_CONFIG = path.join(process.env.LOCALAPPDATA || '', 'VALORANT', 'Saved', 'Config');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function run(file, args) {
  return new Promise((resolve) => {
    execFile(file, args, { windowsHide: true }, (err, stdout, stderr) =>
      resolve({ code: err ? (typeof err.code === 'number' ? err.code : 1) : 0, out: String(stdout || stderr || '').trim() })
    );
  });
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- Assistant d'affichage
// Un seul processus PowerShell, lancé à la demande, qui répond ligne par ligne (voir stretch-display.ps1).
class DisplayHelper {
  constructor(file) {
    this.file = file;
    this.proc = null;
  }

  // Chaque processus a sa propre file d'attente : un ancien processus arrêté ne touche pas aux
  // requêtes du suivant.
  ensure() {
    if (this.proc) {
      const current = this.proc;
      return current.ready.then(() => current);
    }
    const p = spawn('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', this.file], { windowsHide: true });
    p.queue = [];
    this.proc = p;
    let buf = '';
    let stderr = '';
    let started = false;
    let onReady, onFail;
    p.ready = new Promise((resolve, reject) => {
      const timer = setTimeout(() => { reject(new Error('L\'assistant d\'affichage ne répond pas.')); this.stop(p); }, 30000);
      onReady = () => { started = true; clearTimeout(timer); resolve(); };
      onFail = (e) => { clearTimeout(timer); reject(e); };
    });
    p.ready.catch(() => {});
    p.stdout.setEncoding('utf8');
    p.stderr.setEncoding('utf8');
    p.stderr.on('data', (d) => { stderr += d; });
    p.stdout.on('data', (d) => {
      buf += d;
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        let msg;
        try { msg = JSON.parse(line); } catch { continue; }
        if (msg.ready) { onReady(); continue; }
        const q = p.queue.shift();
        if (q) { clearTimeout(q.timer); q.resolve(msg); }
      }
    });
    const fail = (e) => {
      if (this.proc === p) this.proc = null;
      if (!started) onFail(new Error(`Assistant d'affichage indisponible${stderr ? ` : ${stderr.trim().split('\n')[0]}` : ''}.`));
      for (const q of p.queue.splice(0)) { clearTimeout(q.timer); q.reject(e); }
    };
    p.on('error', fail);
    p.on('exit', () => fail(new Error('Assistant d\'affichage arrêté.')));
    return p.ready.then(() => p);
  }

  async call(cmd, timeoutMs = 15000) {
    const p = await this.ensure();
    if (p.exitCode !== null || !p.stdin.writable) {
      if (this.proc === p) this.proc = null;
      throw new Error('Assistant d\'affichage arrêté.');
    }
    const res = await new Promise((resolve, reject) => {
      const q = { resolve, reject, timer: setTimeout(() => { reject(new Error('Délai dépassé (affichage).')); this.stop(p); }, timeoutMs) };
      p.queue.push(q);
      p.stdin.write(cmd + '\n');
    });
    if (res.error) throw new Error(res.error);
    return res;
  }

  stop(p = this.proc) {
    if (!p) return;
    if (this.proc === p) this.proc = null;
    p.kill();
  }
}

// ---------------------------------------------------------------- Config du jeu (GameUserSettings.ini)
// « True stretch » : plein écran fenêtré, sans bandes noires, puis fichier en lecture seule pour que le
// jeu ne réécrive pas ces réglages. Le dossier actif est <LastKnownUser>-<région>.
const GAME_VALUES = {
  bShouldLetterbox: 'False',
  bLastConfirmedShouldLetterbox: 'False',
  LastConfirmedFullscreenMode: '1',
  PreferredFullscreenMode: '1',
  FullscreenMode: '1',
};

function gameSettingsPath() {
  let lastUser = null;
  try {
    const m = /^\s*LastKnownUser=(.+)$/im.exec(fs.readFileSync(path.join(VALORANT_CONFIG, 'WindowsClient', 'RiotLocalMachine.ini'), 'utf8'));
    if (m) lastUser = m[1].trim().toLowerCase();
  } catch { /* fichier absent */ }
  let candidates = [];
  try {
    candidates = fs.readdirSync(VALORANT_CONFIG)
      .map((d) => path.join(VALORANT_CONFIG, d, 'WindowsClient', 'GameUserSettings.ini'))
      .filter((f) => fs.existsSync(f));
  } catch { /* VALORANT jamais lancé */ }
  if (candidates.length <= 1) return candidates[0] || null;
  const mine = lastUser && candidates.find((f) => path.basename(path.dirname(path.dirname(f))).toLowerCase().startsWith(lastUser));
  if (mine) return mine;
  return candidates.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
}

function gameConfigLocked() {
  const file = gameSettingsPath();
  if (!file) return null;
  return (fs.statSync(file).mode & 0o200) === 0;
}

function setGameConfigLock(lock) {
  const file = gameSettingsPath();
  if (!file) throw new Error('Configuration de VALORANT introuvable : lancez le jeu une fois.');
  fs.chmodSync(file, 0o666);
  if (!lock) return false;

  const raw = fs.readFileSync(file, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(/\r?\n/);
  if (lines[lines.length - 1] === '') lines.pop();
  const wanted = new Map(Object.entries(GAME_VALUES).map(([k, v]) => [k.toLowerCase(), [k, v]]));
  // Toutes les clés vont dans [/Script/ShooterGame.ShooterGameUserSettings] : posées après
  // [ScalabilityGroups], le jeu les ignore.
  const out = [];
  const seen = new Set();
  let inTarget = false;
  let headerFound = false;
  let insertAt = -1;
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith('[') && t.endsWith(']')) {
      if (inTarget && insertAt === -1) insertAt = out.length;
      inTarget = t.toLowerCase().includes('shootergameusersettings');
      if (inTarget) headerFound = true;
      out.push(line);
      continue;
    }
    const eq = t.indexOf('=');
    const key = eq > 0 ? t.slice(0, eq).trim().toLowerCase() : '';
    if (wanted.has(key)) {
      if (!inTarget) continue; // clé posée dans la mauvaise section : retirée
      seen.add(key);
      out.push(wanted.get(key).join('='));
      continue;
    }
    out.push(line);
  }
  if (inTarget && insertAt === -1) insertAt = out.length;
  const added = [...wanted].filter(([k]) => !seen.has(k)).map(([, kv]) => kv.join('='));
  if (headerFound && insertAt >= 0) out.splice(insertAt, 0, ...added);
  else out.push(...added);

  fs.writeFileSync(file, out.join(eol) + eol);
  fs.chmodSync(file, 0o444);
  return true;
}

// ---------------------------------------------------------------- Écrans (Gestionnaire de périphériques)
function monitorsDisabledByUs() {
  return (readJson(MONITORS_STATE)?.ids || []).some(Boolean);
}

const bundledMonitorsScript = () => fs.readFileSync(path.join(__dirname, 'stretch-monitors.ps1'), 'utf8');
const normalize = (text) => text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');

// 'ready' : tâches en place et script à jour ; 'outdated' : tâches utilisables, script d'une ancienne
// version (à réautoriser pour le choix des écrans) ; null : rien d'installé.
async function monitorsInstalled() {
  let installed;
  try { installed = fs.readFileSync(path.join(SHARED_DIR, 'monitors.ps1'), 'utf8'); } catch { return null; }
  const [off, on] = await Promise.all([run('schtasks.exe', ['/query', '/tn', TASK('off')]), run('schtasks.exe', ['/query', '/tn', TASK('on')])]);
  if (off.code !== 0 || on.code !== 0) return null;
  return normalize(installed) === normalize(bundledMonitorsScript()) ? 'ready' : 'outdated';
}

// Une seule fenêtre UAC : copie le script dans un dossier que seul un administrateur peut modifier,
// puis crée les deux tâches planifiées « avec les privilèges les plus élevés ». Les déclencher ensuite
// (schtasks /run) ne demande plus d'autorisation.
async function installMonitors() {
  const script = bundledMonitorsScript();
  const elevated = `
$ErrorActionPreference = 'Stop'
$dir = Join-Path $env:ProgramData 'Precise Gunplay'
New-Item -ItemType Directory -Force -Path $dir | Out-Null
& icacls.exe $dir /inheritance:r /grant:r '*S-1-5-32-544:(OI)(CI)F' '*S-1-5-18:(OI)(CI)F' '*S-1-5-32-545:(OI)(CI)RX' | Out-Null
$file = Join-Path $dir 'monitors.ps1'
[IO.File]::WriteAllText($file, [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${Buffer.from(script, 'utf8').toString('base64')}')), [Text.UTF8Encoding]::new($true))
$me = [Security.Principal.WindowsIdentity]::GetCurrent()
# Écran à préparer (celui du jeu) : seul fichier que le compte peut modifier.
$target = Join-Path $dir 'monitors-target.json'
if (-not (Test-Path $target)) { [IO.File]::WriteAllText($target, '{"ids":[]}') }
& icacls.exe $target /grant:r "*$($me.User.Value):(W)" | Out-Null
$principal = New-ScheduledTaskPrincipal -UserId $me.Name -LogonType S4U -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 2) -MultipleInstances Queue
$svc = New-Object -ComObject Schedule.Service
$svc.Connect()
foreach ($mode in 'off', 'on') {
  $action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -NonInteractive -ExecutionPolicy Bypass -WindowStyle Hidden -File \`"$file\`" -Mode $mode"
  Register-ScheduledTask -TaskPath '\\Precise Gunplay\\' -TaskName "Ecrans $mode" -Action $action -Principal $principal -Settings $settings -Force | Out-Null
  # Le compte (sans élévation) peut lire et lancer la tâche, sans pouvoir la modifier.
  $task = $svc.GetFolder('\\Precise Gunplay').GetTask("Ecrans $mode")
  try {
    $sd = $task.GetSecurityDescriptor(4)
    $ace = "(A;;FRFX;;;$($me.User.Value))"
    if ($sd -notlike "*$ace*") { $task.SetSecurityDescriptor($sd + $ace, 0) }
  } catch {}
}
`;
  const encoded = Buffer.from(elevated, 'utf16le').toString('base64');
  const res = await run('powershell.exe', [
    '-NoProfile', '-NonInteractive', '-Command',
    `try { $p = Start-Process powershell.exe -Verb RunAs -Wait -PassThru -WindowStyle Hidden -ArgumentList '-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-EncodedCommand','${encoded}'; exit $p.ExitCode } catch { exit 1223 }`,
  ]);
  if (res.code === 1223) throw new Error('Autorisation refusée.');
  if (res.code !== 0 || (await monitorsInstalled()) !== 'ready') throw new Error(`Installation impossible (code ${res.code}).`);
}

async function runMonitorsTask(mode) {
  // Seul un résultat écrit après celui déjà présent compte : le précédent peut dater d'une seconde.
  const previous = readJson(MONITORS_RESULT)?.at || 0;
  const res = await run('schtasks.exe', ['/run', '/tn', TASK(mode)]);
  if (res.code !== 0) throw new Error(`Tâche « Ecrans ${mode} » introuvable : réautorisez la désactivation des écrans.`);
  for (let waited = 0; waited < 60000; waited += 250) {
    await sleep(250);
    const r = readJson(MONITORS_RESULT);
    if (r && r.mode === mode && r.at > previous) {
      if (r.error) throw new Error(r.error);
      return r;
    }
  }
  throw new Error('Les écrans ne répondent pas (délai dépassé).');
}

// ---------------------------------------------------------------- Gestionnaire
class Stretch extends EventEmitter {
  constructor(client, settings, dataDir) {
    super();
    this.client = client;
    this.settings = settings;
    // PowerShell ne lit pas les fichiers de l'archive asar : le script est copié dans les données de l'app.
    const helperFile = path.join(dataDir, 'stretch-display.ps1');
    try {
      fs.mkdirSync(dataDir, { recursive: true });
      fs.writeFileSync(helperFile, '\uFEFF' + fs.readFileSync(path.join(__dirname, 'stretch-display.ps1'), 'utf8'));
    } catch { /* l'appel échouera avec un message clair */ }
    this.display = new DisplayHelper(helperFile);
    this.chain = Promise.resolve();
    this.timer = null;
    this.monitorsReady = false;
    this.monitorsOutdated = false;
    this.hotkeysOn = []; // raccourcis enregistrés
    this.hotkeysFailed = [];
    this.hotkeysPaused = false; // saisie d'un nouveau raccourci en cours
    this.screensOff = 0; // écrans désactivés par la dernière tâche « off »
    this.resetGame();
    this.res = null; // 'native' | 'stretched' | null (inconnu)
    this.phase = 'off';
  }

  get cfg() {
    return this.settings.get().stretch;
  }

  get hotkeys() {
    return this.cfg.hotkeys;
  }

  resetGame() {
    this.gameRunning = false;
    this.launcherSeen = false;
    this.windowSeen = false;
    this.windowGone = 0;
    this.ignoreUntilExit = false;
    this.armedAt = 0;
    this.nextSession = 0;
    this.lastInMatch = null;
    this.coreAt = 0; // dernière réponse de core-game
    this.manual = false; // résolution choisie au raccourci, gardée jusqu'au prochain changement d'état
  }

  // Les actions (boucle, raccourcis, boutons) passent l'une après l'autre.
  exclusive(fn) {
    const next = this.chain.then(fn);
    this.chain = next.catch(() => {});
    return next;
  }

  status() {
    const c = this.cfg;
    return {
      enabled: c.enabled,
      phase: this.phase,
      switchAt: this.phase === 'armed' ? this.armedAt + c.delayMs : null,
      res: this.res,
      width: c.width,
      height: c.height,
      native: c.native,
      monitors: c.monitors && this.monitorsReady,
      monitorsReady: this.monitorsReady,
      monitorsOutdated: this.monitorsOutdated,
      hotkeys: this.hotkeys,
      hotkeysFailed: this.hotkeysFailed,
      screensOff: this.screensOff,
    };
  }

  setPhase(phase) {
    this.phase = phase;
    this.emit('status', this.status());
  }

  notify(message, type = 'info') {
    this.emit('event', { type, message });
  }

  // Écran principal, modes disponibles, état des réglages : pour la page de l'interface.
  async info() {
    let display = null;
    try { display = await this.display.call('display'); } catch (e) { display = { error: e.message }; }
    let configLocked = null;
    try { configLocked = gameConfigLocked(); } catch { /* fichier illisible */ }
    await this.checkMonitors();
    this.releaseDisplay();
    return { ...this.status(), display, configLocked };
  }

  // Fonction coupée : l'assistant d'affichage n'a pas à rester en mémoire (il se relance à la demande).
  releaseDisplay() {
    this.exclusive(() => { if (!this.timer) this.display.stop(); }).catch(() => {});
  }

  async checkMonitors() {
    const state = await monitorsInstalled();
    this.monitorsReady = !!state;
    this.monitorsOutdated = state === 'outdated';
  }

  async start() {
    await this.checkMonitors();
    // Récupération après un arrêt brutal : écrans restés désactivés ou résolution étirée résiduelle.
    if (this.cfg.enabled || monitorsDisabledByUs()) await this.exclusive(() => this.recover()).catch((e) => this.notify(e.message, 'error'));
    this.configure();
    this.releaseDisplay();
  }

  configure() {
    const on = this.cfg.enabled;
    if (on && !this.timer) {
      this.resetGame();
      this.exclusive(() => this.captureNative()).catch(() => {});
      this.timer = setInterval(() => this.tick(), TICK_MS);
      if (!this.hotkeysPaused) this.registerHotkeys();
      this.setPhase('idle');
    } else if (!on && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.unregisterHotkeys();
      this.exclusive(() => this.restore()).catch((e) => this.notify(e.message, 'error'));
      this.releaseDisplay();
      this.resetGame();
      this.setPhase('off');
    } else {
      if (on && !this.hotkeysPaused && Object.values(this.hotkeys).join() !== this.hotkeysWanted) this.registerHotkeys();
      // Nouvelle résolution choisie pendant que l'écran est étiré : appliquée tout de suite.
      if (on && this.res === 'stretched' && this.stretchedTo !== `${this.cfg.width}x${this.cfg.height}`) {
        this.exclusive(() => (this.res === 'stretched' ? this.applyStretched() : null)).catch((e) => this.notify(e.message, 'error'));
      }
      this.emit('status', this.status());
    }
  }

  // Raccourcis globaux, actifs tant que la fonction est activée. Un raccourci déjà pris par une autre
  // application est signalé une fois.
  registerHotkeys() {
    this.unregisterHotkeys();
    const actions = { toggle: () => this.toggle(), native: () => this.forceNative() };
    const keys = this.hotkeys;
    for (const [name, accel] of Object.entries(keys)) {
      let ok = false;
      try { ok = globalShortcut.register(accel, () => actions[name]().catch((e) => this.notify(e.message, 'error'))); } catch { /* combinaison invalide */ }
      if (ok) this.hotkeysOn.push(accel);
      else this.hotkeysFailed.push(name);
    }
    this.hotkeysWanted = Object.values(keys).join();
    if (this.hotkeysFailed.length) this.notify('Raccourci déjà utilisé par une autre application : choisissez-en un autre.', 'error');
  }

  // Pendant la saisie d'un raccourci sur la page, les raccourcis actuels ne doivent pas agir.
  pauseHotkeys(paused) {
    this.hotkeysPaused = paused;
    if (paused) this.unregisterHotkeys();
    else if (this.timer) this.registerHotkeys();
    this.emit('status', this.status());
  }

  unregisterHotkeys() {
    for (const accel of this.hotkeysOn) {
      try { globalShortcut.unregister(accel); } catch { /* déjà libéré */ }
    }
    this.hotkeysOn = [];
    if (!this.hotkeysPaused) this.hotkeysFailed = [];
    this.hotkeysWanted = '';
  }

  async recover() {
    const p = await this.display.call(`procs ${LAUNCHER} ${GAME}`);
    if (p.run.some(Boolean)) return; // jeu déjà lancé : la boucle prend le relais
    await this.enableMonitors();
    const d = await this.display.call('display');
    const c = this.cfg;
    if (c.native && d.w === c.width && d.h === c.height) await this.applyNative();
  }

  // Résolution native = mode actuel de l'écran, tant qu'il n'est pas déjà étiré.
  async captureNative() {
    const d = await this.display.call('display');
    const c = this.cfg;
    if (d.w === c.width && d.h === c.height) return;
    if (!c.native || c.native.w !== d.w || c.native.h !== d.h || c.native.hz !== d.hz) {
      this.settings.update({ stretch: { native: { w: d.w, h: d.h, hz: d.hz } } });
      this.emit('status', this.status());
    }
  }

  tick() {
    if (this.ticking) return;
    this.ticking = true;
    this.exclusive(() => this.step())
      .catch((e) => this.notify(e.message, 'error'))
      .finally(() => { this.ticking = false; });
  }

  async step() {
    if (!this.timer) return;
    const p = await this.display.call(`procs ${LAUNCHER} ${GAME}`);
    const [launcher, game] = p.run;

    if (game) {
      if (p.window) {
        this.windowSeen = true;
        this.windowGone = 0;
      }
      if (this.gameRunning) {
        // La fenêtre se ferme avant le processus (qui reste ~15-20 s) : on restaure sans l'attendre.
        if (this.windowSeen && !p.window && ++this.windowGone >= 3) {
          try {
            await this.restoreAfterGame();
          } finally {
            this.resetGame();
            this.ignoreUntilExit = true;
          }
        }
      } else if (!this.ignoreUntilExit) {
        const prepared = this.launcherSeen; // lanceur déjà vu : résolution native déjà relevée
        this.resetGame();
        this.gameRunning = true;
        this.setPhase('game');
        if (!prepared) await this.captureNative();
        await this.disableMonitors();
      }
    } else {
      // Après la restauration, le lanceur peut survivre quelques secondes au jeu : ce n'est pas un nouveau lancement.
      if (!launcher) this.ignoreUntilExit = false;
      if (launcher) {
        if (!this.launcherSeen && !this.gameRunning && !this.ignoreUntilExit) {
          this.launcherSeen = true;
          this.setPhase('launching');
          await this.captureNative();
          await this.disableMonitors();
        }
      } else if (this.gameRunning || this.launcherSeen) {
        try {
          await this.restoreAfterGame();
        } finally {
          this.resetGame();
        }
      }
    }

    if (this.gameRunning && Date.now() >= this.nextSession) {
      this.nextSession = Date.now() + SESSION_MS;
      await this.pollSession();
    }
  }

  // GET core-game : MatchID = en partie (tous les modes), 404 = pas en partie. S'il ne répond pas
  // (limite Riot, réseau), la présence du client Riot prend le relais. Sans aucune réponse : on n'agit pas.
  async pollSession() {
    if (!this.client.connected) return;
    let inMatch = null;
    if (!this.sessionPending && !this.client.rateLimitedUntil('/core-game')) {
      // Une requête freinée par Riot (429, nouvelles tentatives) ne doit pas bloquer la boucle :
      // au-delà de 5 s on passe, la requête finit seule et aucune autre n'est lancée entre-temps.
      this.sessionPending = true;
      const req = this.client.getCoregamePlayer().finally(() => { this.sessionPending = false; });
      req.catch(() => {});
      try {
        const core = await Promise.race([req, sleep(5000).then(() => { throw new Error('Délai dépassé (core-game).'); })]);
        inMatch = !!core?.MatchID;
        this.coreAt = Date.now();
      } catch { /* secours ci-dessous */ }
    }
    if (inMatch === null) {
      inMatch = await this.presenceInMatch();
      // Juste après une réponse de core-game, la présence en retard ne le contredit pas : on garde son état.
      if (inMatch !== null && this.lastInMatch !== null && Date.now() - this.coreAt < PRESENCE_TRUST_MS) inMatch = this.lastInMatch;
    }
    if (inMatch === null) return;
    if (inMatch !== this.lastInMatch) {
      // Premier état connu : un choix fait au raccourci avant la première réponse est gardé.
      if (this.lastInMatch !== null) this.manual = false;
      this.lastInMatch = inMatch;
    }
    if (inMatch) {
      if (!this.armedAt) {
        this.armedAt = Date.now();
        this.setPhase('armed');
      } else if (!this.manual && this.res !== 'stretched' && Date.now() - this.armedAt >= this.cfg.delayMs) {
        await this.applyStretched();
      }
      return;
    }
    if (this.armedAt) this.armedAt = 0;
    if (this.res === 'stretched' && !this.manual) await this.applyNative();
    if (this.phase !== 'game') this.setPhase('game');
  }

  // Présence de notre compte dans le client Riot (API locale, sans limite) : MENUS, PREGAME ou INGAME.
  async presenceInMatch() {
    let pr = null;
    try {
      pr = await Promise.race([this.client.getPresences(), sleep(3000).then(() => null)]);
    } catch {
      return null;
    }
    const d = myPresence(pr, this.client.puuid);
    const loop = d?.sessionLoopState || d?.matchPresenceData?.sessionLoopState;
    return loop ? loop === 'INGAME' : null;
  }

  // Fréquence demandée si elle existe pour cette résolution, sinon la plus élevée disponible.
  pickMode(d, w, h, hz) {
    const want = hz || d.hz;
    const same = d.modes.filter(([mw, mh]) => mw === w && mh === h);
    if (same.some(([, , mhz]) => mhz === want)) return { w, h, hz: want };
    if (same.length) return { w, h, hz: Math.max(...same.map(([, , mhz]) => mhz)) };
    return { w, h, hz: want || 60 };
  }

  async applyMode(w, h, hz) {
    const d = await this.display.call('display');
    const m = this.pickMode(d, w, h, hz);
    if (d.w !== m.w || d.h !== m.h || d.hz !== m.hz) await this.display.call(`apply ${d.gdi} ${m.w} ${m.h} ${m.hz}`);
    return m;
  }

  async applyStretched() {
    const c = this.cfg;
    if (!c.width || !c.height) throw new Error('Choisissez une résolution étirée.');
    await this.applyMode(c.width, c.height, 0); // 0 = garder la fréquence actuelle
    this.res = 'stretched';
    this.stretchedTo = `${c.width}x${c.height}`;
    if (this.phase === 'armed') this.setPhase('stretched');
    else this.emit('status', this.status());
  }

  async applyNative() {
    const n = this.cfg.native;
    if (!n) throw new Error('Résolution native inconnue.');
    await this.applyMode(n.w, n.h, n.hz);
    this.res = 'native';
    this.emit('status', this.status());
  }

  async disableMonitors() {
    if (!this.cfg.monitors || !this.monitorsReady) return;
    // Tous les écrans, comme ValStretch : le jeu se place sur un écran encore reconnu ; s'il n'en
    // reste aucun, il prend l'écran principal du bureau. Une ancienne version ne visait que
    // l'écran principal : sa liste est vidée (fichier absent : tous les écrans, rien à écrire).
    if (readJson(MONITORS_TARGET)?.ids?.length) {
      try {
        fs.writeFileSync(MONITORS_TARGET, JSON.stringify({ ids: [] }));
      } catch {
        throw new Error('Écrans non préparés : renouvelez l\'autorisation.');
      }
    }
    const r = await runMonitorsTask('off');
    this.screensOff = r.disabled?.length || 0;
    this.emit('status', this.status());
    if (r.failed?.length) this.notify(`Écran non préparé pour la résolution étirée : ${r.failed.join(', ')}.`, 'error');
    // Garde-fou : plus aucun écran actif après la reconfiguration, on réactive tout.
    for (let i = 0; ; i++) {
      try {
        await this.display.call('display');
        break;
      } catch {
        if (i < 5) { await sleep(300); continue; }
        await this.enableMonitors();
        throw new Error('Plus aucun écran actif : écrans remis comme avant.');
      }
    }
    await sleep(400); // laisser Windows finir la reconfiguration
  }

  async enableMonitors() {
    if (!monitorsDisabledByUs()) return;
    const r = await runMonitorsTask('on');
    this.screensOff = 0;
    if (r.failed?.length) this.notify(`Écran pas remis comme avant : ${r.failed.join(', ')}. Réactivez-le dans le Gestionnaire de périphériques, rubrique Moniteurs.`, 'error');
    await sleep(300);
  }

  async restoreAfterGame() {
    this.armedAt = 0;
    try {
      await this.restore();
    } finally {
      this.setPhase('idle');
    }
  }

  // Les écrans sont réactivés même si le retour à la résolution native échoue.
  async restore() {
    try {
      if (this.res === 'stretched') await this.applyNative();
    } finally {
      await this.enableMonitors();
    }
  }

  // ---- Actions de l'interface et raccourcis ----
  // Jeu lancé : le choix fait au raccourci n'est pas annulé par la boucle au sondage suivant.
  toggle() {
    return this.exclusive(async () => {
      if (this.res === 'stretched') await this.applyNative();
      else await this.applyStretched();
      if (this.gameRunning) this.manual = true;
    });
  }

  forceNative() {
    return this.exclusive(async () => {
      await this.applyNative();
      if (this.gameRunning) this.manual = true;
      if (!this.gameRunning) await this.enableMonitors();
    });
  }

  test() {
    const done = this.exclusive(async () => {
      await this.captureNative();
      await this.applyStretched();
      await sleep(TEST_MS);
      await this.applyNative();
    });
    this.releaseDisplay();
    return done;
  }

  restoreAll() {
    const done = this.exclusive(async () => {
      await this.enableMonitors();
      if (this.cfg.native) await this.applyNative();
    });
    this.releaseDisplay();
    return done;
  }

  async installMonitors() {
    await installMonitors();
    this.monitorsReady = true;
    this.monitorsOutdated = false;
    this.emit('status', this.status());
  }

  setGameConfigLock(lock) {
    return setGameConfigLock(lock);
  }

  // À la fermeture de l'app : rien ne doit rester étiré ni désactivé.
  needsCleanup() {
    return this.res === 'stretched' || monitorsDisabledByUs();
  }

  async shutdown() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.unregisterHotkeys();
    await this.exclusive(() => this.restore()).catch(() => {});
    this.display.stop();
  }
}

module.exports = { Stretch };
