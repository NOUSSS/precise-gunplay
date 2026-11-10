const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { HistoryStore } = require('../src/history');

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'pg-test-'));

test('une liste enregistrée est relue par une nouvelle instance', () => {
  const dir = tmp();
  new HistoryStore(dir).put('p1', 'competitive', [{ id: 'm1', kills: 10 }, { id: 'm2', kills: 3 }]);
  const again = new HistoryStore(dir);
  assert.deepEqual(again.list('p1', 'competitive'), [{ id: 'm1', kills: 10 }, { id: 'm2', kills: 3 }]);
  assert.equal(again.list('p1', ''), null);
});

test('un résumé sorti de toutes les listes du compte est retiré', () => {
  const store = new HistoryStore(tmp());
  store.put('p1', '', [{ id: 'm1' }]);
  store.put('p1', '', [{ id: 'm2' }]);
  assert.equal(store.get('p1', 'm1'), null);
  assert.deepEqual(store.get('p1', 'm2'), { id: 'm2' });
});

test('un cache illisible repart de zéro sans lever', () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'history-cache.json'), '{tronqué');
  assert.equal(new HistoryStore(dir).list('p1', ''), null);
});
