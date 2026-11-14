// SQL-Injection: unsichere Verkettung gegen Platzhalter und eine feste Liste für Spaltennamen.
import { DatabaseSync } from 'node:sqlite';

export function openDemo() {
  const db = new DatabaseSync(':memory:');
  db.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL)');
  const insert = db.prepare('INSERT INTO users (name, role) VALUES (?, ?)');
  insert.run('ada', 'admin');
  insert.run('grace', 'user');
  insert.run('linus', 'user');
  return db;
}

/** UNSICHER, nur zur Vorführung: Die Eingabe wird in den SQL-Text eingesetzt. */
export function findUnsafe(db, name) {
  return db.prepare(`SELECT id, name FROM users WHERE name = '${name}'`).all().map((row) => ({ id: Number(row['id']), name: String(row['name']) }));
}

/** Sicher: Befehl und Wert getrennt. */
export function findSafe(db, name) {
  return db.prepare('SELECT id, name FROM users WHERE name = ?').all(name).map((row) => ({ id: Number(row['id']), name: String(row['name']) }));
}

const SORTABLE = new Map([['name', 'name'], ['role', 'role'], ['id', 'id']]);

/** Spalten- und Richtungsnamen können keine Platzhalter sein: Sie kommen aus einer festen Liste. */
export function listSorted(db, column, direction = 'asc') {
  const safeColumn = SORTABLE.get(column);
  if (!safeColumn) throw new RangeError(`Sortierung nach "${column}" ist nicht erlaubt`);
  if (direction !== 'asc' && direction !== 'desc') throw new RangeError('Richtung muss asc oder desc sein');
  return db.prepare(`SELECT id, name FROM users ORDER BY ${safeColumn} ${direction.toUpperCase()}, id`).all().map((row) => String(row['name']));
}
