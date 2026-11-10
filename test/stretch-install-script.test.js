require('./helpers/electron-stub');
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { elevatedInstallScript } = require('../src/stretch');

const windows = process.platform === 'win32';
const monitors = fs.readFileSync(path.join(__dirname, '..', 'src', 'stretch-monitors.ps1'), 'utf8');
const elevated = elevatedInstallScript(monitors);

// Analyse seule : le script n'est jamais exécuté.
function parseErrors(text) {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'pg-test-')), 's.ps1');
  fs.writeFileSync(file, '\uFEFF' + text);
  const cmd = `$e = $null; [void][System.Management.Automation.Language.Parser]::ParseFile('${file}', [ref]$null, [ref]$e); $e | ForEach-Object { $_.Message }; exit $e.Count`;
  const res = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', cmd], { encoding: 'utf8' });
  return { count: res.status, out: res.stdout };
}

test('le script élevé est du PowerShell valide', { skip: !windows }, () => {
  const r = parseErrors(elevated);
  assert.equal(r.count, 0, r.out);
});

test('la tâche « on » se déclenche à l’ouverture de session', () => {
  assert.match(elevated, /New-ScheduledTaskTrigger -AtLogOn/);
  assert.match(elevated, /"v":3/);
});

test('le script des tâches est du PowerShell valide', { skip: !windows }, () => {
  const r = parseErrors(monitors);
  assert.equal(r.count, 0, r.out);
});

test('le script élevé ne dépend pas de variables d’environnement pour ses chemins', () => {
  assert.doesNotMatch(elevated, /\$env:ProgramData/i);
  assert.match(elevated, /GetFolderPath\('CommonApplicationData'\)/);
  assert.match(elevated, /GetFolderPath\('System'\)/);
});

test('le propriétaire du dossier partagé est contrôlé avant et après la pose des droits', () => {
  const rights = elevated.indexOf('/inheritance:r');
  const write = elevated.indexOf("Join-Path $dir 'monitors.ps1'");
  const second = elevated.indexOf('.GetOwner(', rights);
  assert.ok(elevated.indexOf('.GetOwner(') < rights, 'premier contrôle avant les droits');
  assert.ok(second > rights && second < write, 'second contrôle entre les droits et l’écriture du script');
});

test('les tâches tournent sous le compte système, avec un chemin complet', () => {
  assert.match(elevated, /-UserId 'S-1-5-18'/);
  assert.doesNotMatch(elevated, /-LogonType S4U/);
  assert.doesNotMatch(elevated, /-Execute 'powershell\.exe'/);
});

test('le script des tâches appelle pnputil par son chemin complet', () => {
  assert.doesNotMatch(monitors, /\$env:ProgramData/i);
  assert.doesNotMatch(monitors, /(^|[\s&(])pnputil\.exe/m);
});
