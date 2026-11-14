// Node.js · Grundlagen. Stichtag 14.11.2026.
// Eigene Texte; Code und Tests liegen unter content/examples/node-lab/ (Node.js 22.23 lokal, 24.22 im Container, node:test).
// Die offiziellen Dokumentationen werden nur verlinkt, nichts daraus kopiert.
const lab = 'content/examples/node-lab/';
const docs = (title, url, note = 'Offizielle Dokumentation; Inhalt hier eigenständig zusammengefasst.') => ({ title, url, note });
const api = (title, page) => docs(title, `https://nodejs.org/api/${page}`);

export const module = {
  id: 'node-m1', course: 'node', part: 29, partTitle: 'Node.js · Laufzeit, Module und Server',
  title: 'Node.js Grundlagen · Event Loop, Module, Asynchronität und Dateien',
};

export const lessons = [
  {
    id: 'node-m1-l1', title: 'Laufzeit, Event Loop und Kommandozeile', minutes: 45,
    prerequisites: 'JavaScript-Grundlagen: Funktionen, Callbacks, Promises (Modul js-m1).',
    objectives: [
      'Erklären, was Node.js ist und worin es sich von einem Browser unterscheidet',
      'Die Reihenfolge von synchronem Code, process.nextTick, Promises, Timern und setImmediate vorhersagen',
      'Erklären, warum ein blockierter Event Loop alle anderen Aufgaben verzögert',
      'Ein Kommandozeilenprogramm mit parseArgs, stderr und Exit-Codes schreiben',
    ],
    simple: `Node.js führt JavaScript außerhalb des Browsers aus, zum Beispiel auf deinem Rechner oder einem Server. Es besteht aus drei Teilen: der Engine V8, die JavaScript ausführt, der Bibliothek libuv, die Dateien, Netzwerk und Timer verwaltet, und einer Sammlung eingebauter Module (fs für Dateien, http für Server, path für Pfade und viele mehr). Es gibt kein document und kein window, dafür gibt es process, Dateizugriff und Netzwerk.

Dein JavaScript läuft in einem einzigen Thread. Das klingt nach einem Nachteil, ist aber der Kern des Modells: Während Node.js auf eine Datei oder eine Netzwerkantwort wartet, arbeitet der Thread an anderen Aufgaben. Eine Schleife, der Event Loop, holt fertige Ergebnisse ab und ruft die passenden Callbacks auf. Wer viele Verbindungen gleichzeitig bedient, kommt deshalb mit einem Thread aus, solange keine Aufgabe ihn lange blockiert.

Der Event Loop hat feste Phasen. Für den Alltag reicht diese Reihenfolge: Erst läuft der gesamte synchrone Code. Danach leert Node die Microtask-Warteschlangen (process.nextTick und Promise-Callbacks). Erst dann kommen Timer (setTimeout), I/O-Callbacks und zuletzt setImmediate. Die Details zu nextTick und Promises hängen davon ab, ob die Datei ein ES-Modul oder CommonJS ist; das siehst du im Code unten.

Programme brauchen außerdem eine Schnittstelle nach außen: Argumente in process.argv, Umgebungsvariablen in process.env, Ausgaben auf stdout und stderr und einen Exit-Code, der dem aufrufenden Programm sagt, ob alles gut ging (0) oder nicht.`,
    steps: [
      'Starte order.mjs und order.cjs. Beide Dateien enthalten denselben Code: ein Timer mit 0 ms, setImmediate, ein Promise und process.nextTick. Vergleiche die beiden Ausgaben.',
      'Im ES-Modul läuft der Promise vor nextTick, im CommonJS-Modul ist es umgekehrt. Grund: Ein ES-Modul wird selbst innerhalb eines Promise-Jobs ausgewertet, deshalb sind die Promise-Callbacks bereits „dran“, wenn das Modul fertig ist. Die Reihenfolge Timer gegen Immediate ist im Hauptmodul nicht festgelegt und hängt davon ab, wie schnell der Prozess startet.',
      'orderInsideIo startet dieselbe Frage innerhalb eines I/O-Callbacks (readFile). Dort ist die Reihenfolge fest: setImmediate läuft vor dem 0-ms-Timer, weil nach der I/O-Phase die Check-Phase folgt.',
      'lateTimer blockiert die Schleife absichtlich mit einer aktiven Warteschleife. Ein Timer mit 10 ms meldet sich dann erst nach der Blockade, die Zeitangabe ist also ein Mindestwert und kein Versprechen.',
      'In cli.js liest parseArgs die Argumente. Mit strict: true wirft es bei unbekannten Optionen einen Fehler, statt sie zu ignorieren.',
      'Die Funktion run gibt Ausgabe, Fehlertext und Code zurück, statt selbst zu schreiben. Das macht sie testbar. Nur der Startblock am Dateiende schreibt auf stdout und stderr.',
      'Der Exit-Code wird mit process.exitCode gesetzt, nicht mit process.exit(). Letzteres bricht sofort ab, auch wenn noch Ausgaben ausstehen.',
      'Konvention im Lab: 0 = erfolgreich, 2 = ungültiger Wert, 64 = unbekannte Option (Bedeutung „falsche Verwendung“ in der BSD-Konvention sysexits). Wichtig ist, dass dein Programm dokumentiert, was es zurückgibt.',
    ],
    background: `Warum nur ein Thread? Threads mit gemeinsamem Speicher sind schwer richtig zu benutzen: Zwei Threads, die dieselbe Variable ändern, brauchen Sperren, und Fehler dabei zeigen sich selten und zufällig. Das Event-Loop-Modell vermeidet das: Es gibt immer nur einen laufenden Callback, und jeder läuft zu Ende, bevor der nächste beginnt. Der Preis ist die Regel „nicht blockieren“. Eine Berechnung, die eine Sekunde dauert, hält in dieser Sekunde jede andere Anfrage an.

Ganz ohne weitere Threads kommt Node.js trotzdem nicht aus. libuv hat einen kleinen Thread-Pool (standardmäßig vier Threads) für Aufgaben, die das Betriebssystem nicht asynchron anbietet, etwa viele Dateioperationen, Kompression oder Passwort-Hashing. Dein JavaScript sieht davon nichts: Du bekommst weiterhin Callback oder Promise. Für eigene Rechenarbeit gibt es worker_threads (Lektion „Betrieb“).

Zur Version: Node.js hat gerade und ungerade Hauptversionen und lange Unterstützungszeiträume (LTS) für ausgewählte Versionen. Welche Version aktuell empfohlen wird, steht auf nodejs.org unter „Releases“ und ändert sich; Quellen nennen zum Stichtag unterschiedliche Stände. Dieses Lab wurde mit 22.23 und 24.22 geprüft, andere Versionen bitte selbst testen.`,
    terms: [
      { term: 'V8 / libuv', text: 'V8 führt JavaScript aus; libuv liefert Event Loop, Dateien, Netzwerk und Thread-Pool.' },
      { term: 'Event Loop', text: 'Die Schleife, die fertige Aufgaben abholt und ihre Callbacks nacheinander ausführt.' },
      { term: 'Microtask', text: 'Kurze Aufgabe (Promise-Callback, nextTick), die vor dem nächsten Timer oder I/O läuft.' },
      { term: 'stdout / stderr', text: 'Zwei Ausgabekanäle: Ergebnis auf stdout, Fehlermeldungen auf stderr.' },
      { term: 'Exit-Code', text: 'Zahl, mit der ein Programm endet. 0 bedeutet Erfolg, alles andere Fehler.' },
    ],
    code: { file: lab + 'src/runtime/order.mjs', lang: 'JavaScript (ES-Modul)' },
    code2: { file: lab + 'src/runtime/loop-order.js', lang: 'JavaScript' },
    code3: { file: lab + 'src/runtime/cli.js', lang: 'JavaScript' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: `$ node src/runtime/order.mjs
sync > promise > nextTick > timeout > immediate
$ node src/runtime/order.cjs
sync > nextTick > promise > immediate > timeout
(die Reihenfolge timeout/immediate kann im Hauptmodul wechseln)

$ node src/runtime/cli.js --upper -n 2 Ada
HALLO ADA!
HALLO ADA!
$ node src/runtime/cli.js -n 0
--times muss eine ganze Zahl von 1 bis 100 sein, nicht "0"      (Exit-Code 2)
$ node src/runtime/cli.js --colour
Unknown option '--colour'. To specify a positional argument ... (Exit-Code 64)

npm test (node-lab): Tests 49, davon 48 grün, 1 übersprungen (Node 22.23)`,
    mistakes: [
      { wrong: 'setTimeout(fn, 0) für „sofort“ halten.', why: 'Der Wert ist eine Mindestverzögerung. Der Callback läuft erst nach dem synchronen Code, den Microtasks und frühestens in der Timer-Phase.', fix: 'Für „direkt danach“ queueMicrotask oder await verwenden, für „nach I/O“ setImmediate.' },
      { wrong: 'Eine lange Berechnung im Anfrage-Handler ausführen.', why: 'Der einzige JavaScript-Thread ist belegt; Timer, Netzwerk und alle anderen Anfragen warten (lateTimer zeigt das).', fix: 'In kleine Schritte teilen, in einen Worker Thread auslagern oder in einen anderen Dienst verschieben.' },
      { wrong: 'Programme mit process.exit(1) beenden, ohne auf Ausgaben zu warten.', why: 'process.exit() beendet so schnell wie möglich, auch wenn Schreibvorgänge auf stdout oder stderr noch laufen; Text kann fehlen.', fix: 'process.exitCode setzen und das Programm von selbst enden lassen.' },
      { wrong: 'Annehmen, dass setTimeout(…, 0) und setImmediate im Hauptmodul in fester Reihenfolge laufen.', why: 'Die Reihenfolge hängt von der Prozessgeschwindigkeit ab. Nur innerhalb eines I/O-Callbacks ist sie festgelegt.', fix: 'Code schreiben, der nicht von dieser Reihenfolge abhängt, oder bewusst innerhalb von I/O prüfen.' },
    ],
    practice: 'Schreibe jedes Kommandozeilenprogramm so, dass die Logik eine reine Funktion ist (Argumente hinein, Ergebnis und Code heraus) und nur ein kleiner Startblock Ausgabe und Exit-Code erledigt. So testest du ohne Kindprozess und behältst Exit-Codes unter Kontrolle.',
    exercises: [
      { task: 'Füge cli.js eine Option --prefix hinzu (Text vor dem Gruß) und schreibe einen Test dafür in tests/runtime.test.js.', acceptance: 'Der Test prüft die Ausgabe mit und ohne Option; npm test bleibt grün.' },
      { task: 'Grenzfall: Was gibt cli.js bei -n 100 und bei -n 101 zurück? Und bei -n 1.5? Ergänze fehlende Tests.', acceptance: '100 ergibt 100 Zeilen mit Code 0; 101 und 1.5 ergeben Code 2 und eine Meldung auf stderr.' },
      { task: 'Fehlerfall: Ändere lateTimer(10, 50) auf lateTimer(10, 0). Wie weit weicht die gemessene Zeit von 10 ms ab, und warum nicht auf die Millisekunde genau?', acceptance: 'Du erklärst, dass Timer ein Minimum sind und Genauigkeit vom Betriebssystem und von anderen Aufgaben abhängt; Tests dürfen deshalb nur Grenzen prüfen, keine exakten Zeiten.' },
    ],
    quiz: [
      { q: 'Ein ES-Modul enthält synchronen Code, ein Promise.then, process.nextTick, setTimeout(…, 0) und setImmediate. In welcher Reihenfolge laufen diese Teile im Hauptmodul auf Node.js (in diesem Lab geprüft)?',
        options: ['sync, nextTick, promise, immediate, timeout', 'sync, promise, nextTick, timeout, immediate (timeout/immediate kann wechseln)', 'timeout, immediate, sync, promise, nextTick', 'sync, timeout, promise, nextTick, immediate'],
        correct: 1,
        rationales: ['Diese Reihenfolge entsteht bei CommonJS, nicht bei einem ES-Modul.', 'Im ES-Modul läuft der Promise vor nextTick; die Reihenfolge der beiden letzten ist im Hauptmodul nicht festgelegt.', 'Synchroner Code läuft immer zuerst, Timer nie vor dem Ende des Hauptskripts.', 'Microtasks laufen vor Timern, nicht danach.'],
        explain: 'Synchroner Code, dann Microtasks (hier Promise vor nextTick), dann Timer und Check-Phase.' },
      { q: 'Warum verzögert eine lange Schleife im Anfrage-Handler alle anderen Anfragen?',
        options: ['Der Server schaltet bei hoher Last automatisch in einen Wartemodus um.', 'Es gibt nur einen JavaScript-Thread; solange er rechnet, holt der Event Loop keine Callbacks ab.', 'Node.js sperrt das Netzwerk, solange die CPU stark ausgelastet ist.', 'Der Garbage Collector hält an, bis die Schleife vollständig fertig ist.'],
        correct: 1,
        rationales: ['Einen solchen Modus gibt es nicht.', 'Callbacks laufen nacheinander auf demselben Thread, deshalb wartet alles andere.', 'Das Netzwerk ist nicht gesperrt; es wird nur nicht bedient.', 'Mit dem Garbage Collector hat das Verhalten nichts zu tun.'],
        explain: 'Ein blockierter Event Loop verzögert Timer, Netzwerk und alle weiteren Anfragen (lateTimer zeigt das messbar).' },
      { q: 'Warum setzt cli.js process.exitCode, statt process.exit() aufzurufen?',
        options: ['process.exit() existiert in ES-Modulen nicht und löst dort einen Fehler aus.', 'process.exit() beendet sofort, auch wenn noch Ausgaben auf stdout oder stderr ausstehen.', 'exitCode ist schneller, weil der Prozess dabei nicht aufräumen muss.', 'process.exit() kann nur 0 zurückgeben und nie einen Fehlercode melden.'],
        correct: 1,
        rationales: ['Die Funktion existiert; sie ist nur oft unnötig.', 'Genau davor warnt die Dokumentation: Ausgaben können abgeschnitten werden.', 'Geschwindigkeit spielt keine Rolle.', 'process.exit akzeptiert jeden Code.'],
        explain: 'Mit exitCode endet das Programm geordnet, nachdem alle Ausgaben geschrieben sind.' },
    ],
    sources: [
      docs('Node.js: The Node.js Event Loop', 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick', 'Phasen des Event Loops, nextTick und Timer erklärt.'),
      api('Node.js: util.parseArgs', 'util.html#utilparseargsconfig'),
      api('Node.js: process (Exit-Codes, exitCode)', 'process.html#processexitcode'),
    ],
    verification: 'Lab node-lab: Die Reihenfolgen von order.mjs und order.cjs, das Verhalten im I/O-Callback, der verzögerte Timer und die Exit-Codes 0, 2 und 64 wurden mit Node.js 22.23 beobachtet; der gesamte Lab-Test läuft auch mit Node.js 24.22 grün. Die Reihenfolge von Timer und Immediate im Hauptmodul ist absichtlich nicht getestet, weil sie nicht festgelegt ist.',
  },
  {
    id: 'node-m1-l2', title: 'Module und npm: ESM, CommonJS, exports und package.json', minutes: 45,
    prerequisites: 'Lektion „Laufzeit, Event Loop und Kommandozeile“ (node-m1-l1).',
    objectives: [
      'ES-Module und CommonJS unterscheiden und sagen, woran Node.js das Modulsystem einer Datei erkennt',
      'Mit exports und imports in package.json festlegen, was andere von einem Paket sehen dürfen',
      'JSON-Dateien mit import attributes laden und __dirname durch import.meta.dirname ersetzen',
      'Erklären, was ein Lockfile ist und warum Abhängigkeiten ein Sicherheitsthema sind',
    ],
    simple: `Ein Modul ist eine Datei, die etwas exportiert, was andere Dateien importieren. Node.js kennt zwei Systeme. CommonJS (CJS) ist das ältere: require('x') und module.exports. ES-Module (ESM) sind der Standard der Sprache: import und export. Welches System eine Datei benutzt, erkennt Node.js an der Endung (.mjs ist ESM, .cjs ist CommonJS) und bei .js am Feld "type" in der nächstgelegenen package.json. Mit "type": "module" sind .js-Dateien ES-Module; ohne die Angabe sind sie CommonJS.

Neue Projekte starten mit ES-Modulen. Der Alltag ist trotzdem gemischt: Viele Pakete sind noch CommonJS. Ein ES-Modul kann CommonJS importieren (module.exports erscheint als Standardexport). Umgekehrt ging das lange nicht; neuere Node-Versionen erlauben require() für ES-Module ohne Top-Level-Await. In diesem Lab ist das mit Node 22.23 und 24.22 geprüft.

package.json ist die Steckbrief-Datei eines Projekts. Mit "exports" legst du fest, welche Pfade andere importieren dürfen; alles andere bleibt privat und führt zum Fehler ERR_PACKAGE_PATH_NOT_EXPORTED. Mit "imports" definierst du interne Abkürzungen, die mit # beginnen.

npm installiert Abhängigkeiten aus dem Register. Die Datei package-lock.json hält fest, welche genauen Versionen installiert wurden, damit alle dasselbe bekommen. Jede Abhängigkeit ist fremder Code, der bei dir läuft, daher ist sie auch ein Sicherheitsthema (siehe Kurs Web-Sicherheit).`,
    steps: [
      'package.json des Labs: "type": "module" macht .js-Dateien zu ES-Modulen. "engines" nennt die erwartete Node-Version; npm warnt bei Abweichung.',
      '"exports" gibt nur ./text frei (die Datei src/modules/text.js). Das Lab importiert sich in den Tests selbst über rootpfad-node-lab/text, so wie es ein Fremder täte.',
      'Der Import von rootpfad-node-lab/src/modules/format.js scheitert mit ERR_PACKAGE_PATH_NOT_EXPORTED: Der Pfad existiert, ist aber nicht freigegeben.',
      '"imports" definiert #format als Abkürzung. text.js nutzt sie, ohne relative Pfade wie ../../ zu brauchen. Solche Abkürzungen gelten nur innerhalb des Pakets.',
      'legacy.cjs ist CommonJS. Ein ES-Modul importiert es mit import legacy from …; module.exports wird zum Standardexport.',
      'JSON lädt man mit import data from "./data.json" with { type: "json" }. Die Angabe with erklärt Node, dass es sich um JSON handelt und nicht um Code.',
      'In ES-Modulen gibt es kein __dirname und kein require. Stattdessen liefern import.meta.dirname und import.meta.filename die Pfade; wer require braucht, nutzt createRequire.',
      'Dynamisches import() liefert ein Promise. Es eignet sich für optionale Module; ein fehlendes Modul meldet ERR_MODULE_NOT_FOUND.',
    ],
    background: `Warum gibt es zwei Modulsysteme? CommonJS entstand, als JavaScript im Browser noch gar keine Module hatte; require lädt synchron und zur Laufzeit. Der später standardisierte ESM-Mechanismus ist statisch: Importe stehen oben, Werkzeuge können sie vor dem Start analysieren, und das Laden darf asynchron sein. Genau deshalb kann ein ES-Modul Top-Level-Await benutzen, ein require() aber nicht darauf warten. Deshalb gilt die Ausnahme beim require von ES-Modulen.

exports ist mehr als Ordnung: Es ist eine Zugriffsgrenze. Ohne exports kann jeder jede Datei deines Pakets importieren und sich darauf verlassen; Änderungen an Interna brechen dann fremde Projekte. Mit exports versprichst du nur das, was du freigibst.

Lockfile und Sicherheit: Ohne package-lock.json könnte npm install heute andere Versionen holen als gestern. Mit Lockfile bekommt jeder dieselben, und ein Sicherheitsupdate ist ein sichtbarer Eintrag in der Versionsverwaltung. npm ci installiert strikt nach Lockfile und ist für Pipelines gedacht. Ein Lockfile ersetzt aber keine Prüfung: Prüfe neue Abhängigkeiten auf Wartung, Lizenz und Größe, bevor du sie aufnimmst.`,
    terms: [
      { term: 'ESM / CJS', text: 'ES-Module (import/export) und CommonJS (require/module.exports): die zwei Modulsysteme.' },
      { term: 'exports (package.json)', text: 'Liste der Pfade, die andere importieren dürfen; alles andere ist gesperrt.' },
      { term: 'imports (package.json)', text: 'Paketinterne Abkürzungen, die mit # beginnen.' },
      { term: 'Import Attributes', text: 'Die Angabe with { type: "json" } beim Import, die den Dateityp festlegt.' },
      { term: 'Lockfile', text: 'package-lock.json: genaue Versionen aller installierten Pakete.' },
    ],
    code: { file: lab + 'package.json', lang: 'JSON' },
    code2: { file: lab + 'src/modules/text.js', lang: 'JavaScript (ES-Modul)' },
    code3: { file: lab + 'tests/modules.test.js', lang: 'JavaScript', from: "test('ESM importiert CommonJS", to: "'ERR_PACKAGE_PATH_NOT_EXPORTED'", plus: 1 },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: `npm test (Ausschnitt tests/modules.test.js, Node 22.23)
 ✔ ESM: benannte und Standard-Exports, Subpath-Import #format
 ✔ ESM importiert CommonJS, JSON per import attributes
 ✔ CommonJS kann ESM laden: require() eines ES-Moduls ohne Top-Level-Await
 ✔ Dynamisches import() liefert ein Promise und eignet sich für optionale Module
 ✔ "exports" sperrt alles, was nicht aufgeführt ist
 ✔ import.meta statt __dirname; kein require im ES-Modul

Beobachtet: slugify('Größe Ü') ergibt 'gro-e-u': Das ß hat keine Zerlegung in Grundbuchstaben und wird wie ein Sonderzeichen behandelt. Für deutsche Slugs braucht es eine eigene Ersetzung (ß → ss).`,
    mistakes: [
      { wrong: 'In einer .js-Datei import schreiben, ohne "type": "module" zu setzen.', why: 'Ohne die Angabe liest Node die Datei als CommonJS und meldet einen Syntaxfehler bei import.', fix: '"type": "module" in package.json setzen oder die Datei .mjs nennen.' },
      { wrong: '__dirname in einem ES-Modul benutzen.', why: 'Die Variable gibt es dort nicht (ReferenceError).', fix: 'import.meta.dirname oder import.meta.filename verwenden.' },
      { wrong: 'Interne Dateien eines Pakets ohne exports veröffentlichen.', why: 'Andere importieren Pfade, die du später verschieben willst, und dein Umbau bricht fremden Code.', fix: '"exports" auf die bewusst öffentlichen Einstiegspunkte beschränken.' },
      { wrong: 'package-lock.json nicht einchecken oder in der Pipeline npm install statt npm ci nutzen.', why: 'Builds sind dann nicht reproduzierbar, und ein unbemerkt neu aufgelöstes Paket kann eine Sicherheitslücke oder einen Bruch mitbringen.', fix: 'Lockfile einchecken, in Pipelines npm ci benutzen und Updates bewusst vornehmen.' },
    ],
    practice: 'Beginne neue Projekte mit "type": "module", gib über "exports" nur frei, was Fremde brauchen, und prüfe jede neue Abhängigkeit mit npm view <name> (Version, Lizenz, letzte Veröffentlichung) und einem Blick auf die Wartung, bevor du sie installierst.',
    exercises: [
      { task: 'Füge text.js eine Funktion truncate(text, max) hinzu und exportiere sie. Schreibe einen Test über den Selbstverweis rootpfad-node-lab/text.', acceptance: 'Der Test importiert über den Paketnamen, nicht über einen relativen Pfad, und ist grün.' },
      { task: 'Grenzfall: Ergänze slugify so, dass ß zu ss wird und ä, ö, ü zu a, o, u bleiben. Was ergibt slugify("Größe Ü")?', acceptance: 'Das Ergebnis lautet "grosse-u"; die bisherigen Tests laufen weiter und ein neuer Test deckt ß ab.' },
      { task: 'Fehlerfall: Importiere in einer Testdatei rootpfad-node-lab/src/modules/format.js und lies den Fehlercode. Gib danach den Pfad in "exports" frei und beschreibe die Folgen für Nutzer des Pakets.', acceptance: 'Du nennst ERR_PACKAGE_PATH_NOT_EXPORTED und erklärst, dass freigegebene Pfade zur öffentlichen Schnittstelle werden.' },
    ],
    quiz: [
      { q: 'Woran erkennt Node.js, ob eine Datei mit der Endung .js ein ES-Modul oder CommonJS ist?',
        options: ['Am ersten Wort der Datei: import bedeutet ESM.', 'Am Feld "type" in der nächstgelegenen package.json (ohne Angabe: CommonJS).', 'Am Dateinamen allein; .js ist immer ESM.', 'An der Node-Version.'],
        correct: 1,
        rationales: ['Node rät nicht anhand des Inhalts; es nutzt feste Regeln.', 'Bei .js entscheidet das Feld "type"; .mjs und .cjs legen das System unabhängig davon fest.', 'Die Endung .js allein legt das Modulsystem nicht fest.', 'Die Version ändert die Regel nicht.'],
        explain: '.mjs und .cjs sind eindeutig; bei .js entscheidet "type" in der nächsten package.json.' },
      { q: 'Was bewirkt das Feld "exports" in package.json?',
        options: ['Es listet, welche Pakete installiert werden müssen.', 'Es legt fest, welche Pfade des Pakets von außen importiert werden dürfen.', 'Es beschleunigt den Start der Anwendung.', 'Es gibt die Dateien zum Download frei.'],
        correct: 1,
        rationales: ['Das übernehmen dependencies.', 'Nicht aufgeführte Pfade scheitern mit ERR_PACKAGE_PATH_NOT_EXPORTED.', 'Mit der Geschwindigkeit hat es nichts zu tun.', 'Es geht um Importrechte innerhalb von Node, nicht um Downloads.'],
        explain: 'exports ist die Zugriffsgrenze eines Pakets: Nur freigegebene Pfade sind importierbar.' },
      { q: 'Wofür verwendest du in einer CI-Pipeline npm ci statt npm install?',
        options: ['npm ci ist nur die kürzere Schreibweise von npm install und tut dasselbe.', 'npm ci installiert genau nach package-lock.json und bricht bei Abweichung zur package.json ab.', 'npm ci installiert immer die jeweils neuesten Versionen aller Pakete.', 'npm ci lädt ausschließlich die Entwicklungsabhängigkeiten eines Projekts.'],
        correct: 1,
        rationales: ['Es verhält sich anders.', 'So sind Builds reproduzierbar, und Abweichungen fallen auf.', 'Das Gegenteil: Die Versionen kommen aus dem Lockfile.', 'Es installiert alle, abhängig von den Optionen.'],
        explain: 'npm ci ist für reproduzierbare Installationen nach Lockfile gedacht.' },
    ],
    sources: [
      api('Node.js: Modules – Packages (exports, imports, type)', 'packages.html'),
      api('Node.js: ECMAScript modules', 'esm.html'),
      docs('npm Docs: package.json und npm ci', 'https://docs.npmjs.com/cli/v11/commands/npm-ci', 'Beschreibt, wie npm ci nach dem Lockfile installiert.'),
    ],
    verification: 'Lab node-lab: Die sechs Tests zu Modulen laufen mit Node.js 22.23 und 24.22 grün; require() eines ES-Moduls ohne Top-Level-Await, ERR_PACKAGE_PATH_NOT_EXPORTED, ERR_MODULE_NOT_FOUND und JSON-Import wurden beobachtet. Nicht geprüft: Verhalten älterer Versionen als 22.18 und Veröffentlichung eines Pakets bei npm.',
  },
  {
    id: 'node-m1-l3', title: 'Asynchrone Programmierung: Promises, Abbruch, Zeitlimit und Wiederholung', minutes: 50,
    prerequisites: 'Lektionen „Laufzeit, Event Loop und Kommandozeile“ und „Module und npm“.',
    objectives: [
      'Einen Callback in eine Promise-Funktion überführen und async/await sicher einsetzen',
      'Mit AbortSignal ein Zeitlimit setzen und Abbruch an abbrechbare Funktionen weiterreichen',
      'Eine Wiederholung mit wachsender Wartezeit (Backoff) und eine begrenzte Parallelität bauen',
      'Erklären, warum eine unbehandelte Promise-Ablehnung den Prozess beendet',
    ],
    simple: `Asynchron heißt: Eine Aufgabe wird gestartet, das Ergebnis kommt später, und dein Programm arbeitet inzwischen weiter. Früher gab es dafür Callbacks. Heute benutzt man Promises: Ein Promise ist ein Versprechen auf ein Ergebnis oder einen Fehler. Mit async und await liest sich asynchroner Code wie normaler: const text = await readFile(…). Der Thread wird dabei nicht blockiert; während des Wartens laufen andere Aufgaben.

In der Praxis sind die Wartezeiten das Problem. Ein Netzwerkaufruf kann ewig hängen, ein Dienst kann kurz ausfallen, und tausend gleichzeitige Aufrufe können ihn überlasten. Drei Bausteine gehören deshalb in jede Werkzeugkiste. Erstens ein Zeitlimit: Nach einer festen Zeit wird abgebrochen. Zweitens eine Wiederholung mit wachsender Pause, damit ein kurzer Ausfall nicht gleich zum Fehler wird und der Dienst nicht überrannt wird. Drittens eine Begrenzung der Parallelität, etwa höchstens zwei Aufrufe gleichzeitig.

Abbruch läuft in Node.js über AbortSignal. Das Signal wird einer Funktion mitgegeben (fetch, timers/promises, viele fs-Funktionen) und löst dort einen Abbruch aus. AbortSignal.timeout(ms) liefert ein Signal, das nach der Zeit von selbst abbricht.

Ablehnungen, die niemand abfängt, sind gefährlich: Seit Node.js 15 beendet eine unbehandelte Promise-Ablehnung den Prozess mit Exit-Code 1. Das ist gewollt, denn ein Programm in unbekanntem Zustand sollte nicht weiterlaufen.`,
    steps: [
      'delay(ms, value, { signal }) nutzt setTimeout aus node:timers/promises. Das ist die Promise-Version von setTimeout und kann über das Signal abgebrochen werden (AbortError).',
      'withTimeout erzeugt mit AbortSignal.timeout(ms) ein Signal und reicht es an die Arbeit weiter. Läuft das Limit ab, wird der Fehler in eine verständliche Meldung mit cause umgeschrieben. Die Arbeit muss das Signal verwenden, sonst läuft sie weiter.',
      'retry ruft fn bis zu retries-mal erneut auf, mit Wartezeiten base, 2*base, 4*base. shouldRetry erlaubt, nicht wiederholbare Fehler (zum Beispiel falsche Eingabe) sofort weiterzugeben. Wiederholt werden darf nur, was gefahrlos mehrfach ausgeführt werden kann.',
      'mapLimit führt Aufgaben mit höchstens limit gleichzeitigen Aufrufen aus. Die Worker ziehen sich den nächsten Index aus einem gemeinsamen Zähler; weil JavaScript nur einen Thread hat, kann dabei nichts schiefgehen. Das Ergebnis behält die Reihenfolge der Eingabe.',
      'summarize nutzt Promise.allSettled: Es wartet auf alle Ergebnisse und liefert Erfolge und Gründe, statt beim ersten Fehler abzubrechen wie Promise.all.',
      'unhandled.js erzeugt absichtlich ein abgelehntes Promise ohne catch. Ohne Handler endet der Prozess mit Exit-Code 1 und gibt den Fehler samt Stack aus.',
      'Mit process.on("unhandledRejection", …) lässt sich die Ablehnung abfangen. Das ist nur zum Protokollieren und kontrollierten Beenden gedacht, nicht als Dauerlösung, um Fehler zu verstecken.',
      'In Tests werden die Wartezeiten klein gehalten (base: 1); das Verhalten bleibt dasselbe, der Test aber schnell.',
    ],
    background: `Warum nicht einfach Promise.all über alle Aufgaben? Weil Promise.all alle Aufgaben sofort startet. Bei 10 000 Dateien oder Netzwerkaufrufen entstehen zehntausend gleichzeitige Operationen, die Speicher, Dateikennungen oder die Geduld des Zielservers erschöpfen. Eine Begrenzung hält den Durchsatz hoch und die Last tragbar. Der Wert hängt vom Ziel ab; für externe Dienste sind kleine Werte üblich.

Wiederholungen sind riskant, wenn sie viele Clients gleichzeitig tun: Fällt ein Dienst aus und alle versuchen es nach genau einer Sekunde wieder, entsteht eine Lastspitze. Üblich ist deshalb zusätzlich ein zufälliger Anteil (Jitter). Das Lab lässt ihn weg, damit die Tests deterministisch bleiben; in echten Systemen gehört er dazu.

Abbruch ist kooperativ: Ein Signal stoppt nichts von allein, es meldet nur „bitte aufhören“. Funktionen müssen darauf reagieren. Deshalb prüft withTimeout am Ende, ob das Signal ausgelöst hat, statt sich auf die Fehlerart zu verlassen.`,
    terms: [
      { term: 'Promise', text: 'Ein Objekt für ein Ergebnis oder einen Fehler, der später eintritt.' },
      { term: 'AbortSignal', text: 'Ein Signal, mit dem man laufende Operationen zum Abbrechen auffordert.' },
      { term: 'Backoff', text: 'Wachsende Wartezeit zwischen Wiederholungen.' },
      { term: 'allSettled', text: 'Wartet auf alle Promises und liefert Erfolg oder Fehler je Eintrag.' },
      { term: 'unhandled rejection', text: 'Abgelehntes Promise ohne Fehlerbehandlung; beendet den Prozess.' },
    ],
    code: { file: lab + 'src/async/tasks.js', lang: 'JavaScript' },
    code2: { file: lab + 'src/async/unhandled.js', lang: 'JavaScript' },
    order: ['body', 'code', 'code2', 'body2'],
    output: `mapLimit([1..6], limit 2, Quadrat mit 10 ms Wartezeit)
 Ergebnis: [ 1, 4, 9, 16, 25, 36 ]  höchste gleichzeitige Aufrufe: 2
retry (Fehler bei Versuch 1 und 2, danach Erfolg): ok nach 3 Versuchen

$ node src/async/unhandled.js
Error: vergessen
    at file:///.../unhandled.js:4:16 ...
Node.js v22.23.3                              (Exit-Code 1)
$ node src/async/unhandled.js handled
behandelt: vergessen
weiter                                          (Exit-Code 0)`,
    mistakes: [
      { wrong: 'In einer forEach-Schleife await benutzen.', why: 'forEach wartet nicht auf die Promises; die Schleife ist „fertig“, bevor die Arbeit es ist.', fix: 'for-of mit await (nacheinander) oder mapLimit/Promise.all (parallel).' },
      { wrong: 'Alle Aufgaben mit Promise.all gleichzeitig starten, auch bei tausenden Einträgen.', why: 'Das überlastet Speicher, Dateikennungen oder den Zielserver.', fix: 'Parallelität begrenzen (mapLimit).' },
      { wrong: 'Ein Zeitlimit mit Promise.race([arbeit, timeout]) bauen und die Arbeit weiterlaufen lassen.', why: 'Die Arbeit läuft im Hintergrund weiter, belegt Ressourcen und kann später doch noch Seiteneffekte auslösen.', fix: 'Ein AbortSignal an die Arbeit weiterreichen, damit sie wirklich stoppt.' },
      { wrong: 'Jede Operation wiederholen, auch Zahlungen oder Anlegen von Datensätzen.', why: 'Wiederholt man etwas, das schon gelungen war, entsteht es doppelt.', fix: 'Nur sichere (idempotente) Operationen wiederholen oder dem Ziel eine eindeutige Kennung mitgeben.' },
    ],
    practice: 'Setze für jeden Aufruf nach außen ein Zeitlimit, wiederhole nur sichere Operationen mit wachsender Pause und begrenze die Parallelität. Teste die Bausteine mit sehr kurzen Zeiten (Millisekunden) oder gesteuerter Zeit (Lektion „Testen“).',
    exercises: [
      { task: 'Schreibe einen Test, der withTimeout(work, 20) mit einer Arbeit aufruft, die 200 ms wartet und das Signal an delay weitergibt. Prüfe Fehlermeldung und cause.', acceptance: 'Die Meldung enthält „Zeitlimit von 20 ms“, cause ist ein AbortError (Code ABORT_ERR), und der Test dauert deutlich unter 200 ms.' },
      { task: 'Grenzfall: Was macht mapLimit([], 3, fn) und mapLimit([1], 5, fn)? Was passiert bei limit 0?', acceptance: 'Leere Liste ergibt []; ein Eintrag startet nur einen Worker; limit 0 löst RangeError aus.' },
      { task: 'Fehlerfall: Ergänze retry in einem Test so, dass shouldRetry bei einem TypeError false liefert. Wie viele Versuche finden statt, und welcher Fehler kommt an?', acceptance: 'Genau ein Versuch; der TypeError wird unverändert weitergegeben.' },
    ],
    quiz: [
      { q: 'Warum ist Promise.race([arbeit, zeitlimit]) kein vollwertiges Zeitlimit?',
        options: ['Es wirft nie Fehler.', 'Die Arbeit läuft nach dem Limit weiter, weil sie nichts vom Abbruch erfährt.', 'Es funktioniert nur im Browser.', 'Es blockiert den Event Loop.'],
        correct: 1,
        rationales: ['Fehler werden weitergegeben.', 'Race liefert nur das schnellere Ergebnis; die andere Aufgabe wird nicht gestoppt.', 'Es existiert in Node.js.', 'Es blockiert nichts.'],
        explain: 'Zum Stoppen braucht die Arbeit ein AbortSignal, auf das sie reagiert.' },
      { q: 'Was geschieht, wenn ein abgelehntes Promise in Node.js (ab Version 15) von niemandem abgefangen wird?',
        options: ['Nichts, der Fehler wird still verworfen.', 'Der Prozess wird mit einem Fehler und Exit-Code 1 beendet.', 'Das Promise wird automatisch erneut ausgeführt.', 'Node wartet, bis ein Handler hinzugefügt wird.'],
        correct: 1,
        rationales: ['So war es früher mit einer Warnung; heute ist es der Abbruch.', 'Das zeigt unhandled.js ohne Argument mit Exit-Code 1.', 'Es gibt keine automatische Wiederholung.', 'Node wartet nicht endlos.'],
        explain: 'Ein Programm in unbekanntem Zustand soll nicht weiterlaufen; deshalb Exit-Code 1.' },
      { q: 'Wofür nutzt man Promise.allSettled statt Promise.all?',
        options: ['Wenn man auch bei Fehlern einzelner Aufgaben alle Ergebnisse (Erfolge und Gründe) braucht.', 'Wenn die Aufgaben dadurch insgesamt schneller abgeschlossen werden sollen.', 'Wenn die Aufgaben bewusst nacheinander statt gleichzeitig laufen sollen.', 'Wenn es nur eine einzelne Aufgabe gibt, auf die gewartet werden muss.'],
        correct: 0,
        rationales: ['allSettled wartet auf alle und liefert je Eintrag Status und Wert oder Grund.', 'Es ist nicht schneller, sondern wartet auf alle.', 'Beide starten alle Promises sofort.', 'Der Unterschied liegt in der Fehlerbehandlung.'],
        explain: 'Promise.all bricht beim ersten Fehler ab; allSettled sammelt alles ein.' },
    ],
    sources: [
      api('Node.js: Timers Promises API', 'timers.html#timers-promises-api'),
      docs('MDN: AbortSignal', 'https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal', 'Beschreibt AbortSignal.timeout und das Abbruchmodell; Inhalt hier eigenständig zusammengefasst.'),
      api('Node.js: process – Ereignis unhandledRejection', 'process.html#event-unhandledrejection'),
    ],
    verification: 'Lab node-lab: delay, withTimeout, retry (mit gesteuerten Wartezeiten), mapLimit (höchstens zwei gleichzeitig beobachtet), summarize und das Beenden mit Exit-Code 1 wurden mit Node.js 22.23 beobachtet; die Tests laufen auch auf 24.22 grün. Nicht geprüft: Jitter, echtes Netzwerk und Abbruch von fetch gegen einen langsamen Server.',
  },
  {
    id: 'node-m1-l4', title: 'Dateien, Pfade, Buffer, Streams und Fehlerbehandlung', minutes: 50,
    prerequisites: 'Lektion „Asynchrone Programmierung“ (node-m1-l3).',
    objectives: [
      'Dateien asynchron lesen und schreiben und typische Fehlercodes (ENOENT, EACCES) in klare Meldungen übersetzen',
      'Nutzereingaben in Pfaden so verbinden, dass sie ein Verzeichnis nicht verlassen können (Path Traversal)',
      'Eine Datei atomar schreiben und große Dateien als Stream verarbeiten',
      'Den Unterschied zwischen Zeichen und Bytes erklären und Buffer sinnvoll einsetzen',
    ],
    simple: `Dateien liest und schreibst du mit node:fs/promises. Jede Funktion liefert ein Promise. Fehler tragen einen code, etwa ENOENT („Datei nicht gefunden“) oder EACCES („kein Zugriff“). Daran erkennst du die Ursache und kannst dem Menschen am Bildschirm eine klare Meldung zeigen, statt einen Stacktrace.

Pfade setzt du mit node:path zusammen, nie mit Textverkettung. path.join und path.resolve kennen die Eigenheiten des Betriebssystems. Wird ein Pfad aus Nutzereingaben gebaut, musst du sicherstellen, dass er im erlaubten Ordner bleibt: Ein Pfad wie ../secret.txt verlässt ihn sonst (Path Traversal, siehe Kurs Web-Sicherheit).

Große Dateien liest man nicht auf einmal in den Speicher. Ein Stream liefert die Daten in Stücken (Chunks); pipeline verbindet Quelle, Verarbeitungsschritte und Ziel, drosselt die Quelle, wenn das Ziel nicht mitkommt (Backpressure), und räumt bei Fehlern alle beteiligten Streams auf.

Daten auf der Platte und im Netz sind Bytes. Ein Buffer ist eine Folge von Bytes. Wie Text in Bytes übersetzt wird, bestimmt die Kodierung, meist UTF-8. Dabei ist ein Zeichen nicht immer ein Byte: Ein „ö“ braucht zwei, ein Emoji vier.`,
    steps: [
      'readJson liest eine Datei und trennt zwei Fehlerarten: Dateifehler (ENOENT, EACCES) und Inhaltsfehler (kein gültiges JSON). Beide werden mit cause weitergegeben, damit die Ursache nicht verloren geht.',
      'Die Meldungen nennen nur den Dateinamen (path.basename), nicht den vollen Pfad. Volle Pfade verraten dem Aufrufer die Ordnerstruktur und gehören nicht in Fehlermeldungen nach außen.',
      'safeJoin löst root und Nutzerpfad auf und prüft mit path.relative, dass das Ergebnis unterhalb von root liegt. Wer mit ".." heraus will, bekommt einen RangeError.',
      'writeJsonAtomic schreibt zuerst in eine Nebendatei (mit der Prozess-ID im Namen) und benennt sie dann um. Umbenennen ist auf demselben Dateisystem atomar: Leser sehen entweder die alte oder die neue Datei, nie eine halbe.',
      'Die Datei wird mit der Berechtigung 0o600 angelegt: nur der Eigentümer darf lesen und schreiben. Bei Dateien mit Geheimnissen ist das ein sinnvoller Standard.',
      'countLines zählt Zeilen über einen Transform-Stream, ohne die Datei zu laden. Eine letzte Zeile ohne Zeilenumbruch wird extra berücksichtigt.',
      'gzipFile verbindet Lesestrom, Kompression und Schreibstrom mit pipeline. Bei einem Fehler in einem der Streams werden alle geschlossen.',
      'bytes zeigt den Unterschied: Der Text „Größe 😀“ hat 8 Zeichen im JavaScript-Sinn (UTF-16-Einheiten), aber 12 Bytes in UTF-8.',
    ],
    background: `Warum atomar schreiben? Stürzt ein Programm während eines normalen writeFile ab, bleibt eine halb geschriebene Datei zurück, zum Beispiel ein abgeschnittenes JSON. Beim nächsten Start schlägt das Lesen fehl. Schreiben in eine Nebendatei mit anschließendem Umbenennen löst das, weil das Betriebssystem das Umbenennen als einen Schritt ausführt. Für maximale Sicherheit müsste man zusätzlich den Dateipuffer auf die Platte zwingen; das lässt das Lab aus und bleibt bei der Kernidee.

Warum Streams? Eine 2-GB-Protokolldatei per readFile zu laden belegt 2 GB Arbeitsspeicher, und Node kann Strings und Buffer nur bis zu einer Obergrenze anlegen. Ein Stream hält immer nur einen Chunk im Speicher. pipeline aus node:stream/promises ist die richtige Wahl, weil das ältere .pipe() Fehler nicht weitergibt und Streams offen lassen kann.

Warum Path Traversal ernst nehmen? Der Dateiname kommt aus einer Anfrage, und der Server läuft mit den Rechten des Prozesses. Ein Angreifer, der ../../etc/passwd oder die Konfigurationsdatei erreicht, liest Dinge, die nie öffentlich sein sollten. Die Prüfung gehört deshalb an die Stelle, an der der Pfad gebildet wird, nicht in die Oberfläche.`,
    terms: [
      { term: 'ENOENT / EACCES', text: 'Fehlercodes: Datei nicht gefunden / keine Berechtigung.' },
      { term: 'Path Traversal', text: 'Angriff, bei dem Pfadteile wie ../ ein Verzeichnis verlassen.' },
      { term: 'Stream / Backpressure', text: 'Daten in Stücken; die Quelle wird gebremst, wenn das Ziel langsamer ist.' },
      { term: 'Buffer', text: 'Folge von Bytes; Text wird mit einer Kodierung (meist UTF-8) übersetzt.' },
      { term: 'atomar', text: 'Ein Vorgang, der entweder ganz oder gar nicht sichtbar wird.' },
    ],
    code: { file: lab + 'src/files/files.js', lang: 'JavaScript', from: 'Verbindet root', to: 'return target;', back: 1, plus: 2 },
    code2: { file: lab + 'src/files/files.js', lang: 'JavaScript', from: 'Schreibt atomar', to: 'await rename(temp, file);', back: 1, plus: 1 },
    code3: { file: lab + 'src/files/files.js', lang: 'JavaScript', from: 'Komprimiert eine Datei', to: 'export const bytes' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: `safeJoin('/srv/app/public', 'img/logo.png')  -> /srv/app/public/img/logo.png
safeJoin('/srv/app/public', '../secret.txt')  -> RangeError: Pfad verlässt das Verzeichnis: ../secret.txt
bytes('Größe 😀') -> { zeichen: 8, bytes: 12 }

npm test (Dateitests): lesen, Fehlercodes, atomar schreiben, Zeilen zählen, gzip, Buffer
 Ein Test (Rechte ohne Zugriff) wird übersprungen, wenn die Tests als root laufen (z. B. im Container).`,
    mistakes: [
      { wrong: 'Pfade mit Textverkettung bauen: "uploads/" + name.', why: 'Mit name = "../.env" verlässt der Zugriff den Ordner; außerdem unterscheiden sich Trennzeichen je Betriebssystem.', fix: 'path.resolve und eine Prüfung wie safeJoin; zusätzlich Dateinamen auf erlaubte Zeichen beschränken.' },
      { wrong: 'Große Dateien mit readFile komplett laden.', why: 'Der Speicherbedarf wächst mit der Dateigröße; bei sehr großen Dateien bricht der Prozess ab.', fix: 'createReadStream und pipeline verwenden.' },
      { wrong: 'Streams mit .pipe() verbinden und Fehler vergessen.', why: '.pipe() gibt Fehler nicht weiter; bei einem Fehler bleiben Streams offen.', fix: 'pipeline aus node:stream/promises verwenden und den Fehler mit try/catch behandeln.' },
      { wrong: 'text.length als Bytegröße verwenden, zum Beispiel für ein Größenlimit.', why: 'length zählt UTF-16-Einheiten, nicht Bytes; Umlaute und Emojis weichen ab.', fix: 'Buffer.byteLength(text, "utf8") nutzen.' },
    ],
    practice: 'Mache aus jeder Stelle, an der ein Nutzer einen Dateinamen liefert, einen Aufruf von safeJoin (oder besser: eine feste Zuordnung von Kennung zu Datei). Schreibe Konfigurations- und Zustandsdateien immer atomar und mit eingeschränkten Rechten.',
    exercises: [
      { task: 'Schreibe einen Test, der writeJsonAtomic zweimal hintereinander aufruft und danach prüft, dass keine .tmp-Datei zurückbleibt.', acceptance: 'Das Verzeichnis enthält nur die Zieldatei, und readJson liefert den zuletzt geschriebenen Wert.' },
      { task: 'Grenzfall: Prüfe countLines mit leerer Datei, Datei ohne abschließenden Zeilenumbruch und Datei mit nur einem Zeilenumbruch.', acceptance: 'Ergebnisse 0, Anzahl der Zeilen inklusive der letzten und 1; jede Variante hat einen Test.' },
      { task: 'Fehlerfall: Rufe safeJoin mit einem absoluten Pfad ("/etc/passwd") und mit "a/../../b" auf. Was passiert?', acceptance: 'Beide werfen RangeError; du erklärst, warum path.resolve einen absoluten Nutzerpfad nicht an root anhängt und die Prüfung trotzdem greift.' },
    ],
    quiz: [
      { q: 'Wofür ist safeJoin(root, userPath) gedacht?',
        options: ['Es verschlüsselt den Pfad, damit Nutzer ihn nicht lesen können.', 'Es stellt sicher, dass ein aus Nutzereingaben gebildeter Pfad unterhalb von root bleibt.', 'Es legt fehlende Ordner entlang des Pfades automatisch an.', 'Es prüft nur, ob die Datei am Ende des Pfades bereits existiert.'],
        correct: 1,
        rationales: ['Verschlüsselung findet nicht statt.', 'So wird Path Traversal mit ../ oder absoluten Pfaden verhindert.', 'Ordner werden nicht angelegt.', 'Ob die Datei existiert, prüft erst der spätere Zugriff.'],
        explain: 'Die Funktion vergleicht den aufgelösten Pfad mit root und wirft einen Fehler, wenn er ausbricht.' },
      { q: 'Warum schreibt writeJsonAtomic erst in eine Nebendatei und benennt sie danach um?',
        options: ['Damit die Datei schneller geschrieben wird.', 'Damit nach einem Absturz keine halb geschriebene Zieldatei zurückbleibt.', 'Damit die Datei komprimiert wird.', 'Damit mehrere Prozesse gleichzeitig schreiben dürfen.'],
        correct: 1,
        rationales: ['Es sind zwei Schritte; Geschwindigkeit ist nicht der Grund.', 'Das Umbenennen auf demselben Dateisystem ist atomar; Leser sehen alt oder neu, nie halb.', 'Komprimiert wird dabei nichts.', 'Gleichzeitiges Schreiben löst das nicht.'],
        explain: 'Atomares Ersetzen schützt vor beschädigten Dateien bei Abstürzen.' },
      { q: 'Ein Text hat 8 Zeichen, aber Buffer.byteLength liefert 12. Was ist die wahrscheinlichste Ursache?',
        options: ['Der Text enthält Nicht-ASCII-Zeichen, die in UTF-8 mehrere Bytes brauchen.', 'Buffer zählt immer 50 % mehr.', 'Der Text enthält versteckte Zeilenumbrüche.', 'Die Datei ist kaputt.'],
        correct: 0,
        rationales: ['Umlaute belegen zwei, Emojis vier Bytes in UTF-8.', 'Einen solchen Faktor gibt es nicht.', 'Zeilenumbrüche erscheinen als Zeichen und würden mitgezählt.', 'Es handelt sich um eine normale Eigenschaft der Kodierung.'],
        explain: 'Zeichen und Bytes sind verschiedene Einheiten; für Größenlimits zählen die Bytes.' },
    ],
    sources: [
      api('Node.js: File system', 'fs.html'),
      api('Node.js: Stream (pipeline und Backpressure)', 'stream.html'),
      api('Node.js: Path und Buffer', 'path.html', 'Pfadfunktionen; ergänzend die Buffer-Dokumentation unter /api/buffer.html.'),
      docs('OWASP: Path Traversal', 'https://owasp.org/www-community/attacks/Path_Traversal', 'Beschreibung des Angriffs; Inhalt hier eigenständig zusammengefasst.'),
    ],
    verification: 'Lab node-lab: Lesen mit Fehlercodes, safeJoin, atomares Schreiben, Zeilenzählen per Stream, gzip und Buffer-Größen wurden mit Node.js 22.23 und 24.22 beobachtet. Der Rechte-Test (EACCES) wird übersprungen, wenn der Prozess als root läuft. Nicht geprüft: Verhalten unter Windows, Netzwerk-Dateisysteme und Dateipuffer-Sicherung (fsync).',
  },
];
