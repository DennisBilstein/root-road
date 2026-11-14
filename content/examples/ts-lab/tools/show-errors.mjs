// Zeigt die echten tsc-Fehlermeldungen hinter den @ts-expect-error-Zeilen:
// Die Direktiven werden in einer Kopie entfernt, dann läuft tsc darüber.
import { cpSync, mkdtempSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const lab = resolve(import.meta.dirname, '..');
const copy = mkdtempSync(join(tmpdir(), 'ts-lab-'));
cpSync(join(lab, 'src'), join(copy, 'src'), { recursive: true });
cpSync(join(lab, 'tsconfig.json'), join(copy, 'tsconfig.json'));
cpSync(join(lab, 'package.json'), join(copy, 'package.json')); // wegen "type": "module"
const strip = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) strip(path);
    else writeFileSync(path, readFileSync(path, 'utf8').replace(/\/\/ @ts-expect-error.*$/gm, '// (Direktive entfernt)'));
  }
};
strip(join(copy, 'src'));
const config = JSON.parse(readFileSync(join(copy, 'tsconfig.json'), 'utf8'));
config.compilerOptions.typeRoots = [join(lab, '../vue-lab/node_modules/@types')];
config.include = ['src'];
writeFileSync(join(copy, 'tsconfig.json'), JSON.stringify(config));
try {
  execFileSync(join(lab, '../vue-lab/node_modules/.bin/tsc'), ['-p', copy, '--pretty', 'false'], { encoding: 'utf8' });
  console.log('Keine Fehler gefunden (unerwartet).');
} catch (error) {
  console.log(String(error.stdout).replaceAll(copy + '/', ''));
} finally {
  rmSync(copy, { recursive: true, force: true });
}
