// Python · Grundlagen, Datenstrukturen, Dateien, Fehler, Klassen und ein getestetes Projekt. Stichtag 15.11.2026.
// Eigene Texte; Code, Demo-Skripte und Tests liegen unter content/examples/python-lab/ (nur Standardbibliothek).
// Die Ausgaben der Lektionen stammen aus echten Läufen mit dem lokalen Python (hier 3.14.6); die Tests liefen zusätzlich mit 3.12 und 3.13.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const lab = 'content/examples/python-lab/';
const env = { ...process.env, PYTHONDONTWRITEBYTECODE: '1', PYTHONUTF8: '1' };

function python(args) {
  const result = spawnSync('python3', args, { cwd: lab, encoding: 'utf8', env });
  if (result.error) throw result.error;
  return result;
}

const pythonVersion = python(['--version']).stdout.trim().replace('Python ', '');
const unittestCount = Number(/Ran (\d+) tests?/.exec(python(['-m', 'unittest']).stderr)?.[1]);
if (!unittestCount) throw new Error('Die Python-Tests des Labs laufen nicht durch.');

function demo(name) {
  const file = fs.readdirSync(`${lab}demos`).find((entry) => entry.startsWith(name));
  const result = python([`demos/${file}`]);
  if (result.status !== 0 || result.stderr) throw new Error(`Demo ${file} fehlgeschlagen:\n${result.stderr}`);
  return `Python ${pythonVersion}; Befehl: cd ${lab} && python3 demos/${file}\n${result.stdout.trimEnd()}`;
}

function runExpenses(file, expectedExit) {
  const result = python(['-m', 'expenses', `data/${file}`]);
  if (result.status !== expectedExit) throw new Error(`expenses ${file}: Exit-Code ${result.status} statt ${expectedExit}`);
  const parts = [`$ python3 -m expenses data/${file}   (Exit-Code ${result.status})`, result.stdout.trimEnd()];
  if (result.stderr) parts.push(`--- stderr ---\n${result.stderr.trimEnd()}`);
  return parts.join('\n');
}

function cliOutput() {
  const verbose = python(['-m', 'unittest', '-v', 'tests.test_cli']);
  if (verbose.status !== 0) throw new Error(`tests.test_cli schlägt fehl:\n${verbose.stderr}`);
  const kept = verbose.stderr.split('\n').filter((line) => / \.\.\. ok$/.test(line) || /^(Ran |OK)/.test(line)).map((line) => line.replace(/ in \d[\d.]*s$/, ''));
  return `Python ${pythonVersion}; Befehle: cd ${lab} && python3 -m expenses data/<Datei> und python3 -m unittest -v tests.test_cli\n${runExpenses('ausgaben.csv', 0)}\n\n${runExpenses('fehlerhaft.csv', 1)}\n\n${kept.join('\n')}`;
}

const docs = (title, url) => ({ title: `Python-Dokumentation: ${title}`, url, note: 'Offizielle Dokumentation; Inhalt hier eigenständig zusammengefasst.' });

export const module = {
  id: 'py-m1', course: 'python', part: 34, partTitle: 'Python',
  title: 'Python · Grundlagen, Datenstrukturen, Dateien, Fehler, Klassen und ein getestetes Projekt',
};

const prerequisites = 'Grundkenntnisse in der Kommandozeile (Modul „Linux & Shell“) und eine installierte Python-Version (python3 --version). Programmiererfahrung in einer anderen Sprache hilft, ist aber nicht nötig.';
const verification = (what, notTested) => `Geprüft wurde mit dem Python-Lab (Python ${pythonVersion} auf macOS; die ${unittestCount} Tests liefen zusätzlich mit 3.12.15 und 3.13.16): ${what} Jede Ausgabe stammt aus einem echten Lauf. Nicht geprüft: ${notTested} Am 15.11.2026 ist laut python.org Python 3.15 die aktuelle Version; sie war lokal nicht installiert.`;

