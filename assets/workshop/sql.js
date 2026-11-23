/* Werkstattaufgaben der Spur sql (Original Root Road). Wird erst geladen, wenn die Spur in der Werkstatt geöffnet wird. */
(function(){
var W=window.RP_WS,L=W.L,need=W.need,bad=W.bad;
var tasks=[
  {id:'sql-w1',modules:['m7'],level:'schwer',type:'write',language:'sql',rows:14,
    title:'Besitzer ohne Aufgaben finden',
    text:'Schreibe eine Abfrage, die alle Besitzer ausgibt, die noch keine einzige Aufgabe haben.',
    details:['users(id, name), tasks(id, owner_id, title, done).','Ausgabe: id und name, alphabetisch nach name sortiert.','Löse es mit LEFT JOIN … IS NULL oder mit NOT EXISTS.'],
    starter:L('-- Schreibe hier deine SELECT-Abfrage','',''),
    rules:[
      need('SELECT mit id und name aus users',/\bSELECT\s+(?:\w+\.)?id\s*,\s*(?:\w+\.)?name\b[\s\S]*\bFROM\s+users\b/i),
      need('LEFT JOIN … IS NULL oder NOT EXISTS',/\bLEFT\s+(?:OUTER\s+)?JOIN\s+tasks\b[\s\S]*\bIS\s+NULL\b|\bNOT\s+EXISTS\s*\(\s*SELECT\b[\s\S]*\bFROM\s+tasks\b/i,/\bFROM\s+users\b/i),
      need('verbindet über owner_id und id',/\bowner_id\s*=\s*(?:\w+\.)?id\b|\b(?:\w+\.)?id\s*=\s*(?:\w+\.)?owner_id\b/i,/\bFROM\s+users\b/i),
      need('ORDER BY name',/\bORDER\s+BY\s+(?:\w+\.)?name\b/i,/\bFROM\s+users\b/i),
      bad(/(?:=|<>|!=)\s*NULL\b/i,'Mit NULL vergleicht man mit IS NULL bzw. IS NOT NULL, nie mit = oder <>.'),
      bad(/\bNOT\s+IN\s*\(\s*SELECT\s+owner_id\b(?![\s\S]*\bIS\s+NOT\s+NULL\b)/i,'NOT IN liefert nichts, sobald die Unterabfrage ein NULL enthält. Nimm NOT EXISTS oder LEFT JOIN.'),
      bad(/\bSELECT\s+\*/i,'Keine Sternabfrage: Nenne die Spalten.')
    ],
    solution:L('SELECT u.id, u.name','FROM users AS u','LEFT JOIN tasks AS t ON t.owner_id = u.id','WHERE t.id IS NULL','ORDER BY u.name;'),
    hint:'Ein LEFT JOIN behält jeden Besitzer. Wo keine Aufgabe passt, sind die Spalten der Aufgabe NULL.',
    why:'„Gibt es nicht“ ist eine der häufigsten Fragen an Daten. Anti-Joins lösen sie ohne die NULL-Fallen von NOT IN.'},
  {id:'sql-w2',modules:['abap-m3', 'java-m3'],level:'schwer',type:'write',language:'sql',rows:18,
    title:'Daten sicher ändern',
    text:'Schreibe ein Skript mit einer Transaktion, die zwei Aufgaben anlegt, die Aufgaben des Besitzers 7 abschließt und alte erledigte Aufgaben löscht.',
    details:['tasks(id, owner_id, title, done, created_at).','Starte eine Transaktion (START TRANSACTION), schließe sie mit COMMIT.','Zwei INSERT INTO tasks (owner_id, title) VALUES … mit ausdrücklicher Spaltenliste.','UPDATE tasks SET done = 1 für alle offenen Aufgaben von owner_id = 7.','DELETE FROM tasks für erledigte Aufgaben, die vor 2026-01-01 angelegt wurden.','UPDATE und DELETE ohne WHERE sind gefährlich: Jede Anweisung bekommt eine Bedingung.'],
    starter:L('-- Schreibe hier dein Skript','',''),
    rules:[
      need('START TRANSACTION',/\bSTART\s+TRANSACTION\b|\bBEGIN\b/i),
      need('zwei INSERTs mit Spaltenliste',/\bINSERT\s+INTO\s+tasks\s*\(\s*owner_id\s*,\s*title\s*\)\s*VALUES[\s\S]*\bINSERT\s+INTO\s+tasks\s*\(\s*owner_id\s*,\s*title\s*\)\s*VALUES|\bINSERT\s+INTO\s+tasks\s*\(\s*owner_id\s*,\s*title\s*\)\s*VALUES\s*\([^)]*\)\s*,\s*\([^)]*\)/i),
      need('UPDATE tasks SET done = 1 WHERE owner_id = 7 AND done = 0',/\bUPDATE\s+tasks\s+SET\s+done\s*=\s*1\s+WHERE\s+(?:owner_id\s*=\s*7\s+AND\s+done\s*=\s*0|done\s*=\s*0\s+AND\s+owner_id\s*=\s*7)/i),
      need('DELETE FROM tasks WHERE done = 1 AND created_at < \'2026-01-01\'',/\bDELETE\s+FROM\s+tasks\s+WHERE\s+(?:done\s*=\s*1\s+AND\s+created_at\s*<\s*['"]2026-01-01['"]|created_at\s*<\s*['"]2026-01-01['"]\s+AND\s+done\s*=\s*1)/i),
      need('COMMIT',/\bCOMMIT\b/i),
      bad(/\b(?:UPDATE|DELETE)\b(?:(?!\bWHERE\b)[^;])*;/i,'UPDATE und DELETE ohne WHERE treffen alle Zeilen. Ergänze eine Bedingung.'),
      bad(/\bINSERT\s+INTO\s+tasks\s+VALUES\b/i,'Gib bei INSERT die Spalten an. Sonst bricht der Code, sobald die Tabelle eine Spalte bekommt.'),
      bad(/\bTRUNCATE\b|\bDROP\b/i,'TRUNCATE und DROP sind hier nicht gewünscht – lösche gezielt mit DELETE ... WHERE.')
    ],
    solution:L('START TRANSACTION;','','INSERT INTO tasks (owner_id, title) VALUES (7, \'SQL wiederholen\');','INSERT INTO tasks (owner_id, title) VALUES (7, \'Join üben\');','','UPDATE tasks SET done = 1 WHERE owner_id = 7 AND done = 0;','','DELETE FROM tasks WHERE done = 1 AND created_at < \'2026-01-01\';','','COMMIT;'),
    hint:'Gehört etwas zusammen, packst du es in eine Transaktion. Und jedes UPDATE und DELETE bekommt zuerst sein WHERE – dann erst das Semikolon.',
    why:'Eine Transaktion macht mehrere Änderungen zu einer Einheit: alles oder nichts. Ein vergessenes WHERE ist einer der teuersten Tippfehler der Datenbankwelt.'}
];
W.add('sql',tasks);
W.add('sql',[
{id:'sql-w3',modules:['m5','m6'],level:'schwer',type:'write',language:'sql',rows:30,
  title:'Tabelle normalisieren (3. Normalform)',
  text:'Gegeben ist die unnormalisierte Tabelle bestellung(bestell_id, kunde_name, kunde_ort, produkt_name, produkt_preis_cent, menge). Zerlege sie in vier Tabellen der dritten Normalform.',
  details:['kunde(kunde_id, name, ort) mit Primärschlüssel kunde_id.','produkt(produkt_id, name, preis_cent) mit Primärschlüssel produkt_id.','bestellung(bestell_id, kunde_id) mit Primärschlüssel bestell_id und Fremdschlüssel auf kunde.','bestellposition(bestell_id, produkt_id, menge) mit zusammengesetztem Primärschlüssel (bestell_id, produkt_id) und Fremdschlüsseln auf bestellung und produkt.','Kein Name, Ort oder Preis darf in bestellung oder bestellposition stehen (sonst wiederholen sich Daten). Schreibe nur CREATE TABLE-Anweisungen (MariaDB).'],
  starter:L('-- Schreibe hier deine CREATE TABLE-Anweisungen','',''),
  rules:[
    need('CREATE TABLE kunde mit Primärschlüssel kunde_id',/CREATE\s+TABLE\s+kunde\b[^;]*\bkunde_id\b[^;]*PRIMARY\s+KEY\b/i),
    need('CREATE TABLE produkt mit Primärschlüssel produkt_id',/CREATE\s+TABLE\s+produkt\b[^;]*\bprodukt_id\b[^;]*PRIMARY\s+KEY\b/i),
    need('produkt enthält name und preis_cent',/CREATE\s+TABLE\s+produkt\b[^;]*\bname\b[^;]*\bpreis_cent\b/i),
    need('CREATE TABLE bestellung mit Primärschlüssel bestell_id',/CREATE\s+TABLE\s+bestellung\b[^;]*\bbestell_id\b[^;]*PRIMARY\s+KEY\b/i),
    need('bestellung verweist auf kunde',/CREATE\s+TABLE\s+bestellung\b[^;]*FOREIGN\s+KEY\s*\(\s*kunde_id\s*\)\s*REFERENCES\s+kunde\s*\(\s*kunde_id\s*\)/i),
    need('CREATE TABLE bestellposition mit zusammengesetztem Schlüssel',/CREATE\s+TABLE\s+bestellposition\b[^;]*PRIMARY\s+KEY\s*\(\s*bestell_id\s*,\s*produkt_id\s*\)/i),
    need('bestellposition verweist auf bestellung und produkt',/CREATE\s+TABLE\s+bestellposition\b[^;]*REFERENCES\s+bestellung\s*\(\s*bestell_id\s*\)[^;]*REFERENCES\s+produkt\s*\(\s*produkt_id\s*\)/i),
    need('menge in bestellposition',/CREATE\s+TABLE\s+bestellposition\b[^;]*\bmenge\b/i),
    bad(/CREATE\s+TABLE\s+bestell(?:ung|position)\b[^;]*\b(?:kunde_name|kunde_ort|produkt_name|produkt_preis_cent|preis_cent|ort)\b/i,'Diese Angabe gehört in kunde oder produkt: In der Bestellung würde sie sich bei jeder Zeile wiederholen (Update-Anomalie).'),
    bad(/\bprimary\s+key\b[^;]*\bfloat\b|\bpreis_cent\s+(?:float|double|decimal)\b/i,'Geld bleibt in ganzen Cent (INT), nicht in Gleitkommazahlen.')
  ],
  solution:L('CREATE TABLE kunde (','  kunde_id INT NOT NULL AUTO_INCREMENT,','  name VARCHAR(100) NOT NULL,','  ort VARCHAR(100) NOT NULL,','  PRIMARY KEY (kunde_id)',');','','CREATE TABLE produkt (','  produkt_id INT NOT NULL AUTO_INCREMENT,','  name VARCHAR(100) NOT NULL,','  preis_cent INT NOT NULL,','  PRIMARY KEY (produkt_id)',');','','CREATE TABLE bestellung (','  bestell_id INT NOT NULL AUTO_INCREMENT,','  kunde_id INT NOT NULL,','  PRIMARY KEY (bestell_id),','  FOREIGN KEY (kunde_id) REFERENCES kunde (kunde_id)',');','','CREATE TABLE bestellposition (','  bestell_id INT NOT NULL,','  produkt_id INT NOT NULL,','  menge INT NOT NULL,','  PRIMARY KEY (bestell_id, produkt_id),','  FOREIGN KEY (bestell_id) REFERENCES bestellung (bestell_id),','  FOREIGN KEY (produkt_id) REFERENCES produkt (produkt_id)',');'),
  hint:'Jede Tatsache steht genau einmal: Kundenname nur beim Kunden, Preis nur beim Produkt. Die Verbindung läuft über Fremdschlüssel.',
  why:'Die dritte Normalform vermeidet Anomalien: Ändert sich ein Preis oder Ort, wird er an einer Stelle geändert. Die Positionstabelle löst die n:m-Beziehung zwischen Bestellung und Produkt auf.'}
]);
})();
