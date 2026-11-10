const fs = require('fs');
const os = require('os');
const path = require('path');

// Dossier partagé vide, fixé avant de charger src/stretch.js : l'état réel des écrans du poste
// (fichiers de %ProgramData%\Precise Gunplay) ne doit pas influencer le test.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pg-test-'));
process.env.ProgramData = dir;

const electron = require('./helpers/electron-stub');
const test = require('node:test');
const assert = require('node:assert/strict');
const { Stretch } = require('../src/stretch');

function setup() {
  const taken = [];
  electron.globalShortcut.register = (accel) => { taken.push(accel); return true; };
  electron.globalShortcut.unregister = (accel) => { taken.splice(taken.indexOf(accel), 1); };
  const cfg = { enabled: false, hotkeys: { toggle: 'Control+F8', native: 'Control+F9' }, screen: null, native: null };
  const settings = { get: () => ({ stretch: cfg }), update: () => {} };
  const stretch = new Stretch({}, settings, dir);
  stretch.on('event', () => {});
  return { stretch, taken };
}

test('fonction coupée, rien à restaurer : aucun raccourci pris', () => {
  const { stretch, taken } = setup();
  stretch.registerHotkeys();
  assert.deepEqual(taken, []);
});

test('écran étiré fonction coupée : « Tout restaurer » est pris, puis rendu', () => {
  const { stretch, taken } = setup();
  stretch.registerHotkeys();
  stretch.res = 'stretched';
  stretch.syncHotkeys();
  assert.deepEqual(taken, ['Control+F9']);
  stretch.res = 'native';
  stretch.syncHotkeys();
  assert.deepEqual(taken, []);
});

test('fonction activée : les deux raccourcis sont pris', () => {
  const { stretch, taken } = setup();
  stretch.timer = 1; // la surveillance tourne
  stretch.syncHotkeys();
  assert.deepEqual(taken, ['Control+F8', 'Control+F9']);
  stretch.timer = null;
});

test('saisie d’un raccourci en cours : rien n’est pris', () => {
  const { stretch, taken } = setup();
  stretch.hotkeysPaused = true;
  stretch.res = 'stretched';
  stretch.syncHotkeys();
  assert.deepEqual(taken, []);
});

// Écran et retour en native simulés : rien n'est demandé à Windows.
function atStartup(native, screen) {
  const { stretch } = setup();
  Object.assign(stretch.cfg, { width: 1440, height: 1080, native });
  const calls = [];
  stretch.display = { call: async () => { calls.push('display'); return screen; } };
  stretch.applyNative = async (regeneric) => { calls.push(`native:${stretch.res}:${regeneric}`); };
  return { stretch, calls };
}

test('démarrage fonction coupée, écran resté étiré : remis en native', async () => {
  const { stretch, calls } = atStartup({ w: 1920, h: 1080, hz: 60, gdi: 'X' }, { w: 1440, h: 1080 });
  await stretch.recoverResolution();
  assert.deepEqual(calls, ['display', 'native:stretched:false']);
});

test('démarrage fonction coupée, écran en native : rien à faire', async () => {
  const { stretch, calls } = atStartup({ w: 1920, h: 1080, hz: 60, gdi: 'X' }, { w: 1920, h: 1080 });
  await stretch.recoverResolution();
  assert.deepEqual(calls, ['display']);
  assert.equal(stretch.res, null);
});

test('démarrage fonction coupée, résolution native inconnue : l’écran n’est pas interrogé', async () => {
  const { stretch, calls } = atStartup(null, { w: 1440, h: 1080 });
  await stretch.recoverResolution();
  assert.deepEqual(calls, []);
});
