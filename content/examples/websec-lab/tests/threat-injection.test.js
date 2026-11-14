import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { rank, score, level } from '../src/threat/risk.js';
import { openDemo, findUnsafe, findSafe, listSorted } from '../src/injection/sql.js';
import { greetUnsafe, greetSafe, countMatches } from '../src/injection/shell.js';

test('Risiko: Wert = Wahrscheinlichkeit × Schaden, Stufen und stabile Reihenfolge', () => {
  assert.equal(score({ likelihood: 4, impact: 5 }), 20);
  assert.equal(level(20), 'kritisch');
  assert.equal(level(12), 'hoch');
  assert.equal(level(6), 'mittel');
  assert.equal(level(5), 'niedrig');
  const ranked = rank([
    { name: 'Phishing', likelihood: 4, impact: 3 },
    { name: 'SQL-Injection', likelihood: 3, impact: 5 },
    { name: 'Defekter Drucker', likelihood: 3, impact: 1 },
    { name: 'Datenleck im Backup', likelihood: 2, impact: 5 },
  ]);
  assert.deepEqual(ranked.map((r) => `${r.name}:${r.score}:${r.level}`), [
    'SQL-Injection:15:hoch', 'Phishing:12:hoch', 'Datenleck im Backup:10:mittel', 'Defekter Drucker:3:niedrig',
  ]);
  assert.throws(() => score({ likelihood: 0, impact: 3 }), RangeError);
  assert.throws(() => score({ likelihood: 6, impact: 3 }), RangeError);
  assert.throws(() => score({ likelihood: 2.5, impact: 3 }), RangeError);
  assert.throws(() => level(0), RangeError);
});

test('SQL: Verkettung lässt sich umbiegen, Platzhalter nicht', () => {
  const db = openDemo();
  const attack = "x' OR '1'='1";
  assert.equal(findUnsafe(db, 'ada').length, 1);
  assert.equal(findUnsafe(db, attack).length, 3, 'unsicher: alle Benutzer');
  assert.equal(findSafe(db, attack).length, 0, 'sicher: der Text wird nur gesucht');
  assert.deepEqual(findSafe(db, 'ada'), [{ id: 1, name: 'ada' }]);
  assert.throws(() => findUnsafe(db, "x'"), /syntax error|unrecognized token/i, 'Syntaxfehler zeigt die Lücke');
  assert.deepEqual(findSafe(db, "x'"), []);
});

test('SQL: UNION holt fremde Spalten, Platzhalter verhindern es', () => {
  const db = openDemo();
  const union = "x' UNION SELECT id, role FROM users --";
  const stolen = findUnsafe(db, union);
  assert.ok(stolen.some((row) => row.name === 'admin'), 'unsicher: die Rolle erscheint als Name');
  assert.deepEqual(findSafe(db, union), []);
});

test('SQL: Spaltennamen kommen aus einer festen Liste', () => {
  const db = openDemo();
  assert.deepEqual(listSorted(db, 'name', 'desc'), ['linus', 'grace', 'ada']);
  assert.deepEqual(listSorted(db, 'role'), ['ada', 'grace', 'linus']);
  assert.throws(() => listSorted(db, 'name; DROP TABLE users'), RangeError);
  assert.throws(() => listSorted(db, 'name', 'asc; --'), RangeError);
});

test('Command Injection: exec führt zusätzliche Befehle aus, execFile nicht', async () => {
  const attack = 'Ada; echo INJIZIERT';
  assert.equal((await greetUnsafe('Ada')).trim(), 'Hallo Ada');
  assert.deepEqual((await greetUnsafe(attack)).trim().split('\n'), ['Hallo Ada', 'INJIZIERT'], 'unsicher: zweiter Befehl lief');
  assert.equal((await greetSafe(attack)).trim(), 'Hallo Ada; echo INJIZIERT', 'sicher: alles bleibt Text');
  assert.equal((await greetSafe('$(echo X)')).trim(), 'Hallo $(echo X)');
});

test('Argument-Injection: führendes - wird mit -- zum Wert', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'ws-'));
  try {
    const file = path.join(dir, 'daten.txt');
    writeFileSync(file, 'a -r b\n-r\nzeile\n');
    assert.equal(await countMatches('-r', file), 2);
    assert.equal(await countMatches('nichts', file), 0);
    await assert.rejects(countMatches('', file), RangeError);
    await assert.rejects(countMatches('x'.repeat(101), file), RangeError);
    await assert.rejects(countMatches('x', path.join(dir, 'fehlt.txt')), (error) => error.code === 2, 'fehlende Datei ist ein Fehler, kein "0 Treffer"');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
