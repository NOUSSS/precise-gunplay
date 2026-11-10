const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitizePatch } = require('../src/settings');

const ok = (patch) => assert.deepEqual(sanitizePatch(patch), patch);
const ko = (patch) => assert.throws(() => sanitizePatch(patch), { code: 'INVALID_SETTING' });

test('les patchs envoyés par l’interface passent', () => {
  ok({ px0: true });
  ok({ openAtLogin: false });
  ok({ regionOverride: '' });
  ok({ regionOverride: 'eu' });
  ok({ stretch: { enabled: true } });
  ok({ stretch: { width: 1440, height: 1080 } });
  ok({ stretch: { monitors: false } });
  ok({ stretch: { hotkeys: { toggle: 'Control+F8', native: 'Control+F9' } } });
  ok({ stretch: { screen: null } });
  ok({ stretch: { screen: { id: 'DISPLAY\\AUS2405\\7&E7F65C7&0&UID264', gdi: '\\\\.\\DISPLAY1', name: 'VG249' } } });
  ok({ stretch: { screen: { id: '', gdi: '\\\\.\\DISPLAY2', name: null } } });
});

test('ce qui n’est pas un objet de réglages est refusé', () => {
  ko(undefined);
  ko(null);
  ko('px0');
  ko([]);
});

test('une clé inconnue est refusée', () => {
  ko({ inconnu: 1 });
  ko({ stretch: { native: { w: 1, h: 1, hz: 60 } } });
  ko({ stretch: { gameConfig: true } });
  ko({ constructor: 1 });
  ko({ stretch: { constructor: 1 } });
});

test('une valeur du mauvais type ou hors liste est refusée', () => {
  ko({ px0: 'oui' });
  ko({ regionOverride: 'eu.exemple.org/' });
  ko({ regionOverride: 5 });
  ko({ stretch: 'oui' });
  ko({ stretch: { width: '1440' } });
  ko({ stretch: { width: 12 } });
  ko({ stretch: { hotkeys: { toggle: 'Control+F8' } } });
  ko({ stretch: { hotkeys: { toggle: 'Control+F8', native: 'Control+F9', autre: 'F1' } } });
  ko({ stretch: { screen: { id: 'A B', gdi: 'x', name: null } } });
  ko({ stretch: { screen: { id: 'A\nscreens', gdi: 'x', name: null } } });
  ko({ stretch: { screen: { id: 'A', gdi: 'x', name: null, autre: 1 } } });
});
