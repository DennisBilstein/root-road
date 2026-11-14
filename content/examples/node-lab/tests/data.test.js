import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRepository, openDatabase } from '../src/data/db.js';
import { envFrom, loadConfig } from '../src/data/config.js';

test('Repository: anlegen, finden, suchen, abschließen', () => {
  const repo = createRepository(openDatabase());
  const id = repo.add('Milch kaufen');
  assert.deepEqual(repo.find(id), { id, title: 'Milch kaufen', done: false });
  assert.equal(repo.find(999), undefined);
  assert.equal(repo.complete(id), true);
  assert.equal(repo.complete(999), false);
  assert.equal(repo.find(id)?.done, true);
  repo.add('100% Ökostrom');
  assert.deepEqual(repo.searchTitle('milch').map((t) => t.id), [id]); // LIKE ignoriert Groß-/Kleinschreibung (ASCII)
  assert.equal(repo.searchTitle('100%').length, 1); // % in der Eingabe ist kein Platzhalter
  assert.equal(repo.searchTitle('%').length, 1);
});

test('Datenbank lehnt ungültige Daten ab (CHECK-Regel)', () => {
  const repo = createRepository(openDatabase());
  assert.throws(() => repo.add(''), /CHECK constraint failed/);
  assert.throws(() => repo.add('x'.repeat(121)), /CHECK constraint failed/);
  assert.equal(typeof repo.add('x'.repeat(120)), 'number');
});

test('Transaktion: alles oder nichts', () => {
  const repo = createRepository(openDatabase());
  assert.throws(() => repo.addMany(['gut', '', 'nie gespeichert']));
  assert.equal(repo.searchTitle('gut').length, 0); // der erste Eintrag wurde zurückgerollt
  assert.equal(repo.addMany(['a', 'b']).length, 2);
});

test('SQL-Injection: Platzhalter schützen, String-Bauen nicht', () => {
  const repo = createRepository(openDatabase());
  repo.add('geheim');
  repo.add('öffentlich');
  const attack = "x' OR '1'='1";
  assert.equal(repo.unsafeSearch(attack), 2); // Eingabe wurde zu SQL: liefert ALLE Zeilen
  assert.deepEqual(repo.searchTitle(attack), []); // mit Platzhalter: gesucht wird nach dem Text selbst
});

test('Migrationen laufen genau einmal (Datei überlebt das Schließen)', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'node-lab-db-'));
  try {
    const file = path.join(dir, 'tasks.sqlite');
    const first = openDatabase(file);
    createRepository(first).add('bleibt');
    assert.equal(Number(first.prepare('PRAGMA user_version').get()?.['user_version']), 2);
    first.close();
    const second = openDatabase(file); // keine zweite Migration, kein Fehler "table exists"
    assert.equal(createRepository(second).searchTitle('bleibt').length, 1);
    second.close();
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('loadConfig: Normal-, Grenz- und Fehlerfall', () => {
  assert.deepEqual(loadConfig({}), { config: { port: 8080, nodeEnv: 'development', dbPath: ':memory:', hasSecret: false } });
  assert.equal(loadConfig({ PORT: '1' }).config?.port, 1);
  assert.equal(loadConfig({ PORT: '65535' }).config?.port, 65535);
  for (const bad of ['0', '65536', 'abc', '80.5', '']) assert.equal(loadConfig({ PORT: bad }).errors?.length, 1, bad);
  const prod = loadConfig({ NODE_ENV: 'production', SESSION_SECRET: 'kurz' });
  assert.equal(prod.errors?.length, 2);
  assert.ok(!JSON.stringify(prod).includes('kurz')); // Geheimnis steht nicht in der Fehlermeldung
  assert.equal(loadConfig({ NODE_ENV: 'staging' }).errors?.[0]?.startsWith('NODE_ENV'), true);
});

test('envFrom: .env-Text einlesen, echte Variablen gewinnen', () => {
  const env = envFrom('PORT=3000\n# Kommentar\nNODE_ENV="test"\n', { PORT: '4000' });
  assert.deepEqual(env, { PORT: '4000', NODE_ENV: 'test' });
});
