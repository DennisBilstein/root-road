-- Fall 5: Blättern durch große Ergebnisse. OFFSET liest und verwirft Zeilen, Keyset-Paginierung springt direkt zur Position.
CREATE TABLE events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  created_at DATETIME NOT NULL,
  payload VARCHAR(40) NOT NULL,
  KEY idx_events_created (created_at, id)
) ENGINE=InnoDB;
SET SESSION max_recursive_iterations = 100000;
INSERT INTO events (created_at, payload)
WITH RECURSIVE n AS (SELECT 1 AS i UNION ALL SELECT i + 1 FROM n WHERE i < 20000)
SELECT TIMESTAMP('2026-01-01 00:00:00') + INTERVAL i MINUTE, CONCAT('Ereignis ', i) FROM n;
SELECT COUNT(*) AS rows_total FROM events;

-- Variante 1: Seite 400 mit je 20 Zeilen per OFFSET. Der Server liest die 7 980 Zeilen davor und wirft sie weg.
FLUSH STATUS;
SELECT id FROM events ORDER BY created_at, id LIMIT 20 OFFSET 7980;
SHOW SESSION STATUS WHERE Variable_name IN ('Handler_read_first', 'Handler_read_key', 'Handler_read_next');

-- Variante 2: Keyset mit Zeilenvergleich (created_at, id) > (...). Sieht elegant aus, wird in diesem MariaDB aber nicht als Bereich genutzt:
-- Der Index wird von vorn gelesen, bis die Bedingung zutrifft (hier sogar mehr Zeilen als bei OFFSET).
FLUSH STATUS;
SELECT id FROM events WHERE (created_at, id) > ('2026-01-06 21:00:00', 7980) ORDER BY created_at, id LIMIT 20;
SHOW SESSION STATUS WHERE Variable_name IN ('Handler_read_first', 'Handler_read_key', 'Handler_read_next');

-- Variante 3: Dieselbe Bedingung ausgeschrieben. Der Index springt direkt zur Position (2 Schlüsselzugriffe) und liest nur noch die 20 Zeilen.
FLUSH STATUS;
SELECT id, payload FROM events
WHERE created_at > '2026-01-06 21:00:00' OR (created_at = '2026-01-06 21:00:00' AND id > 7980)
ORDER BY created_at, id LIMIT 20;
SHOW SESSION STATUS WHERE Variable_name IN ('Handler_read_first', 'Handler_read_key', 'Handler_read_next');
