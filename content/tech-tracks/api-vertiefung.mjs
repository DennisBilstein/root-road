// APIs & Integration · Vertiefung. Stichtag 14.11.2026.
// Eigene Texte; Code und Tests liegen unter content/examples/api-lab/ (Node.js ohne Abhängigkeiten, node:test).
// Die Testausgaben der Lektionen entstehen beim Erzeugen aus einem echten Lauf der Tests; schlägt ein Test fehl, bricht der Generator ab.
import { spawnSync } from 'node:child_process';

const lab = 'content/examples/api-lab/';
const nodeVersion = process.version;

/** Führt die genannten Testdateien aus und gibt Testnamen und Summen ohne Laufzeiten zurück. */
const specOutput = (...names) => {
  const run = spawnSync(process.execPath, ['--test', '--test-reporter=spec', ...names.map((name) => `tests/${name}.test.js`)], { cwd: lab, encoding: 'utf8' });
  if (run.status !== 0) throw new Error(`API-Lab-Tests fehlgeschlagen:\n${run.stdout}\n${run.stderr}`);
  const lines = run.stdout.split('\n')
    .filter((line) => /^(✔|ℹ (tests|pass|fail))/.test(line))
    .map((line) => line.replace(/\s*\([\d.]+ms\)$/, ''));
  return `Node.js ${nodeVersion}, node --test in ${lab}\n${lines.join('\n')}`;
};

const rfc = (number, title, note = 'Standard; Inhalt hier eigenständig zusammengefasst.') => ({ title: `RFC ${number}: ${title}`, url: `https://www.rfc-editor.org/rfc/rfc${number}.html`, note });
const mdn = (title, path, note = 'Referenz; Inhalt hier eigenständig zusammengefasst.') => ({ title: `MDN: ${title}`, url: `https://developer.mozilla.org/en-US/docs/${path}`, note });
const owasp = (title, page) => ({ title: `OWASP API Security Top 10 (2023): ${title}`, url: `https://api-security.owasp.org/editions/2023/en/${page}/`, note: 'Risikobeschreibung; Inhalt hier eigenständig zusammengefasst.' });

export const module = {
  id: 'api-m2', course: 'apis', part: 26, partTitle: 'APIs & Integration',
  title: 'APIs bauen und prüfen · Fehler, Paginierung, Wiederholung, Zugriff und Verträge',
};

const prerequisites = 'Modul „API-Arten · Verträge, Auth und Ereignisse“, besonders HTTP und REST, und Grundkenntnisse in JavaScript und Node.js.';
const verification = (what, notTested) => `Geprüft wurde mit den Tests des API-Labs (node:test, Node.js ${nodeVersion} lokal, zusätzlich 24.22 im Container): ${what} Die Tests starten die API auf 127.0.0.1 und prüfen Statuscodes, Header und Rümpfe. Nicht geprüft: ${notTested}`;

