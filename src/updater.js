// Mises à jour automatiques via les Releases GitHub.
// - Version installée (NSIS) : vérification dès le lancement, téléchargement en arrière-plan,
//   puis installation silencieuse et relance automatique au clic sur « Redémarrer ».
//   Si l'app redémarre sans avoir changé de version, l'installation silencieuse a échoué : l'essai
//   suivant ouvre l'installeur normal, qui montre sa progression et ses erreurs au lieu de boucler.
// - Version portable : impossible de se remplacer elle-même → on signale juste la nouvelle version.
const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const { app, shell, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');

const REPO = 'NOUSSS/precise-gunplay';
const RELEASES_URL = `https://github.com/${REPO}/releases/latest`;
const CHECK_EVERY = 2 * 60 * 60 * 1000;
const LOG_MAX = 256 * 1024;

function newer(a, b) {
  const pa = String(a).replace(/^v/, '').split('.').map(Number);
  const pb = String(b).replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0);
  }
  return false;
}

class Updater extends EventEmitter {
  constructor() {
    super();
    this.portable = !!process.env.PORTABLE_EXECUTABLE_DIR;
    this.state = { current: app.getVersion(), status: app.isPackaged ? 'idle' : 'dev', portable: this.portable };

    if (!app.isPackaged || this.portable) return;
    this.logFile = path.join(app.getPath('userData'), 'updater.log');
    this.attemptFile = path.join(app.getPath('userData'), 'update-attempt.json');
    this.failedVersion = this.readAttempt();
    autoUpdater.logger = {
      info: (m) => this.log('info', m),
      warn: (m) => this.log('warn', m),
      error: (m) => this.log('error', m),
      debug: () => {},
    };
    this.log('info', `Démarrage v${this.state.current}${this.failedVersion ? `, échec précédent de la v${this.failedVersion}` : ''}`);
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.on('checking-for-update', () => this.set({ status: 'checking' }));
    autoUpdater.on('update-not-available', () => this.set({ status: 'none' }));
    autoUpdater.on('update-available', (info) => this.set({ status: 'downloading', latest: info.version, progress: 0 }));
    autoUpdater.on('download-progress', (p) => this.set({ status: 'downloading', progress: Math.round(p.percent) }));
    autoUpdater.on('update-downloaded', (info) =>
      this.set({ status: 'ready', latest: info.version, retry: info.version === this.failedVersion }));
    autoUpdater.on('error', (e) => this.set({ status: 'error', error: e?.message || String(e) }));
  }

  log(level, msg) {
    try {
      if (fs.statSync(this.logFile).size > LOG_MAX) fs.renameSync(this.logFile, `${this.logFile}.old`);
    } catch {}
    try {
      fs.appendFileSync(this.logFile, `${new Date().toISOString()} [${level}] ${msg instanceof Error ? msg.stack : msg}
`);
    } catch {}
  }

  // Version dont l'installation a été lancée sans que l'app ne redémarre dessus, sinon null.
  readAttempt() {
    try {
      const { version } = JSON.parse(fs.readFileSync(this.attemptFile, 'utf8'));
      if (newer(version, this.state.current)) return version;
      fs.unlinkSync(this.attemptFile);
    } catch {}
    return null;
  }

  set(patch) {
    this.state = { ...this.state, ...patch };
    this.emit('state', this.state);
  }

  start() {
    if (!app.isPackaged) return;
    this.check();
    setInterval(() => this.check(), CHECK_EVERY);
  }

  async check() {
    if (!app.isPackaged) return this.state;
    if (['checking', 'downloading', 'ready'].includes(this.state.status)) return this.state;
    if (!this.portable) {
      await autoUpdater.checkForUpdates().catch((e) => this.set({ status: 'error', error: e.message }));
      return this.state;
    }
    this.set({ status: 'checking' });
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } });
      if (!res.ok) throw new Error(`GitHub ${res.status}`);
      const tag = (await res.json()).tag_name;
      this.set(newer(tag, this.state.current) ? { status: 'available', latest: tag.replace(/^v/, '') } : { status: 'none' });
    } catch (e) {
      this.set({ status: 'error', error: e.message });
    }
    return this.state;
  }

  install() {
    // Installation silencieuse (pas d'assistant NSIS) puis relance automatique de l'app.
    // Après un échec, installeur visible : il affiche l'erreur réelle (droits, fichier verrouillé…).
    // Les fenêtres sont masquées tout de suite : le clic a un effet immédiat pendant que l'app se ferme.
    if (this.state.status === 'ready') {
      // Installée pour tous les utilisateurs (Program Files) : il faut les droits administrateur,
      // que seul l'installeur visible demande de façon fiable.
      const perMachine = [process.env.ProgramFiles, process.env['ProgramFiles(x86)']]
        .some((dir) => dir && process.execPath.toLowerCase().startsWith(dir.toLowerCase() + path.sep));
      const silent = !this.state.retry && !perMachine;
      this.log('info', `Installation de la v${this.state.latest} (${silent ? 'silencieuse' : 'installeur visible'})`);
      try {
        fs.writeFileSync(this.attemptFile, JSON.stringify({ version: this.state.latest }));
      } catch {}
      setImmediate(() => {
        autoUpdater.quitAndInstall(silent, true);
        for (const w of BrowserWindow.getAllWindows()) w.hide();
      });
    } else shell.openExternal(RELEASES_URL);
  }
}

module.exports = { Updater };
