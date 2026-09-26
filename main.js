const { app, BrowserWindow, ipcMain, shell, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { RiotClient } = require('./src/riot/client');
const { LOCKFILE } = require('./src/riot/local');
const { Assets } = require('./src/assets');
const { Settings } = require('./src/settings');
const { Services } = require('./src/services');
const { AutoLock } = require('./src/autolock');
const { CLIENT_ACTIONS_DISABLED, CLIENT_ACTIONS_MESSAGE, assertClientActionsAllowed } = require('./src/restrictions');
const { Updater } = require('./src/updater');
const { Stats } = require('./src/stats');

app.setAppUserModelId('com.nouss.precisegunplay');

let win = null;
const client = new RiotClient();
let assets, settings, services, autolock, updater, stats;
let status = { connected: false, message: 'Recherche du Riot Client…' };
let connecting = false;

function send(channel, payload) {
  if (win && !win.isDestroyed()) win.webContents.send(channel, payload);
}

// Démarrage avec Windows : l'état réel vient du registre, pas du fichier de paramètres.
// En portable, il faut pointer vers l'exécutable d'origine et non vers la copie extraite.
function loginItemOptions() {
  const opts = { path: process.env.PORTABLE_EXECUTABLE_FILE || process.execPath };
  if (!app.isPackaged) opts.args = [app.getAppPath()];
  return opts;
}

function withLoginItem(value) {
  return { ...value, openAtLogin: app.getLoginItemSettings(loginItemOptions()).openAtLogin };
}

// Emplacement du Riot Client : indiqué par le Riot Client lui-même, avec l'installation par défaut en secours.
function riotClientPath() {
  const candidates = [];
  try {
    const installs = JSON.parse(fs.readFileSync(path.join(process.env.ProgramData || 'C:/ProgramData', 'Riot Games', 'RiotClientInstalls.json'), 'utf8'));
    candidates.push(installs.rc_live, installs.rc_default, ...Object.values(installs.associated_client || {}));
  } catch { /* fichier absent : on tente l'emplacement par défaut */ }
  candidates.push('C:/Riot Games/Riot Client/RiotClientServices.exe');
  return candidates.find((p) => typeof p === 'string' && fs.existsSync(p));
}

function launchRiot() {
  const exe = riotClientPath();
  if (!exe) throw new Error('Riot Client introuvable sur ce PC. Installe VALORANT puis réessaie.');
  // Si le Riot Client tourne déjà, il se met simplement au premier plan.
  spawn(exe, [], { detached: true, stdio: 'ignore' }).unref();
  return true;
}

function setStatus(next) {
  status = next;
  send('status', status);
}

async function tryConnect() {
  if (connecting) return;
  connecting = true;
  try {
    await assets.load();
    await client.connect({ regionOverride: settings.get().regionOverride || undefined });
    const names = await services.names([client.puuid]).catch(() => new Map());
    const me = names.get(client.puuid) || {};
    setStatus({ connected: true, name: me.name, tag: me.tag, region: client.region, puuid: client.puuid });
    // Synchronise les matchs en arrière-plan une fois l'app chargée.
    setTimeout(() => stats.sync(), 8000);
  } catch (e) {
    client.tokens = null;
    setStatus({ connected: false, message: e.message, code: e.code });
  } finally {
    connecting = false;
  }
}

function watchConnection() {
  setInterval(async () => {
    if (connecting) return;
    if (!client.connected) return tryConnect();
    // Vérifie que le Riot Client répond toujours et que c'est le même compte.
    const previous = client.puuid;
    try {
      if (!fs.existsSync(LOCKFILE)) throw Object.assign(new Error('Riot Client fermé. En attente…'), { code: 'RIOT_CLIENT_CLOSED' });
      await client.refreshTokens();
      if (client.puuid !== previous) {
        client.reset();
        tryConnect();
      }
    } catch (e) {
      client.reset();
      setStatus({ connected: false, message: e.message || 'Riot Client fermé. En attente…', code: e.code });
    }
  }, 5000);
}

// Chaque handler renvoie { ok, data } ou { ok: false, error } pour un affichage propre côté interface.
function handle(channel, fn, { needsAuth = true } = {}) {
  ipcMain.handle(channel, async (_e, ...args) => {
    try {
      if (needsAuth && !client.connected) throw new Error('Compte non connecté. Lance VALORANT et connecte-toi.');
      return { ok: true, data: await fn(...args) };
    } catch (e) {
      return { ok: false, error: e.message, code: e.code };
    }
  });
}

function registerIpc() {
  handle('status', () => status, { needsAuth: false });
  handle('connect', async () => { await tryConnect(); return status; }, { needsAuth: false });
  handle('assets', async () => { await assets.load(); return assets.summary(); }, { needsAuth: false });
  handle('assets-refresh', async () => { await assets.load(true); return assets.summary(); }, { needsAuth: false });
  handle('restrictions', () => ({ clientActions: !CLIENT_ACTIONS_DISABLED, message: CLIENT_ACTIONS_MESSAGE }), { needsAuth: false });
  handle('settings-get', () => withLoginItem(settings.get()), { needsAuth: false });
  handle('settings-set', (patch) => {
    const before = settings.get().regionOverride;
    const { openAtLogin, ...rest } = patch || {};
    if (typeof openAtLogin === 'boolean') app.setLoginItemSettings({ ...loginItemOptions(), openAtLogin });
    const next = withLoginItem(settings.update(rest));
    if (patch && 'regionOverride' in patch && patch.regionOverride !== before) {
      client.reset();
      tryConnect();
    }
    return next;
  }, { needsAuth: false });
  handle('launch-riot', launchRiot, { needsAuth: false });
  handle('open-external', (url) => {
    if (/^https:\/\//.test(url)) shell.openExternal(url);
  }, { needsAuth: false });

  handle('update-state', () => updater.state, { needsAuth: false });
  handle('update-check', () => updater.check(), { needsAuth: false });
  handle('update-install', () => updater.install(), { needsAuth: false });

  handle('profile', () => services.profile());
  handle('store', () => services.store());
  handle('collection', () => services.collection());
  handle('owned-agents', () => services.ownedAgents());
  handle('live', () => services.live());
  handle('history', (queue) => services.history(queue));
  handle('party', () => services.party());
  handle('friends', () => services.friends());
  handle('chat-unread', () => services.chatUnread());
  handle('chat-messages', (cid) => services.chatMessages(cid));
  handle('chat-read', (cid, id) => { assertClientActionsAllowed(); return services.chatRead(cid, id); });
  handle('chat-send', (cid, text) => { assertClientActionsAllowed(); return services.chatSend(cid, text); });
  handle('stats-data', () => stats.data());
  handle('stats-sync', () => { stats.sync(); return stats.state; });

  handle('pregame-select', (matchId, agentId) => { assertClientActionsAllowed(); return client.selectAgent(matchId, agentId); });
  handle('pregame-lock', (matchId, agentId) => { assertClientActionsAllowed(); return client.lockAgent(matchId, agentId); });
  handle('pregame-dodge', (matchId) => { assertClientActionsAllowed(); return client.quitPregame(matchId); });

  handle('party-queue', (partyId, queueId) => { assertClientActionsAllowed(); return client.setPartyQueue(partyId, queueId); });
  handle('party-matchmaking', (partyId, start) => { assertClientActionsAllowed(); return start ? client.joinMatchmaking(partyId) : client.leaveMatchmaking(partyId); });
  handle('party-access', (partyId, open) => { assertClientActionsAllowed(); return client.setPartyAccessibility(partyId, open); });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1320,
    height: 840,
    minWidth: 1040,
    minHeight: 680,
    backgroundColor: '#0f1923',
    title: 'Precise Gunplay',
    icon: path.join(__dirname, 'renderer', 'icon.png'),
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#0c1219', symbolColor: '#ece8e1', height: 40 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.removeMenu();
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Les liens externes s'ouvrent dans le navigateur, jamais dans l'app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e) => e.preventDefault());
  win.webContents.on('did-finish-load', () => send('status', status));
}

app.whenReady().then(() => {
  const dataDir = app.getPath('userData');
  assets = new Assets(dataDir);
  settings = new Settings(dataDir);
  services = new Services(client, assets);
  stats = new Stats(client, assets, services, dataDir);
  services.stats = stats;
  stats.on('state', (s) => send('stats-sync', s));
  setInterval(() => stats.sync(), 5 * 60 * 1000);
  autolock = new AutoLock(client, settings, assets);
  updater = new Updater();
  updater.on('state', (s) => send('update', s));
  // Vérifie les mises à jour immédiatement, avant tout le reste du démarrage.
  updater.start();

  autolock.on('event', (evt) => {
    send('autolock-event', evt);
    if (settings.get().notifications && Notification.isSupported() && evt.type !== 'error') {
      new Notification({ title: 'Precise Gunplay', body: evt.message, silent: true }).show();
    }
  });

  registerIpc();
  createWindow();
  tryConnect();
  watchConnection();
  autolock.start();
});

app.on('window-all-closed', () => app.quit());
