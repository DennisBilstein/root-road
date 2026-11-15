// Docker-Lab: führt jede Fallstudie in cases/ aus und vergleicht die Ausgabe mit der .expected-Datei daneben.
//   node run.mjs               alle Fälle prüfen
//   node run.mjs 03            nur Fälle, deren Dateiname mit 03 beginnt
//   node run.mjs --update      erwartete Ausgaben neu schreiben (danach git diff lesen!)
// Voraussetzung: laufendes Docker und lokal vorhandene Images node:24-slim (kein Download: Builds laufen ohne Netzwerkzugriff auf die Registry).
// Alle Ressourcen tragen das Label rootpfad.lab=docker-lab und den Namenspräfix rootpfad-dk-<pid>; aufgeräumt wird nur, was dieser Lauf selbst angelegt hat.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const casesDir = path.join(here, 'cases');
const update = process.argv.includes('--update');
const filter = process.argv.slice(2).find((arg) => !arg.startsWith('--')) ?? '';
const prefix = `rootpfad-dk-${process.pid}`;
const created = { containers: new Set(), networks: new Set(), volumes: new Set(), images: new Set(), dirs: new Set(), projects: new Set() };

/** Führt docker aus und gibt { status, out, err } zurück. */
export function docker(args, options = {}) {
  const result = spawnSync('docker', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...options });
  return { status: result.status, out: (result.stdout ?? '').trim(), err: (result.stderr ?? '').trim(), raw: result.stdout ?? '' };
}

const ctx = {
  prefix, here, docker,
  label: ['--label', 'rootpfad.lab=docker-lab'],
  name(suffix) { return `${prefix}-${suffix}`; },
  /** Kopiert den Ordner app/ in ein temporäres Verzeichnis, damit Fälle Dateien ändern können, ohne das Repository anzufassen. */
  copyApp() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rootpfad-dk-'));
    fs.cpSync(path.join(here, 'app'), dir, { recursive: true });
    created.dirs.add(dir);
    return dir;
  },
  /** Baut ein Image mit Klartext-Fortschritt und gibt Status, Ausgabe und die Namen der übernommenen (CACHED) Schritte zurück. */
  build(tag, dir, { file = 'Dockerfile', target, args = [], noCache = false } = {}) {
    created.images.add(tag);
    const result = docker(['build', '--progress=plain', ...(noCache ? ['--no-cache'] : []), '--label', 'rootpfad.lab=docker-lab', '-f', path.join(dir, file), ...(target ? ['--target', target] : []), ...args, '-t', tag, dir]);
    const log = `${result.err}\n${result.out}`;
    const names = new Map();
    for (const match of log.matchAll(/^#(\d+) (\[[^\]]+\] .*)$/gm)) if (!names.has(match[1])) names.set(match[1], match[2]);
    const cached = new Set([...log.matchAll(/^#(\d+) CACHED$/gm)].map((match) => names.get(match[1])).filter(Boolean));
    const step = (pattern) => { const name = [...names.values()].find((value) => pattern.test(value)); return { name, cached: name ? cached.has(name) : null }; };
    return { ok: result.status === 0, log, step };
  },
  run(args) { const name = args.includes('--name') ? args[args.indexOf('--name') + 1] : null; if (name) created.containers.add(name); return docker(['run', ...ctx.label, ...args]); },
  track: { container: (name) => created.containers.add(name), network: (name) => created.networks.add(name), volume: (name) => created.volumes.add(name), image: (name) => created.images.add(name), project: (name) => created.projects.add(name) },
  async waitHealthy(name, seconds = 40) {
    for (let index = 0; index < seconds; index += 1) {
      const status = docker(['inspect', '--format', '{{.State.Health.Status}}', name]).out;
      if (status === 'healthy') return true;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    return false;
  },
  /** Führt node -e im Container aus (Standardausgabe zurück). */
  exec(name, script) { return docker(['exec', name, 'node', '-e', script]); },
  pause: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};

function cleanup() {
  for (const project of created.projects) docker(['compose', '-p', project, '-f', path.join(here, 'compose.yaml'), 'down', '-v', '--rmi', 'local', '--remove-orphans'], { env: { ...process.env, LAB_DIR: here } });
  for (const name of created.containers) docker(['rm', '-f', '-v', name]);
  for (const name of created.networks) docker(['network', 'rm', name]);
  for (const name of created.volumes) docker(['volume', 'rm', '-f', name]);
  for (const name of created.images) docker(['rmi', '-f', name]);
  for (const dir of created.dirs) fs.rmSync(dir, { recursive: true, force: true });
}

const cases = fs.readdirSync(casesDir).filter((file) => /^\d\d-.*\.mjs$/.test(file) && file.startsWith(filter)).sort();
if (!cases.length) { console.error(`Keine Fälle gefunden für "${filter}".`); process.exit(2); }

let failed = 0;
try {
  const info = docker(['version', '--format', '{{.Server.Version}}']);
  if (info.status !== 0) throw new Error(`Docker läuft nicht: ${info.err}`);
  console.log(`Docker ${info.out}, ${cases.length} Fälle`);
  if (update && !filter) fs.writeFileSync(path.join(casesDir, '_version.txt'), `${info.out}\n`);
  for (const file of cases) {
    const base = file.replace(/\.mjs$/, '');
    let actual = await (await import(pathToFileURL(path.join(casesDir, file)).href)).default(ctx);
    actual = actual.replace(/\r/g, '').trimEnd() + '\n';
    const expectedFile = path.join(casesDir, `${base}.expected`);
    if (update) { fs.writeFileSync(expectedFile, actual); console.log(`aktualisiert  ${base}`); continue; }
    const expected = fs.existsSync(expectedFile) ? fs.readFileSync(expectedFile, 'utf8') : null;
    if (expected === actual) console.log(`ok            ${base}`);
    else { failed += 1; console.log(`FEHLER        ${base}\n--- erwartet\n${expected}\n--- tatsächlich\n${actual}`); }
  }
} catch (error) {
  console.error(error.stack ?? error.message);
  failed += 1;
} finally {
  cleanup();
}
process.exit(failed ? 1 : 0);
