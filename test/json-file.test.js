const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { writeJsonAtomic, readJsonOrSetAside } = require('../src/json-file');

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'pg-test-'));

test('une valeur écrite est relue à l\'identique, sans fichier temporaire restant', () => {
  const dir = tmp();
  const file = path.join(dir, 'a.json');
  const value = { a: 1, b: [1, 2, { c: 'x' }] };
  writeJsonAtomic(file, value);
  assert.deepEqual(readJsonOrSetAside(file), value);
  assert.deepEqual(fs.readdirSync(dir), ['a.json']);
});

test('avec une indentation, le fichier écrit est sur plusieurs lignes', () => {
  const dir = tmp();
  const file = path.join(dir, 'a.json');
  writeJsonAtomic(file, { a: 1 }, 2);
  assert.ok(fs.readFileSync(file, 'utf8').includes('\n'));
});

test('un fichier absent donne null et ne crée rien', () => {
  const dir = tmp();
  assert.equal(readJsonOrSetAside(path.join(dir, 'absent.json')), null);
  assert.deepEqual(fs.readdirSync(dir), []);
});

test('un fichier illisible est mis de côté et donne null', () => {
  const dir = tmp();
  const file = path.join(dir, 'a.json');
  fs.writeFileSync(file, '{tronqué');
  assert.equal(readJsonOrSetAside(file), null);
  assert.equal(fs.existsSync(file), false);
  assert.equal(fs.readFileSync(`${file}.illisible`, 'utf8'), '{tronqué');
});
