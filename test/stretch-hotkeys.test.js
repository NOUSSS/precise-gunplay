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
