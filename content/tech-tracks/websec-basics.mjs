// Web-Sicherheit · Angriffe verstehen. Stichtag 14.11.2026.
// Eigene Texte; Code und Tests liegen unter content/examples/websec-lab/ (Node.js 22.23 lokal, 24.22 im Container, node:test).
// Alle Beispiele sind defensiv: Sie zeigen die Schwachstelle nur gegen eigene Lehrfunktionen und lokale Test-Server und stellen die Abwehr daneben.
// Die offiziellen Dokumentationen (OWASP, MDN, RFCs) werden nur verlinkt, nichts daraus kopiert.
const lab = 'content/examples/websec-lab/';
const docs = (title, url, note = 'Offizielle Dokumentation; Inhalt hier eigenständig zusammengefasst.') => ({ title, url, note });
const cheat = (title, page) => docs(`OWASP Cheat Sheet: ${title}`, `https://cheatsheetseries.owasp.org/cheatsheets/${page}.html`, 'Praxisempfehlungen von OWASP; Inhalt hier eigenständig zusammengefasst.');
const top10 = (title, page) => docs(`OWASP Top 10:2025 – ${title}`, `https://top10.owasp.org/2025/${page}/`, 'Kategorieseite mit der CWE-Zuordnung (am 14.11.2026 abgerufen).');
const mdn = (title, path, note) => docs(`MDN: ${title}`, `https://developer.mozilla.org/en-US/docs/${path}`, note ?? 'Referenz; Inhalt hier eigenständig zusammengefasst.');

export const module = {
  id: 'ws-m1', course: 'websec', part: 31, partTitle: 'Web-Sicherheit · Angriffe verstehen, Anwendungen härten',
  title: 'Web-Sicherheit Grundlagen · Bedrohungsmodell, Injection, XSS, CSRF und Zugriffskontrolle',
};

