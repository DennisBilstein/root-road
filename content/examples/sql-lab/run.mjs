// SQL-Lab: startet einen kurzlebigen MariaDB-Container, führt jede Fallstudie in cases/ gegen eine frische Datenbank aus
// und vergleicht die Ausgabe mit der .expected-Datei daneben.
//   node run.mjs               alle Fälle prüfen
//   node run.mjs 03            nur Fälle, deren Dateiname mit 03 beginnt
//   node run.mjs --update      erwartete Ausgaben neu schreiben (danach git diff lesen!)
// Voraussetzungen: laufendes Docker und ein lokal vorhandenes Image (kein Download: --pull=never). Standard: mariadb:11,
// anderes Image per SQL_LAB_IMAGE. Der Container hat kein veröffentlichtes Netzwerk, ein Wegwerf-Passwort und wird immer entfernt.
import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const casesDir = path.join(here, 'cases');
const image = process.env.SQL_LAB_IMAGE || 'mariadb:11';
const update = process.argv.includes('--update');
const filter = process.argv.slice(2).find((arg) => !arg.startsWith('--')) ?? '';
const name = `rootpfad-sql-lab-${process.pid}`;
const password = randomBytes(16).toString('hex');

const docker = (args, options = {}) => spawnSync('docker', args, { encoding: 'utf8', ...options });

function startContainer() {
  const started = docker(['run', '-d', '--rm', '--pull=never', '--name', name, '--tmpfs', '/var/lib/mysql:rw', '-e', `MARIADB_ROOT_PASSWORD=${password}`, image, '--character-set-server=utf8mb4', '--collation-server=utf8mb4_unicode_ci']);
  if (started.status !== 0) throw new Error(`Container startet nicht (Image ${image} lokal vorhanden? Docker läuft?): ${started.stderr.trim()}`);
}

function waitUntilReady() {
  // Der Start besteht aus einem Initialisierungs- und einem Neustart des Servers: erst die zweite Bereitmeldung zählt.
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const logs = docker(['logs', name]);
    const ready = ((logs.stdout + logs.stderr).match(/ready for connections/g) ?? []).length;
    if (ready >= 2 && run('SELECT 1;', { database: null }).includes('1')) return;
    spawnSync('sleep', ['1']);
  }
  throw new Error('MariaDB wurde nicht rechtzeitig bereit.');
}

/** Führt SQL synchron aus und gibt Standard- und Fehlerausgabe in Reihenfolge zurück. */
function run(sqlText, { database = 'lab', extraArgs = '' } = {}) {
  const result = docker(['exec', '-i', '-e', `MYSQL_PWD=${password}`, name, 'sh', '-c', `mariadb -uroot --table --force ${extraArgs} ${database ?? ''} 2>&1`], { input: sqlText });
  return result.stdout;
}

/** Startet SQL asynchron (für parallele Sitzungen). */
function runAsync(sqlText, { database = 'lab' } = {}) {
  return new Promise((resolve) => {
    const child = spawn('docker', ['exec', '-i', '-e', `MYSQL_PWD=${password}`, name, 'sh', '-c', `mariadb -uroot --table --force ${database} 2>&1`]);
    let out = '';
    child.stdout.on('data', (chunk) => { out += chunk; });
    child.on('close', () => resolve(out));
    child.stdin.end(sqlText);
  });
}

function resetDatabase(withSeed) {
  const schema = fs.readFileSync(path.join(here, 'schema.sql'), 'utf8');
  const seed = withSeed ? fs.readFileSync(path.join(here, 'seed.sql'), 'utf8') : '';
  const out = run(`DROP DATABASE IF EXISTS lab; CREATE DATABASE lab CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\nUSE lab;\n${schema}\n${seed}`, { database: null });
  if (/ERROR/.test(out)) throw new Error(`Schema konnte nicht angelegt werden:\n${out}`);
}

const cases = fs.readdirSync(casesDir).filter((file) => /^\d\d-.*\.(sql|mjs)$/.test(file) && file.startsWith(filter)).sort();
if (!cases.length) { console.error(`Keine Fälle gefunden für "${filter}".`); process.exit(2); }

let failed = 0;
try {
  startContainer();
  waitUntilReady();
  const version = run('SELECT VERSION();', { database: null }).split('\n').find((line) => /^\| \d/.test(line))?.replace(/[|\s]/g, '') ?? '?';
  console.log(`${image} (Server ${version}), ${cases.length} Fälle`);
  if (update && !filter) fs.writeFileSync(path.join(casesDir, '_version.txt'), `${version}\n`);

  for (const file of cases) {
    const base = file.replace(/\.(sql|mjs)$/, '');
    const text = fs.readFileSync(path.join(casesDir, file), 'utf8');
    const withSeed = !/^-- @no-seed/m.test(text);
    resetDatabase(withSeed);
    let actual;
    if (file.endsWith('.sql')) actual = run(text);
    else actual = await (await import(pathToFileURL(path.join(casesDir, file)).href)).default({ run, runAsync, resetDatabase, name, password, pause: (ms) => new Promise((resolve) => setTimeout(resolve, ms)) });
    actual = actual.replace(/\r/g, '').trimEnd() + '\n';
    const expectedFile = path.join(casesDir, `${base}.expected`);
    if (update) { fs.writeFileSync(expectedFile, actual); console.log(`aktualisiert  ${base}`); continue; }
    const expected = fs.existsSync(expectedFile) ? fs.readFileSync(expectedFile, 'utf8') : null;
    if (expected === actual) console.log(`ok            ${base}`);
    else { failed += 1; console.log(`FEHLER        ${base}\n--- erwartet\n${expected}\n--- tatsächlich\n${actual}`); }
  }
} catch (error) {
  console.error(error.message);
  failed += 1;
} finally {
  docker(['rm', '-f', name]);
}
process.exit(failed ? 1 : 0);
