// TypeScript 6.0 · Grundlagen. Stichtag 14.11.2026.
// Eigene Texte; Code und Tests liegen unter content/examples/ts-lab/ (tsc 6.0.3, Node.js 22.23, node:test).
// Die offiziellen Dokumentationen werden nur verlinkt, nichts daraus kopiert.
const lab = 'content/examples/ts-lab/';
const docs = (title, url, note = 'Offizielle Dokumentation; Inhalt hier eigenständig zusammengefasst.') => ({ title, url, note });
const handbook = (title, page) => docs(title, `https://www.typescriptlang.org/docs/handbook/${page}`);

export const module = {
  id: 'ts-m1', course: 'typescript', part: 28, partTitle: 'TypeScript · Typsystem von Grund auf',
  title: 'TypeScript Grundlagen · Typen, Objekte und sichere Grenzen',
};

export const lessons = [
  {
    id: 'ts-m1-l1', title: 'Warum TypeScript? Setup, strict und Typinferenz', minutes: 35,
    prerequisites: 'JavaScript-Grundlagen: Variablen, Funktionen, Arrays (Modul js-m1).',
    objectives: [
      'Erklären, was TypeScript zu JavaScript hinzufügt und warum die Typen zur Laufzeit nicht existieren',
      'Ein Projekt mit tsconfig.json aufsetzen und die wichtigsten strikten Optionen nennen',
      'Vorhersagen, welchen Typ TypeScript bei const, let und Arrays selbst erkennt (Inferenz)',
      'Einen Compilerfehler lesen: Code, Ort und Meldung',
    ],
    simple: `TypeScript ist JavaScript mit einem zusätzlichen Kontrollschritt. Du schreibst dazu, welche Art von Werten eine Variable oder ein Parameter haben darf: Zahl, Text, Liste. Ein Programm namens Compiler (tsc) liest den Code, prüft, ob alles zusammenpasst, und meldet Fehler, bevor du etwas ausführst. Ein Tippfehler im Feldnamen oder ein Text, wo eine Zahl erwartet wird, fällt so beim Schreiben auf statt erst beim Kunden.

Wichtig ist, was TypeScript nicht tut: Die Typen verschwinden beim Ausführen. Zur Laufzeit läuft normales JavaScript. Ein Typ ist also eine Zusicherung, die der Compiler prüft, aber keine Wache, die Daten von außen kontrolliert. Wenn ein Server falsche Daten schickt, merkt TypeScript das nicht von selbst. Dazu mehr in der vierten Lektion.

Du musst nicht überall Typen hinschreiben. TypeScript erkennt viele selbst (Inferenz): Bei const title = 'Einkaufen' weiß es, dass title genau der Text „Einkaufen“ ist; bei let count = 3 ist count eine Zahl. Du notierst Typen vor allem an Funktionsgrenzen, also bei Parametern und Rückgaben, weil dort andere Menschen und Module aufeinandertreffen.

Seit TypeScript 6.0 (März 2026) ist der strenge Modus strict standardmäßig an. Das ist gut so: Er schaltet viele Prüfungen ein, die Fehler früh zeigen, zum Beispiel dass Parameter einen Typ haben müssen und dass null und undefined nicht stillschweigend überall erlaubt sind.`,
    steps: [
      'Installation: npm install --save-dev typescript legt den Compiler im Projekt ab. Im Lab dieses Kurses liegt er bereits in vue-lab (Version 6.0.3).',
      'Die Datei tsconfig.json beschreibt, wie geprüft wird. tsc --init erzeugt in TypeScript 6 eine strikte Vorlage mit strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes und verbatimModuleSyntax.',
      'noEmit: true bedeutet „nur prüfen, nichts schreiben“. Das passt zu Node.js, das .ts-Dateien seit Version 22.18 ohne Schalter ausführen kann, indem es die Typen nur entfernt. Geprüft wird getrennt mit tsc.',
      'In inference.ts hat summary den Typ string, total ist (values: number[]) => number. Du siehst solche Typen in jedem Editor, wenn du mit der Maus über den Namen fährst.',
      'const gibt Literaltypen (title: "Einkaufen"), let gibt den breiten Typ (count: number). Das ist Absicht: Ein let darf später einen anderen Wert derselben Art bekommen.',
      'Die Funktion erwarteteFehler enthält Zeilen, die absichtlich nicht kompilieren. // @ts-expect-error erklärt dem Compiler: „Hier ist ein Fehler erwartet.“ Meldet er keinen, ist das selbst ein Fehler. So bleibt die Lektion überprüfbar.',
      'Eine Fehlermeldung hat drei Teile: Ort (Datei, Zeile, Spalte), Code (z. B. TS2322) und Text. Der Code hilft beim Suchen in der Dokumentation und in Foren.',
      'noUncheckedIndexedAccess macht values[0] zum Typ number | undefined. Das ist ehrlich: Bei einer leeren Liste gibt es kein erstes Element. Du musst den Fall behandeln.',
    ],
    background: `Warum entfernt TypeScript die Typen, statt sie zur Laufzeit zu prüfen? Weil JavaScript überall läuft und so bleiben soll. Der Browser und Node.js kennen keine Typen, und das ist der Grund, warum TypeScript nachträglich auf bestehende Projekte passt: Du kannst Datei für Datei umstellen.

Die Kehrseite: Typen sind Versprechen des Programmierers an den Compiler. Wer mit as oder any lügt, bekommt trotzdem grüne Haken, aber Laufzeitfehler. Deshalb gilt in diesem Kurs die Regel: Typen an der Grenze zur Außenwelt (JSON, Formulare, Umgebungsvariablen) durch eine echte Prüfung absichern und innen dem Compiler vertrauen.

TypeScript 7.0 soll den Compiler in Go neu schreiben, damit er deutlich schneller wird. Die Sprache und die Fehlermeldungen sollen gleich bleiben; sicher ist das für dich erst, wenn du die Version einsetzt. Version 6.0 ist die letzte, die noch auf dem JavaScript-Compiler beruht. Sie markiert alte Optionen wie moduleResolution node als veraltet, damit der Umstieg leichter fällt.`,
    terms: [
      { term: 'Compiler (tsc)', text: 'Das Programm, das TypeScript prüft und bei Bedarf in JavaScript umwandelt.' },
      { term: 'Inferenz', text: 'TypeScript erkennt den Typ aus dem Wert, ohne dass du ihn hinschreibst.' },
      { term: 'strict', text: 'Sammelschalter für strenge Prüfungen. Seit TypeScript 6.0 standardmäßig an.' },
      { term: 'Literaltyp', text: 'Ein Typ, der genau einen Wert erlaubt, etwa "Einkaufen" oder 3.' },
      { term: 'Type Stripping', text: 'Node.js entfernt Typangaben und führt den Rest aus, ohne zu prüfen.' },
    ],
    code: { file: lab + 'src/basics/inference.ts', lang: 'TypeScript' },
    code2: { file: lab + 'tsconfig.json', lang: 'JSON' },
    order: ['body', 'code', 'code2', 'body2'],
    output: `npm run verify (ts-lab)
 tsc --noEmit: keine Fehler (alle @ts-expect-error erfüllt)
 node --test: 2 Tests für inference.ts grün
 - total([1.5, 2, 4.25]) = 7.75, total([]) = 0
 - first([]) ist undefined
npm run errors zeigt die absichtlichen Fehler:
 TS2322: Type 'string' is not assignable to type 'number'.
 TS7006: Parameter 'x' implicitly has an 'any' type.
Ohne tsconfig.json und mit TypeScript 6.0.3 meldet tsc für (x) => x ebenfalls TS7006: strict ist Standard.`,
    mistakes: [
      { wrong: 'Glauben, TypeScript prüft Daten zur Laufzeit.', why: 'Die Typen werden entfernt. Ein Server, der "5" statt 5 schickt, läuft ungehindert durch.', fix: 'An Systemgrenzen (JSON, Formulare, Umgebungsvariablen) eine echte Prüfung schreiben (Lektion 4).' },
      { wrong: 'strict ausschalten, weil „zu viele Fehler“ kommen.', why: 'Die Fehler waren vorher schon da, nur unsichtbar. Das Abschalten versteckt sie wieder.', fix: 'Fehler Datei für Datei beheben; Ausnahmen mit // @ts-expect-error und Begründung markieren.' },
      { wrong: 'Überall Typen hinschreiben, auch wo sie offensichtlich sind (const count: number = 3).', why: 'Mehr Text, kein Gewinn, und bei const verliert man den genaueren Literaltyp.', fix: 'Inferenz nutzen; Typen an Parametern und Rückgaben notieren.' },
      { wrong: 'tsc datei.ts aufrufen und sich wundern, dass die tsconfig.json ignoriert wird.', why: 'Seit TypeScript 6.0 gibt tsc dann den Fehler TS5112, statt die Konfiguration stillschweigend zu übergehen.', fix: 'tsc -p . (Projekt) verwenden oder bewusst --ignoreConfig angeben.' },
    ],
    practice: 'Lege für jedes neue TypeScript-Projekt gleich eine strikte tsconfig.json an und führe tsc --noEmit in der Pipeline aus. Nachträglich strenger zu werden kostet deutlich mehr als von Anfang an streng zu sein.',
    exercises: [
      { task: 'Ändere in inference.ts total so, dass es keine Zahlen, sondern Text-Zahlen (string[]) summiert. Lass tsc laufen und lies jede Fehlermeldung.', acceptance: 'Du kannst für mindestens zwei Meldungen Ort, Code und Ursache nennen und den Code wieder in einen grünen Zustand bringen.' },
      { task: 'Grenzfall: Was liefert first([]) mit und ohne noUncheckedIndexedAccess? Schalte die Option in der tsconfig.json kurz aus und beschreibe den Unterschied im Typ.', acceptance: 'Ohne die Option lautet der Typ von values[0] number, mit ihr number | undefined; du erklärst, warum die zweite Variante ehrlicher ist.' },
      { task: 'Fehlerfall: Schreibe absichtlich einen Typfehler, den @ts-expect-error absichert, und entferne dann die Ursache des Fehlers. Was meldet tsc?', acceptance: 'tsc meldet „Unused @ts-expect-error directive“; du erklärst, warum das nützlich ist.' },
    ],
    quiz: [
      { q: 'Was passiert mit den Typangaben, wenn ein TypeScript-Programm ausgeführt wird?',
        options: ['Sie werden entfernt; zur Laufzeit läuft normales JavaScript.', 'Sie prüfen jeden Wert, den das Programm zur Laufzeit erhält.', 'Sie machen das Programm schneller, weil der Browser Typen kennt.', 'Sie werden in JSON umgewandelt und mitgeschickt.'],
        correct: 0,
        rationales: ['Der Compiler prüft vorher; danach existieren die Typen nicht mehr.', 'Eine Laufzeitprüfung gibt es nicht von selbst; sie muss geschrieben werden.', 'Browser und Node.js kennen keine TypeScript-Typen.', 'Typen sind kein Datenformat und werden nicht übertragen.'],
        explain: 'TypeScript prüft zur Entwicklungszeit; zur Laufzeit gibt es nur JavaScript.' },
      { q: 'Welchen Typ hat values[0] bei number[] mit noUncheckedIndexedAccess?',
        options: ['number | undefined', 'number', 'undefined', 'any'],
        correct: 0,
        rationales: ['Bei einer leeren Liste gibt es kein erstes Element; die Option bildet das im Typ ab.', 'Das gilt nur ohne die Option und ist bei leeren Listen falsch.', 'undefined wäre nur richtig, wenn nie ein Element existierte.', 'any würde jede Prüfung abschalten und ist hier nicht gemeint.'],
        explain: 'Die Option ergänzt bei Indexzugriffen undefined, damit leere Listen nicht übersehen werden.' },
      { q: 'Was bewirkt // @ts-expect-error über einer Zeile?',
        options: ['Er erwartet an der Zeile einen Fehler und meldet es, wenn keiner auftritt.', 'Er schaltet alle Fehler der Datei dauerhaft aus.', 'Er repariert den Fehler automatisch.', 'Er führt die Zeile nicht aus.'],
        correct: 0,
        rationales: ['Der Fehler wird erwartet; bleibt er aus, schlägt tsc an der Direktive fehl.', 'Er gilt nur für die folgende Zeile, nicht für die Datei.', 'Er behebt nichts, er dokumentiert nur eine bekannte Stelle.', 'Die Zeile läuft zur Laufzeit ganz normal.'],
        explain: 'Die Direktive macht eine bekannte Ausnahme sichtbar und fällt auf, wenn sie nicht mehr nötig ist.' },
    ],
    sources: [
      handbook('TypeScript Handbook: The Basics', '2/basic-types.html'),
      docs('TSConfig Reference', 'https://www.typescriptlang.org/tsconfig/', 'Alle Optionen mit Standardwerten; für TypeScript 6.0 die Abschnitte zu strict und types lesen.'),
      docs('Announcing TypeScript 6.0 (Microsoft DevBlogs)', 'https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/', 'Neue Standardwerte und Auslaufoptionen; Quelle für die Aussagen zu strict und TypeScript 7.'),
      docs('Node.js: Running TypeScript Natively', 'https://nodejs.org/api/typescript.html', 'Beschreibt Type Stripping und welche Syntax es nicht unterstützt.'),
    ],
    verification: 'Lab ts-lab: tsc 6.0.3 (--noEmit) und 2 node:test-Tests für diese Lektion laufen grün; die Fehlercodes TS2322 und TS7006 sowie das Standardverhalten ohne tsconfig wurden mit tsc 6.0.3 beobachtet. Das Verhalten von Node 24 und 26 wurde in dieser Lektion nicht geprüft.',
  },
  {
    id: 'ts-m1-l2', title: 'Union-Typen, Literale und Narrowing', minutes: 40,
    prerequisites: 'Lektion „Warum TypeScript?“ (ts-m1-l1).',
    objectives: [
      'Einen Union-Typ aus Literalen definieren und erklären, warum er besser ist als string',
      'Mit typeof, == null, Array.isArray und Vergleichen einen Union-Typ pro Zweig eingrenzen',
      'Ein Tupel mit benannten Positionen schreiben und den Unterschied zu einer Liste nennen',
      'Vorhersagen, wann der Compiler eine Eigenschaft eines Union-Typs verbietet',
    ],
    simple: `Ein Union-Typ sagt: „Dieser Wert ist entweder A oder B.“ Zum Beispiel ist type Id = number | string eine Kennung, die als Zahl oder als Text vorkommt. Besonders nützlich sind Literaltypen: type Priority = 'niedrig' | 'mittel' | 'hoch' erlaubt genau diese drei Texte. Ein Tippfehler wie 'dringend' wird sofort rot, statt als Fehlerwert durch das Programm zu wandern.

Bei einem Union-Typ darfst du nur das benutzen, was für alle Möglichkeiten gilt. Bei string | number gibt es kein toFixed, denn Texte haben es nicht. Willst du es doch benutzen, grenzt du den Typ ein (Narrowing): if (typeof id === 'string') { … }. Innerhalb des Zweigs weiß der Compiler, dass id ein Text ist; danach bleibt für den Rest nur die Zahl übrig.

Narrowing gelingt mit typeof, mit Vergleichen (=== 'hoch'), mit Array.isArray, mit in und mit == null, das null und undefined zugleich fängt. Der Compiler denkt wie du beim Lesen: Er verfolgt, welche Möglichkeiten nach jeder Prüfung noch übrig sind.

Ein Tupel ist eine Liste mit fester Länge und festen Typen je Position: [from: number, to: number]. Zwei Zahlen sind ein Bereich; drei Zahlen sind ein Fehler. Benannte Positionen machen die Meldungen und die Autovervollständigung lesbar.`,
    steps: [
      'Priority ist ein Union aus drei Literalen. Der Compiler lehnt compare(p, "dringend") ab (TS2345).',
      'Record<Priority, number> verlangt für jeden Schlüssel einen Eintrag; ein vierter Wert in Priority würde hier sofort einen Fehler erzeugen. So bleiben Tabellen vollständig.',
      'idLabel(id: Id) prüft typeof id === "string". Im if-Zweig ist id ein string, danach ein number. Das heißt Narrowing durch typeof.',
      'lengthOf(value) beginnt mit value == null. Das fängt null und undefined. Danach ist value string | string[], Array.isArray trennt die beiden.',
      'Beachte die leere Zeichenkette: "" ist ein gültiger string. Hier wird sie nicht als „fehlt“ behandelt, weil nur == null geprüft wird. Prüfst du stattdessen if (!value), zählt "" fälschlich als fehlend.',
      'Range ist ein readonly Tupel [from, to]. inRange(5, [1, 5]) ist true: beide Grenzen sind inklusive. Ein Tupel mit drei Zahlen meldet TS2322 („Source has 3 element(s) but target allows only 2“).',
      'In erwarteteFehler sind drei Fehler mit @ts-expect-error abgesichert: falscher Literalwert, nicht eingegrenzter Zugriff, falsche Tupellänge.',
      'Die Tests decken die Grenzfälle ab: null, undefined, leerer Text, leere Liste, Randwerte des Bereichs.',
    ],
    background: `Warum nicht einfach string verwenden? Weil jede Zeichenkette dann gültig wäre. Mit Literaltypen wird „erlaubte Werte“ Teil des Typs, und der Compiler hilft beim Vervollständigen und beim Umbenennen. Enums leisten Ähnliches, haben aber eigene Laufzeit-Fallen (siehe ts-m2-l4); ein Union aus Literalen kostet zur Laufzeit nichts.

Narrowing ist keine Magie, sondern Flussanalyse: Der Compiler liest den Code von oben nach unten und merkt sich, was nach jeder Prüfung gilt. Das funktioniert auch über return und throw hinweg: Nach if (x === undefined) return; ist x sicher definiert. Es gelingt nicht über Funktionsgrenzen, weshalb eigene Typwächter (Lektion 4) existieren.

Ein Fallstrick: Narrowing gilt für const und Parameter zuverlässig; bei veränderlichen Eigenschaften kann ein Funktionsaufruf dazwischen den Wert ändern, ohne dass der Compiler es merkt. Kopiere den Wert dann in eine lokale const.`,
    terms: [
      { term: 'Union-Typ', text: 'A | B: der Wert ist A oder B.' },
      { term: 'Literaltyp', text: 'Genau ein erlaubter Wert, etwa "hoch".' },
      { term: 'Narrowing', text: 'Der Compiler grenzt einen breiten Typ durch Prüfungen im Code ein.' },
      { term: 'Tupel', text: 'Liste mit fester Länge und festen Typen pro Position.' },
      { term: 'Record<K, V>', text: 'Objekt mit allen Schlüsseln aus K und Werten vom Typ V.' },
    ],
    code: { file: lab + 'src/basics/narrowing.ts', lang: 'TypeScript' },
    code2: { file: lab + 'tests/narrowing.test.ts', lang: 'TypeScript' },
    order: ['body', 'code', 'code2', 'body2'],
    output: `node --test (narrowing): 4 Tests grün
 - compare('hoch', 'niedrig') > 0; compare('mittel', 'mittel') = 0
 - idLabel('ab') = "Kürzel AB"; idLabel(7) = "Nummer 7"
 - lengthOf(null)=0, lengthOf(undefined)=0, lengthOf('')=0, lengthOf('abc')=3, lengthOf(['a','b'])=2
 - inRange(5,[1,5]) = true; inRange(6,[1,5]) = false
tsc-Fehler hinter den @ts-expect-error-Zeilen:
 TS2345: Argument of type '"dringend"' is not assignable to parameter of type 'Priority'.
 TS2339: Property 'toFixed' does not exist on type 'Id'. (Property 'toFixed' does not exist on type 'string'.)
 TS2322: Type '[number, number, number]' is not assignable to type 'Range'. (Source has 3 element(s) but target allows only 2.)`,
    mistakes: [
      { wrong: 'Prioritäten als string deklarieren und Konstanten mit Kommentar erklären.', why: 'Jeder Text kompiliert; Tippfehler fallen erst zur Laufzeit auf.', fix: 'Union aus Literalen verwenden; der Compiler listet die erlaubten Werte auf.' },
      { wrong: 'if (!value) für „fehlt“ verwenden, obwohl "" und 0 gültige Werte sind.', why: 'Falsy-Prüfungen fangen auch leere Texte, 0 und false.', fix: 'Genau prüfen: value == null für null/undefined, oder value === undefined.' },
      { wrong: 'Einen Union-Typ mit as auf einen Zweig festlegen (id as string).', why: 'Das schaltet die Prüfung ab. Kommt zur Laufzeit eine Zahl, läuft toUpperCase ins Leere.', fix: 'Mit typeof eingrenzen; so ist der Zweig bewiesen und nicht behauptet.' },
      { wrong: 'Ein Tupel mit einer normalen Liste verwechseln (number[] statt [number, number]).', why: 'Bei number[] sind beliebig viele Elemente erlaubt; der Compiler schützt dich nicht vor drei Werten.', fix: 'Für feste Paare ein Tupel mit benannten Positionen verwenden.' },
    ],
    practice: 'Wo immer du eine feste Menge erlaubter Werte hast (Status, Rolle, Priorität), schreibe einen Literal-Union. Das ist die billigste Sicherheit, die TypeScript bietet.',
    exercises: [
      { task: 'Füge zu Priority den Wert "kritisch" hinzu. Was meldet tsc bei Record<Priority, number> in narrowing.ts? Ergänze den fehlenden Eintrag.', acceptance: 'tsc meldet, dass die Eigenschaft "kritisch" fehlt (TS2741); nach der Ergänzung ist tsc grün und ein neuer Test für compare("kritisch", "hoch") besteht.' },
      { task: 'Grenzfall: Schreibe lengthOf so um, dass sie if (!value) statt value == null prüft. Welcher Test schlägt fehl und warum?', acceptance: 'Der Test mit "" liefert weiter 0, aber du erklärst, dass bei anderen Funktionen (z. B. Zahl 0) das Verhalten kippt; du benennst den Unterschied zwischen falsy und fehlend.' },
      { task: 'Fehlerfall: Erweitere Id um boolean und rufe idLabel auf. Welche Fehlermeldung kommt, und wie behebst du sie ohne as?', acceptance: 'tsc meldet, dass boolean keine Zuweisung auf Id/Zweig erlaubt (bzw. toFixed/toUpperCase fehlt); du ergänzt einen weiteren Zweig mit typeof.' },
    ],
    quiz: [
      { q: 'Warum ist type Priority = "niedrig" | "mittel" | "hoch" besser als type Priority = string?',
        options: ['Der Compiler lehnt andere Texte ab und vervollständigt die erlaubten.', 'Der Code wird zur Laufzeit schneller.', 'Es spart Speicher im Browser.', 'Es verhindert, dass Texte überhaupt vorkommen.'],
        correct: 0,
        rationales: ['Literaltypen schränken den Wertebereich schon beim Prüfen ein.', 'Zur Laufzeit gibt es keinen Unterschied; beide sind Strings.', 'Der Speicher bleibt gleich, die Typen sind weg.', 'Es sind weiterhin Texte, nur eben nur diese drei.'],
        explain: 'Literal-Unions machen erlaubte Werte zum Teil des Typs.' },
      { q: 'Was bleibt im else-Zweig von if (typeof id === "string") für id übrig, wenn id: number | string war?',
        options: ['number', 'string', 'number | string', 'never'],
        correct: 0,
        rationales: ['Der Zweig hat string ausgeschlossen; übrig ist number.', 'string wurde gerade im if-Zweig behandelt.', 'Eingrenzung hat stattgefunden, der Typ ist enger.', 'never wäre es nur, wenn keine Möglichkeit mehr übrig wäre.'],
        explain: 'Der Compiler zieht die geprüfte Möglichkeit vom Union ab.' },
      { q: 'Was fängt die Prüfung value == null ab?',
        options: ['null und undefined', 'nur null', 'null, undefined, 0 und ""', 'nur undefined'],
        correct: 0,
        rationales: ['== null ist die einzige Ausnahme, bei der lockerer Vergleich beide Fälle erfasst.', 'undefined wird ebenfalls erfasst.', 'Das wäre eine Falsy-Prüfung mit if (!value).', 'null wird ebenfalls erfasst.'],
        explain: '== null ist die präzise Kurzform für „weder null noch undefined“.' },
    ],
    sources: [
      handbook('Handbook: Narrowing', '2/narrowing.html'),
      handbook('Handbook: Everyday Types (Unions, Literale, Tupel)', '2/everyday-types.html'),
    ],
    verification: 'Lab ts-lab: 4 Tests für narrowing.ts grün; alle drei @ts-expect-error-Zeilen sind durch tsc 6.0.3 bestätigt, Meldungstexte mit npm run errors abgelesen. Die Aufgaben 1 und 3 wurden nicht als Tests ausgeführt, sondern als Vorgabe formuliert.',
  },
  {
    id: 'ts-m1-l3', title: 'Objekte und Funktionen: type, interface, optional, readonly', minutes: 40,
    prerequisites: 'Union-Typen und Narrowing (ts-m1-l2).',
    objectives: [
      'Ein Objekt mit interface oder type beschreiben und den Unterschied zwischen beiden nennen',
      'Optionale und schreibgeschützte Eigenschaften setzen und die Folgen für Zuweisungen erklären',
      'Funktionstypen, Standardwerte und Rest-Parameter schreiben',
      'Warum exactOptionalPropertyTypes zwischen „fehlt“ und „undefined“ unterscheidet',
    ],
    simple: `Ein Objekttyp beschreibt, welche Felder ein Objekt hat. Das kann als interface oder als type stehen. Beide beschreiben denselben Alltag: id: number, title: string. Der Unterschied ist klein. Ein interface lässt sich später erweitern (extends oder erneute Deklaration); ein type kann zusätzlich Unions, Tupel und berechnete Typen benennen. Eine einfache Faustregel: Objektformen als interface, alles andere als type, und im Team einheitlich bleiben.

Zwei Zusätze machen Beschreibungen ehrlich. Ein Fragezeichen markiert ein Feld als optional: dueDate?: string. Das Schlüsselwort readonly verbietet das Ändern nach dem Anlegen: readonly id: number. Beides wird vom Compiler geprüft, existiert aber nur im Typ, nicht zur Laufzeit.

Funktionen bekommen Typen an Parametern und Rückgabe. Standardwerte (separator = ', ') und Rest-Parameter (...parts: string[]) sind dabei normales JavaScript, TypeScript ergänzt nur die Typen. Ein Funktionstyp kann einen Namen bekommen: type Formatter = (task: Task) => string.

Bei Objektliteralen prüft der Compiler besonders streng: Ein Feld, das der Typ nicht kennt, wird abgelehnt (Excess Property Check). Der Tippfehler titel statt title fällt so sofort auf.`,
    steps: [
      'Task hat id (readonly), title, done und dueDate (optional). Subtask erweitert Task mit extends um parentId.',
      'TaskPatch = Partial<Omit<Task, "id">> ist eine Teilmenge der Felder ohne id. Utility Types lernst du in ts-m2-l3; hier genügt: „alles optional, außer die id gibt es nicht“.',
      'createTask baut je nach Fall ein Objekt mit oder ohne dueDate. Wegen exactOptionalPropertyTypes ist { dueDate: undefined } etwas anderes als ein fehlendes Feld und wird abgelehnt (TS2375).',
      'applyPatch kopiert mit { ...task, ...patch } in ein neues Objekt. Das Original bleibt unverändert; der Test belegt es.',
      'Formatter ist ein benannter Funktionstyp. plain: Formatter = (task) => … bekommt den Parametertyp aus dem Alias, es braucht keine zweite Annotation.',
      'join(separator = ", ", ...parts) zeigt Standardwert und Rest-Parameter. join() ohne Argumente ergibt eine leere Zeichenkette.',
      'count() nutzt einen Record<string, number> als Zähltabelle. result[word] ?? 0 ist nötig, weil noUncheckedIndexedAccess den Zugriff als number | undefined typisiert.',
      'In erwarteteFehler stehen drei Fehler: Zuweisung an readonly (TS2540), unbekanntes Feld titel (TS2561), explizites undefined (TS2375).',
    ],
    background: `Warum gibt es zwei Wege, Objekte zu beschreiben? Historisch: interface kam zuerst und passt zu objektorientierten Sprachen, type kam später und kann mehr. Heute überlappen sie stark. Eine echte Besonderheit: Gleichnamige interfaces in derselben Sichtweite werden zusammengeführt (declaration merging); bei type wäre das ein Fehler. Das ist nützlich für Bibliotheken, die erweitert werden sollen, und überraschend, wenn man es nicht weiß.

Optional heißt in JavaScript meist „das Feld fehlt“. Wird aber ein Feld explizit auf undefined gesetzt, ist es vorhanden mit dem Wert undefined. Das macht bei JSON.stringify (lässt undefined weg) und bei Object.keys (zählt es mit) einen Unterschied. exactOptionalPropertyTypes macht diese Unterscheidung im Typsystem sichtbar. Es ist eine strenge Zusatzoption und gehört in der Vorlage von TypeScript 6.0 zur Standard-Initialisierung.

readonly schützt nur vor Zuweisung über diese Sicht. Es friert nichts ein: Wer das Objekt über einen anderen Typ ohne readonly sieht, kann es ändern. Echtes Einfrieren braucht Object.freeze zur Laufzeit.`,
    terms: [
      { term: 'interface', text: 'Beschreibt die Form eines Objekts und lässt sich erweitern.' },
      { term: 'type', text: 'Benennt einen beliebigen Typ: Objekte, Unions, Tupel, Funktionen.' },
      { term: 'optional (?)', text: 'Das Feld darf fehlen.' },
      { term: 'readonly', text: 'Das Feld darf nach dem Anlegen nicht neu zugewiesen werden (nur im Typ).' },
      { term: 'Excess Property Check', text: 'Objektliterale mit unbekannten Feldern werden abgelehnt.' },
    ],
    code: { file: lab + 'src/basics/shapes.ts', lang: 'TypeScript' },
    code2: { file: lab + 'tests/shapes.test.ts', lang: 'TypeScript' },
    order: ['body', 'code', 'code2', 'body2'],
    output: `node --test (shapes): 4 Tests grün
 - createTask(1, 'Milch') -> { id: 1, title: 'Milch', done: false } (kein dueDate-Feld)
 - applyPatch ändert das Original nicht; plain(changed) = '[x] Milch'
 - join(undefined, 'a', 'b') = 'a, b'; join() = ''
 - count(['a','b','a']) = { a: 2, b: 1 }; count([]) = {}
tsc-Fehler hinter den @ts-expect-error-Zeilen:
 TS2540: Cannot assign to 'id' because it is a read-only property.
 TS2561: Object literal may only specify known properties, but 'titel' does not exist in type 'Task'. Did you mean to write 'title'?
 TS2375: ... is not assignable to type 'Task' with 'exactOptionalPropertyTypes: true'.`,
    mistakes: [
      { wrong: 'Alle Felder optional machen, „damit es nicht meckert“.', why: 'Der Compiler kann dann nichts mehr prüfen; überall kommen undefined-Fälle hinzu.', fix: 'Pflichtfelder als Pflicht lassen; für Teilmengen Partial/Pick in eigenen Typen verwenden.' },
      { wrong: 'readonly für Schutz vor böswilligen Änderungen halten.', why: 'Es gilt nur im Typ; zur Laufzeit ist das Objekt änderbar.', fix: 'Für echte Unveränderlichkeit Object.freeze oder Kopien (Spread) verwenden.' },
      { wrong: 'Ein Objekt mit as Task zuweisen, um Fehler zu übergehen ({ id: 1 } as Task).', why: 'Das lügt dem Compiler vor, dass title und done existieren.', fix: 'Das Objekt vollständig schreiben oder einen eigenen Typ für den Teil verwenden.' },
      { wrong: 'Optionale Felder mit dueDate: undefined füllen, um „leer“ auszudrücken.', why: 'Bei aktiviertem exactOptionalPropertyTypes wird das abgelehnt; zudem unterscheiden JSON und Object.keys beide Fälle.', fix: 'Das Feld weglassen oder den Typ ausdrücklich dueDate?: string | undefined angeben.' },
    ],
    practice: 'Beschreibe Daten, die aus deiner Datenbank oder API kommen, als eigene Typen und gib Funktionen nie ein loses Objekt, sondern einen benannten Typ. Das gibt dir beim Umbenennen eines Feldes sofort alle betroffenen Stellen.',
    exercises: [
      { task: 'Füge Task ein Feld priority?: Priority hinzu (aus ts-m1-l2) und passe createTask so an, dass die Priorität optional übergeben werden kann. Ergänze zwei Tests.', acceptance: 'tsc und Tests sind grün; ohne Priorität fehlt das Feld im Ergebnis, mit Priorität steht es darin.' },
      { task: 'Grenzfall: Setze in der tsconfig.json exactOptionalPropertyTypes kurz auf false. Welche der drei erwarteten Fehler verschwindet, und was meldet tsc dazu?', acceptance: 'TS2375 verschwindet; tsc meldet „Unused @ts-expect-error directive“. Du erklärst den Unterschied zwischen fehlend und undefined.' },
      { task: 'Fehlerfall: Ändere die id eines Tasks in applyPatch mit einem Patch { id: 9 }. Welche Meldung kommt, und was passiert zur Laufzeit, wenn du den Patch als any übergibst?', acceptance: 'tsc lehnt den Patch ab (TaskPatch hat keine id); mit any würde die id überschrieben, ein Test zeigt es. Du nennst die Grenze von readonly und Typen.' },
    ],
    quiz: [
      { q: 'Was bewirkt readonly bei einer Eigenschaft?',
        options: ['Der Compiler lehnt Zuweisungen über diesen Typ ab; zur Laufzeit ändert sich nichts.', 'Das Objekt wird zur Laufzeit eingefroren und lässt sich nicht mehr ändern.', 'Die Eigenschaft wird im Browser nicht angezeigt und ist nur intern sichtbar.', 'Der Wert der Eigenschaft muss immer ein String oder eine Zahl sein.'],
        correct: 0,
        rationales: ['readonly ist reine Typprüfung und wird beim Ausführen entfernt.', 'Einfrieren geschieht nur mit Object.freeze.', 'Sichtbarkeit hat mit readonly nichts zu tun.', 'Der Typ des Werts bleibt frei.'],
        explain: 'readonly schützt gegen versehentliche Zuweisungen im Code, nicht gegen Laufzeitänderungen.' },
      { q: 'Wozu dient der Excess Property Check bei Objektliteralen?',
        options: ['Er meldet Felder, die der Zieltyp nicht kennt, zum Beispiel Tippfehler.', 'Er entfernt überzählige Felder zur Laufzeit.', 'Er verlangt, dass jedes Feld optional ist.', 'Er prüft die Reihenfolge der Felder.'],
        correct: 0,
        rationales: ['So fällt titel statt title sofort auf.', 'Zur Laufzeit existieren die Typen nicht.', 'Das hat mit Pflicht und Optional nichts zu tun.', 'Die Reihenfolge der Felder ist egal.'],
        explain: 'Der Check fängt Tippfehler in Objektliteralen.' },
      { q: 'Was bedeutet exactOptionalPropertyTypes für dueDate?: string?',
        options: ['Das Feld darf fehlen, aber nicht ausdrücklich undefined sein.', 'Das Feld muss immer vorhanden sein.', 'Das Feld darf nur null sein.', 'Das Feld wird zur Laufzeit entfernt.'],
        correct: 0,
        rationales: ['Fehlend und undefined werden unterschieden; ein undefined muss dazugeschrieben werden.', 'Dann wäre es nicht optional.', 'null kommt im Typ nicht vor.', 'Die Option wirkt nur beim Prüfen.'],
        explain: 'Die Option macht „fehlt“ und „ist undefined“ im Typ unterscheidbar.' },
    ],
    sources: [
      handbook('Handbook: Object Types', '2/objects.html'),
      handbook('Handbook: More on Functions', '2/functions.html'),
      docs('TSConfig: exactOptionalPropertyTypes', 'https://www.typescriptlang.org/tsconfig/#exactOptionalPropertyTypes', 'Erklärt den Unterschied zwischen fehlend und undefined.'),
    ],
    verification: 'Lab ts-lab: 4 Tests für shapes.ts grün; die drei @ts-expect-error-Zeilen sind durch tsc 6.0.3 bestätigt. Das Verhalten von JSON.stringify bei undefined ist Standard-JavaScript und hier nicht eigens getestet.',
  },
  {
    id: 'ts-m1-l4', title: 'unknown, any, never und die Grenze zur Außenwelt', minutes: 45,
    prerequisites: 'Objekte und Funktionen (ts-m1-l3); JSON-Grundlagen.',
    objectives: [
      'Den Unterschied zwischen any und unknown erklären und begründen, warum unknown vorzuziehen ist',
      'Einen Typwächter (type predicate) schreiben, der Daten von außen prüft',
      'JSON.parse sicher einsetzen: unknown prüfen, dann erst als Typ verwenden',
      'never als „kann nie eintreten“ verstehen und für vollständige Fallunterscheidungen nutzen',
    ],
    simple: `Alles, was von außen kommt, ist erstmal unbekannt: eine JSON-Antwort, ein Formularfeld, eine Umgebungsvariable. TypeScript kennt dafür zwei Typen. any bedeutet „mir egal, prüfe nichts“ und steckt andere Variablen an: Wer any weitergibt, schaltet überall die Prüfung ab. unknown bedeutet „ich weiß es nicht, und ich muss es erst prüfen“. Mit einem unknown-Wert darfst du nichts tun, bis du ihn eingegrenzt hast.

Die Prüfung schreibst du selbst, und sie darf nicht „glauben“, sondern muss nachsehen: Ist es ein Objekt? Hat es name als Text und age als ganze Zahl ≥ 0? Packst du diese Prüfung in eine Funktion mit der Signatur value is User (Typwächter), kennt der Compiler danach den Typ im Zweig, in dem die Prüfung bestanden wurde.

JSON.parse liefert in der Standardbibliothek any. Das ist eine Altlast. Gute Praxis: Das Ergebnis sofort auf unknown festlegen (const data: unknown = JSON.parse(text)) und prüfen. In größeren Projekten übernimmt das eine Bibliothek wie Zod; das Prinzip ist dasselbe.

never ist der Typ „kommt nie vor“. Eine Funktion, die immer wirft, hat Rückgabetyp never. Als Parametertyp nimmt never keinen Wert an. Wer ihn in den default-Zweig einer Fallunterscheidung legt, bekommt einen Compilerfehler, sobald ein neuer Fall dazukommt und vergessen wird.`,
    steps: [
      'isRecord(value: unknown): value is Record<string, unknown> prüft, ob value ein Objekt ist (nicht null, nicht Array). Erst danach darf man auf value["name"] zugreifen.',
      'isUser prüft drei Dinge: name ist ein Text, age ist eine Zahl, age ist ganzzahlig und nicht negativ. Die Prüfung ist absichtlich streng; „irgendetwas Zahlenähnliches“ reicht nicht.',
      'parseUser wandelt JSON-Text in einen User. Es legt das Ergebnis von JSON.parse auf unknown fest und wirft einen TypeError, wenn die Prüfung scheitert.',
      'Kaputtes JSON löst schon in JSON.parse einen SyntaxError aus. Beide Fehlerarten sind verschieden und im Test getrennt belegt.',
      'assertNever(value: never): never wirft einen Fehler, falls es doch aufgerufen wird. Zur Laufzeit hilft es bei Daten, die an den Typen vorbei hereinkommen; zur Prüfzeit meldet der Compiler fehlende Fälle.',
      'In erwarteteFehler ist der Zugriff auf value.name bei unknown verboten (TS18046); assertNever("x") wird abgelehnt (TS2345).',
      'Typwächter sind ehrlich nur so gut wie ihre Prüfung. Ein Wächter, der immer true zurückgibt, wird vom Compiler nicht erkannt. Teste deine Wächter wie jede andere Funktion.',
      'Die Tests decken sechs fehlerhafte Eingaben ab: falscher Typ, negative Zahl, Kommazahl, Array, null und fehlendes Feld.',
    ],
    background: `Warum nicht einfach as User? Weil as keine Prüfung ist, sondern eine Behauptung. Der Compiler vertraut dir. Ist die Behauptung falsch, bricht das Programm später an einer ganz anderen Stelle, und die Fehlersuche beginnt am falschen Ort. Eine Prüfung an der Grenze verschiebt den Fehler dorthin, wo die Daten hereinkommen.

Der Unterschied zwischen any und unknown ist der Unterschied zwischen „ich habe die Tür abgeschlossen“ und „die Tür steht offen“. any verhindert Fehler nicht, sondern versteckt sie. In strict-Projekten sollte any die Ausnahme sein, begründet in einem Kommentar. Viele Teams ergänzen eine Linter-Regel, die any verbietet.

Typwächter können sich auch irren, wenn man sie nachlässig schreibt: type predicates sind eine Zusicherung, die der Compiler nicht nachprüft. Daher gehört zu jedem Wächter ein Test mit den unangenehmen Eingaben (null, Array, falscher Typ, Randwert). Bei vielen Feldern lohnt sich eine Schema-Bibliothek, die Prüfung und Typ aus einer Quelle ableitet (siehe js-m3-l1 mit Zod).`,
    terms: [
      { term: 'any', text: 'Schaltet die Typprüfung für einen Wert ab; steckt jeden Aufrufer an.' },
      { term: 'unknown', text: 'Unbekannter Wert; benutzbar erst nach einer Prüfung.' },
      { term: 'Typwächter', text: 'Funktion mit Rückgabetyp value is T, die den Typ im Zweig eingrenzt.' },
      { term: 'never', text: 'Der Typ, den es nicht gibt: keine Werte, Funktion kehrt nie zurück.' },
      { term: 'Systemgrenze', text: 'Stelle, an der Daten von außen ins Programm kommen (Netzwerk, Datei, Eingabe).' },
    ],
    code: { file: lab + 'src/basics/boundaries.ts', lang: 'TypeScript' },
    code2: { file: lab + 'tests/boundaries.test.ts', lang: 'TypeScript' },
    order: ['body', 'code', 'code2', 'body2'],
    output: `node --test (boundaries): 4 Tests grün
 - parseUser('{"name":"Ada","age":36}') = { name: 'Ada', age: 36 }
 - abgelehnt (TypeError): age als Text "36", age -1, age 1.5, [], null, Objekt ohne name
 - '{kaputt' wirft SyntaxError
 - isUser({ name: 'x', age: 0 }) = true; isUser(undefined) = false
tsc-Fehler hinter den @ts-expect-error-Zeilen:
 TS18046: 'value' is of type 'unknown'.
 TS2345: Argument of type '"x"' is not assignable to parameter of type 'never'.`,
    mistakes: [
      { wrong: 'const user = JSON.parse(text) as User;', why: 'as behauptet, prüft aber nichts. Falsche Daten laufen unbemerkt weiter.', fix: 'Auf unknown festlegen und mit einem Typwächter oder Schema prüfen.' },
      { wrong: 'any als Parametertyp verwenden, weil der Typ „kompliziert“ ist.', why: 'Der Fehler wandert durch alle Aufrufer; später ist nicht mehr erkennbar, wo er herkam.', fix: 'unknown verwenden und gezielt eingrenzen.' },
      { wrong: 'Nur das Vorhandensein eines Feldes prüfen ("name" in value), nicht seinen Typ.', why: 'Das Feld kann eine Zahl, null oder ein Objekt sein; der Typwächter wäre falsch.', fix: 'Typ und Wertebereich prüfen (typeof, Number.isInteger, Grenzen).' },
      { wrong: 'Fehler beim Parsen stillschweigend schlucken und Standardwerte nehmen.', why: 'Der Fehler zeigt sich erst viel später und ist nicht mehr zuzuordnen.', fix: 'Fehler an der Grenze melden, mit verständlicher Meldung und ohne persönliche Daten im Log.' },
    ],
    practice: 'Schreibe für jede Systemgrenze (Request-Body, Konfiguration, localStorage, API-Antwort) genau eine Funktion, die unknown in einen geprüften Typ verwandelt. Alles dahinter arbeitet nur mit geprüften Typen.',
    exercises: [
      { task: 'Erweitere User um das Feld email (Text mit @) und passe isUser und die Tests an.', acceptance: 'Gültige Mail wird akzeptiert; "a" und eine Zahl werden abgelehnt; alle Tests sind grün.' },
      { task: 'Grenzfall: Was liefert parseUser bei einem Objekt mit zusätzlichem Feld (z. B. admin: true)? Entscheide bewusst: ignorieren oder ablehnen, und begründe es.', acceptance: 'Das Verhalten steht in einem Test; die Begründung nennt Risiken von Massenzuweisung (Mass Assignment).' },
      { task: 'Fehlerfall: Schreibe einen absichtlich falschen Wächter (isUser gibt immer true zurück). Welche deiner Tests fangen ihn?', acceptance: 'Mindestens die Tests mit abgelehnten Eingaben schlagen fehl; du erklärst, warum der Compiler den falschen Wächter nicht erkennt.' },
    ],
    quiz: [
      { q: 'Wo liegt der wichtigste Unterschied zwischen any und unknown?',
        options: ['unknown verlangt eine Prüfung, bevor man den Wert verwendet; any nicht.', 'any ist schneller als unknown.', 'unknown kann nur Zahlen enthalten.', 'any gibt es nur in JavaScript.'],
        correct: 0,
        rationales: ['Mit unknown erzwingt der Compiler die Eingrenzung.', 'Zur Laufzeit gibt es keinen Unterschied.', 'unknown kann jeden Wert enthalten.', 'any ist ein TypeScript-Typ.'],
        explain: 'unknown ist der sichere Gegenpart zu any.' },
      { q: 'Wann ist const user = JSON.parse(text) as User gefährlich?',
        options: ['Immer, wenn der Text nicht geprüft wurde: as behauptet den Typ nur.', 'Nie, as prüft die Daten.', 'Nur bei sehr langen Texten.', 'Nur in Browsern.'],
        correct: 0,
        rationales: ['Falsche Daten laufen mit dem behaupteten Typ weiter.', 'as erzeugt keinen Laufzeitcode.', 'Die Länge spielt keine Rolle.', 'Das Problem betrifft jede Laufzeit.'],
        explain: 'as ist eine Behauptung, keine Prüfung.' },
      { q: 'Wozu dient assertNever(value: never) im default-Zweig einer switch-Anweisung?',
        options: ['Der Compiler meldet einen Fehler, wenn ein Fall vergessen wurde.', 'Es beendet das Programm immer.', 'Es erlaubt jeden Wert.', 'Es ersetzt die Prüfung der Eingaben.'],
        correct: 0,
        rationales: ['Bleibt im default ein Wert übrig, ist er nicht never und der Aufruf wird abgelehnt.', 'Es wirft nur, wenn es tatsächlich erreicht wird.', 'never nimmt gerade keinen Wert an.', 'Es ergänzt die Prüfung, ersetzt sie nicht.'],
        explain: 'So werden vergessene Fälle zu Compilerfehlern.' },
    ],
    sources: [
      handbook('Handbook: Narrowing (Type Predicates, never)', '2/narrowing.html'),
      handbook('Handbook: Everyday Types (unknown, any)', '2/everyday-types.html'),
      docs('MDN: JSON.parse', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse', 'Verhalten und Fehlerarten von JSON.parse.'),
    ],
    verification: 'Lab ts-lab: 4 Tests für boundaries.ts grün, tsc 6.0.3 bestätigt beide @ts-expect-error-Zeilen. Die Prüfung ist bewusst klein; für große Schemas und Fehlerlisten wird Zod empfohlen (js-m3-l1). Aufgabe 2 hat keine feste Lösung.',
  },
];
