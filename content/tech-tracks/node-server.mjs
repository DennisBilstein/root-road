// Node.js · Server, Daten, Tests und Betrieb. Stichtag 14.11.2026.
// Eigene Texte; Code und Tests liegen unter content/examples/node-lab/ (Node.js 22.23 lokal, 24.22 im Container, node:test).
// Die offiziellen Dokumentationen werden nur verlinkt, nichts daraus kopiert.
const lab = 'content/examples/node-lab/';
const docs = (title, url, note = 'Offizielle Dokumentation; Inhalt hier eigenständig zusammengefasst.') => ({ title, url, note });
const api = (title, page) => docs(title, `https://nodejs.org/api/${page}`);

export const module = {
  id: 'node-m2', course: 'node', part: 29, partTitle: 'Node.js · Laufzeit, Module und Server',
  title: 'Node.js in der Praxis · Server, Daten, Tests und Betrieb',
};

export const lessons = [
  {
    id: 'node-m2-l1', title: 'HTTP-Server mit node:http: Routing, Statuscodes und Eingaben prüfen', minutes: 55,
    prerequisites: 'Modul node-m1 (Event Loop, Module, Asynchronität, Dateien) und Grundwissen über HTTP (Modul net-m1).',
    objectives: [
      'Einen kleinen JSON-Server nur mit node:http bauen: Routen, Methoden, Statuscodes und Header',
      'Den Body einer Anfrage mit Größenlimit lesen und Content-Type sowie Inhalt prüfen',
      'Zwischen 400, 404, 405, 413, 415, 422 und 500 unterscheiden und nützliche Fehlermeldungen ohne interne Details liefern',
      'Den Server in Tests auf einem freien Port starten und mit fetch prüfen',
    ],
    simple: `Ein HTTP-Server nimmt Anfragen entgegen und schickt Antworten. In Node.js erzeugt createServer eine Funktion, die für jede Anfrage aufgerufen wird: Sie bekommt req (Anfrage) und res (Antwort). Methode, Pfad, Header und Body stecken in req; du schreibst Statuscode, Header und Body in res.

Frameworks wie Express nehmen dir Routing und Body-Lesen ab. Für das Verständnis lohnt es sich, einmal ohne zu arbeiten: Dann siehst du, was ein Framework eigentlich tut, und kannst später besser entscheiden, ob du eins brauchst. Dieser Server hat eine kleine Routentabelle, einen eigenen Fehlertyp (HttpError) und eine Stelle, an der alle Fehler gesammelt in Antworten übersetzt werden.

Das Wichtigste ist die Disziplin bei Eingaben. Alles, was von außen kommt, ist unzuverlässig: Größe, Typ, Format und Inhalt. Der Server prüft deshalb der Reihe nach, wie es ein Pförtner täte: Gibt es die Route (404)? Passt die Methode (405)? Ist der Inhaltstyp JSON (415)? Ist der Body klein genug (413)? Ist er überhaupt gültiges JSON (400)? Stimmen die Felder (422)?

Fehlermeldungen sollen dem Aufrufer helfen, nicht dem Angreifer. Bei erwarteten Fehlern nennt der Server den Grund in einem Satz. Bei einem unerwarteten Fehler (500) steht in der Antwort nur „Interner Fehler“; Details gehören ins Protokoll auf dem Server.`,
    steps: [
      'createApp gibt einen Server zurück, startet ihn aber nicht. Wer listen aufruft, bestimmt Port und Adresse. In Tests wird Port 0 benutzt, dann wählt das Betriebssystem einen freien Port.',
      'Die Routentabelle enthält Methode, Muster (regulärer Ausdruck) und Handler. Ein Handler liefert Status, Body und optional Header zurück; senden tut nur eine einzige Funktion (send). So gibt es einen Ort für Standard-Header.',
      'JSON_HEADERS setzt content-type mit Zeichensatz, x-content-type-options: nosniff (Browser sollen den Typ nicht raten) und cache-control: no-store, damit Antworten nicht zwischengespeichert werden.',
      'readBody sammelt die Chunks und bricht ab, sobald mehr als MAX_BODY Bytes ankommen. Gemessen wird in Bytes, nicht in Zeichen. Ohne Limit könnte ein einziger Client den Speicher füllen.',
      'readJsonBody prüft den Content-Type (415) und parst den Text. Ein Syntaxfehler wird zu 400 mit einer klaren Meldung; die Meldung des Parsers wird nicht durchgereicht.',
      'validateNewTask prüft Typ, Form und Länge: Objekt erwartet, title ein Text mit 1 bis 120 Zeichen nach trim. Alles andere ist 422 (formal gültig, inhaltlich nicht verarbeitbar).',
      'Gibt es das Muster, aber nicht die Methode, antwortet der Server mit 405 und dem Header allow. Das ist genauer als 404, weil der Aufrufer erfährt, was erlaubt ist.',
      'Im catch-Block unterscheidet der Server HttpError (erwartet) von allem anderen (500). Bei 500 wird nur error.message ins Log geschrieben, nicht der Body der Anfrage, und der Client sieht nur „Interner Fehler“.',
    ],
    background: `Warum nicht einfach alles mit 400 beantworten? Statuscodes sind eine Sprache, die Clients, Proxys und Monitoring verstehen. 4xx heißt „der Aufrufer sollte etwas ändern“, 5xx heißt „der Server hat versagt“. Wer Fehler des Aufrufers als 500 meldet, löst falschen Alarm aus; wer Serverfehler als 400 meldet, versteckt echte Probleme. Eine Alarmierung, die auf 5xx hört, funktioniert nur, wenn das stimmt.

Warum prüfen, was schon ein Framework prüfen würde? Weil du lernst, welche Entscheidungen dahinterstehen. Frameworks haben Voreinstellungen, die zum Teil unpassend sind (zum Beispiel ein großzügiges Body-Limit). Wer die Regeln kennt, setzt sie bewusst.

Zum Thema Sicherheit: Der Server baut aus der Anfrage nie SQL, Dateipfade oder Befehle, sondern prüft und kopiert nur ausgewählte Felder (hier: title). Mehr Felder in der Eingabe werden ignoriert, damit niemand zum Beispiel id oder done vorgeben kann (Mass Assignment). Der Server ist außerdem ein Lehrbeispiel: Es fehlen Anmeldung, TLS, Rate Limiting und Protokollierung der Anfragen; dafür gelten die Lektionen des Kurses Web-Sicherheit.`,
    terms: [
      { term: 'req / res', text: 'Anfrage- und Antwortobjekt, das Node.js für jede Anfrage übergibt.' },
      { term: 'Statuscode', text: 'Dreistellige Zahl: 2xx Erfolg, 4xx Fehler des Aufrufers, 5xx Fehler des Servers.' },
      { term: '413 / 415 / 422', text: 'Zu großer Body / falscher Inhaltstyp / formal gültig, aber inhaltlich ungültig.' },
      { term: 'nosniff', text: 'Header, der Browser davon abhält, den Inhaltstyp zu raten.' },
      { term: 'Mass Assignment', text: 'Angreifer setzt Felder, die er nicht setzen dürfte, weil der Server alle Eingabefelder übernimmt.' },
    ],
    code: { file: lab + 'src/server/app.js', lang: 'JavaScript' },
    code2: { file: lab + 'tests/server.test.js', lang: 'JavaScript' },
    order: ['body', 'code', 'code2', 'body2'],
    output: `Antworten des Servers (Node 22.23, echte Anfragen mit fetch):
POST /tasks  {"title":"Lernen"}         201 {"id":1,"title":"Lernen","done":false}  Location: /tasks/1
GET  /tasks/1                           200 {"id":1,"title":"Lernen","done":false}
POST /tasks  Body "{"                   400 {"error":"Body ist kein gültiges JSON"}
POST /tasks  ohne Content-Type          415 {"error":"Content-Type muss application/json sein"}
POST /tasks  {"title":" "}              422 {"error":"title braucht 1 bis 120 Zeichen"}
POST /tasks  Titel mit 2000 Zeichen     413 {"error":"Body größer als 1024 Bytes"}
PUT  /tasks                             405 {"error":"Methode nicht erlaubt"}  Allow: GET, POST
GET  /nichts                            404 {"error":"Pfad unbekannt"}
DELETE /tasks/1                         204 (kein Body)
GET  /tasks/1                           404 {"error":"Aufgabe nicht gefunden"}`,
    mistakes: [
      { wrong: 'req.on("data") ohne Größenlimit und mit unbegrenztem Zusammenfügen.', why: 'Ein einzelner Client kann so den Speicher des Prozesses füllen (Denial of Service).', fix: 'Gesamtgröße mitzählen und mit 413 abbrechen, sobald das Limit überschritten ist.' },
      { wrong: 'Den ganzen Body-Inhalt in die Datenbank oder ein Objekt kopieren: { ...input }.', why: 'Angreifer können Felder setzen, die nicht vorgesehen sind (id, Rolle, Status).', fix: 'Nur bekannte Felder einzeln übernehmen und prüfen (validateNewTask).' },
      { wrong: 'Fehlermeldungen oder Stacktraces an den Client schicken.', why: 'Sie verraten Pfade, Bibliotheken und Aufbau und helfen bei Angriffen.', fix: 'Dem Client eine kurze, stabile Meldung geben und Details nur im Server-Log festhalten.' },
      { wrong: 'Auf jede Anfrage mit 200 antworten und den Fehler im Body kodieren.', why: 'Clients, Caches und Überwachung verlassen sich auf den Statuscode.', fix: 'Passenden Statuscode setzen (2xx, 4xx, 5xx) und im Body den Grund nennen.' },
    ],
    practice: 'Setze für jeden Server als Erstes Body-Limit, Content-Type-Prüfung, eine zentrale Fehlerbehandlung mit klarer Trennung von erwarteten und unerwarteten Fehlern und Standard-Header. Teste jeden Statuscode mit einem echten Aufruf gegen einen Server auf Port 0.',
    exercises: [
      { task: 'Füge die Route PATCH /tasks/:id hinzu, die done auf true setzt. Schreibe Tests für Erfolg und für eine unbekannte id.', acceptance: 'Erfolg liefert 200 mit dem geänderten Objekt, unbekannte id 404; bestehende Tests bleiben grün.' },
      { task: 'Grenzfall: Teste die Titellängen 0, 1, 120 und 121 sowie Titel aus 60, 61 und 300 Emojis. Welche Statuscodes erwartest du, und warum?', acceptance: '0 und 121 ergeben 422, 1 und 120 gelingen (201). 60 Emojis zählen als 120 Einheiten (201), 61 als 122 (422); 300 Emojis überschreiten das Body-Limit von 1024 Bytes (413). Du erklärst, dass length UTF-16-Einheiten zählt und das Limit Bytes.' },
      { task: 'Fehlerfall: Lass einen Handler absichtlich einen TypeError werfen. Was sieht der Client, was steht im Log?', acceptance: 'Der Client erhält 500 mit „Interner Fehler“, das Log enthält die Meldung des Fehlers; es erscheint weder ein Stacktrace noch der Body der Anfrage in der Antwort.' },
    ],
    quiz: [
      { q: 'Ein Client schickt gültiges JSON, aber ohne Feld title. Welcher Statuscode passt am besten?',
        options: ['400', '422', '500', '200'],
        correct: 1,
        rationales: ['400 meldet hier ein Problem mit der Syntax, etwa kaputtes JSON; im Lab ist das der Fall „kein gültiges JSON“.', 'Die Anfrage ist formal gültig, aber inhaltlich nicht verarbeitbar; das Lab nutzt dafür 422.', '500 wäre ein Fehler des Servers, hier liegt der Fehler beim Aufrufer.', '200 würde einen Erfolg melden, der keiner ist.'],
        explain: 'Syntaxfehler sind 400, formal gültige, aber inhaltlich falsche Daten 422 (so im Lab; manche APIs nutzen für beides 400).' },
      { q: 'Warum zählt readBody die Bytes mit und bricht ab, statt den Body einfach zu sammeln?',
        options: ['Damit der Server schneller antwortet, weil weniger Daten gelesen werden.', 'Damit kein Client den Speicher mit einem riesigen Body füllen kann.', 'Damit der gesendete JSON-Text gültig und vollständig bleibt.', 'Damit der Content-Type der Antwort zum Inhalt passt.'],
        correct: 1,
        rationales: ['Das Limit dient dem Schutz, nicht der Geschwindigkeit.', 'Ohne Limit genügt eine große Anfrage, um den Prozess zu überlasten.', 'Die Gültigkeit wird später beim Parsen geprüft.', 'Der Content-Type wird vorher geprüft.'],
        explain: 'Ein Body-Limit schützt vor Speicherüberlastung; bei Überschreitung antwortet der Server mit 413.' },
      { q: 'Was sollte ein Client bei einem unerwarteten Serverfehler (500) in der Antwort sehen?',
        options: ['Den vollständigen Stacktrace, damit er helfen kann.', 'Eine kurze allgemeine Meldung; Details stehen nur im Log des Servers.', 'Die Zugangsdaten der Datenbank.', 'Nichts, die Verbindung bleibt offen.'],
        correct: 1,
        rationales: ['Stacktraces verraten interne Details und helfen Angreifern.', 'So bleibt die Antwort stabil und sicher, und das Team findet die Ursache im Log.', 'Zugangsdaten dürfen nie in Antworten stehen.', 'Der Client braucht eine Antwort, sonst wartet er bis zum Zeitlimit.'],
        explain: 'Interne Details gehören ins Server-Log, nicht in die Antwort.' },
    ],
    sources: [
      api('Node.js: HTTP', 'http.html'),
      docs('MDN: HTTP-Statuscodes', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status', 'Übersicht der Codes mit Bedeutung; Inhalt hier eigenständig zusammengefasst.'),
      docs('OWASP: REST Security Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html', 'Hinweise zu Eingabevalidierung und Statuscodes; Inhalt hier eigenständig zusammengefasst.'),
    ],
    verification: 'Lab node-lab: Alle gezeigten Statuscodes (200, 201, 204, 400, 404, 405, 413, 415, 422) wurden mit echten Anfragen gegen den Server auf Node.js 22.23 beobachtet; die Tests laufen auch auf 24.22. Nicht geprüft: Last, Keep-Alive-Zeitlimits, TLS, Anmeldung und Verhalten hinter einem Proxy.',
  },
  {
    id: 'node-m2-l2', title: 'Daten und Konfiguration: SQLite, Migrationen, Umgebungsvariablen', minutes: 50,
    prerequisites: 'Lektion „HTTP-Server“ (node-m2-l1); SQL-Grundlagen (Modul sql-m1) sind hilfreich.',
    objectives: [
      'Mit node:sqlite eine Datenbank öffnen, Tabellen per Migration anlegen und Daten mit Platzhaltern lesen und schreiben',
      'Transaktionen einsetzen, damit zusammengehörige Schritte entweder ganz oder gar nicht geschehen',
      'Erklären, warum String-Verkettung zu SQL-Injection führt und Platzhalter nicht',
      'Konfiguration aus Umgebungsvariablen lesen, prüfen und bei Fehlern mit klaren Meldungen abbrechen',
    ],
    simple: `Node.js bringt seit Version 22.5 ein Modul für SQLite mit: node:sqlite. SQLite ist eine Datenbank in einer einzigen Datei, ohne eigenen Server. Das passt für kleine Dienste, Werkzeuge und Tests. Das Modul ist synchron: Eine Abfrage hält den Thread an, bis sie fertig ist. Bei kleinen Abfragen ist das unproblematisch; bei großen sollte man sich Gedanken machen. Zum Stichtag erscheint auf Node 22.23 eine Warnung, dass das Modul „experimental“ ist; die aktuelle Dokumentation führt es als Release Candidate. Prüfe vor dem Einsatz, ob das für dein Projekt reicht.

Eine Datenbank verändert sich im Lauf eines Projekts. Eine Migration ist ein nummerierter Schritt, der das Schema von Version n auf n+1 hebt. Das Lab merkt sich den Stand in PRAGMA user_version und führt nur noch fehlende Migrationen aus, jede in einer Transaktion. Dadurch laufen Migrationen genau einmal, auch bei Neustarts.

Die wichtigste Sicherheitsregel für Datenbanken: Daten und SQL niemals vermischen. Mit Platzhaltern (?) bekommt die Datenbank den Befehl und die Werte getrennt; die Werte werden nie als SQL gelesen. Wer Eingaben in den SQL-Text einsetzt, öffnet SQL-Injection. Das Lab zeigt beide Varianten nebeneinander.

Konfiguration (Port, Umgebung, Datenbankdatei, Geheimnisse) kommt aus Umgebungsvariablen, nicht aus dem Code. loadConfig liest sie, prüft sie und liefert entweder eine Konfiguration oder eine Liste verständlicher Fehler. Das Programm bricht beim Start ab, wenn etwas fehlt, statt später mit halber Konfiguration zu laufen.`,
    steps: [
      'openDatabase öffnet die Datei (oder :memory:) und liest PRAGMA user_version. Die Liste MIGRATIONS enthält jeden Schritt als SQL-Text; ausgeführt werden nur die Einträge ab dem aktuellen Stand.',
      'Jede Migration läuft in BEGIN … COMMIT. Schlägt sie fehl, gibt ROLLBACK den alten Stand zurück und der Fehler wird weitergeworfen. Die Versionsnummer wird in derselben Transaktion erhöht.',
      'Die Tabelle hat eine CHECK-Regel für die Länge des Titels. Die Datenbank prüft also selbst und lehnt ungültige Daten ab, auch wenn eine andere Stelle im Code die Prüfung vergisst (zusätzliche Sicherung, nicht Ersatz für die Prüfung im Server).',
      'createRepository bereitet die Befehle einmal mit prepare vor und führt sie mit run, get und all aus. Ergebnisse werden in einfache Objekte umgewandelt (plain), damit der Rest des Codes nicht von Datenbanktypen abhängt.',
      'searchTitle maskiert die Zeichen %, _ und \\ im Suchtext, weil sie in LIKE besondere Bedeutung haben. Ohne das fände die Suche nach "%" alle Einträge.',
      'addMany nutzt eine Transaktion: Ein ungültiger Titel in der Mitte macht den ganzen Aufruf rückgängig. Nach dem Fehlschlag bleibt die Zahl der Einträge unverändert.',
      'unsafeSearch ist absichtlich unsicher. Mit dem Suchtext x\' OR \'1\'=\'1 liefert es alle Einträge; searchTitle mit derselben Eingabe findet nichts.',
      'loadConfig sammelt alle Fehler in einer Liste, statt beim ersten aufzuhören. Der Wert des Geheimnisses steht nie in einer Meldung; die Konfiguration enthält nur hasSecret. envFrom liest .env-Text mit util.parseEnv, echte Umgebungsvariablen haben Vorrang.',
    ],
    background: `Warum Migrationen statt „Tabelle von Hand anlegen“? Weil Datenbanken mit dem Code mitwachsen und in mehreren Umgebungen (Entwicklung, Test, Produktion) liegen. Eine Liste nummerierter Schritte macht den Stand nachvollziehbar und reproduzierbar. Größere Projekte nutzen Werkzeuge wie Flyway oder Liquibase (siehe Java-Modul); die Grundidee ist dieselbe wie hier.

Warum Platzhalter wirksam sind: Die Datenbank parst zuerst den SQL-Text, die Struktur ist damit festgelegt, und die Werte kommen danach als Daten. Ein Wert wie x' OR '1'='1 ist dann nur ein Text, der gesucht wird. Das gilt für Werte, nicht für Tabellen- oder Spaltennamen; diese dürfen nie aus Nutzereingaben stammen, sondern müssen aus einer festen Liste kommen.

Geheimnisse in der Konfiguration: Sie gehören in Umgebungsvariablen oder einen Secret-Store, nie ins Repository. Eine .env-Datei ist eine Bequemlichkeit für die Entwicklung und gehört in .gitignore. Der Test zeigt, dass Fehlermeldungen das Geheimnis nicht enthalten: Meldungen landen in Logs, und Logs werden weitergegeben.`,
    terms: [
      { term: 'Migration', text: 'Nummerierter Schritt, der das Datenbankschema verändert.' },
      { term: 'Prepared Statement', text: 'Vorbereiteter SQL-Befehl mit Platzhaltern für die Werte.' },
      { term: 'Transaktion', text: 'Mehrere Schritte, die ganz oder gar nicht wirksam werden.' },
      { term: 'SQL-Injection', text: 'Eingabe, die als SQL-Befehl gelesen wird, weil sie in den Text eingesetzt wurde.' },
      { term: 'Umgebungsvariable', text: 'Einstellung, die dem Prozess von außen mitgegeben wird.' },
    ],
    code: { file: lab + 'src/data/db.js', lang: 'JavaScript' },
    code2: { file: lab + 'src/data/config.js', lang: 'JavaScript' },
    order: ['body', 'code', 'code2', 'body2'],
    output: `Datenbank (Node 22.23): PRAGMA user_version -> 2 nach zwei Migrationen
unsafeSearch('Steuer')              -> 1 Treffer
unsafeSearch("x' OR '1'='1")        -> 3 Treffer  (alle Einträge: Injection)
searchTitle("x' OR '1'='1")         -> 0 Treffer  (Platzhalter)
searchTitle('%')                    -> 0 Treffer  (Sonderzeichen maskiert)
addMany(['ok', ''])                 -> Fehler: CHECK constraint failed: length(title) BETWEEN 1 AND 120
Einträge nach dem Fehlschlag        -> 3 (die Transaktion wurde zurückgerollt)

loadConfig({})                      -> { port: 8080, nodeEnv: 'development', dbPath: ':memory:', hasSecret: false }
loadConfig({ PORT: '70000', NODE_ENV: 'prod' }) -> 2 Fehler (PORT, NODE_ENV)
loadConfig({ NODE_ENV: 'production', SESSION_SECRET: 'kurz' }) -> DB_PATH Pflicht; SESSION_SECRET zu kurz (der Wert wird nicht genannt)

Beim Import von node:sqlite auf 22.23: ExperimentalWarning: SQLite is an experimental feature and might change at any time`,
    mistakes: [
      { wrong: 'SQL mit Template-String zusammensetzen: `... WHERE name = \'${name}\'`.', why: 'Die Eingabe wird als SQL gelesen; ein Angreifer ändert die Abfrage (SQL-Injection).', fix: 'Immer Platzhalter (?) verwenden; Tabellen- und Spaltennamen aus fester Liste wählen.' },
      { wrong: 'Zusammengehörige Änderungen ohne Transaktion ausführen.', why: 'Bricht der zweite Schritt ab, bleibt der erste bestehen und die Daten sind inkonsistent.', fix: 'BEGIN/COMMIT/ROLLBACK oder eine Hilfsfunktion, die Transaktionen kapselt.' },
      { wrong: 'Geheimnisse (Schlüssel, Passwörter) in Code, Repository oder Fehlermeldungen.', why: 'Sie gelangen in Versionsverwaltung, Logs und Backups und sind danach schwer zurückzuholen.', fix: 'In Umgebungsvariablen oder einem Secret-Store halten; Meldungen nennen nur den Namen der Variable.' },
      { wrong: 'Fehlende Konfiguration stillschweigend durch Standardwerte ersetzen, auch in Produktion.', why: 'Ein Server mit Speicher-Datenbank oder ohne Schlüssel läuft scheinbar, verliert aber Daten oder ist unsicher.', fix: 'In Produktion Pflichtwerte verlangen und beim Start mit klarer Meldung abbrechen.' },
    ],
    practice: 'Lege jeden Schemaschritt als Migration an, nutze ausschließlich Platzhalter und prüfe die Konfiguration beim Start mit einer einzigen Funktion, die alle Fehler auf einmal meldet. Halte Geheimnisse aus Repository und Logs heraus.',
    exercises: [
      { task: 'Füge eine dritte Migration hinzu, die der Tabelle eine Spalte created_at (TEXT) gibt. Schreibe einen Test, der prüft, dass user_version 3 ist und die alte Datei nach dem Öffnen migriert wird.', acceptance: 'Eine mit Version 2 angelegte Datei wird beim Öffnen auf 3 gehoben, ohne dass Daten verloren gehen; ein zweites Öffnen führt nichts mehr aus.' },
      { task: 'Grenzfall: Was passiert bei searchTitle("") und bei searchTitle("_")? Ergänze Tests, die das Verhalten festhalten.', acceptance: 'Die leere Suche findet alle Einträge, "_" nur Titel mit einem Unterstrich; du erklärst, warum die Maskierung nötig ist.' },
      { task: 'Fehlerfall: Setze in loadConfig SESSION_SECRET testweise in die Fehlermeldung ein und beschreibe, wo der Wert danach überall auftauchen könnte. Mache es rückgängig.', acceptance: 'Du nennst mindestens Protokolle, Fehlerüberwachung und Bildschirmfotos als Verbreitungswege und bestätigst, dass der Test mit hasSecret weiter grün ist.' },
    ],
    quiz: [
      { q: 'Warum schützt ein Platzhalter (?) vor SQL-Injection, String-Verkettung aber nicht?',
        options: ['Platzhalter verschlüsseln den Wert.', 'Die Datenbank bekommt SQL und Werte getrennt; der Wert wird nie als SQL gelesen.', 'Platzhalter sind schneller.', 'String-Verkettung ist in SQLite verboten.'],
        correct: 1,
        rationales: ['Es findet keine Verschlüsselung statt.', 'Die Struktur des Befehls steht fest, bevor die Werte eingesetzt werden.', 'Geschwindigkeit ist nicht der Grund.', 'Sie ist erlaubt, aber unsicher.'],
        explain: 'Trennung von Befehl und Daten ist der Kern des Schutzes.' },
      { q: 'Wozu dient PRAGMA user_version im Lab?',
        options: ['Es speichert den Stand der Migrationen, damit jede nur einmal läuft.', 'Es zeigt die Version von Node.js an.', 'Es ändert die Zeichenkodierung.', 'Es sperrt die Datei für andere Prozesse.'],
        correct: 0,
        rationales: ['Die Nummer wird nach jeder erfolgreichen Migration erhöht und beim Start gelesen.', 'Mit Node.js hat es nichts zu tun.', 'Die Kodierung bleibt unberührt.', 'Sperren steuert es nicht.'],
        explain: 'Der Wert steht in der Datenbankdatei und merkt sich den Schemastand.' },
      { q: 'Warum nennt die Fehlermeldung bei zu kurzem SESSION_SECRET nur den Namen der Variable, nicht ihren Wert?',
        options: ['Aus Platzgründen, damit die Fehlermeldung kurz bleibt.', 'Weil Meldungen in Protokolle gelangen und dort keine Geheimnisse stehen sollen.', 'Weil Node.js den Inhalt von Umgebungsvariablen nicht lesen kann.', 'Weil der Wert zu diesem Zeitpunkt immer leer ist.'],
        correct: 1,
        rationales: ['Der Platz ist nicht der Grund.', 'Was im Log steht, können viele Menschen und Systeme lesen.', 'Node.js liest Werte problemlos.', 'Er ist in diesem Fall gesetzt, nur zu kurz.'],
        explain: 'Geheimnisse gehören nicht in Meldungen, Logs oder Fehlerberichte.' },
    ],
    sources: [
      api('Node.js: SQLite (node:sqlite)', 'sqlite.html'),
      api('Node.js: util.parseEnv', 'util.html#utilparseenvcontent'),
      docs('SQLite: PRAGMA user_version', 'https://www.sqlite.org/pragma.html#pragma_user_version', 'Beschreibt user_version als frei nutzbare Zahl in der Datenbankdatei.'),
      docs('OWASP: SQL Injection Prevention Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html', 'Empfehlung: parametrisierte Abfragen; Inhalt hier eigenständig zusammengefasst.'),
    ],
    verification: 'Lab node-lab: Migrationen (user_version 2), CHECK-Regel, Transaktion mit Rollback, die SQL-Injection-Gegenüberstellung und loadConfig wurden mit Node.js 22.23 beobachtet; die Tests laufen auch mit 24.22 grün. Nicht geprüft: Verhalten bei vielen gleichzeitigen Schreibzugriffen, Sicherungen der Datenbankdatei und der Betrieb von node:sqlite in Produktion.',
  },
  {
    id: 'node-m2-l3', title: 'Testen mit node:test: Mocks, gesteuerte Zeit und testbarer Code', minutes: 50,
    prerequisites: 'Lektionen „Asynchrone Programmierung“ und „HTTP-Server“.',
    objectives: [
      'Tests mit node:test und node:assert/strict schreiben, gruppieren und überspringen',
      'Zeit mit mock.timers steuern, statt auf echte Wartezeiten zu warten',
      'Abhängigkeiten (Netzwerk, Zeit) so einbauen, dass sich Tests ohne Internet schreiben lassen',
      'Normal-, Grenz- und Fehlerfälle gezielt auswählen und zufällige Fehlschläge vermeiden',
    ],
    simple: `Node.js bringt einen Test-Runner mit: node --test. Du brauchst kein zusätzliches Paket. Tests sind Funktionen, die mit test oder it registriert werden. Mit node:assert/strict prüfst du Erwartungen: assert.equal für Gleichheit, assert.deepEqual für Strukturen, assert.throws und assert.rejects für Fehler. Der Strict-Modus vergleicht streng (kein „1 ist gleich '1'“).

Ein guter Test ist schnell, wiederholbar und unabhängig. Das bereitet Probleme, sobald Code von Zeit oder Netzwerk abhängt: Ein Cache, der nach einer Minute abläuft, soll nicht 60 Sekunden dauern; ein Wechselkurs-Abruf soll im Test kein echtes Internet brauchen. Dafür gibt es zwei Techniken. Erstens lässt sich die Zeit steuern (mock.timers): Du stellst die Uhr vor, und der Code „erlebt“ eine Minute in einem Augenblick. Zweitens reichst du Abhängigkeiten herein: getRate bekommt fetch als Parameter und nutzt normalerweise das echte fetch; im Test übergibst du eine Attrappe.

Zufällige Fehlschläge („flaky tests“) entstehen durch echte Zeit, Reihenfolge-Annahmen und gemeinsame Zustände. Gegenmittel: Zeit steuern, Zustand pro Test neu anlegen und nichts voraussetzen, was nicht festgelegt ist (siehe Lektion 1: Timer gegen Immediate).

Wähle Testfälle nach einem festen Schema: ein Normalfall, Grenzfälle an den Rändern (0, 1, Maximum, Maximum + 1, genau abgelaufen) und Fehlerfälle (ungültige Eingabe, Fehlerstatus, kaputte Antwort).`,
    steps: [
      'TtlCache braucht Date.now(). Im Test schaltet mock.timers.enable({ apis: ["Date"], now: 1000 }) die Uhr auf einen festen Wert. mock.timers.tick(99) stellt sie um 99 ms weiter.',
      'Der Grenzfall steht im Test: Nach 99 ms ist der Eintrag noch da, nach genau 100 ms ist er abgelaufen. Solche Randwerte sind die häufigste Quelle für Fehler und gehören in jeden Test.',
      't.after(() => mock.timers.reset()) räumt auf. Wer die Uhr nicht zurücksetzt, beeinflusst die folgenden Tests.',
      'debounce führt eine Funktion erst aus, wenn 300 ms lang kein neuer Aufruf kam. Der Test ersetzt setTimeout und prüft per tick(299) und tick(1), dass der Aufruf genau an der Grenze geschieht und nur mit dem letzten Argument.',
      'getRate bekommt fetchImpl und cache als Parameter. mock.fn erzeugt eine Attrappe, die aufzeichnet, wie oft und womit sie aufgerufen wurde (callCount, calls[0].arguments).',
      'Der Test „kodiert die Währung“ prüft, dass ein Wert wie "../x?y" nicht als Pfad oder Abfrage in die URL gelangt (encodeURIComponent). Eingaben in URLs müssen kodiert werden.',
      'Fehlerfälle: Antwort mit Statuscode 500, Antwort ohne Zahl und nicht-endliche Zahlen führen zu verständlichen Fehlern, nicht zu stillen Fehlwerten.',
      'mock.method ersetzt eine Methode vorübergehend. describe, it und skip gliedern und überspringen Tests.',
    ],
    background: `Warum die Abhängigkeit als Parameter hereinreichen, statt das Modul global zu ersetzen? Der Code bleibt ehrlich: Man sieht an der Signatur, was er braucht. Der Test ist einfacher, weil er nichts global verbiegen muss, und zwei Tests können nicht versehentlich dieselbe Attrappe teilen. mock.method ist trotzdem nützlich, wenn der Code nicht zu ändern ist.

Gesteuerte Zeit hat Grenzen. mock.timers ersetzt Date und die Timer-Funktionen; Code, der die Zeit anders bezieht (zum Beispiel über performance.now oder native Erweiterungen), merkt davon nichts. Das Lab steuert deshalb nur Date und setTimeout. Außerdem testet gesteuerte Zeit die Logik, nicht die echte Uhr: Ein Integrationstest mit echten Zeiten bleibt für wenige, wichtige Stellen sinnvoll.

Zur Abdeckung: Node kann Testabdeckung messen. Eine hohe Zahl heißt nur, dass Zeilen ausgeführt wurden, nicht, dass sie richtig geprüft wurden. Entscheidend sind gute Fälle an den Rändern. Die Messung selbst wurde in diesem Lab nicht ausgeführt.`,
    terms: [
      { term: 'node --test', text: 'Eingebauter Test-Runner von Node.js.' },
      { term: 'Mock', text: 'Attrappe, die ein echtes Objekt ersetzt und Aufrufe aufzeichnet.' },
      { term: 'mock.timers', text: 'Steuert Date und Timer im Test, ohne zu warten.' },
      { term: 'Grenzfall', text: 'Wert am Rand eines gültigen Bereichs (0, Maximum, Maximum + 1).' },
      { term: 'Flaky Test', text: 'Test, der mal besteht und mal nicht, ohne dass sich der Code ändert.' },
    ],
    code: { file: lab + 'src/testing/units.js', lang: 'JavaScript' },
    code2: { file: lab + 'tests/testing.test.js', lang: 'JavaScript' },
    order: ['body', 'code', 'code2', 'body2'],
    output: `node --test --test-reporter=spec tests/testing.test.js (Node 22.23)
 ✔ TtlCache mit gesteuerter Zeit
     ✔ liefert Werte bis zum Ablauf und danach undefined
     ✔ lehnt ungültige Laufzeiten ab
 ✔ debounce: nur der letzte Aufruf zählt
 ✔ getRate mit ersetztem fetch
     ✔ holt den Kurs einmal und danach aus dem Cache
     ✔ nutzt denselben Cache für denselben Schlüssel
     ✔ kodiert die Währung in der URL (kein Pfad-Einschleusen)
     ✔ meldet Fehlerstatus und kaputte Antworten verständlich
 ✔ mock.method ersetzt eine Methode vorübergehend
 ✔ Subtests und Überspringen (ein Beispiel wird mit skip übersprungen)

Ganzer Lab-Lauf: 49 Tests, 48 grün, 1 übersprungen (Node 22.23); auf Node 24.22 im Container 47 grün, 2 übersprungen (Tests laufen dort als root).`,
    mistakes: [
      { wrong: 'Im Test echte Zeit abwarten (await delay(60000)).', why: 'Tests werden langsam, die Pipeline dauert, und knappe Zeiten machen Tests unzuverlässig.', fix: 'mock.timers verwenden und die Uhr weiterstellen.' },
      { wrong: 'Tests gegen echte Dienste im Internet laufen lassen.', why: 'Sie scheitern bei Ausfall oder fehlendem Netz und belasten fremde Dienste.', fix: 'Abhängigkeit hereinreichen und im Test eine Attrappe übergeben.' },
      { wrong: 'mock.timers nicht zurücksetzen.', why: 'Andere Tests laufen mit einer angehaltenen Uhr und scheitern rätselhaft.', fix: 't.after(() => mock.timers.reset()) oder beforeEach/afterEach nutzen.' },
      { wrong: 'Nur den Erfolgsfall testen.', why: 'Die meisten Fehler entstehen bei Grenzwerten und Fehlern, nicht im Normalfall.', fix: 'Für jede Funktion Normal-, Grenz- und Fehlerfälle festlegen.' },
    ],
    practice: 'Plane Tests schon beim Schreiben des Codes: Was braucht die Funktion von außen? Reiche Zeit, Zufall und Netzwerk herein. Schreibe pro Funktion mindestens einen Normalfall, die Ränder und einen Fehlerfall, und lasse die Tests in der Pipeline bei jedem Commit laufen.',
    exercises: [
      { task: 'Schreibe retry-Tests (aus der Async-Lektion) mit gesteuerter Zeit, sodass die Wartezeiten 10, 20 und 40 ms nicht wirklich vergehen.', acceptance: 'Der Test prüft per Attrappe von sleep die Wartezeiten [10, 20, 40] und dauert unter 50 ms.' },
      { task: 'Grenzfall: Ergänze TtlCache-Tests für Einträge, die kurz vor und genau beim Ablauf überschrieben werden. Was gilt als Ablaufzeit nach set?', acceptance: 'Ein neues set setzt die Ablaufzeit neu; du formulierst dazu einen Test und erklärst die Entscheidung.' },
      { task: 'Fehlerfall: Lass getRate eine Antwort mit rate: "abc" bekommen. Was erwartest du, was passiert, und welcher Test hält es fest?', acceptance: 'Der Aufruf wirft „Antwort ohne gültigen Kurs“, im Cache landet nichts, und ein Test deckt es ab.' },
    ],
    quiz: [
      { q: 'Wie testet man einen Cache, der nach 60 Sekunden abläuft, ohne 60 Sekunden zu warten?',
        options: ['Man startet den Test nachts.', 'Man ersetzt die Uhr mit mock.timers und stellt sie weiter.', 'Man verkürzt die Zeit im Produktivcode.', 'Man testet es gar nicht.'],
        correct: 1,
        rationales: ['Das löst die Wartezeit nicht.', 'Date lässt sich im Test steuern, und tick stellt die Zeit sofort um.', 'Der Produktivcode soll sich nicht nach dem Test richten.', 'Der Ablauf ist ein Kernverhalten und sollte getestet werden.'],
        explain: 'Gesteuerte Zeit macht zeitabhängige Tests schnell und wiederholbar.' },
      { q: 'Wozu reicht getRate das fetch als Parameter herein?',
        options: ['Damit der Test ohne echtes Netzwerk mit einer Attrappe laufen kann.', 'Damit fetch schneller ist.', 'Damit der Cache entfällt.', 'Weil Node.js kein globales fetch hat.'],
        correct: 0,
        rationales: ['So kann der Test Aufrufe zählen und Fehler gezielt auslösen.', 'Es ändert die Geschwindigkeit nicht.', 'Der Cache bleibt bestehen.', 'Node.js hat ein globales fetch; es dient hier als Standardwert.'],
        explain: 'Hereingereichte Abhängigkeiten machen Tests unabhängig von Netzwerk und Fremddiensten.' },
      { q: 'Welche Testfälle prüfen einen Wert wie ttl = 100 ms am besten?',
        options: ['Nur ein Beispiel bei 50 ms.', 'Kurz davor (99 ms), genau am Rand (100 ms) und eine ungültige Laufzeit.', 'Nur 1000 ms.', 'Beliebige Zufallswerte.'],
        correct: 1,
        rationales: ['Ein Wert aus der Mitte zeigt nicht, ob der Rand richtig behandelt wird.', 'Grenz- und Fehlerfälle decken typische Verwechslungen wie < statt <= auf.', 'Ein einzelner Wert ist zu wenig.', 'Zufall macht Tests nicht wiederholbar.'],
        explain: 'Grenzfälle sind die häufigste Fehlerquelle; Zufallswerte machen Tests unzuverlässig.' },
    ],
    sources: [
      api('Node.js: Test Runner', 'test.html'),
      api('Node.js: Assert', 'assert.html'),
      docs('Node.js: Mocking Timers (mock.timers)', 'https://nodejs.org/api/test.html#timers', 'Abschnitt zu mock.timers im Test-Runner.'),
    ],
    verification: 'Lab node-lab: Alle 49 Tests laufen mit Node.js 22.23 und 24.22. mock.timers wurde für Date und setTimeout beobachtet; Testabdeckung (--experimental-test-coverage) wurde nicht ausgeführt, ebenso nicht der Watch-Modus.',
  },
  {
    id: 'node-m2-l4', title: 'Betrieb: Logging, sauberes Beenden, Worker Threads und Container', minutes: 55,
    prerequisites: 'Alle vorherigen Lektionen des Kurses; Grundwissen zu Docker (Modul docker-m1) ist hilfreich.',
    objectives: [
      'Strukturierte Logs schreiben und Geheimnisse daraus fernhalten',
      'Einen Server auf SIGTERM sauber beenden: neue Verbindungen ablehnen, laufende Anfragen beenden, Exit-Code 0',
      'Rechenintensive Arbeit in einen Worker Thread auslagern, damit der Event Loop frei bleibt',
      'Ein schlankes Container-Image bauen und prüfen, dass es als normaler Benutzer läuft und sauber stoppt',
    ],
    simple: `Ein Programm, das auf deinem Rechner läuft, kann man beobachten. Ein Programm auf einem Server nicht, deshalb muss es sich selbst erklären: Das leisten Logs. Strukturierte Logs schreiben pro Ereignis eine JSON-Zeile mit Zeit, Stufe (debug, info, warn, error), Nachricht und Feldern. Werkzeuge können danach filtern und zählen. Wichtig ist, was nicht ins Log gehört: Passwörter, Tokens, Cookies, ganze Nutzerdaten. Der Logger im Lab ersetzt Felder mit verdächtigen Namen automatisch durch [geschwärzt] und schreibt bei Fehlern nur Name und Meldung, keinen Stacktrace mit Pfaden.

Server werden neu gestartet, aktualisiert und verschoben. Dabei schickt das System das Signal SIGTERM: „Bitte beende dich.“ Ein sauberer Dienst hört auf, neue Verbindungen anzunehmen, wartet auf laufende Anfragen, schließt Verbindungen und endet mit Exit-Code 0. Ein harter Abbruch bricht Anfragen mitten im Satz ab. Das Lab setzt dazu ein Zeitlimit: Dauert das Beenden zu lang, endet der Prozess mit Code 1.

Rechenintensive Arbeit blockiert den Event Loop (Lektion 1). Ein Worker Thread führt sie in einem eigenen Thread aus; Ergebnisse kommen per Nachricht zurück. Für kurze Aufgaben lohnt das nicht, denn der Start eines Workers kostet Zeit.

Zum Schluss kommt der Server in einen Container: ein Image mit Node.js, deinem Code und sonst nichts. Wichtig sind drei Dinge: nicht als root laufen, den Prozess in der Exec-Form starten, damit er SIGTERM direkt bekommt, und Pflichtkonfiguration beim Start prüfen.`,
    steps: [
      'createLogger gibt eine Funktion je Stufe zurück. Unterhalb der eingestellten Stufe wird nichts geschrieben. write und now sind austauschbar, damit der Test die Ausgabe und die Zeit kontrolliert.',
      'redact geht durch Objekte und ersetzt Werte, deren Schlüssel nach Passwort, Token, Cookie, Autorisierung oder Schlüssel klingen. Die Prüfung ist eine Sicherung, kein Ersatz für Sorgfalt: Was nicht ins Log gehört, schreibt man gar nicht erst hinein.',
      'installShutdown reagiert auf SIGTERM und SIGINT. server.close() nimmt keine neuen Verbindungen an, closeIdleConnections() schließt Keep-Alive-Verbindungen ohne laufende Anfrage, danach wartet das Programm auf das Ereignis close.',
      'Ein Timer mit unref() sorgt für das Zeitlimit: Er hält den Prozess nicht am Leben, löst aber bei Überschreitung den harten Abbruch mit Code 1 aus. Ein zweites Signal während des Beendens wird ignoriert.',
      'main.js lädt die Konfiguration, bricht bei Fehlern mit Exit-Code 78 (Konfigurationsfehler in der sysexits-Konvention) ab und meldet die Probleme als Log-Zeile, startet dann den Server und installiert das saubere Beenden.',
      'Der Test startet main.js als Kindprozess, ruft /health auf, schickt SIGTERM und prüft: Exit-Code 0, Log-Zeilen „Beenden angefordert“ und „Beendet“, und der Port ist danach geschlossen.',
      'fibInWorker startet denselben Dateiinhalt als Worker Thread: isMainThread unterscheidet die Rolle. Eingaben werden vorher geprüft (0 bis 45); falsche Werte lehnen sofort mit RangeError ab, ohne einen Thread zu starten.',
      'Das Dockerfile nutzt node:24-slim, kopiert nur package.json und src (Tests bleiben draußen), wechselt auf den Benutzer node und startet mit CMD ["node", …] in der Exec-Form. Ohne Pflichtwerte beendet sich der Container in production mit Code 78.',
    ],
    background: `Warum Exec-Form? Die Shell-Form (CMD node src/ops/main.js) startet über /bin/sh -c, und die Shell bleibt Prozess 1. Signale gehen dann an die Shell, die sie nicht unbedingt weitergibt, und docker stop wartet das Zeitlimit (standardmäßig zehn Sekunden) ab, bevor es hart beendet. In der Exec-Form ist Node.js selbst Prozess 1 und bekommt SIGTERM direkt. Das Lab hat das mit einem echten Container geprüft: docker stop dauerte weniger als eine Sekunde und der Exit-Code war 0.

Warum nicht als root? Läuft der Prozess als root, hat ein erfolgreicher Angriff auf deinen Code im Container die höchsten Rechte. Das Image node bringt den Benutzer node mit; USER node reicht. Das ist eine Schutzschicht, kein Ersatz für andere Maßnahmen.

Zum Thema Betrieb gehören weitere Dinge, die das Lab nicht abdeckt: Gesundheitsprüfungen durch einen Orchestrator, Metriken, verteilte Spuren, Rollouts ohne Ausfall und Secrets-Verwaltung. Das Lab zeigt die Grundlage: ein Dienst, der verständliche Logs schreibt, sich ordentlich beenden lässt und bei falscher Konfiguration laut scheitert.`,
    terms: [
      { term: 'strukturiertes Log', text: 'Eine JSON-Zeile pro Ereignis mit festen Feldern statt freiem Text.' },
      { term: 'SIGTERM', text: 'Signal „Bitte beenden“; der Prozess darf noch aufräumen.' },
      { term: 'Graceful Shutdown', text: 'Geordnetes Beenden: laufende Anfragen fertig, dann Ende mit Code 0.' },
      { term: 'Worker Thread', text: 'Zusätzlicher Thread für rechenintensive Arbeit, Kommunikation per Nachrichten.' },
      { term: 'Exec-Form', text: 'CMD ["node", "x.js"]: Node.js wird direkt gestartet, ohne Shell dazwischen.' },
    ],
    code: { file: lab + 'src/ops/logger.js', lang: 'JavaScript' },
    code2: { file: lab + 'src/ops/shutdown.js', lang: 'JavaScript' },
    code3: { file: lab + 'Dockerfile', lang: 'Dockerfile' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: `Container-Lauf (Docker 29.8.2, Image node:24-slim, Node 24.22):
Ohne Pflichtwerte (NODE_ENV=production):
 {"level":"error","message":"Ungültige Konfiguration","problems":["DB_PATH ist in production Pflicht ...","SESSION_SECRET braucht in production mindestens 32 Zeichen"]}
 Exit-Code 78
Mit DB_PATH und einem Wegwerf-Secret:
 GET /health -> 200 {"ok":true}   Benutzer im Container: node
 docker stop: unter 1 Sekunde, Exit-Code 0
 {"level":"info","message":"Server läuft","port":8080}
 {"level":"info","message":"Beenden angefordert","signal":"SIGTERM"}
 {"level":"info","message":"Beendet"}

npm test: Logger (JSON, Filter, Schwärzung), Worker, Konfigurationsfehler und SIGTERM-Test grün.`,
    mistakes: [
      { wrong: 'console.log mit freiem Text und ganzen Objekten (Anfragen, Benutzer) schreiben.', why: 'Logs lassen sich schlecht auswerten und enthalten schnell personenbezogene Daten oder Geheimnisse.', fix: 'Strukturierte Zeilen mit wenigen, bewusst gewählten Feldern und automatischer Schwärzung.' },
      { wrong: 'Auf SIGTERM nicht reagieren.', why: 'Der Orchestrator wartet das Zeitlimit ab und beendet dann hart; Anfragen gehen mitten im Satz verloren.', fix: 'Signal behandeln: Server schließen, laufende Anfragen beenden, mit Code 0 enden, Zeitlimit setzen.' },
      { wrong: 'Im Dockerfile CMD node app.js (Shell-Form) nutzen und als root laufen.', why: 'Signale kommen nicht zuverlässig an, und ein Angriff trifft einen Prozess mit höchsten Rechten.', fix: 'Exec-Form und USER node.' },
      { wrong: 'Alles in Worker Threads auslagern.', why: 'Der Start kostet Zeit und Speicher, und für I/O sind Threads nicht nötig, weil I/O ohnehin asynchron läuft.', fix: 'Worker nur für rechenintensive Arbeit, die den Event Loop spürbar blockiert.' },
    ],
    practice: 'Vor dem ersten Deployment: Logs mit festem Format und Schwärzung, SIGTERM-Behandlung mit Zeitlimit, Konfigurationsprüfung beim Start, Container ohne root mit Exec-Form. Prüfe das mit einem echten Lauf (docker stop, Exit-Code), nicht nur mit Lesen des Dockerfiles.',
    exercises: [
      { task: 'Füge dem Logger ein festes Feld service (Name des Dienstes) hinzu und prüfe es in einem Test.', acceptance: 'Jede Zeile enthält service; die Tests für Level und Schwärzung bleiben grün.' },
      { task: 'Grenzfall: Was passiert, wenn während des Beendens eine zweite SIGTERM kommt oder eine Anfrage länger dauert als timeoutMs? Schreibe einen Test mit einer langsamen Antwort.', acceptance: 'Das zweite Signal wird ignoriert; bei Zeitüberschreitung endet der Prozess mit Code 1 und das Log nennt das Zeitlimit.' },
      { task: 'Fehlerfall: Starte den Container mit SESSION_SECRET aus 10 Zeichen. Was meldet er, und welcher Exit-Code kommt zurück?', acceptance: 'Meldung „SESSION_SECRET braucht in production mindestens 32 Zeichen“, Exit-Code 78; der Wert des Secrets steht nirgends im Log.' },
    ],
    quiz: [
      { q: 'Warum startet das Dockerfile mit CMD ["node", "src/ops/main.js"] statt CMD node src/ops/main.js?',
        options: ['Die Exec-Form ist kürzer und braucht deshalb weniger Platz im Image.', 'Exec-Form: Node.js ist Prozess 1 und bekommt SIGTERM direkt; bei der Shell-Form steht eine Shell dazwischen.', 'Nur die Shell-Form unterstützt das Übergeben von Argumenten an Node.js.', 'Die Exec-Form lädt die Abhängigkeiten beim Start deutlich schneller.'],
        correct: 1,
        rationales: ['Länge ist nicht der Grund.', 'So kann das Programm sauber beenden; docker stop wartet nicht auf das Zeitlimit.', 'Beide Formen unterstützen Argumente.', 'Mit Abhängigkeiten hat die Form nichts zu tun.'],
        explain: 'Signale müssen den Node-Prozess erreichen, damit er geordnet beenden kann.' },
      { q: 'Welche Schritte gehören zu einem sauberen Beenden auf SIGTERM?',
        options: ['Sofort process.exit(0) aufrufen, ohne auf offene Verbindungen zu warten.', 'Keine neuen Verbindungen annehmen, laufende Anfragen beenden lassen, mit Code 0 enden und ein Zeitlimit setzen.', 'Alle laufenden Anfragen abbrechen und den Prozess anschließend neu starten.', 'Das Signal ignorieren und weiterarbeiten, bis der Prozess beendet wird.'],
        correct: 1,
        rationales: ['So gehen laufende Anfragen verloren.', 'Genau das tut installShutdown, mit hartem Abbruch als Notbremse.', 'Neustart ist Aufgabe des Orchestrators.', 'Dann beendet das System den Prozess hart.'],
        explain: 'Geordnetes Beenden schützt laufende Anfragen; das Zeitlimit verhindert endloses Warten.' },
      { q: 'Wann lohnt sich ein Worker Thread?',
        options: ['Für jede Datenbankabfrage.', 'Für rechenintensive Arbeit, die den Event Loop spürbar blockieren würde.', 'Für jeden HTTP-Aufruf.', 'Nie, Node.js hat nur einen Thread.'],
        correct: 1,
        rationales: ['Datenbank- und Netzwerk-I/O laufen ohnehin asynchron.', 'Dort verhindert ein Worker, dass alle anderen Anfragen warten.', 'HTTP-Aufrufe sind I/O und brauchen keinen Worker.', 'Node.js hat zusätzliche Threads, nur dein JavaScript läuft im Hauptthread.'],
        explain: 'Worker für CPU-lastige Arbeit; für I/O genügt asynchroner Code.' },
    ],
    sources: [
      api('Node.js: Process – Signal Events', 'process.html#signal-events'),
      api('Node.js: Worker Threads', 'worker_threads.html'),
      docs('Docker: Dockerfile-Referenz (CMD, USER)', 'https://docs.docker.com/reference/dockerfile/', 'Exec-Form und Shell-Form sowie USER; Inhalt hier eigenständig zusammengefasst.'),
      docs('Docker: Best practices for building images', 'https://docs.docker.com/build/building/best-practices/', 'Empfehlungen zu schlanken Images und Benutzerrechten.'),
    ],
    verification: 'Lab node-lab: Logger, Konfigurationsabbruch (Exit-Code 78), SIGTERM-Test und Worker laufen mit Node.js 22.23 und 24.22 grün; das Image wurde mit Docker 29.8.2 gebaut, lief als Benutzer node, antwortete auf /health und endete nach docker stop mit Exit-Code 0. Nicht geprüft: Last, Orchestrierung (Kubernetes), Metriken, Verhalten unter Windows und Rollouts ohne Ausfall.',
  },
];
