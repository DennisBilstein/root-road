-- Erfundene Beispieldaten (keine echten Personen). example.test ist eine reservierte Domain.
INSERT INTO customers (name, email, city, created_on) VALUES
 ('Ada Beispiel',   'ada@example.test',   'Berlin',  '2026-01-10'),
 ('Ben Muster',     'ben@example.test',   'Berlin',  '2026-02-03'),
 ('Cem Probe',      'cem@example.test',   'Hamburg', '2026-02-20'),
 ('Dana Test',      'dana@example.test',  'Hamburg', '2026-03-05'),
 ('Eli Demo',       'eli@example.test',   'München', '2026-03-18'),
 ('Fay Lernbeispiel','fay@example.test',  'München', '2026-04-01');

INSERT INTO categories (id, parent_id, name) VALUES
 (1, NULL, 'Hardware'), (2, 1, 'Eingabegeräte'), (3, 1, 'Monitore'),
 (4, NULL, 'Software'), (5, 4, 'Lernkurse'), (6, 2, 'Tastaturen');

INSERT INTO products (sku, name, category_id, price, stock) VALUES
 ('KB-0001', 'Tastatur Basis',      6,  29.90, 40),
 ('KB-0002', 'Tastatur Mechanisch', 6,  89.00, 15),
 ('MS-0001', 'Maus Kabellos',       2,  19.50, 60),
 ('MN-0001', 'Monitor 24 Zoll',     3, 159.00,  8),
 ('MN-0002', 'Monitor 27 Zoll',     3, 249.00,  5),
 ('SW-0001', 'Kurs SQL Grundlagen', 5,  49.00, 999),
 ('SW-0002', 'Kurs Docker',         5,  59.00, 999),
 ('SW-0003', 'Kurs Python',         5,  59.00, 999);

INSERT INTO orders (customer_id, ordered_at, status) VALUES
 (1, '2026-01-15 10:00:00', 'shipped'),
 (1, '2026-02-12 14:30:00', 'shipped'),
 (2, '2026-02-14 09:15:00', 'paid'),
 (3, '2026-02-25 16:45:00', 'shipped'),
 (3, '2026-03-02 11:00:00', 'cancelled'),
 (4, '2026-03-10 13:20:00', 'shipped'),
 (5, '2026-03-22 08:05:00', 'paid'),
 (5, '2026-04-02 17:40:00', 'open'),
 (1, '2026-04-05 12:00:00', 'paid'),
 (6, '2026-04-07 19:10:00', 'shipped');

INSERT INTO order_items (order_id, line_no, product_id, qty, unit_price) VALUES
 (1,1,1,1,29.90),(1,2,3,2,19.50),
 (2,1,4,1,159.00),
 (3,1,6,1,49.00),(3,2,7,1,59.00),
 (4,1,2,1,89.00),(4,2,3,1,19.50),
 (5,1,5,1,249.00),
 (6,1,8,2,59.00),
 (7,1,1,2,29.90),(7,2,3,3,19.50),
 (8,1,4,2,159.00),
 (9,1,6,1,49.00),(9,2,8,1,59.00),
 (10,1,2,1,89.00),(10,2,1,1,29.90),(10,3,7,1,59.00);
