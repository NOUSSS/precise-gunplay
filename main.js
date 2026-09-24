const { app, BrowserWindow, ipcMain, shell, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const { RiotClient } = require('./src/riot/client');
const { LOCKFILE } = require('./src/riot/local');
const { Assets } = require('./src/assets');
const { Settings } = require('./src/settings');
const { Services } = require('./src/services');
const { AutoLock } = require('./src/autolock');
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
      if (!fs.existsSync(LOCKFILE)) throw new Error('Riot Client fermé. En attente…');
      await client.refreshTokens();
      if (client.puuid !== previous) {
        client.reset();
        tryConnect();
      }
    } catch (e) {
      client.reset();
      setStatus({ connected: false, message: e.message || 'Riot Client fermé. En attente…' });
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
  handle('settings-get', () => settings.get(), { needsAuth: false });
  handle('settings-set', (patch) => {
    const before = settings.get().regionOverride;
    const next = settings.update(patch || {});
    if (patch && 'regionOverride' in patch && patch.regionOverride !== before) {
      client.reset();
      tryConnect();
    }
    return next;
  }, { needsAuth: false });
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
  handle('chat-read', (cid, id) => services.chatRead(cid, id));
  handle('chat-send', (cid, text) => services.chatSend(cid, text));
  handle('stats-data', () => stats.data());
  handle('stats-sync', () => { stats.sync(); return stats.state; });

  handle('pregame-select', (matchId, agentId) => client.selectAgent(matchId, agentId));
  handle('pregame-lock', (matchId, agentId) => client.lockAgent(matchId, agentId));
  handle('pregame-dodge', (matchId) => client.quitPregame(matchId));

  handle('party-queue', (partyId, queueId) => client.setPartyQueue(partyId, queueId));
  handle('party-matchmaking', (partyId, start) => (start ? client.joinMatchmaking(partyId) : client.leaveMatchmaking(partyId)));
  handle('party-access', (partyId, open) => client.setPartyAccessibility(partyId, open));
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
