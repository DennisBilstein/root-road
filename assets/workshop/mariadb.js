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
})();
