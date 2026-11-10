const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Settings } = require('../src/settings');

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'pg-test-'));

test('sans fichier, les valeurs par défaut s\'appliquent', () => {
  const value = new Settings(tmp()).get();
  assert.deepEqual(value.stretch.hotkeys, { toggle: 'Control+F8', native: 'Control+F9' });
  assert.equal(value.px0, false);
});

test('une mise à jour est relue par une nouvelle instance sans effacer les valeurs par défaut', () => {
  const dir = tmp();
  new Settings(dir).update({ px0: true, stretch: { width: 1440 } });
  const value = new Settings(dir).get();
  assert.equal(value.px0, true);
  assert.equal(value.stretch.width, 1440);
  assert.deepEqual(value.stretch.hotkeys, { toggle: 'Control+F8', native: 'Control+F9' });
});

test('un fichier illisible est mis de côté et les valeurs par défaut s\'appliquent', () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'settings.json'), '{tronqué');
  assert.equal(new Settings(dir).get().px0, false);
  assert.ok(fs.existsSync(path.join(dir, 'settings.json.illisible')));
});

test('un fichier contenant null ne lève pas', () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'settings.json'), 'null');
  const value = new Settings(dir).get();
  assert.equal(value.px0, false);
  assert.equal(value.stretch.enabled, false);
});

test('après une mise à jour, aucun fichier temporaire ne reste', () => {
  const dir = tmp();
  new Settings(dir).update({ px0: true });
  assert.equal(fs.existsSync(path.join(dir, 'settings.json.tmp')), false);
});
