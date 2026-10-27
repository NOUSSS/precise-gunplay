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
// « True stretch » : plein écran fenêtré, sans bandes noires, puis fichiers en lecture seule pour que le
// jeu ne réécrive pas ces réglages. Le jeu lit le fichier global (Config\WindowsClient, au démarrage)
// et celui du compte (<id>-<région>\WindowsClient) : tous sont réglés, ceux des autres comptes compris.
const GAME_VALUES = {
  bShouldLetterbox: 'False',
  bLastConfirmedShouldLetterbox: 'False',
  LastConfirmedFullscreenMode: '1',
  PreferredFullscreenMode: '1',
  FullscreenMode: '1',
};
const GAME_SECTION = 'shootergameusersettings';
const isSection = (t) => t.startsWith('[') && t.endsWith(']');

// Fichiers lus par le jeu, le plus important d'abord : compte actif (LastKnownUser, sinon le dernier
// modifié), fichier global, puis les autres comptes.
function gameSettingsFiles() {
  let lastUser = null;
  try {
    const m = /^\s*LastKnownUser=(.+)$/im.exec(fs.readFileSync(path.join(VALORANT_CONFIG, 'WindowsClient', 'RiotLocalMachine.ini'), 'utf8'));
    if (m) lastUser = m[1].trim().toLowerCase();
  } catch { /* fichier absent */ }
  let accounts = [];
  try {
    accounts = fs.readdirSync(VALORANT_CONFIG)
      .filter((d) => d.toLowerCase() !== 'windowsclient')
      .map((d) => ({ dir: d.toLowerCase(), file: path.join(VALORANT_CONFIG, d, 'WindowsClient', 'GameUserSettings.ini') }))
      .filter((a) => fs.existsSync(a.file))
      .map((a) => ({ ...a, mtime: fs.statSync(a.file).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);
  } catch { /* VALORANT jamais lancé */ }
  const active = (lastUser && accounts.find((a) => a.dir.startsWith(lastUser))) || accounts[0];
  const global = path.join(VALORANT_CONFIG, 'WindowsClient', 'GameUserSettings.ini');
  return [
    ...(active ? [{ file: active.file, active: true }] : []),
    ...(fs.existsSync(global) ? [{ file: global, global: true }] : []),
    ...accounts.filter((a) => a !== active).map((a) => ({ file: a.file })),
  ];
}

// Valeurs de la section du jeu seulement : une clé posée dans une autre section est ignorée par le jeu.
function readGameSection(file) {
  const values = {};
  let inTarget = false;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (isSection(t)) { inTarget = t.toLowerCase().includes(GAME_SECTION); continue; }
    const eq = t.indexOf('=');
    if (inTarget && eq > 0) values[t.slice(0, eq).trim().toLowerCase()] = t.slice(eq + 1).trim();
  }
  return values;
}

// Réglages d'affichage d'un fichier. « mode » : 0 plein écran, 1 plein écran fenêtré, 2 fenêtré ; au
// démarrage le jeu reprend le dernier mode confirmé, un écart entre les deux compte. « letterbox » :
// format Boîte aux lettres (bandes noires au lieu de l'étirement). « ok » : toutes les valeurs voulues.
function gameFileState(entry) {
  const v = readGameSection(entry.file);
  const modes = [v.lastconfirmedfullscreenmode, v.fullscreenmode].filter((m) => m != null).map(Number);
  return {
    ...entry,
    mode: modes.find((m) => m !== 1) ?? modes[0] ?? null,
    letterbox: [v.bshouldletterbox, v.blastconfirmedshouldletterbox].some((b) => b?.toLowerCase() === 'true'),
    ok: Object.entries(GAME_VALUES).every(([k, want]) => v[k.toLowerCase()]?.toLowerCase() === want.toLowerCase()),
    locked: (fs.statSync(entry.file).mode & 0o200) === 0,
  };
}

// État de tous les fichiers. « effective » : celui qui décide de l'affichage, le premier en défaut
// parmi le compte actif et le fichier global. null : VALORANT jamais lancé.
function gameConfigState() {
  const files = [];
  for (const entry of gameSettingsFiles()) {
    try { files.push(gameFileState(entry)); } catch { /* fichier illisible */ }
  }
  if (!files.length) return null;
  const main = files.filter((f) => f.active || f.global);
  const bad = (f) => (f.mode != null && f.mode !== 1) || f.letterbox;
  return {
    effective: main.find(bad) || main[0] || files[0],
    locked: files.every((f) => f.locked && f.ok),
    someLocked: files.some((f) => f.locked),
  };
}

// Écrit les valeurs voulues et verrouille (lock) ou retire la lecture seule. Renvoie true si un
// fichier a vraiment changé : jeu lancé, il ne le relit qu'au prochain démarrage.
function setGameConfigLock(lock) {
  const files = gameSettingsFiles();
  if (!files.length) throw new Error('Configuration de VALORANT introuvable : lancez le jeu une fois.');
  let changed = false;
  for (const { file } of files) {
    fs.chmodSync(file, 0o666);
    if (!lock) continue;
    const raw = fs.readFileSync(file, 'utf8');
    const next = withGameValues(raw);
    if (next !== raw) {
      fs.writeFileSync(file, next);
      changed = true;
    }
    fs.chmodSync(file, 0o444);
  }
  return changed;
}

function withGameValues(raw) {
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
    if (isSection(t)) {
      if (inTarget && insertAt === -1) insertAt = out.length;
      inTarget = t.toLowerCase().includes(GAME_SECTION);
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
  if (headerFound) out.splice(insertAt, 0, ...added);
  else out.unshift('[/Script/ShooterGame.ShooterGameUserSettings]', ...added, ''); // section absente : créée en tête
  return out.join(eol) + eol;
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
    this.screensFailed = []; // écrans que la dernière tâche « off » n'a pas pu préparer
    this.windowIssue = null; // le jeu n'a pas suivi la résolution étirée : message gardé jusqu'au prochain succès
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

  // Écran visé : choisi sur la page (identifiant, nom GDI en secours), sinon celui du jeu ou le principal.
  displayCmd() {
    const sel = this.cfg.screen;
    return sel ? `display ${sel.id || 'none'} ${sel.gdi || '-'}` : 'display auto -';
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
    this.joinedLate = false; // jeu déjà là au premier coup d'œil de la surveillance
    this.oversized = 0; // ticks où la fenêtre du jeu dépasse l'écran étiré
    this.gameScreen = null; // nom GDI de l'écran qui affiche le jeu
    this.liveMode = null; // mode d'affichage réel de la fenêtre du jeu (0, 1, 2), null si inconnu
    this.liveModeSeen = { mode: null, n: 0 };
    this.configWrittenInGame = false; // réglages du jeu modifiés pendant qu'il tourne : à relancer
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
      screen: c.screen,
      gameScreen: this.gameScreen,
      problems: this.problems(),
    };
  }

  // Ce qui empêche la résolution étirée de bien marcher, avec quoi faire. « action » : bouton de la page.
  problems() {
    const c = this.cfg;
    if (!c.enabled) return [];
    const list = [];
    if (c.monitors && !this.monitorsReady) {
      list.push({ text: "Autorisation Windows manquante. Sans elle, VALORANT garde sa résolution et n'affiche qu'une partie de l'image.", action: 'install', label: 'Autoriser' });
    } else if (c.monitors && this.monitorsOutdated) {
      list.push({ text: "Autorisation Windows à renouveler pour cette version. L'ancienne fonctionne encore.", action: 'install', label: 'Renouveler' });
    }
    if (!c.monitors) list.push({ text: "Écrans en mode générique désactivés. VALORANT risque de garder sa résolution et de n'afficher qu'une partie de l'image.", action: 'monitors', label: 'Réactiver' });
    if (this.screensFailed.length) list.push({ text: `Écran pas passé en mode générique : ${this.screensFailed.join(', ')}. Fermez VALORANT et relancez-le.` });
    if (this.gameRunning && this.joinedLate && c.monitors) list.push({ text: "VALORANT a été lancé avant Precise Gunplay. Fermez le jeu et relancez-le, l'app restant ouverte." });
    const game = this.gameConfigProblem();
    if (game) list.push(game);
    if (c.screen && this.gameScreen && c.screen.gdi !== this.gameScreen) list.push({ text: "VALORANT s'affiche sur un autre écran que celui choisi.", action: 'screen-auto', label: "Viser l'écran du jeu" });
    if (this.windowIssue) list.push({ text: this.windowIssue });
    return list;
  }

  // Réglages de VALORANT : ceux de ses fichiers et, jeu lancé, le mode réel de sa fenêtre. Le jeu ne
  // relit ses fichiers qu'au démarrage : corrigés pendant qu'il tourne, il faut le relancer.
  gameConfigProblem() {
    let cfg = null;
    try { cfg = gameConfigState(); } catch { /* dossier illisible */ }
    const f = cfg?.effective;
    const modeName = (m) => (m === 0 ? 'plein écran' : 'fenêtré');
    const then = this.gameRunning ? ' Après correction, relancez le jeu.' : '';
    const fix = { action: 'lock', label: 'Régler VALORANT' };
    if (f?.mode != null && f.mode !== 1) return { text: `VALORANT est réglé en mode ${modeName(f.mode)} : il garde sa propre résolution et n'affiche qu'une partie de l'image. La résolution étirée demande le plein écran fenêtré.${then}`, ...fix };
    if (f?.letterbox) return { text: `Format d'image de VALORANT en Boîte aux lettres : l'image garde des bandes noires au lieu d'être étirée.${then}`, ...fix };
    if (!this.gameRunning) return null;
    if (this.liveMode != null && this.liveMode !== 1) return { text: `VALORANT tourne en mode ${modeName(this.liveMode)} alors que ses réglages demandent le plein écran fenêtré. Relancez le jeu pour qu'il les reprenne.` };
    if (this.configWrittenInGame) return { text: "Réglages de VALORANT corrigés pendant que le jeu tournait. Relancez-le pour qu'il les applique." };
    return null;
  }

  setPhase(phase) {
    this.phase = phase;
    this.emit('status', this.status());
  }

  // La boucle réessaie toutes les 2 s : une même erreur n'est signalée qu'une fois par minute.
  notify(message, type = 'info') {
    if (type === 'error') {
      if (this.lastError?.message === message && Date.now() - this.lastError.at < 60000) return;
      this.lastError = { message, at: Date.now() };
    }
    this.emit('event', { type, message });
  }

  // Écran principal, modes disponibles, état des réglages : pour la page de l'interface.
  async info() {
    let display = null;
    try { display = await this.display.call(this.displayCmd()); } catch (e) { display = { error: e.message }; }
    let screens = null;
    try { screens = (await this.display.call('screens')).list; } catch { /* liste indisponible */ }
    let configLocked = null;
    try { configLocked = gameConfigState()?.locked ?? null; } catch { /* dossier illisible */ }
    await this.checkMonitors();
    this.releaseDisplay();
    return { ...this.status(), display, screens, configLocked };
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
    // Autre écran choisi : l'ancien revient en native, la résolution native du nouveau est relevée.
    const screenKey = JSON.stringify(this.cfg.screen || null);
    if (this.screenKey !== undefined && screenKey !== this.screenKey) {
      this.exclusive(() => this.switchScreen()).catch((e) => this.notify(e.message, 'error'));
      this.releaseDisplay();
    }
    this.screenKey = screenKey;
    if (on && !this.timer) {
      this.resetGame();
      this.gameAbsentSeen = false; // jeu pas encore vu absent depuis le début de la surveillance
      this.exclusive(() => this.captureNative()).catch(() => {});
      this.timer = setInterval(() => this.tick(), TICK_MS);
      if (!this.hotkeysPaused) this.registerHotkeys();
      this.setPhase('idle');
    } else if (!on && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      if (!this.hotkeysPaused) this.registerHotkeys();
      this.exclusive(() => this.restore()).catch((e) => this.notify(e.message, 'error'));
      this.releaseDisplay();
      this.resetGame();
      this.setPhase('off');
    } else {
      if (!this.hotkeysPaused && Object.values(this.hotkeys).join() !== this.hotkeysWanted) this.registerHotkeys();
      // Nouvelle résolution choisie pendant que l'écran est étiré : appliquée tout de suite.
      if (on && this.res === 'stretched' && this.stretchedTo !== `${this.cfg.width}x${this.cfg.height}`) {
        this.exclusive(() => (this.res === 'stretched' ? this.applyStretched() : null)).catch((e) => this.notify(e.message, 'error'));
      }
      this.emit('status', this.status());
    }
  }

  async switchScreen() {
    const n = this.cfg.native;
    if (this.res === 'stretched' && n?.gdi) {
      await this.display.call(`apply ${n.gdi} ${n.w} ${n.h} ${n.hz}`);
      this.res = 'native';
    }
    await this.captureNative();
    this.emit('status', this.status());
  }

  // Raccourcis globaux. « Tout restaurer » reste actif même fonction coupée : avec un seul écran devenu
  // illisible, c'est le seul moyen de s'en sortir. La bascule ne l'est que fonction activée. Un raccourci
  // déjà pris par une autre application est signalé une fois.
  registerHotkeys() {
    this.unregisterHotkeys();
    const actions = { toggle: () => this.toggle(), native: () => this.forceNative() };
    const keys = this.hotkeys;
    for (const [name, accel] of Object.entries(keys)) {
      if (name === 'toggle' && !this.timer) continue;
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
    else this.registerHotkeys();
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
    const d = await this.display.call(this.displayCmd());
    const c = this.cfg;
    if (c.native && d.w === c.width && d.h === c.height) await this.applyNative();
  }

  // Résolution native = mode actuel de l'écran, tant qu'il n'est pas déjà étiré.
  async captureNative() {
    const d = await this.display.call(this.displayCmd());
    const c = this.cfg;
    if (d.w === c.width && d.h === c.height) return;
    if (!c.native || c.native.w !== d.w || c.native.h !== d.h || c.native.hz !== d.hz || c.native.gdi !== d.gdi) {
      this.settings.update({ stretch: { native: { w: d.w, h: d.h, hz: d.hz, gdi: d.gdi } } });
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
    if (!game) this.gameAbsentSeen = true;

    if (game) {
      if (p.window) {
        this.windowSeen = true;
        this.windowGone = 0;
        if (p.screen && p.screen !== this.gameScreen) {
          this.gameScreen = p.screen;
          this.emit('status', this.status());
        }
        if (p.mode != null) this.trackLiveMode(p.mode);
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
        // Lancé avant l'app seulement s'il était déjà là au premier relevé : le lanceur démarre le jeu
        // en une fraction de seconde, il peut ne jamais être vu seul.
        this.joinedLate = !this.gameAbsentSeen;
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
          this.maintainGameConfig(); // avant que le jeu ne lise ses réglages
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

    if (this.gameRunning && this.res === 'stretched') await this.checkGameWindow(p);
    else this.oversized = 0;

    if (this.gameRunning && Date.now() >= this.nextSession) {
      this.nextSession = Date.now() + SESSION_MS;
      await this.pollSession();
    }
  }

  // Mode retenu quand il reste le même 2 s : au démarrage, la fenêtre du jeu change de style.
  trackLiveMode(mode) {
    const seen = this.liveModeSeen;
    if (seen.mode === mode) seen.n++;
    else Object.assign(seen, { mode, n: 1 });
    if (seen.n >= 2000 / TICK_MS && this.liveMode !== mode) {
      this.liveMode = mode;
      this.emit('status', this.status());
    }
  }

  // Réglages déjà verrouillés une fois : un fichier apparu depuis (autre compte) ou réécrit est remis
  // en ordre, sans attendre de clic.
  maintainGameConfig() {
    try {
      const cfg = gameConfigState();
      if (cfg?.someLocked && !cfg.locked && setGameConfigLock(true)) this.emit('status', this.status());
    } catch { /* fichier occupé : la page le signale */ }
  }

  // Fenêtre du jeu restée plus grande que l'écran étiré : on ne voit qu'une partie de l'image (écran
  // pas en mode générique, jeu lancé avant l'app). Après 3 s sans qu'elle suive, retour en native.
  async checkGameWindow(p) {
    const c = this.cfg;
    if (!p.ww || (p.ww <= c.width + 8 && p.wh <= c.height + 8)) {
      this.oversized = 0;
      if (p.ww && this.windowIssue) {
        this.windowIssue = null;
        this.emit('status', this.status());
      }
      return;
    }
    if (++this.oversized < 3000 / TICK_MS) return;
    this.oversized = 0;
    await this.applyNative();
    this.manual = true; // pas de nouvel essai avant le prochain changement d'état
    const cause = this.liveMode != null && this.liveMode !== 1
      ? "Il n'est pas en plein écran fenêtré : réglez-le puis relancez le jeu."
      : this.joinedLate || !this.screensOff
      ? (this.cfg.monitors && this.monitorsReady ? 'Fermez-le puis relancez-le avec Precise Gunplay ouvert.' : 'Activez « Écrans en mode générique pendant le jeu » dans les réglages avancés, puis relancez le jeu.')
      : 'Relancez le jeu. Si cela se reproduit, réglez la mise à l\'échelle de la carte graphique sur plein écran.';
    this.windowIssue = `VALORANT n'a pas suivi la résolution étirée à la dernière partie. ${cause}`;
    this.notify(`VALORANT n'a pas suivi la résolution étirée : retour en native. ${cause}`, 'error');
    this.emit('status', this.status());
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
    const firstState = this.lastInMatch === null;
    if (inMatch !== this.lastInMatch) {
      // Premier état connu : un choix fait au raccourci avant la première réponse est gardé.
      if (!firstState) this.manual = false;
      this.lastInMatch = inMatch;
    }
    if (inMatch) {
      if (!this.armedAt) {
        // Jeu déjà lancé quand l'app l'a vu (app lancée ou relancée en cours de route) et déjà en
        // partie au premier état connu : le chargement est passé depuis longtemps, pas de délai.
        this.armedAt = firstState && this.joinedLate ? Date.now() - this.cfg.delayMs : Date.now();
        this.setPhase('armed');
      }
      if (!this.manual && this.res !== 'stretched' && Date.now() - this.armedAt >= this.cfg.delayMs) {
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
    const d = await this.display.call(this.displayCmd());
    const m = this.pickMode(d, w, h, hz);
    if (d.w !== m.w || d.h !== m.h || d.hz !== m.hz) await this.display.call(`apply ${d.gdi} ${m.w} ${m.h} ${m.hz}`);
    return m;
  }

  // Résolution saisie à la main : le pilote doit la connaître. Carte AMD : elle est créée au besoin ;
  // autre carte : marche à suivre dans son panneau. L'affichage n'est pas changé.
  checkMode(w, h) {
    // Étapes courtes, chacune à son tour dans la file : la boucle et les raccourcis passent entre deux.
    const step = (cmd) => this.exclusive(() => this.display.call(cmd));
    const done = (async () => {
      const d = await step(this.displayCmd());
      const n = this.cfg.native || d;
      const accepted = () => step(`test ${d.gdi} ${w} ${h} ${n.hz}`).then(() => true, () => false);
      if (await accepted()) return;
      if (w > n.w || h > n.h) throw new Error(`Choisissez une résolution jusqu'à ${n.w} × ${n.h}.`);
      // La nouvelle résolution reprend le mode actuel de l'écran : il doit être le mode natif.
      if (d.w !== n.w || d.h !== n.h || d.hz !== n.hz) throw new Error(`Repassez l'écran en ${n.w} × ${n.h} à ${n.hz} Hz (Tout restaurer), puis validez de nouveau.`);
      const amd = await step(`amdmode ${d.gdi} ${w} ${h}`).catch((e) => ({ failed: e.message }));
      if (amd.ok) {
        for (let i = 0; i < 10; i++) {
          if (await accepted()) return;
          await sleep(500); // le pilote met à jour sa liste de modes
        }
      }
      if (amd.failed) throw new Error(amd.failed);
      throw new Error(/nvidia/i.test(d.gpu)
        ? `${w} × ${h} n'existe pas pour cet écran. Créez-la dans le Panneau de configuration NVIDIA : Modifier la résolution, Personnaliser, Créer une résolution personnalisée. Validez-la ensuite ici.`
        : `${w} × ${h} n'existe pas pour cet écran. Créez-la comme résolution personnalisée dans le logiciel de la carte graphique, puis validez-la ici.`);
    })();
    done.finally(() => this.releaseDisplay()).catch(() => {});
    return done;
  }

  async applyStretched() {
    const c = this.cfg;
    if (!c.width || !c.height) throw new Error('Choisissez une résolution étirée.');
    await this.ensureGpuScaling();
    await this.applyMode(c.width, c.height, 0); // 0 = garder la fréquence actuelle
    this.res = 'stretched';
    this.stretchedTo = `${c.width}x${c.height}`;
    if (this.phase === 'armed') this.setPhase('stretched');
    else this.emit('status', this.status());
  }

  // Carte AMD : mise à l'échelle GPU en plein écran, sinon l'écran reçoit le signal étiré et beaucoup
  // l'affichent mal (image figée, artefacts). Un échec n'empêche pas l'étirement.
  async ensureGpuScaling() {
    const d = await this.display.call(this.displayCmd());
    if (!/amd|radeon/i.test(d.gpu)) return;
    const r = await this.display.call(`amdscale ${d.gdi}`).catch((e) => ({ failed: e.message }));
    if (r.failed) this.notify(`Mise à l'échelle GPU non activée : ${r.failed}`, 'error');
    if (r.changed) await sleep(1500); // le pilote réinitialise l'affichage
  }

  // Écrans en mode générique : le pilote refuse de remonter à la résolution native (code -2 ou -5).
  // Réactivés, ils reprennent d'eux-mêmes leur mode enregistré, le natif ; jeu lancé, ils repassent
  // ensuite en mode générique pour la prochaine partie. Mode natif absent de la liste alors que l'app
  // n'a rien désactivé (arrêt brutal, reconfiguration en cours) : on attend qu'il revienne.
  async applyNative(regeneric = this.gameRunning) {
    const n = this.cfg.native;
    if (!n) throw new Error('Résolution native inconnue.');
    try {
      await this.applyMode(n.w, n.h, n.hz);
    } catch (e) {
      const ours = monitorsDisabledByUs();
      if (ours) await this.enableMonitors();
      else if (await this.listsMode(n) === 'exact') throw e; // mode connu mais refusé : réessayer n'y changerait rien
      if (!(await this.waitForMode(n))) throw new Error(`L'écran ne propose plus ${n.w} × ${n.h} : il est sans doute resté en mode générique. Réactivez-le dans le Gestionnaire de périphériques, rubrique Moniteurs.`);
      await this.applyMode(n.w, n.h, n.hz);
      if (regeneric) await this.disableMonitors();
    }
    this.res = 'native';
    this.emit('status', this.status());
  }

  // 'exact' : le mode natif est dans la liste de l'écran ; 'size' : la résolution seule (autre
  // fréquence) ; null : absente, ou écran illisible pendant une reconfiguration.
  async listsMode(n) {
    const d = await this.display.call(this.displayCmd()).catch(() => null);
    const same = d?.modes?.filter(([w, h]) => w === n.w && h === n.h) || [];
    return same.some(([, , hz]) => hz === n.hz) ? 'exact' : same.length ? 'size' : null;
  }

  // Après une réactivation, Windows reconstruit la liste des modes de l'écran en quelques secondes :
  // on attend la fréquence native (5 s au plus), sinon on se contente de la résolution.
  async waitForMode(n) {
    let found = null;
    for (let i = 0; i < 20 && (found = await this.listsMode(n)) !== 'exact'; i++) await sleep(250);
    return found;
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
    this.screensFailed = r.failed || [];
    this.emit('status', this.status());
    if (r.failed?.length) this.notify(`Écran non préparé pour la résolution étirée : ${r.failed.join(', ')}.`, 'error');
    // Garde-fou : plus aucun écran actif après la reconfiguration, on réactive tout.
    for (let i = 0; ; i++) {
      try {
        await this.display.call('display auto -');
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
    this.screensFailed = [];
    if (r.failed?.length) this.notify(`Écran pas remis comme avant : ${r.failed.join(', ')}. Réactivez-le dans le Gestionnaire de périphériques, rubrique Moniteurs.`, 'error');
    await sleep(300);
  }

  async restoreAfterGame() {
    this.armedAt = 0;
    try {
      await this.restore();
    } finally {
      this.maintainGameConfig();
      this.setPhase('idle');
    }
  }

  // Les écrans sont réactivés même si le retour à la résolution native échoue.
  async restore() {
    try {
      if (this.res === 'stretched') await this.applyNative(false);
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

  // Jeu lancé : résolution native jusqu'au prochain changement d'état. Sinon : tout restaurer.
  forceNative() {
    if (!this.gameRunning) return this.restoreAll();
    return this.exclusive(async () => {
      await this.applyNative();
      this.manual = true;
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

  // « restart » : valeurs changées pendant que le jeu tourne, il ne les prendra qu'au prochain lancement.
  setGameConfigLock(lock) {
    const restart = setGameConfigLock(lock) && lock && this.gameRunning;
    if (restart) this.configWrittenInGame = true;
    this.emit('status', this.status());
    return { restart };
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
