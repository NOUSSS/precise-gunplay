// Résolution étirée automatique, même fonctionnement que ValStretch :
// 1. dès le lanceur VALORANT.exe (avant la fenêtre du jeu), les écrans sont désactivés dans le
//    Gestionnaire de périphériques : sans pilote d'écran, le jeu accepte la résolution du bureau ;
// 2. quand le serveur de jeu signale une partie (core-game), on attend la fin du chargement
//    (30 s par défaut) puis on passe en résolution étirée ;
// 3. retour au menu : résolution native. Fermeture du jeu : résolution native + écrans réactivés.
// Rien ne touche au processus du jeu : liste des processus et titre de fenêtre (comme le Gestionnaire
// des tâches), réglages d'affichage Windows et lecture de l'état de partie, déjà utilisée par l'app.
const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const { spawn, execFile } = require('child_process');
const { globalShortcut } = require('electron');

const LAUNCHER = 'valorant.exe';
const GAME = 'valorant-win64-shipping.exe';
const TICK_MS = 250;
const SESSION_MS = 2000; // une requête core-game toutes les 2 s au plus, uniquement jeu lancé
const TEST_MS = 3000;
const HOTKEY_TOGGLE = 'Control+F8';
const HOTKEY_NATIVE = 'Control+F9';

// Tâches planifiées (droits administrateur) qui désactivent / réactivent les écrans.
const TASK = (mode) => `\\Precise Gunplay\\Ecrans ${mode}`;
const SHARED_DIR = path.join(process.env.ProgramData || 'C:\\ProgramData', 'Precise Gunplay');
const MONITORS_STATE = path.join(SHARED_DIR, 'monitors-state.json');
const MONITORS_RESULT = path.join(SHARED_DIR, 'monitors-result.json');

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
    this.queue = [];
  }

  ensure() {
    if (this.proc) return this.ready;
    const p = spawn('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', this.file], { windowsHide: true });
    this.proc = p;
    let buf = '';
    let stderr = '';
    let started = false;
    this.ready = new Promise((resolve, reject) => {
      const timer = setTimeout(() => { reject(new Error('L\'assistant d\'affichage ne répond pas.')); this.stop(); }, 30000);
      this.onReady = () => { started = true; clearTimeout(timer); resolve(); };
      this.onFail = (e) => { clearTimeout(timer); reject(e); };
    });
    this.ready.catch(() => {});
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
        if (msg.ready) { this.onReady(); continue; }
        const q = this.queue.shift();
        if (q) { clearTimeout(q.timer); q.resolve(msg); }
      }
    });
    const fail = (e) => {
      if (this.proc === p) this.proc = null;
      if (!started) this.onFail(new Error(`Assistant d'affichage indisponible${stderr ? ` : ${stderr.trim().split('\n')[0]}` : ''}.`));
      for (const q of this.queue.splice(0)) { clearTimeout(q.timer); q.reject(e); }
    };
    p.on('error', fail);
    p.on('exit', () => fail(new Error('Assistant d\'affichage arrêté.')));
    return this.ready;
  }

  async call(cmd) {
    await this.ensure();
    const res = await new Promise((resolve, reject) => {
      const q = { resolve, reject, timer: setTimeout(() => { reject(new Error('Délai dépassé (affichage).')); this.stop(); }, 15000) };
      this.queue.push(q);
      this.proc.stdin.write(cmd + '\n');
    });
    if (res.error) throw new Error(res.error);
    return res;
  }

  stop() {
    if (this.proc) {
      this.proc.kill();
      this.proc = null;
    }
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
  if (!file) throw new Error('Configuration de VALORANT introuvable : lancez le jeu une fois.');
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
  return (readJson(MONITORS_STATE)?.ids || []).length > 0;
}

async function monitorsInstalled() {
  if (!fs.existsSync(path.join(SHARED_DIR, 'monitors.ps1'))) return false;
  const [off, on] = await Promise.all([run('schtasks.exe', ['/query', '/tn', TASK('off')]), run('schtasks.exe', ['/query', '/tn', TASK('on')])]);
  return off.code === 0 && on.code === 0;
}

