/* Werkstattaufgaben der Spur mariadb (Original Root Road). Wird erst geladen, wenn die Spur in der Werkstatt geöffnet wird. */
(function(){
var W=window.RP_WS,L=W.L,need=W.need,bad=W.bad;
var sqlSchema=['Gegeben ist die Tabelle users(id BIGINT UNSIGNED, name VARCHAR(80)).'];
var tasks=[
  {id:'mariadb-w1',modules:['mariadb-m1'],level:'schwer',type:'write',language:'sql',rows:16,
    title:'Tabelle mit Integrität anlegen',
    text:'Schreibe das CREATE TABLE für learning_tasks so, dass die Datenbank selbst ungültige Daten verhindert.',
    details:sqlSchema.concat(['Spalten: id (ganze Zahl, automatisch hochzählend, Primärschlüssel), owner_id (Pflicht, verweist auf users.id), title (Text bis 120 Zeichen, Pflicht), minutes (ganze Zahl, Pflicht, mindestens 1), done (0 oder 1, Standard 0), created_at (Zeitstempel, Standard: jetzt).','Löscht man einen Besitzer, werden seine Aufgaben mit gelöscht. Für die häufige Abfrage „offene Aufgaben je Besitzer“ braucht es einen Index auf (owner_id, done).']),
    starter:L('-- Schreibe hier dein CREATE TABLE (MariaDB)','',''),
    rules:[
      need('CREATE TABLE learning_tasks',/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?learning_tasks\b/i),
      need('id ist Primärschlüssel mit AUTO_INCREMENT',/\bAUTO_INCREMENT\b[\s\S]*\bPRIMARY\s+KEY\b|\bPRIMARY\s+KEY\b[\s\S]*\bAUTO_INCREMENT\b/i,/CREATE\s+TABLE/i),
      need('title VARCHAR(120) NOT NULL',/\btitle\s+VARCHAR\s*\(\s*120\s*\)\s+NOT\s+NULL\b/i,/CREATE\s+TABLE/i),
      need('minutes als ganze Zahl NOT NULL',/\bminutes\s+(?:INT|INTEGER|SMALLINT|MEDIUMINT)\b[^,]*\bNOT\s+NULL\b/i,/CREATE\s+TABLE/i),
      need('CHECK (minutes >= 1)',/\bCHECK\s*\(\s*minutes\s*>=\s*1\s*\)|\bCHECK\s*\(\s*minutes\s*>\s*0\s*\)/i,/CREATE\s+TABLE/i),
      need('done mit Standardwert 0',/\bdone\s+(?:TINYINT\s*(?:\(\s*1\s*\))?|BOOLEAN|BOOL)\b[^,]*\bDEFAULT\s+(?:0|FALSE)\b/i,/CREATE\s+TABLE/i),
      need('created_at mit DEFAULT CURRENT_TIMESTAMP',/\bcreated_at\s+(?:TIMESTAMP|DATETIME)\b[^,]*\bDEFAULT\s+(?:CURRENT_TIMESTAMP|NOW\s*\(\s*\))/i,/CREATE\s+TABLE/i),
      need('FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE',/\bFOREIGN\s+KEY\s*\(\s*owner_id\s*\)\s*REFERENCES\s+users\s*\(\s*id\s*\)[^,;]*\bON\s+DELETE\s+CASCADE\b/i,/CREATE\s+TABLE/i),
      need('Index auf (owner_id, done)',/\b(?:INDEX|KEY)\s+\w+\s*\(\s*owner_id\s*,\s*done\s*\)|CREATE\s+INDEX\s+\w+\s+ON\s+learning_tasks\s*\(\s*owner_id\s*,\s*done\s*\)/i,/CREATE\s+TABLE/i),
      bad(/\bminutes\s+(?:FLOAT|DOUBLE|DECIMAL|VARCHAR|TEXT)\b/i,'Minuten sind eine ganze Zahl (INT), kein Gleitkomma- oder Textwert.'),
      bad(/\bENGINE\s*=\s*MyISAM\b/i,'MyISAM kennt weder Fremdschlüssel noch Transaktionen. Nutze InnoDB (Standard).')
    ],
    solution:L('CREATE TABLE learning_tasks (','  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,','  owner_id BIGINT UNSIGNED NOT NULL,','  title VARCHAR(120) NOT NULL,','  minutes INT NOT NULL,','  done TINYINT(1) NOT NULL DEFAULT 0,','  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,','  PRIMARY KEY (id),','  CONSTRAINT chk_minutes CHECK (minutes >= 1),','  CONSTRAINT fk_tasks_owner FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE,','  INDEX idx_owner_done (owner_id, done)',') ENGINE=InnoDB;'),
    hint:'Regeln, die immer gelten müssen, gehören in die Tabelle: NOT NULL, CHECK, FOREIGN KEY. Die Anwendung allein kann sie nicht garantieren.',
    why:'Constraints schützen auch vor anderen schreibenden Clients und vor Fehlern in der Anwendung. CHECK wird erst ab MariaDB 10.2 durchgesetzt – Zielversion prüfen.'},
  {id:'mariadb-w2',modules:['mariadb-m2'],level:'schwer',type:'write',language:'sql',rows:14,
    title:'Auswertung mit JOIN, GROUP BY und HAVING',
    text:'Schreibe eine Abfrage: Welche Besitzer haben mindestens drei offene Aufgaben, und wie viele Minuten sind das insgesamt?',
    details:sqlSchema.concat(['learning_tasks(id, owner_id, title, minutes, done, created_at). done = 0 heißt offen.','Ausgabe: name, Anzahl offener Aufgaben als open_tasks, Summe der Minuten als total_minutes. Sortiert nach total_minutes absteigend, höchstens 10 Zeilen.']),
    starter:L('-- Schreibe hier deine SELECT-Abfrage','',''),
    rules:[
      need('JOIN von users und learning_tasks über owner_id = id',/\bJOIN\b[\s\S]*?\bON\b\s+(?:\w+\.)?owner_id\s*=\s*(?:\w+\.)?id\b|\bJOIN\b[\s\S]*?\bON\b\s+(?:\w+\.)?id\s*=\s*(?:\w+\.)?owner_id\b/i,/\bSELECT\b/i),
      need('filtert offene Aufgaben mit WHERE done = 0',/\bWHERE\b[\s\S]*\bdone\s*=\s*(?:0|FALSE)\b/i,/\bFROM\b/i),
      need('zählt mit COUNT und summiert mit SUM(minutes)',/\bCOUNT\s*\([^)]*\)[\s\S]*\bSUM\s*\(\s*(?:\w+\.)?minutes\s*\)|\bSUM\s*\(\s*(?:\w+\.)?minutes\s*\)[\s\S]*\bCOUNT\s*\(/i,/\bSELECT\b/i),
      need('Spaltennamen open_tasks und total_minutes',/\bAS\s+open_tasks\b[\s\S]*\bAS\s+total_minutes\b|\bAS\s+total_minutes\b[\s\S]*\bAS\s+open_tasks\b/i,/\bSELECT\b/i),
      need('GROUP BY',/\bGROUP\s+BY\b/i,/\bFROM\b/i),
      need('HAVING mit mindestens 3 Aufgaben',/\bHAVING\s+COUNT\s*\(\s*[^)]*\)\s*(?:>=\s*3|>\s*2)\b/i,/\bGROUP\s+BY\b/i),
      need('ORDER BY total_minutes DESC',/\bORDER\s+BY\s+total_minutes\s+DESC\b|\bORDER\s+BY\s+SUM\s*\([^)]*\)\s+DESC\b/i,/\bGROUP\s+BY\b/i),
      need('LIMIT 10',/\bLIMIT\s+10\b/i,/\bGROUP\s+BY\b/i),
      bad(/\bWHERE\b(?:(?!\b(?:GROUP|HAVING|ORDER)\b)[^;])*\bCOUNT\s*\(/i,'Aggregate wie COUNT stehen nicht in WHERE, sondern in HAVING (WHERE filtert Zeilen vor der Gruppierung).'),
      bad(/\bSELECT\s+\*/i,'Keine Sternabfrage: Nenne die Spalten, die du wirklich brauchst.')
    ],
    solution:L('SELECT u.name, COUNT(*) AS open_tasks, SUM(t.minutes) AS total_minutes','FROM users AS u','JOIN learning_tasks AS t ON t.owner_id = u.id','WHERE t.done = 0','GROUP BY u.id, u.name','HAVING COUNT(*) >= 3','ORDER BY total_minutes DESC','LIMIT 10;'),
    hint:'WHERE filtert einzelne Zeilen vor dem Gruppieren, HAVING filtert fertige Gruppen danach.',
    why:'Die Reihenfolge der Auswertung ist FROM/JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT. Wer das im Kopf hat, setzt Bedingungen an die richtige Stelle.'}
];
W.add('mariadb',tasks);
W.add('mariadb',[
{id:'mariadb-w3',modules:['mariadb-m2'],level:'schwer',type:'write',language:'sql',rows:28,
  title:'Fensterfunktionen: Top 2 je Besitzer und laufende Summe',
  text:'Gegeben sind die Tabellen besitzer(id, name) und aufgabe(id, besitzer_id, titel, minuten, erledigt_am DATE). Schreibe zwei Abfragen.',
  details:['Abfrage 1: je Besitzer die zwei Aufgaben mit den meisten Minuten (bei Gleichstand die kleinere id zuerst). Nutze eine WITH-Klausel (CTE) mit ROW_NUMBER() OVER (PARTITION BY besitzer_id ORDER BY minuten DESC, id) als rang und filtere außerhalb mit WHERE rang <= 2.','Ausgabespalten: name, titel, minuten, rang, sortiert nach name, rang. Besitzer ohne Aufgaben erscheinen nicht (INNER JOIN).','Abfrage 2: laufende Summe der Minuten pro Besitzer nach erledigt_am: SUM(minuten) OVER (PARTITION BY besitzer_id ORDER BY erledigt_am, id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS summe, nur Aufgaben mit erledigt_am IS NOT NULL.','Ausgabespalten: besitzer_id, erledigt_am, minuten, summe, sortiert nach besitzer_id, erledigt_am, id.','Beide Abfragen mit Semikolon beenden. Kein SELECT *.'],
  starter:L('-- Abfrage 1','','','-- Abfrage 2','',''),
  rules:[
    need('WITH-Klausel (CTE)',/\bWITH\s+\w+\s+AS\s*\(/i),
    need('ROW_NUMBER() mit PARTITION BY besitzer_id',/\bROW_NUMBER\s*\(\s*\)\s+OVER\s*\(\s*PARTITION\s+BY\s+(?:\w+\.)?besitzer_id\s+ORDER\s+BY\s+(?:\w+\.)?minuten\s+DESC\s*,\s*(?:\w+\.)?id\s*\)\s+AS\s+rang\b/i),
    need('Filter rang <= 2 außerhalb der CTE',/\)\s*SELECT\b[\s\S]*?\bWHERE\s+(?:\w+\.)?rang\s*<=\s*2\b/i),
    need('JOIN auf besitzer',/\bJOIN\s+besitzer\b/i),
    need('Sortierung name, rang',/\bORDER\s+BY\s+(?:\w+\.)?name\s*,\s*(?:\w+\.)?rang\s*;/i),
    need('laufende Summe mit SUM() OVER',/\bSUM\s*\(\s*minuten\s*\)\s+OVER\s*\(\s*PARTITION\s+BY\s+besitzer_id\s+ORDER\s+BY\s+erledigt_am\s*,\s*id\s+ROWS\s+BETWEEN\s+UNBOUNDED\s+PRECEDING\s+AND\s+CURRENT\s+ROW\s*\)\s+AS\s+summe\b/i),
    need('nur erledigte Aufgaben',/\bWHERE\s+erledigt_am\s+IS\s+NOT\s+NULL\b/i),
    need('Sortierung besitzer_id, erledigt_am, id',/\bORDER\s+BY\s+besitzer_id\s*,\s*erledigt_am\s*,\s*id\s*;/i),
    bad(/\bSELECT\s+\*/i,'Nenne die Spalten ausdrücklich: SELECT * liefert mehr als gefragt und bricht bei Schemaänderungen.'),
    bad(/\bLIMIT\b/i,'LIMIT gilt für das gesamte Ergebnis, nicht pro Besitzer. Nimm ROW_NUMBER() mit PARTITION BY.'),
    bad(/\bGROUP\s+BY\b/i,'GROUP BY verdichtet die Zeilen. Eine Fensterfunktion behält jede Zeile und rechnet darüber.')
  ],
  solution:L('WITH gerankt AS (','  SELECT besitzer_id, titel, minuten,','         ROW_NUMBER() OVER (PARTITION BY besitzer_id ORDER BY minuten DESC, id) AS rang','  FROM aufgabe',')','SELECT b.name, g.titel, g.minuten, g.rang','FROM gerankt AS g','INNER JOIN besitzer AS b ON b.id = g.besitzer_id','WHERE g.rang <= 2','ORDER BY b.name, g.rang;','','SELECT besitzer_id, erledigt_am, minuten,','       SUM(minuten) OVER (PARTITION BY besitzer_id ORDER BY erledigt_am, id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS summe','FROM aufgabe','WHERE erledigt_am IS NOT NULL','ORDER BY besitzer_id, erledigt_am, id;'),
  hint:'Eine Fensterfunktion lässt die Zeilen stehen und rechnet über eine Gruppe darum herum. Weil WHERE vor den Fensterfunktionen läuft, filterst du den Rang erst in einer äußeren Abfrage (daher die CTE).',
  why:'„Die ersten n je Gruppe“ und laufende Summen sind Standardaufgaben in Berichten. Mit Fensterfunktionen bleiben sie eine einzige, gut lesbare Abfrage statt mehrerer Unterabfragen.'},
{id:'mariadb-w4',modules:['mariadb-m2'],lesson:'mariadb-m2-l4',level:'schwer',type:'write',language:'sql',rows:38,
  title:'Überweisung als gesicherte Prozedur mit Transaktion',
  text:'Gegeben sind konto(konto_id INT PRIMARY KEY, saldo_cent INT NOT NULL) und buchung(buchung_id AUTO_INCREMENT, von_konto, nach_konto, betrag_cent). Schreibe die Prozedur ueberweisen, die Geld nur überträgt, wenn alles stimmt, und sonst nichts ändert.',
  details:['Rahmen: DELIMITER // … END // DELIMITER ; und CREATE PROCEDURE ueberweisen(IN p_von INT, IN p_nach INT, IN p_betrag_cent INT).','DECLARE v_anzahl INT; DECLARE v_saldo INT; und DECLARE EXIT HANDLER FOR SQLEXCEPTION mit ROLLBACK; und RESIGNAL; (der Fehler soll beim Aufrufer ankommen, nicht verschwinden).','Vor der Transaktion: Ist p_betrag_cent <= 0 oder p_von = p_nach, SIGNAL SQLSTATE \'45000\' SET MESSAGE_TEXT = \'Ungueltige Ueberweisung\'.','START TRANSACTION; dann beide Konten sperren: SELECT COUNT(*) INTO v_anzahl FROM konto WHERE konto_id IN (p_von, p_nach) FOR UPDATE; Bei v_anzahl <> 2 meldest du \'Konto unbekannt\'.','Den Saldo des Absenders mit SELECT saldo_cent INTO v_saldo lesen (die Sperre hält ihn stabil); ist v_saldo < p_betrag_cent, meldest du \'Saldo nicht gedeckt\'.','Danach UPDATE … SET saldo_cent = saldo_cent - p_betrag_cent (Absender), UPDATE … + p_betrag_cent (Empfänger), INSERT INTO buchung und COMMIT;','Rechne relativ (saldo_cent = saldo_cent - …), nie mit einem vorher gelesenen und zurückgeschriebenen Wert, und speichere Geld nur als ganze Cent.'],
  starter:L('-- Schreibe hier die Prozedur ueberweisen','',''),
  rules:[
    need('DELIMITER-Rahmen',/\bDELIMITER\s+\/\/[\s\S]*?\bEND\s*\/\/\s*DELIMITER\s*;/i),
    need('CREATE PROCEDURE ueberweisen mit drei Parametern',/\bCREATE\s+PROCEDURE\s+ueberweisen\s*\(\s*IN\s+p_von\s+INT\s*,\s*IN\s+p_nach\s+INT\s*,\s*IN\s+p_betrag_cent\s+INT\s*\)/i),
    need('Exit-Handler mit ROLLBACK und RESIGNAL',/\bDECLARE\s+EXIT\s+HANDLER\s+FOR\s+SQLEXCEPTION\s+BEGIN\s+ROLLBACK\s*;\s*RESIGNAL\s*;\s*END\s*;/i),
    need('Eingabeprüfung mit SIGNAL',/\bIF\s+p_betrag_cent\s*<=\s*0\s+OR\s+p_von\s*=\s*p_nach\s+THEN\s+SIGNAL\s+SQLSTATE\s+'45000'\s+SET\s+MESSAGE_TEXT\s*=\s*'[^']+'\s*;\s*END\s+IF\s*;/i),
    need('START TRANSACTION',/\bSTART\s+TRANSACTION\s*;/i),
    need('beide Konten mit FOR UPDATE sperren',/\bSELECT\s+COUNT\s*\(\s*\*\s*\)\s+INTO\s+v_anzahl\s+FROM\s+konto\s+WHERE\s+konto_id\s+IN\s*\(\s*p_von\s*,\s*p_nach\s*\)\s+FOR\s+UPDATE\s*;/i),
    need('unbekanntes Konto wird gemeldet',/\bIF\s+v_anzahl\s*<>\s*2\s+THEN\s+SIGNAL\s+SQLSTATE\s+'45000'/i),
    need('Saldo lesen und Deckung prüfen',/\bSELECT\s+saldo_cent\s+INTO\s+v_saldo\s+FROM\s+konto\s+WHERE\s+konto_id\s*=\s*p_von\s*;\s*IF\s+v_saldo\s*<\s*p_betrag_cent\s+THEN\s+SIGNAL\s+SQLSTATE\s+'45000'/i),
    need('relative Abbuchung',/\bUPDATE\s+konto\s+SET\s+saldo_cent\s*=\s*saldo_cent\s*-\s*p_betrag_cent\s+WHERE\s+konto_id\s*=\s*p_von\s*;/i),
    need('relative Gutschrift',/\bUPDATE\s+konto\s+SET\s+saldo_cent\s*=\s*saldo_cent\s*\+\s*p_betrag_cent\s+WHERE\s+konto_id\s*=\s*p_nach\s*;/i),
    need('Buchungssatz',/\bINSERT\s+INTO\s+buchung\s*\(\s*von_konto\s*,\s*nach_konto\s*,\s*betrag_cent\s*\)\s*VALUES\s*\(\s*p_von\s*,\s*p_nach\s*,\s*p_betrag_cent\s*\)\s*;/i),
    need('COMMIT',/\bCOMMIT\s*;/i),
    bad(/\bSET\s+saldo_cent\s*=\s*v_saldo\b/i,'Schreibe nie einen vorher gelesenen Saldo zurück, sondern rechne in der Anweisung (saldo_cent - p_betrag_cent): sonst gehen parallele Buchungen verloren.'),
    bad(/\bFLOAT\b|\bDOUBLE\b|\bDECIMAL\b/i,'Geld wird als ganze Cent gespeichert (INT), nicht als Kommazahl.'),
    bad(/\bSET\s+autocommit\s*=\s*1\b/i,'Mit eingeschaltetem Autocommit wäre jede Anweisung für sich endgültig – nutze START TRANSACTION … COMMIT.'),
    bad(/\bDECLARE\s+(?:CONTINUE|EXIT)\s+HANDLER\b[^;]*\bBEGIN\s*END\b/i,'Ein leerer Handler verschluckt Fehler. Rolle zurück und gib den Fehler mit RESIGNAL weiter.')
  ],
  solution:L('DELIMITER //','CREATE PROCEDURE ueberweisen(IN p_von INT, IN p_nach INT, IN p_betrag_cent INT)','BEGIN','  DECLARE v_anzahl INT;','  DECLARE v_saldo INT;','  DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;','','  IF p_betrag_cent <= 0 OR p_von = p_nach THEN SIGNAL SQLSTATE \'45000\' SET MESSAGE_TEXT = \'Ungueltige Ueberweisung\'; END IF;','','  START TRANSACTION;','  SELECT COUNT(*) INTO v_anzahl FROM konto WHERE konto_id IN (p_von, p_nach) FOR UPDATE;','  IF v_anzahl <> 2 THEN SIGNAL SQLSTATE \'45000\' SET MESSAGE_TEXT = \'Konto unbekannt\'; END IF;','','  SELECT saldo_cent INTO v_saldo FROM konto WHERE konto_id = p_von;','  IF v_saldo < p_betrag_cent THEN SIGNAL SQLSTATE \'45000\' SET MESSAGE_TEXT = \'Saldo nicht gedeckt\'; END IF;','','  UPDATE konto SET saldo_cent = saldo_cent - p_betrag_cent WHERE konto_id = p_von;','  UPDATE konto SET saldo_cent = saldo_cent + p_betrag_cent WHERE konto_id = p_nach;','  INSERT INTO buchung (von_konto, nach_konto, betrag_cent) VALUES (p_von, p_nach, p_betrag_cent);','  COMMIT;','END //','DELIMITER ;'),
  hint:'Alles Prüfbare steht vor den Änderungen. Der Handler macht aus jedem Fehler ein ROLLBACK, damit niemals nur eine Hälfte der Überweisung bestehen bleibt. FOR UPDATE hält die Zeilen bis COMMIT gesperrt.',
  why:'Eine Überweisung besteht aus mehreren Schritten, die nur gemeinsam gelten dürfen. Transaktion, Sperre und Rollback im Fehlerfall machen sie atomar und bei gleichzeitigen Zugriffen sicher.'},
{id:'mariadb-w5',modules:['mariadb-m2'],lesson:'mariadb-m2-l5',level:'schwer',type:'write',language:'sql',rows:26,
  title:'Keyset-Paginierung statt OFFSET',
  text:'Gegeben ist aufgabe(id, titel, erstellt_am DATETIME). Schreibe einen Index und zwei Abfragen für eine Liste, die neueste Aufgaben zuerst zeigt, 20 pro Seite.',
  details:['CREATE INDEX idx_aufgabe_erstellt ON aufgabe (erstellt_am, id); – dieselben Spalten wie die Sortierung.','Erste Seite: SELECT id, titel, erstellt_am FROM aufgabe ORDER BY erstellt_am DESC, id DESC LIMIT 21; (21 statt 20: die 21. Zeile verrät nur, dass es eine weitere Seite gibt, und wird nicht angezeigt).','Folgeseite nach einem Cursor (Zeit und id der letzten angezeigten Zeile) in den Variablen @cursor_zeit und @cursor_id: WHERE (erstellt_am, id) < (@cursor_zeit, @cursor_id) mit derselben Sortierung und LIMIT 21.','Die Sortierung muss eindeutig sein (deshalb id als zweite Spalte), sonst verschwinden oder doppeln sich Zeilen zwischen den Seiten.','Kein OFFSET und kein SELECT *.'],
  starter:L('-- Index','','','-- Erste Seite','','','-- Folgeseite','',''),
  rules:[
    need('Index auf (erstellt_am, id)',/\bCREATE\s+INDEX\s+idx_aufgabe_erstellt\s+ON\s+aufgabe\s*\(\s*erstellt_am\s*,\s*id\s*\)\s*;/i),
    need('Erste Seite mit eindeutiger Sortierung und LIMIT 21',/\bSELECT\s+id\s*,\s*titel\s*,\s*erstellt_am\s+FROM\s+aufgabe\s+ORDER\s+BY\s+erstellt_am\s+DESC\s*,\s*id\s+DESC\s+LIMIT\s+21\s*;/i),
    need('Folgeseite mit Zeilenvergleich',/\bWHERE\s*\(\s*erstellt_am\s*,\s*id\s*\)\s*<\s*\(\s*@cursor_zeit\s*,\s*@cursor_id\s*\)\s+ORDER\s+BY\s+erstellt_am\s+DESC\s*,\s*id\s+DESC\s+LIMIT\s+21\s*;/i),
    bad(/\bOFFSET\b|\bLIMIT\s+\d+\s*,\s*\d+/i,'OFFSET liest und verwirft alle vorherigen Zeilen – bei Seite 5000 sehr langsam, und bei neuen Einträgen rutschen Zeilen. Nutze den Cursor.'),
    bad(/\bSELECT\s+\*/i,'Nenne die Spalten ausdrücklich: SELECT * liefert mehr als gefragt.'),
    bad(/\bWHERE\s+erstellt_am\s*<\s*@cursor_zeit\b/i,'Allein die Zeit ist nicht eindeutig: Zeilen mit gleicher Zeit gehen verloren. Vergleiche (erstellt_am, id) gemeinsam.')
  ],
  solution:L('CREATE INDEX idx_aufgabe_erstellt ON aufgabe (erstellt_am, id);','','SELECT id, titel, erstellt_am FROM aufgabe ORDER BY erstellt_am DESC, id DESC LIMIT 21;','','SELECT id, titel, erstellt_am FROM aufgabe','WHERE (erstellt_am, id) < (@cursor_zeit, @cursor_id)','ORDER BY erstellt_am DESC, id DESC LIMIT 21;'),
  hint:'Der Cursor ist die Sortierposition der letzten Zeile. Die nächste Seite beginnt unmittelbar dahinter – ohne die vorherigen Zeilen noch einmal zu lesen.',
  why:'OFFSET wird mit jeder Seite langsamer und liefert bei laufenden Änderungen doppelte oder fehlende Zeilen. Keyset-Paginierung bleibt gleich schnell und stabil, weil der Index direkt an die Position springt.'}
]);
})();
