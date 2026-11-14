-- Fall 1: Fensterfunktionen und CTEs. Umsatz je Bestellung = Summe qty * unit_price; stornierte Bestellungen zählen nicht.

-- Schritt 1: Eine CTE (WITH) benennt ein Zwischenergebnis, damit die Abfrage von oben nach unten lesbar bleibt.
WITH order_totals AS (
  SELECT o.id AS order_id, o.customer_id, DATE_FORMAT(o.ordered_at, '%Y-%m') AS month, SUM(i.qty * i.unit_price) AS total
  FROM orders o JOIN order_items i ON i.order_id = o.id
  WHERE o.status <> 'cancelled'
  GROUP BY o.id, o.customer_id, month
)
SELECT month, SUM(total) AS revenue,
       SUM(SUM(total)) OVER (ORDER BY month) AS running_total
FROM order_totals
GROUP BY month
ORDER BY month;

-- Schritt 2: ROW_NUMBER und RANK vergeben Plätze je Gruppe (PARTITION BY). Bei Gleichstand überspringt RANK Zahlen.
WITH totals AS (
  SELECT c.city, c.name, SUM(i.qty * i.unit_price) AS spent
  FROM customers c JOIN orders o ON o.customer_id = c.id AND o.status <> 'cancelled'
  JOIN order_items i ON i.order_id = o.id
  GROUP BY c.id, c.city, c.name
)
SELECT city, name, spent,
       ROW_NUMBER() OVER (PARTITION BY city ORDER BY spent DESC) AS row_nr,
       RANK()       OVER (PARTITION BY city ORDER BY spent DESC) AS rank_nr
FROM totals
ORDER BY city, row_nr;

-- Schritt 2b: Bei Gleichstand teilen sich Zeilen den Platz. RANK springt danach (1, 1, 3), DENSE_RANK nicht (1, 1, 2), ROW_NUMBER zählt stur durch.
SELECT name, price,
       ROW_NUMBER() OVER w AS row_nr, RANK() OVER w AS rank_nr, DENSE_RANK() OVER w AS dense_nr
FROM products WHERE category_id = 5
WINDOW w AS (ORDER BY price DESC)
ORDER BY price DESC, name;

-- Schritt 3: LAG holt den Wert der Vorgängerzeile: Abstand zur vorigen Bestellung desselben Kunden in Tagen.
SELECT customer_id, id AS order_id, DATE(ordered_at) AS day,
       DATEDIFF(DATE(ordered_at), LAG(DATE(ordered_at)) OVER (PARTITION BY customer_id ORDER BY ordered_at)) AS days_since_previous
FROM orders
WHERE status <> 'cancelled'
ORDER BY customer_id, ordered_at;

-- Schritt 4: Rekursive CTE durchläuft die Kategorie-Hierarchie. Der Anker startet bei den Wurzeln, der rekursive Teil hängt Kinder an.
WITH RECURSIVE tree AS (
  SELECT id, name, 0 AS depth, CAST(name AS CHAR(200)) AS path FROM categories WHERE parent_id IS NULL
  UNION ALL
  SELECT c.id, c.name, t.depth + 1, CONCAT(t.path, ' > ', c.name)
  FROM categories c JOIN tree t ON c.parent_id = t.id
)
SELECT depth, path FROM tree ORDER BY path;