export const lessons = [
  {
    id: 'api-m2-l1', title: 'Ressourcen, Methoden und Statuscodes sauber entwerfen', minutes: 35,
    prerequisites,
    objectives: [
      'Eine Ressource mit Sammlung und Einzelressource entwerfen und passende Methoden zuordnen',
      'Statuscodes für Anlegen, Lesen, Ändern, Löschen und Fehler begründet wählen',
      'Falsche Methoden, Medientypen und zu große Rümpfe mit 405, 415 und 413 beantworten',
      'Interne Felder aus der öffentlichen Darstellung heraushalten',
    ],
    simple: `Eine API ist ein Vertrag zwischen deinem Server und fremdem Code. Je klarer der Vertrag, desto weniger muss der Client raten. Bei HTTP-APIs besteht der Vertrag zu einem großen Teil aus Ressourcen (Dingen mit einer Adresse, hier Notizen) und Methoden (was man mit ihnen tun darf).

Die Sammlung /v1/notes bietet GET (auflisten) und POST (neu anlegen). Eine einzelne Notiz unter /v1/notes/0001 bietet GET (lesen), PUT (ersetzen) und DELETE (löschen). Jede andere Methode ist ein Fehler, und die Antwort sagt, welche erlaubt wären.

Der Statuscode ist die erste Information, die ein Client auswertet. 201 heißt „angelegt“ und kommt mit einem Location-Header, der die Adresse der neuen Notiz nennt. 204 heißt „erledigt, nichts zurückzugeben“. 404 heißt „gibt es nicht“. Wer immer 200 mit einem Fehlertext im Rumpf liefert, zwingt jeden Client, Texte zu parsen.`,
    steps: [
      'Wechsle in content/examples/api-lab und starte „npm test“ (oder nur „node --test tests/notes.test.js“). Die API läuft nur im Test auf 127.0.0.1 und nutzt nur eingebaute Node-Module.',
      'Öffne src/app.js und suche die Funktion route. Eine reguläre Ausdruckszeile zerlegt den Pfad in Version, Sammlung und Kennung. Danach legt die Liste allowed fest, welche Methoden die Sammlung (GET, POST) und die Einzelressource (GET, PUT, DELETE) kennen.',
      'Der erste Test legt eine Notiz an: Antwort 201, Header Location zeigt auf /v1/notes/<id>, und ETag nennt die Version. Die Antwort enthält das Feld owner nicht; publicNote entfernt es. Interne Felder gehören nicht in den Vertrag.',
      'Lesen, Ändern und Löschen folgen: GET liefert dieselbe Darstellung, PUT ersetzt (Version 2), DELETE antwortet 204 ohne Rumpf. Das zweite DELETE liefert 404, weil die Ressource nicht mehr existiert. Der Zustand des Servers ist nach beiden Aufrufen gleich; das ist mit „idempotent“ gemeint, auch wenn die Antworten verschieden sind.',
      'Der zweite Test prüft Fehler am Rand: DELETE auf die Sammlung → 405 mit Header „Allow: GET, POST“. Ein Rumpf mit Content-Type text/plain → 415, ein Rumpf über 16 KiB → 413. Unbekannter Pfad und ungültige Kennung ("abc") → 404.',
      'Lies, wo 413 entsteht: readBody prüft zuerst den Header Content-Length und danach die tatsächlich gelesene Größe. Ein Client darf lügen; deshalb zählt der Server mit.',
      'Ergänze im Kopf eine Ressource „Schlagwörter“ (/v1/tags): Welche Methoden und Statuscodes würdest du festlegen, und was passiert beim Löschen eines benutzten Schlagworts?',
    ],
    background: `Sichere und idempotente Methoden: GET ändert nichts („sicher“), PUT und DELETE ändern den Zustand, aber mehrfach ausgeführt ergibt sich derselbe Endzustand („idempotent“). POST ist weder noch: Zwei identische Anfragen erzeugen zwei Notizen. Das ist der Grund, warum Wiederholungen nach Zeitüberschreitungen bei POST ein eigenes Problem sind (Lektion 4).

Die URL benennt Dinge, nicht Handlungen: /v1/notes statt /v1/createNote. Kennungen sind für den Client undurchsichtig; er baut keine IDs selbst zusammen, sondern folgt dem Location-Header. So darfst du die Kennungen später ändern, ohne den Vertrag zu brechen.

Welche Statuscodes sind „richtig“? Die Bedeutung der Codes steht in RFC 9110 (HTTP Semantics). Wichtig ist, sie konsistent und im Sinne der Norm zu verwenden und in der Schnittstellenbeschreibung festzuhalten (Lektion 8). Dass ein zweites DELETE hier 404 liefert, ist eine Entwurfsentscheidung: Manche APIs antworten wieder 204, weil das Ziel („Ressource ist weg“) erreicht ist. Beide Varianten sind idempotent; entscheide dich einmal und dokumentiere es.`,
    terms: [
      { term: 'Ressource', text: 'Ein Ding mit eigener Adresse (URL), das die API darstellt und über Methoden bearbeitbar macht.' },
      { term: 'idempotent', text: 'Mehrfaches Ausführen führt zum selben Serverzustand wie einmaliges Ausführen (GET, PUT, DELETE; nicht POST).' },
      { term: 'Location', text: 'Antwort-Header, der bei 201 die Adresse der neu angelegten Ressource nennt.' },
      { term: 'Allow', text: 'Antwort-Header bei 405, der die erlaubten Methoden aufzählt.' },
    ],
    code: { file: lab + 'src/app.js', lang: 'JavaScript', from: 'const allowed = id', to: 'else result = deleteNote(identity, id);' },
    code2: { file: lab + 'tests/notes.test.js', lang: 'JavaScript', from: "const created = await call(api, 'POST'", to: '.status, 404);' },
    code3: { file: lab + 'tests/notes.test.js', lang: 'JavaScript', from: 'const wrongMethod', to: 'assert.equal(tooLarge.status, 413);' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: specOutput('notes'),
    mistakes: [
      { wrong: 'Auf jede Anfrage mit 200 zu antworten und den Fehler nur im Rumpf zu beschreiben.', why: 'Clients, Caches, Monitoring und Wiederholungslogik hängen am Statuscode; ein Fehler mit 200 bleibt unsichtbar.', fix: 'Fehlerstatus verwenden (4xx für Clientfehler, 5xx für Serverfehler) und den Rumpf als Ergänzung.' },
      { wrong: 'Verben in URLs zu verwenden (/createNote, /deleteNote/7).', why: 'Die Methode trägt die Handlung bereits; Verb-URLs vervielfachen Adressen und verwischen Caching und Sicherheit.', fix: 'Substantive für Ressourcen, Methoden für Handlungen; nur für echte Vorgänge ein eigener Unterpfad.' },
      { wrong: 'Interne Datenbankfelder (Besitzer, interne IDs) ungefiltert auszugeben.', why: 'Jedes ausgegebene Feld ist Teil des Vertrags und kann nicht mehr leicht entfernt werden; außerdem können sensible Daten austreten.', fix: 'Eine eigene öffentliche Darstellung festlegen (hier publicNote) und nur diese ausgeben.' },
      { wrong: 'Bei einer nicht erlaubten Methode 404 oder 500 zu antworten.', why: 'Der Client erfährt nicht, dass die Adresse existiert, nur die Methode falsch ist.', fix: '405 mit Allow-Header senden.' },
    ],
    practice: 'Entwirf die Ressource „Aufgaben“ mit Titel, Status und Fälligkeitsdatum: Tabelle mit URL, Methode, Erfolgsstatus, Fehlerstatus und Header. Implementiere sie im API-Lab neben den Notizen und schreibe pro Zeile der Tabelle einen Test.',
    exercises: [
      { task: 'Ergänze HEAD für /v1/notes/{id} als Methode ohne Rumpf, die dieselben Header wie GET liefert.', acceptance: 'Ein Test prüft Status 200 und ETag-Header ohne Rumpf; allowed und die 405-Antwort nennen HEAD; du erklärst, warum HEAD „sicher“ ist.' },
      { task: 'Grenzfall: Sende ein PUT mit Content-Type „application/json; charset=utf-8“ und eines mit „Application/JSON“.', acceptance: 'Beide werden akzeptiert (der Medientyp ist nicht von Groß-/Kleinschreibung abhängig); du zeigst die Stelle im Code und ergänzt einen Test.' },
      { task: 'Fehlerfall: Entferne den Allow-Header aus der 405-Antwort.', acceptance: 'Der Test schlägt fehl; du erklärst, warum die Norm den Header bei 405 verlangt, und stellst ihn wieder her.' },
    ],
    quiz: [
      { q: 'Welcher Status passt zu einem erfolgreichen POST, das eine neue Notiz anlegt?',
        options: ['200 ohne Location-Header.', '201 mit Location-Header auf die neue Notiz.', '202 und Antwort ohne Rumpf.', '204 ohne weitere Angabe.'],
        correct: 1,
        rationales: ['Das sagt nicht, dass etwas Neues entstanden ist, und nennt keine Adresse.', '201 bedeutet „angelegt“, Location nennt die Adresse.', '202 steht für „angenommen, noch nicht verarbeitet“.', '204 meldet Erfolg ohne Inhalt, nicht aber, dass etwas entstanden ist.'],
        explain: '201 mit Location folgt der Bedeutung der Codes in RFC 9110 und lässt den Client der Adresse folgen.' },
      { q: 'Was bedeutet „idempotent“ bei DELETE?',
        options: ['Die Anfrage verändert den Server nie.', 'Die Antwort ist immer identisch.', 'Mehrfaches Senden führt zum selben Serverzustand wie einmaliges.', 'Die Anfrage darf nur einmal gesendet werden.'],
        correct: 2,
        rationales: ['Das wäre „sicher“.', 'Das erste DELETE liefert 204, das zweite 404; der Zustand ist gleich, die Antwort nicht.', 'Danach ist die Ressource weg, egal wie oft man löscht.', 'Gerade Wiederholungen sind unschädlich.'],
        explain: 'Idempotenz beschreibt den Serverzustand, nicht die Antwort.' },
      { q: 'Warum zählt der Server beim Lesen eines Rumpfes selbst mit, statt nur Content-Length zu vertrauen?',
        options: ['Weil Content-Length bei JSON verboten ist.', 'Weil ein Client einen falschen Wert senden kann.', 'Weil Node.js keinen Header liest.', 'Weil 413 nur bei fehlendem Header erlaubt ist.'],
        correct: 1,
        rationales: ['Der Header ist erlaubt und üblich.', 'Der Header ist Angabe des Clients; die tatsächliche Größe muss geprüft werden.', 'Node.js stellt die Header bereit.', '413 gilt immer, wenn der Rumpf zu groß ist.'],
        explain: 'Eingaben des Clients sind nicht vertrauenswürdig; die gelesenen Bytes sind die verlässliche Größe.' },
    ],
    sources: [
      rfc(9110, 'HTTP Semantics', 'Standard zu Methoden, Statuscodes und Headern.'),
      mdn('HTTP-Statuscodes', 'Web/HTTP/Reference/Status'),
      mdn('Idempotent (Glossar)', 'Glossary/Idempotent'),
    ],
    verification: verification('Anlegen, Lesen, Ändern und Löschen mit Statuscodes, 405 mit Allow, 415, 413 sowie 404 bei unbekanntem Pfad.', 'HEAD und OPTIONS, Kompression, Zeichensatz-Sonderfälle, Verhalten hinter Proxys und Lastverteilern.'),
  },
  {
    id: 'api-m2-l2', title: 'Fehler als Vertrag: Problem Details und Validierung', minutes: 35,
    prerequisites,
    objectives: [
      'Fehlerantworten im Format application/problem+json (RFC 9457) aufbauen',
      '400 (nicht lesbar) von 422 (lesbar, aber inhaltlich ungültig) unterscheiden',
      'Feldfehler maschinenlesbar in einer Erweiterung ausgeben',
      'Unerwartete Fehler als allgemeine 500-Antwort ohne interne Details zurückgeben',
    ],
    simple: `Wenn etwas schiefgeht, braucht der Client zwei Dinge: eine Antwort, die er automatisch auswerten kann, und einen Text, den ein Mensch versteht. Statt für jede API ein eigenes Fehlerformat zu erfinden, gibt es einen Standard: Problem Details (RFC 9457). Die Antwort hat den Medientyp application/problem+json und einen Rumpf mit festen Feldern: type (eine Adresse, die die Fehlerart benennt), title (kurze Beschreibung), status (der HTTP-Status) und optional detail und instance.

Bei Eingabefehlern willst du außerdem wissen, welches Feld falsch ist. Dafür darf ein Problem eigene Erweiterungsfelder tragen. Hier heißt das Feld errors und enthält je Fehler Feldname und Meldung. Ein Formular kann sie neben das richtige Eingabefeld setzen.

Wichtig ist die Trennung der Gründe. Ist der Rumpf kein gültiges JSON, ist das ein Fehler der Anfrage (400). Ist er gültiges JSON, aber der Titel ist leer, ist die Anfrage verständlich, aber inhaltlich nicht verarbeitbar (422). Und Fehler des Servers selbst (500) sagen nichts über die Interna.`,
    steps: [
      'Öffne src/problem.js. Die Klasse HttpError trägt Status, Titel und optional Detail, Typ, Feldfehler und zusätzliche Header. toProblemBody macht daraus den Rumpf. Der Standardwert für type ist about:blank; das steht für „keine weitere Bedeutung über den Status hinaus“.',
      'In src/app.js wird jeder HttpError am Ende in send in eine Antwort mit Content-Type application/problem+json übersetzt. Alles, was kein HttpError ist, wird als 500 beantwortet.',
      'Öffne src/validate.js. validateNoteInput prüft an der Grenze: Es muss ein Objekt sein, unbekannte Felder werden abgelehnt, der Titel muss nach dem Trimmen 1 bis 80 Zeichen haben, Text höchstens 2000 Zeichen, Schlagwörter höchstens 5 aus kleinen Buchstaben, Ziffern und Bindestrich. Die Funktion sammelt alle Fehler, statt beim ersten aufzuhören.',
      'Der erste Test sendet Titel nur aus Leerzeichen, ein Schlagwort in Großbuchstaben und ein unbekanntes Feld. Antwort: 422, Medientyp problem+json, und die Fehlerliste nennt genau die Felder extra, tags und title.',
      'Der zweite Test sendet ein abgeschnittenes JSON: Antwort 400 „Ungültiges JSON“. Der Client sieht an der Zahl, dass er das Format reparieren muss, nicht den Inhalt.',
      'Der dritte Test ersetzt store.create durch eine Funktion, die mit Pfad und Datenbankhinweis wirft. Die Antwort ist 500 ohne detail und ohne diese Wörter; der Server meldet die Ursache über ein Ereignis (hier „appError“) an das Protokoll. In einem echten Dienst ginge sie dort in das Logging, ohne personenbezogene Daten.',
      'Bewerte die type-Adressen: https://example.test/probleme/validierung ist ein Platzhalter. Eine echte API verweist auf eine Seite, die den Fehler erklärt, und ändert die Adresse nie, weil Clients sie als Kennung benutzen.',
    ],
    background: `Warum nicht einfach { "error": "..." }? Das geht, aber jede API macht es anders, und Clientbibliotheken müssen jede Variante lernen. Mit dem Standard können Werkzeuge Fehler einheitlich anzeigen, und du musst Felder nicht neu erfinden. Pflicht ist nichts davon: Der Standard erlaubt auch weniger Felder; wichtig ist, dass du einmal entscheidest und das Format in der Schnittstellenbeschreibung festhältst.

Zu 400 und 422: RFC 9110 beschreibt 422 als „Unprocessable Content“: Die Syntax stimmt, der Inhalt lässt sich nicht verarbeiten. Viele APIs nutzen 400 für beides. Beides ist vertretbar; sinnvoll ist, konsistent zu sein und die Entscheidung zu dokumentieren. Im Lab trennt der Code die Fälle, weil Clients bei 400 meist ihr Format prüfen und bei 422 dem Nutzer Feldfehler zeigen.

Fehlermeldungen sind auch ein Sicherheitsthema: Sie dürfen weder Stapelspuren, Dateipfade, SQL noch Hinweise auf vorhandene Konten enthalten. Meldungen für Menschen (detail) sind für den Entwickler des Clients gedacht, nicht zur Anzeige für Endnutzer; Übersetzung und Wortlaut für Endnutzer liegen beim Client.`,
    terms: [
      { term: 'Problem Details', text: 'Standardformat für HTTP-Fehlerantworten (RFC 9457) mit type, title, status, detail und instance.' },
      { term: '422', text: 'Statuscode „Unprocessable Content“: Die Anfrage ist syntaktisch korrekt, aber inhaltlich nicht verarbeitbar.' },
      { term: 'Erweiterungsfeld', text: 'Zusätzliches Feld in einem Problem, hier errors für Feldfehler.' },
    ],
    code: { file: lab + 'src/problem.js', lang: 'JavaScript' },
    code2: { file: lab + 'src/validate.js', lang: 'JavaScript', from: 'export function validateNoteInput' },
    code3: { file: lab + 'tests/problems.test.js', lang: 'JavaScript', from: "test('Validierungsfehler", to: "'extra', 'tags', 'title']);", plus: 1 },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: specOutput('problems'),
    mistakes: [
      { wrong: 'Stapelspuren, Pfade oder SQL-Fehlertexte in der Fehlerantwort auszugeben.', why: 'Angreifer lernen Aufbau und Schwachstellen des Systems; Betreiber veröffentlichen unbeabsichtigt interne Daten.', fix: 'Allgemeine 500-Antwort senden und die Ursache protokollieren, ohne personenbezogene Daten.' },
      { wrong: 'Bei Eingabefehlern nur den ersten Fehler zu melden.', why: 'Der Nutzer korrigiert ein Feld, sendet erneut und bekommt den nächsten Fehler: viele unnötige Runden.', fix: 'Alle Feldfehler sammeln und gemeinsam zurückgeben.' },
      { wrong: 'Den Fehlertext als einzige maschinenlesbare Information zu nutzen.', why: 'Clients müssen Texte parsen, die sich ändern oder übersetzt werden.', fix: 'Stabile type-Adressen und Feldnamen verwenden; Texte sind nur Ergänzung.' },
      { wrong: 'Unbekannte Felder in der Eingabe still zu ignorieren.', why: 'Tippfehler („titel“) bleiben unbemerkt, und Clients glauben, ein Feld zu setzen, das nie ankam.', fix: 'Unbekannte Felder melden oder bewusst im Vertrag erlauben.' },
    ],
    practice: 'Ergänze für die Notizen ein Feld „priority“ (Zahl von 1 bis 5) mit Validierung. Schreibe Tests für gültige Werte, Grenzen (0 und 6), einen Text statt einer Zahl und prüfe, dass die Fehlerliste das Feld priority nennt.',
    exercises: [
      { task: 'Ergänze eine Regel: Der Titel darf keine Zeilenumbrüche enthalten.', acceptance: 'Ein Test sendet einen Titel mit Zeilenumbruch und erhält 422 mit dem Feld title; gültige Titel bleiben unberührt.' },
      { task: 'Grenzfall: Sende ein JSON-Array statt eines Objekts und ein JSON-Dokument „null“.', acceptance: 'Beide werden mit 422 und der Meldung zum Objekt abgelehnt, ohne dass der Server abstürzt; du ergänzt einen Test.' },
      { task: 'Fehlerfall: Lass validateNoteInput eine Ausnahme mit Pfadangabe werfen und rufe die API auf.', acceptance: 'Die Antwort ist eine allgemeine 500 ohne Pfad; die Ursache erscheint nur im Ereignis appError; du beschreibst, wo sie in Produktion protokolliert würde.' },
    ],
    quiz: [
      { q: 'Welcher Medientyp kennzeichnet Fehlerantworten nach RFC 9457?',
        options: ['text/plain.', 'application/json-error.', 'application/problem+json.', 'application/xml.'],
        correct: 2,
        rationales: ['Das ist kein strukturierter Typ.', 'Diesen Typ gibt es im Standard nicht.', 'Der Standard definiert application/problem+json für JSON-Fehlerobjekte.', 'application/problem+xml existiert, aber für XML.'],
        explain: 'Der eigene Medientyp zeigt Clients, dass der Rumpf ein Problem-Objekt ist.' },
      { q: 'Der Rumpf einer Anfrage ist gültiges JSON, aber der Titel ist leer. Welcher Status passt im Lab?',
        options: ['400.', '500.', '404.', '422.'],
        correct: 3,
        rationales: ['400 meldet das Lab bei nicht lesbarem JSON.', '500 steht für Fehler des Servers.', 'Es fehlt keine Ressource.', 'Lesbar, aber inhaltlich nicht verarbeitbar.'],
        explain: 'Das Lab trennt Syntaxfehler (400) von Inhaltsfehlern (422).' },
      { q: 'Warum enthält die 500-Antwort keine Details?',
        options: ['Details würden Interna preisgeben; Ursachen gehören ins Protokoll.', 'Weil 500 keinen Rumpf haben darf, auch nicht kurz.', 'Weil Node.js keine Ausnahmen kennt und sie nicht fängt.', 'Weil Clients solche Details grundsätzlich nicht lesen können.'],
        correct: 0,
        rationales: ['Pfade, SQL oder Konfiguration helfen vor allem Angreifern.', 'Ein Rumpf ist erlaubt und nützlich.', 'Ausnahmen gibt es; sie werden gefangen.', 'Menschen und Werkzeuge können sie lesen.'],
        explain: 'Fehlerantworten dürfen keine Interna verraten; dafür gibt es das serverseitige Protokoll.' },
    ],
    sources: [
      rfc(9457, 'Problem Details for HTTP APIs'),
      rfc(9110, 'HTTP Semantics', 'Standard zu Statuscodes wie 400, 422 und 500.'),
      owasp('API8 Security Misconfiguration', '0xa8-security-misconfiguration'),
    ],
    verification: verification('422 mit Feldliste im Medientyp problem+json, 400 bei defektem JSON und eine allgemeine 500-Antwort ohne Details.', 'Mehrsprachige Fehlertexte, Fehlerformate anderer Standards (z. B. JSON:API), Protokollierung in einem echten Logsystem.'),
  },
  {
    id: 'api-m2-l3', title: 'Listen paginieren: Cursor statt OFFSET', minutes: 35,
    prerequisites,
    objectives: [
      'Cursor-Paginierung mit eindeutigem Sortierschlüssel umsetzen',
      'Limit und Cursor als Eingaben validieren und Obergrenzen setzen',
      'Zeigen, dass Löschen zwischen zwei Seiten mit Cursor nichts überspringt',
      'Die nächste Seite im Rumpf und im Link-Header anbieten',
    ],
    simple: `Eine API darf nie „alles“ liefern. Ab einer gewissen Größe wäre die Antwort zu groß und zu langsam, also gibt sie Listen seitenweise aus. Die einfachste Form ist limit und offset („überspring 40, gib mir 20“). Sie hat zwei Nachteile: Die Datenbank muss die übersprungenen Zeilen lesen (Lektion 5 im MariaDB-Vertiefungsmodul zeigt die Kosten), und die Seiten verrutschen, wenn zwischen zwei Abrufen Zeilen hinzukommen oder wegfallen.

Cursor-Paginierung fragt anders: „Gib mir die 20 Einträge nach diesem hier.“ Der Cursor ist ein undurchsichtiger Text, der die Position des letzten gelieferten Eintrags enthält. Der Client reicht ihn unverändert zurück. Neue oder gelöschte Einträge davor verschieben die nächste Seite nicht.

Die Antwort enthält die Einträge und nextCursor; ist es null, war das die letzte Seite. Zusätzlich kann der Link-Header die Adresse der nächsten Seite mit rel="next" nennen.`,
    steps: [
      'Öffne src/pagination.js. encodeCursor macht aus Zeitstempel und ID der letzten Notiz einen base64url-Text; decodeCursor liest ihn zurück und lehnt alles ab, was nicht dem Format entspricht (400).',
      'parseLimit setzt den Standard auf 20 und erlaubt 1 bis 100. Alles andere (0, 101, „abc“, 2.5) ist ein Fehler 400 mit eigener type-Adresse. Eine Obergrenze schützt den Server vor riesigen Antworten.',
      'page wählt aus der sortierten Liste alle Einträge nach dem Cursor: später erstellt, oder gleich erstellt mit größerer ID. Genau diese Bedingung steht auch in der ausgeschriebenen SQL-Form des MariaDB-Moduls. Die Sortierung nach (createdAt, id) ist eindeutig.',
      'Der erste Test legt sieben Notizen mit eingefrorener Uhr an: Alle haben denselben Zeitstempel. Trotzdem liefern drei Seiten mit je drei, drei und einem Eintrag die sieben Titel lückenlos in der richtigen Reihenfolge; die ID entscheidet bei Gleichstand.',
      'Der zweite Test holt Seite 1, löscht die erste Notiz und holt Seite 2 mit dem Cursor: Es kommen „Notiz 4“ bis „Notiz 6“. Rechnerisch (nur ein Vergleich auf einem Array) würde OFFSET 3 auf der verkürzten Liste „Notiz 4“ überspringen. Das ist ein Rechenvergleich, keine zweite API.',
      'Der dritte Test prüft fünf ungültige Eingaben. Jede liefert 400 mit einer type-Adresse unter /probleme/.',
      'Beachte die Grenzen: Der Cursor ist nicht signiert. Er enthält nur Position und Notiz-ID; die Zugriffskontrolle läuft unabhängig davon über die Besitzerprüfung (Lektion 6). Sobald ein Cursor Rechte oder gefilterte Datenbereiche kodiert, muss er signiert oder serverseitig gespeichert werden.',
    ],
    background: `Cursor oder Seitenzahl? Cursor skalieren besser und bleiben stabil, aber man kann nicht „zu Seite 12 springen“ und kennt die Gesamtzahl nicht, ohne extra zu zählen. Für Endlosscrollen und Datenabgleich ist das richtig; für Verwaltungsoberflächen mit Seitenzahlen kann OFFSET bei kleinen Datenmengen die einfachere Wahl bleiben.

Zur Reihenfolge: Die Sortierung muss unveränderlich sein. Wer nach einem Feld sortiert, das sich ändern kann (zuletzt bearbeitet), erlebt Sprünge. Ein stabiler Schlüssel wie Erstellzeit plus ID ist verlässlich. Andere Sortierungen verlangen jeweils einen eigenen passenden Index und einen eigenen Cursor.

Im Lab liegen die Daten im Arbeitsspeicher; die Wirkung auf die Datenbank (gelesene Zeilen) zeigt die MariaDB-Lektion. Das Lab belegt nur das Verhalten des Vertrags: Reihenfolge, Lückenlosigkeit und Fehlerfälle.`,
    terms: [
      { term: 'Cursor', text: 'Undurchsichtiger Text mit der Position des letzten Eintrags; der Client gibt ihn für die nächste Seite zurück.' },
      { term: 'Keyset', text: 'Blättern über den Sortierschlüssel der letzten Zeile statt über eine Zeilenzahl.' },
      { term: 'Link-Header', text: 'Antwort-Header (RFC 8288), der verwandte Adressen mit Beziehung nennt, z. B. rel="next".' },
    ],
    code: { file: lab + 'src/pagination.js', lang: 'JavaScript', from: 'export const defaultLimit' },
    code2: { file: lab + 'tests/pagination.test.js', lang: 'JavaScript', from: "test('Cursor-Seiten", to: 'assert.equal(pages, 3);' },
    code3: { file: lab + 'tests/pagination.test.js', lang: 'JavaScript', from: "test('Löschen zwischen", to: "'Notiz 6']);" },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: specOutput('pagination'),
    mistakes: [
      { wrong: 'Listen ohne Obergrenze für limit auszugeben.', why: 'Ein Client kann mit limit=1000000 Speicher und Datenbank belasten (OWASP: uneingeschränkter Ressourcenverbrauch).', fix: 'Standard und Maximum festlegen und ungültige Werte mit 400 ablehnen.' },
      { wrong: 'Nach einem nicht eindeutigen Feld zu sortieren und danach zu blättern.', why: 'Einträge mit gleichem Wert erscheinen doppelt oder gar nicht.', fix: 'Eine eindeutige Spalte (ID) als letztes Sortierkriterium und im Cursor verwenden.' },
      { wrong: 'Dem Client zu erlauben, den Cursor selbst zu bauen (zum Beispiel einfache Zahl).', why: 'Der Vertrag friert das interne Format ein; Änderungen brechen Clients.', fix: 'Cursor als undurchsichtigen Text behandeln und Format intern ändern dürfen.' },
      { wrong: 'Im Cursor Berechtigungen oder Filter ohne Signatur zu kodieren.', why: 'Clients können den Cursor ändern und sich Zugriff auf andere Daten verschaffen.', fix: 'Berechtigungen immer serverseitig prüfen; Cursor nur mit unkritischer Position.' },
    ],
    practice: 'Füge der Liste einen Filter nach Schlagwort hinzu (tag=…) und stelle sicher, dass der Cursor nur zusammen mit demselben Filter gilt. Schreibe Tests für Filter und Seitenwechsel, und prüfe, wie sich ein gewechselter Filter mit altem Cursor verhält.',
    exercises: [
      { task: 'Liefere zusätzlich im Rumpf das Feld limit mit dem tatsächlich verwendeten Wert.', acceptance: 'Ein Test prüft Standardwert 20 und den angefragten Wert; der Vertrag (Lektion 8) wird entsprechend ergänzt.' },
      { task: 'Grenzfall: Rufe die Liste ohne Notizen ab und danach genau mit so vielen Notizen, wie limit erlaubt.', acceptance: 'Die leere Liste liefert nextCursor null; bei genauer Seitengröße ist nextCursor null (keine leere Folgeseite); du erklärst die Prüfung rest.length > limit.' },
      { task: 'Fehlerfall: Ersetze den Cursor durch das Ergebnis von base64url(\'{"c":1,"i":2}\').', acceptance: 'Die API antwortet 400, weil c kein Datum ist; du ergänzt den Fall als Test.' },
    ],
    quiz: [
      { q: 'Warum überspringt ein Cursor nichts, wenn zwischen zwei Seiten ein Eintrag gelöscht wird?',
        options: ['Weil Löschen bei Cursor-Listen grundsätzlich verboten ist.', 'Weil der Server alle Einträge dauerhaft im Speicher sperrt.', 'Weil die nächste Seite „nach dieser Position“ beginnt.', 'Weil der Client die ganze Liste lokal zwischenspeichert.'],
        correct: 2,
        rationales: ['Löschen ist erlaubt.', 'Es gibt keine Sperre.', 'Die Position bleibt gültig, auch wenn davor etwas wegfällt.', 'Der Client speichert nur den Cursor.'],
        explain: 'Ein Positions-Schlüssel verschiebt sich nicht, eine Zeilenzahl schon.' },
      { q: 'Was bedeutet nextCursor: null in der Antwort?',
        options: ['Der Cursor ist abgelaufen.', 'Es gibt keine weitere Seite.', 'Ein Fehler ist aufgetreten.', 'Der Client soll von vorn beginnen.'],
        correct: 1,
        rationales: ['Abgelaufene Cursor liefern im Lab 400.', 'Die Liste ist zu Ende.', 'Fehler haben einen 4xx- oder 5xx-Status.', 'Das wäre ein neuer Abruf ohne Cursor.'],
        explain: 'Der Server meldet das Ende, indem er keinen weiteren Cursor ausgibt.' },
      { q: 'Wozu dient eine Obergrenze für limit?',
        options: ['Sie macht die Antwort hübscher.', 'Sie ersetzt die Authentifizierung.', 'Sie verhindert, dass ein einzelner Aufruf den Server überlastet.', 'Sie wird nur für Cursor benötigt.'],
        correct: 2,
        rationales: ['Es geht nicht um Optik.', 'Sie hat mit Anmeldung nichts zu tun.', 'Große Antworten kosten Speicher, Rechenzeit und Bandbreite.', 'Sie gilt für jede Form der Paginierung.'],
        explain: 'Eingabegrenzen sind Teil des Schutzes vor übermäßigem Ressourcenverbrauch.' },
    ],
    sources: [
      rfc(8288, 'Web Linking', 'Standard zum Link-Header und rel-Werten wie next.'),
      owasp('API4 Unrestricted Resource Consumption', '0xa4-unrestricted-resource-consumption'),
      { title: 'MariaDB-Vertiefung: Blättern mit OFFSET gegen Keyset (Lektion mariadb-m2-l5)', url: 'https://github.com/DennisBilstein/root-road/tree/main/content/examples/sql-lab', note: 'Eigene Lektion und eigenes Lab; zeigt die gelesenen Zeilen in MariaDB.' },
    ],
    verification: verification('Lückenlose Seiten bei gleichen Zeitstempeln, stabile Seiten nach einem Löschen sowie 400 für ungültige Cursor und Limits.', 'Verhalten mit echter Datenbank und großen Datenmengen, parallele Schreibzugriffe während des Blätterns, andere Sortierungen.'),
  },
  {
    id: 'api-m2-l4', title: 'Idempotenz: Wiederholungen mit Idempotency-Key absichern', minutes: 35,
    prerequisites,
    objectives: [
      'Erklären, warum Wiederholungen bei POST ein Problem sind und bei PUT nicht',
      'Mit einem Idempotency-Key Doppelbuchungen verhindern',
      'Gleichen Schlüssel mit anderem Inhalt als Fehler erkennen',
      'Grenzen des Lab-Verfahrens benennen (Gültigkeitsdauer, mehrere Instanzen)',
    ],
    simple: `Netzwerke sind unzuverlässig. Ein Client sendet ein POST, die Verbindung bricht ab, und er weiß nicht, ob der Server die Notiz angelegt hat oder nicht. Wiederholt er die Anfrage, kann sie doppelt entstehen. Bei Notizen ist das lästig, bei Zahlungen und Bestellungen teuer.

Die Lösung ist ein Idempotency-Key: Der Client erzeugt vor dem ersten Versuch einen zufälligen Schlüssel und schickt ihn bei jedem Versuch mit. Der Server merkt sich zu jedem Schlüssel die Antwort. Kommt derselbe Schlüssel mit demselben Inhalt noch einmal, legt er nichts neu an, sondern liefert die gespeicherte Antwort zurück. Kommt derselbe Schlüssel mit anderem Inhalt, ist das ein Programmierfehler des Clients und wird abgelehnt.

Damit wird eine nicht idempotente Methode (POST) für Wiederholungen sicher.`,
    steps: [
      'Öffne src/idempotency.js. Der Speicher ist ein Map, der Schlüssel enthält den Benutzer: Zwei Benutzer können denselben Schlüssel verwenden, ohne sich zu stören. Der Fingerabdruck ist ein SHA-256-Hash über den rohen Rumpf.',
      'In createNote (src/app.js) wird zuerst das Format des Schlüssels geprüft (8 bis 64 Zeichen aus A-Z, a-z, 0-9, Unterstrich und Bindestrich), dann der Rumpf gelesen und der Fingerabdruck gebildet.',
      'Gibt es zum Schlüssel schon einen Eintrag mit anderem Fingerabdruck, antwortet die API 422 mit eigener type-Adresse. Mit gleichem Fingerabdruck liefert sie die gespeicherte Antwort (201, gleiche ID) und setzt den Header Idempotent-Replayed: true.',
      'Der erste Test sendet dasselbe POST zweimal mit demselben Schlüssel. Beide Antworten haben dieselbe ID, nur die zweite trägt den Header, und die Liste enthält genau eine Notiz.',
      'Der zweite Test sendet ohne Schlüssel zweimal denselben Inhalt: zwei Notizen. Der Schlüssel ist optional; wer ihn nicht sendet, trägt das Risiko.',
      'Der dritte Test sendet denselben Schlüssel mit anderem Titel (422) und einen zu kurzen Schlüssel (400). Der vierte zeigt, dass zwei Benutzer mit gleichem Schlüssel verschiedene Notizen bekommen.',
      'Beachte, was nicht gespeichert wird: Fehlgeschlagene Anfragen (zum Beispiel Validierungsfehler) hinterlassen keinen Eintrag; der Client darf den Schlüssel nach der Korrektur wiederverwenden.',
    ],
    background: `Die Prüfung und das Speichern liegen im Lab ohne await direkt hintereinander; Node.js führt in diesem Prozess nichts dazwischen aus. Zwei gleichzeitige Anfragen mit demselben Schlüssel können deshalb nicht beide „neu“ sein. Das gilt nur für einen einzelnen Prozess. Mit mehreren Instanzen oder Prozessen braucht der Speicher eine gemeinsame Datenbank mit eindeutiger Schlüsselspalte, sonst legen zwei Instanzen gleichzeitig an. Der Entwurf zum Idempotency-Key-Header sieht für eine noch laufende Bearbeitung mit gleichem Schlüssel die Antwort 409 vor; das Lab implementiert diesen Fall nicht.

Gültigkeit: Das Lab speichert Schlüssel ohne Ablauf. Ein echter Dienst löscht sie nach einer festgelegten Frist (zum Beispiel 24 Stunden), sonst wächst der Speicher unbegrenzt, und der Client muss wissen, wie lange Wiederholungen geschützt sind.

Status der Norm: Der Header ist in einem Internet-Draft der IETF beschrieben (Version 08 am Stichtag), also noch kein RFC; Details können sich ändern. Der Entwurf sieht den Wert als Structured-Field-String in Anführungszeichen vor; das Lab vereinfacht das auf den nackten Text. Der Antwort-Header Idempotent-Replayed ist eine Erfindung des Labs und nicht standardisiert.`,
    terms: [
      { term: 'Idempotency-Key', text: 'Vom Client erzeugter Schlüssel, der Wiederholungen derselben Anfrage erkennbar macht.' },
      { term: 'Fingerabdruck', text: 'Hash über den Inhalt der Anfrage, mit dem erkannt wird, ob ein Schlüssel mit anderem Inhalt benutzt wurde.' },
      { term: 'Replay', text: 'Erneute Auslieferung der gespeicherten Antwort statt erneuter Verarbeitung.' },
    ],
    code: { file: lab + 'src/idempotency.js', lang: 'JavaScript' },
    code2: { file: lab + 'src/app.js', lang: 'JavaScript', from: 'async function createNote', to: 'return response;', plus: 1 },
    code3: { file: lab + 'tests/idempotency.test.js', lang: 'JavaScript', from: "test('Wiederholtes POST", to: 'assert.equal(await count(api, token), 1);', plus: 1 },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: specOutput('idempotency'),
    mistakes: [
      { wrong: 'Wiederholungen bei POST ohne Schutz zu automatisieren (Client sendet bei Zeitüberschreitung einfach neu).', why: 'Die erste Anfrage kann angekommen sein; es entstehen Doppelbuchungen.', fix: 'Idempotency-Key senden und Wiederholungen nur mit demselben Schlüssel ausführen.' },
      { wrong: 'Den Schlüssel bei jedem Versuch neu zu erzeugen.', why: 'Dann erkennt der Server keine Wiederholung; jede Anfrage gilt als neu.', fix: 'Schlüssel einmal pro Vorgang erzeugen und für alle Wiederholungen beibehalten.' },
      { wrong: 'Schlüssel global statt je Benutzer zu speichern.', why: 'Ein Benutzer könnte fremde Antworten erhalten, wenn er einen Schlüssel errät oder kollidiert.', fix: 'Den Schlüssel immer mit der Identität des Aufrufers verbinden.' },
      { wrong: 'Gespeicherte Antworten ohne Ablauf aufzubewahren.', why: 'Der Speicher wächst, und gespeicherte Antworten können Daten enthalten, die länger als nötig bleiben.', fix: 'Frist festlegen, abgelaufene Einträge löschen und die Frist in der Dokumentation nennen.' },
    ],
    practice: 'Ergänze einen Ablauf von 24 Stunden für Schlüssel (mit der steuerbaren Uhr des Labs) und teste: nach 23 Stunden Replay, nach 25 Stunden ein neues Anlegen. Beschreibe, wie sich das für Clients bemerkbar macht.',
    exercises: [
      { task: 'Gib im Header der ersten Antwort zusätzlich Idempotency-Key zurück, damit Clients den Schlüssel bestätigt sehen.', acceptance: 'Ein Test prüft den Header bei der ersten und der wiederholten Antwort; du erklärst den Nutzen beim Fehlersuchen.' },
      { task: 'Grenzfall: Sende denselben Schlüssel mit demselben Titel, aber anderer Schreibweise des JSON (zusätzliche Leerzeichen).', acceptance: 'Der Fingerabdruck über den rohen Rumpf unterscheidet sich, die API antwortet 422; du erklärst die Folge und wählst bewusst, ob du kanonisieren würdest.' },
      { task: 'Fehlerfall: Entferne den Benutzer aus dem Schlüssel von lookup und save.', acceptance: 'Der Test „Schlüssel gelten je Benutzer“ schlägt fehl; du beschreibst den Sicherheitsfehler und stellst die Verknüpfung wieder her.' },
    ],
    quiz: [
      { q: 'Warum ist ein POST ohne Schutz bei Wiederholung problematisch?',
        options: ['POST darf nur einmal pro Sitzung gesendet werden.', 'Jede Wiederholung kann eine weitere Ressource erzeugen.', 'POST ist unsicher und daher verboten.', 'Der Server lehnt Wiederholungen ab.'],
        correct: 1,
        rationales: ['Eine solche Regel gibt es nicht.', 'POST ist nicht idempotent: Zwei Anfragen legen zwei Ressourcen an.', 'POST ist erlaubt, nur nicht idempotent.', 'Ohne Schutz erkennt der Server die Wiederholung nicht.'],
        explain: 'Idempotency-Key macht aus „zwei Anfragen“ erkennbar „eine Absicht“.' },
      { q: 'Was passiert, wenn derselbe Schlüssel mit anderem Inhalt gesendet wird?',
        options: ['Die zweite Anfrage überschreibt die erste.', 'Die API liefert die erste Antwort erneut.', 'Der Schlüssel wird gelöscht und neu vergeben.', 'Die API antwortet mit einem Fehler (422).'],
        correct: 3,
        rationales: ['Die erste Notiz bleibt unverändert.', 'Das wäre bei gleichem Inhalt der Fall.', 'Es wird nichts gelöscht.', 'Der Schlüssel gehört zu einer anderen Anfrage; das ist ein Clientfehler.'],
        explain: 'Der Fingerabdruck erkennt die Abweichung, der Fehler macht den Programmierfehler sichtbar.' },
      { q: 'Was ändert sich, sobald die API auf mehreren Instanzen läuft?',
        options: ['Nichts.', 'Der Speicher der Schlüssel muss gemeinsam und eindeutig sein.', 'Der Idempotency-Key wird überflüssig.', 'Der Client darf keine Wiederholungen mehr senden.'],
        correct: 1,
        rationales: ['Ein lokaler Speicher kennt Schlüssel der anderen Instanz nicht.', 'Nur ein gemeinsamer Speicher mit eindeutigem Schlüssel verhindert doppelte Verarbeitung.', 'Er wird dann wichtiger.', 'Wiederholungen sind gerade dann nötig.'],
        explain: 'Die Sicherheit des Lab-Verfahrens beruht auf einem einzelnen Prozess.' },
    ],
    sources: [
      { title: 'IETF-Entwurf: The Idempotency-Key HTTP Header Field (draft-ietf-httpapi-idempotency-key-header)', url: 'https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/', note: 'Internet-Draft, kein RFC; Inhalt kann sich ändern.' },
      rfc(9110, 'HTTP Semantics', 'Standard, Abschnitt zu sicheren und idempotenten Methoden.'),
      mdn('Idempotent (Glossar)', 'Glossary/Idempotent'),
    ],
    verification: verification('Wiederholung mit gleichem Schlüssel (eine Notiz), anderer Inhalt (422), ungültiges Format (400), Trennung je Benutzer und Verhalten ohne Schlüssel.', 'gleichzeitige Anfragen mehrerer Prozesse, Ablaufzeiten, Wiederholung nach Absturz mitten in der Verarbeitung, 409 bei laufender Bearbeitung.'),
  },
  {
    id: 'api-m2-l5', title: 'Gleichzeitige Änderungen: ETag, If-Match und 304', minutes: 35,
    prerequisites,
    objectives: [
      'Das Problem der verlorenen Änderung erklären',
      'Mit ETag und If-Match optimistische Sperren umsetzen und 412 und 428 beantworten',
      'Mit If-None-Match unveränderte Ressourcen als 304 ohne Rumpf ausliefern',
      'Cache-Control für personenbezogene Antworten begründet wählen',
    ],
    simple: `Zwei Menschen öffnen dieselbe Notiz. Beide ändern den Titel und speichern. Wer zuletzt speichert, überschreibt die Änderung des anderen, ohne es zu merken: eine „verlorene Änderung“. Sperren, die jemand offen lässt, sind unpraktisch. HTTP kennt eine bessere Lösung: Der Server nennt zu jeder Antwort ein ETag, eine Versionskennung der Ressource. Beim Ändern schickt der Client es im Header If-Match zurück: „Ändere nur, wenn die Notiz noch genau diese Version ist.“ Hat inzwischen jemand anderes geändert, antwortet der Server mit 412 (Precondition Failed), und nichts wird überschrieben.

Dasselbe ETag spart auch Daten beim Lesen: Der Client schickt If-None-Match mit dem zuletzt gesehenen ETag, und der Server antwortet bei unveränderter Notiz mit 304 ohne Rumpf.`,
    steps: [
      'Öffne src/store.js: Jede Notiz hat eine Versionsnummer, die bei jeder Änderung steigt. etagOf bildet daraus das ETag, zum Beispiel "0001-v2". Die Anführungszeichen gehören zum Wert.',
      'getNote in src/app.js liest If-None-Match. Passt das ETag (oder steht dort *), antwortet die API 304 mit ETag und ohne Rumpf; sonst 200 mit Rumpf. Cache-Control: private, no-cache erlaubt einem privaten Cache das Speichern, verlangt aber vor jeder Nutzung die Rückfrage beim Server.',
      'replaceNote verlangt If-Match. Fehlt der Header, antwortet die API 428 (Precondition Required): Ohne Bedingung wäre jede Änderung ein Risiko. Passt das ETag nicht, folgt 412 mit eigener type-Adresse.',
      'Der erste Test: Das ETag der Notiz führt zu 304 ohne Rumpf; ein veraltetes ETag führt zu 200.',
      'Der zweite Test spielt die verlorene Änderung nach: Beide Schreiber kennen Version 1. A ändert (200, neues ETag), B mit dem alten ETag erhält 412. Der Titel „Von A“ bleibt erhalten. B lädt neu, nimmt das neue ETag und kann nun ändern.',
      'Der dritte Test prüft das fehlende If-Match: 428.',
      'Lies, was etagMatches vereinfacht: Es entfernt ein W/ (schwaches ETag) und vergleicht Texte. Die Norm unterscheidet starke und schwache Vergleiche (If-Match stark, If-None-Match schwach); das Lab vergibt nur starke ETags und ist damit für seinen Zweck ausreichend.',
    ],
    background: `Das Verfahren heißt optimistische Nebenläufigkeitskontrolle: Man sperrt nicht vorab, sondern prüft beim Schreiben. Das passt zu Web-APIs mit vielen kurzen Anfragen. Der Preis: Der Client muss mit 412 umgehen, also neu laden, Änderungen zusammenführen oder nachfragen. In Oberflächen heißt das: „Die Notiz wurde inzwischen geändert“ mit Vergleichsansicht.

Ein ETag muss sich ändern, wenn sich die Darstellung ändert. Hier steckt die Version im ETag; das genügt, weil jede Änderung die Version erhöht. Nutze nicht den Änderungszeitpunkt allein: Zwei Änderungen in derselben Sekunde hätten dasselbe ETag.

Zum Caching: private bedeutet, dass nur der Browser des Nutzers speichern darf, nicht gemeinsame Caches wie Proxys. no-cache heißt nicht „nicht speichern“, sondern „vor jeder Wiederverwendung prüfen“. Für Antworten mit personenbezogenen Daten ist no-store die vorsichtigere Wahl; das Lab nutzt es für alle Antworten außer dem Einzelabruf.`,
    terms: [
      { term: 'ETag', text: 'Antwort-Header mit der Versionskennung einer Darstellung der Ressource.' },
      { term: 'If-Match', text: 'Anfrage-Header: Führe die Änderung nur aus, wenn das ETag noch passt (sonst 412).' },
      { term: 'If-None-Match', text: 'Anfrage-Header: Liefere nur, wenn sich das ETag geändert hat (sonst 304).' },
      { term: 'optimistische Sperre', text: 'Verfahren ohne Vorab-Sperre: Konflikte werden beim Schreiben anhand einer Version erkannt.' },
    ],
    code: { file: lab + 'src/app.js', lang: 'JavaScript', from: 'function getNote', to: 'headers };', plus: 1 },
    code2: { file: lab + 'src/app.js', lang: 'JavaScript', from: 'async function replaceNote', to: 'headers: { ETag: etagOf(updated) } };', plus: 1 },
    code3: { file: lab + 'tests/conditional.test.js', lang: 'JavaScript', from: "test('Verlorene Änderung", to: 'assert.equal(writerB.status, 412);' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: specOutput('conditional'),
    mistakes: [
      { wrong: 'Änderungen ohne If-Match zuzulassen („letzter gewinnt“).', why: 'Gleichzeitige Bearbeitung überschreibt Änderungen anderer unbemerkt.', fix: 'If-Match verlangen (428 bei Fehlen) und 412 bei Abweichung senden.' },
      { wrong: 'Als ETag nur den Änderungszeitpunkt in Sekunden zu verwenden.', why: 'Zwei Änderungen in derselben Sekunde ergeben dasselbe ETag; der Konflikt bleibt unerkannt.', fix: 'Versionsnummer oder Hash der Darstellung verwenden.' },
      { wrong: 'Bei 412 den Client stumm scheitern zu lassen.', why: 'Der Nutzer weiß nicht, warum seine Änderung fehlt, und verliert sie.', fix: 'Aktuellen Stand laden, Unterschiede zeigen und erneutes Speichern mit neuem ETag anbieten.' },
      { wrong: 'Antworten mit personenbezogenen Daten ohne private/no-store für gemeinsame Caches freizugeben.', why: 'Ein Proxy kann Daten eines Nutzers an andere ausliefern.', fix: 'Cache-Control: private, no-cache oder no-store setzen.' },
    ],
    practice: 'Baue einen kleinen Client als Skript, der eine Notiz lädt, absichtlich 100 ms wartet, ändert und bei 412 automatisch neu lädt und das Ergebnis zusammenführt (zum Beispiel Titel von A behalten, Text von B ergänzen). Teste mit zwei gleichzeitig laufenden Instanzen.',
    exercises: [
      { task: 'Sende If-Match: * an eine existierende Notiz.', acceptance: 'Die Änderung gelingt; du erklärst, wann * sinnvoll ist (nur „existiert“) und warum es kein Schutz vor Konflikten ist.' },
      { task: 'Grenzfall: Sende in If-Match zwei ETags, getrennt durch Komma, eines davon aktuell.', acceptance: 'Die Änderung gelingt; ein Test belegt es; du beschreibst, wofür die Liste gedacht ist.' },
      { task: 'Fehlerfall: Lass die Version beim Ändern nicht erhöhen.', acceptance: 'Der Test mit dem zweiten Schreiber schlägt fehl (kein 412); du erklärst, warum sich das ETag ändern muss, und stellst den Zähler wieder her.' },
    ],
    quiz: [
      { q: 'Was bewirkt If-Match bei einem PUT?',
        options: ['Es lädt die Ressource aus dem Cache.', 'Es führt die Änderung nur aus, wenn das ETag noch passt.', 'Es sperrt die Ressource für andere.', 'Es kodiert den Rumpf.'],
        correct: 1,
        rationales: ['Das erledigt If-None-Match beim Lesen.', 'Sonst antwortet der Server mit 412.', 'Es wird nichts gesperrt.', 'Mit der Kodierung hat es nichts zu tun.'],
        explain: 'If-Match macht die Änderung von einer erwarteten Version abhängig und verhindert verlorene Änderungen.' },
      { q: 'Wann antwortet der Server auf ein GET mit 304?',
        options: ['Wenn die Ressource gelöscht wurde.', 'Wenn der Client nicht angemeldet ist.', 'Wenn der Rumpf leer ist.', 'Wenn If-None-Match zum aktuellen ETag passt.'],
        correct: 3,
        rationales: ['Dann wäre es 404.', 'Dann wäre es 401.', 'Ein leerer Rumpf allein ist kein Grund.', 'Der Client hat die aktuelle Version bereits und braucht keinen Rumpf.'],
        explain: '304 spart Daten, wenn die Ressource sich nicht verändert hat.' },
      { q: 'Warum antwortet die API auf ein PUT ohne If-Match mit 428?',
        options: ['Weil PUT immer eine Bedingung braucht.', 'Weil sie den Server vor Überlastung schützt.', 'Weil sie verlorene Änderungen vermeiden will.', 'Weil ETag nicht existiert.'],
        correct: 2,
        rationales: ['Das ist keine Regel von HTTP, sondern eine Entscheidung dieser API.', 'Das ist nicht der Zweck.', 'Ohne Bedingung wäre jede Änderung ein „letzter gewinnt“.', 'Das ETag existiert und wird mitgeliefert.'],
        explain: 'Der Server erzwingt die Bedingung, damit Clients nicht aus Versehen blind überschreiben.' },
    ],
    sources: [
      rfc(9110, 'HTTP Semantics', 'Standard zu bedingten Anfragen (ETag, If-Match, If-None-Match, 304, 412).'),
      rfc(6585, 'Additional HTTP Status Codes', 'Standard zu 428 und 429.'),
      mdn('ETag', 'Web/HTTP/Reference/Headers/ETag'),
      mdn('If-Match', 'Web/HTTP/Reference/Headers/If-Match'),
    ],
    verification: verification('304 bei unverändertem ETag, 412 für den zweiten Schreiber, 428 ohne If-Match und die Wiederholung mit neuem ETag.', 'schwache ETags, Bereichsanfragen, Caches und Proxys im Netz, echte gleichzeitige Prozesse.'),
  },
  {
    id: 'api-m2-l6', title: 'Zugriff: Bearer-Token, Scopes und Objektautorisierung', minutes: 40,
    prerequisites,
    objectives: [
      'Undurchsichtige Bearer-Token erzeugen, nur als Hash speichern und mit Ablauf prüfen',
      '401 (nicht angemeldet) von 403 (keine Berechtigung) unterscheiden',
      'Scopes für Lese- und Schreibzugriff prüfen',
      'Objektbezogene Autorisierung (IDOR/BOLA) umsetzen und die Antwort 404 für fremde Objekte begründen',
    ],
    simple: `Zugriffsschutz besteht aus drei Fragen. Wer bist du (Authentifizierung)? Darfst du diese Art von Aktion (Berechtigung, hier Scopes)? Und darfst du genau dieses Objekt (Objektautorisierung)? Die dritte Frage wird am häufigsten vergessen: Eine API prüft das Token und die Rolle, vergisst aber zu prüfen, ob die Notiz mit der ID 17 dem Aufrufer gehört. Dann kann jeder angemeldete Benutzer durch Hochzählen der ID fremde Daten lesen. Das Muster heißt IDOR oder, im API-Umfeld, Broken Object Level Authorization; es steht an der Spitze der OWASP-API-Risiken 2023.

Als Anmeldenachweis dient ein Bearer-Token im Header Authorization. Das Lab nutzt zufällige, undurchsichtige Token: Der Server erzeugt 24 zufällige Bytes, speichert nur deren SHA-256-Hash mit Besitzer, Scopes und Ablaufzeit und gibt das Token einmal heraus.

Statuscodes: Fehlt das Token oder ist es ungültig oder abgelaufen, antwortet die API 401 mit Header WWW-Authenticate. Fehlt der Scope, antwortet sie 403.`,
    steps: [
      'Öffne src/auth.js. issue erzeugt das Token mit randomBytes, speichert nur den Hash und nennt Besitzer, Scopes und Ablauf. verify schlägt den Hash nach und prüft die Ablaufzeit gegen die Uhr, die zum Testen steuerbar ist.',
      'In src/app.js liest authenticate den Header mit einem strengen Muster („Bearer“ und Zeichen aus A-Z, a-z, 0-9, Unterstrich, Bindestrich). Kein Treffer oder unbekanntes Token: 401 mit WWW-Authenticate: Bearer realm="notes".',
      'requireScope prüft den Scope je Operation (notes:read zum Lesen, notes:write zum Schreiben). Fehlt er, antwortet die API 403 und nennt im Header den fehlenden Scope (error="insufficient_scope").',
      'ownedNote ist die Objektprüfung: Gehört die Notiz einem anderen Benutzer, antwortet die API mit 404 „Notiz nicht gefunden“, dem Ergebnis für eine nicht existierende ID. So lässt sich nicht herausfinden, welche IDs es gibt.',
      'Der erste Test prüft fehlendes, erfundenes und abgelaufenes Token (Uhr wird um eine Sekunde über das Ablaufdatum gestellt): jeweils 401. Der zweite prüft 403 bei fehlendem Schreib-Scope.',
      'Der dritte Test lässt Ben auf Adas Notiz zugreifen (GET, PUT, DELETE): jeweils 404, genau wie für eine nicht vorhandene ID. Adas Notiz bleibt unverändert, Bens Liste ist leer.',
      'Der vierte Test belegt, dass /healthz ohne Token antwortet und nur {"status":"ok"} liefert, keine Versionsnummern oder Interna.',
    ],
    background: `Warum 404 statt 403 für fremde Objekte? 403 verrät „diese Notiz gibt es, sie gehört dir nicht“. Das ermöglicht das Aufzählen von IDs. 404 gibt nichts preis. Der Preis ist weniger klare Fehlersuche für legitime Nutzer; das ist bei Objekten anderer Mandanten meist ein guter Tausch. Gibt es ein berechtigtes „geteilt mit“, ist 403 sinnvoll, weil das Wissen um die Existenz erlaubt ist.

Warum Hash statt Klartext speichern? Wer den Speicher lesen kann (Sicherung, Fehlkonfiguration), findet sonst gültige Token. Bei zufälligen Token mit 192 Bit genügt ein einfacher schneller Hash; für Passwörter gilt das nicht (dort braucht es langsame Verfahren, Web-Sicherheit Lektion ws-m2-l1). Der Vergleich geschieht über das Nachschlagen des Hashes in einer Map; ein zeichenweiser Vergleich des geheimen Tokens findet nicht statt.

Nicht Teil des Labs: Anmeldung und Ausgabe von Token (zum Beispiel über OAuth 2.0), Widerruf, Rotation, Refresh-Token, Übertragung über HTTPS. Token gehören in den Header, nie in die URL, weil URLs in Protokollen und Verläufen landen. Das Lab läuft ohne TLS auf 127.0.0.1; ein echter Dienst nutzt ausschließlich HTTPS.`,
    terms: [
      { term: 'Bearer-Token', text: 'Nachweis, der jedem gilt, der ihn vorzeigt; muss geheim bleiben und nur über HTTPS gesendet werden.' },
      { term: 'Scope', text: 'Benannte Berechtigung eines Tokens, hier notes:read und notes:write.' },
      { term: 'BOLA/IDOR', text: 'Fehlende Prüfung, ob das angefragte Objekt dem Aufrufer gehört; ermöglicht Zugriff auf fremde Daten über deren ID.' },
      { term: 'WWW-Authenticate', text: 'Antwort-Header bei 401 (und bei fehlendem Scope), der das erwartete Verfahren nennt.' },
    ],
    code: { file: lab + 'src/auth.js', lang: 'JavaScript', from: 'const hash' },
    code2: { file: lab + 'src/app.js', lang: 'JavaScript', from: 'function authenticate', to: 'return note;', plus: 1 },
    code3: { file: lab + 'tests/auth.test.js', lang: 'JavaScript', from: "test('Fremde Notizen", to: 'assert.equal(missing.status, 404);' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: specOutput('auth'),
    mistakes: [
      { wrong: 'Nur das Token zu prüfen, aber nicht, ob das Objekt dem Aufrufer gehört.', why: 'Jeder Angemeldete kann über die ID fremde Daten lesen und ändern (BOLA, OWASP API1:2023).', fix: 'Bei jedem Zugriff auf ein Objekt den Besitz oder die Berechtigung prüfen und für fremde Objekte 404 (oder bewusst 403) senden.' },
      { wrong: '401 und 403 zu vertauschen.', why: 'Clients versuchen bei 401 eine neue Anmeldung und bei 403 keine; falsche Codes führen zu Endlosschleifen oder verwirrenden Meldungen.', fix: '401 für fehlende oder ungültige Anmeldung, 403 für fehlende Berechtigung.' },
      { wrong: 'Token im Klartext zu speichern oder in URLs zu übertragen.', why: 'Sicherungen, Protokolle und Browserverläufe geben sie weiter.', fix: 'Nur den Hash speichern, Token im Header senden, Ablauf festlegen.' },
      { wrong: 'Tokens ohne Ablauf auszustellen.', why: 'Ein gestohlenes Token gilt für immer.', fix: 'Kurze Gültigkeit, Widerruf und bei Bedarf Erneuerung vorsehen.' },
    ],
    practice: 'Ergänze ein Admin-Token mit Scope notes:admin, das alle Notizen lesen darf, und teste: Admin sieht fremde Notizen, normale Benutzer weiterhin nicht, und jeder Zugriff des Admins wird protokolliert (nur Notiz-ID und Zeitpunkt).',
    exercises: [
      { task: 'Ergänze einen Scope notes:delete und prüfe ihn in deleteNote.', acceptance: 'Ein Token mit nur notes:write erhält beim Löschen 403; ein Test belegt es.' },
      { task: 'Grenzfall: Sende den Header „bearer <Token>“ (kleingeschrieben) und „Bearer  <Token>“ (zwei Leerzeichen).', acceptance: 'Du prüfst, wie das strenge Muster reagiert, entscheidest bewusst (die Norm behandelt das Schema nicht groß-/kleinschreibungsabhängig) und dokumentierst das Verhalten mit einem Test.' },
      { task: 'Fehlerfall: Entferne die Besitzerprüfung aus ownedNote.', acceptance: 'Der Test mit den fremden Notizen schlägt fehl; du beschreibst den Angriff mit hochgezählten IDs und stellst die Prüfung wieder her.' },
    ],
    quiz: [
      { q: 'Ein Benutzer ist angemeldet, hat aber nur den Scope notes:read und sendet ein POST. Welcher Status ist richtig?',
        options: ['401.', '404.', '403.', '200.'],
        correct: 2,
        rationales: ['Er ist angemeldet; es fehlt die Berechtigung.', 'Die Ressource existiert.', 'Authentifiziert, aber nicht berechtigt.', 'Die Aktion darf nicht ausgeführt werden.'],
        explain: '401 betrifft die Identität, 403 die Berechtigung.' },
      { q: 'Wozu dient die Objektprüfung in ownedNote?',
        options: ['Sie verhindert, dass Benutzer über fremde IDs auf fremde Notizen zugreifen.', 'Sie beschleunigt die Datenbank.', 'Sie ersetzt die Prüfung des Tokens.', 'Sie validiert die Eingabe.'],
        correct: 0,
        rationales: ['Das ist die Maßnahme gegen BOLA/IDOR.', 'Mit Geschwindigkeit hat sie nichts zu tun.', 'Token und Besitz sind getrennte Prüfungen.', 'Die Eingabe prüft validateNoteInput.'],
        explain: 'Berechtigung auf Objektebene muss bei jedem Zugriff geprüft werden.' },
      { q: 'Warum speichert der Server nur den Hash des Tokens?',
        options: ['Weil Hashes kürzer sind.', 'Weil der Browser sonst den Header nicht sendet.', 'Weil Token sonst nicht ablaufen könnten.', 'Weil ein Datenleck sonst gültige Token preisgäbe.'],
        correct: 3,
        rationales: ['Die Länge ist nicht der Grund.', 'Der Browser sendet, was der Client setzt.', 'Ablauf wird getrennt gespeichert.', 'Aus dem Hash lässt sich ein zufälliges 192-Bit-Token nicht ableiten.'],
        explain: 'Wer den Speicher liest, findet keine direkt verwendbaren Zugangsdaten.' },
    ],
    sources: [
      rfc(6750, 'The OAuth 2.0 Authorization Framework: Bearer Token Usage', 'Standard zu Bearer-Token, WWW-Authenticate und insufficient_scope.'),
      owasp('API1 Broken Object Level Authorization', '0xa1-broken-object-level-authorization'),
      owasp('API2 Broken Authentication', '0xa2-broken-authentication'),
    ],
    verification: verification('401 bei fehlendem, erfundenem und abgelaufenem Token, 403 bei fehlendem Scope, 404 für fremde Notizen (Lesen, Ändern, Löschen) und der Gesundheitscheck ohne Token.', 'Anmeldung und Ausgabe von Token (OAuth), Widerruf, Rotation, Zeitverhalten beim Nachschlagen, TLS, Mandantenmodelle mit Freigaben.'),
  },
  {
    id: 'api-m2-l7', title: 'Schutz und Wandel: Ratenbegrenzung, Versionen und Abkündigung', minutes: 35,
    prerequisites,
    objectives: [
      'Eine Token-Bucket-Ratenbegrenzung je Benutzer umsetzen und mit 429 und Retry-After antworten',
      'Verträgliche von unverträglichen Änderungen einer API unterscheiden',
      'Eine alte Version mit Deprecation- und Sunset-Header abkündigen',
      'Die Grenzen einer prozesslokalen Begrenzung benennen',
    ],
    simple: `Eine öffentliche API muss mit Missbrauch und mit Fehlern in Clients rechnen: einer Schleife, die tausendmal pro Sekunde fragt, oder einem Skript, das alle IDs durchprobiert. Eine Ratenbegrenzung (Rate Limit) schützt davor. Beim Token-Bucket-Verfahren hat jeder Benutzer einen Eimer mit einer festen Zahl Marken. Jede Anfrage verbraucht eine, und der Eimer füllt sich mit gleichmäßiger Rate wieder auf. So sind kurze Spitzen erlaubt, aber nicht dauerhaft hohe Last. Ist der Eimer leer, antwortet die API 429 (Too Many Requests) mit Retry-After: so viele Sekunden soll der Client warten.

Das zweite Thema ist Wandel. APIs ändern sich, aber Clients sind nicht alle gleichzeitig aktualisiert. Verträglich sind Änderungen wie ein neues optionales Feld in der Antwort oder ein neuer Endpunkt: Clients ignorieren, was sie nicht kennen. Unverträglich sind Umbenennen oder Entfernen von Feldern, geänderte Typen oder Bedeutungen. Für unverträgliche Änderungen gibt es eine neue Version (hier /v1 gegenüber /v0). Die alte Version wird nicht abrupt abgeschaltet, sondern angekündigt.`,
    steps: [
      'Öffne src/ratelimit.js. Der Bucket je Schlüssel hat tokens und einen Zeitstempel. take füllt nach der vergangenen Zeit auf (höchstens bis zur Kapazität), verbraucht eine Marke oder meldet, nach wie vielen Sekunden wieder eine verfügbar ist. Die Uhr wird übergeben, damit Tests die Zeit steuern.',
      'In route (src/app.js) wird take je Benutzer nach der Anmeldung aufgerufen. Ist der Eimer leer, antwortet die API 429 mit Retry-After in Sekunden.',
      'Der erste Test setzt Kapazität 3 und Nachfüllrate 1 pro Sekunde: drei Anfragen 200, die vierte 429 mit Retry-After: 1. Nach 1000 Millisekunden (gestellte Uhr) gelingt wieder eine. Der zweite zeigt, dass Ada gebremst wird, Ben aber nicht.',
      'Der dritte Test ruft /v0/notes auf: dieselbe Antwort, aber mit Header Deprecation: @1767225600 (Zeitpunkt der Veraltung als Structured-Field-Datum nach RFC 9745), Sunset: Thu, 31 Dec 2026 23:59:59 GMT (letzter Betriebstag, RFC 8594) und Link: </v1/notes>; rel="successor-version". /v1/notes trägt keinen davon.',
      'Der vierte Test zeigt verträglich gegen unverträglich auf der Clientseite: Ein neues Feld pinned stört einen Client nicht, der nur title liest; ein umbenanntes Feld schon.',
      'Lies, was die Begrenzung nicht leistet: Sie gilt nur nach erfolgreicher Anmeldung. Anfragen ohne gültiges Token werden vorher mit 401 abgelehnt, aber nicht begrenzt. Ein Anmeldeendpunkt bräuchte eine eigene Begrenzung, zum Beispiel je IP-Adresse und je Konto.',
      'Überlege die Wahl der Werte: Kapazität (Stoß) und Rate (dauerhaft). Was braucht ein legitimer Client in einer Minute, und wann wäre ein Eimer zu klein?',
    ],
    background: `Die Begrenzung lebt im Arbeitsspeicher des Prozesses. Mit mehreren Instanzen hinter einem Verteiler hätte jede ihren eigenen Eimer, und die tatsächliche Grenze wäre ein Vielfaches. Produktiv braucht es einen gemeinsamen Speicher oder eine Begrenzung am Eingang (Proxy, API-Gateway). Außerdem begrenzt das Lab nur Anfragen, nicht deren Kosten: Eine teure Abfrage zählt wie eine billige. Weitere Schutzmaßnahmen stehen daher an anderer Stelle: Obergrenze der Rumpfgröße (413), Obergrenze für limit (Lektion 3), Zeitlimits und Begrenzung gleichzeitiger Verbindungen.

Retry-After hilft nur, wenn Clients es beachten. Ein guter Client wartet mindestens so lange, fügt etwas Zufall hinzu (Jitter), damit nicht alle gleichzeitig zurückkehren, und verdoppelt die Wartezeit bei wiederholten Fehlern (exponentielles Backoff). Wiederholungen sollten nur bei idempotenten Anfragen oder mit Idempotency-Key geschehen (Lektion 4).

Zur Abkündigung: RFC 9745 definiert den Header Deprecation, RFC 8594 den Header Sunset. Beide ersetzen keine Kommunikation mit den Betreibern der Clients (Nachricht, Zeitplan, Migrationsanleitung), sie machen sie nur maschinenlesbar und finden sich in Protokollen wieder. Beobachte, wer die alte Version noch nutzt, bevor du sie abschaltest.`,
    terms: [
      { term: 'Token-Bucket', text: 'Begrenzung mit Eimer aus Marken, die gleichmäßig nachgefüllt und pro Anfrage verbraucht werden.' },
      { term: '429', text: 'Statuscode „Too Many Requests“ (RFC 6585), meist mit Retry-After.' },
      { term: 'Deprecation', text: 'Header, der anzeigt, dass eine Ressource veraltet ist (RFC 9745).' },
      { term: 'Sunset', text: 'Header mit dem Zeitpunkt, ab dem eine Ressource voraussichtlich nicht mehr verfügbar ist (RFC 8594).' },
    ],
    code: { file: lab + 'src/ratelimit.js', lang: 'JavaScript', from: 'export function createLimiter' },
    code2: { file: lab + 'src/app.js', lang: 'JavaScript', from: 'const decision = limiter.take', to: "headers: { 'Retry-After': String(decision.retryAfterSeconds) } });" },
    code3: { file: lab + 'src/app.js', lang: 'JavaScript', from: "const lifecycle = match[1]", to: ': {};' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: specOutput('limits-versions'),
    mistakes: [
      { wrong: 'Keine Ratenbegrenzung vorzusehen, weil „es nur eine interne API“ ist.', why: 'Fehler in einem Client oder ein kompromittiertes Konto können die API trotzdem lahmlegen.', fix: 'Eine großzügige, aber vorhandene Grenze je Benutzer setzen und auf 429 testen.' },
      { wrong: '429 ohne Retry-After zu senden.', why: 'Clients raten die Wartezeit und überlasten die API erneut.', fix: 'Retry-After in Sekunden angeben und im Client beachten (mit Jitter und Backoff).' },
      { wrong: 'Felder ohne Ankündigung umzubenennen oder zu entfernen.', why: 'Bestehende Clients brechen.', fix: 'Neues Feld ergänzen, altes behalten, Veraltung ankündigen und erst nach Frist entfernen oder neue Version veröffentlichen.' },
      { wrong: 'Eine alte Version still abzuschalten.', why: 'Betreiber von Clients erfahren es erst durch Ausfälle.', fix: 'Deprecation und Sunset senden, Nutzung messen, Betreiber informieren, Termin einhalten.' },
    ],
    practice: 'Schreibe einen Client, der bei 429 nach Retry-After plus Zufall wartet und höchstens fünf Versuche macht. Teste ihn mit der steuerbaren Uhr und einem engen Limit, und halte fest, wie viele Anfragen er insgesamt benötigt.',
    exercises: [
      { task: 'Sende zusätzlich die Header RateLimit-Limit und RateLimit-Remaining (informativ) bei jeder Antwort.', acceptance: 'Ein Test prüft die Werte nach drei Anfragen; du vermerkst, dass die Header kein fester Standard sind und der Vertrag sie dokumentiert.' },
      { task: 'Grenzfall: Stelle die Uhr eine Stunde vor und rufe an.', acceptance: 'Der Eimer ist höchstens voll (Kapazität), nicht überfüllt; ein Test belegt es.' },
      { task: 'Fehlerfall: Entferne Math.min bei der Auffüllung.', acceptance: 'Nach langer Pause sind unbegrenzt viele Anfragen am Stück möglich; ein Test belegt es; du stellst die Begrenzung wieder her.' },
    ],
    quiz: [
      { q: 'Welche Antwort erhält ein Client, dessen Eimer leer ist?',
        options: ['403 ohne Header.', '429 mit Retry-After.', '503 ohne Rumpf.', '200 mit leerer Liste.'],
        correct: 1,
        rationales: ['403 betrifft Berechtigung.', 'Zu viele Anfragen: wartet die angegebene Zeit.', '503 meldet Überlast oder Wartung des Servers, nicht die Rate des einzelnen Clients.', 'Das täuscht Erfolg vor.'],
        explain: '429 mit Retry-After sagt dem Client, wann er es erneut versuchen darf.' },
      { q: 'Welche Änderung bricht bestehende Clients?',
        options: ['Ein neues optionales Feld in der Antwort.', 'Ein neuer Endpunkt.', 'Das Umbenennen eines Feldes ohne Übergang.', 'Eine bessere Fehlermeldung.'],
        correct: 2,
        rationales: ['Unbekannte Felder werden ignoriert.', 'Alte Clients rufen ihn nicht auf.', 'Der Client liest ein Feld, das es nicht mehr gibt.', 'Der Text ist nicht Teil der Maschinenlogik.'],
        explain: 'Verträglich ist, was Clients nicht kennen müssen; unverträglich, was sie bereits benutzen.' },
      { q: 'Wozu dient der Header Sunset?',
        options: ['Er nennt den Zeitpunkt der geplanten Abschaltung.', 'Er begrenzt die Rate der Anfragen je Client.', 'Er verschlüsselt die Antwort auf dem Übertragungsweg.', 'Er nennt die Softwareversion des Servers.'],
        correct: 0,
        rationales: ['So können Clients den Termin erkennen und rechtzeitig umziehen.', 'Das tun 429 und Retry-After.', 'Verschlüsselung leistet TLS.', 'Die Version steht nicht darin.'],
        explain: 'Sunset (RFC 8594) kündigt das Ende an; Deprecation (RFC 9745) zeigt, dass die Ressource veraltet ist.' },
    ],
    sources: [
      rfc(6585, 'Additional HTTP Status Codes', 'Standard zu 429 Too Many Requests.'),
      rfc(9745, 'The Deprecation HTTP Response Header Field'),
      rfc(8594, 'The Sunset HTTP Header Field'),
      mdn('Retry-After', 'Web/HTTP/Reference/Headers/Retry-After'),
      owasp('API4 Unrestricted Resource Consumption', '0xa4-unrestricted-resource-consumption'),
    ],
    verification: verification('Token-Bucket mit Auffüllung über die gestellte Uhr, 429 mit Retry-After, Trennung je Benutzer sowie Deprecation, Sunset und Link-Header auf /v0.', 'mehrere Instanzen mit gemeinsamem Speicher, Begrenzung vor der Anmeldung, Last- und Zeitverhalten bei echtem Verkehr, die Beachtung von Retry-After durch echte Clients.'),
  },
  {
    id: 'api-m2-l8', title: 'Projekt: Vertrag in OpenAPI und Vertragstest', minutes: 45,
    prerequisites: 'Die Lektionen 1 bis 7 dieses Moduls und das Modul „API-Arten“, besonders OpenAPI und JSON Schema.',
    objectives: [
      'Das Verhalten einer API in einem OpenAPI-Dokument beschreiben (Pfade, Statuscodes, Schemas, Header)',
      'Einen Vertragstest schreiben, der Antworten gegen das Dokument prüft',
      'Sicherstellen, dass jeder dokumentierte Status von einem Test ausgelöst wird',
      'Grenzen eines Vertragstests und eines Mini-Prüfers benennen',
    ],
    simple: `Eine Schnittstellenbeschreibung, die niemand prüft, veraltet. Der Code ändert sich, das Dokument bleibt stehen, und Clients verlassen sich auf das Falsche. Ein Vertragstest schließt die Lücke: Er ruft die laufende API auf und prüft jede Antwort gegen das Dokument. Ist der Status dort nicht aufgeführt, passt der Rumpf nicht zum Schema, oder fehlt ein verlangter Header, schlägt der Test fehl.

OpenAPI ist das verbreitete Format dafür. Es beschreibt Pfade, Methoden, Parameter, Anfrage- und Antwortrümpfe, Statuscodes, Header und die Sicherheitsverfahren. Die Rümpfe werden mit JSON Schema beschrieben.

Im Projekt ergänzt du die umgekehrte Richtung: Jeder im Dokument aufgeführte Status muss von mindestens einem Szenario ausgelöst werden. So bleibt das Dokument nicht beim Wunschdenken stehen.`,
    steps: [
      'Öffne openapi.json (OpenAPI 3.1.0). Unter paths stehen /v1/notes (get, post) und /v1/notes/{id} (get, put, delete) mit Parametern, Statuscodes und Headern. Unter components/schemas stehen Note, NoteInput, NoteList, Problem und ValidationProblem; Rümpfe verweisen mit $ref darauf.',
      'Lies das Schema NoteInput: additionalProperties: false verbietet unbekannte Felder (wie validateNoteInput), title ist Pflicht mit 1 bis 80 Zeichen, tags hat höchstens 5 Einträge mit Muster. Das Dokument und die Validierung müssen übereinstimmen; der Vertragstest prüft die Antworten, nicht die Eingabeprüfung.',
      'src/schema-check.js ist ein Mini-Prüfer für eine Teilmenge von JSON Schema: type, required, properties, additionalProperties: false, enum, minLength, maxLength, pattern, minimum, maximum, maxItems, items, format date-time und lokale $ref. Für echte Projekte nimmst du einen vollständigen Validator.',
      'tests/contract.test.js führt 34 Szenarien aus. Jedes nennt die Operation („POST /v1/notes“), und der Test prüft: Ist der Status dokumentiert? Gibt es für Status mit Rumpf den richtigen Medientyp und ein passendes Schema? Sind verlangte Header vorhanden (Location, ETag, Retry-After, WWW-Authenticate)? Hat ein Status ohne Rumpf (204, 304) wirklich keinen?',
      'Danach sammelt der Test, welche (Methode, Pfad, Status)-Kombinationen im Dokument stehen und von keinem Szenario ausgelöst wurden. Die Liste muss leer sein. Wer einen Status dokumentiert, muss ihn testen.',
      'Der zweite Test prüft den Prüfer selbst mit absichtlich falschen Daten: fehlendes Pflichtfeld, falscher Typ, unbekanntes Feld, ungültiges Datum. Ein Prüfer, der nie fehlschlägt, schützt nichts.',
      'Experiment (rückgängig machen): Benenne den Header Location in der Antwort um oder gib das interne Feld owner aus. Der Vertragstest schlägt mit „Header Location fehlt“ beziehungsweise „unbekanntes Feld owner“ fehl; beides wurde beim Erstellen der Lektion so geprüft.',
    ],
    background: `Was ein Vertragstest beweist: Implementierung und Dokument stimmen in den getesteten Fällen überein. Er beweist nicht, dass der Entwurf gut ist, dass alle Eingabekombinationen richtig behandelt werden oder dass das Dokument vollständig ist. Er ersetzt Fachtests (Lektionen 1 bis 7) nicht, ergänzt sie aber um eine Prüfung der Dokumentation.

Zum Stand: Am Stichtag nennt die Seite der OpenAPI-Spezifikation die Version 3.2.1 als neueste; das Lab nutzt 3.1.0 und beschränkt sich auf Konstrukte, die dort gelten. Das Dokument wurde mit keinem OpenAPI-Validator geprüft, nur durch den Vertragstest, der die Teile liest, die er braucht. In einem echten Projekt gehört eine Validierung des Dokuments gegen das offizielle Schema in die CI.

Weitere Ideen: Clientcode oder Dokumentation aus dem Dokument erzeugen, Beispiele im Dokument mitprüfen, das Dokument vor der Implementierung entwerfen (Design-First) und Änderungen am Dokument per Vergleich auf unverträgliche Änderungen prüfen.`,
    terms: [
      { term: 'OpenAPI', text: 'Format zur maschinenlesbaren Beschreibung von HTTP-APIs (Pfade, Parameter, Antworten, Sicherheit).' },
      { term: 'Vertragstest', text: 'Test, der prüft, ob die laufende API zur Beschreibung passt (oder ein Client zu den Antworten).' },
      { term: 'JSON Schema', text: 'Sprache zur Beschreibung der Struktur von JSON-Dokumenten, in OpenAPI 3.1 vollständig eingebettet.' },
      { term: 'Design-First', text: 'Vorgehen, bei dem zuerst der Vertrag entsteht und danach die Implementierung.' },
    ],
    code: { file: lab + 'openapi.json', lang: 'JSON', from: '"NoteInput": {', to: '"pattern": "^[a-z0-9-]{1,20}$"', plus: 4 },
    code2: { file: lab + 'src/schema-check.js', lang: 'JavaScript', from: 'export function check', to: 'errors.push(`${path}: Wert nicht in enum`);' },
    code3: { file: lab + 'tests/contract.test.js', lang: 'JavaScript', from: 'const seen = new Set();', to: "assert.deepEqual(untested, [], 'Dokumentierte Antworten ohne Test');" },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: specOutput('contract'),
    mistakes: [
      { wrong: 'Das Dokument von Hand zu pflegen und nie gegen die API zu prüfen.', why: 'Es weicht nach wenigen Änderungen ab; Clients verlassen sich auf Falsches.', fix: 'Vertragstest in die Testläufe und die CI aufnehmen.' },
      { wrong: 'Nur den Erfolgsfall zu beschreiben.', why: 'Clients wissen nicht, welche Fehler vorkommen und wie sie aussehen.', fix: 'Alle Statuscodes mit Schema und Headern dokumentieren und jeden mit einem Szenario testen.' },
      { wrong: 'additionalProperties nicht festzulegen und so jedes zusätzliche Feld stillschweigend zuzulassen.', why: 'Versehentlich ausgegebene interne Felder fallen nicht auf.', fix: 'Für Antwortschemas additionalProperties: false setzen; neue Felder bewusst im Vertrag ergänzen.' },
      { wrong: 'Dem Mini-Prüfer oder einem Test zu vertrauen, den man nie fehlschlagen sah.', why: 'Ein Prüfer, der immer besteht, beweist nichts.', fix: 'Absichtliche Abweichungen testen (wie im zweiten Test) und gelegentlich eine Mutation ausprobieren.' },
    ],
    practice: 'Ergänze die API um die Ressource „Schlagwörter“ mit GET /v1/tags, trage sie zuerst im OpenAPI-Dokument ein (Design-First), schreibe dann die Szenarien für den Vertragstest und implementiere erst danach die Route. Dokumentiere, welche Abweichungen der Test beim Entwickeln gefunden hat.',
    exercises: [
      { task: 'Ergänze im Dokument für die Liste das Antwort-Header Link (nicht verpflichtend) und den Parameter-Wert nextCursor als Beispiel.', acceptance: 'Das Dokument bleibt gültig; der Vertragstest läuft grün; du erklärst, warum ein optionaler Header nicht als verpflichtend geprüft wird.' },
      { task: 'Grenzfall: Dokumentiere die Antwort 405 für /v1/notes und teste sie.', acceptance: 'Ohne Szenario meldet der Test „Dokumentierte Antworten ohne Test“; mit Szenario (DELETE auf die Sammlung) läuft er grün.' },
      { task: 'Fehlerfall: Gib in der Antwort für ein Datum „gestern“ statt eines ISO-Zeitpunkts aus.', acceptance: 'Der Vertragstest meldet „kein date-time“; du erklärst, welche Clients davon betroffen wären, und stellst das Format wieder her.' },
    ],
    quiz: [
      { q: 'Was prüft ein Vertragstest gegen ein OpenAPI-Dokument?',
        options: ['Ob die Antworten der API zum Dokument passen.', 'Ob die Hardware des Servers ausreicht.', 'Ob die Oberfläche barrierefrei ist.', 'Ob alle Nutzer berechtigt sind.'],
        correct: 0,
        rationales: ['Status, Header und Rümpfe werden mit der Beschreibung verglichen.', 'Dafür sind Lasttests nötig.', 'Mit Oberflächen hat er nichts zu tun.', 'Berechtigungen prüfen Fachtests.'],
        explain: 'Der Vertragstest verhindert, dass Beschreibung und Verhalten auseinanderlaufen.' },
      { q: 'Warum muss jeder dokumentierte Status von einem Szenario ausgelöst werden?',
        options: ['Damit der Test länger dauert.', 'Weil OpenAPI es verlangt.', 'Damit niemand das Dokument ändern kann.', 'Damit nichts dokumentiert ist, was nie geprüft wurde.'],
        correct: 3,
        rationales: ['Dauer ist kein Ziel.', 'Das ist eine Regel dieses Tests, keine der Spezifikation.', 'Änderungen bleiben möglich.', 'Ungeprüfte Dokumentation ist Behauptung.'],
        explain: 'Die Umkehrprüfung stellt sicher, dass auch seltene Fehlerfälle tatsächlich so aussehen wie beschrieben.' },
      { q: 'Was beweist der Test mit absichtlich falschen Daten für den Mini-Prüfer?',
        options: ['Dass die API fehlerfrei ist.', 'Dass der Prüfer Abweichungen tatsächlich meldet.', 'Dass das Dokument vollständig ist.', 'Dass JSON Schema überflüssig ist.'],
        correct: 1,
        rationales: ['Er prüft den Prüfer, nicht die API.', 'Ein Prüfer, der Fehler erkennt, ist die Voraussetzung dafür, dass ein grüner Lauf etwas bedeutet.', 'Vollständigkeit prüft er nicht.', 'Das Gegenteil: Er nutzt JSON Schema.'],
        explain: 'Tests für die Prüfung verhindern ein „immer grün“.' },
    ],
    sources: [
      { title: 'OpenAPI Specification v3.1.1', url: 'https://spec.openapis.org/oas/v3.1.1.html', note: 'Spezifikation; Inhalt hier eigenständig zusammengefasst. Neuere Version 3.2.x existiert (Stand 14.11.2026).' },
      { title: 'JSON Schema: Understanding JSON Schema', url: 'https://json-schema.org/understanding-json-schema/reference', note: 'Referenz der Schlüsselwörter.' },
      rfc(9457, 'Problem Details for HTTP APIs'),
    ],
    verification: verification('Vertragstest mit 34 Szenarien gegen openapi.json (Status, Medientyp, Schema, Pflicht-Header, Vollständigkeit) und der Test des Prüfers; zusätzlich je eine Mutation (umbenannter Header, ausgegebenes internes Feld), die den Test erwartungsgemäß scheitern ließ.', 'eine Validierung von openapi.json gegen das offizielle Meta-Schema, Sicherheitsschemata über den Bearer-Fall hinaus, Callbacks und Webhooks, Clientcode-Erzeugung.'),
  },
];