export const lessons = [
  {
    id: 'py-m1-l1', title: 'Grundlagen: Werte, Zahlen, Texte und die Falle der Standardwerte', minutes: 35,
    prerequisites,
    objectives: [
      'Typen und Wahrheitswerte von Python-Werten einschätzen (None, 0, leere Texte und Listen)',
      'Erklären, warum float für Geldbeträge ungeeignet ist und wann Decimal die richtige Wahl ist',
      'Den Unterschied zwischen == (gleicher Inhalt) und is (dasselbe Objekt) nennen',
      'Die Falle mit veränderlichen Standardwerten in Funktionen erkennen und vermeiden',
    ],
    simple: `In Python hat jeder Wert einen Typ (int, float, str, bool, list, dict, None …), aber Namen sind nicht an einen Typ gebunden: Ein Name zeigt auf ein Objekt, und derselbe Name kann später auf ein anderes zeigen. Einrückung gehört zur Syntax: Sie bestimmt, welche Zeilen zu einem Block gehören.

Drei Dinge überraschen Einsteiger regelmäßig. Erstens: Kommazahlen (float) werden binär gespeichert, deshalb ist 0.1 + 0.2 nicht genau 0.3. Für Geld und alles, was auf den Cent stimmen muss, nimmst du Decimal. Zweitens: Ein Text (str) besteht aus Unicode-Zeichen, nicht aus Bytes; „Käse“ hat vier Zeichen, aber in UTF-8 fünf Bytes. Drittens: Der Standardwert einer Funktion wird einmal beim Definieren erzeugt. Steht dort eine Liste, teilen sich alle Aufrufe dieselbe Liste.

Außerdem zählt die „Wahrheit“ von Werten: Leere Dinge (0, "", [], None) gelten als falsch, alles andere als wahr. Der Text "0" ist wahr, weil er nicht leer ist.`,
    steps: [
      'Wechsle in content/examples/python-lab und starte „python3 demos/01_grundlagen.py“. Das Skript braucht nur Python, keine Installation.',
      'Lies die ersten beiden Ausgabezeilen: Mit Standardwert [] enthalten beide Aufrufe [„a“, „b“], weil sie dieselbe Liste teilen. Mit None und einer Liste, die in der Funktion neu angelegt wird, bekommt jeder Aufruf seine eigene.',
      'Öffne demos/01_grundlagen.py und suche collect_bad und collect_ok. Das Muster „bag=None, dann in der Funktion anlegen“ gehört zu jeder Funktion, die eine Liste, ein Wörterbuch oder eine Menge als Standard bräuchte.',
      'Vergleiche 0.1 + 0.2 mit der Decimal-Version. Merke: Decimal wird aus Text gebildet (Decimal("0.1")), nicht aus einer Kommazahl; Decimal(0.1) übernimmt den bereits ungenauen float-Wert.',
      'Schau dir parse_amount in expenses/model.py an: Der Betrag wird als Decimal gelesen, nicht als float, und höchstens zwei Nachkommastellen werden akzeptiert.',
      'Beachte round(2.5) = 2 und round(3.5) = 4: Python rundet bei genau halben Werten zur geraden Zahl. Für kaufmännisches Runden gibt es bei Decimal die Methode quantize mit einem Rundungsmodus.',
      'Beachte -7 // 2 = -4 und -7 % 3 = 2: Die Ganzzahldivision rundet zur kleineren Zahl, und der Rest hat das Vorzeichen des Teilers.',
    ],
    background: `Warum ist das Verhalten bei Standardwerten so? Funktionen sind Objekte, und ihre Standardwerte werden ausgewertet, wenn die Funktion definiert wird, nicht bei jedem Aufruf. Bei unveränderlichen Werten (Zahlen, Texte, None) fällt das nie auf; bei veränderlichen (Listen, Wörterbücher) sammelt sich Zustand über Aufrufe hinweg. Das ist kein Fehler der Sprache, sondern eine bekannte Eigenheit, die die offizielle Dokumentation ausdrücklich beschreibt.

Was gilt für == und is? == fragt, ob zwei Werte gleich sind; is fragt, ob es dasselbe Objekt ist. Für Vergleiche von Inhalten nimmst du ==. is gehört fast nur zu None (x is None).

Zum Stand: Das Lab wurde mit Python 3.12, 3.13 und 3.14 geprüft; die Ausgaben der Lektionen stammen aus 3.14.6. Laut python.org war am 15.11.2026 Python 3.15 die aktuelle Version, die hier nicht lief. Sprachkern und die genutzten Teile der Standardbibliothek sind stabil; Fehlermeldungen und Standardverhalten (zum Beispiel die Kodierung bei open, Lektion 3) können sich zwischen Versionen unterscheiden. Prüfe bei Zweifeln die Dokumentation deiner Version.`,
    terms: [
      { term: 'Objekt', text: 'Alles in Python ist ein Objekt mit Typ und Wert; Namen verweisen auf Objekte.' },
      { term: 'veränderlich (mutable)', text: 'Ein Objekt, das sich nach dem Anlegen ändern lässt, zum Beispiel Liste, Wörterbuch, Menge.' },
      { term: 'Decimal', text: 'Dezimalzahl mit exakter Dezimaldarstellung; geeignet für Geldbeträge.' },
      { term: 'None', text: 'Der Wert „nichts“; wird mit is verglichen und gilt als falsch.' },
    ],
    code: { file: lab + 'demos/01_grundlagen.py', lang: 'Python', from: 'def collect_bad', to: 'print("Standardwert None:"' },
    code2: { file: lab + 'expenses/model.py', lang: 'Python', from: 'def parse_amount', to: 'return value' },
    code3: { file: lab + 'demos/01_grundlagen.py', lang: 'Python', from: 'print("0.1 + 0.2', to: 'print("len(' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: demo('01'),
    mistakes: [
      { wrong: 'Eine Liste oder ein Wörterbuch als Standardwert eines Parameters zu schreiben (bag=[]).', why: 'Der Standardwert entsteht einmal; alle Aufrufe teilen ihn und sammeln Daten.', fix: 'bag=None verwenden und in der Funktion eine neue Liste anlegen.' },
      { wrong: 'Geldbeträge als float zu rechnen.', why: 'Kommazahlen sind binär gespeichert; Summen weichen um Bruchteile ab und Vergleiche schlagen fehl.', fix: 'Decimal aus Text bilden, oder in ganzen Cent rechnen.' },
      { wrong: 'Decimal(0.1) statt Decimal("0.1") zu schreiben.', why: 'Der float-Wert ist schon ungenau und wird mit allen Nachkommastellen übernommen.', fix: 'Betrag als Text übergeben.' },
      { wrong: 'Zwei Werte mit is statt == zu vergleichen.', why: 'is prüft die Objektidentität; gleiche Inhalte können zwei Objekte sein.', fix: '== für Inhalte, is nur für None.' },
    ],
    practice: 'Schreibe eine Funktion add_tag(tag, tags=None), die eine Liste zurückgibt. Rufe sie dreimal ohne zweites Argument auf und zeige, dass die Ergebnisse unabhängig sind. Schreibe zum Vergleich die fehlerhafte Fassung mit [] und notiere die Ausgabe.',
    exercises: [
      { task: 'Berechne in der Python-Konsole die Summe von zehnmal 0.1 als float und als Decimal.', acceptance: 'Du zeigst, dass die float-Summe nicht genau 1.0 ist, die Decimal-Summe aber schon, und erklärst, warum.' },
      { task: 'Grenzfall: Prüfe bool-Werte von "", "0", [], [0], None und 0.0.', acceptance: 'Du sagst für jeden Wert das Ergebnis vorher an und bestätigst es; du erklärst, warum "0" wahr ist.' },
      { task: 'Fehlerfall: Schreibe eine Funktion mit dem Standardwert {} und rufe sie zweimal auf.', acceptance: 'Du beobachtest geteilten Zustand und behebst ihn mit None.' },
    ],
    quiz: [
      { q: 'Warum ergibt 0.1 + 0.2 in Python nicht genau 0.3?',
        options: ['Kommazahlen werden binär gespeichert und sind nicht immer exakt.', 'Python rechnet bewusst ungenau.', 'Die Rechnung ist ein bekannter Fehler im Interpreter.', 'Die Zahlen werden vor dem Addieren gerundet.'],
        correct: 0,
        rationales: ['Der Wert 0.1 hat im Binärsystem keine endliche Darstellung.', 'Das Verhalten liegt an der Zahlendarstellung, nicht an einer Absicht.', 'Es ist das übliche Verhalten von float in fast allen Sprachen.', 'Es wird nicht gerundet; die Abweichung entsteht beim Speichern.'],
        explain: 'Für exakte Dezimalrechnung, etwa mit Geld, verwendest du Decimal, das aus Text gebildet wird.' },
      { q: 'Was passiert bei def f(x, bag=[]) und mehreren Aufrufen ohne zweites Argument?',
        options: ['Jeder Aufruf erhält eine frische leere Liste.', 'Alle Aufrufe teilen dieselbe Liste.', 'Python meldet einen Syntaxfehler.', 'Die Liste wird nach jedem Aufruf geleert.'],
        correct: 1,
        rationales: ['Das wäre bei None und Anlegen in der Funktion der Fall.', 'Der Standardwert wird einmal beim Definieren erzeugt.', 'Die Schreibweise ist erlaubt, nur riskant.', 'Es gibt kein automatisches Leeren.'],
        explain: 'Verwende None als Standardwert und lege die Liste in der Funktion an.' },
      { q: 'Welcher Ausdruck prüft, ob zwei Listen denselben Inhalt haben?',
        options: ['a is b', 'a in b', 'a == b', 'a != None'],
        correct: 2,
        rationales: ['is prüft, ob es dasselbe Objekt ist.', 'in prüft, ob ein Element enthalten ist.', '== vergleicht die Inhalte.', 'Das prüft nur, ob a nicht None ist.'],
        explain: 'Zwei Listen mit gleichem Inhalt sind gleich (==), aber nicht unbedingt dasselbe Objekt (is).' },
    ],
    sources: [
      docs('Funktionen und Standardwerte (Tutorial)', 'https://docs.python.org/3/tutorial/controlflow.html'),
      docs('Decimal', 'https://docs.python.org/3/library/decimal.html'),
      docs('Eingebaute Typen', 'https://docs.python.org/3/library/stdtypes.html'),
      docs('Programmier-FAQ', 'https://docs.python.org/3/faq/programming.html'),
    ],
    verification: verification('Standardwert-Falle, float gegen Decimal, Rundung, Ganzzahldivision, Wahrheitswerte und Unicode-Länge in einem Demo-Skript, das ohne Warnungen läuft.', 'andere Python-Implementierungen, Windows und Linux sowie das Verhalten bei Zahlen außerhalb des Beispielbereichs.'),
  },
  {
    id: 'py-m1-l2', title: 'Datenstrukturen: Listen, Wörterbücher, Mengen, Comprehensions und Kopien', minutes: 35,
    prerequisites,
    objectives: [
      'Liste, Tupel, Wörterbuch und Menge nach Aufgabe auswählen',
      'Mit sorted und key sowie mit Comprehensions Daten ordnen und umformen',
      'Einen Generator von einer Liste unterscheiden und seine einmalige Nutzbarkeit erklären',
      'Flache und tiefe Kopien unterscheiden und die Falle [[0]*2]*2 erkennen',
    ],
    simple: `Listen speichern Werte in Reihenfolge und lassen sich ändern. Tupel sind unveränderliche Listen. Wörterbücher (dict) ordnen Schlüsseln Werte zu und behalten die Einfügereihenfolge. Mengen (set) speichern jedes Element nur einmal und beantworten Fragen wie „ist das enthalten?“ schnell; sie bieten Schnitt, Vereinigung und Differenz.

Mit sorted bringst du Daten in Reihenfolge; der Parameter key sagt, wonach. Eine Comprehension baut eine Liste, ein Wörterbuch oder eine Menge in einer Zeile aus einer Schleife und einer optionalen Bedingung. Ein Generatorausdruck sieht ähnlich aus (runde Klammern), berechnet aber erst beim Durchlaufen und kann nur einmal verbraucht werden.

Beim Kopieren gilt: list.copy(), dict.copy() und Slicing erzeugen flache Kopien. Die Elemente selbst werden nicht kopiert; enthalten sie veränderliche Objekte, sehen beide Kopien dieselben. copy.deepcopy kopiert rekursiv.`,
    steps: [
      'Starte „python3 demos/02_datenstrukturen.py“ im Lab-Ordner und lies die Ausgabe Zeile für Zeile neben dem Code.',
      'Counter zählt Elemente und liefert mit most_common die häufigsten zuerst. In expenses/report.py zeigt defaultdict(Decimal) dasselbe Muster für Summen: Ein fehlender Schlüssel beginnt bei Decimal(), also 0.',
      'Sortiere nach mehreren Kriterien mit einem Tupel als key: key=lambda item: (-item[1], item[0]) sortiert nach Summe absteigend und bei Gleichstand nach Name. Dadurch bleibt die Ausgabe stabil.',
      'Übe die Comprehension mit Bedingung: {name: preis * 1.19 for name, preis in prices.items() if preis > 1}. Lies sie als „für jedes Paar, falls …, bilde …“.',
      'Beobachte den Generator: Der erste sum liefert 30, der zweite 0, weil der Generator verbraucht ist. Wer ihn mehrmals braucht, macht eine Liste daraus.',
      'Beobachte das Gitter: [[0]*2]*2 enthält zweimal dieselbe Zeilenliste, daher ändert sich beim Setzen einer Zelle beide Zeilen. Die Comprehension mit for _ in range(2) legt zwei Listen an.',
      'Beachte die flache Kopie des Wörterbuchs: Die innere Liste ist dieselbe; deepcopy macht sie unabhängig.',
    ],
    background: `Wann welche Struktur? Brauchst du Reihenfolge und Duplikate, nimm eine Liste. Brauchst du Nachschlagen nach einem Schlüssel, ein Wörterbuch. Brauchst du nur „enthalten oder nicht“ oder Duplikate entfernen, eine Menge. Ein Tupel ist die Wahl für kleine feste Gruppen, etwa (x, y) oder einen Schlüssel aus zwei Teilen. Elemente einer Menge und Schlüssel eines Wörterbuchs müssen hashbar sein, also unveränderlich: Listen sind es nicht, Tupel mit unveränderlichem Inhalt schon.

Was sagt die Reihenfolge von Mengen? Nichts: Eine Menge hat keine garantierte Reihenfolge. Das Lab sortiert deshalb vor der Ausgabe. Wörterbücher dagegen behalten die Einfügereihenfolge; das ist seit Python 3.7 Teil der Sprache.

Wann ist eine Comprehension zu viel? Wenn sie mehrere verschachtelte Schleifen oder Bedingungen hat und nicht mehr in einem Atemzug lesbar ist. Dann ist eine normale Schleife klarer. Lesbarkeit geht vor Kürze.`,
    terms: [
      { term: 'hashbar', text: 'Ein unveränderliches Objekt mit festem Hashwert; nur solche Objekte dürfen Mengenelemente oder Wörterbuchschlüssel sein.' },
      { term: 'Comprehension', text: 'Kurzform, die aus einer Schleife eine Liste, ein Wörterbuch oder eine Menge baut.' },
      { term: 'Generator', text: 'Liefert Werte erst beim Durchlaufen und kann nur einmal verbraucht werden.' },
      { term: 'flache Kopie', text: 'Kopiert nur die äußere Struktur; die Elemente sind dieselben Objekte.' },
    ],
    code: { file: lab + 'demos/02_datenstrukturen.py', lang: 'Python', from: 'words =', to: 'print("Comprehension' },
    code2: { file: lab + 'expenses/report.py', lang: 'Python', from: 'def totals_by_category', to: 'return dict(sorted' },
    code3: { file: lab + 'demos/02_datenstrukturen.py', lang: 'Python', from: 'grid_bad', to: 'print("flache Kopie' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: demo('02'),
    mistakes: [
      { wrong: 'Ein Gitter mit [[0]*n]*m anzulegen.', why: 'Alle Zeilen sind dasselbe Objekt; eine Änderung wirkt auf jede.', fix: '[[0]*n for _ in range(m)] verwenden.' },
      { wrong: 'Einen Generator mehrfach zu durchlaufen.', why: 'Nach dem ersten Durchlauf ist er leer; weitere Auswertungen liefern nichts, ohne Fehlermeldung.', fix: 'Das Ergebnis mit list(...) speichern, wenn es mehrfach gebraucht wird.' },
      { wrong: 'Sich auf die Reihenfolge einer Menge zu verlassen.', why: 'Mengen garantieren keine Reihenfolge; die Ausgabe kann sich ändern.', fix: 'Vor der Ausgabe sortieren (sorted(menge)).' },
      { wrong: 'Eine verschachtelte Struktur mit copy() zu duplizieren und dann innen zu ändern.', why: 'Die inneren Objekte sind geteilt, die „Kopie“ ändert sich mit.', fix: 'copy.deepcopy verwenden oder die inneren Objekte neu aufbauen.' },
    ],
    practice: 'Lies eine Wortliste (zum Beispiel aus einem eigenen Text), zähle mit Counter und gib die zehn häufigsten Wörter sortiert aus; bei gleicher Anzahl alphabetisch. Notiere, welche Struktur du an welcher Stelle gewählt hast.',
    exercises: [
      { task: 'Entferne mit einer Menge Duplikate aus einer Liste von Kategorien und gib sie sortiert aus.', acceptance: 'Das Ergebnis enthält jede Kategorie einmal in alphabetischer Reihenfolge; du erklärst, warum erst sortiert werden muss.' },
      { task: 'Grenzfall: Versuche, eine Liste als Wörterbuchschlüssel zu verwenden, danach ein Tupel.', acceptance: 'Die Liste löst einen TypeError aus, das Tupel funktioniert; du erklärst den Begriff hashbar.' },
      { task: 'Fehlerfall: Lege mit [[0]*3]*3 ein Gitter an, setze ein Feld und beobachte das Ergebnis.', acceptance: 'Du erklärst die geteilten Zeilen und behebst sie mit einer Comprehension.' },
    ],
    quiz: [
      { q: 'Wie sortierst du ein Wörterbuch nach seinen Werten, größte zuerst?',
        options: ['sorted(d.items(), key=lambda item: item[1], reverse=True)', 'sorted(d).reverse()', 'd.sort(reverse=True)', 'set(d.values())'],
        correct: 0,
        rationales: ['key bestimmt das Kriterium, reverse kehrt die Reihenfolge um.', 'sorted(d) sortiert nur die Schlüssel und gibt eine Liste zurück.', 'Wörterbücher haben keine Methode sort.', 'Das erzeugt eine ungeordnete Menge.'],
        explain: 'sorted liefert eine neue Liste und bekommt über key das Sortierkriterium.' },
      { q: 'Was liefert der zweite sum(squares), wenn squares ein Generatorausdruck ist?',
        options: ['Dieselbe Summe wie beim ersten Mal.', 'Einen Fehler.', 'Die doppelte Summe.', '0, weil der Generator verbraucht ist.'],
        correct: 3,
        rationales: ['Der Generator liefert seine Werte nur einmal.', 'Python meldet hier keinen Fehler.', 'Es wird nichts verdoppelt.', 'Ein verbrauchter Generator liefert keine Werte mehr.'],
        explain: 'Wer die Werte mehrfach braucht, macht eine Liste daraus.' },
      { q: 'Warum ändert sich bei [[0]*2]*2 eine Zelle in beiden Zeilen?',
        options: ['Python kopiert die Zeilen fehlerhaft.', 'Beide Zeilen sind dasselbe Listenobjekt.', 'Die Multiplikation erzeugt Tupel.', 'Das Gitter ist nicht schreibbar.'],
        correct: 1,
        rationales: ['Es wird nichts kopiert.', 'Die Multiplikation wiederholt die Referenz, nicht das Objekt.', 'Es entstehen Listen, keine Tupel.', 'Das Gitter lässt sich beschreiben, nur mit geteilter Wirkung.'],
        explain: 'Lege jede Zeile mit einer Comprehension einzeln an.' },
    ],
    sources: [
      docs('Datenstrukturen (Tutorial)', 'https://docs.python.org/3/tutorial/datastructures.html'),
      docs('collections (Counter, defaultdict)', 'https://docs.python.org/3/library/collections.html'),
      docs('copy (flache und tiefe Kopien)', 'https://docs.python.org/3/library/copy.html'),
    ],
    verification: verification('Zählen, Sortieren mit key, Comprehensions, Mengenoperationen, Generator-Verbrauch und die Kopierfallen mit Ausgaben aus dem Demo-Skript sowie die Summierung je Kategorie im Projekt.', 'Leistungsmessungen großer Datenmengen und andere Sammlungstypen wie deque oder heapq.'),
  },
  {
    id: 'py-m1-l3', title: 'Dateien, Kodierung, CSV und JSON: sauber mit Umlauten', minutes: 35,
    prerequisites,
    objectives: [
      'Pfade mit pathlib bilden und zerlegen',
      'Dateien mit with und ausdrücklicher Kodierung lesen und schreiben',
      'CSV mit Semikolon, Anführungszeichen und Umlauten korrekt verarbeiten',
      'Falsche Kodierung als Fehler erkennen und JSON mit und ohne ensure_ascii ausgeben',
    ],
    simple: `Mit pathlib.Path baust du Pfade betriebssystemunabhängig: Path("daten") / "a.csv". Du bekommst Name, Endung und Elternordner als Eigenschaften und kannst Dateien mit read_text, write_text und open lesen und schreiben.

Der wichtigste Punkt beim Lesen von Text ist die Kodierung. Eine Datei besteht aus Bytes; wie sie zu Zeichen werden, sagt die Kodierung. UTF-8 kann alle Zeichen darstellen, ein Umlaut belegt zwei Bytes. Liest du Latin-1-Bytes als UTF-8, gibt es meist einen Fehler; liest du UTF-8-Bytes als Latin-1, gibt es keinen Fehler, aber Müll wie „KÃ¤se“. Gib deshalb immer encoding="utf-8" an.

Das Modul csv zerlegt Zeilen; es versteht Trennzeichen (bei uns das Semikolon), Anführungszeichen und Trennzeichen im Feld. Öffne die Datei mit newline="". Das Modul json wandelt Wörterbücher und Listen in Text und zurück.`,
    steps: [
      'Starte „python3 demos/03_dateien.py“. Es schreibt in einen temporären Ordner, der am Ende gelöscht wird.',
      'Beobachte die Pfadteile: name, stem, suffix und parent.name. PurePosixPath wird verwendet, damit die Ausgabe auf jedem System gleich ist; im Alltag nimmst du Path.',
      'Lies die CSV-Zeile mit dem Anführungszeichen und dem Semikolon im Feld: csv.reader trennt trotzdem richtig, weil das Feld in Anführungszeichen steht.',
      'Beobachte die Kodierungsfälle: „ä“ belegt in UTF-8 zwei Bytes. Mit ascii-Lesen kommt ein UnicodeDecodeError. Mit Latin-1 gelesenes UTF-8 liefert still „Ã¤“ statt „ä“.',
      'Öffne expenses/reader.py: Die Datei wird mit encoding="utf-8-sig" geöffnet. Das liest UTF-8 mit und ohne Byte-Order-Mark, wie ihn Excel oft schreibt. newline="" gehört zu csv.',
      'Vergleiche json.dumps ohne und mit ensure_ascii=False: Standardmäßig steht „ü“ als \\u00fc im Text; mit False bleibt es lesbar. Beide Schreibweisen sind gültiges JSON und werden gleich zurückgelesen.',
      'Beachte das Verhalten bei ungültigem JSON: json.loads löst JSONDecodeError mit Zeile und Spalte aus; fange ihn dort ab, wo du Eingaben liest.',
    ],
    background: `Warum nicht einfach den Standard nehmen? Ohne encoding hängt das Ergebnis vom Computer ab. Bis Python 3.14 richtet sich open bei ausgeschaltetem UTF-8-Modus nach der Spracheinstellung des Systems; ein Skript, das auf dem Mac läuft, kann unter Windows Umlaute zerstören. Laut Dokumentation ist UTF-8 ab Python 3.15 der Standard (PEP 686). Die Dokumentation von 3.15 ist am 15.11.2026 die aktuelle; das Lab lief hier nicht mit 3.15, sondern mit 3.12 bis 3.14. Gib die Kodierung trotzdem immer an: Der Code läuft dann auf allen Versionen gleich und zeigt die Absicht.

Was tun mit unbekannten Dateien? Lies sie als Bytes, probiere bekannte Kodierungen und melde einen Fehler, wenn keine passt. Ersetzen mit errors="replace" verbirgt Probleme und gehört in Anzeigen, nicht in Datenverarbeitung.

CSV ist weniger einheitlich, als es scheint: Trennzeichen (Komma oder Semikolon), Dezimalzeichen und Kodierung variieren je nach Programm und Sprache. Dokumentiere das Format, das dein Programm erwartet, und prüfe jede Zeile (Lektion 4).`,
    terms: [
      { term: 'Kodierung', text: 'Vorschrift, wie Zeichen in Bytes umgewandelt werden (zum Beispiel UTF-8).' },
      { term: 'pathlib.Path', text: 'Objekt für Dateipfade mit Eigenschaften wie name, suffix und parent.' },
      { term: 'with-Block', text: 'Schließt die Datei zuverlässig am Ende, auch bei einem Fehler.' },
      { term: 'ensure_ascii', text: 'Option von json.dumps; True schreibt Nicht-ASCII-Zeichen als Escape-Folge.' },
    ],
    code: { file: lab + 'expenses/reader.py', lang: 'Python', from: 'def read_expenses', to: 'return expenses, errors' },
    code2: { file: lab + 'demos/03_dateien.py', lang: 'Python', from: 'with tempfile', to: 'print("falsch, aber still' },
    code3: { file: lab + 'demos/03_dateien.py', lang: 'Python', from: 'data = {', to: 'ungültiges JSON' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: demo('03'),
    mistakes: [
      { wrong: 'open ohne encoding zu verwenden.', why: 'Das Ergebnis hängt von System und Version ab; Umlaute können kaputtgehen.', fix: 'Immer encoding="utf-8" (oder die bekannte Kodierung) angeben.' },
      { wrong: 'Pfade mit + und Schrägstrichen zusammenzusetzen.', why: 'Trennzeichen unterscheiden sich je nach Betriebssystem, Fehler bleiben unbemerkt.', fix: 'pathlib.Path mit dem Operator / verwenden.' },
      { wrong: 'CSV mit split(";") zu zerlegen.', why: 'Felder mit Anführungszeichen oder Trennzeichen im Text werden falsch geteilt.', fix: 'Das Modul csv nutzen und die Datei mit newline="" öffnen.' },
      { wrong: 'Dateien ohne with zu öffnen und das Schließen zu vergessen.', why: 'Bei einem Fehler bleibt die Datei offen; Daten werden womöglich nicht geschrieben.', fix: 'with path.open(...) as handle verwenden.' },
    ],
    practice: 'Schreibe eine kleine CSV mit Umlauten in UTF-8, lies sie zurück und gib sie als JSON mit ensure_ascii=False aus. Öffne die Datei zum Test absichtlich mit Latin-1 und beschreibe, was du siehst.',
    exercises: [
      { task: 'Lies data/ausgaben.csv mit csv.reader und gib jede Zeile als Liste aus.', acceptance: 'Die Zeilen enthalten Datum, Kategorie, Betrag und Notiz; Umlaute erscheinen korrekt; du erklärst newline="".' },
      { task: 'Grenzfall: Speichere die Datei mit einem Texteditor in UTF-8 mit BOM und lies sie mit encoding="utf-8" und mit "utf-8-sig".', acceptance: 'Du beschreibst, wie das BOM im ersten Feld erscheint, wenn du utf-8 verwendest, und wie utf-8-sig es entfernt.' },
      { task: 'Fehlerfall: Lies eine Latin-1-Datei mit encoding="utf-8".', acceptance: 'Python meldet einen UnicodeDecodeError; du fängst ihn ab und gibst eine verständliche Meldung aus.' },
    ],
    quiz: [
      { q: 'Wie sieht „Käse“ aus, wenn UTF-8-Bytes als Latin-1 gelesen werden?',
        options: ['Unverändert „Käse“.', 'Als Fehlermeldung ohne Text.', 'Als „KÃ¤se“, ohne Fehler.', 'Als leere Datei.'],
        correct: 2,
        rationales: ['Dann wäre die Kodierung richtig gewählt.', 'Latin-1 kann jedes Byte darstellen und meldet keinen Fehler.', 'Das zweite Byte des „ä“ wird als eigenes Zeichen gelesen.', 'Der Inhalt bleibt erhalten, nur falsch dargestellt.'],
        explain: 'Deshalb gibst du die Kodierung an und prüfst Eingaben, statt Fehler zu verdecken.' },
      { q: 'Wozu dient newline="" beim Öffnen einer CSV-Datei?',
        options: ['Es entfernt alle Leerzeilen.', 'Es erlaubt dem csv-Modul, Zeilenumbrüche in Feldern selbst zu behandeln.', 'Es wählt die Kodierung.', 'Es macht die Datei schreibgeschützt.'],
        correct: 1,
        rationales: ['Leerzeilen bleiben erhalten.', 'Die Dokumentation von csv verlangt diese Einstellung.', 'Die Kodierung steht in encoding.', 'Das ist der Modus, nicht der Zeilenumbruch.'],
        explain: 'Ohne newline="" kann es bei Feldern mit Zeilenumbruch oder unter Windows zu falschen Zeilen kommen.' },
      { q: 'Warum ist encoding="utf-8" auch dann sinnvoll, wenn UTF-8 der Standard ist?',
        options: ['Der Standard ist in allen Versionen gleich.', 'Ohne Angabe ist das Lesen verboten.', 'Es beschleunigt das Lesen.', 'Der Code verhält sich auf allen Versionen und Systemen gleich.'],
        correct: 3,
        rationales: ['Bis Python 3.14 hing der Standard vom System ab.', 'Das Lesen ist ohne Angabe erlaubt.', 'Die Geschwindigkeit ändert sich nicht.', 'Die Absicht ist sichtbar und unabhängig von der Version.'],
        explain: 'Laut Dokumentation ist UTF-8 erst ab 3.15 Standard; ältere Versionen nutzen die Spracheinstellung des Systems.' },
    ],
    sources: [
      docs('pathlib', 'https://docs.python.org/3/library/pathlib.html'),
      docs('csv', 'https://docs.python.org/3/library/csv.html'),
      docs('json', 'https://docs.python.org/3/library/json.html'),
      docs('Unicode-HOWTO', 'https://docs.python.org/3/howto/unicode.html'),
      docs('open (Kodierung)', 'https://docs.python.org/3/library/functions.html#open'),
    ],
    verification: verification('Pfadzerlegung, Schreiben und Lesen mit Umlauten, CSV mit Semikolon im Feld, falsche Kodierung (Fehler und stilles Fehlverhalten), JSON mit und ohne ensure_ascii und das Einlesen mit und ohne BOM durch die Tests.', 'Windows-Pfade und -Zeilenenden, sehr große Dateien und andere Kodierungen als UTF-8 und Latin-1; Python 3.15 mit UTF-8 als Standard.'),
  },
  {
    id: 'py-m1-l4', title: 'Fehler und Ausnahmen: abfangen, verketten und aufräumen', minutes: 35,
    prerequisites,
    objectives: [
      'try, except, else und finally in der richtigen Reihenfolge einsetzen',
      'Eigene Ausnahmen mit aussagekräftiger Meldung definieren und mit from verketten',
      'Mit with und contextlib sicherstellen, dass aufgeräumt wird',
      'Fehler nicht verschlucken, sondern dort behandeln, wo man sie beheben kann',
    ],
    simple: `Wenn etwas schiefgeht, löst Python eine Ausnahme aus. Sie wandert die Aufrufkette nach oben, bis jemand sie mit except fängt; sonst endet das Programm mit einer Fehlermeldung. try führt Code aus, der fehlschlagen kann, except behandelt bestimmte Ausnahmetypen, else läuft nur, wenn keine Ausnahme auftrat, und finally läuft immer.

Eigene Ausnahmen erbst du von Exception und benennst sie nach dem fachlichen Problem. Mit raise NeuerFehler(...) from original behältst du die Ursache: Sie steht dann als __cause__ am neuen Fehler und im Traceback. from None unterdrückt sie bewusst, wenn sie für den Aufrufer keine Hilfe ist.

Mit with stellst du sicher, dass Aufräumarbeiten laufen, auch bei einem Fehler. Eigene Kontextmanager baust du mit @contextlib.contextmanager: Alles vor yield ist das Öffnen, alles danach das Schließen.`,
    steps: [
      'Starte „python3 demos/04_fehler.py“. Die ersten drei Zeilen zeigen für gültige, nicht numerische und zu große Ports die Reihenfolge try → except/else → finally.',
      'Öffne parse_port im Demo: ValueError von int() wird in eine eigene ConfigError mit lesbarer Meldung umgewandelt und mit from error verkettet; die Ausgabe nennt die Ursache.',
      'Vergleiche mit expenses/model.py: RowError trägt die Zeilennummer (Eigenschaften line und message) und verwendet from None, weil die interne InvalidOperation für den Aufrufer nichts erklärt.',
      'Beobachte die Reihenfolge bei zwei verschachtelten with-Blöcken: Öffnen A, Öffnen B, Arbeit, Schließen B, Schließen A. Das Schließen läuft auch, obwohl 1 / 0 eine Ausnahme auslöst.',
      'contextlib.suppress(FileNotFoundError) ignoriert genau diese eine Ausnahme und nur dort, wo das fachlich gewollt ist.',
      'Beachte das Anti-Muster: except KeyError: pass lässt den Fehler spurlos verschwinden. Fange nie mehr, als du behandeln kannst, und nie ohne Grund alles mit except Exception.',
      'Schau dir die Hierarchie an: KeyError ist ein LookupError und eine Exception. Fange den spezifischsten Typ, der zu deiner Behandlung passt.',
    ],
    background: `Wo fängt man Fehler? Dort, wo man etwas Sinnvolles tun kann: wiederholen, einen Ersatzwert nehmen, den Nutzer informieren, aufräumen. Dazwischen lässt man sie durchlaufen. Das Lab sammelt zum Beispiel Zeilenfehler (RowError) im Reader und entscheidet erst an der Kommandozeile, was daraus wird (Meldung und Exit-Code 1).

Warum nicht überall except Exception? Es fängt auch Programmierfehler (Tippfehler, falsche Typen), die du sehen willst. Ein breites except gehört an die äußerste Grenze eines Programms, etwa einen Server, der pro Anfrage weiterlaufen muss, und dort mit Protokoll und Traceback, nicht mit pass.

Zum Stand: Die Namen und die Hierarchie der eingebauten Ausnahmen sind stabil und stehen in der Dokumentation. Wortlaut und Details von Fehlermeldungen ändern sich zwischen Versionen; teste deshalb den Typ der Ausnahme, nicht den genauen Text, wie es die Tests des Labs bei eingebauten Fehlern tun.`,
    terms: [
      { term: 'Ausnahme (Exception)', text: 'Objekt, das einen Fehler beschreibt und die Aufrufkette hinaufwandert, bis es gefangen wird.' },
      { term: 'finally', text: 'Block, der immer läuft, auch bei Fehlern und bei return.' },
      { term: 'Verkettung (from)', text: 'Hängt die ursprüngliche Ausnahme als Ursache (__cause__) an die neue.' },
      { term: 'Kontextmanager', text: 'Objekt für with: richtet etwas ein und räumt zuverlässig wieder auf.' },
    ],
    code: { file: lab + 'expenses/model.py', lang: 'Python', from: 'class RowError', to: 'self.message = message' },
    code2: { file: lab + 'demos/04_fehler.py', lang: 'Python', from: 'def parse_port', to: 'return " -> ".join(log)' },
    code3: { file: lab + 'demos/04_fehler.py', lang: 'Python', from: '@contextlib.contextmanager', to: 'print("Reihenfolge' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: demo('04'),
    mistakes: [
      { wrong: 'except Exception: pass zu schreiben.', why: 'Alle Fehler verschwinden, auch Programmierfehler; die Ursache ist später nicht mehr auffindbar.', fix: 'Den konkreten Typ fangen und behandeln oder protokollieren und erneut auslösen.' },
      { wrong: 'Aufräumen nur am Ende des try-Blocks zu schreiben.', why: 'Bei einer Ausnahme wird es übersprungen; Dateien und Verbindungen bleiben offen.', fix: 'finally oder besser with verwenden.' },
      { wrong: 'Fehlermeldungen als Text zu vergleichen.', why: 'Der Wortlaut ändert sich zwischen Versionen und Sprachen.', fix: 'Den Ausnahmetyp (oder eigene Felder wie line) prüfen.' },
      { wrong: 'Eine neue Ausnahme ohne from auszulösen, wo die Ursache hilft.', why: 'Der Zusammenhang geht verloren oder erscheint missverständlich als „während der Behandlung“.', fix: 'raise Neu(...) from ursprung oder bewusst from None.' },
    ],
    practice: 'Schreibe eine Funktion read_port(text), die ein int zwischen 1 und 65535 liefert und sonst eine eigene Ausnahme auslöst. Teste mindestens vier Eingaben und prüfe, dass die Ursache bei „abc“ verkettet ist.',
    exercises: [
      { task: 'Rufe parse_port mit dem Text " 80 " (Leerzeichen am Rand) auf.', acceptance: 'Die Funktion liefert 80; du erklärst, dass int() Leerzeichen am Rand akzeptiert, und sicherst das Verhalten mit einem Test.' },
      { task: 'Grenzfall: Löse in einem with-Block mit zwei Kontextmanagern in dem zweiten beim Öffnen eine Ausnahme aus.', acceptance: 'Du beschreibst, dass der erste noch geschlossen wird, und belegst es mit einer Ausgabe.' },
      { task: 'Fehlerfall: Entferne in einer Funktion das except und lasse die Ausnahme bis zum Hauptprogramm laufen.', acceptance: 'Du liest den Traceback von unten nach oben und nennst die Zeile, in der der Fehler entstand.' },
    ],
    quiz: [
      { q: 'Wann läuft der else-Block eines try-Statements?',
        options: ['Immer, auch bei einer Ausnahme.', 'Nur, wenn im try-Block keine Ausnahme auftrat.', 'Nur, wenn eine Ausnahme gefangen wurde.', 'Nie, er ist nur für Schleifen da.'],
        correct: 1,
        rationales: ['Das ist die Aufgabe von finally.', 'So trennst du den Erfolgsfall von dem Code, der fehlschlagen kann.', 'Dafür gibt es den except-Block.', 'Auch try kennt else.'],
        explain: 'else enthält, was nur bei Erfolg passieren soll; Ausnahmen darin werden nicht von diesem try gefangen.' },
      { q: 'Was bewirkt raise ConfigError(...) from error?',
        options: ['Es unterdrückt jede Ausgabe.', 'Es wiederholt den fehlgeschlagenen Aufruf.', 'Es ignoriert den ursprünglichen Fehler.', 'Es hängt den ursprünglichen Fehler als Ursache an.'],
        correct: 3,
        rationales: ['Der Traceback wird sogar länger.', 'Wiederholungen müsstest du selbst schreiben.', 'Der Ursprung bleibt erhalten.', 'Die Ursache steht in __cause__ und im Traceback.'],
        explain: 'So bleibt erkennbar, welche tiefere Ausnahme den fachlichen Fehler ausgelöst hat.' },
      { q: 'Warum ist except Exception: pass meist schlecht?',
        options: ['Es ist ein Syntaxfehler.', 'Es verlangsamt das Programm stark.', 'Es verdeckt auch Programmierfehler, ohne eine Spur zu hinterlassen.', 'Es funktioniert nur in Funktionen.'],
        correct: 2,
        rationales: ['Die Schreibweise ist erlaubt.', 'Die Geschwindigkeit ist nicht das Problem.', 'Du erfährst nie, dass etwas schiefging.', 'Es funktioniert überall.'],
        explain: 'Fange spezifische Ausnahmen, die du behandeln kannst; sonst protokollieren oder weiterreichen.' },
    ],
    sources: [
      docs('Fehler und Ausnahmen (Tutorial)', 'https://docs.python.org/3/tutorial/errors.html'),
      docs('Eingebaute Ausnahmen', 'https://docs.python.org/3/library/exceptions.html'),
      docs('contextlib', 'https://docs.python.org/3/library/contextlib.html'),
    ],
    verification: verification('die Reihenfolge von try, except, else und finally, Verkettung mit from und from None, verschachtelte Kontextmanager mit Fehler, suppress, das Anti-Muster mit pass und die Eigenschaften von RowError in Tests.', 'Ausnahmegruppen (except*) und nebenläufigen Code, asynchrone Kontextmanager und die Ausgabe vollständiger Tracebacks.'),
  },
  {
    id: 'py-m1-l5', title: 'Klassen und Typhinweise: dataclass, Unveränderlichkeit und was Python nicht prüft', minutes: 35,
    prerequisites,
    objectives: [
      'Eine Klasse für Daten mit dataclass schreiben, einschließlich frozen, slots und field(default_factory=...)',
      'Gleichheit, Ordnung und Hashbarkeit einer dataclass erklären',
      'Typhinweise als Dokumentation und Werkzeugeingabe einordnen, nicht als Laufzeitprüfung',
      'Methoden und Operatoren wie __add__ mit NotImplemented sinnvoll umsetzen',
    ],
    simple: `Eine Klasse bündelt Daten und das Verhalten dazu. Für reine Datenträger schreibt man in Python nicht __init__, __repr__ und __eq__ von Hand, sondern verwendet @dataclass: Du listest die Felder mit Typhinweisen auf, und Python erzeugt den Rest.

Wichtige Optionen: frozen=True macht Objekte unveränderlich und hashbar (brauchbar als Schlüssel oder in Mengen). order=True erzeugt Vergleiche wie < nach Feldreihenfolge. slots=True verhindert neue Attribute (Tippfehler fallen auf) und spart Speicher. Für veränderliche Standardwerte nimmst du field(default_factory=list), damit jedes Objekt seine eigene Liste bekommt.

Typhinweise (amount: Decimal) sind Anmerkungen. Python prüft sie zur Laufzeit nicht: Port("kein int") wird anstandslos angelegt. Sie helfen Lesern und Werkzeugen wie Editoren oder Typprüfern. Für Prüfungen zur Laufzeit schreibst du Code, wie parse_amount ihn enthält.`,
    steps: [
      'Starte „python3 demos/05_klassen.py“ und lies neben jeder Ausgabe die zugehörige Klasse.',
      'Öffne Expense in expenses/model.py: frozen=True, slots=True, vier Felder mit Typen, note hat den Standardwert "". Ein Expense lässt sich als Schlüssel oder in einer Menge verwenden, weil es unveränderlich ist.',
      'Probiere im Demo die Klasse Money: Gleichheit vergleicht alle Felder, order=True erlaubt a < b, und replace erzeugt eine geänderte Kopie.',
      'Beobachte __add__: Passt der andere Operand nicht (anderer Typ oder andere Währung), gibt die Methode NotImplemented zurück. Python meldet daraufhin einen TypeError mit „unsupported operand“. Das ist besser als eigenes Raten oder ein stilles falsches Ergebnis.',
      'Beobachte Basket mit default_factory=list: Zwei Körbe haben getrennte Listen. Mit items: list = [] würde dataclass sogar einen Fehler melden, weil veränderliche Standardwerte verboten sind.',
      'Beobachte Port("kein int"): kein Fehler. Typhinweise werden nicht erzwungen. Für echte Prüfung brauchst du Code (Lektion 4) oder einen Typprüfer in der Entwicklung.',
      'Beobachte slots=True bei Point: Der Tippfehler point.z = 2 löst einen AttributeError aus, statt still ein neues Attribut anzulegen.',
    ],
    background: `Wann dataclass, wann normale Klasse? Für Daten mit wenig Verhalten ist dataclass kürzer und weniger fehleranfällig. Hat ein Objekt viel Zustand und Regeln, schreibst du eine normale Klasse oder ergänzt Methoden. Eine Unterklasse nur für Daten ist selten nötig; Zusammensetzen (ein Feld, das auf ein anderes Objekt zeigt) ist oft klarer als Vererbung.

Warum frozen? Unveränderliche Objekte lassen sich nicht aus Versehen an anderer Stelle ändern, sind als Schlüssel brauchbar und in Nebenläufigkeit unproblematisch. Der Preis: Änderungen erzeugen ein neues Objekt (replace). Ein frozen-Objekt kann trotzdem veränderliche Inhalte halten (eine Liste), deren Inhalt sich ändern lässt.

Zum Stand: Typprüfer wie mypy oder pyright waren in diesem Lab nicht installiert und wurden nicht ausgeführt; Typhinweise im Lab sind deshalb ungeprüfte Dokumentation, auch wenn sie sorgfältig gesetzt sind (im Test steht einmal ein bewusstes „type: ignore“ für eine absichtlich verbotene Zuweisung). Details zu typing ändern sich von Version zu Version; ältere Schreibweisen wie List[str] ersetzt inzwischen list[str].`,
    terms: [
      { term: 'dataclass', text: 'Dekorator, der aus Feldern mit Typhinweisen __init__, __repr__ und Vergleiche erzeugt.' },
      { term: 'frozen', text: 'Option, die Felder nach dem Anlegen unveränderlich macht und das Objekt hashbar.' },
      { term: 'Typhinweis', text: 'Anmerkung zum erwarteten Typ; Python prüft sie zur Laufzeit nicht.' },
      { term: 'NotImplemented', text: 'Rückgabewert eines Operators, der den anderen Operanden nicht versteht; Python versucht die Gegenseite oder meldet TypeError.' },
    ],
    code: { file: lab + 'expenses/model.py', lang: 'Python', from: '@dataclass(frozen=True', to: 'note: str' },
    code2: { file: lab + 'demos/05_klassen.py', lang: 'Python', from: '@dataclass(frozen=True, order=True', to: 'return Money(self.amount' },
    code3: { file: lab + 'demos/05_klassen.py', lang: 'Python', from: 'class Port', to: 'print("Typhinweis' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: demo('05'),
    mistakes: [
      { wrong: 'Typhinweise für eine Prüfung zur Laufzeit zu halten.', why: 'Python ignoriert sie; falsche Typen werden angelegt, bis irgendwo etwas bricht.', fix: 'Eingaben an den Grenzen prüfen und zusätzlich einen Typprüfer verwenden.' },
      { wrong: 'Eine Liste als Standardwert eines Feldes zu schreiben.', why: 'Alle Objekte würden dieselbe Liste teilen (dataclass verbietet es mit einem Fehler).', fix: 'field(default_factory=list).' },
      { wrong: 'Veränderliche Objekte als Wörterbuchschlüssel oder Mengenelemente zu verwenden.', why: 'Sie sind nicht hashbar oder ändern ihren Hashwert.', fix: 'frozen=True oder ein Tupel verwenden.' },
      { wrong: 'In __add__ bei falschem Typ eine Ausnahme oder falsches Ergebnis zu liefern.', why: 'Python kann dann die Gegenseite nicht mehr versuchen, und Fehlermeldungen sind unklar.', fix: 'NotImplemented zurückgeben.' },
    ],
    practice: 'Schreibe eine dataclass Temperature(value: Decimal, unit: str = "C") mit Validierung in __post_init__ (nur "C" oder "F") und einer Methode to_celsius. Zeige mit Tests, dass falsche Einheiten abgelehnt werden.',
    exercises: [
      { task: 'Mache aus Expense eine dataclass mit order=True und sortiere eine Liste nach Datum.', acceptance: 'Du erklärst, dass die Ordnung nach Feldreihenfolge entsteht und day zuerst stehen muss.' },
      { task: 'Grenzfall: Lege ein frozen-Objekt mit einer Liste als Feld an und ändere die Liste.', acceptance: 'Du zeigst, dass frozen nur die Zuweisung sperrt, nicht den Inhalt, und nennst eine Abhilfe (Tupel).' },
      { task: 'Fehlerfall: Schreibe items: list = [] in einer dataclass.', acceptance: 'Python meldet einen ValueError wegen des veränderlichen Standardwerts; du behebst ihn mit default_factory.' },
    ],
    quiz: [
      { q: 'Was bewirkt frozen=True bei einer dataclass?',
        options: ['Die Klasse kann von keiner anderen Klasse geerbt werden.', 'Felder bleiben nach dem Anlegen fest, das Objekt ist hashbar.', 'Die Klasse prüft die Typen ihrer Felder bei jeder Zuweisung.', 'Das Objekt wird nur im Arbeitsspeicher und nie gespeichert.'],
        correct: 1,
        rationales: ['Vererbung bleibt möglich.', 'Zuweisungen lösen FrozenInstanceError aus; der Hashwert ergibt sich aus den Feldern.', 'Typen werden nie geprüft.', 'Es hat nichts mit Speicherung zu tun.'],
        explain: 'Das ist nützlich für Werte, die sich nicht ändern sollen, und für Schlüssel in Mengen und Wörterbüchern.' },
      { q: 'Was passiert bei Port("kein int"), wenn value: int deklariert ist?',
        options: ['Es wird ein TypeError ausgelöst.', 'Der Wert wird automatisch in eine Zahl umgewandelt.', 'Das Objekt wird ohne Prüfung angelegt.', 'Das Programm startet nicht.'],
        correct: 2,
        rationales: ['Python prüft Typhinweise nicht.', 'Es findet keine Umwandlung statt.', 'Typhinweise gelten für Leser und Werkzeuge, nicht zur Laufzeit.', 'Das Programm läuft normal.'],
        explain: 'Für Prüfungen zur Laufzeit schreibst du Code oder setzt einen Typprüfer in der Entwicklung ein.' },
      { q: 'Wozu dient field(default_factory=list)?',
        options: ['Es sortiert die Liste.', 'Es verhindert jede Änderung der Liste.', 'Es kopiert eine vorhandene Liste.', 'Es legt für jedes Objekt eine eigene neue Liste an.'],
        correct: 3,
        rationales: ['Sortieren ist nicht Aufgabe der Option.', 'Die Liste bleibt veränderlich.', 'Es wird nichts kopiert, sondern neu erzeugt.', 'So teilen sich Objekte keinen veränderlichen Standardwert.'],
        explain: 'Das ist die richtige Form für veränderliche Standardwerte in dataclasses.' },
    ],
    sources: [
      docs('dataclasses', 'https://docs.python.org/3/library/dataclasses.html'),
      docs('typing', 'https://docs.python.org/3/library/typing.html'),
      docs('Klassen (Tutorial)', 'https://docs.python.org/3/tutorial/classes.html'),
      docs('Datenmodell (Operatoren, NotImplemented)', 'https://docs.python.org/3/reference/datamodel.html'),
    ],
    verification: verification('frozen, order, slots, replace, default_factory, __add__ mit NotImplemented und die fehlende Laufzeitprüfung von Typhinweisen im Demo-Skript sowie die Unveränderlichkeit von Expense in Tests.', 'Typprüfer (mypy, pyright), Vererbung, Protokolle und Metaklassen.'),
  },
  {
    id: 'py-m1-l6', title: 'Ein Projekt zusammensetzen: Paket, Kommandozeile, Exit-Codes, Tests und Umgebung', minutes: 40,
    prerequisites,
    objectives: [
      'Ein kleines Projekt in Module aufteilen (Modell, Einlesen, Auswertung, Kommandozeile)',
      'Eine Kommandozeile mit argparse bauen und Exit-Codes bewusst wählen',
      'Mit unittest Normal-, Grenz- und Fehlerfälle testen und Prüfungen mit subTest bündeln',
      'Eine virtuelle Umgebung (venv) und das Verhältnis zu pip einordnen',
    ],
    simple: `Ein Projekt wächst aus kleinen Teilen. Im Lab ist jedes Modul für eine Aufgabe zuständig: model.py prüft eine Zeile, reader.py liest eine Datei und sammelt Fehler, report.py rechnet und formatiert, cli.py verbindet alles mit der Kommandozeile. Das Paket wird mit python3 -m expenses gestartet; __main__.py ist der Einstieg.

Kommandozeilenprogramme melden ihr Ergebnis auch über den Exit-Code: 0 heißt Erfolg, alles andere Fehler. Das Lab unterscheidet 0 (alles gültig), 1 (einzelne Zeilen ungültig; die gültigen werden trotzdem ausgewertet) und 2 (Datei nicht lesbar oder falsche Aufrufparameter, wie argparse es selbst meldet). Fehlermeldungen gehören auf stderr, Ergebnisse auf stdout.

Mit unittest aus der Standardbibliothek schreibst du Tests als Klassen mit Methoden test_… und Prüfungen wie assertEqual und assertRaises. Mit subTest läuft eine Schleife über Fälle weiter, auch wenn einer fehlschlägt. Eine virtuelle Umgebung (venv) hält die Pakete eines Projekts getrennt von denen anderer Projekte.`,
    steps: [
      'Starte im Lab „python3 -m unittest“. Alle Tests laufen; die Anzahl steht in der letzten Zeile. Mit -v listest du die Tests, mit „python3 -m unittest tests.test_cli“ führst du eine Datei aus.',
      'Starte „python3 -m expenses data/ausgaben.csv“ und danach mit data/fehlerhaft.csv. Beachte die Exit-Codes (in der Shell mit echo $?) und dass Fehler auf stderr stehen.',
      'Öffne expenses/cli.py: argparse erzeugt Hilfe und Fehlermeldungen. main(argv) nimmt die Argumente als Parameter, damit Tests es direkt aufrufen können, ohne einen neuen Prozess zu starten.',
      'Öffne tests/test_cli.py: Die Hilfsfunktion run fängt stdout und stderr ein (contextlib.redirect_stdout) und fängt SystemExit von argparse. Ein Test startet zusätzlich einen echten Prozess mit subprocess.',
      'Öffne tests/test_model.py: Die Tests decken Normalfälle (gültige Formate), Grenzfälle (0,01 und „1.249“ ohne Komma) und Fehlerfälle (abc, 0, negativ, nan) ab. Jede Eingabe läuft in einem subTest.',
      'Lege eine virtuelle Umgebung an (python3 -m venv .venv), aktiviere sie und prüfe, welche Pakete sie enthält (python -m pip list). Das Lab braucht keine Fremdpakete; bei Fremdpaketen hältst du sie in einer Datei (requirements.txt oder pyproject.toml) fest und installierst mit pip.',
      'Mutationsprobe: Ändere in model.py den Vergleich value <= 0 zu value < 0 und starte die Tests. Ein Test muss fehlschlagen; sonst fehlt ein Grenzfall. Mache die Änderung rückgängig.',
    ],
    background: `Warum diese Aufteilung? Jedes Modul lässt sich einzeln testen: parse_amount braucht weder eine Datei noch die Kommandozeile. Die Kommandozeile bleibt dünn, weil sie nur verbindet. Das ist die wichtigste Entwurfsregel dieses Projekts: Trenne Rechnen, Ein- und Ausgabe und Bedienung.

Was gehört nicht in ein Skript? Alles, was eine Datei oder das Netz berührt, sollte man in einem Test nicht ungeprüft anfassen. Das Lab nutzt temporäre Ordner (tempfile) und aufgezeichnete Daten, nicht echte. Für Fremdsysteme würde man Ersatzobjekte (unittest.mock) verwenden; das Lab brauchte sie nicht.

Zum Stand: pip, venv und das Packaging (pyproject.toml, Bauwerkzeuge) wurden hier nicht ausgeführt, weil dafür Downloads nötig wären, und sind in dieser Lektion nur beschrieben. Die offizielle Anleitung zu venv steht in der Dokumentation. Außerdem laufen die Tests des Labs unter Python 3.12 bis 3.14; unter 3.15 (am 15.11.2026 aktuell) wurden sie nicht ausgeführt.`,
    terms: [
      { term: 'Exit-Code', text: 'Zahl, mit der ein Prozess endet; 0 bedeutet Erfolg, alles andere einen Fehler.' },
      { term: 'argparse', text: 'Standardmodul für Kommandozeilenargumente samt Hilfe und Fehlermeldungen.' },
      { term: 'subTest', text: 'Gruppiert Fälle in einem Test; schlägt einer fehl, laufen die übrigen weiter.' },
      { term: 'virtuelle Umgebung (venv)', text: 'Eigener Ordner mit Interpreter und Paketen, getrennt von anderen Projekten.' },
    ],
    code: { file: lab + 'expenses/cli.py', lang: 'Python', from: 'def main', to: 'return 1 if errors else 0' },
    code2: { file: lab + 'tests/test_cli.py', lang: 'Python', from: 'def run', to: 'return code, out.getvalue(), err.getvalue()' },
    code3: { file: lab + 'tests/test_model.py', lang: 'Python', from: 'def test_invalid_values_raise', to: 'self.assertTrue(str(caught' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: cliOutput(),
    mistakes: [
      { wrong: 'Fehlermeldungen mit print nach stdout zu schreiben.', why: 'Ergebnisse und Fehler vermischen sich; Pipes und Skripte lesen falsche Daten.', fix: 'Fehler auf stderr (print(..., file=sys.stderr)) und passenden Exit-Code.' },
      { wrong: 'Im Hauptprogramm sys.exit tief in Funktionen zu verstecken.', why: 'Die Funktion ist nicht mehr testbar, weil sie den Test beendet.', fix: 'Funktionen liefern Werte oder Ausnahmen; nur main gibt den Exit-Code zurück.' },
      { wrong: 'Tests zu schreiben, die immer bestehen.', why: 'Ein Test, der nie fehlschlägt, schützt nichts.', fix: 'Eine Mutationsprobe machen: Code absichtlich verändern und prüfen, dass ein Test fehlschlägt.' },
      { wrong: 'Pakete global zu installieren.', why: 'Projekte stören sich bei unterschiedlichen Versionen; Ergebnisse hängen vom Rechner ab.', fix: 'Pro Projekt eine virtuelle Umgebung verwenden und Abhängigkeiten in einer Datei festhalten.' },
    ],
    practice: 'Erweitere das Projekt um eine Option --kategorie NAME, die nur eine Kategorie ausgibt. Ergänze Tests für den Normalfall, eine unbekannte Kategorie (Grenzfall) und eine fehlende Datei (Fehlerfall). Belege jeden Test mit einer Mutationsprobe.',
    exercises: [
      { task: 'Ergänze in cli.py die Option --kategorie und passe format_report an.', acceptance: 'Die Ausgabe enthält nur die gewählte Kategorie; Tests für Normalfall und unbekannte Kategorie sind grün.' },
      { task: 'Grenzfall: Rufe das Programm mit einer leeren Datei und mit einer Datei nur aus der Kopfzeile auf.', acceptance: 'Das Programm meldet „Keine gültigen Ausgaben.“ mit Exit-Code 0; du sicherst es mit einem Test.' },
      { task: 'Fehlerfall: Rufe das Programm ohne Argument auf.', acceptance: 'argparse meldet den fehlenden Parameter auf stderr mit Exit-Code 2; du beschreibst, wer die Meldung erzeugt.' },
    ],
    quiz: [
      { q: 'Wofür steht der Exit-Code 0 eines Programms?',
        options: ['Der Lauf war erfolgreich.', 'Es gab einen Fehler.', 'Das Programm wurde abgebrochen.', 'Es wurden keine Daten gefunden.'],
        correct: 0,
        rationales: ['Das ist die Konvention für Erfolg.', 'Fehler haben Codes ungleich 0.', 'Ein Abbruch liefert einen anderen Code.', 'Das ist eine fachliche Aussage, kein Prozessstatus.'],
        explain: 'Skripte und CI-Systeme entscheiden anhand des Exit-Codes, ob ein Schritt gelungen ist.' },
      { q: 'Warum übergibt main(argv) die Argumente als Parameter?',
        options: ['Weil argparse es verlangt.', 'Damit Tests das Programm ohne neuen Prozess aufrufen können.', 'Damit das Programm schneller startet.', 'Damit keine Fehler auf stderr erscheinen.'],
        correct: 1,
        rationales: ['argparse liest sonst sys.argv selbst.', 'So lässt sich das Verhalten direkt prüfen und die Ausgabe einfangen.', 'Die Startzeit ändert sich nicht.', 'Fehlermeldungen erscheinen weiterhin.'],
        explain: 'Funktionen mit Parametern sind leichter zu testen als solche, die globalen Zustand lesen.' },
      { q: 'Wozu dient eine virtuelle Umgebung (venv)?',
        options: ['Sie beschleunigt Python.', 'Sie übersetzt das Projekt in Maschinencode.', 'Sie verschlüsselt die Quelltexte.', 'Sie hält die Pakete eines Projekts getrennt von anderen.'],
        correct: 3,
        rationales: ['Die Geschwindigkeit ändert sich nicht.', 'Python bleibt interpretiert.', 'Verschlüsselung ist nicht ihre Aufgabe.', 'So haben Projekte ihre eigenen Paketversionen.'],
        explain: 'Pro Projekt eine Umgebung verhindert Versionskonflikte und macht Installationen reproduzierbar.' },
    ],
    sources: [
      docs('unittest', 'https://docs.python.org/3/library/unittest.html'),
      docs('argparse', 'https://docs.python.org/3/library/argparse.html'),
      docs('venv (Tutorial)', 'https://docs.python.org/3/tutorial/venv.html'),
      docs('Module und Pakete (Tutorial)', 'https://docs.python.org/3/tutorial/modules.html'),
      docs('sys.exit und Exit-Codes', 'https://docs.python.org/3/library/sys.html#sys.exit'),
    ],
    verification: verification(`die Kommandozeile mit Exit-Codes 0, 1 und 2, alle ${unittestCount} Tests (Normal-, Grenz- und Fehlerfälle) und Mutationsproben auf die Kernlogik (alle erkannt).`, 'pip, venv, Packaging und Veröffentlichung, unittest.mock, Windows und Linux sowie Python 3.15.'),
  },
];
