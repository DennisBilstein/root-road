// Fall 4: Sperren, Wartezeit-Überschreitung und Deadlock mit zwei parallelen Sitzungen.
// Besonderheit: Welche Sitzung beim Deadlock abgebrochen wird, entscheidet InnoDB; die Ausgabe nennt deshalb nur, DASS genau eine abbricht.
export default async function run({ run, runAsync, pause }) {
  const out = [];
  run(`CREATE TABLE accounts (id INT PRIMARY KEY, owner VARCHAR(20) NOT NULL, balance DECIMAL(10,2) NOT NULL) ENGINE=InnoDB;
       INSERT INTO accounts VALUES (1, 'Ada', 100.00), (2, 'Ben', 100.00);`);

  // Teil A: Sitzung 1 hält eine Zeilensperre (SELECT ... FOR UPDATE), Sitzung 2 wartet und läuft in die Wartezeit-Grenze.
  const holder = runAsync(`START TRANSACTION; SELECT balance FROM accounts WHERE id = 1 FOR UPDATE; SELECT SLEEP(3); ROLLBACK;`);
  await pause(1000); // asynchron warten, damit der Ereignisloop die erste Sitzung wirklich starten kann
  const waiter = run(`SET SESSION innodb_lock_wait_timeout = 1; START TRANSACTION; UPDATE accounts SET balance = balance - 10 WHERE id = 1; COMMIT;`);
  await holder;
  out.push('Teil A: zweite Sitzung wartet auf gesperrte Zeile');
  out.push(waiter.split('\n').filter((line) => /^ERROR/.test(line)).join('\n'));
  out.push(run('SELECT id, balance FROM accounts ORDER BY id;'));

  // Teil B: Zwei Sitzungen sperren dieselben Zeilen in umgekehrter Reihenfolge: Deadlock. InnoDB erkennt ihn und bricht eine Sitzung ab.
  const first = runAsync(`START TRANSACTION; UPDATE accounts SET balance = balance - 10 WHERE id = 1; SELECT SLEEP(2); UPDATE accounts SET balance = balance + 10 WHERE id = 2; COMMIT;`);
  const second = runAsync(`SELECT SLEEP(1); START TRANSACTION; UPDATE accounts SET balance = balance - 5 WHERE id = 2; SELECT SLEEP(2); UPDATE accounts SET balance = balance + 5 WHERE id = 1; COMMIT;`);
  const results = await Promise.all([first, second]);
  const deadlocks = results.filter((text) => /ERROR 1213/.test(text)).length;
  out.push('Teil B: umgekehrte Sperrreihenfolge');
  out.push(`Sitzungen mit ERROR 1213 (Deadlock): ${deadlocks}`);
  out.push(/ERROR 1213 \(40001\)[^\n]*Deadlock found when trying to get lock; try restarting transaction/.test(results.join('\n')) ? 'Meldung: Deadlock found when trying to get lock; try restarting transaction' : 'Meldung nicht erkannt');
  // Der Überlebende hat sein Ergebnis festgeschrieben, der Abgebrochene nichts: Die Summe aller Kontostände bleibt 200.
  out.push(run("SELECT SUM(balance) AS total FROM accounts;"));
  return out.join('\n');
}