export const lessons = [
  {
    id: 'ws-m1-l1', title: 'Bedrohungsmodell und OWASP Top 10:2025: Was schützt du wovor?', minutes: 40,
    prerequisites: 'Grundwissen über Webanwendungen und HTTP (Module net-m1 und node-m2 sind hilfreich).',
    objectives: [
      'Werte, Angreifer und Vertrauensgrenzen einer Anwendung benennen',
      'Risiken mit Wahrscheinlichkeit und Schaden bewerten und nach Priorität ordnen',
      'Die zehn Kategorien der OWASP Top 10:2025 nennen und den Lektionen dieses Kurses zuordnen',
      'Erklären, warum Verteidigung in Schichten („defense in depth“) und das Prinzip der geringsten Rechte nötig sind',
    ],
    simple: `Sicherheit beginnt nicht mit Werkzeugen, sondern mit drei Fragen: Was ist wertvoll (Daten, Konten, Verfügbarkeit, Ruf)? Wer könnte es angreifen (Neugierige, Kriminelle, Mitarbeitende, automatische Scanner)? Und wo trifft Fremdes auf Eigenes? Diese Stellen heißen Vertrauensgrenzen: der Browser des Nutzers, das Netzwerk, die Eingabe von Formularen, Schnittstellen zu anderen Diensten, Datenbank und Dateisystem. Alles, was eine Vertrauensgrenze überquert, ist unzuverlässig, bis es geprüft ist.

Ein Bedrohungsmodell sammelt für jede Grenze mögliche Angriffe. Hilfreich ist die Merkliste STRIDE: Identität vortäuschen (Spoofing), Daten manipulieren (Tampering), Handlungen abstreiten (Repudiation), Informationen preisgeben (Information disclosure), Dienst lahmlegen (Denial of Service) und Rechte ausweiten (Elevation of privilege). Jeder gefundene Punkt bekommt eine Bewertung: Wie wahrscheinlich ist er, wie groß wäre der Schaden? Das Produkt (hier 1 bis 5 mal 1 bis 5) ordnet die Arbeit: Zuerst das Wahrscheinliche und Schwerwiegende, nicht das Spektakuläre.

Die OWASP Top 10 sind eine Rangliste der häufigsten und schwersten Risikoklassen für Webanwendungen. Die Ausgabe 2025 nennt: A01 Broken Access Control, A02 Security Misconfiguration, A03 Software Supply Chain Failures, A04 Cryptographic Failures, A05 Injection, A06 Insecure Design, A07 Authentication Failures, A08 Software or Data Integrity Failures, A09 Security Logging and Alerting Failures und A10 Mishandling of Exceptional Conditions. Sie ist ein Bewusstseins-Dokument, keine vollständige Checkliste.

Kein einzelner Schutz hält alles. Deshalb baut man mehrere Schichten: Eingaben prüfen, Ausgaben kodieren, Rechte pro Anfrage prüfen, Header setzen, Abhängigkeiten pflegen, Fehler protokollieren. Fällt eine Schicht, fängt die nächste auf. Und jede Komponente bekommt nur die Rechte, die sie braucht.`,
    steps: [
      'Zeichne die Anwendung als Kästchen (Browser, Server, Datenbank, externer Dienst) und markiere jede Linie, auf der Daten die Vertrauensgrenze queren. Das sind die Stellen, an denen Prüfungen nötig sind.',
      'Liste pro Grenze Bedrohungen nach STRIDE auf. Eine Zeile pro Bedrohung genügt: „Nutzer ändert die Rechnungsnummer in der URL“ (Rechteausweitung).',
      'score() multipliziert Wahrscheinlichkeit und Schaden (je 1 bis 5). Werte außerhalb des Bereichs oder Kommazahlen werden mit einem Fehler abgelehnt, damit die Rangliste nicht durch Tippfehler verfälscht wird.',
      'level() übersetzt den Wert in eine Stufe: ab 20 kritisch, ab 12 hoch, ab 6 mittel, sonst niedrig. Die Schwellen sind eine Verabredung im Team, kein Naturgesetz; wichtig ist, dass sie festgelegt und dokumentiert sind.',
      'rank() sortiert absteigend nach Wert, bei Gleichstand nach Schaden und dann nach Name. So ist die Reihenfolge stabil und nachvollziehbar, auch wenn zwei Risiken gleich bewertet sind.',
      'Beispiel aus dem Test: SQL-Injection (3 × 5 = 15, hoch) steht vor Phishing (4 × 3 = 12, hoch), vor dem Datenleck im Backup (2 × 5 = 10, mittel) und dem defekten Drucker (3 × 1 = 3, niedrig).',
      'Ordne jede Kategorie der Top 10 einer Lektion zu: A01 Zugriffskontrolle (Lektion 5, mit CSRF und SSRF), A05 Injection (Lektionen 2 und 3 mit XSS), A04 und A07 (Modul 2: Passwörter, Sitzungen, Tokens), A02 und A03 (Modul 2: Header, Abhängigkeiten), A09 (Modul 2: Logging).',
      'Lege fest, wer ein Risiko behandelt: vermeiden, verringern, übertragen (Versicherung, Dienstleister) oder bewusst akzeptieren. Ein akzeptiertes Risiko steht schriftlich mit Datum und Verantwortlichem.',
    ],
    background: `Warum bewerten, statt alles zu beheben? Zeit und Aufmerksamkeit sind begrenzt. Eine Liste von hundert Funden ohne Reihenfolge führt dazu, dass das Unwichtige zuerst erledigt wird, weil es leicht ist. Die Multiplikation ist grob, aber besser als Bauchgefühl, weil sie Diskussionen auf zwei Fragen lenkt, die man beantworten kann: Wie leicht ist der Angriff? Was geht verloren?

Warum eine Rangliste wie die OWASP Top 10 mit Vorsicht lesen? Sie stützt sich auf Daten und Umfragen und ändert sich mit der Zeit. Die Ausgabe 2025 hat zum Beispiel „Software Supply Chain Failures“ auf Platz 3 gesetzt und die Kategorie „Mishandling of Exceptional Conditions“ neu aufgenommen. Die Kategorie A01 umfasst laut OWASP unter anderem Path Traversal (CWE-22), CSRF (CWE-352), unsichere direkte Objektverweise (CWE-639) und SSRF (CWE-918); A05 umfasst OS-Command-Injection (CWE-78), Cross-Site-Scripting (CWE-79) und SQL-Injection (CWE-89). Eine Kategorie ist also ein Bündel zusammengehöriger Fehler, nicht ein einzelner Fehler.

Rechtlicher Rahmen (keine Rechtsberatung): Wer personenbezogene Daten verarbeitet, muss nach DSGVO angemessene technische und organisatorische Maßnahmen treffen (Art. 32) und Datenpannen unter Umständen binnen 72 Stunden melden (Art. 33). Das macht Sicherheit zur Pflicht, nicht nur zur Empfehlung. Rechtstexte und Meldewege sollte eine fachkundige Person prüfen.

Zur Ausrichtung dieses Kurses: Die Beispiele zeigen jeden Angriff nur gegen eigene Lehrfunktionen. Sie sind keine Anleitung für Angriffe auf fremde Systeme; Tests gegen fremde Systeme ohne ausdrückliche Erlaubnis sind strafbar (in Deutschland etwa nach §§ 202a ff. StGB). Übe ausschließlich in eigenen Umgebungen.`,
    terms: [
      { term: 'Vertrauensgrenze', text: 'Stelle, an der Daten von einem weniger vertrauten Bereich in einen vertrauteren wechseln.' },
      { term: 'STRIDE', text: 'Merkliste: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege.' },
      { term: 'Risiko', text: 'Eintrittswahrscheinlichkeit mal Schaden.' },
      { term: 'defense in depth', text: 'Mehrere unabhängige Schutzschichten statt einer einzigen Mauer.' },
      { term: 'Prinzip der geringsten Rechte', text: 'Jede Person und jeder Dienst bekommt nur die nötigen Rechte.' },
    ],
    code: { file: lab + 'src/threat/risk.js', lang: 'JavaScript' },
    code2: { file: lab + 'tests/threat-injection.test.js', lang: 'JavaScript', from: "test('Risiko:", to: 'level(0), RangeError', plus: 1 },
    order: ['body', 'code', 'code2', 'body2'],
    output: `rank([...]) für vier Beispielrisiken (Node 22.23):
 SQL-Injection        15  hoch
 Phishing             12  hoch
 Datenleck im Backup  10  mittel
 Defekter Drucker      3  niedrig
Ungültige Bewertungen (0, 6, 2.5) lösen RangeError aus.

OWASP Top 10:2025 (am 14.11.2026 auf top10.owasp.org abgerufen):
 A01 Broken Access Control            A06 Insecure Design
 A02 Security Misconfiguration        A07 Authentication Failures
 A03 Software Supply Chain Failures   A08 Software or Data Integrity Failures
 A04 Cryptographic Failures           A09 Security Logging and Alerting Failures
 A05 Injection                        A10 Mishandling of Exceptional Conditions`,
    mistakes: [
      { wrong: 'Mit Werkzeugen starten (Scanner, Firewall), ohne zu wissen, was geschützt werden soll.', why: 'Ohne Werte und Grenzen schützt man zufällig und lässt Wichtiges offen.', fix: 'Erst Werte, Angreifer und Vertrauensgrenzen aufschreiben, dann Maßnahmen wählen.' },
      { wrong: 'Der Top-10-Liste als vollständiger Checkliste zu vertrauen.', why: 'Sie nennt häufige Risikoklassen, nicht alle möglichen Fehler; manche Anwendungen haben andere Schwerpunkte.', fix: 'Als Gedächtnisstütze nutzen und um eigene Bedrohungen ergänzen.' },
      { wrong: 'Sicherheit nur an einer Stelle zu bauen (zum Beispiel nur im Formular im Browser).', why: 'Angreifer sprechen direkt mit dem Server; Prüfungen im Browser lassen sich umgehen.', fix: 'Jede Prüfung zusätzlich auf dem Server durchführen und mehrere Schichten einsetzen.' },
      { wrong: 'Risiken zu bewerten und die Liste danach liegen zu lassen.', why: 'Ein Bedrohungsmodell veraltet mit jeder neuen Funktion und jeder neuen Schnittstelle.', fix: 'Bei Änderungen an Grenzen (neue API, neuer Dienst) überprüfen und Verantwortliche benennen.' },
    ],
    practice: 'Nimm eine Anwendung, die du kennst, und zeichne sie mit allen Vertrauensgrenzen. Notiere zehn Bedrohungen, bewerte sie mit rank() und lege für die obersten drei Maßnahmen und Verantwortliche fest. Wiederhole das bei jeder größeren Änderung.',
    exercises: [
      { task: 'Erstelle für eine kleine Notiz-App (Anmeldung, Notizen anlegen, Notizen teilen) fünf Bedrohungen mit Bewertung und lasse sie mit rank() sortieren.', acceptance: 'Fünf Einträge mit nachvollziehbarer Begründung der Bewertung; die Ausgabe zeigt Wert und Stufe; mindestens eine Bedrohung gehört zu A01 (Zugriffskontrolle).' },
      { task: 'Grenzfall: Zwei Risiken haben denselben Wert (zum Beispiel 4 × 3 und 3 × 4). Wie entscheidet rank(), und ist das sinnvoll? Wann würdest du die Regel ändern?', acceptance: 'Bei Gleichstand gewinnt der höhere Schaden; du begründest, warum und wann dir „Wahrscheinlichkeit vor Schaden“ wichtiger wäre (zum Beispiel bei Massenangriffen).' },
      { task: 'Fehlerfall: Bewerte ein Risiko mit Wahrscheinlichkeit 0 und eines mit 7. Was passiert, und warum ist das Ablehnen besser als Weiterrechnen?', acceptance: 'Beide lösen RangeError aus; du erklärst, dass falsche Eingaben die Rangliste unbemerkt verfälschen würden.' },
    ],
    quiz: [
      { q: 'Was ist eine Vertrauensgrenze?',
        options: ['Wo Daten aus einem weniger vertrauten in einen vertrauteren Bereich wechseln, etwa vom Browser zum Server.', 'Die physische Grenze des Rechenzentrums, in dem die Server stehen.', 'Die Grenze zwischen Entwicklungs- und Testumgebung einer Anwendung.', 'Die Obergrenze für die erlaubte Länge von Passwörtern.'],
        correct: 0,
        rationales: ['Dort muss geprüft werden, weil die Daten nicht vertrauenswürdig sind.', 'Es geht nicht um physische Orte.', 'Das ist eine Umgebungsgrenze, keine Vertrauensgrenze.', 'Mit Passwörtern hat der Begriff nichts zu tun.'],
        explain: 'Alles, was eine Vertrauensgrenze überquert, gilt als unzuverlässig, bis es geprüft ist.' },
      { q: 'Welche Kategorie führt die OWASP Top 10:2025 auf Platz 1?',
        options: ['Broken Access Control', 'Injection', 'Cryptographic Failures', 'Security Misconfiguration'],
        correct: 0,
        rationales: ['A01:2025; sie umfasst unter anderem IDOR, Path Traversal, CSRF und SSRF.', 'Injection steht 2025 auf Platz 5.', 'Cryptographic Failures steht auf Platz 4.', 'Security Misconfiguration steht auf Platz 2.'],
        explain: 'Zugriffskontrolle bleibt die häufigste und folgenreichste Risikoklasse.' },
      { q: 'Warum reicht eine einzelne Schutzmaßnahme nicht aus?',
        options: ['Jede Maßnahme kann durch Fehler oder Umgehung ausfallen; mehrere Schichten fangen das auf.', 'Weil Behörden mehrere Schutzmaßnahmen gesetzlich vorschreiben.', 'Weil sich Maßnahmen gegenseitig ausschließen und nur eine gewählt werden darf.', 'Weil Angreifer grundsätzlich immer nur eine einzige Schicht kennen.'],
        correct: 0,
        rationales: ['Das ist der Kern von defense in depth.', 'Rechtliche Vorgaben sind nicht der technische Grund.', 'Maßnahmen ergänzen sich.', 'Angreifer probieren viele Wege.'],
        explain: 'Sicherheit entsteht aus mehreren, voneinander unabhängigen Schichten.' },
    ],
    sources: [
      docs('OWASP Top 10:2025', 'https://top10.owasp.org/2025/', 'Die zehn Kategorien mit Einführung und Methodik.'),
      top10('A01 Broken Access Control', 'A01_2025-Broken_Access_Control'),
      top10('A05 Injection', 'A05_2025-Injection'),
      cheat('Threat Modeling', 'Threat_Modeling_Cheat_Sheet'),
    ],
    verification: 'Lab websec-lab: Die Risikobewertung (score, level, rank, Fehlerfälle) wurde mit Node.js 22.23 und 24.22 getestet. Die Namen der Top-10-Kategorien und die CWE-Zuordnung von A01 und A05 wurden am 14.11.2026 auf top10.owasp.org abgerufen. Nicht geprüft: Methodik und Rangfolge im Detail; rechtliche Aussagen (DSGVO, StGB) sind Hinweise und gehören juristisch geprüft.',
  },
  {
    id: 'ws-m1-l2', title: 'Injection: SQL, Betriebssystem-Befehle und Argumente', minutes: 50,
    prerequisites: 'Lektion „Bedrohungsmodell“ und Grundwissen zu SQL (Modul sql-m1) und Node.js (Modul node-m2).',
    objectives: [
      'Erklären, wie Injection entsteht, wenn Eingaben als Teil eines Befehls gelesen werden',
      'SQL-Injection mit Platzhaltern verhindern und Spalten- und Richtungsnamen aus einer festen Liste wählen',
      'Command-Injection durch Argumentlisten statt Shell-Text verhindern und Argument-Injection mit -- erkennen',
      'Eingabeprüfung (Validierung) und Trennung von Befehl und Daten als zwei verschiedene Schichten einordnen',
    ],
    simple: `Injection entsteht immer nach demselben Muster: Ein Programm baut einen Befehl aus festem Text und Eingaben zusammen und gibt ihn an einen Interpreter weiter (SQL-Datenbank, Betriebssystem-Shell, Dateisuche, Vorlagenmaschine). Enthält die Eingabe Zeichen mit Bedeutung für den Interpreter, ändert sie den Befehl. Aus dem Namen x' OR '1'='1 wird in SQL eine Bedingung, die immer wahr ist, aus Ada; echo INJIZIERT in der Shell ein zweiter Befehl.

Die wirksame Abwehr ist nicht Filtern, sondern Trennen. Bei SQL übergibst du den Befehl mit Platzhaltern (?) und die Werte getrennt; die Datenbank liest die Werte nie als SQL. Bei Betriebssystem-Befehlen rufst du das Programm direkt mit einer Argumentliste auf (execFile in Node.js), statt eine Zeile an die Shell zu geben. So bleibt jedes Argument ein Argument, egal welche Zeichen es enthält.

Zwei Fälle brauchen zusätzliche Aufmerksamkeit. Namen von Tabellen, Spalten und Sortierrichtungen können keine Platzhalter sein; sie kommen aus einer festen Liste, nicht aus der Eingabe. Und Argument-Injection: Ein Wert, der mit - beginnt, wird von vielen Programmen als Option gelesen (grep -r statt nach „-r“ zu suchen). Das Zeichen -- beendet die Optionen; danach ist alles ein Wert.

Validierung (Länge, Zeichen, Format) bleibt trotzdem sinnvoll, als zweite Schicht: Sie fängt Unsinn früh ab und reduziert die Angriffsfläche. Sie ersetzt aber nie das Trennen von Befehl und Daten, weil Filter fast immer eine Lücke haben.`,
    steps: [
      'findUnsafe setzt den Namen in den SQL-Text ein. Mit ada kommt eine Zeile zurück, mit x\' OR \'1\'=\'1 kommen alle drei Benutzer. Ein einzelnes Anführungszeichen erzeugt einen Syntaxfehler: ein typisches Zeichen für eine Lücke.',
      'findSafe nutzt einen Platzhalter. Dieselbe Eingabe findet niemanden, denn nach einem Benutzer mit genau diesem Namen wird gesucht. Auch die UNION-Variante, die fremde Spalten in die Ausgabe holen soll, bleibt wirkungslos.',
      'listSorted wählt Spalte und Richtung aus einer festen Liste (Map) und lehnt alles andere mit RangeError ab. Der Text name; DROP TABLE users kommt nie in den SQL-Text.',
      'greetUnsafe ruft exec mit einer Textzeile auf. Die Shell liest das Semikolon als Befehlstrenner und führt echo INJIZIERT aus: Die Ausgabe hat zwei Zeilen.',
      'greetSafe nutzt execFile mit einer Argumentliste. Dieselbe Eingabe bleibt Text („Hallo Ada; echo INJIZIERT“), ebenso $(echo X): Es findet keine Ersetzung statt, weil keine Shell beteiligt ist.',
      'countMatches ruft grep mit den Optionen -c -F und danach -- auf. Das Muster -r wird so gesucht und nicht als Option gelesen. Länge und Typ des Musters werden vorher geprüft.',
      'Exit-Code 1 von grep heißt „keine Treffer“ (Ergebnis 0), jeder andere Code ist ein Fehler. Eine fehlende Datei wirft deshalb einen Fehler statt „0 Treffer“ zu melden.',
      'Merke den Unterschied der Schichten: Platzhalter und Argumentlisten trennen Befehl und Daten (Abwehr), Validierung prüft die Form der Daten (zusätzliche Schicht), die Rechte der Datenbank-Anmeldung begrenzen den Schaden (dritte Schicht).',
    ],
    background: `Warum ist Filtern nicht genug? Wer gefährliche Zeichen entfernt oder maskiert, muss alle Zeichen und alle Zeichenkodierungen kennen, die für den Interpreter eine Bedeutung haben. Jeder Interpreter hat Dutzende davon, und sie ändern sich mit Zeichensatz, Version und Kontext. Eine Lücke genügt. Platzhalter verlagern die Verantwortung dorthin, wo der Befehl gelesen wird: Die Datenbank weiß, was Befehl und was Wert ist. Das ist verlässlicher als jeder eigene Filter.

Wann sind Platzhalter nicht möglich? Bei Strukturteilen wie Tabellen-, Spaltennamen und Sortierrichtung. Die Lösung ist eine feste Liste im Code, aus der die Eingabe nur auswählt (Allowlist). Dasselbe Prinzip gilt für Dateinamen, Befehlsnamen und URLs: Erlaube bekannte gute Werte, statt bekannte schlechte zu verbieten.

Der Schaden hängt von den Rechten ab. Läuft die Anwendung mit einem Datenbank-Konto, das nur die nötigen Tabellen lesen und schreiben darf (kein DROP, kein Zugriff auf andere Schemas), ist ein Fehler weniger gravierend. Dasselbe gilt für Betriebssystem-Konten. Das ist das Prinzip der geringsten Rechte aus Lektion 1.

Auch andere Interpreter sind betroffen: NoSQL-Abfragen, LDAP-Filter, XPath, E-Mail-Header, Vorlagenmaschinen und Log-Zeilen (Lektion 9). Das Muster bleibt: Daten nie zu Befehl machen. Frameworks und ORMs bieten Platzhalter und Parameter an, enthalten aber meist auch eine „Raw“-Funktion für Text; dort sitzt das Risiko.`,
    terms: [
      { term: 'Injection', text: 'Eingaben werden als Teil eines Befehls gelesen und verändern ihn.' },
      { term: 'Platzhalter (Prepared Statement)', text: 'SQL und Werte werden getrennt übergeben.' },
      { term: 'Allowlist', text: 'Liste erlaubter Werte; alles andere wird abgelehnt.' },
      { term: 'execFile', text: 'Startet ein Programm direkt mit Argumentliste, ohne Shell.' },
      { term: '--', text: 'Beendet die Optionen; danach beginnen Werte, auch wenn sie mit - anfangen.' },
    ],
    code: { file: lab + 'src/injection/sql.js', lang: 'JavaScript' },
    code2: { file: lab + 'src/injection/shell.js', lang: 'JavaScript' },
    code3: { file: lab + 'tests/threat-injection.test.js', lang: 'JavaScript', from: "test('SQL: Verkettung", to: "assert.throws(() => listSorted(db, 'name', 'asc; --'), RangeError);", plus: 1 },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: `Angriffseingabe: x' OR '1'='1   (Node 22.23, node:sqlite)
 findUnsafe -> [{"id":1,"name":"ada"},{"id":2,"name":"grace"},{"id":3,"name":"linus"}]   (alle Benutzer)
 findSafe   -> []
Shell-Eingabe: Ada; echo INJIZIERT
 greetUnsafe -> "Hallo Ada\\nINJIZIERT"                 (zweiter Befehl lief)
 greetSafe   -> "Hallo Ada; echo INJIZIERT"
listSorted(db, "name; DROP TABLE users") -> RangeError
countMatches("-r", datei) -> 2 Treffer für den Text "-r" (nicht als Option gelesen)
Tests: Injection (5) grün; node:sqlite meldet auf Node 22.23 eine ExperimentalWarning.`,
    mistakes: [
      { wrong: 'Anführungszeichen in der Eingabe „escapen“ und dann trotzdem verketten.', why: 'Eigene Maskierung übersieht Zeichen, Kodierungen und Sonderfälle; ein Fehler öffnet die Lücke.', fix: 'Platzhalter bzw. Argumentlisten verwenden; Maskierung nur dort, wo es keine Alternative gibt.' },
      { wrong: 'Tabellen- oder Spaltennamen aus Eingaben in SQL einsetzen.', why: 'Platzhalter funktionieren dafür nicht, die Eingabe würde Teil des Befehls.', fix: 'Aus einer festen Liste auswählen und alles andere ablehnen.' },
      { wrong: 'exec() oder system() mit einer zusammengesetzten Zeile verwenden.', why: 'Die Shell interpretiert ;, &&, |, $( ), Backticks und mehr.', fix: 'execFile/spawn mit Argumentliste, ohne shell: true.' },
      { wrong: 'Nur die Eingabe zu prüfen, aber mit einem Datenbank-Konto mit vollen Rechten zu arbeiten.', why: 'Eine einzige übersehene Lücke hat dann maximalen Schaden.', fix: 'Eigenes Konto mit minimalen Rechten pro Anwendung.' },
    ],
    practice: 'Suche in deinem Code nach Stellen, an denen Text zusammengesetzt und an einen Interpreter übergeben wird (SQL, Shell, Dateipfade, Vorlagen). Ersetze jede durch Platzhalter, Argumentliste oder eine Allowlist, und schreibe für jede einen Test mit einer Angriffseingabe.',
    exercises: [
      { task: 'Schreibe eine Funktion deleteUser(db, id), die per Platzhalter löscht, und einen Test, der die unsichere Verkettung mit der Eingabe "1 OR 1=1" vergleicht.', acceptance: 'Sicher: löscht höchstens die Zeile mit id 1 (oder keine, wenn id kein Zahlentext ist); die unsichere Variante löscht alle Zeilen. Du validierst id zusätzlich als ganze Zahl.' },
      { task: 'Grenzfall: Was passiert bei listSorted mit der Spalte "NAME" (Großbuchstaben), mit "name " (Leerzeichen) und mit dem Wert undefined?', acceptance: 'Alle drei lösen RangeError aus, weil die feste Liste genau vergleicht; du entscheidest bewusst, ob du normalisieren möchtest, und dokumentierst es.' },
      { task: 'Fehlerfall: Ersetze in greetSafe execFile durch exec mit gebauter Zeile. Welche Tests schlagen an, und warum ist die Fehlermeldung wichtig?', acceptance: 'Der Test „execFile nicht“ scheitert, weil der zweite Befehl läuft; du erklärst, dass ein Test mit Angriffseingabe solche Rückschritte entdeckt.' },
    ],
    quiz: [
      { q: 'Warum schützt ein Platzhalter (?) vor SQL-Injection?',
        options: ['Befehl und Werte werden getrennt übergeben; der Wert wird nie als SQL gelesen.', 'Er verschlüsselt die Eingabe.', 'Er entfernt gefährliche Zeichen.', 'Er prüft das Passwort.'],
        correct: 0,
        rationales: ['Die Struktur des Befehls steht fest, bevor die Werte eingesetzt werden.', 'Es findet keine Verschlüsselung statt.', 'Nichts wird entfernt; der Wert bleibt, wie er ist.', 'Mit Passwörtern hat es nichts zu tun.'],
        explain: 'Trennen von Befehl und Daten ist verlässlicher als Filtern.' },
      { q: 'Wie wählst du eine Sortierspalte sicher aus Eingaben aus?',
        options: ['Aus einer festen Liste erlaubter Namen; alles andere wird abgelehnt.', 'Mit einem Platzhalter für den Spaltennamen.', 'Mit einer Zeichen-Ersetzung für Strichpunkte.', 'Der Spaltenname wird einfach eingesetzt.'],
        correct: 0,
        rationales: ['Eine Allowlist lässt nur bekannte gute Werte zu.', 'Platzhalter gelten nur für Werte, nicht für Namen.', 'Filter übersehen Fälle.', 'Das öffnet die Lücke.'],
        explain: 'Strukturteile des Befehls kommen aus dem Code, nicht aus der Eingabe.' },
      { q: 'Wozu dient -- in execFile("grep", ["-c", "-F", "--", muster, datei])?',
        options: ['Es beendet die Optionen, sodass ein Muster mit führendem - als Wert gilt.', 'Es kommentiert den Rest aus.', 'Es macht die Suche schneller.', 'Es verschlüsselt das Muster.'],
        correct: 0,
        rationales: ['Das verhindert Argument-Injection.', 'In der Shell hat es diese Rolle nicht.', 'Die Geschwindigkeit ändert sich nicht.', 'Es wird nichts verschlüsselt.'],
        explain: '-- trennt Optionen von Werten.' },
    ],
    sources: [
      top10('A05 Injection', 'A05_2025-Injection'),
      cheat('SQL Injection Prevention', 'SQL_Injection_Prevention_Cheat_Sheet'),
      cheat('OS Command Injection Defense', 'OS_Command_Injection_Defense_Cheat_Sheet'),
      docs('Node.js: child_process (execFile und exec)', 'https://nodejs.org/api/child_process.html', 'Beschreibt execFile, spawn und die Risiken von exec.'),
    ],
    verification: 'Lab websec-lab: Die SQL-Injection (inklusive UNION und Syntaxfehler), die Sortier-Allowlist, Command-Injection und Argument-Injection wurden auf Node.js 22.23 und 24.22 beobachtet; alle Tests laufen lokal gegen eine Speicher-Datenbank und den Befehl echo/grep. Nicht geprüft: andere Datenbanken, ORMs, Vorlagen-Injection, NoSQL und Windows.',
  },
  {
    id: 'ws-m1-l3', title: 'Cross-Site-Scripting: Ausgabe-Kodierung, sichere URLs und Content-Security-Policy', minutes: 50,
    prerequisites: 'Lektionen „Bedrohungsmodell“ und „Injection“; HTML-Grundwissen.',
    objectives: [
      'Gespeichertes, reflektiertes und DOM-basiertes XSS unterscheiden',
      'Ausgaben je nach Kontext (Text, Attribut, URL, Skript) richtig kodieren',
      'Links auf erlaubte Schemata (http, https, mailto) beschränken und JSON sicher in Skriptblöcke einbetten',
      'Eine Content-Security-Policy mit Nonce aufbauen und erklären, was sie leistet und was nicht',
    ],
    simple: `Cross-Site-Scripting (XSS) liegt vor, wenn fremder Text im Browser eines anderen Nutzers als Code läuft. Ein Kommentar mit <script> oder <img onerror=…> genügt, wenn die Seite ihn ungeprüft ins HTML schreibt. Der Schaden ist groß: Das Skript läuft mit den Rechten des Opfers auf deiner Seite, kann Daten lesen, Aktionen auslösen, Formulare ändern und Anmeldedaten abgreifen. Beim gespeicherten XSS liegt der Text in der Datenbank und trifft jeden Besucher, beim reflektierten steckt er in einer Adresse, und beim DOM-basierten baut das Skript im Browser selbst HTML aus Eingaben.

Die Abwehr heißt Ausgabe-Kodierung: Jede Eingabe wird beim Schreiben in das Ziel so kodiert, dass sie dort nur Text ist. Im HTML-Text werden die Zeichen & < > " ' durch Entitäten ersetzt, in Attributen gilt dasselbe (und das Attribut steht in Anführungszeichen). Der Kontext ist entscheidend: In URLs braucht man die Prüfung des Schemas (javascript: ist keine Adresse, sondern Code), in Skriptblöcken eine eigene Kodierung für JSON, in CSS wieder eine andere. Frameworks wie Vue und React kodieren Text standardmäßig; gefährlich sind Funktionen wie v-html und innerHTML, die ausdrücklich rohes HTML einsetzen.

Die Content-Security-Policy (CSP) ist eine zweite Schicht: Der Server teilt dem Browser per Header mit, woher Skripte stammen dürfen. Mit einem Nonce (Zufallswert pro Antwort) laufen nur Skripte, die genau diesen Wert tragen; eingeschleuste Skripte haben ihn nicht und werden blockiert. Die CSP ersetzt die Kodierung nicht, sie begrenzt den Schaden, wenn eine Kodierung vergessen wurde.`,
    steps: [
      'escapeHtml ersetzt & < > " \' durch Entitäten. Es nimmt jeden Wert an (auch Zahlen und null) und wandelt ihn in Text um. Es ist für Rohtext gedacht: Wird dieselbe Zeichenkette zweimal kodiert, erscheint &amp;amp;.',
      'safeUrl parst die Adresse mit dem URL-Parser und lässt nur http:, https: und mailto: durch. javascript:, data: und Schreibweisen mit Großbuchstaben, Leerzeichen oder Tabulator im Schema werden erkannt, weil der Parser sie normalisiert. Ungültiges wird zu "#".',
      'renderComment kombiniert beides: Autor und Text kodiert, Link geprüft und anschließend in das Attribut kodiert. rel="nofollow noopener" ist ein zusätzlicher Schutz bei fremden Links.',
      'renderCommentUnsafe zeigt den Fehler: Das Skript steht unverändert im HTML. Ein Anführungszeichen in der Adresse bricht aus dem Attribut aus und hängt einen Ereignis-Handler an (onmouseover).',
      'jsonForScript ersetzt <, > und & in JSON durch \\u-Schreibweisen und die Zeilentrenner U+2028/U+2029. So kann der Text kein </script> enthalten, das den Block beendet; die Daten bleiben beim Lesen mit JSON.parse unverändert.',
      'newNonce erzeugt 16 Zufallsbytes (base64) für jede Antwort. Der Test erzeugt 1000 Werte und findet keine Wiederholung. Ein wiederverwendeter Nonce wäre für Angreifer lesbar und damit wertlos.',
      'contentSecurityPolicy baut den Header: Skripte nur mit Nonce und strict-dynamic, object-src und base-uri auf none, frame-ancestors none (keine Einbettung in fremde Seiten), form-action auf die eigene Seite. Weder unsafe-inline noch unsafe-eval kommen vor.',
      'Beachte: Die CSP wurde im Lab nur als Text geprüft; die Wirkung im Browser (blockierte Skripte, Meldungen in der Konsole) ist nicht getestet. Prüfe sie in den Entwicklerwerkzeugen und mit report-only, bevor du sie scharf schaltest.',
    ],
    background: `Warum Kodierung nach Kontext? Dasselbe Zeichen hat in jedem Kontext eine andere Bedeutung. Ein Anführungszeichen ist im HTML-Text harmlos, in einem Attributwert beendet es den Wert. Ein Backslash ist im HTML belanglos und in einem JavaScript-Text ein Escape-Zeichen. Eine einzige „Allzweck-Kodierung“ gibt es nicht; deshalb nutzt man die Funktionen des Frameworks und prüft die gefährlichen Stellen (innerHTML, v-html, Vorlagen mit „raw“-Ausgabe) besonders.

Wann braucht man HTML-Bereinigung statt Kodierung? Wenn Nutzer bewusst Formatierungen schreiben dürfen (Rich-Text-Editor). Dann muss ein geprüfter Sanitizer (zum Beispiel DOMPurify) eine Allowlist erlaubter Tags und Attribute durchsetzen. Selbstgeschriebene Filter mit regulären Ausdrücken scheitern an der Vielfalt von HTML. Diese Lektion zeigt nur Kodierung; ein Sanitizer wurde im Lab nicht eingesetzt und nicht geprüft.

Was kann die CSP nicht? Sie schützt nicht vor allem: Wer Daten in eine Seite einschleust, die ein erlaubtes Skript später als Code ausführt, umgeht sie. strict-dynamic erlaubt Skripte, die ein erlaubtes Skript nachlädt; unsafe-inline ohne Nonce würde die Wirkung aufheben. Eine CSP ohne script-src oder default-src schränkt Skripte gar nicht ein, auch wenn sie andere Regeln wie object-src enthält (die Header-Prüfung in Lektion 8 meldet das). Außerdem sollte der Cookie mit HttpOnly gesetzt sein, damit eingeschleuste Skripte die Sitzungskennung nicht lesen können; verhindert wird der Missbrauch der Sitzung dadurch aber nicht.`,
    terms: [
      { term: 'XSS', text: 'Fremder Text läuft im Browser eines anderen Nutzers als Skript.' },
      { term: 'Ausgabe-Kodierung', text: 'Zeichen mit Bedeutung werden so umgeschrieben, dass sie im Ziel nur Text sind.' },
      { term: 'CSP', text: 'Header, der festlegt, woher ein Browser Skripte und andere Inhalte laden darf.' },
      { term: 'Nonce', text: 'Zufallswert pro Antwort, der erlaubte Skripte kennzeichnet.' },
      { term: 'Sanitizer', text: 'Bibliothek, die HTML nach einer Allowlist bereinigt.' },
    ],
    code: { file: lab + 'src/xss/encode.js', lang: 'JavaScript' },
    code2: { file: lab + 'tests/xss.test.js', lang: 'JavaScript', from: "test('Kommentar:", to: "assert.ok(!safe.includes('onmouseover=\"alert(1)'), 'sicher: das Anführungszeichen ist kodiert');", plus: 1 },
    order: ['body', 'code', 'code2', 'body2'],
    output: `Kommentar mit Autor "<img src=x onerror=alert(1)>" und Website "javascript:alert(1)":
 unsicher: <article class="comment"><h3><img src=x onerror=alert(1)></h3><p>hi</p><a href="javascript:alert(1)">Website</a></article>
 sicher:   <article class="comment"><h3>&lt;img src=x onerror=alert(1)&gt;</h3><p>hi</p><a href="#" rel="nofollow noopener">Website</a></article>
safeUrl: "javascript:alert(1)", "  JaVaScRiPt:alert(1)", "data:text/html,..." und "java<Tab>script:..." ergeben alle "#"
CSP-Header (Beispiel): default-src 'self'; script-src 'nonce-<zufall>' 'strict-dynamic'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'
Tests: XSS (6) grün auf Node 22.23 und 24.22. Browser-Verhalten (CSP-Blockade) NICHT geprüft.`,
    mistakes: [
      { wrong: 'Nutzertext mit innerHTML, v-html oder einer „raw“-Vorlage in die Seite schreiben.', why: 'Der Text wird als HTML gelesen; ein eingeschleustes Skript oder Ereignisattribut läuft.', fix: 'textContent bzw. die standardmäßige Kodierung des Frameworks; für Rich Text einen Sanitizer nutzen.' },
      { wrong: 'Eine Adresse aus Nutzereingaben ungeprüft in href oder src einsetzen.', why: 'Schemata wie javascript: führen beim Klick Code aus; eine Kodierung allein hilft nicht.', fix: 'Schema gegen eine Allowlist prüfen (http, https, mailto) und danach kodieren.' },
      { wrong: 'Eine CSP mit unsafe-inline oder ohne script-src/default-src als „fertig“ zu betrachten.', why: 'Erlaubte Inline-Skripte oder fehlende Skriptregeln lassen eingeschleusten Code laufen.', fix: 'Nonce oder Hash verwenden, script-src festlegen und mit Content-Security-Policy-Report-Only testen.' },
      { wrong: 'Den Nonce fest im Code oder pro Sitzung zu verwenden.', why: 'Wer ihn einmal sieht, kann ihn weiterverwenden; die Policy wäre wirkungslos.', fix: 'Pro Antwort einen neuen Zufallswert (mindestens 128 Bit) erzeugen.' },
    ],
    practice: 'Suche in einer Anwendung alle Stellen, an denen Nutzertext in HTML, Attribute, URLs oder Skripte gelangt. Verlasse dich auf die Standardkodierung des Frameworks, markiere jede Ausnahme (v-html, innerHTML) und begründe sie. Aktiviere eine CSP zunächst im Report-Only-Modus und werte die Meldungen aus.',
    exercises: [
      { task: 'Ergänze renderComment um ein Feld „Titel“ als Attributwert (title="…") und schreibe einen Test mit der Eingabe a" onmouseover="x.', acceptance: 'Der Wert steht kodiert im Attribut (&quot;); im HTML erscheint kein eigenes Attribut onmouseover; die unsichere Variante zeigt das Ausbrechen.' },
      { task: 'Grenzfall: Prüfe safeUrl mit "//evil.example/x", "HTTPS://example.org", "   " und einer sehr langen Adresse. Was liefert die Funktion, und was würdest du verbieten?', acceptance: '"//evil.example/x" wird zu https://evil.example/x (erlaubtes Schema, fremder Host), "HTTPS://example.org" zu https://example.org/, und "   " zu https://example.invalid/, weil das Lab relative Eingaben gegen einen Beispiel-Host auflöst; du entscheidest, ob fremde Hosts und relative Adressen erlaubt sein sollen, und passt die Prüfung an.' },
      { task: 'Fehlerfall: Setze in contentSecurityPolicy testweise unsafe-inline ein und schreibe einen Test, der das verhindert. Wie hilft das gegen versehentliche Abschwächung?', acceptance: 'Ein Test prüft, dass unsafe-inline und unsafe-eval fehlen; er schlägt an, wenn jemand die Policy abschwächt.' },
    ],
    quiz: [
      { q: 'Was ist die wichtigste Abwehr gegen XSS?',
        options: ['Ausgaben je nach Kontext kodieren, sodass Nutzertext nur Text ist.', 'Nur Eingaben im Browser prüfen.', 'Die Seite verschlüsseln.', 'Nutzer bitten, kein HTML einzugeben.'],
        correct: 0,
        rationales: ['Kodierung beim Schreiben ins Ziel verhindert, dass der Browser Text als Code liest.', 'Prüfungen im Browser lassen sich umgehen.', 'Verschlüsselung der Übertragung schützt nicht vor XSS.', 'Angreifer halten sich nicht an Bitten.'],
        explain: 'Kodiere beim Ausgeben, am besten durch Standardfunktionen des Frameworks.' },
      { q: 'Warum ist <a href="javascript:…"> trotz HTML-Kodierung gefährlich?',
        options: ['Das Schema javascript: führt beim Klick Code aus; Kodierung ändert das Schema nicht.', 'Weil Links in HTML grundsätzlich immer gefährlich sind, egal wohin sie zeigen.', 'Weil HTML das Attribut href gar nicht kennt und Links nur per Skript geht.', 'Weil Browser keine HTML-Kodierung verstehen und sie ignorieren.'],
        correct: 0,
        rationales: ['Deshalb wird das Schema gegen eine Allowlist geprüft.', 'Links an sich sind in Ordnung.', 'href ist ein normales Attribut.', 'Browser verstehen Kodierung, aber sie ändert hier nichts.'],
        explain: 'URLs brauchen eine eigene Prüfung des Schemas.' },
      { q: 'Was bewirkt ein Nonce in der CSP?',
        options: ['Nur Skripte mit diesem Zufallswert dürfen laufen; eingeschleuste Skripte haben ihn nicht.', 'Er verschlüsselt die Skripte, damit sie nur der Browser lesen kann.', 'Er verhindert, dass die Seite Cookies setzen oder lesen kann.', 'Er ersetzt die Ausgabe-Kodierung vollständig, sodass sie entfallen kann.'],
        correct: 0,
        rationales: ['Der Wert ist pro Antwort neu und für Angreifer nicht vorhersehbar.', 'Skripte werden nicht verschlüsselt.', 'Cookies sind nicht betroffen.', 'Die CSP ergänzt die Kodierung, ersetzt sie aber nicht.'],
        explain: 'Der Nonce macht aus „erlaubt ist alles auf dieser Seite“ „erlaubt ist, was der Server markiert hat“.' },
    ],
    sources: [
      top10('A05 Injection', 'A05_2025-Injection'),
      cheat('Cross Site Scripting Prevention', 'Cross_Site_Scripting_Prevention_Cheat_Sheet'),
      cheat('Content Security Policy', 'Content_Security_Policy_Cheat_Sheet'),
      mdn('Content Security Policy (CSP)', 'Web/HTTP/Guides/CSP', 'Erklärt Direktiven, Nonce, strict-dynamic und Report-Only; Inhalt hier eigenständig zusammengefasst.'),
    ],
    verification: 'Lab websec-lab: Kodierung, Schema-Prüfung, JSON im Skriptblock, Nonce (1000 Werte ohne Wiederholung) und der CSP-Text wurden mit Node.js 22.23 und 24.22 getestet. NICHT geprüft: Wie ein echter Browser die CSP anwendet, DOM-basiertes XSS, Sanitizer für Rich Text, Trusted Types und Vorlagenmaschinen außerhalb der Beispielfunktionen.',
  },
  {
    id: 'ws-m1-l4', title: 'CSRF, CORS und Cookies: Anfragen von fremden Seiten', minutes: 50,
    prerequisites: 'Lektionen „Bedrohungsmodell“ und „Cross-Site-Scripting“; HTTP-Cookies kennen (Modul net-m1).',
    objectives: [
      'Erklären, wie Cross-Site-Request-Forgery funktioniert und warum Cookies dabei automatisch mitgeschickt werden',
      'CSRF-Token, Sec-Fetch-Site/Origin-Prüfung und SameSite-Cookies als Schichten einsetzen',
      'CORS richtig einordnen: Es regelt das Lesen von Antworten im Browser, nicht den Zugriff auf den Server',
      'Cookies mit HttpOnly, Secure, SameSite und dem Präfix __Host- setzen',
    ],
    simple: `Cross-Site-Request-Forgery (CSRF) nutzt aus, dass Browser Cookies automatisch zu einer Domain mitschicken, egal welche Seite die Anfrage ausgelöst hat. Ruft ein Nutzer, der bei seiner Bank angemeldet ist, eine fremde Seite auf, kann diese im Hintergrund ein Formular an die Bank senden. Der Browser hängt das Sitzungs-Cookie an; die Bank hält die Anfrage für echt. Der Angreifer sieht die Antwort nicht, aber die Überweisung ist ausgelöst.

Die Abwehr arbeitet in mehreren Schichten. Erstens SameSite-Cookies: Mit SameSite=Lax (oder Strict) schickt der Browser das Cookie bei fremden POST-Anfragen nicht mit. Zweitens die Herkunftsprüfung auf dem Server: Moderne Browser senden bei jeder Anfrage den Header Sec-Fetch-Site (same-origin, same-site, cross-site, none), den Seiten nicht fälschen können; zusätzlich gibt es den Header Origin. Bei zustandsändernden Anfragen (POST, PUT, DELETE) verlangt der Server, dass die Anfrage von der eigenen Seite kommt. Drittens ein CSRF-Token: ein geheimer, an die Sitzung gebundener Wert, den nur die eigene Seite kennt und bei jeder zustandsändernden Anfrage mitschickt.

CORS (Cross-Origin Resource Sharing) wird oft mit CSRF verwechselt. CORS regelt, ob JavaScript einer fremden Seite die Antwort lesen darf. Es schützt den Server nicht: Einfache Anfragen (Formulare, GET) werden gesendet, auch wenn CORS sie nicht erlaubt; nur die Antwort bleibt unlesbar. Deshalb ist CORS kein Ersatz für CSRF-Schutz und keine Zugriffskontrolle.

Cookies tragen die Sitzung und brauchen sichere Attribute: HttpOnly (nicht per JavaScript lesbar), Secure (nur über HTTPS), SameSite (Lax oder Strict) und Path=/. Der Name-Präfix __Host- erzwingt Secure, Path=/ und kein Domain-Attribut; der Browser lehnt Cookies ab, die das nicht erfüllen.`,
    steps: [
      'buildCookie prüft Name und Wert (nur erlaubte Zeichen), akzeptiert nur Strict, Lax oder None und verlangt für None und für __Host- das Attribut Secure. Standard ist Path=/; SameSite=Lax; Secure; HttpOnly.',
      'Der Wert eines Cookies darf kein Semikolon enthalten: Aus a; Domain=evil würde sonst ein zusätzliches Attribut (Cookie Injection). Der Test prüft diese Ablehnung.',
      'parseCookies liest den Cookie-Header und gibt bei doppelten Namen den ersten Wert zurück. Kaputte Teile ohne = werden übergangen.',
      'createCsrfToken erzeugt einen Zufallswert und hängt einen HMAC über „Sitzungs-ID + Zufall“ an. verifyCsrfToken berechnet den HMAC neu und vergleicht in konstanter Zeit. Ein Token für Sitzung 1 gilt nicht für Sitzung 2, und jedes Token ist neu.',
      'isSameOriginRequest lässt lesende Methoden durch (sie ändern nichts), prüft bei anderen zuerst Sec-Fetch-Site (nur same-origin oder none gelten) und fällt sonst auf Origin zurück. Fehlt beides, wird abgelehnt. same-site (eine Nachbar-Subdomain) zählt bewusst nicht.',
      'Der Vergleich von Origin ist ein ganzer Vergleich, kein Teilstring: https://app.example.evil.example wird abgelehnt. corsHeaders gibt Header nur für Origins aus einer Liste zurück und setzt Vary: Origin.',
      'Mini-Bank im Test: /login setzt ein __Host-sid-Cookie. Der „Angriff“ (Cookie vorhanden, aber Origin fremd, Sec-Fetch-Site cross-site) bekommt 403; eine Anfrage mit gleicher Herkunft, aber ohne Token ebenfalls 403. Erst mit Token funktioniert die Überweisung (Kontostand 90).',
      'Zur Gegenprobe läuft dieselbe Mini-Bank ohne Schutz: Dieselbe fremde Anfrage hat Erfolg (200). Der Test dokumentiert so, was der Schutz verhindert. Das SameSite-Verhalten im Browser wurde nicht geprüft; es greift beim Browser, nicht beim Server.',
    ],
    background: `Warum Token und Herkunftsprüfung, wenn es SameSite gibt? Weil jede Schicht ihre Grenzen hat. SameSite=Lax erlaubt das Cookie noch bei Navigationen mit GET; deshalb dürfen GET-Anfragen nichts ändern. Ältere oder ungewöhnliche Browser verhalten sich anders, und „same-site“ umfasst auch Nachbar-Subdomains, die gekapert werden könnten. Sec-Fetch-Site setzt der Browser selbst, aber nicht jeder Client (curl, Skripte) schickt es; für diese zählt das Token. Mit mehreren unabhängigen Schichten genügt es nicht, eine zu umgehen.

Warum ein HMAC über die Sitzung? Das Token ist an genau diese Sitzung gebunden, ein Angreifer kann also kein eigenes Token mit fremder Sitzung benutzen. Der Server muss keinen Zustand speichern, nur das Geheimnis kennen. Das Geheimnis stammt aus der Konfiguration und gehört nie in den Code (im Lab wird es pro Start zufällig erzeugt).

CORS richtig einstellen: Spiegle den Origin nie ungeprüft zurück und nutze nie „*“ zusammen mit Cookies (Browser verbieten die Kombination). Lege eine feste Liste erlaubter Origins an und prüfe genau. Setze Vary: Origin, damit Caches Antworten nicht falsch ausliefern. Beachte außerdem, dass der Origin null auftreten kann (etwa bei lokalen Dateien oder Sandbox-Frames) und nicht in die Liste gehört.

Die Grenzen dieser Lektion: Das Verhalten von SameSite, Sec-Fetch-Site und CORS im Browser wurde nicht geprüft; geprüft wurde die Server-Logik mit simulierten Headern und echten HTTP-Anfragen gegen einen lokalen Test-Server.`,
    terms: [
      { term: 'CSRF', text: 'Eine fremde Seite löst mit den Cookies des Opfers eine Anfrage an deine Seite aus.' },
      { term: 'SameSite', text: 'Cookie-Attribut: schränkt ein, wann das Cookie bei Anfragen von anderen Seiten mitgesendet wird.' },
      { term: 'Sec-Fetch-Site', text: 'Vom Browser gesetzter Header: same-origin, same-site, cross-site oder none.' },
      { term: 'CORS', text: 'Regeln, ob JavaScript einer anderen Herkunft Antworten lesen darf.' },
      { term: '__Host-', text: 'Cookie-Namenspräfix: erzwingt Secure, Path=/ und kein Domain-Attribut.' },
    ],
    code: { file: lab + 'src/csrf/csrf.js', lang: 'JavaScript' },
    code2: { file: lab + 'src/common/cookies.js', lang: 'JavaScript' },
    code3: { file: lab + 'tests/csrf.test.js', lang: 'JavaScript', from: "test('Anwendung: Angriff", to: "assert.equal(noSession.status, 401);", plus: 1 },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: `Set-Cookie der Mini-Bank: __Host-sid=<43 Zeichen>; Path=/; SameSite=Lax; Secure; HttpOnly; Max-Age=3600
POST /transfer mit Cookie, Origin https://evil.example, Sec-Fetch-Site cross-site   -> 403
POST /transfer, gleiche Herkunft, aber ohne CSRF-Token                              -> 403
POST /transfer mit Token                                                            -> 200 {"balance":90}
Dieselbe fremde Anfrage ohne CSRF-Schutz (Vorführung)                               -> 200 (Überweisung ausgelöst)
CORS: Origin https://app.example -> Access-Control-Allow-Origin gesetzt, Vary: Origin; https://evil.example -> kein Header
Tests: CSRF/CORS/Cookies (7) grün auf Node 22.23 und 24.22. Browser-Verhalten (SameSite, CORS) NICHT geprüft.`,
    mistakes: [
      { wrong: 'Zustandsändernde Aktionen über GET anbieten.', why: 'GET-Anfragen lassen sich einfach auslösen (Bild, Link), und SameSite=Lax schützt sie nicht.', fix: 'Änderungen nur über POST/PUT/DELETE und mit CSRF-Prüfung.' },
      { wrong: 'CORS mit * oder mit zurückgespiegeltem Origin „großzügig“ einstellen.', why: 'Jede Seite darf dann Antworten lesen, auch angemeldete; mit Cookies verbieten Browser die Kombination mit * ohnehin.', fix: 'Feste Liste erlaubter Origins, genau vergleichen, Vary: Origin setzen.' },
      { wrong: 'CORS für einen Schutz des Servers halten.', why: 'Der Server verarbeitet einfache Anfragen trotzdem; CORS betrifft nur das Lesen der Antwort im Browser.', fix: 'Server mit CSRF-Prüfung und Zugriffskontrolle schützen, CORS nur als Browser-Regel verstehen.' },
      { wrong: 'Sitzungs-Cookies ohne HttpOnly, Secure und SameSite setzen.', why: 'Skripte können sie lesen (XSS), sie gehen über unverschlüsselte Verbindungen, und fremde Seiten lösen Anfragen mit dem Cookie aus.', fix: 'buildCookie-ähnliche Hilfsfunktion mit sicheren Standardwerten und __Host-Präfix.' },
    ],
    practice: 'Prüfe jede Route, die etwas ändert: Welche Methode? Welche Herkunftsprüfung? Welches Token? Setze Cookies über eine zentrale Funktion mit sicheren Standardwerten, lege CORS als feste Liste an und teste Angriffs-Anfragen (fremder Origin, fehlendes Token) automatisiert.',
    exercises: [
      { task: 'Schreibe einen Test, der ein CSRF-Token einer Sitzung A bei einer Anfrage in Sitzung B verwendet und das Ergebnis prüft.', acceptance: 'Die Anfrage wird mit 403 abgelehnt, weil das Token an Sitzung A gebunden ist.' },
      { task: 'Grenzfall: Was passiert bei einer POST-Anfrage ohne Sec-Fetch-Site, aber mit Origin: null? Und bei Sec-Fetch-Site: same-site von einer Nachbar-Subdomain?', acceptance: 'Origin: null wird abgelehnt (ungleich der erwarteten Herkunft); same-site wird abgelehnt; du begründest, warum Subdomains nicht automatisch vertrauenswürdig sind.' },
      { task: 'Fehlerfall: Setze corsHeaders testweise so um, dass der Origin ungeprüft gespiegelt wird. Welcher Test schlägt an, und welche Seiten könnten Antworten lesen?', acceptance: 'Der Test für https://evil.example schlägt an; du erklärst, dass eine fremde Seite mit den Cookies des Opfers Antworten lesen könnte.' },
    ],
    quiz: [
      { q: 'Warum funktioniert CSRF überhaupt?',
        options: ['Browser senden Cookies automatisch mit, auch wenn eine fremde Seite die Anfrage ausgelöst hat.', 'Weil die Passwörter der Nutzer zu schwach gewählt sind.', 'Weil die Verbindung nicht über HTTPS aufgebaut wird.', 'Weil Server grundsätzlich keine Anfragen auf ihre Herkunft prüfen können.'],
        correct: 0,
        rationales: ['Die Anfrage wirkt für den Server echt, weil das Sitzungs-Cookie dabei ist.', 'Mit Passwörtern hat es nichts zu tun.', 'Auch über HTTPS funktioniert der Angriff.', 'Server können Herkunft und Token prüfen; sie müssen es nur tun.'],
        explain: 'Automatisch mitgesendete Cookies machen fremde Anfragen „angemeldet“.' },
      { q: 'Was regelt CORS?',
        options: ['Ob JavaScript einer anderen Herkunft die Antwort im Browser lesen darf.', 'Ob der Server eine Anfrage überhaupt verarbeitet.', 'Ob Passwörter verschlüsselt werden.', 'Ob Cookies gesetzt werden dürfen.'],
        correct: 0,
        rationales: ['CORS betrifft das Lesen der Antwort im Browser.', 'Einfache Anfragen verarbeitet der Server trotzdem.', 'Mit Passwörtern hat CORS nichts zu tun.', 'Cookies regelt ein eigener Mechanismus.'],
        explain: 'CORS ist kein Server-Schutz und kein Ersatz für CSRF-Prüfungen.' },
      { q: 'Welche Schicht erkennt eine CSRF-Anfrage ohne gespeicherten Zustand, indem sie einen an die Sitzung gebundenen Wert prüft?',
        options: ['Ein signiertes CSRF-Token (HMAC über Sitzung und Zufall).', 'Das Attribut HttpOnly.', 'Die Länge des Passworts.', 'Das Attribut Secure.'],
        correct: 0,
        rationales: ['Nur die eigene Seite kennt den Wert, der Server prüft ihn mit dem Geheimnis.', 'HttpOnly schützt vor dem Lesen durch Skripte.', 'Passwortlänge ist unabhängig von CSRF.', 'Secure beschränkt das Cookie auf HTTPS.'],
        explain: 'Das Token beweist, dass die Anfrage von einer Seite kommt, die den Wert kannte.' },
    ],
    sources: [
      cheat('Cross-Site Request Forgery Prevention', 'Cross-Site_Request_Forgery_Prevention_Cheat_Sheet'),
      mdn('Cross-Origin Resource Sharing (CORS)', 'Web/HTTP/Guides/CORS'),
      mdn('Using HTTP cookies (SameSite, __Host-)', 'Web/HTTP/Guides/Cookies'),
      docs('web.dev: Fetch Metadata (Sec-Fetch-Site)', 'https://web.dev/articles/fetch-metadata', 'Erklärt Sec-Fetch-Headers und serverseitige Prüfung.'),
    ],
    verification: 'Lab websec-lab: Token, Herkunftsprüfung, CORS-Liste, Cookie-Builder und die Mini-Bank (mit und ohne Schutz, echte HTTP-Anfragen gegen 127.0.0.1) wurden auf Node.js 22.23 und 24.22 getestet. NICHT geprüft: Das Verhalten von Browsern (SameSite-Standardwerte, Sec-Fetch-Site, Preflight), Single-Page-Anwendungen mit Doppel-Cookie-Verfahren und TLS.',
  },
  {
    id: 'ws-m1-l5', title: 'Zugriffskontrolle: IDOR, Rollen, Path Traversal und SSRF', minutes: 55,
    prerequisites: 'Lektionen 1 bis 4 dieses Moduls; Dateien und Pfade (Modul node-m1).',
    objectives: [
      'Unsichere direkte Objektverweise (IDOR) erkennen und mit Besitzprüfung auf dem Server verhindern',
      'Rollenprüfung pro Funktion umsetzen und Mass Assignment durch Allowlists vermeiden',
      'Path Traversal inklusive symbolischer Links abwehren',
      'Server-Side Request Forgery (SSRF) mit Adress- und Schema-Prüfung und der Verwendung der geprüften Adresse eindämmen',
    ],
    simple: `Zugriffskontrolle entscheidet bei jeder Anfrage: Darf genau diese Person genau diese Sache? Fehler hier führen die OWASP-Liste an (A01:2025). Das typische Muster ist IDOR (insecure direct object reference, auch BOLA): Die Anwendung ruft /rechnung/2 auf und prüft nur, ob jemand angemeldet ist, nicht, ob die Rechnung ihm gehört. Wer 1, 2, 3 durchprobiert, sieht fremde Daten. Die Abwehr ist eine Besitzprüfung auf dem Server bei jedem Zugriff. Zufällige Kennungen (UUIDs) erschweren das Raten, ersetzen die Prüfung aber nicht.

Zwei Ergänzungen: Funktionsebene und Felder. Verwaltungsfunktionen prüfen die Rolle jedes Mal auf dem Server; eine versteckte Schaltfläche schützt nichts. Und beim Anlegen oder Ändern übernimmt die Anwendung nur die erlaubten Felder aus der Eingabe (Allowlist). Sonst kann jemand zusätzlich "role": "admin" mitschicken (Mass Assignment).

Auch Dateizugriffe sind Zugriffskontrolle. Path Traversal liegt vor, wenn ein Nutzerpfad mit ../ aus dem erlaubten Ordner herausführt. Die Abwehr löst den Pfad vollständig auf und prüft, dass das Ergebnis unterhalb des Ordners bleibt; zusätzlich muss der echte Pfad (realpath) geprüft werden, weil ein Link im Ordner nach außen zeigen kann.

SSRF (Server-Side Request Forgery) tritt auf, wenn der Server eine vom Nutzer genannte Adresse abruft (Vorschau, Webhook, Bildimport). Ein Angreifer nennt dann interne Adressen: localhost, das private Netz oder den Metadatendienst der Cloud (169.254.169.254). Der Server fragt mit seinen eigenen Rechten, hinter der Firewall. Die Abwehr prüft Schema und Ziel, löst den Namen selbst auf, lehnt private und lokale Adressen ab, verwendet genau die geprüfte Adresse und folgt Weiterleitungen nicht blind.`,
    steps: [
      'getInvoiceUnsafe gibt jede Rechnung zurück, wenn man die Nummer kennt. getInvoice prüft Besitz (ownerId) oder die Rolle admin und wirft für fremde und für fehlende Rechnungen denselben Fehler (404). So verrät die Antwort nicht, ob eine Nummer existiert.',
      'requireRole prüft die Rolle für Verwaltungsfunktionen bei jedem Aufruf, nicht nur in der Oberfläche. pick übernimmt nur genannte Felder aus der Eingabe; auch das Feld __proto__ verändert dabei nichts, und das Prototyp-Objekt bleibt unberührt.',
      'joinInside löst root und Nutzerpfad auf und lehnt ../, absolute Pfade und a/../../b ab. Ein Name, der nur mit .. beginnt („..hidden“), ist erlaubt, weil der Vergleich auf den Ordnerwechsel „.." prüft, nicht auf das Präfix.',
      'Der Test zeigt die Lücke der reinen Textprüfung: Ein symbolischer Link innerhalb des Ordners, der auf eine Datei außerhalb zeigt, wird von joinInside akzeptiert.',
      'resolveInside ergänzt realpath für Wurzel und Ziel und vergleicht die echten Pfade. Der Link wird abgelehnt, eine fehlende Datei meldet ENOENT, ein Nullzeichen im Pfad wird als TypeError abgelehnt.',
      'isBlockedAddress sperrt Adressbereiche: 127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16 (Link-Local, darin der Cloud-Metadatendienst), 0.0.0.0/8 und weitere sowie ::1, fc00::/7, fe80::/10 und in IPv6 verpackte IPv4-Adressen (::ffff:127.0.0.1).',
      'resolvePublicTarget prüft Schema (nur http und https), verbietet Zugangsdaten in der URL, löst den Namen auf, lehnt ab, sobald auch nur eine Adresse gesperrt ist (gemischte Antworten), und liefert die geprüfte Adresse zurück. Der URL-Parser normalisiert Schreibweisen wie http://2130706433/, http://0x7f.1/ und http://[::ffff:127.0.0.1]/; alle werden blockiert.',
      'Optional ist eine Liste erlaubter Hosts (allowedHosts) die stärkste Maßnahme: Es sind nur bekannte Ziele zugelassen. Im Lab wird DNS ersetzt; ein echter Abruf wurde nicht ausgeführt.',
    ],
    background: `Warum 404 statt 403? Ein „Keine Berechtigung“ bestätigt, dass die Ressource existiert. Für Angreifer ist das eine Information (welche Rechnungsnummern gibt es?). Mit demselben 404 für „fremd“ und „fehlt“ lernen sie nichts. Für Nutzer ist „Nicht gefunden“ meist ebenso verständlich. Intern sollte der Versuch trotzdem protokolliert werden (Lektion 9), um Raten zu erkennen.

Warum geprüfte Adresse verwenden? Prüft man den Namen erst gegen DNS und verbindet dann erneut über den Namen, kann der Angreifer die DNS-Antwort zwischen beiden Schritten ändern (DNS-Rebinding): zuerst öffentlich, dann 127.0.0.1. Deshalb verbindet man mit der geprüften IP-Adresse (und setzt den Host-Header selbst) oder nutzt eine feste Liste erlaubter Ziele. Auch Weiterleitungen sind ein Weg: Ein erlaubter Server leitet auf eine interne Adresse um. Der Abruf sollte Weiterleitungen nicht automatisch folgen (redirect: "manual"), sondern jede Zieladresse erneut prüfen. Das Lab zeigt die Prüfung; das Verbinden mit der Adresse und die Weiterleitungsbehandlung wurden nicht ausgeführt.

Wie weit reicht Path Traversal? Nicht nur ../ zählt: kodierte Varianten (%2e%2e), Nullzeichen, Windows-Trenner und Links. Webserver dekodieren Pfade meist bevor die Anwendung sie sieht; prüfe daher das Endergebnis (aufgelöster, echter Pfad), nicht die Eingabeform. Noch besser ist, Nutzern keine Pfade zu geben, sondern Kennungen, die der Server selbst auf Dateien abbildet. Windows-spezifische Fälle wurden nicht geprüft.

Zur Einordnung: A01:2025 fasst laut OWASP Fehler wie CWE-22 (Path Traversal), CWE-352 (CSRF), CWE-639 (benutzergesteuerter Schlüssel, also IDOR) und CWE-918 (SSRF) zusammen. Die Zusammenführung von SSRF in diese Kategorie zeigt, dass es letztlich um dieselbe Frage geht: Wer darf was, und wer entscheidet das?`,
    terms: [
      { term: 'IDOR / BOLA', text: 'Zugriff auf fremde Objekte, weil nur die Kennung, nicht der Besitz geprüft wird.' },
      { term: 'Mass Assignment', text: 'Alle Eingabefelder werden übernommen, auch solche, die der Nutzer nicht setzen darf.' },
      { term: 'Path Traversal', text: 'Ein Pfad verlässt mit ../ den erlaubten Ordner.' },
      { term: 'SSRF', text: 'Der Server ruft auf Wunsch eines Angreifers interne oder geschützte Adressen ab.' },
      { term: 'DNS-Rebinding', text: 'Ein Name wird erst öffentlich, dann intern aufgelöst, um die Prüfung zu umgehen.' },
    ],
    code: { file: lab + 'src/access/guards.js', lang: 'JavaScript' },
    code2: { file: lab + 'src/access/paths.js', lang: 'JavaScript' },
    code3: { file: lab + 'src/access/ssrf.js', lang: 'JavaScript', from: 'Prüft eine URL', to: 'return { url, address };', back: 1, plus: 1 },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: `IDOR: getInvoiceUnsafe(invoices, 2) -> Rechnung von "grace" (250) für jede Person
      getInvoice(invoices, ada, 2) und getInvoice(invoices, ada, 99) -> beide 404 "Nicht gefunden"; admin -> 250
Path Traversal: ../geheim.txt, /etc/passwd, a/../../geheim.txt -> RangeError
      Link public/link.txt -> ../geheim.txt: joinInside akzeptiert (Text), resolveInside lehnt ab ("Link")
SSRF (DNS im Test ersetzt): blockiert 127.0.0.1, 10.1.2.3, 172.16.0.1, 192.168.1.1, 169.254.169.254, ::1, fe80::1,
      fd00::1, ::ffff:127.0.0.1; erlaubt 93.184.216.34, 8.8.8.8, 172.32.0.1
      http://2130706433/ und http://0x7f.1/ (Schreibweisen für 127.0.0.1) -> blockiert
Tests: Zugriffskontrolle (5) grün auf Node 22.23 und 24.22. Echter Netzabruf und Windows-Pfade NICHT geprüft.`,
    mistakes: [
      { wrong: 'Nur zu prüfen, ob jemand angemeldet ist, nicht, ob ihm das Objekt gehört.', why: 'Jeder angemeldete Nutzer kann fremde Datensätze lesen oder ändern, indem er die Kennung ändert (IDOR).', fix: 'Besitz- und Rollenprüfung bei jedem Zugriff auf dem Server, am besten zentral in der Datenzugriffsschicht.' },
      { wrong: 'Zugriffsschutz nur in der Oberfläche zu verstecken (Schaltfläche ausblenden).', why: 'Angreifer rufen die Schnittstelle direkt auf.', fix: 'requireRole bzw. eine Richtlinie auf jeder Server-Route.' },
      { wrong: 'Pfade nur auf ".." zu prüfen und symbolische Links zu ignorieren.', why: 'Ein Link im erlaubten Ordner kann nach außen zeigen.', fix: 'Pfad auflösen, realpath nutzen und das Ergebnis mit dem echten Wurzelpfad vergleichen.' },
      { wrong: 'Den Hostnamen einer URL zu prüfen und danach erneut über den Namen zu verbinden.', why: 'DNS kann zwischen Prüfung und Verbindung wechseln (Rebinding), und Weiterleitungen führen nach innen.', fix: 'Mit der geprüften Adresse verbinden, Weiterleitungen einzeln prüfen und nach Möglichkeit eine Allowlist verwenden.' },
    ],
    practice: 'Lege für jede Ressource eine zentrale Zugriffsfunktion an, die Besitz und Rolle prüft, und rufe Daten nur darüber ab. Schreibe für jede Route Tests mit einer zweiten Person (fremdes Objekt) und ohne Anmeldung. Lasse Server nie beliebige Adressen oder Pfade abrufen; nutze Allowlists und feste Zuordnungen.',
    exercises: [
      { task: 'Schreibe einen Test, der prüft, dass „ada“ die Rechnung von „grace“ weder lesen noch löschen kann, und füge eine deleteInvoice-Funktion mit derselben Prüfung hinzu.', acceptance: 'Beide Zugriffe liefern 404; admin darf; es gibt Tests für beide Rollen und für eine fehlende Rechnung.' },
      { task: 'Grenzfall: Prüfe resolveInside mit einem Link auf eine Datei im selben Ordner, mit einem Link auf ein Verzeichnis außerhalb und mit einem Link im Kreis.', acceptance: 'Der Link innerhalb des Ordners ist erlaubt, der Link nach außen wird abgelehnt, der Kreis-Link erzeugt einen Fehler (ELOOP); du dokumentierst das Verhalten.' },
      { task: 'Fehlerfall: Lass resolvePublicTarget eine Adresse in der Form http://[::ffff:7f00:1]/ prüfen und eine mit Zugangsdaten (http://user:pw@host/). Was passiert und warum?', acceptance: 'Die erste wird als IPv4-in-IPv6 erkannt und blockiert, die zweite wird wegen der Zugangsdaten abgelehnt.' },
    ],
    quiz: [
      { q: 'Wie verhinderst du IDOR zuverlässig?',
        options: ['Bei jedem Zugriff serverseitig prüfen, ob das Objekt der Person gehört oder sie die Rolle hat.', 'Die Kennungen zufällig wählen und sonst nichts weiter prüfen.', 'Die Kennung in der Oberfläche verbergen, damit niemand sie sieht.', 'Nur Administratoren anmelden lassen und allen anderen den Zugang sperren.'],
        correct: 0,
        rationales: ['Eine Prüfung auf dem Server ist der einzige verlässliche Schutz.', 'Zufällige Kennungen erschweren das Raten, ersetzen die Prüfung aber nicht.', 'Angreifer rufen die Schnittstelle direkt auf.', 'Das löst das Problem der Rechte nicht.'],
        explain: 'Besitz- und Rollenprüfung gehört zu jedem Zugriff, nicht nur zur Anmeldung.' },
      { q: 'Warum reicht eine reine Textprüfung auf ".." bei Dateipfaden nicht?',
        options: ['Ein symbolischer Link im erlaubten Ordner kann auf eine Datei außerhalb zeigen.', 'Weil .. keine Bedeutung hat.', 'Weil Dateinamen nie Punkte enthalten.', 'Weil Pfade immer absolut sind.'],
        correct: 0,
        rationales: ['Erst der echte Pfad (realpath) zeigt, wohin der Zugriff führt.', '.. führt in das übergeordnete Verzeichnis.', 'Dateinamen dürfen Punkte enthalten.', 'Nutzerpfade sind meist relativ.'],
        explain: 'Prüfe den aufgelösten, echten Pfad, nicht nur die Eingabe.' },
      { q: 'Was verhindert die Prüfung der Adresse nach dem DNS-Abruf bei SSRF?',
        options: ['Dass der Server im Auftrag eines Angreifers interne Ziele wie 127.0.0.1 oder 169.254.169.254 abruft.', 'Dass Nutzer ihre Passwörter ändern und damit Sitzungen beenden.', 'Dass Seiten langsam laden, weil zu viele Adressen geprüft werden.', 'Dass Cookies mit ungültigen Attributen gesetzt werden können.'],
        correct: 0,
        rationales: ['Interne Adressen sind für den Server erreichbar, für Angreifer von außen nicht.', 'Mit Passwörtern hat SSRF nichts zu tun.', 'Die Prüfung ist keine Leistungsmaßnahme.', 'Cookies sind nicht betroffen.'],
        explain: 'Der Server soll nur Ziele abrufen, die er selbst als sicher eingestuft hat.' },
    ],
    sources: [
      top10('A01 Broken Access Control', 'A01_2025-Broken_Access_Control'),
      cheat('Authorization', 'Authorization_Cheat_Sheet'),
      cheat('Insecure Direct Object Reference Prevention', 'Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet'),
      cheat('Server-Side Request Forgery Prevention', 'Server_Side_Request_Forgery_Prevention_Cheat_Sheet'),
      docs('Node.js: fs.realpath und path', 'https://nodejs.org/api/fs.html#fspromisesrealpathpath-options', 'Löst symbolische Links auf; Grundlage der Prüfung.'),
    ],
    verification: 'Lab websec-lab: Besitzprüfung, Rollen, Mass Assignment, Path Traversal inklusive symbolischem Link (Dateisystem im temporären Ordner) und die SSRF-Prüfung (Adressbereiche, Schreibweisen, gemischte DNS-Antworten mit ersetztem DNS) wurden auf Node.js 22.23 und 24.22 getestet. NICHT geprüft: echte DNS-Abfragen, Verbinden mit der geprüften Adresse, Weiterleitungen, Windows-Pfade, kodierte Pfade (%2e%2e) und Cloud-Metadatendienste.',
  },
];