// Une seule fenêtre UAC : copie le script dans un dossier que seul un administrateur peut modifier,
// puis crée les deux tâches planifiées « avec les privilèges les plus élevés ». Les déclencher ensuite
// (schtasks /run) ne demande plus d'autorisation.
async function installMonitors() {
  const script = fs.readFileSync(path.join(__dirname, 'stretch-monitors.ps1'), 'utf8');
  const elevated = `
$ErrorActionPreference = 'Stop'
$dir = Join-Path $env:ProgramData 'Precise Gunplay'
New-Item -ItemType Directory -Force -Path $dir | Out-Null
& icacls.exe $dir /inheritance:r /grant:r '*S-1-5-32-544:(OI)(CI)F' '*S-1-5-18:(OI)(CI)F' '*S-1-5-32-545:(OI)(CI)RX' | Out-Null
$file = Join-Path $dir 'monitors.ps1'
[IO.File]::WriteAllText($file, [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${Buffer.from(script, 'utf8').toString('base64')}')), [Text.UTF8Encoding]::new($true))
$me = [Security.Principal.WindowsIdentity]::GetCurrent()
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
  if (res.code !== 0 || !(await monitorsInstalled())) throw new Error(`Installation impossible (code ${res.code}).`);
}

async function runMonitorsTask(mode) {
  const start = Date.now();
  const res = await run('schtasks.exe', ['/run', '/tn', TASK(mode)]);
  if (res.code !== 0) throw new Error(`Tâche « Ecrans ${mode} » introuvable : réautorisez la désactivation des écrans.`);
  for (let waited = 0; waited < 60000; waited += 250) {
    await sleep(250);
    const r = readJson(MONITORS_RESULT);
    if (r && r.mode === mode && r.at >= start - 2000) {
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
    this.resetGame();
    this.res = null; // 'native' | 'stretched' | null (inconnu)
    this.phase = 'off';
  }

  get cfg() {
    return this.settings.get().stretch;
  }

  resetGame() {
    this.gameRunning = false;
    this.launcherSeen = false;
    this.windowSeen = false;
    this.windowGone = 0;
    this.ignoreUntilExit = false;
    this.armedAt = 0;
    this.nextSession = 0;
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
    this.monitorsReady = await monitorsInstalled();
    return { ...this.status(), display, configLocked, hotkeys: { toggle: 'Ctrl+F8', native: 'Ctrl+F9' } };
  }

  async start() {
    this.monitorsReady = await monitorsInstalled();
    // Récupération après un arrêt brutal : écrans restés désactivés ou résolution étirée résiduelle.
    if (this.cfg.enabled || monitorsDisabledByUs()) await this.exclusive(() => this.recover()).catch((e) => this.notify(e.message, 'error'));
    this.configure();
  }

  configure() {
    const on = this.cfg.enabled;
    if (on && !this.timer) {
      this.resetGame();
      this.exclusive(() => this.captureNative()).catch(() => {});
      this.timer = setInterval(() => this.tick(), TICK_MS);
      globalShortcut.register(HOTKEY_TOGGLE, () => this.toggle().catch((e) => this.notify(e.message, 'error')));
      globalShortcut.register(HOTKEY_NATIVE, () => this.forceNative().catch((e) => this.notify(e.message, 'error')));
      this.setPhase('idle');
    } else if (!on && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      globalShortcut.unregister(HOTKEY_TOGGLE);
      globalShortcut.unregister(HOTKEY_NATIVE);
      this.exclusive(() => this.restore()).catch((e) => this.notify(e.message, 'error'));
      this.resetGame();
      this.setPhase('off');
    } else {
      this.emit('status', this.status());
    }
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
          await this.restoreAfterGame();
          this.resetGame();
          this.ignoreUntilExit = true;
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
      this.ignoreUntilExit = false;
      if (launcher) {
        if (!this.launcherSeen && !this.gameRunning) {
          this.launcherSeen = true;
          this.setPhase('launching');
          await this.captureNative();
          await this.disableMonitors();
        }
      } else if (this.gameRunning || this.launcherSeen) {
        await this.restoreAfterGame();
        this.resetGame();
      }
    }

    if (this.gameRunning && Date.now() >= this.nextSession) {
      this.nextSession = Date.now() + SESSION_MS;
      await this.pollSession();
    }
  }

  // GET core-game : MatchID = en partie (tous les modes), 404 = pas en partie. Sans réponse : on n'agit pas.
  async pollSession() {
    if (!this.client.connected || this.client.rateLimitedUntil('/core-game')) return;
    let core;
    try {
      core = await this.client.getCoregamePlayer();
    } catch {
      return;
    }
    if (core?.MatchID) {
      if (!this.armedAt) {
        this.armedAt = Date.now();
        this.setPhase('armed');
      } else if (this.res !== 'stretched' && Date.now() - this.armedAt >= this.cfg.delayMs) {
        await this.applyStretched();
      }
      return;
    }
    if (this.armedAt) this.armedAt = 0;
    if (this.res === 'stretched') await this.applyNative();
    if (this.phase !== 'game') this.setPhase('game');
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
    const r = await runMonitorsTask('off');
    if (r.failed?.length) this.notify(`Écran non désactivé : ${r.failed.join(', ')}.`, 'error');
    // Garde-fou : plus aucun écran actif, on réactive tout de suite.
    try {
      await this.display.call('display');
    } catch {
      await this.enableMonitors();
      throw new Error('Plus aucun écran actif après la désactivation : écrans réactivés.');
    }
    await sleep(400); // laisser Windows finir la reconfiguration
  }

  async enableMonitors() {
    if (!monitorsDisabledByUs()) return;
    const r = await runMonitorsTask('on');
    if (r.failed?.length) this.notify(`Écran toujours désactivé : ${r.failed.join(', ')}. Réactivez-le dans le Gestionnaire de périphériques.`, 'error');
    await sleep(300);
  }

  async restoreAfterGame() {
    this.armedAt = 0;
    if (this.res === 'stretched') await this.applyNative();
    await this.enableMonitors();
    this.setPhase('idle');
  }

  async restore() {
    if (this.res === 'stretched') await this.applyNative();
    await this.enableMonitors();
  }

  // ---- Actions de l'interface et raccourcis ----
  toggle() {
    return this.exclusive(() => (this.res === 'stretched' ? this.applyNative() : this.applyStretched()));
  }

  forceNative() {
    return this.exclusive(async () => {
      await this.applyNative();
      if (!this.gameRunning) await this.enableMonitors();
    });
  }

  test() {
    return this.exclusive(async () => {
      await this.captureNative();
      await this.applyStretched();
      await sleep(TEST_MS);
      await this.applyNative();
    });
  }

  restoreAll() {
    return this.exclusive(async () => {
      await this.enableMonitors();
      if (this.cfg.native) await this.applyNative();
    });
  }

  async installMonitors() {
    await installMonitors();
    this.monitorsReady = true;
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
    globalShortcut.unregisterAll();
    await this.exclusive(() => this.restore()).catch(() => {});
    this.display.stop();
  }
}

module.exports = { Stretch };
