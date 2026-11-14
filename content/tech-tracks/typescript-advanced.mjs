// TypeScript 6.0 · Fortgeschritten. Stichtag 14.11.2026.
// Eigene Texte; Code und Tests liegen unter content/examples/ts-lab/ (tsc 6.0.3, Node.js 22.23, node:test).
const lab = 'content/examples/ts-lab/';
const docs = (title, url, note = 'Offizielle Dokumentation; Inhalt hier eigenständig zusammengefasst.') => ({ title, url, note });
const handbook = (title, page) => docs(title, `https://www.typescriptlang.org/docs/handbook/${page}`);

export const module = {
  id: 'ts-m2', course: 'typescript', part: 28, partTitle: 'TypeScript · Typsystem von Grund auf',
  title: 'TypeScript Fortgeschritten · Generics, Union-Muster, Typ-Operatoren und Praxis',
};

export const lessons = [
  {
    id: 'ts-m2-l1', title: 'Generics: Typen als Parameter', minutes: 45,
    prerequisites: 'Modul ts-m1, besonders Objekte, Funktionen und Union-Typen.',
    objectives: [
      'Eine generische Funktion und eine generische Klasse schreiben und aufrufen',
      'Mit extends eine Einschränkung setzen und begründen, warum sie nötig ist',
      'Zwei Typparameter sinnvoll verbinden (groupBy mit Element- und Schlüsseltyp)',
      'Erkennen, wann ein Generic überflüssig ist',
    ],
    simple: `Eine Funktion wie firstOf(items) soll bei einer Liste von Zahlen eine Zahl liefern und bei einer Liste von Texten einen Text. Ohne Generics müsstest du für jede Art eine eigene Funktion schreiben oder any benutzen und dabei die Information verlieren, was drin ist. Ein Generic löst das: function firstOf<T>(items: T[]): T | undefined. Das T ist ein Platzhalter für einen Typ, den der Compiler beim Aufruf aus den Argumenten ermittelt.

Manchmal darf T nicht beliebig sein. indexById soll nur mit Dingen arbeiten, die ein id-Feld haben. Das schreibst du als Einschränkung: T extends { id: number }. Damit darfst du in der Funktion auf item.id zugreifen, und der Compiler lehnt Aufrufe ab, bei denen das Feld fehlt.

Generics gibt es auch bei Klassen und Schnittstellen. Stack<T> kann Zahlen oder Texte halten, und der Compiler achtet darauf, dass du keine Texte auf einen Zahlenstapel legst. Page<T> beschreibt eine Seite mit items: T[] und total, egal ob es Aufgaben oder Nutzer sind.

Faustregel: Ein Generic lohnt sich, wenn ein Typ aus der Eingabe in der Ausgabe wieder vorkommt. Steht T nur an einer Stelle, brauchst du meist keines.`,
    steps: [
      'firstOf<T>(items: readonly T[]): T | undefined gibt das erste Element zurück. readonly erlaubt auch schreibgeschützte Listen als Eingabe, weil die Funktion nichts ändert.',
      'Beim Aufruf firstOf(["a"]) erkennt der Compiler T = string. Du musst T nur angeben, wenn er es nicht erkennen kann, etwa bei einer leeren Liste: firstOf([] as number[]).',
      'indexById<T extends { id: number }> baut eine Map von id auf das Objekt. Ohne extends wäre item.id verboten, denn T könnte alles sein.',
      'Ein Objektliteral ohne id wird abgelehnt (TS2353). Das ist kein Zufall, sondern der Sinn der Einschränkung.',
      'groupBy<T, K extends PropertyKey> verbindet zwei Typparameter: T ist der Elementtyp, K der Schlüsseltyp, den die Funktion keyOf liefert. PropertyKey ist string | number | symbol.',
      'Im Inneren von groupBy steht ein as Record<K, T[]>. Das ist eine begründete Ausnahme: Die leere Tabelle wird sofort gefüllt, der Compiler kann das nicht nachvollziehen. Solche Stellen sollten klein und kommentiert bleiben.',
      'Stack<T = string> hat einen Standardtyp. new Stack() ist ein Stack<string>; new Stack<number>() ein Zahlenstapel. #items ist ein privates Feld im JavaScript-Sinn (läuft ohne Typen).',
      'paginate<T>(items, page, size) ist Seite 1-basiert. Seite 9 bei 5 Einträgen und Größe 2 liefert eine leere Liste, die Gesamtzahl bleibt 5. Das ist ein Grenzfall, der im Test steht.',
    ],
    background: `Wie denkt der Compiler bei Generics? Er sammelt aus den Argumenten Hinweise für T. Bei groupBy([1,2,3,4,5], n => n % 2 === 0 ? "gerade" : "ungerade") sieht er, dass die Liste number enthält (T = number) und dass keyOf einen der Texte "gerade" oder "ungerade" liefert (K = "gerade" | "ungerade"). Das Ergebnis hat deshalb genau diese beiden Schlüssel. Du schreibst keinen der Typen hin.

Warum PropertyKey statt string? Ein Objekt kann auch Zahlen und Symbole als Schlüssel haben. Mit der Einschränkung K extends PropertyKey erlaubst du alles, was als Objektschlüssel taugt, und verbietest alles andere, etwa Objekte.

Ein häufiger Irrweg ist das Generic, das nichts bindet: function log<T>(x: T): void mit nur einem Vorkommen von T ist nicht besser als function log(x: unknown): void. Der Prüfstein: Verbindet T mindestens zwei Stellen, etwa Eingabe und Ausgabe oder zwei Parameter?`,
    terms: [
      { term: 'Generic', text: 'Funktion oder Typ mit einem Typ als Parameter, z. B. Array<T>.' },
      { term: 'Typargument', text: 'Der Typ, der beim Aufruf für T eingesetzt wird.' },
      { term: 'extends (Einschränkung)', text: 'T muss mindestens die genannte Form haben.' },
      { term: 'Standardtyp', text: 'T = string: Wert, wenn kein Typargument ableitbar oder angegeben ist.' },
      { term: 'PropertyKey', text: 'string | number | symbol, also alles, was Objektschlüssel sein kann.' },
    ],
    code: { file: lab + 'src/advanced/generics.ts', lang: 'TypeScript' },
    code2: { file: lab + 'tests/generics.test.ts', lang: 'TypeScript' },
    order: ['body', 'code', 'code2', 'body2'],
    output: `node --test (generics): 4 Tests grün
 - firstOf([]) = undefined; firstOf(['a']) = 'a'
 - indexById liefert Map; get(1).t = 'a', get(3) = undefined
 - groupBy([1,2,3,4,5], gerade/ungerade) = { ungerade: [1,3,5], gerade: [2,4] }; groupBy([]) = {}
 - Stack: pop() = 2 nach push(1), push(2); leerer Stack liefert undefined
 - paginate(data, 2, 2) = ['c','d'], total 5; Seite 3 = ['e']; Seite 9 = []
tsc-Fehler hinter den @ts-expect-error-Zeilen:
 TS2353: Object literal may only specify known properties, and 'name' does not exist in type '{ id: number; }'.
 TS2345: Argument of type 'string' is not assignable to parameter of type 'number'. (Stack<number>.push('x'))`,
    mistakes: [
      { wrong: 'any statt eines Generics verwenden, damit die Funktion „für alles“ passt.', why: 'Das Ergebnis ist ebenfalls any; die Beziehung zwischen Eingabe und Ausgabe geht verloren.', fix: 'Mit T die Beziehung ausdrücken: Eingabe T[], Ausgabe T.' },
      { wrong: 'Ein Generic ohne Einschränkung benutzen und dann auf Felder zugreifen.', why: 'T kann beliebig sein; item.id ist unzulässig (TS2339).', fix: 'T extends { id: number } schreiben.' },
      { wrong: 'Typargumente überall von Hand angeben (firstOf<string>(…)).', why: 'Mehr Text, und bei Änderungen muss man mehrere Stellen anpassen.', fix: 'Inferenz nutzen; Typargumente nur angeben, wenn der Compiler sie nicht ableiten kann.' },
      { wrong: 'as an vielen Stellen im Generic, um den Compiler zu beruhigen.', why: 'Jede Behauptung ist eine unbelegte Stelle. Häufen sie sich, stimmt die Signatur nicht.', fix: 'Pro Funktion höchstens eine begründete Ausnahme mit Kommentar und Test.' },
    ],
    practice: 'Überlege bei jeder Hilfsfunktion: Kommt ein Typ der Eingabe in der Ausgabe wieder vor? Wenn ja, ist ein Generic richtig. Schreibe außerdem für jedes Generic einen Test mit mindestens zwei verschiedenen Typen.',
    exercises: [
      { task: 'Schreibe mapValues<T, U>(record: Record<string, T>, fn: (v: T) => U): Record<string, U> und teste es mit Zahlen zu Texten.', acceptance: 'Der Ergebnistyp ist Record<string, string>; ein Test zeigt { a: 1 } -> { a: "1" }; leeres Objekt ergibt leeres Objekt.' },
      { task: 'Grenzfall: Was liefert paginate(data, 0, 2) und paginate(data, 1, 0)? Entscheide, ob ungültige Seiten einen Fehler werfen sollen, und schreibe die Tests.', acceptance: 'Das Verhalten ist in Tests festgelegt (z. B. RangeError bei page < 1 oder size < 1); die Begründung nennt, warum stilles Weiterrechnen riskant ist.' },
      { task: 'Fehlerfall: Entferne in indexById die Einschränkung extends { id: number }. Welche Meldung erscheint, und wo?', acceptance: 'tsc meldet TS2339 an item.id; du erklärst, warum T ohne Einschränkung kein id-Feld garantiert.' },
    ],
    quiz: [
      { q: 'Wozu dient die Einschränkung T extends { id: number }?',
        options: ['Sie garantiert, dass T ein id-Feld hat, und erlaubt den Zugriff darauf.', 'Sie macht T zu genau dem Typ { id: number }.', 'Sie verhindert, dass T ein Objekt ist.', 'Sie schaltet die Typprüfung für T ab.'],
        correct: 0,
        rationales: ['T darf mehr Felder haben, muss aber mindestens id enthalten.', 'T darf ein Untertyp mit weiteren Feldern sein.', 'T muss im Gegenteil ein Objekt mit id sein.', 'Die Prüfung wird strenger, nicht schwächer.'],
        explain: 'extends legt eine Mindestform für T fest.' },
      { q: 'Wann ist ein Generic überflüssig?',
        options: ['Wenn der Typparameter nur an einer Stelle vorkommt und nichts verbindet.', 'Wenn die Funktion eine Liste verarbeitet.', 'Wenn die Funktion ein Ergebnis liefert.', 'Wenn der Code in einer Klasse steht.'],
        correct: 0,
        rationales: ['Dann reicht oft unknown oder ein konkreter Typ.', 'Gerade Listen sind der klassische Fall für Generics.', 'Ein Ergebnis allein sagt nichts über Generics aus.', 'Klassen können Generics gut brauchen.'],
        explain: 'Ein Generic soll mindestens zwei Stellen verbinden.' },
      { q: 'Was bedeutet class Stack<T = string>?',
        options: ['Ohne Typargument ist T ein string.', 'T muss immer string sein.', 'T wird zur Laufzeit auf string gesetzt.', 'Die Klasse speichert nur Zahlen.'],
        correct: 0,
        rationales: ['Der Standardtyp gilt, wenn T nicht angegeben wird.', 'Mit new Stack<number>() ist ein anderer Typ möglich.', 'Typen gibt es zur Laufzeit nicht.', 'Es ist ein Stapel für beliebige T, standardmäßig Texte.'],
        explain: 'Standardtypen füllen fehlende Typargumente.' },
    ],
    sources: [
      handbook('Handbook: Generics', '2/generics.html'),
      handbook('Handbook: Creating Types from Types', '2/types-from-types.html'),
    ],
    verification: 'Lab ts-lab: 4 Tests für generics.ts grün; beide @ts-expect-error-Zeilen von tsc 6.0.3 bestätigt. Aufgaben 1 und 2 sind nicht als Tests ausgeführt, nur formuliert.',
  },
  {
    id: 'ts-m2-l2', title: 'Diskriminierte Unions, vollständige Fälle und Result', minutes: 45,
    prerequisites: 'Generics (ts-m2-l1); Narrowing (ts-m1-l2).',
    objectives: [
      'Eine diskriminierte Union mit einem kind-Feld modellieren',
      'Mit switch und assertNever sicherstellen, dass kein Fall vergessen wird',
      'Einen Result-Typ statt Exceptions für erwartbare Fehler einsetzen',
      'Den Unterschied zwischen erwartbaren Fehlern und Programmierfehlern beschreiben',
    ],
    simple: `Viele Daten gibt es in mehreren Formen: Eine Form ist ein Kreis mit Radius, ein Rechteck mit Breite und Höhe, ein Quadrat mit Seitenlänge. Statt ein Objekt mit vielen optionalen Feldern zu bauen, schreibst du für jede Form einen eigenen Typ mit einem festen Kennzeichen-Feld, meistens kind. Zusammen ergeben sie eine diskriminierte Union (englisch discriminated union).

Das Kennzeichen macht Narrowing einfach: In case "circle" weiß der Compiler, dass shape.radius existiert; in case "rect" gibt es width und height. Kommt später eine weitere Form hinzu und du vergisst den case, meldet der Compiler einen Fehler im default-Zweig, wenn du dort assertNever(shape) aufrufst. Das ist ein Sicherheitsnetz, das bei großen Umbauten viel Arbeit spart.

Dasselbe Muster eignet sich für Ergebnisse. Eine Funktion, die scheitern kann, wirft nicht immer eine Exception, sondern liefert ein Result: entweder { ok: true, value } oder { ok: false, error }. Der Aufrufer muss beide Fälle behandeln, sonst lässt der Compiler ihn nicht an value heran. Das passt gut zu erwartbaren Fehlern wie „Eingabe ist keine gültige Portnummer“.

Exceptions bleiben sinnvoll für Programmierfehler und Zustände, die man nicht lokal behandeln kann (zum Beispiel „Datenbank nicht erreichbar“). Entscheide nach der Frage: Gehört der Fehler zum normalen Ablauf?`,
    steps: [
      'Shape ist eine Union aus drei Objekttypen. Das Feld kind hat in jedem Typ einen anderen Literalwert und dient als Kennzeichen.',
      'area(shape) nutzt switch (shape.kind). Im case "circle" ist shape ein { kind: "circle"; radius: number }, deshalb ist shape.radius erlaubt.',
      'Der default-Zweig ruft assertNever(shape) auf. Sind alle Fälle behandelt, ist shape dort vom Typ never und der Aufruf kompiliert. Fehlt ein Fall, schlägt tsc fehl.',
      'Zur Laufzeit wirft assertNever, falls trotz Typen doch ein unbekannter kind hereinkommt, etwa aus JSON. Der Test belegt das mit einem erzwungenen Wert.',
      'Result<T, E = string> ist ok: true mit value oder ok: false mit error. Die Hilfsfunktionen ok(...) und fail(...) vermeiden Schreibarbeit.',
      'parsePort prüft zuerst mit einem regulären Ausdruck, ob nur Ziffern vorkommen, dann den Bereich 1–65535. So sind "80a" und "" Formatfehler, 0 und 65536 Bereichsfehler.',
      'describePort zeigt die Nutzung: if (!result.ok) return …; danach ist result.value erreichbar. Ohne die Prüfung verweigert der Compiler den Zugriff (TS2339).',
      'Die Tests decken Randwerte ab: 1 und 65535 gelten, 0 und 65536 nicht; leere und nicht numerische Eingaben werden mit eigener Meldung abgelehnt.',
    ],
    background: `Warum ein eigenes Kennzeichen-Feld statt „Felder nachsehen“? Weil Felder nachsehen unscharf ist. Wenn du prüfst, ob radius existiert, könnte ein späteres Objekt radius und width haben. Ein Literal wie kind: "circle" ist eindeutig und lässt sich im Compiler zuverlässig verfolgen.

Result gegen Exceptions: Exceptions sind im Typ unsichtbar. Eine Funktion mit Rückgabetyp number kann trotzdem werfen, und der Aufrufer sieht es der Signatur nicht an. Ein Result macht den Fehlerfall zum Teil der Signatur. Der Preis ist Schreibarbeit: Jeder Aufrufer muss auspacken. Für Fehler, die zum Alltag gehören (Eingabe prüfen, Datei fehlt), lohnt sich das; für Programmierfehler nicht.

Ein Hinweis zur Laufzeit: Typen verhindern nicht, dass von außen etwas Unerwartetes ankommt. Deshalb steht in assertNever eine echte Exception. Zusammen mit der Prüfung an der Grenze (ts-m1-l4) sind beide Seiten abgedeckt: Der Compiler prüft Vollständigkeit im Code, die Laufzeit schützt vor falschen Daten.`,
    terms: [
      { term: 'Diskriminierte Union', text: 'Union aus Objekttypen mit einem gemeinsamen Literalfeld (kind), das die Form bestimmt.' },
      { term: 'Exhaustive Check', text: 'Prüfung, dass alle Fälle behandelt sind, meist mit never im default-Zweig.' },
      { term: 'Result', text: 'Ergebnistyp mit Erfolg- und Fehlerfall als Wert.' },
      { term: 'Erwartbarer Fehler', text: 'Fehler, der zum normalen Ablauf gehört, etwa ungültige Eingabe.' },
      { term: 'Programmierfehler', text: 'Fehler, der einen Bug anzeigt, etwa ein unmöglicher Zustand.' },
    ],
    code: { file: lab + 'src/advanced/results.ts', lang: 'TypeScript' },
    code2: { file: lab + 'tests/results.test.ts', lang: 'TypeScript' },
    order: ['body', 'code', 'code2', 'body2'],
    output: `node --test (results): 3 Tests grün
 - area: Rechteck 3x4 = 12, Quadrat 5 = 25, Kreis r=1 = 3.14 (gerundet)
 - area({ kind: 'triangle' } as never) wirft "Unerwarteter Wert"
 - parsePort('8080') = { ok: true, value: 8080 }
 - describePort: '1' -> Port 1, '65535' -> Port 65535, '0' und '65536' -> außerhalb, '80a' und '' -> keine Zahl
tsc-Fehler hinter den @ts-expect-error-Zeilen:
 TS2339: Property 'value' does not exist on type 'Result<number, string>'.
 TS2339: Property 'radius' does not exist on type 'Shape'.`,
    mistakes: [
      { wrong: 'Eine Form als Objekt mit vielen optionalen Feldern modellieren (radius?, width?, height?).', why: 'Unmögliche Kombinationen sind erlaubt, und jeder Zugriff braucht Prüfungen.', fix: 'Eine Union aus Typen mit kind-Kennzeichen verwenden.' },
      { wrong: 'default: return 0 im switch, statt assertNever zu nutzen.', why: 'Ein neuer Fall liefert dann still 0, und der Fehler fällt erst im Betrieb auf.', fix: 'default: return assertNever(shape).' },
      { wrong: 'Result zurückgeben und trotzdem in der Funktion werfen.', why: 'Aufrufer wissen nicht, ob sie ein Result oder eine Exception behandeln müssen.', fix: 'Entscheiden: erwartbare Fehler als Result, Programmierfehler als Exception.' },
      { wrong: 'Result.error als Text „irgendwas ist schiefgelaufen“ ohne Kontext.', why: 'Der Aufrufer kann nichts Sinnvolles damit machen, und die Fehlersuche wird mühsam.', fix: 'Verständliche Meldungen mit der betroffenen Eingabe, aber ohne persönliche Daten.' },
    ],
    practice: 'Für jede Zustandsmaschine (laden, fertig, Fehler) und jede Antwort, die mehrere Formen hat, ist eine diskriminierte Union die bessere Wahl als Flags wie isLoading und hasError. Der Compiler zeigt dir bei jedem neuen Zustand alle Stellen, die angepasst werden müssen.',
    exercises: [
      { task: 'Füge Shape den Fall { kind: "triangle"; base: number; height: number } hinzu. Was meldet tsc zuerst, und was musst du ändern?', acceptance: 'tsc meldet den Fehler im default-Zweig von area (never); nach dem neuen case und einem Test für Fläche 0,5·b·h ist alles grün.' },
      { task: 'Grenzfall: Schreibe parsePort so um, dass führende Nullen ("0080") ausdrücklich erlaubt oder abgelehnt werden. Lege das Verhalten per Test fest.', acceptance: 'Entscheidung und Begründung stehen im Test; Randwerte 1 und 65535 bleiben unverändert grün.' },
      { task: 'Fehlerfall: Schreibe ein Result<User> für parseUser aus ts-m1-l4 (statt zu werfen). Wie sieht der Aufruf mit Fehlerbehandlung aus?', acceptance: 'Der Aufrufer behandelt ok und error; ein Test zeigt eine Fehlermeldung für ungültiges JSON, ohne dass eine Exception entkommt.' },
    ],
    quiz: [
      { q: 'Wozu dient das kind-Feld in einer diskriminierten Union?',
        options: ['Es unterscheidet die Fälle eindeutig, sodass der Compiler pro Zweig den genauen Typ kennt.', 'Es verschlüsselt das Objekt, damit es nur im richtigen Zweig lesbar ist.', 'Es ist nur ein Kommentar für Lesende und hat für den Compiler keine Bedeutung.', 'Es wird zur Laufzeit automatisch gesetzt, ohne dass man es angeben muss.'],
        correct: 0,
        rationales: ['Das Literalfeld ist das Kennzeichen für Narrowing.', 'Mit Verschlüsselung hat es nichts zu tun.', 'Der Compiler wertet es aus.', 'Du setzt es selbst beim Anlegen des Objekts.'],
        explain: 'Ein gemeinsames Literalfeld macht Narrowing möglich.' },
      { q: 'Was passiert, wenn in einem switch mit assertNever im default ein Fall vergessen wurde?',
        options: ['tsc meldet einen Fehler, weil der übrige Typ nicht never ist.', 'Nichts; der Fall wird ignoriert.', 'Das Programm startet nicht.', 'Der Fall wird automatisch ergänzt.'],
        correct: 0,
        rationales: ['Der vergessene Typ bleibt übrig und passt nicht zu never.', 'Genau das soll verhindert werden.', 'Der Fehler zeigt sich beim Prüfen, nicht beim Start.', 'Der Compiler ergänzt keinen Code.'],
        explain: 'Der Exhaustive Check macht Vergessenes zum Compilerfehler.' },
      { q: 'Wann ist ein Result sinnvoller als eine Exception?',
        options: ['Bei erwartbaren Fehlern, die der Aufrufer behandeln soll.', 'Bei Bugs im eigenen Code.', 'Nur wenn Performance zählt.', 'Nie, weil Result nicht zu TypeScript passt.'],
        correct: 0,
        rationales: ['Ungültige Eingaben gehören zum normalen Ablauf.', 'Bugs sollen laut scheitern und nicht still behandelt werden.', 'Performance ist hier nicht das Argument.', 'Result lässt sich gut als Union abbilden.'],
        explain: 'Result macht Fehler in der Signatur sichtbar.' },
    ],
    sources: [
      handbook('Handbook: Narrowing (Discriminated Unions, Exhaustiveness)', '2/narrowing.html#discriminated-unions'),
      handbook('Handbook: Unions and Intersection Types', '2/everyday-types.html#union-types'),
    ],
    verification: 'Lab ts-lab: 3 Tests für results.ts grün; beide @ts-expect-error-Zeilen von tsc 6.0.3 bestätigt. Kreisfläche wurde auf zwei Nachkommastellen gerundet verglichen. Die Aufgaben sind nicht als Tests ausgeführt.',
  },
  {
    id: 'ts-m2-l3', title: 'Typen aus Typen: keyof, typeof, Utility, Mapped und Conditional Types', minutes: 50,
    prerequisites: 'Generics (ts-m2-l1); Objekte (ts-m1-l3).',
    objectives: [
      'keyof, typeof und den Indexzugriff T[K] benutzen',
      'Die Utility Types Partial, Pick, Omit, Record und Readonly sinnvoll einsetzen',
      'Einen einfachen Mapped Type und einen Conditional Type mit infer lesen und schreiben',
      'satisfies und as const einordnen und gegen eine Typ-Annotation abgrenzen',
    ],
    simple: `Oft hängt ein Typ von einem anderen ab: Die erlaubten Status-Werte stehen schon in einem Objekt, die Felder eines Formulars ergeben sich aus der Aufgabe. Wenn du sie zweimal schreibst, laufen sie auseinander. TypeScript kann Typen aus vorhandenen Typen und Werten ableiten.

Mit typeof holst du den Typ eines Werts, mit keyof die Schlüssel eines Typs als Union, mit T[K] den Typ eines Feldes. Zusammen mit as const (Werte werden zu Literalen und das Objekt schreibgeschützt) entsteht eine einzige Quelle: Das Objekt STATUS liefert zur Laufzeit die Werte und zur Prüfzeit die Typen.

Die Standardbibliothek bringt Werkzeuge mit, die Typen verändern: Partial<T> macht alle Felder optional, Pick<T, K> wählt Felder aus, Omit<T, K> lässt Felder weg, Record<K, V> baut ein Objekt aus Schlüsselmenge und Werttyp, Readonly<T> schützt alle Felder. Du kannst eigene Varianten bauen: Ein Mapped Type geht über alle Schlüssel eines Typs und baut für jeden etwas Neues, zum Beispiel eine Getter-Funktion.

Ein Conditional Type fragt: „Ist T ein Promise? Dann nimm den Inhalt, sonst T selbst.“ Mit infer holt er dabei einen Teil des Typs heraus. Und satisfies prüft, dass ein Wert zu einem Typ passt, ohne seinen genaueren Typ zu überschreiben.`,
    steps: [
      'STATUS = { open: "offen", … } as const. Dank as const hat open den Typ "offen" und nicht string; das Objekt ist readonly.',
      'keyof typeof STATUS liefert "open" | "done" | "archived". typeof STATUS[StatusKey] liefert die Werte "offen" | "erledigt" | "archiviert". So bleibt alles aus einem Objekt abgeleitet.',
      'Task["title"] ist string: ein Indexzugriff auf einen Typ, nützlich wenn ein Feldtyp an anderer Stelle gebraucht wird.',
      'TaskDraft = Pick<Task, "title" | "dueDate"> und TaskSummary = Omit<Task, "done"> zeigen Auswahl und Ausschluss. TaskUpdate = Partial<Pick<Task, "title" | "done">> verbindet beides.',
      'Getters<T> ist ein Mapped Type: { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] }. Er baut aus title und done die Funktionen getTitle und getDone.',
      'Awaited2<T> = T extends Promise<infer U> ? U : T ist ein Conditional Type. Awaited2<Promise<number>> ist number. Die Standardbibliothek bringt dafür Awaited<T> mit.',
      'labels nutzt as const satisfies Labels: Der Compiler prüft, dass alle Schlüssel vorhanden sind (sonst TS1360), und behält die genauen Texte. Mit ": Labels" statt satisfies wäre labels.open nur ein string. Beim ersten Versuch ohne as const meldete tsc genau das als Fehler.',
      'EventName = `task:${StatusKey}` ist ein Template-Literal-Typ: "task:open" | "task:done" | "task:archived". Tippfehler wie "task:erledigt" werden abgelehnt.',
    ],
    background: `Warum so viel Typ-Akrobatik? Weil jede Doppelung ein Risiko ist. Wenn die Status-Werte in einem Objekt, in einem Typ und in einer Auswahlliste stehen, vergisst jemand irgendwann eine der drei Stellen. Wer den Typ aus dem Wert ableitet, hat nur eine.

Der Preis ist Lesbarkeit. Schwer lesbare Typen sind ein Wartungsproblem; ein Kollege, der drei Zeilen Conditional Types nicht versteht, wird sie umgehen oder abschalten. Gute Regel: Typen so einfach wie möglich, aber nicht einfacher. Nutze Utility Types freizügig, schreibe eigene Mapped und Conditional Types selten und mit Kommentar und Test.

as const und satisfies lösen ein typisches Dilemma: Du willst prüfen, dass ein Objekt vollständig ist, aber nicht seine genauen Werte verlieren. Eine Annotation (const labels: Labels = …) prüft und verwirft die Details; satisfies prüft und behält sie. Für Literale braucht es zusätzlich as const. Das ist eine Stelle, an der sich Vermutungen schnell als falsch herausstellen: Hier hat erst der Compiler im Lab gezeigt, dass satisfies allein die Literale nicht festhält.`,
    terms: [
      { term: 'keyof T', text: 'Union der Schlüssel von T.' },
      { term: 'typeof wert', text: 'Der Typ eines Werts (im Typ-Kontext).' },
      { term: 'Utility Type', text: 'Vorgefertigter Typ-Transformer wie Partial, Pick, Omit, Record.' },
      { term: 'Mapped Type', text: 'Typ, der über alle Schlüssel eines anderen Typs läuft und daraus Neues baut.' },
      { term: 'Conditional Type', text: 'T extends U ? X : Y, mit infer als Entnahme eines Teils.' },
      { term: 'satisfies', text: 'Prüft einen Wert gegen einen Typ, ohne dessen genaueren Typ zu ersetzen.' },
    ],
    code: { file: lab + 'src/advanced/typeops.ts', lang: 'TypeScript' },
    code2: { file: lab + 'tests/typeops.test.ts', lang: 'TypeScript' },
    order: ['body', 'code', 'code2', 'body2'],
    output: `node --test (typeops): 2 Tests grün
 - Object.keys(STATUS) = ['open', 'done', 'archived']; labelFor('done') = 'Fertig'
 - openLabel = 'Offen'; evt = 'task:done'
 - TaskGetters und Unwrapped werden als Zuweisungen geprüft (getters.getTitle() = 'x', unwrapped = 42)
tsc-Fehler hinter den @ts-expect-error-Zeilen:
 TS2322: Type '"gelöscht"' is not assignable to type 'StatusLabel'.
 TS2561: Object literal may only specify known properties, but 'titel' does not exist in type 'TaskDraft'. Did you mean to write 'title'?
 TS1360: Type '{ open: string; }' does not satisfy the expected type 'Labels'.
Ohne as const meldete tsc bei openLabel: TS2322 Type 'string' is not assignable to type '"Offen"'.`,
    mistakes: [
      { wrong: 'Dieselben Werte als Typ und als Objekt doppelt schreiben.', why: 'Eine Seite wird irgendwann vergessen.', fix: 'Ein Objekt mit as const und die Typen mit keyof typeof / T[K] ableiten.' },
      { wrong: 'Bei Omit<T, "schluessel"> anzunehmen, ein Tippfehler im Schlüssel würde gemeldet.', why: 'Omit akzeptiert beliebige Schlüssel: Aus Omit<Task, "tilte"> wird kein Fehler, und es fällt auch nichts weg. Pick dagegen lehnt unbekannte Schlüssel ab.', fix: 'Pick bevorzugen oder ein eigenes StrictOmit<T, K extends keyof T> = Omit<T, K> verwenden, damit der Compiler Tippfehler meldet.' },
      { wrong: 'Zu komplexe Conditional Types in Anwendungscode.', why: 'Kaum jemand versteht sie, und Fehlermeldungen werden unlesbar.', fix: 'Kleinere Bausteine benennen und Utility Types der Standardbibliothek nutzen.' },
      { wrong: 'Mit satisfies allein zu erwarten, dass Zeichenketten als Literaltypen erhalten bleiben.', why: 'Ohne as const wird der Wert zu string erweitert, wenn der Zieltyp string verlangt; der Wert hat dann nur noch den Typ string statt des genauen Literals.', fix: 'as const satisfies Typ schreiben und mit einer Zuweisung auf den Literaltyp testen.' },
    ],
    practice: 'Leite Typen immer aus der Quelle ab, die zur Laufzeit existiert (Objekt, Schema, Konstanten). Nutze eigene Mapped und Conditional Types nur, wenn ein Utility Type nicht reicht, und schreibe daneben einen kleinen Beispiel-Typ als Kommentar.',
    exercises: [
      { task: 'Ergänze STATUS um den Wert "deleted: gelöscht". Welche Stellen musst du in typeops.ts anpassen, und was meldet tsc, wenn du labels nicht ergänzt?', acceptance: 'tsc meldet TS1360 an labels; nach dem Ergänzen sind Test und tsc grün. Du erkennst, dass StatusKey und EventName automatisch mitwachsen.' },
      { task: 'Grenzfall: Schreibe Nullable<T> = { [K in keyof T]: T[K] | null } und wende es auf Task an. Was passiert mit optionalen Feldern?', acceptance: 'Du beschreibst, dass optionale Felder optional bleiben (Mapped Types über keyof erhalten Modifikatoren) und prüfst es mit einer Zuweisung.' },
      { task: 'Fehlerfall: Ändere Labels zu Record<string, string> und prüfe, ob der Fehler „fehlender Schlüssel“ noch auftritt. Was bedeutet das für die Sicherheit?', acceptance: 'tsc meldet keinen Fehler mehr für fehlende Schlüssel; du erklärst, dass breite Schlüsseltypen Vollständigkeit nicht mehr prüfen.' },
    ],
    quiz: [
      { q: 'Wofür steht keyof typeof STATUS bei const STATUS = { open: "offen", done: "erledigt" } as const?',
        options: ['"open" | "done"', '"offen" | "erledigt"', 'string', 'number'],
        correct: 0,
        rationales: ['keyof liefert die Schlüssel des Typs von STATUS.', 'Das wären die Werte, nicht die Schlüssel.', 'Dank as const sind die Schlüssel Literale.', 'Schlüssel sind hier Texte.'],
        explain: 'typeof holt den Typ des Objekts, keyof dessen Schlüssel.' },
      { q: 'Was unterscheidet const labels: Labels = {…} von {…} satisfies Labels?',
        options: ['Mit satisfies bleibt der genauere Typ erhalten; die Annotation ersetzt ihn durch Labels.', 'satisfies ändert den Wert zur Laufzeit und wandelt ihn in den Typ Labels um.', 'Die Annotation ist strenger, weil sie zusätzlich Laufzeitprüfungen einbaut.', 'Es gibt keinen Unterschied, beide Schreibweisen liefern denselben Typ.'],
        correct: 0,
        rationales: ['satisfies prüft, ohne zu verbreitern.', 'Beides sind reine Typprüfungen.', 'Beide prüfen die Vollständigkeit; der Unterschied liegt im Ergebnistyp.', 'Der Ergebnistyp unterscheidet sich.'],
        explain: 'satisfies prüft, ohne den genaueren Typ zu verlieren.' },
      { q: 'Was liefert Omit<Task, "done">?',
        options: ['Task ohne das Feld done.', 'Nur das Feld done.', 'Alle Felder optional.', 'Alle Felder readonly.'],
        correct: 0,
        rationales: ['Omit lässt die genannten Schlüssel weg.', 'Das wäre Pick<Task, "done">.', 'Das ist Partial.', 'Das ist Readonly.'],
        explain: 'Omit entfernt Felder aus einem Typ.' },
    ],
    sources: [
      handbook('Handbook: Creating Types from Types', '2/types-from-types.html'),
      docs('Handbook: Utility Types', 'https://www.typescriptlang.org/docs/handbook/utility-types.html', 'Liste der eingebauten Typ-Werkzeuge mit Beispielen.'),
      handbook('Handbook: Mapped Types', '2/mapped-types.html'),
      handbook('Handbook: Conditional Types', '2/conditional-types.html'),
    ],
    verification: 'Lab ts-lab: 2 Tests für typeops.ts grün; drei @ts-expect-error-Zeilen von tsc 6.0.3 bestätigt. Die Fehlermeldung ohne as const wurde beim Aufbau des Labs beobachtet. Typen sind nur durch Zuweisungen und tsc geprüft, nicht zur Laufzeit. Aufgabe 2 (Mapped Types und Modifikatoren) ist beschrieben, aber nicht im Lab ausgeführt.',
  },
  {
    id: 'ts-m2-l4', title: 'Praxis: enum-Ersatz, Overloads, Branded Types und Projektregeln', minutes: 50,
    prerequisites: 'Modul ts-m1 und ts-m2-l1 bis l3; Node-Grundlagen (node-m1-l1) hilfreich.',
    objectives: [
      'Begründen, warum ein const-Objekt mit abgeleitetem Typ oft besser als enum ist (erasableSyntaxOnly)',
      'Funktions-Overloads schreiben und ihre Grenzen nennen',
      'Mit Branded Types Verwechslungen (Cent/Euro) zur Prüfzeit verhindern',
      'Die Optionen verbatimModuleSyntax und erasableSyntaxOnly sowie import type erklären',
    ],
    simple: `Im Alltag stolperst du weniger über die großen Typtricks als über Kleinigkeiten: Wie bilde ich Status-Werte ab? Wie importiere ich Typen? Warum meckert Node über meine Datei? Diese Lektion sammelt die Praxisfragen.

enum ist die Erfindung von TypeScript für benannte Konstanten. Es erzeugt Laufzeitcode, und damit passt es nicht zum Type-Stripping von Node.js, das nur Typen entfernt: Ein enum löst dort einen Fehler aus (ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX). Die Option erasableSyntaxOnly lässt tsc dieselbe Sprache prüfen und lehnt enum, Namespaces mit Code und Parameter-Properties schon beim Prüfen ab (TS1294). Der Ersatz: ein const-Objekt mit as const und ein Typ, der daraus abgeleitet wird. Wert und Typ dürfen denselben Namen tragen.

Overloads erlauben mehrere Signaturen für eine Funktion, zum Beispiel toList(text) und toList(liste). Es gibt eine Implementierung, die alle Fälle abdeckt. Sie sind nützlich, wenn der Rückgabetyp vom Eingabetyp abhängt, werden aber schnell unübersichtlich; oft sind Union-Parameter oder zwei getrennte Funktionen klarer.

Ein Branded Type markiert eine Zahl als „Cent“ oder „Euro“, obwohl beides zur Laufzeit eine Zahl ist. Der Compiler verhindert so, dass du Cent in eine Euro-Funktion steckst. Und schließlich: as und ! sind Lügen gegenüber dem Compiler. Wo möglich, prüfe lieber.`,
    steps: [
      'Role = { admin: "admin", … } as const; type Role = (typeof Role)[keyof typeof Role]. Der Wert (Objekt) und der Typ (Union) heißen gleich; TypeScript unterscheidet beide Namensräume.',
      'canWrite(role: Role) akzeptiert Role.admin und den Literal "viewer", aber keinen beliebigen string (TS2345). Das ist die Schutzwirkung eines Enums, ohne Laufzeitcode.',
      'Mit erasableSyntaxOnly sind enum, namespace mit Code und Parameter-Properties verboten (TS1294). Node.js im Type-Stripping-Modus meldet für enum: „TypeScript enum is not supported in strip-only mode“.',
      'toList hat zwei Overload-Signaturen und eine Implementierung. Aufrufer sehen nur die Signaturen; toList(42) liefert TS2769 („No overload matches this call“).',
      'Cents und Euros sind Branded Types: number & { readonly [brand]: "Cents" }. Das Symbol brand wird nur im Typ deklariert (declare const), es gibt zur Laufzeit nichts.',
      'cents(value) prüft ganze Zahlen und vergibt die Marke mit einem einzigen as. toEuros(euros) wird abgelehnt: ein Euros-Wert ist kein Cents-Wert (TS2345).',
      'firstWord zeigt die Alternative zu !: Statt match![0] wird der Fall null behandelt und eine leere Zeichenkette geliefert.',
      'verbatimModuleSyntax verlangt import type { Task } für reine Typ-Importe (TS1484). Zur Laufzeit würde ohne type ein Import stehen bleiben, den es nicht gibt; Node meldet: „does not provide an export named ‘Task’“.',
    ],
    background: `Warum erasableSyntaxOnly? TypeScript wurde ursprünglich als Obermenge von JavaScript gebaut und hat Konstrukte, die Code erzeugen müssen (enum, namespace). Das passt nicht zu Werkzeugen, die Typen nur entfernen, wie Node.js (seit 22.18 ohne Schalter) oder Browser-Vorschläge für Typen als Kommentare. Die Option hält dich auf dem Teil der Sprache, der überall läuft.

Branded Types sind ein Muster, kein Sprachfeature. Der Compiler sieht eine Schnittmenge aus number und einem Objekt mit geheimem Schlüssel. Niemand kann so ein Objekt zufällig bauen; ein Wert bekommt die Marke nur durch deine Fabrikfunktion. Die Sicherheit steht und fällt damit, dass die Fabrik prüft und niemand außerhalb mit as die Marke vergibt.

Zur tsconfig.json in TypeScript 6.0: Die Vorlage von tsc --init ist deutlich strenger und moderner als früher (module nodenext, strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, verbatimModuleSyntax). types ist leer, wenn nichts angegeben ist; für Node-Code ergänzt du "types": ["node"]. Veraltete Optionen wie moduleResolution node10 melden Fehler (TS5107) und fallen in TypeScript 7.0 weg.`,
    terms: [
      { term: 'erasableSyntaxOnly', text: 'tsc lehnt Syntax ab, die beim bloßen Entfernen der Typen Code zurückließe (enum, Parameter-Properties, Namespaces mit Code).' },
      { term: 'Overload', text: 'Mehrere Signaturen für eine Funktion mit einer gemeinsamen Implementierung.' },
      { term: 'Branded Type', text: 'Typ mit unsichtbarer Marke, der gleiche Laufzeitwerte unterscheidet.' },
      { term: 'import type', text: 'Import, der nur für Typen gilt und beim Entfernen der Typen verschwindet.' },
      { term: 'verbatimModuleSyntax', text: 'Importe und Exporte bleiben genau so stehen, wie sie geschrieben sind; Typ-Importe müssen markiert sein.' },
    ],
    code: { file: lab + 'src/advanced/practice.ts', lang: 'TypeScript' },
    code2: { file: lab + 'tests/practice.test.ts', lang: 'TypeScript' },
    order: ['body', 'code', 'code2', 'body2'],
    output: `node --test (practice): 4 Tests grün
 - canWrite(Role.admin) = true; canWrite('viewer') = false
 - toList('a, b,,c') = ['a','b','c']; toList(['x']) = ['x']; toList('') = []
 - toEuros(cents(1250)) = 12.5; cents(12.5) wirft RangeError
 - firstWord('  Hallo Welt') = 'Hallo'; firstWord('   ') = ''
tsc-Fehler hinter den @ts-expect-error-Zeilen:
 TS2345: Argument of type 'Euros' is not assignable to parameter of type 'Cents'.
 TS2345: Argument of type 'string' is not assignable to parameter of type 'Role'.
 TS2769: No overload matches this call.
Beobachtet mit tsc 6.0.3 und Node 22.23 in einer Wegwerf-Datei (nicht im Lab):
 enum -> TS1294 (erasableSyntaxOnly); Node: ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX "TypeScript enum is not supported in strip-only mode"
 import { Task } statt import type -> TS1484; Node: "does not provide an export named 'Task'"
 moduleResolution node -> TS5107 (veraltet, fällt in TypeScript 7.0 weg)`,
    mistakes: [
      { wrong: 'enum in Code verwenden, der in Node.js oder einem Strip-Only-Werkzeug laufen soll.', why: 'enum erzeugt Laufzeitcode und wird beim bloßen Entfernen der Typen nicht unterstützt.', fix: 'const-Objekt mit as const und abgeleitetem Typ; erasableSyntaxOnly in der tsconfig.json aktivieren.' },
      { wrong: 'import { Task } from "./types.ts" für ein reines Interface.', why: 'Zur Laufzeit existiert Task nicht; der Import bricht mit einem SyntaxError.', fix: 'import type { Task } verwenden; verbatimModuleSyntax erzwingt das beim Prüfen.' },
      { wrong: 'Branded Types überall mit as erzeugen.', why: 'Dann schützt die Marke nichts mehr.', fix: 'Eine Fabrikfunktion mit Prüfung, nur sie darf as verwenden.' },
      { wrong: 'Mit ! sagen „ist nie null“, ohne zu prüfen.', why: 'Der Compiler glaubt es, und der Fehler zeigt sich erst im Betrieb (TypeError).', fix: 'Den Fall behandeln, einen Standardwert nutzen oder früh mit klarer Meldung abbrechen.' },
    ],
    practice: 'Lege für neue Projekte eine tsconfig.json aus der Vorlage von TypeScript 6 an, ergänze erasableSyntaxOnly, wenn du Node.js direkt ausführst, und lasse tsc --noEmit als Pflichtschritt in der Pipeline laufen. Führe in Code-Reviews eine Liste: jedes as, jedes ! und jedes any braucht einen Kommentar.',
    exercises: [
      { task: 'Ersetze in einem eigenen Beispiel ein enum Direction { Up, Down } durch ein const-Objekt mit abgeleitetem Typ und teste, dass es unter node läuft.', acceptance: 'tsc --noEmit mit erasableSyntaxOnly und node datei.ts laufen ohne Fehler; die Direction-Werte sind nur noch Literale.' },
      { task: 'Grenzfall: Was passiert bei cents(-5) und cents(Number.MAX_SAFE_INTEGER + 1)? Entscheide, ob negative Beträge erlaubt sind, und lege das per Test fest.', acceptance: 'Das Verhalten ist in Tests dokumentiert; die Begründung nennt Sonderfälle wie Rückerstattungen und die sichere Ganzzahlgrenze.' },
      { task: 'Fehlerfall: Importiere Task ohne type in einer .ts-Datei und führe sie mit node aus. Notiere die Fehlermeldung und behebe sie.', acceptance: 'Node meldet, dass der Export nicht existiert; mit import type läuft die Datei, und tsc meldet mit verbatimModuleSyntax TS1484 schon vorher.' },
    ],
    quiz: [
      { q: 'Warum passt enum schlecht zu Node.js im Type-Stripping-Modus?',
        options: ['enum erzeugt Laufzeitcode, den Node beim bloßen Entfernen der Typen nicht kennt.', 'enum ist langsamer als Strings.', 'Node unterstützt nur Zahlen.', 'enum gibt es nur in Browsern.'],
        correct: 0,
        rationales: ['Type-Stripping entfernt nur Typen; ein enum ist keine reine Typangabe.', 'Geschwindigkeit ist nicht das Problem.', 'Node kennt Strings und Zahlen, nur kein enum in diesem Modus.', 'enum gehört zu TypeScript, nicht zu Browsern.'],
        explain: 'Strip-only Modus kann nur reine Typsyntax entfernen.' },
      { q: 'Wozu dient ein Branded Type wie Cents = number & { readonly [brand]: "Cents" }?',
        options: ['Er verhindert zur Prüfzeit, dass Cent- und Euro-Zahlen vertauscht werden.', 'Er speichert zur Laufzeit zusätzliche Daten.', 'Er macht Zahlen genauer.', 'Er verhindert Division durch null.'],
        correct: 0,
        rationales: ['Die Marke existiert nur im Typ und unterscheidet gleiche Laufzeitwerte.', 'Zur Laufzeit ist es einfach eine Zahl.', 'Die Genauigkeit der Zahl bleibt gleich.', 'Das ist eine andere Art von Prüfung.'],
        explain: 'Branded Types sind eine reine Prüfzeit-Unterscheidung.' },
      { q: 'Was verlangt verbatimModuleSyntax bei Typ-Importen?',
        options: ['import type { … }, damit der Import beim Entfernen der Typen verschwindet.', 'Dass alle Importe als require geschrieben werden.', 'Dass Typen nie importiert werden dürfen.', 'Dass jede Datei die Endung .js hat.'],
        correct: 0,
        rationales: ['Ohne type bliebe ein Import stehen, den es zur Laufzeit nicht gibt.', 'require ist die CommonJS-Variante, hier nicht gemeint.', 'Typen dürfen importiert werden, nur markiert.', 'Die Endung steht nicht im Zusammenhang.'],
        explain: 'Typ-Importe müssen markiert sein, damit sie rückstandslos verschwinden.' },
    ],
    sources: [
      docs('TSConfig: erasableSyntaxOnly', 'https://www.typescriptlang.org/tsconfig/#erasableSyntaxOnly', 'Erklärt, welche Syntax verboten wird und warum.'),
      docs('TSConfig: verbatimModuleSyntax', 'https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax', 'Erklärt Typ-Importe und Modulausgabe.'),
      docs('Node.js: Running TypeScript Natively', 'https://nodejs.org/api/typescript.html', 'Welche Syntax Node.js beim Entfernen der Typen nicht unterstützt.'),
      handbook('Handbook: More on Functions (Overloads)', '2/functions.html#function-overloads'),
      docs('Announcing TypeScript 6.0 (Microsoft DevBlogs)', 'https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/', 'Neue Standardwerte, veraltete Optionen und Ausblick auf 7.0.'),
    ],
    verification: 'Lab ts-lab: 4 Tests für practice.ts grün; drei @ts-expect-error-Zeilen von tsc 6.0.3 bestätigt. Die Fehler für enum (TS1294, ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX), import ohne type (TS1484, Node-SyntaxError) und moduleResolution node (TS5107) wurden mit tsc 6.0.3 und Node 22.23 in Wegwerf-Dateien beobachtet, nicht im Lab. Das Verhalten von Node 24 und 26 wurde nicht geprüft.',
  },
];
