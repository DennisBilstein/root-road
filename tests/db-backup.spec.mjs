import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import Database from 'better-sqlite3';
import { backup, restore, verifyDatabase, resolvePaths } from '../scripts/db-backup.mjs';

const script = path.resolve('scripts/db-backup.mjs');

function createDatabase(dir, users) {
  const dbFile = path.join(dir, 'rootpfad.sqlite');
  const db = new Database(dbFile);
  db.pragma('journal_mode = WAL');
  db.exec(`CREATE TABLE users(id INTEGER PRIMARY KEY,email TEXT,name TEXT);
    CREATE TABLE sessions(token TEXT PRIMARY KEY);CREATE TABLE progress(user_id INTEGER PRIMARY KEY,data TEXT);
    CREATE TABLE invites(token TEXT PRIMARY KEY);CREATE TABLE settings(key TEXT PRIMARY KEY,value TEXT);`);
  const insert = db.prepare('INSERT INTO users(email,name) VALUES(?,?)');
  for (let i = 0; i < users; i += 1) insert.run(`test${i}@example.test`, `Test ${i}`);
  return { db, dbFile };
}

test('Sicherung bei geöffneter WAL-Datenbank ist konsistent, geprüft und nur für den Besitzer lesbar', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rp-backup-'));
  const { db, dbFile } = createDatabase(dir, 3);
  try {
    const backupDir = path.join(dir, 'backups');
    // Der Schreiber bleibt offen: ungeschriebene WAL-Seiten müssen trotzdem in der Sicherung landen.
    const result = await backup({ dbFile, backupDir });
    expect(path.basename(result.target)).toMatch(/^rootpfad-\d{8}-\d{6}\.sqlite$/);
    expect(result.users).toBe(3);
    expect(verifyDatabase(result.target).users).toBe(3);
    if (process.platform !== 'win32') expect(fs.statSync(result.target).mode & 0o777).toBe(0o600);
  } finally {
    db.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('Aufbewahrung behält nur die neuesten Sicherungen und lässt fremde Dateien unberührt', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rp-backup-'));
  const { db, dbFile } = createDatabase(dir, 1);
  try {
    const backupDir = path.join(dir, 'backups');
    fs.mkdirSync(backupDir);
    fs.writeFileSync(path.join(backupDir, 'notiz.txt'), 'bleibt');
    for (let day = 1; day <= 4; day += 1) await backup({ dbFile, backupDir, keep: 2, now: new Date(Date.UTC(2026, 10, day, 3, 0, 0)) });
    const names = fs.readdirSync(backupDir).sort();
    expect(names).toEqual(['notiz.txt', 'rootpfad-20261103-030000.sqlite', 'rootpfad-20261104-030000.sqlite']);
    await expect(backup({ dbFile, backupDir, keep: 0 })).rejects.toThrow('--keep');
  } finally {
    db.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('Wiederherstellung ersetzt die Datenbank, übernimmt WAL-Reste in die Vorsichtskopie und bewahrt den vorherigen Stand', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rp-backup-'));
  const { db, dbFile } = createDatabase(dir, 2);
  try {
    const { target } = await backup({ dbFile, backupDir: path.join(dir, 'backups') });
    db.prepare('INSERT INTO users(email,name) VALUES(?,?)').run('spaeter@example.test', 'Später');
    db.close();
    const result = restore({ source: target, dbFile, now: new Date(Date.UTC(2026, 10, 14, 12, 0, 0)) });
    expect(result.users).toBe(2);
    expect(verifyDatabase(dbFile).users).toBe(2);
    expect(verifyDatabase(result.safety).users).toBe(3);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('Keine Datenbank, fehlendes --force oder beschädigte Datei werden abgelehnt, ohne etwas zu ändern', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rp-backup-'));
  const { db, dbFile } = createDatabase(dir, 1);
  try {
    const broken = path.join(dir, 'kaputt.sqlite');
    fs.writeFileSync(broken, 'das ist keine Datenbank');
    expect(() => restore({ source: broken, dbFile })).toThrow();
    const foreign = path.join(dir, 'fremd.sqlite');
    const other = new Database(foreign);
    other.exec('CREATE TABLE etwas(id INTEGER)');
    other.close();
    expect(() => restore({ source: foreign, dbFile })).toThrow('Tabellen fehlen');
    expect(verifyDatabase(dbFile).users).toBe(1);

    const env = { ...process.env, ROOTPFAD_DATA_DIR: dir };
    const withoutForce = spawnSync(process.execPath, [script, 'restore', foreign], { env, encoding: 'utf8' });
    expect(withoutForce.status).toBe(1);
    expect(withoutForce.stderr).toContain('--force');
    const cli = spawnSync(process.execPath, [script, 'backup', '--keep', '3'], { env, encoding: 'utf8' });
    expect(cli.status).toBe(0);
    expect(cli.stdout).toContain('Sicherung erstellt');
    expect(resolvePaths({ ROOTPFAD_DATA_DIR: dir }).backupDir).toBe(path.join(dir, 'backups'));
  } finally {
    db.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
