// Datenbank mit dem eingebauten Modul node:sqlite. Auf Node.js 22.23 erscheint beim Import eine Warnung „experimental“;
// die aktuelle Doku führt das Modul seit v25.7.0 als Release Candidate. Vor dem Einsatz Version und Stabilität prüfen.
import { DatabaseSync } from 'node:sqlite';

const MIGRATIONS = [
  'CREATE TABLE tasks (id INTEGER PRIMARY KEY, title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 120), done INTEGER NOT NULL DEFAULT 0)',
  'CREATE INDEX tasks_done ON tasks (done)',
];

/** Öffnet die Datenbank und führt fehlende Migrationen aus; der Stand steht in PRAGMA user_version. */
export function openDatabase(file = ':memory:') {
  const db = new DatabaseSync(file);
  const current = Number(db.prepare('PRAGMA user_version').get()?.['user_version'] ?? 0);
  MIGRATIONS.slice(current).forEach((sql, offset) => {
    db.exec('BEGIN');
    try {
      db.exec(sql);
      db.exec(`PRAGMA user_version = ${current + offset + 1}`); // Zahl aus eigenem Code, keine Nutzereingabe
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  });
  return db;
}

export function createRepository(db) {
  const insert = db.prepare('INSERT INTO tasks (title) VALUES (?)');
  const byId = db.prepare('SELECT id, title, done FROM tasks WHERE id = ?');
  const search = db.prepare('SELECT id, title, done FROM tasks WHERE title LIKE ? ESCAPE \'\\\' ORDER BY id');
  const complete = db.prepare('UPDATE tasks SET done = 1 WHERE id = ?');

  const plain = (row) => (row ? { id: Number(row['id']), title: String(row['title']), done: row['done'] === 1 } : undefined);

  return {
    add(title) {
      return Number(insert.run(title).lastInsertRowid);
    },
    find(id) {
      return plain(byId.get(id));
    },
    // Platzhalter (?) trennen Daten von SQL: Die Eingabe wird nie als SQL gelesen.
    searchTitle(text) {
      const escaped = text.replace(/[\\%_]/g, (c) => `\\${c}`);
      return search.all(`%${escaped}%`).map((row) => plain(row));
    },
    complete(id) {
      return complete.run(id).changes === 1;
    },
    // Mehrere Schritte als eine Einheit: entweder alles oder nichts.
    addMany(titles) {
      db.exec('BEGIN');
      try {
        const ids = titles.map((title) => this.add(title));
        db.exec('COMMIT');
        return ids;
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
    // Absichtlich unsicher, nur für den Test: So sieht SQL-Injection aus.
    unsafeSearch(text) {
      return db.prepare(`SELECT id, title FROM tasks WHERE title = '${text}'`).all().length;
    },
  };
}
