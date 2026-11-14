-- Fall 3: JSON-Spalten, generierte Spalten und Indizes darauf.
ALTER TABLE products ADD COLUMN attrs JSON NULL;
UPDATE products SET attrs = JSON_OBJECT('layout', 'DE', 'wireless', FALSE, 'tags', JSON_ARRAY('büro', 'basis')) WHERE sku = 'KB-0001';
UPDATE products SET attrs = '{"layout":"US","wireless":true,"tags":["gaming"]}' WHERE sku = 'KB-0002';
UPDATE products SET attrs = '{"size_inch":24,"panel":"IPS"}' WHERE sku = 'MN-0001';

-- Lesen: JSON_VALUE liefert Text, JSON_EXISTS prüft einen Pfad, JSON_QUERY liefert ein Teildokument.
SELECT sku, JSON_VALUE(attrs, '$.layout') AS layout, JSON_EXISTS(attrs, '$.wireless') AS has_wireless, JSON_QUERY(attrs, '$.tags') AS tags
FROM products WHERE attrs IS NOT NULL ORDER BY sku;

-- Ungültiges JSON wird abgelehnt: In MariaDB ist JSON ein Alias für LONGTEXT, und für die Spalte legt der Server selbst eine JSON_VALID-Prüfung an.
UPDATE products SET attrs = '{kaputt' WHERE sku = 'MN-0001';

-- Eine generierte (virtuelle) Spalte macht einen Pfad indexierbar. Ohne sie könnte MariaDB nicht in das JSON hineinindizieren.
ALTER TABLE products ADD COLUMN layout CHAR(2) AS (JSON_VALUE(attrs, '$.layout')) VIRTUAL, ADD INDEX idx_products_layout (layout);
SELECT sku, layout FROM products WHERE layout = 'US';
SELECT index_name, column_name, non_unique FROM information_schema.STATISTICS WHERE table_schema = 'lab' AND table_name = 'products' AND index_name = 'idx_products_layout';

-- JSON_TABLE klappt ein Array in Zeilen auf, damit man es mit JOIN und GROUP BY weiterverarbeiten kann.
SELECT p.sku, t.tag FROM products p, JSON_TABLE(p.attrs, '$.tags[*]' COLUMNS (tag VARCHAR(20) PATH '$')) t ORDER BY p.sku, t.tag;
