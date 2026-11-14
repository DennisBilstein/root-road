-- @no-seed
-- Fall 2: Normalisierung. Wir starten bewusst mit einer "flachen" Tabelle und beobachten, was schiefgehen kann.
CREATE TABLE orders_flat (
  order_no INT, customer_name VARCHAR(80), customer_city VARCHAR(60),
  product_sku CHAR(8), product_name VARCHAR(80), qty INT
);
INSERT INTO orders_flat VALUES
 (1, 'Ada Beispiel', 'Berlin',  'KB-0001', 'Tastatur Basis', 1),
 (1, 'Ada Beispiel', 'Berlin',  'MS-0001', 'Maus Kabellos',  2),
 (2, 'Ada Beispiel', 'Berlin',  'KB-0001', 'Tastatur Basis', 3),
 (3, 'Ben Muster',   'Berlin',  'MS-0001', 'Maus Kabellos',  1);

-- Änderungsanomalie: Ada zieht um, aber nur eine Zeile wird aktualisiert. Die Tabelle widerspricht sich danach selbst.
UPDATE orders_flat SET customer_city = 'Hamburg' WHERE order_no = 1 AND product_sku = 'KB-0001';
SELECT DISTINCT customer_name, customer_city FROM orders_flat WHERE customer_name = 'Ada Beispiel' ORDER BY customer_city;

-- Zerlegung: Jede Tatsache steht genau einmal (3. Normalform). Kunden und Produkte bekommen eigene Tabellen mit Schlüssel.
CREATE TABLE n_customers (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(80) NOT NULL UNIQUE, city VARCHAR(60) NOT NULL);
CREATE TABLE n_products (sku CHAR(8) PRIMARY KEY, name VARCHAR(80) NOT NULL);
CREATE TABLE n_orders (order_no INT PRIMARY KEY, customer_id INT NOT NULL, FOREIGN KEY (customer_id) REFERENCES n_customers(id));
CREATE TABLE n_items (order_no INT NOT NULL, sku CHAR(8) NOT NULL, qty INT NOT NULL CHECK (qty > 0),
  PRIMARY KEY (order_no, sku), FOREIGN KEY (order_no) REFERENCES n_orders(order_no), FOREIGN KEY (sku) REFERENCES n_products(sku));

-- Migration der Daten: Bei widersprüchlichen Städten muss jemand entscheiden. MAX() wählt hier alphabetisch Hamburg; das ist eine bewusste Notlösung, keine Regel.
INSERT INTO n_customers (name, city) SELECT customer_name, MAX(customer_city) FROM orders_flat GROUP BY customer_name;
INSERT INTO n_products SELECT DISTINCT product_sku, product_name FROM orders_flat;
INSERT INTO n_orders SELECT DISTINCT f.order_no, c.id FROM orders_flat f JOIN n_customers c ON c.name = f.customer_name;
INSERT INTO n_items SELECT order_no, product_sku, SUM(qty) FROM orders_flat GROUP BY order_no, product_sku;
SELECT c.name, c.city, o.order_no, i.sku, i.qty FROM n_items i JOIN n_orders o USING (order_no) JOIN n_customers c ON c.id = o.customer_id ORDER BY o.order_no, i.sku;

-- Jetzt genügt eine Änderung an einer Stelle, und die Datenbank schützt vor Waisen und ungültigen Mengen.
UPDATE n_customers SET city = 'Berlin' WHERE name = 'Ada Beispiel';
DELETE FROM n_products WHERE sku = 'KB-0001';
INSERT INTO n_items VALUES (3, 'MS-0001', 0);
INSERT INTO n_items VALUES (3, 'XX-9999', 1);
SELECT name, city FROM n_customers ORDER BY name;
