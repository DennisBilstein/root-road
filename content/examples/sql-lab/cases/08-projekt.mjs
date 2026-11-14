// Fall 8 (Abschlussprojekt): Bestellung als Transaktion mit Bestandsprüfung, Kennzahlenbericht und Sicherung samt Wiederherstellung.
export default async function run({ run, name, password }) {
  const out = [];
  // 1) Bestellung atomar: Bestand sperren, prüfen, abbuchen, Position schreiben. Bei zu wenig Bestand wird alles zurückgerollt.
  const placeOrder = (sku, qty) => `
    START TRANSACTION;
    SELECT id, price, stock INTO @pid, @price, @stock FROM products WHERE sku = '${sku}' FOR UPDATE;
    SET @ok = @stock >= ${qty};
    INSERT INTO orders (customer_id, ordered_at, status) SELECT 2, '2026-05-01 10:00:00', 'paid' FROM DUAL WHERE @ok;
    SET @oid = IF(@ok, LAST_INSERT_ID(), NULL);
    INSERT INTO order_items (order_id, line_no, product_id, qty, unit_price) SELECT @oid, 1, @pid, ${qty}, @price FROM DUAL WHERE @ok;
    UPDATE products SET stock = stock - ${qty} WHERE id = @pid AND @ok;
    SELECT IF(@ok, CONCAT('Bestellung ', @oid, ' gebucht'), 'abgelehnt: Bestand reicht nicht') AS result;
    COMMIT;`;
  out.push('Bestellung 2 Stück Monitor 27 Zoll (Bestand 5):');
  out.push(run(placeOrder('MN-0002', 2)));
  out.push('Bestellung 4 Stück Monitor 27 Zoll (Bestand jetzt 3):');
  out.push(run(placeOrder('MN-0002', 4)));
  out.push(run("SELECT sku, stock FROM products WHERE sku = 'MN-0002';"));

  // 2) Kennzahlenbericht mit Ansicht (VIEW): Umsatz je Kategorie (ohne Hierarchie-Summen).
  out.push(run(`CREATE VIEW v_revenue AS
    SELECT p.category_id, SUM(i.qty * i.unit_price) AS revenue
    FROM order_items i JOIN orders o ON o.id = i.order_id AND o.status <> 'cancelled' JOIN products p ON p.id = i.product_id GROUP BY p.category_id;
    SELECT c.name AS category, ROUND(v.revenue, 2) AS revenue FROM v_revenue v JOIN categories c ON c.id = v.category_id ORDER BY revenue DESC;`));

  // 3) Sicherung und Wiederherstellung: mariadb-dump mit konsistentem Snapshot, Einspielen in eine neue Datenbank, Prüfsumme vergleichen.
  const dump = `mariadb-dump -uroot --single-transaction --routines --databases lab`;
  const { spawnSync } = await import('node:child_process');
  const sh = (command) => spawnSync('docker', ['exec', '-e', `MYSQL_PWD=${password}`, name, 'sh', '-c', command], { encoding: 'utf8' });
  const dumped = sh(`${dump} > /tmp/lab.sql && wc -c < /tmp/lab.sql`);
  out.push(`Sicherung geschrieben: ${dumped.status === 0 && Number(dumped.stdout) > 1000 ? 'ja' : 'nein'}`);
  const checksum = (db) => run(`SELECT SUM(CRC32(CONCAT_WS('|', id, customer_id, ordered_at, status))) AS orders_crc, COUNT(*) AS orders_count FROM ${db}.orders;`, { database: null });
  const before = checksum('lab');
  sh(`sed 's/\`lab\`/\`lab_restore\`/g' /tmp/lab.sql | mariadb -uroot`);
  const after = checksum('lab_restore');
  out.push(`Prüfsumme nach Wiederherstellung gleich: ${before === after ? 'ja' : 'NEIN'}`);
  out.push(before);
  return out.join('\n');
}
