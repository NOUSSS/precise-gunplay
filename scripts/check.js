// Vérification en une commande, sans node_modules : syntaxe de tous les fichiers JS du dépôt
// (suivis ou nouveaux), puis les tests de test/*.test.js.
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '*.js'], { cwd: root, encoding: 'utf8' })
  .split(/\r?\n/)
  .filter((f) => f && fs.existsSync(path.join(root, f)));

let failed = 0;
for (const file of files) {
  const res = spawnSync(process.execPath, ['--check', file], { cwd: root, encoding: 'utf8' });
  if (res.status !== 0) {
    failed++;
    console.error(res.stderr.trim());
  }
}
console.log(`Syntaxe : ${files.length - failed}/${files.length} fichiers valides`);

const testDir = path.join(root, 'test');
const tests = fs.existsSync(testDir)
  ? fs.readdirSync(testDir).filter((f) => f.endsWith('.test.js')).map((f) => path.join('test', f))
  : [];
if (tests.length) {
  const res = spawnSync(process.execPath, ['--test', ...tests], { cwd: root, stdio: 'inherit' });
  if (res.status !== 0) failed++;
}

process.exit(failed ? 1 : 0);
