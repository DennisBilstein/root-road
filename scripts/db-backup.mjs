// SQLite-Sicherung und -Wiederherstellung.
//   node scripts/db-backup.mjs backup [--keep 14]     Online-Sicherung (WAL-sicher, Server darf laufen)
//   node scripts/db-backup.mjs restore <datei> --force Datenbank aus Sicherung ersetzen (Server vorher stoppen)
// Daten liegen in ROOTPFAD_DATA_DIR (Standard: .data), Sicherungen in ROOTPFAD_BACKUP_DIR (Standard: <Datenordner>/backups).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const requiredTables = ['users', 'sessions', 'progress', 'invites', 'settings'];
const backupName = /^rootpfad-\d{8}-\d{6}\.sqlite$/;

export function resolvePaths(env = process.env, root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))) {
  const dataDir = path.resolve(env.ROOTPFAD_DATA_DIR || path.join(root, '.data'));
  return { dataDir, dbFile: path.join(dataDir, 'rootpfad.sqlite'), backupDir: path.resolve(env.ROOTPFAD_BACKUP_DIR || path.join(dataDir, 'backups')) };
}

// Prüft Struktur und Integrität einer Datenbankdatei, ohne sie zu verändern.
export function verifyDatabase(file) {
  const db = new Database(file, { readonly: true, fileMustExist: true });
  try {
    const integrity = db.pragma('integrity_check', { simple: true });
    if (integrity !== 'ok') throw new Error(`Integritätsprüfung fehlgeschlagen: ${integrity}`);
    const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((row) => row.name));
    const missing = requiredTables.filter((name) => !tables.has(name));
    if (missing.length) throw new Error(`Keine Root-Road-Datenbank, Tabellen fehlen: ${missing.join(', ')}`);
    return { users: db.prepare('SELECT COUNT(*) AS n FROM users').get().n };
  } finally {
    db.close();
  }
}

function timestamp(date = new Date()) {
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return `${date.getUTCFullYear()}${p(date.getUTCMonth() + 1)}${p(date.getUTCDate())}-${p(date.getUTCHours())}${p(date.getUTCMinutes())}${p(date.getUTCSeconds())}`;
}

export async function backup({ dbFile, backupDir, keep = 14, now = new Date() }) {
  if (!fs.existsSync(dbFile)) throw new Error(`Datenbank nicht gefunden: ${dbFile}`);
  if (!Number.isInteger(keep) || keep < 1) throw new Error('--keep braucht eine ganze Zahl ab 1.');
  fs.mkdirSync(backupDir, { recursive: true, mode: 0o700 });
  const target = path.join(backupDir, `rootpfad-${timestamp(now)}.sqlite`);
  if (fs.existsSync(target)) throw new Error(`Sicherung existiert bereits: ${target}`);
  const db = new Database(dbFile, { readonly: true, fileMustExist: true });
  try {
    // better-sqlite3 nutzt die SQLite-Backup-API: konsistenter Stand auch bei laufenden Schreibzugriffen im WAL-Betrieb.
    await db.backup(target);
  } finally {
    db.close();
  }
  // Die Kopie übernimmt den WAL-Modus; als eigenständige Datei braucht sie keine -wal/-shm-Begleitdateien.
  const copy = new Database(target);
  try { copy.pragma('journal_mode = DELETE'); } finally { copy.close(); }
  fs.chmodSync(target, 0o600);
  const info = verifyDatabase(target);
  const old = fs.readdirSync(backupDir).filter((name) => backupName.test(name)).sort().slice(0, -keep);
  for (const name of old) fs.rmSync(path.join(backupDir, name));
  return { target, users: info.users, removed: old.length };
}

export function restore({ source, dbFile, now = new Date() }) {
  if (!fs.existsSync(source)) throw new Error(`Sicherung nicht gefunden: ${source}`);
  const info = verifyDatabase(source);
  fs.mkdirSync(path.dirname(dbFile), { recursive: true, mode: 0o700 });
  let safety = null;
  if (fs.existsSync(dbFile)) {
    // Vorherigen Stand aufheben, damit eine falsche Wiederherstellung rückgängig gemacht werden kann.
    // WAL-Reste gehören zum alten Stand: Sie wandern mit in die Vorsichtskopie und dürfen nicht auf die neue Datenbank wirken.
    safety = `${dbFile}.vor-wiederherstellung-${timestamp(now)}`;
    fs.renameSync(dbFile, safety);
    for (const suffix of ['-wal', '-shm']) if (fs.existsSync(dbFile + suffix)) fs.renameSync(dbFile + suffix, safety + suffix);
  }
  fs.copyFileSync(source, dbFile, fs.constants.COPYFILE_EXCL);
  fs.chmodSync(dbFile, 0o600);
  verifyDatabase(dbFile);
  return { users: info.users, safety };
}

async function main(argv) {
  const [command, ...rest] = argv;
  const paths = resolvePaths();
  if (command === 'backup') {
    const keepIndex = rest.indexOf('--keep');
    const keep = keepIndex === -1 ? 14 : Number(rest[keepIndex + 1]);
    const result = await backup({ ...paths, keep });
    console.log(`Sicherung erstellt: ${result.target} (${result.users} Konten, ${result.removed} alte Sicherungen entfernt).`);
  } else if (command === 'restore') {
    const source = rest.find((arg) => !arg.startsWith('--'));
    if (!source) throw new Error('Aufruf: node scripts/db-backup.mjs restore <datei> --force');
    if (!rest.includes('--force')) throw new Error('Die Wiederherstellung ersetzt die laufende Datenbank. Server stoppen, dann mit --force wiederholen.');
    const result = restore({ source: path.resolve(source), dbFile: paths.dbFile });
    console.log(`Wiederhergestellt (${result.users} Konten).${result.safety ? ` Vorheriger Stand: ${result.safety}` : ''}`);
  } else {
    throw new Error('Aufruf: node scripts/db-backup.mjs backup [--keep 14] | restore <datei> --force');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error) => { console.error(error.message); process.exit(1); });
}
