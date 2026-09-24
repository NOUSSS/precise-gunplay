// Mises à jour automatiques via les Releases GitHub.
// - Version installée (NSIS) : vérification dès le lancement, téléchargement en arrière-plan,
//   puis installation silencieuse et relance automatique au clic sur « Redémarrer ».
// - Version portable : impossible de se remplacer elle-même → on signale juste la nouvelle version.
const { EventEmitter } = require('events');
const { app, shell } = require('electron');
const { autoUpdater } = require('electron-updater');

const REPO = 'NOUSSS/precise-gunplay';
const RELEASES_URL = `https://github.com/${REPO}/releases/latest`;
const CHECK_EVERY = 2 * 60 * 60 * 1000;

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
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.on('checking-for-update', () => this.set({ status: 'checking' }));
    autoUpdater.on('update-not-available', () => this.set({ status: 'none' }));
    autoUpdater.on('update-available', (info) => this.set({ status: 'downloading', latest: info.version, progress: 0 }));
    autoUpdater.on('download-progress', (p) => this.set({ status: 'downloading', progress: Math.round(p.percent) }));
    autoUpdater.on('update-downloaded', (info) => this.set({ status: 'ready', latest: info.version }));
    autoUpdater.on('error', (e) => this.set({ status: 'error', error: e?.message || String(e) }));
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
    if (this.state.status === 'ready') setImmediate(() => autoUpdater.quitAndInstall(true, true));
    else shell.openExternal(RELEASES_URL);
  }
}

module.exports = { Updater };
