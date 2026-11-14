-- Fall 6: Schema ändern ohne Ausfall (Expand/Contract). Ziel: customers.name wird in first_name und last_name aufgeteilt.
CREATE TABLE schema_migrations (version CHAR(14) PRIMARY KEY, applied_at DATETIME NOT NULL DEFAULT '2026-11-14 12:00:00') ENGINE=InnoDB;

-- Schritt 1 (Expand): neue Spalten NULL-fähig anlegen. Das ist abwärtskompatibel: Der alte Code kennt sie nicht und stört sich nicht.
-- ALGORITHM=INPLACE, LOCK=NONE sagt: Wenn das nicht ohne Schreibsperre geht, lieber abbrechen als blockieren.
ALTER TABLE customers ADD COLUMN IF NOT EXISTS first_name VARCHAR(60) NULL, ADD COLUMN IF NOT EXISTS last_name VARCHAR(60) NULL, ALGORITHM=INPLACE, LOCK=NONE;
INSERT IGNORE INTO schema_migrations (version) VALUES ('20261114001');

-- Das Skript darf zweimal laufen: IF NOT EXISTS und INSERT IGNORE machen es idempotent.
ALTER TABLE customers ADD COLUMN IF NOT EXISTS first_name VARCHAR(60) NULL, ADD COLUMN IF NOT EXISTS last_name VARCHAR(60) NULL, ALGORITHM=INPLACE, LOCK=NONE;
INSERT IGNORE INTO schema_migrations (version) VALUES ('20261114001');
SELECT version, applied_at FROM schema_migrations;

-- Schritt 2 (Backfill): Daten in kleinen Stapeln übertragen. Große UPDATEs halten Sperren lange; Stapel halten sie kurz.
UPDATE customers SET first_name = SUBSTRING_INDEX(name, ' ', 1), last_name = SUBSTRING(name, LENGTH(SUBSTRING_INDEX(name, ' ', 1)) + 2)
WHERE first_name IS NULL ORDER BY id LIMIT 3;
SELECT COUNT(first_name) AS migrated, SUM(first_name IS NULL) AS still_open FROM customers;
UPDATE customers SET first_name = SUBSTRING_INDEX(name, ' ', 1), last_name = SUBSTRING(name, LENGTH(SUBSTRING_INDEX(name, ' ', 1)) + 2)
WHERE first_name IS NULL ORDER BY id LIMIT 3;
SELECT id, name, first_name, last_name FROM customers ORDER BY id;

-- Schritt 3 (Verify, dann Contract): Erst wenn keine Zeile offen ist, werden die Spalten NOT NULL. Danach darf der alte Code abgelöst werden.
SELECT COUNT(*) AS rows_without_name_parts FROM customers WHERE first_name IS NULL OR last_name IS NULL;
ALTER TABLE customers MODIFY first_name VARCHAR(60) NOT NULL, MODIFY last_name VARCHAR(60) NOT NULL;
-- Der alte Code kennt nur die Spalte name: Sein INSERT scheitert jetzt. Darum gilt die Reihenfolge: erst den Code umstellen und ausrollen, dann Contract.
INSERT INTO customers (name, email, city, created_on) VALUES ('Zed Neu', 'zed@example.test', 'Köln', '2026-05-01');
INSERT INTO customers (name, first_name, last_name, email, city, created_on) VALUES ('Zed Neu', 'Zed', 'Neu', 'zed@example.test', 'Köln', '2026-05-01');

-- Ein Rückbau ist nur sicher, solange die alte Spalte noch existiert. Erst ein späterer Schritt entfernt sie.
ALTER TABLE customers DROP COLUMN name;
SELECT COUNT(*) AS columns_left FROM information_schema.COLUMNS WHERE table_schema = 'lab' AND table_name = 'customers' AND column_name IN ('name', 'first_name', 'last_name');
