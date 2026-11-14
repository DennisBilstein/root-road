-- @no-seed
-- Fall 7: Zeichensätze, Vergleichsregeln, Geld und Zeit.
SET NAMES utf8mb4;

-- Länge in Bytes oder Zeichen? utf8mb4 speichert ein Emoji in 4 Bytes, ein "ä" in 2.
SELECT CHAR_LENGTH('Bär') AS chars, LENGTH('Bär') AS bytes, CHAR_LENGTH('😀') AS emoji_chars, LENGTH('😀') AS emoji_bytes;

-- Collation: Sie bestimmt, wann zwei Texte "gleich" sind. Die Wahl wirkt auf WHERE, UNIQUE, ORDER BY und JOIN.
SELECT 'Ä' = 'a' COLLATE utf8mb4_general_ci AS general_ci,
       'Ä' = 'a' COLLATE utf8mb4_unicode_ci AS unicode_ci,
       'Ä' = 'ä' COLLATE utf8mb4_bin        AS bin_ae_eq,
       'ä' = 'ä' COLLATE utf8mb4_bin        AS bin_same,
       'ss' = 'ß' COLLATE utf8mb4_unicode_ci AS unicode_ss,
       'ss' = 'ß' COLLATE utf8mb4_general_ci AS general_ss;

CREATE TABLE users (email VARCHAR(60) COLLATE utf8mb4_unicode_ci NOT NULL, UNIQUE KEY uq_email (email));
INSERT INTO users VALUES ('Ada@Example.test');
INSERT INTO users VALUES ('ada@example.test');

-- Geld: DECIMAL rechnet exakt, DOUBLE nicht.
SELECT 0.1 + 0.2 = 0.3 AS decimal_equal, CAST(0.1 AS DOUBLE) + CAST(0.2 AS DOUBLE) = CAST(0.3 AS DOUBLE) AS double_equal;
SELECT CAST(0.1 AS DOUBLE) + CAST(0.2 AS DOUBLE) AS double_sum, ROUND(2.675, 2) AS round_decimal, ROUND(2.5) AS half_up_decimal;

-- Strikter Modus: ungültige Werte lösen einen Fehler aus, statt still abgeschnitten zu werden.
SELECT @@SESSION.sql_mode LIKE '%STRICT_TRANS_TABLES%' AS strict_mode;
CREATE TABLE amounts (v DECIMAL(5,2) NOT NULL, label VARCHAR(5) NOT NULL);
INSERT INTO amounts VALUES (123.456, 'ok');
INSERT INTO amounts VALUES (1234.5, 'zu groß');
INSERT INTO amounts VALUES (1, 'viel zu lang');
SELECT v, label FROM amounts;

-- Zeit: TIMESTAMP speichert UTC und rechnet bei Ausgabe in die Sitzungszeitzone um, DATETIME speichert den Wert unverändert.
CREATE TABLE stamps (id INT PRIMARY KEY, ts TIMESTAMP NOT NULL, dt DATETIME NOT NULL);
SET SESSION time_zone = '+00:00';
INSERT INTO stamps VALUES (1, '2026-06-01 12:00:00', '2026-06-01 12:00:00');
SELECT ts, dt FROM stamps;
SET SESSION time_zone = '+09:00';
SELECT ts, dt FROM stamps;
