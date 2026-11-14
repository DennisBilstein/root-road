// HTML & CSS · CSS Vertiefung. Stichtag 14.11.2026.
// Eigene Texte; Code und Tests liegen unter content/examples/html-css-lab/vertiefung/ und tests/html-css-vertiefung.spec.mjs
// (Playwright 1.65.0 mit Chromium 158.0.8127.18; Firefox und Safari wurden nicht getestet).
const lab = 'content/examples/html-css-lab/vertiefung/';
const mdn = (title, path, note = 'Referenz; Inhalt hier eigenständig zusammengefasst.') => ({ title: `MDN: ${title}`, url: `https://developer.mozilla.org/en-US/docs/${path}`, note });
const wcag = (title, page) => ({ title: `WCAG 2.2 verstehen: ${title}`, url: `https://www.w3.org/WAI/WCAG22/Understanding/${page}.html`, note: 'W3C-Erläuterung zum Erfolgskriterium; Inhalt hier eigenständig zusammengefasst.' });

export const module = {
  id: 'css-m2', course: 'htmlcss', part: 24, partTitle: 'HTML & CSS · Webfundament',
  title: 'CSS Vertiefung · Tokens, Kaskade, Container Queries, Bewegung und Projekt',
};

export const lessons = [
  {
    id: 'css-m2-l1', title: 'Designtokens, custom properties und Dunkelmodus', minutes: 35,
    prerequisites: 'Modul „CSS · Gestaltung und responsive Layouts“, besonders Selektoren, Kaskade, Farben und Fokus.',
    objectives: [
      'Farben und Abstände als custom properties in Rohwerte, Rollen und Komponenten gliedern',
      'Mit color-scheme und light-dark() einen Dunkelmodus ohne doppelte Regeln bauen',
      'Das Systemverhalten per data-theme-Attribut bewusst überschreiben',
      'Kontrastverhältnisse der Rollen in beiden Modi prüfen und erzwungene Farben berücksichtigen',
    ],
    simple: `Wenn Farben als Hexwerte quer über die Stylesheets verstreut sind, wird jede Änderung zur Suche: Welches Blau ist der Link, welches der Button? Designtokens lösen das, indem sie jedem Wert einen Namen geben. In CSS heißen solche benannten Werte custom properties; sie beginnen mit zwei Bindestrichen (--accent) und werden mit var(--accent) gelesen. Sie werden vererbt wie normale Eigenschaften und lassen sich überall überschreiben.

Sinnvoll ist eine Gliederung in drei Stufen. Auf der ersten stehen Rohwerte wie --blue-700: #174d9e, nichts anderes als Farben der Palette. Auf der zweiten stehen Rollen wie --accent oder --text, die sagen, wofür eine Farbe da ist. Auf der dritten benutzen Komponenten nur noch Rollen. Willst du das Design ändern, tauschst du die Zuordnung der Rollen, nicht die Komponenten.

Der Dunkelmodus ergibt sich dann fast von selbst: Mit color-scheme: light dark erklärst du, dass die Seite beide Modi kann, und die Funktion light-dark(hell, dunkel) liefert je nach Modus den einen oder anderen Wert. Der Browser wählt nach der Systemeinstellung (prefers-color-scheme), und ein Attribut am Wurzelelement kann die Wahl überschreiben.`,
    steps: [
      'Öffne tokens.css. Im ersten Block stehen nur Rohwerte: Blau 700 und 300, Tinte, Papier, Seitenhintergründe, zwei Linienfarben. Nur hier stehen Hexcodes; der Test prüft, dass nach dem Rollenblock kein Farbcode mehr vorkommt.',
      'Im zweiten Block stehen Rollen: --text, --page, --surface, --accent, --border. Jede ist ein light-dark()-Aufruf mit zwei Rohwerten. Dazu kommen Abstände (--space-1 bis --space-3), Radius und die Zielgröße --target: 2.75rem.',
      'color-scheme: light dark am Wurzelelement hat zwei Wirkungen: light-dark() kann entscheiden, und der Browser stellt eigene Elemente (Bildlaufleisten, Formularfelder, Standardhintergrund) passend dar. Ohne diese Zeile liefert light-dark() immer den hellen Wert.',
      'Die Regeln :root[data-theme="light"] und :root[data-theme="dark"] setzen color-scheme fest. Ein Schalter in der Seite setzt das Attribut per JavaScript; entfernt man es, gilt wieder die Systemeinstellung. Der Test prüft: Mit Systemmodus hell und data-theme="dark" ist der Hintergrund dunkel, und umgekehrt.',
      'Die Komponenten (.card, .button, a) benutzen nur var(--…). Der Button hat als Text die Rolle --surface auf dem Hintergrund --accent: im hellen Modus weiß auf dunklem Blau, im dunklen dunkel auf hellem Blau.',
      'Prüfe die Kontraste. Der Test berechnet in beiden Modi aus den berechneten Farben: Text auf Fläche, Link auf Fläche und Buttontext auf Buttonfläche je mindestens 4,5:1 sowie den Kartenrand gegen den Seitenhintergrund mindestens 3:1 (Nicht-Text-Kontrast, WCAG 1.4.11).',
      'Der Block @media (forced-colors: active) setzt Systemfarben (ButtonText, CanvasText) für Ränder. Im Kontrastmodus von Windows ersetzt der Browser viele Farben selbst; Elemente, die sich nur über Hintergrundfarbe abgrenzen, würden sonst verschwinden. Dieser Block wurde nicht in einem echten Kontrastmodus getestet.',
    ],
    background: `Warum drei Stufen statt direkt Rollen? Rohwerte sind Fakten der Marke (die Palette), Rollen sind Entscheidungen (wofür sie dient), Komponenten sind Anwendungen. Trennst du sie, kannst du die Palette ändern, ohne Komponenten anzufassen, und im Dunkelmodus Rollen neu zuordnen, ohne Palette und Komponenten zu ändern. Ein typischer Fehler ist, im Dunkelmodus nur Hellwerte „umzudrehen“: Reines Weiß auf Tiefschwarz blendet, und Ränder, die im hellen Modus gerade 3:1 erreichen, fallen im dunklen oft darunter. Darum prüft das Lab beide Modi.

Zur Verfügbarkeit: Für light-dark() führt MDN den Stand „Baseline 2024, neu verfügbar“ (seit Mai 2024 in allen Kernbrowsern). Wer ältere Browser unterstützen muss, schreibt einen Rückfallwert und eine Medienabfrage mit prefers-color-scheme. Prüfe die aktuelle Verfügbarkeit auf der MDN-Seite, denn sie ändert sich. Dieses Lab wurde nur in Chromium getestet.`,
    terms: [
      { term: 'custom property', text: 'Benannter Wert, der mit --name definiert und mit var(--name) gelesen wird; er wird vererbt.' },
      { term: 'Designtoken', text: 'Benannter Gestaltungswert (Farbe, Abstand, Radius), der an einer Stelle gepflegt wird.' },
      { term: 'color-scheme', text: 'Erklärt, welche Farbschemata die Seite unterstützt; steuert light-dark() und Browserelemente.' },
      { term: 'forced-colors', text: 'Medienabfrage für den Kontrastmodus, in dem der Browser Farben durch Systemfarben ersetzt.' },
    ],
    code: { file: lab + 'tokens.css', lang: 'CSS', from: '/* 2. Rollen', to: '--target: 2.75rem;', back: 0, plus: 1 },
    code2: { file: lab + 'tokens.css', lang: 'CSS', from: '/* Manuelle Wahl', to: '.button:focus-visible, a:focus-visible' },
    code3: { file: 'tests/html-css-vertiefung.spec.mjs', lang: 'JavaScript', from: "test('data-theme überschreibt die Systemeinstellung'", to: "expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(244, 246, 250)');", plus: 1 },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: `Playwright 1.65.0, Chromium 158.0.8127.18, 4 Tests für Tokens grün:
hell : Text/Fläche, Link/Fläche, Buttontext/-fläche >= 4,5:1; Kartenrand/Seite >= 3:1
dunkel: dieselben Rollen erfüllen dieselben Schwellen
Systemmodus hell + data-theme="dark" -> Hintergrund rgb(15, 24, 38)
Systemmodus dunkel + data-theme="light" -> Hintergrund rgb(244, 246, 250)
Hexcodes stehen nur im Rohwert-Block
Nicht getestet: echter Windows-Kontrastmodus, Firefox, Safari, Druckausgabe, Farbsehschwächen-Simulation.`,
    mistakes: [
      { wrong: 'Farbcodes direkt in Komponenten zu schreiben, weil es schneller geht.', why: 'Jede Designänderung und jeder Dunkelmodus verlangt dann Änderungen an vielen Stellen; Kontraste werden nicht zentral geprüft.', fix: 'Komponenten nur über Rollen (var(--text), var(--accent)) einfärben.' },
      { wrong: 'light-dark() zu benutzen, aber color-scheme nicht zu setzen.', why: 'Ohne color-scheme entscheidet die Funktion nie für Dunkel und liefert immer den hellen Wert.', fix: 'color-scheme: light dark am Wurzelelement setzen.' },
      { wrong: 'Den Dunkelmodus durch invertierte Hellwerte zu bauen und nur im hellen Modus zu prüfen.', why: 'Kontraste und Ränder können im Dunkelmodus unter die Mindestwerte fallen; reines Weiß auf Schwarz blendet.', fix: 'Dunkelwerte bewusst wählen und beide Modi mit denselben Kontrasttests prüfen.' },
      { wrong: 'Die Systemeinstellung per Skript zu ignorieren und ohne Rückweg nur „dunkel“ oder „hell“ festzuschreiben.', why: 'Menschen mit Lichtempfindlichkeit oder Blendung verlieren ihre Systemwahl.', fix: 'Standard folgt dem System; ein Schalter setzt data-theme und lässt sich auf „System“ zurückstellen.' },
    ],
    practice: 'Übertrage das Farbsystem einer eigenen Seite in drei Token-Stufen, setze color-scheme und light-dark() ein und schreibe einen Test, der in beiden Modi die Kontraste deiner Rollen berechnet. Dokumentiere die Rollen in einer Tabelle (Rolle, Hell, Dunkel, Kontrast).',
    exercises: [
      { task: 'Füge eine Rolle --danger hinzu (Fehlermeldung) mit je einem Rohwert für Hell und Dunkel und prüfe sie gegen --surface.', acceptance: 'In beiden Modi mindestens 4,5:1 für Text auf der Fläche; die Rohwerte stehen nur im ersten Block; ein Test belegt es.' },
      { task: 'Grenzfall: Setze die Rolle --border im hellen Modus auf einen Wert, der gegen --page knapp unter 3:1 liegt, und lass den Test laufen.', acceptance: 'Der Test schlägt fehl und nennt den Wert; du korrigierst die Farbe und erklärst den Unterschied zwischen Text-Kontrast (4,5:1) und Nicht-Text-Kontrast (3:1).' },
      { task: 'Fehlerfall: Entferne color-scheme: light dark und gib das Ergebnis im Dunkelmodus des Systems aus.', acceptance: 'light-dark() liefert immer den hellen Wert und die Seite bleibt hell; du stellst color-scheme wieder her und beschreibst, was zusätzlich bei Bildlaufleisten und Formularfeldern passiert.' },
    ],
    quiz: [
      { q: 'Wozu dient color-scheme: light dark am Wurzelelement?',
        options: ['Es schaltet den Dunkelmodus unabhängig vom System dauerhaft ein.', 'Es erklärt, dass beide Modi möglich sind, und aktiviert light-dark().', 'Es lädt automatisch ein zweites Stylesheet für den Dunkelmodus.', 'Es verändert nur die Farbe des Textes, nicht die der Flächen.'],
        correct: 1,
        rationales: ['Dauerhaft dunkel wäre color-scheme: dark.', 'Damit kann light-dark() entscheiden, und der Browser färbt eigene Elemente passend.', 'Es wird nichts nachgeladen.', 'Es wirkt auch auf Hintergründe und Formularelemente des Browsers.'],
        explain: 'color-scheme teilt dem Browser mit, welche Schemata die Seite unterstützt; ohne die Angabe entscheidet light-dark() nie für Dunkel.' },
      { q: 'Warum sollten Komponenten nur Rollen (--text, --accent) und keine Rohwerte (--blue-700) benutzen?',
        options: ['Damit die Datei möglichst viele Zeilen enthält.', 'Weil Rohwerte im Browser nicht gelesen werden können.', 'Weil var() mit Rohwerten langsamer ist als mit Rollen.', 'Weil sich Design und Dunkelmodus dann an einer Stelle ändern lassen.'],
        correct: 3,
        rationales: ['Das ist kein Ziel.', 'Rohwerte sind normale custom properties und lesbar.', 'Es gibt keinen Unterschied in der Geschwindigkeit.', 'Rollen entkoppeln Komponenten von der Palette und vom Modus.'],
        explain: 'Rollen beschreiben die Verwendung; wird die Zuordnung geändert, folgen alle Komponenten automatisch.' },
      { q: 'Welches Kontrastverhältnis soll ein Kartenrand gegen den Seitenhintergrund nach WCAG 1.4.11 mindestens haben, wenn er das Element erkennbar macht?',
        options: ['3:1.', '4,5:1.', '7:1.', 'Einen Mindestwert gibt es nicht.'],
        correct: 0,
        rationales: ['Der Nicht-Text-Kontrast verlangt mindestens 3:1 für Grenzen, die ein Bedienelement erkennbar machen.', 'Das gilt für normalen Text.', 'Das ist die strengere Stufe AAA für Text.', 'Es gibt einen festen Mindestwert.'],
        explain: 'Für grafische Objekte und Bedienelement-Grenzen gilt 3:1; für normalen Text 4,5:1.' },
    ],
    sources: [
      mdn('light-dark()', 'Web/CSS/color_value/light-dark', 'Referenz inklusive Baseline-Status.'),
      mdn('color-scheme', 'Web/CSS/color-scheme'),
      mdn('Verwendung von CSS custom properties', 'Web/CSS/Guides/Cascading_variables/Using_custom_properties', 'Anleitung zu Definition, Vererbung und Rückfallwerten.'),
      wcag('Non-text Contrast (1.4.11)', 'non-text-contrast'),
    ],
    verification: 'Geprüft wurde mit Playwright in Chromium 158: Kontrastberechnung für die Rollen in beiden Modi, das Überschreiben per data-theme in beide Richtungen und dass nach dem Rollenblock keine Hexcodes mehr stehen. Nicht geprüft wurden der echte Kontrastmodus von Windows, Firefox, Safari, Druck und Farbsehschwächen.',
  },
  {
    id: 'css-m2-l2', title: 'Kaskade verstehen: @layer, :where, :is und :has', minutes: 35,
    prerequisites: 'Lektion „CSS einbinden, Selektoren und Kaskade“; Boxmodell und Klassen sicher anwenden.',
    objectives: [
      'Die Reihenfolge der Kaskade erklären: Wichtigkeit, Ebene, Spezifität, Position',
      'Mit @layer die Reihenfolge von Regeln unabhängig von der Spezifität festlegen',
      'Zwischen :where() (Spezifität 0), :is() und :has() unterscheiden',
      'Erklären, warum sich bei !important die Ebenenreihenfolge umdreht',
    ],
    simple: `Wenn zwei Regeln dasselbe Element betreffen, entscheidet die Kaskade, welche gewinnt. Du kennst die Spezifität: Ein ID-Selektor zählt mehr als ein Klassenselektor, und der mehr als ein Elementselektor. Wird es eng, schreiben viele Teams höhere Selektoren oder greifen zu !important. Mit der Zeit entsteht ein Wettrüsten, bei dem niemand mehr weiß, warum etwas gewinnt.

Mit Cascade Layers (@layer) kommt eine Ebene vor der Spezifität dazu. Du legst Ebenen in einer Reihenfolge fest, zum Beispiel reset, base, components, utilities. Eine Regel in einer späteren Ebene schlägt jede Regel in einer früheren, egal wie spezifisch die frühere ist. Spezifität zählt nur noch innerhalb derselben Ebene. Das macht Stylesheets planbar, besonders wenn Fremd-CSS im Spiel ist: Du packst es in eine frühe Ebene, und deine eigenen Regeln gewinnen immer.

Dazu kommen drei Selektor-Werkzeuge. :where() fasst Selektoren zusammen und zählt mit Spezifität 0, ideal für Basisregeln, die sich leicht überschreiben lassen. :is() fasst ebenfalls zusammen, nimmt aber die Spezifität des spezifischsten Arguments. :has() wählt ein Element nach seinen Nachfahren, etwa „eine Karte, die ein Bild enthält“.`,
    steps: [
      'Öffne cascade.css. Die erste Zeile @layer reset, base, components, utilities; legt die Reihenfolge fest, bevor Regeln stehen. Später genannte Ebenen gewinnen.',
      'Die Ebene reset enthält box-sizing und den Body-Rand; base enthält :where(h1, h2, h3) und :where(a). Beide Selektoren haben Spezifität 0 und lassen sich mit jedem normalen Selektor überschreiben. Der Test fügt h1 { margin-block-end: 3rem; } hinzu und das Ergebnis stimmt sofort.',
      'In base steht absichtlich #inhalt .button.gross { background: crimson; }, ein sehr spezifischer Selektor. In components steht nur .button { background: #174d9e; }. Trotz geringer Spezifität gewinnt components, weil die Ebene später kommt: Das Element hat die Hintergrundfarbe rgb(23, 77, 158).',
      'Die Regel .button.achtung steht außerhalb jeder Ebene. Unlayerter Code schlägt jede Ebene. Deshalb gehört Fremd-CSS in eine Ebene und eigener Feinschliff bewusst nicht; dieses Element hat rgb(138, 28, 20).',
      '.card :is(h2, h3) fasst zwei Selektoren zusammen. Die Spezifität entspricht dem spezifischsten Argument; hier sind es Elementselektoren, also gleich. Mit :is(#a, .b) dagegen wäre die ID bestimmend. Dasselbe gilt für :not() und :has().',
      '.card:has(img) wählt die Karte, die ein Bild enthält, und macht sie zweispaltig. Die Karte ohne Bild bleibt ein Block. Es braucht weder JavaScript noch eine zusätzliche Klasse. Der Test belegt: display: grid mit zwei Spalten gegenüber display: block.',
      '.card:has(:user-invalid) färbt eine Karte, sobald ein Feld darin nach der Eingabe ungültig ist. :user-invalid greift erst, nachdem jemand das Feld bearbeitet und verlassen hat; frisches Leeren löst es nicht aus. Der Test prüft: Vorher outline: none, nach „keine-mail“ und Verlassen outline: solid.',
      'Der Umkehr-Effekt: Bei !important gewinnt die frühere Ebene. Der Test legt in base color: rot !important und in utilities color: blau !important an: Rot gewinnt. Ohne !important gewinnt Blau. So können grundlegende Ebenen unverrückbare Vorgaben machen, etwa Barrierefreiheit.',
    ],
    background: `Warum lösen Ebenen das Wettrüsten? Spezifität ist eine implizite Rangfolge aus der Form des Selektors: Wer eine ID benutzt, gewinnt, egal ob es fachlich richtig ist. Ebenen machen die Rangfolge explizit und sichtbar: In einer Zeile steht, wer vor wem kommt. Das ist besonders nützlich bei Bibliotheken: Du kannst sie mit @import url(...) layer(vendor) in eine Ebene laden und musst nie wieder gegen ihre Selektoren anschreiben. Dieses Lab lädt kein Fremd-CSS; der Import ist hier beschrieben, nicht getestet.

Was bleibt gleich? Innerhalb einer Ebene gelten weiterhin Spezifität und Reihenfolge im Quelltext. Und Herkunft und Wichtigkeit (Browser-Standard, Autorenstil, Nutzerstil, !important) spielen weiter vor den Ebenen eine Rolle. Verlass dich also auf die Ebenen als zusätzliches Werkzeug, nicht als Ersatz für das Verständnis der Kaskade.`,
    terms: [
      { term: 'Cascade Layer', text: 'Benannte Ebene, deren Reihenfolge die Rangfolge von Regeln vor der Spezifität bestimmt.' },
      { term: ':where()', text: 'Fasst Selektoren zusammen und trägt immer die Spezifität 0.' },
      { term: ':is()', text: 'Fasst Selektoren zusammen; die Spezifität ist die des spezifischsten Arguments.' },
      { term: ':has()', text: 'Wählt ein Element danach, ob es bestimmte Nachfahren oder Nachbarn enthält.' },
    ],
    code: { file: lab + 'cascade.css', lang: 'CSS' },
    code2: { file: lab + 'cascade.html', lang: 'HTML', from: '<article class="card" id="mit-bild">', to: '</form>' },
    code3: { file: 'tests/html-css-vertiefung.spec.mjs', lang: 'JavaScript', from: "test('Eine spätere Ebene schlägt höhere Spezifität", to: "expect(colors.ohneEbene).toBe('rgb(138, 28, 20)');", plus: 1 },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: `Playwright 1.65.0, Chromium 158.0.8127.18, 4 Tests für Kaskade grün:
.button.gross (Ebene base, ID-Selektor) vs .button (Ebene components) -> components gewinnt: rgb(23, 77, 158)
.button.achtung (ohne Ebene) -> rgb(138, 28, 20)
:has(img): Karte mit Bild display: grid, 2 Spalten; Karte ohne Bild display: block
:where(h1,h2,h3) wird von "h1 { margin-block-end: 3rem }" sofort überschrieben (48px)
!important: Ebene base (früher) gewinnt gegen utilities; ohne !important gewinnt utilities
:has(:user-invalid): outline vorher none, nach Eingabe "keine-mail" und Verlassen solid
Nicht getestet: @import ... layer(), Verschachtelung von Ebenen, Firefox, Safari.`,
    mistakes: [
      { wrong: 'Spezifität mit IDs oder !important zu erhöhen, um eine Regel durchzusetzen.', why: 'Jeder Eingriff erzwingt den nächsten; später ist nicht mehr nachvollziehbar, warum etwas gewinnt.', fix: 'Eine passende Ebene wählen, Basisregeln mit :where() niedrig halten und nur dort überschreiben, wo es nötig ist.' },
      { wrong: 'Eigenen Feinschliff außerhalb jeder Ebene zu schreiben und zu erwarten, dass Ebenen gewinnen.', why: 'Unlayerter Code schlägt jede Ebene; neue Regeln überstimmen so unbemerkt ganze Ebenen.', fix: 'Alle eigenen Regeln einer Ebene zuordnen; unlayerten Code nur bewusst und selten einsetzen.' },
      { wrong: 'Zu glauben, bei !important gewinne wie bei normalen Regeln die spätere Ebene.', why: 'Bei !important dreht sich die Reihenfolge um: die früheren Ebenen gewinnen.', fix: '!important in Ebenen nur für unverrückbare Vorgaben nutzen und die Umkehr in der Doku vermerken.' },
      { wrong: ':has() in großen Mengen mit breiten Argumenten einzusetzen, ohne Wirkung auf die Leistung zu beachten.', why: 'Der Browser muss Beziehungen zwischen Elementen prüfen; sehr breite Selektoren können kosten.', fix: 'Selektoren eng halten (Klasse davor) und bei Auffälligkeiten mit dem Leistungsprofil des Entwicklerwerkzeugs prüfen.' },
    ],
    practice: 'Ordne ein bestehendes Stylesheet in die Ebenen reset, base, components und utilities, ersetze Basisselektoren durch :where() und entferne mindestens eine !important-Regel, die nur wegen der Spezifität existierte. Belege mit einem Test, dass die Darstellung unverändert bleibt.',
    exercises: [
      { task: 'Füge cascade.css eine Ebene theme zwischen base und components hinzu und überschreibe darin die Linkfarbe; prüfe, ob sie gegen components und utilities verliert oder gewinnt.', acceptance: 'Die Reihenfolge der @layer-Zeile entscheidet: Du erklärst anhand von Test oder Entwicklerwerkzeug, warum theme gegen die späteren Ebenen verliert.' },
      { task: 'Grenzfall: Schreibe zwei Regeln mit :is(#a, .b) und .b .b und vergleiche, welche gewinnt.', acceptance: 'Die :is-Regel mit ID gewinnt, weil :is() die Spezifität des spezifischsten Arguments (ID) übernimmt, obwohl sie das Element über die Klasse trifft; du erklärst den Unterschied zu :where().' },
      { task: 'Fehlerfall: Deklariere die Ebenen in der Reihenfolge utilities, components, base und erkläre die Folgen für .button.gross.', acceptance: 'Die Ebene base gewinnt jetzt gegen components; der Button wird crimson; du erklärst, dass die @layer-Zeile die Rangfolge festlegt und deshalb vor allen Regeln stehen muss.' },
    ],
    quiz: [
      { q: 'Welche Regel gewinnt: ein ID-Selektor in einer frühen Ebene oder ein Klassenselektor in einer späteren Ebene (jeweils ohne !important)?',
        options: ['Der ID-Selektor, weil er spezifischer ist.', 'Der Klassenselektor in der späteren Ebene.', 'Es gewinnt die Regel, die zuerst im Stylesheet steht.', 'Beide heben sich auf, das Element behält den Browser-Standard.'],
        correct: 1,
        rationales: ['Spezifität zählt erst innerhalb derselben Ebene.', 'Die Ebenenreihenfolge entscheidet vor der Spezifität; spätere Ebenen gewinnen.', 'Die Position im Quelltext zählt zuletzt.', 'Regeln heben sich nicht auf; eine gewinnt immer.'],
        explain: 'Ebenen stehen in der Kaskade vor der Spezifität; die spätere Ebene gewinnt, außer bei !important.' },
      { q: 'Welche Spezifität hat ein Selektor, der in :where() steht?',
        options: ['Die des spezifischsten enthaltenen Arguments.', 'Immer null.', 'Die eines Klassenselektors, unabhängig vom Inhalt.', 'Sie hängt von der Position in der Datei ab.'],
        correct: 1,
        rationales: ['Das beschreibt :is(), nicht :where().', 'Deshalb lassen sich Basisregeln mit :where() jederzeit mit einfachen Selektoren überschreiben.', 'Es gibt keine feste Klassen-Spezifität.', 'Die Position bestimmt die Reihenfolge, nicht die Spezifität.'],
        explain: ':where() zählt immer mit Spezifität 0; :is(), :not() und :has() nehmen die des spezifischsten Arguments.' },
      { q: 'Was passiert bei zwei !important-Deklarationen in verschiedenen Ebenen?',
        options: ['Die spätere Ebene gewinnt wie bei normalen Regeln.', 'Die Deklarationen heben sich gegenseitig auf.', 'Die frühere Ebene gewinnt, die Reihenfolge dreht sich um.', 'Es entscheidet allein die Spezifität des Selektors.'],
        correct: 2,
        rationales: ['Bei !important gilt das Gegenteil.', 'Sie heben sich nicht auf.', 'Der Test belegt es: Die frühere Ebene setzt sich mit !important durch.', 'Die Ebene entscheidet vor der Spezifität.'],
        explain: 'Bei !important ist die Reihenfolge der Ebenen umgekehrt: Früher genannte Ebenen gewinnen.' },
    ],
    sources: [
      mdn('@layer', 'Web/CSS/@layer'),
      mdn('Kaskade, Spezifität und Vererbung', 'Web/CSS/Guides/Cascade/Introduction', 'Einführung in die Kaskade.'),
      mdn(':where()', 'Web/CSS/:where'),
      mdn(':has()', 'Web/CSS/:has'),
    ],
    verification: 'Geprüft wurde mit Playwright in Chromium 158: Ebenenreihenfolge gegen Spezifität, unlayerter Code, die Umkehr bei !important, :has(img), :where() gegen einen einfachen Selektor und :user-invalid. Nicht geprüft wurden Firefox, Safari, @import mit layer(), verschachtelte Ebenen und die Leistung von :has() auf großen Seiten.',
  },
  {
    id: 'css-m2-l3', title: 'Container Queries und fließende Größen mit clamp()', minutes: 35,
    prerequisites: 'Lektionen zu Flexbox, Grid und Media Queries; Einheiten rem, vw und Prozent kennen.',
    objectives: [
      'Einen Container mit container-type: inline-size anlegen und mit @container Kinder darauf reagieren lassen',
      'Container-Einheiten (cqi) und clamp() für fließende Größen einsetzen',
      'Media Queries für das Seitenlayout und Container Queries für Komponenten unterscheiden',
      'Erklären, warum ein rem-Anteil in clamp() wichtig für die Zugänglichkeit ist',
    ],
    simple: `Eine Media Query fragt: Wie breit ist das Fenster? Das passt für das Seitenlayout, aber nicht für Komponenten. Eine Karte weiß nicht, ob sie breit im Hauptbereich oder schmal in einer Seitenleiste steht; das Fenster sagt es ihr nicht. Container Queries drehen das um: Die Karte fragt ihren umgebenden Bereich, wie viel Platz sie hat, und ordnet sich danach an. Dieselbe Karte funktioniert dann überall, ohne dass jemand Sonderfälle schreibt.

Dafür ernennst du ein Elternelement zum Container: container: karte / inline-size gibt ihm den Namen karte und macht seine Breite zur Bezugsgröße. Danach schreibst du @container karte (min-width: 32rem) { … }; die Regeln gelten für Nachfahren des Containers, nicht für den Container selbst.

Für Schriftgrößen gibt es clamp(min, bevorzugt, max): Der Wert wächst fließend mit dem Platz, bleibt aber immer zwischen Mindest- und Höchstgröße. So brauchst du keine Sprünge zwischen Breakpoints. Wichtig ist ein rem-Anteil im bevorzugten Wert, damit die Größe auch auf die Schriftgrößen-Einstellung des Browsers reagiert.`,
    steps: [
      'Öffne container.css. .slot { container: karte / inline-size; } legt den Container an. container ist die Kurzform für container-name und container-type; inline-size heißt, die Breite wird abgefragt.',
      'Wichtige Folge: Ein Container mit inline-size darf in der Breite nicht von seinem Inhalt abhängen (Layout-Eindämmung). Er braucht seine Breite von außen, etwa durch Grid, Block-Layout oder max-width. Das Beispiel gibt die Breite über die umgebende Spalte und max-width an.',
      '.karte ist ein Grid mit einer Spalte. Die Regel @container karte (min-width: 32rem) { .karte { grid-template-columns: 12rem 1fr; } } ordnet Bild und Text ab 32 rem Containerbreite nebeneinander an.',
      'In container.html liegt dieselbe Karte in zwei Slots: schmal (max-width: 20rem) und breit (max-width: 40rem). Bei 1000 px Fensterbreite ist die schmale Karte einspaltig und die breite zweispaltig. Bei 400 px Fensterbreite ist auch der breite Slot schmaler als 32 rem und die Karte wird einspaltig: Der Container zählt, nicht das Fenster.',
      '5cqi ist 5 Prozent der Containerbreite (inline). h2 { font-size: clamp(1.1rem, 5cqi, 1.75rem); } lässt die Kartenüberschrift mit der Karte wachsen und begrenzt sie nach unten und oben.',
      'Für die Seitenüberschrift nutzt h1 clamp(1.75rem, 1.2rem + 2.5vw, 3rem). Bei 320 px ergibt der bevorzugte Wert 27,2 px und wird auf 28 px (1,75 rem) angehoben; bei 1920 px liegt er über 48 px und wird auf 3 rem gekappt. Der Test prüft 28 px, 48 px und einen Wert dazwischen.',
      'Der rem-Anteil (1.2rem) ist entscheidend: Reine vw-Größen reagieren nicht auf die Schriftgrößen-Einstellung des Browsers; mit einem rem-Anteil wächst die Schrift mit. Kombiniere außerdem Mindest- und Höchstwerte in rem, nicht in px.',
    ],
    background: `Wann Media Query, wann Container Query? Faustregel: Das Seitengerüst (Spalten, Navigation ein- oder ausklappen) hängt am Fenster, also Media Query. Komponenten, die an verschiedenen Stellen stehen können, hängen an ihrem Platz, also Container Query. In der Praxis mischt man beides: Das Grid der Galerie legt mit auto-fit fest, wie viele Spalten passen, und jede Karte entscheidet selbst, wie sie ihren Platz nutzt.

Zur Verfügbarkeit: Dieses Lab wurde in Chromium getestet; prüfe vor dem Einsatz die aktuelle Browserunterstützung von @container und cqi-Einheiten auf den MDN-Seiten. Als Rückfall genügt oft ein vernünftiges einspaltiges Layout ohne die @container-Regel, denn Browser ignorieren, was sie nicht kennen.`,
    terms: [
      { term: 'Container Query', text: 'Regelblock mit @container, der auf die Größe eines umgebenden Containers reagiert, nicht auf das Fenster.' },
      { term: 'container-type: inline-size', text: 'Macht die Breite eines Elements zur Bezugsgröße und entkoppelt sie vom Inhalt.' },
      { term: 'cqi', text: 'Container-Einheit: 1 cqi entspricht 1 % der Breite des Containers.' },
      { term: 'clamp()', text: 'Funktion clamp(min, bevorzugt, max): fließender Wert innerhalb fester Grenzen.' },
    ],
    code: { file: lab + 'container.css', lang: 'CSS', from: '/* Die Seitenüberschrift', to: '.karte h2 { margin: 0;', plus: 0 },
    code2: { file: lab + 'container.css', lang: 'CSS', from: '/* Ab 32 rem Containerbreite', to: '}', plus: 1 },
    code3: { file: 'tests/html-css-vertiefung.spec.mjs', lang: 'JavaScript', from: "test('Dieselbe Karte ordnet sich nach der Breite ihres Containers", to: "expect(await columns('breit')).toBe(1);", plus: 1 },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: `Playwright 1.65.0, Chromium 158.0.8127.18, 2 Tests grün:
Fenster 1000 px: Slot schmal (20 rem) -> 1 Spalte, Slot breit (40 rem) -> 2 Spalten
Fenster 400 px: Slot breit wird vom Fenster begrenzt (< 32 rem) -> 1 Spalte
h1: 320 px -> 28 px, 800 px -> zwischen 28 und 48 px, 1920 px -> 48 px
Nicht getestet: Firefox, Safari, Zoom auf 200 %, geänderte Standard-Schriftgröße im Browser, verschachtelte Container.`,
    mistakes: [
      { wrong: 'container-type auf ein Element zu setzen, dessen Breite vom Inhalt abhängt (zum Beispiel ein float oder inline-block ohne Breite).', why: 'Mit inline-size-Eindämmung kann das Element nicht mehr nach dem Inhalt breit werden und fällt auf Breite 0 oder auf die Mindestbreite zusammen.', fix: 'Dem Container eine Breite von außen geben (Block-Layout, Grid-Zelle, width, max-width).' },
      { wrong: 'Zu erwarten, dass @container das Element selbst verändert, das den Container bildet.', why: 'Container Queries wirken nur auf Nachfahren; das Element selbst kann nicht auf sich reagieren.', fix: 'Einen Wrapper als Container anlegen und die Komponente darin stylen (wie .slot und .karte).' },
      { wrong: 'Fließende Schrift nur mit vw zu definieren, etwa font-size: 4vw.', why: 'Der Wert reagiert nicht auf die Schriftgrößen-Einstellung des Browsers und kann zu klein oder zu groß werden.', fix: 'clamp() mit rem-Mindest- und -Höchstwerten und einem rem-Anteil im bevorzugten Wert.' },
      { wrong: 'Alle Layoutentscheidungen in Container Queries zu verlagern.', why: 'Das Seitengerüst hängt am Fenster; zu viele Container machen CSS schwer lesbar.', fix: 'Seitenstruktur mit Media Queries oder Grid, Komponenten mit Container Queries.' },
    ],
    practice: 'Nimm eine Komponente deines Projekts, die an mehreren Stellen vorkommt (Karte, Teaser, Profil), mache ihren Wrapper zum Container und schreibe die Anordnung als @container-Regel. Prüfe sie an drei Breiten und dokumentiere, wo vorher Sonderfälle nötig waren.',
    exercises: [
      { task: 'Ergänze container.css um einen dritten Zustand ab 48 rem: drei Spalten (Bild, Text, Aktionen) und teste ihn mit einem dritten Slot.', acceptance: 'Ein Test zeigt eine, zwei und drei Spalten bei 20, 40 und 60 rem Slotbreite; die Regeln stehen nur im @container-Block.' },
      { task: 'Grenzfall: Setze die Slotbreite exakt auf 32 rem und auf 31,99 rem.', acceptance: 'Bei 32 rem greift min-width: 32rem (zwei Spalten), bei 31,99 rem nicht; du erklärst, dass min-width einen Wert einschließt.' },
      { task: 'Fehlerfall: Vergib container-type auf einem float-Element ohne Breite.', acceptance: 'Das Element schrumpft oder verschwindet; du erklärst die Layout-Eindämmung und gibst dem Container eine Breite von außen.' },
    ],
    quiz: [
      { q: 'Worauf reagiert eine @container-Regel?',
        options: ['Auf die Breite des Browserfensters.', 'Auf die Auflösung des Bildschirms.', 'Auf die Größe des umgebenden Containers.', 'Auf die Schriftgröße des Elternelements.'],
        correct: 2,
        rationales: ['Das wäre eine Media Query.', 'Die Auflösung ist nicht Gegenstand der Abfrage.', 'Die Abfrage bezieht sich auf einen Vorfahren mit container-type.', 'Schriftgrößen sind nicht Gegenstand der Abfrage.'],
        explain: 'Container Queries fragen die Größe eines Vorfahren ab, der mit container-type als Container eingerichtet ist.' },
      { q: 'Warum gehört bei clamp() für Schrift ein rem-Anteil in den bevorzugten Wert?',
        options: ['Damit die Schrift auch auf die Schriftgrößen-Einstellung des Browsers reagiert.', 'Weil rem schneller berechnet wird als vw.', 'Weil clamp() ohne rem keine gültige Funktion ist.', 'Damit die Schrift im Dunkelmodus größer erscheint.'],
        correct: 0,
        rationales: ['Reine vw-Werte ignorieren die Nutzereinstellung; ein rem-Anteil berücksichtigt sie.', 'Es geht nicht um Geschwindigkeit.', 'Auch reine vw-Werte sind gültig, nur weniger zugänglich.', 'Der Farbmodus hat mit der Größe nichts zu tun.'],
        explain: 'Ein rem-Anteil lässt die Schrift mit der Browser-Einstellung mitwachsen; reine vw-Größen tun das nicht.' },
      { q: 'Wann ist eine Media Query statt einer Container Query die bessere Wahl?',
        options: ['Für eine Karte, die in Seitenleiste und Hauptbereich vorkommt.', 'Für das Gerüst der Seite, etwa Navigation ein- oder ausklappen.', 'Für eine Komponente, die in wechselnden Layouts steht.', 'Nie, weil Container Queries Media Queries ersetzen.'],
        correct: 1,
        rationales: ['Hier hilft die Container Query, weil der Platz der Karte wechselt.', 'Das Seitengerüst hängt an der Fenstergröße.', 'Komponenten sollen auf ihren Platz reagieren.', 'Beide Mittel haben unterschiedliche Aufgaben.'],
        explain: 'Das Seitengerüst folgt dem Fenster (Media Query), Komponenten folgen ihrem Platz (Container Query).' },
    ],
    sources: [
      mdn('Container Queries', 'Web/CSS/Guides/Containment/Container_queries', 'Anleitung zu container-type, @container und Einheiten.'),
      mdn('clamp()', 'Web/CSS/clamp'),
      mdn('Container-Einheiten (cqi)', 'Web/CSS/length#container_query_length_units'),
      wcag('Resize Text (1.4.4)', 'resize-text'),
    ],
    verification: 'Geprüft wurde mit Playwright in Chromium 158: Spaltenzahl der Karte in zwei Slots bei zwei Fensterbreiten und die Grenzwerte der Überschrift bei 320, 800 und 1920 px. Nicht geprüft wurden Firefox, Safari, 200-%-Zoom, geänderte Standardschriftgröße und verschachtelte Container; die Verfügbarkeit von @container und cqi ist auf MDN zu prüfen.',
  },
  {
    id: 'css-m2-l4', title: 'Bewegung mit Rücksicht: Übergänge, Animationen und prefers-reduced-motion', minutes: 30,
    prerequisites: 'Lektion „Responsive Seiten, Media Queries und Bewegung“; Grundwissen zu Übergängen.',
    objectives: [
      'Übergänge und Animationen nur für Personen aktivieren, die keine reduzierte Bewegung wünschen',
      'Nur transform und opacity animieren und den Grund dafür nennen',
      'Zustände auch ohne Bewegung erkennbar halten',
      'Die zugehörigen WCAG-Kriterien einordnen (2.2.2, 2.3.3) und ihre Grenzen benennen',
    ],
    simple: `Bewegung kann helfen: Ein Panel, das sanft einblendet, zeigt, woher etwas kommt. Aber für manche Menschen löst Bewegung Schwindel, Übelkeit oder Kopfschmerzen aus, etwa bei Vestibularstörungen oder Migräne. Betriebssysteme bieten deshalb die Einstellung „Bewegung reduzieren“. Der Browser reicht sie über die Medienabfrage prefers-reduced-motion weiter. Deine Aufgabe ist, sie zu respektieren.

Der einfachste Weg ist, Bewegung nur zuzuschalten, wenn die Person sie nicht abgewählt hat: @media (prefers-reduced-motion: no-preference) { … }. Die Grundregeln kommen ohne Übergänge aus; die Bewegung ist ein Zusatz. So bleibt die Seite auch in Browsern ohne Unterstützung der Abfrage ruhig, und du musst nichts „abschalten“.

Zweitens: Animiere nur transform und opacity. Diese Eigenschaften lassen sich in der Regel ohne neues Layout auf der Grafikkarte zeichnen, während Änderungen an width, height, margin oder top meist die Seite neu berechnen und ruckeln.`,
    steps: [
      'Öffne motion.css. Außerhalb jeder Medienabfrage gibt es keine Übergänge und keine Animation: Der Grundzustand ist ruhig.',
      'Innerhalb von @media (prefers-reduced-motion: no-preference) stehen die Übergänge (transition: transform 200ms ease-out, opacity 200ms ease-out) und die Dreh-Animation des Ladeindikators.',
      'Der Test schaltet die Browser-Einstellung um: Mit no-preference sind transition-duration „0.2s, 0.2s“ und animation-name „drehen“; mit reduce sind es „0s“ und „none“.',
      'Die Animationen verändern nur transform (Drehung, Verschiebung) und opacity. Ein zweiter Test prüft, dass in der Datei keine Übergänge auf all, width, height, margin, top oder left stehen.',
      'Der Ladeindikator ist rein dekorativ (aria-hidden). Der Zustand wird zusätzlich durch Text („Karten werden geladen …“) in einem Element mit role="status" mitgeteilt. Auch bei reduzierter Bewegung ist der Zustand erkennbar.',
      'Reduzierte Bewegung heißt nicht „gar keine Veränderung“: Zustandswechsel dürfen sofort sichtbar sein. Entscheidend ist, dass keine Wischbewegungen, Zoomeffekte oder Parallaxe stören.',
      'WCAG 2.2.2 (Pause, Stop, Hide, Stufe A) verlangt für automatisch startende Bewegung, die länger als fünf Sekunden läuft und neben anderem Inhalt steht, eine Möglichkeit zum Anhalten (mit Ausnahmen). prefers-reduced-motion ersetzt das nicht. WCAG 2.3.3 (Stufe AAA) fordert, dass durch Interaktion ausgelöste Bewegung abschaltbar ist.',
    ],
    background: `Warum ruhiger Standard statt „abschalten bei reduce“? Wenn du im Grundzustand animierst und bei reduce zurücknimmst, musst du jede Animation einzeln aufspüren und abschalten; vergisst du eine, bleibt sie. Wenn die Bewegung ein Zusatz in no-preference ist, kann sie nicht versehentlich bei reduce laufen. Außerdem wirkt die Seite auch ohne CSS-Unterstützung der Abfrage ruhig.

Warum transform und opacity? Browser können diese Eigenschaften oft auf der Grafikkarte verarbeiten, ohne das Layout der Seite neu zu berechnen. Das ist eine Faustregel, kein Gesetz: Ob eine Animation ruckelt, hängt von Gerät, Seite und Browser ab, und das Leistungsprofil der Entwicklerwerkzeuge zeigt es. Das Lab prüft nur, dass die genannten Eigenschaften genutzt werden, nicht die tatsächliche Bildrate.`,
    terms: [
      { term: 'prefers-reduced-motion', text: 'Medienabfrage für den Wunsch, Bewegung zu reduzieren; Werte: reduce und no-preference.' },
      { term: 'transform', text: 'Eigenschaft für Verschieben, Drehen und Skalieren, ohne das Layout zu verändern.' },
      { term: 'role="status"', text: 'Bereich, dessen Änderungen assistive Technik höflich ansagt, ohne den Fokus zu bewegen.' },
      { term: 'Vestibuläre Störung', text: 'Störung des Gleichgewichtssinns; Bewegung auf dem Bildschirm kann Schwindel auslösen.' },
    ],
    code: { file: lab + 'motion.css', lang: 'CSS', from: '/* Ruhiger Standard', to: '@keyframes drehen' },
    code2: { file: lab + 'motion.html', lang: 'HTML', from: '<main>', to: '</main>' },
    code3: { file: 'tests/html-css-vertiefung.spec.mjs', lang: 'JavaScript', from: "test('Übergänge und Animationen gibt es nur ohne Reduktionswunsch'", to: "expect(await durations()).toEqual({ transition: '0s', animation: 'none' });", plus: 1 },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: `Playwright 1.65.0, Chromium 158.0.8127.18, 2 Tests grün:
reducedMotion no-preference -> transition-duration "0.2s, 0.2s", animation-name "drehen"
reducedMotion reduce        -> transition-duration "0s", animation-name "none"
motion.css: transition nur für transform und opacity; kein all, width, height, margin, top, left
Nicht getestet: tatsächliche Bildrate, Systemeinstellung in macOS/Windows/Android selbst, Firefox, Safari, Pausieren langer Animationen.`,
    mistakes: [
      { wrong: 'Animationen im Grundzustand zu schreiben und bei reduce zu überschreiben.', why: 'Jede vergessene Animation läuft trotz Wunsch weiter.', fix: 'Bewegung ausschließlich in @media (prefers-reduced-motion: no-preference) einschalten.' },
      { wrong: 'transition: all zu verwenden.', why: 'Es animiert jede Änderung, auch Layout-Eigenschaften, und überrascht bei späteren Erweiterungen.', fix: 'Eigenschaften einzeln nennen, am besten nur transform und opacity.' },
      { wrong: 'Den Zustand nur durch Bewegung zu zeigen (zum Beispiel ein drehender Kreis ohne Text).', why: 'Bei reduzierter Bewegung oder für Screenreader ist der Zustand nicht erkennbar.', fix: 'Zusätzlich Text und role="status" bzw. aria-live verwenden.' },
      { wrong: 'Zu glauben, prefers-reduced-motion löse die Anforderung zu automatisch laufenden Animationen vollständig.', why: 'WCAG 2.2.2 verlangt für längere, automatisch startende Bewegung eine Möglichkeit zum Anhalten.', fix: 'Ein Bedienelement zum Pausieren anbieten, wo 2.2.2 greift, und die Abfrage zusätzlich nutzen.' },
    ],
    practice: 'Suche in deinem Projekt alle transition- und animation-Regeln. Verschiebe sie in eine no-preference-Abfrage, reduziere sie auf transform und opacity und schreibe einen Test, der beide Einstellungen prüft. Notiere, welche Zustände nur durch Bewegung erkennbar waren.',
    exercises: [
      { task: 'Füge einer Schaltfläche einen Übergang von opacity bei :hover hinzu, aber nur bei no-preference, und prüfe beide Einstellungen.', acceptance: 'Ein Test zeigt transition-duration 0.2s ohne Reduktionswunsch und 0s mit Wunsch; der Hover-Zustand bleibt auch ohne Bewegung erkennbar (Farbe oder Rand).' },
      { task: 'Grenzfall: Eine Animation läuft unendlich (infinite). Welche WCAG-Kriterien sind betroffen, und was brauchst du zusätzlich zur Medienabfrage?', acceptance: 'Du nennst 2.2.2 (Pause, Stop, Hide) für Bewegung über fünf Sekunden, beschreibst eine Pause-Schaltfläche und erwähnst die Ausnahme, wenn die Bewegung wesentlich ist.' },
      { task: 'Fehlerfall: Schreibe transition: all 300ms und füge per Skript eine width-Änderung hinzu.', acceptance: 'Die Breite wird animiert und löst Layout aus; du erklärst, warum transition: all unerwünscht ist, und ersetzt es durch transform und opacity.' },
    ],
    quiz: [
      { q: 'Wie schaltest du Bewegung am sichersten nur für Personen ein, die sie nicht abgewählt haben?',
        options: ['Mit @media (prefers-reduced-motion: no-preference) um alle Übergänge.', 'Mit einer Regel, die bei reduce alle Animationen mit !important überschreibt.', 'Mit JavaScript, das beim Laden die Einstellung ausliest.', 'Gar nicht, die Einstellung gilt automatisch für alle Animationen.'],
        correct: 0,
        rationales: ['So läuft Bewegung nie, wenn die Abfrage nicht zutrifft.', 'Das erfordert, jede Animation zu finden; vergessene laufen weiter.', 'CSS kann das allein; JavaScript ist unnötig.', 'Der Browser schaltet Animationen nicht von selbst ab; die Seite muss die Abfrage auswerten.'],
        explain: 'Der ruhige Grundzustand plus Bewegung nur in no-preference verhindert vergessene Animationen.' },
      { q: 'Warum werden bevorzugt transform und opacity animiert?',
        options: ['Weil andere Eigenschaften nicht animiert werden können.', 'Weil sie das Layout nicht verändern und meist ohne Neuberechnung gezeichnet werden.', 'Weil sie nur in Chromium funktionieren.', 'Weil die Barrierefreiheit sonst automatisch ungültig wird.'],
        correct: 1,
        rationales: ['Fast alle Eigenschaften lassen sich animieren, manche nur teuer.', 'Das macht sie in der Regel flüssiger; das ist eine Faustregel, kein Gesetz.', 'Sie funktionieren in allen Browsern.', 'Die Wahl der Eigenschaft hat damit nichts zu tun.'],
        explain: 'transform und opacity lösen meist kein neues Layout aus und laufen deshalb in der Regel flüssiger.' },
      { q: 'Was fordert WCAG 2.2.2 (Pause, Stop, Hide) im Kern?',
        options: ['Alle Animationen müssen kürzer als eine Sekunde sein.', 'Animationen sind nur im Dunkelmodus erlaubt.', 'Jede Bewegung braucht eine Beschreibung im alt-Text.', 'Lange, automatisch startende Bewegung muss sich anhalten oder ausblenden lassen.'],
        correct: 3,
        rationales: ['Eine solche Grenze gibt es nicht.', 'Der Farbmodus spielt keine Rolle.', 'alt-Texte betreffen Bilder, nicht Animationen.', 'Gemeint ist Bewegung, die automatisch startet, länger als fünf Sekunden läuft und neben anderem Inhalt steht (mit Ausnahmen).'],
        explain: 'Das Kriterium gibt Nutzerinnen und Nutzern Kontrolle über automatisch startende Bewegung ab fünf Sekunden.' },
    ],
    sources: [
      mdn('prefers-reduced-motion', 'Web/CSS/@media/prefers-reduced-motion'),
      wcag('Pause, Stop, Hide (2.2.2)', 'pause-stop-hide'),
      wcag('Animation from Interactions (2.3.3)', 'animation-from-interactions'),
      { title: 'web.dev: Animations guide', url: 'https://web.dev/articles/animations-guide', note: 'Erklärt, warum transform und opacity günstig animierbar sind.' },
    ],
    verification: 'Geprüft wurde mit Playwright in Chromium 158: Die berechneten Werte von transition-duration und animation-name unter beiden Emulationseinstellungen, und dass motion.css nur transform und opacity animiert. Nicht geprüft wurden die tatsächliche Bildrate, die Systemeinstellung selbst auf echten Geräten, Firefox, Safari und das Pausieren langer Animationen.',
  },
  {
    id: 'css-m2-l5', title: 'Abschlussprojekt: Lernkarten-Galerie mit Tests', minutes: 45,
    prerequisites: 'Alle Lektionen der Module „HTML · Vertiefung“ und „CSS · Vertiefung“.',
    objectives: [
      'Tokens, Ebenen, Container Queries, responsive Bilder, native Interaktion und Bewegungsregeln in einer Seite verbinden',
      'Eine Abnahmeliste mit Kopf-, Barrierefreiheits-, Layout- und Tastaturprüfungen automatisieren',
      'Die Seite in hellem und dunklem Modus und bei 320, 768 und 1280 px prüfen',
      'Grenzen der Prüfung benennen und offen dokumentieren',
    ],
    simple: `Jetzt kommt alles zusammen. Das Projekt ist eine kleine Lernkarten-Galerie: eine Kopfzeile mit Navigation und Themenschalter, zwei Karten mit Bild, ein Dialog für Details, eine Aufklappliste mit Fragen. Sie nutzt die Tokens aus tokens.css, die Ebenen reset, base, components und utilities, Container Queries für die Karten, responsive Bilder, ein natives Dialog-Element und Bewegung nur bei no-preference.

Entscheidend ist nicht die Seite selbst, sondern die Abnahme. Du schreibst eine Liste, was „fertig“ heißt, und machst sie ausführbar: Der Kopfbereich besteht check-head.js, die Barrierefreiheitsprüfung findet nichts, im hellen und im dunklen Modus. Es gibt bei 320, 768 und 1280 px kein horizontales Scrollen. Die Karten ordnen sich nach ihrem Container, der Dialog ist per Tastatur bedienbar und der Themenwechsel funktioniert.

Danach steht auf einem Blatt, was geprüft wurde und was nicht. Das ist die Antwort auf die Frage „Ist die Seite barrierefrei?“: ehrlich begrenzt, nachvollziehbar und wiederholbar.`,
    steps: [
      'Öffne projekt/index.html. Der head enthält title, description, canonical und lang; check-head.js findet keine Befunde. Der Seitenaufbau hat Skip-Link, header mit nav, main, zwei Abschnitte und ein dialog.',
      'projekt.css beginnt mit @layer reset, base, components, utilities;. Die Ebene components enthält Kopf, Galerie, Karten, summary und dialog. Container-Regeln stehen mit in components; die Bewegungsregeln stehen in utilities und nur in no-preference.',
      'Die Galerie ist ein Grid mit repeat(auto-fit, minmax(min(100%, 18rem), 1fr)). Jede Karte steckt in einem .slot mit container: karte / inline-size. Ab 28 rem Containerbreite stehen Bild und Text nebeneinander.',
      'Die Bilder nutzen picture: auf schmalen Anzeigen die quadratische Datei, sonst srcset mit 480w und 960w und sizes. Das erste Bild lädt sofort, das zweite mit loading="lazy"; alle haben width, height und beschreibende alt-Texte.',
      'Der Dialog öffnet per Button (data-dialog), setzt den Text per textContent und schließt mit der Schaltfläche (autofocus) oder Escape; der Fokus kehrt zurück. Der Themenschalter ist ein Button mit aria-pressed und setzt data-theme am Wurzelelement.',
      'Die Tests: Kopf- und Barrierefreiheitsprüfung in hell und dunkel (keine Befunde), kein Überlauf bei 320, 768 und 1280 px, Spaltenzahl der Karte bei 1280 px (2) und 768 px (1), Dialog per Tastatur und Themenwechsel (Hintergrund wird dunkel, aria-pressed true).',
      'Prüfe zusätzlich von Hand: Tab-Durchlauf (Skip-Link, Navigation, Themenschalter, Detail-Buttons), 200 % Zoom, Windows-Kontrastmodus oder macOS „Kontrast erhöhen“, ein Screenreader (VoiceOver oder NVDA). Diese Prüfungen sind nicht automatisiert und gehören in dein Prüfprotokoll.',
    ],
    background: `Warum die Abnahmeliste ausführbar machen? Weil sich Qualität sonst über die Zeit verflüchtigt: Beim dritten Redesign vergisst jemand den Fokusrahmen, und niemand merkt es. Ein Test, der bei jeder Änderung läuft, bewahrt die Entscheidungen. Er ist aber nur so gut wie seine Kriterien: Das Lab prüft die Kriterien, die es benennt, und sonst nichts. Deshalb gehört zur Abgabe immer ein Satz, was nicht geprüft wurde.

Wie geht es weiter? Nach dem Abschlussprojekt kannst du die Seite um Formulare mit Validierung, Navigation für mehrere Seiten und echte Inhalte erweitern, sie in ein Framework (Vue, Astro) überführen und mit einem etablierten Prüfwerkzeug (axe, Lighthouse) gegenprüfen. Die Muster dieses Projekts, Tokens, Ebenen, Container und Prüftests, tragen in jedes dieser Vorhaben.`,
    terms: [
      { term: 'Abnahmeliste', text: 'Liste von Kriterien, die erfüllt sein müssen, damit eine Arbeit als fertig gilt.' },
      { term: 'Skip-Link', text: 'Erster Link der Seite, der direkt zum Hauptinhalt springt; für Tastaturnutzung unverzichtbar.' },
      { term: 'aria-pressed', text: 'Zeigt bei einem Umschalt-Button an, ob er gedrückt (aktiv) ist.' },
      { term: 'Prüfprotokoll', text: 'Dokument, das festhält, was wie geprüft wurde und was nicht.' },
    ],
    code: { file: lab + 'projekt/projekt.css', lang: 'CSS' },
    code2: { file: lab + 'projekt/index.html', lang: 'HTML', from: '<section id="galerie"', to: '</section>' },
    code3: { file: 'tests/html-css-vertiefung.spec.mjs', lang: 'JavaScript', from: "test('Kartenlayout folgt dem Container, Dialog und Themenwechsel", to: "await expect(page.getByRole('button', { name: 'Dunkles Design' })).toHaveAttribute('aria-pressed', 'true');", plus: 1 },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: `Playwright 1.65.0, Chromium 158.0.8127.18, 6 Projekttests grün:
Kopf- und Barrierefreiheitsprüfung (hell)  -> { head: [], a11y: [] }
Kopf- und Barrierefreiheitsprüfung (dunkel) -> { head: [], a11y: [] }
Kein horizontales Scrollen bei 320, 768 und 1280 px
Karte bei 1280 px: 2 Spalten (Container ~34 rem), bei 768 px: 1 Spalte (Container ~22 rem)
Dialog per Tastatur: Enter öffnet, Fokus auf "Schließen", Escape schließt, Fokus zurück am Auslöser
Themenwechsel: Hintergrund rgb(15, 24, 38), aria-pressed="true"
Nicht geprüft: Screenreader, 200-%-Zoom, Kontrastmodus, Firefox, Safari, Druck, echte Netzwerkbedingungen, axe/Lighthouse.`,
    mistakes: [
      { wrong: 'Die Abnahme nur manuell durchzuführen und nicht festzuhalten.', why: 'Beim nächsten Umbau sind Wissen und Ergebnisse verloren; Fehler schleichen sich wieder ein.', fix: 'Prüfbares in Tests gießen und Manuelles im Prüfprotokoll mit Datum und Werkzeug festhalten.' },
      { wrong: 'Aus bestandenen Tests „barrierefrei“ zu schließen.', why: 'Die Tests decken nur benannte Kriterien ab; Sinn, Reihenfolge und Verständlichkeit sind nicht geprüft.', fix: 'Aussagen auf das Geprüfte begrenzen und offene Punkte benennen.' },
      { wrong: 'Den Themenschalter nur mit einer Farbänderung zu kennzeichnen.', why: 'Der Zustand ist für Screenreader nicht erkennbar.', fix: 'Button mit aria-pressed und eindeutiger Beschriftung; Zustand zusätzlich sichtbar machen.' },
      { wrong: 'Container Queries und Media Queries zu vermischen, ohne die Zuständigkeit zu klären.', why: 'Regeln widersprechen sich und sind schwer zu verstehen.', fix: 'Seitengerüst und Galerie-Spalten mit Grid/Media Queries, Kartenlayout mit @container; Entscheidung dokumentieren.' },
    ],
    practice: 'Baue die Galerie mit eigenen Inhalten (drei bis sechs Karten), füge einen eigenen Test hinzu (zum Beispiel für die Reihenfolge beim Tabben) und erstelle ein Prüfprotokoll mit den Abschnitten „automatisiert geprüft“, „manuell geprüft“ und „nicht geprüft“.',
    exercises: [
      { task: 'Füge eine dritte Karte und eine Suchleiste mit sichtbarem Label hinzu; lass Kopf-, Barrierefreiheits- und Überlauf-Tests laufen.', acceptance: 'Alle Tests bleiben grün; die Suchleiste hat ein sichtbares Label und eine Zielgröße von mindestens 44 px; ein Tab-Test belegt die Reihenfolge.' },
      { task: 'Grenzfall: Stelle das Fenster auf 320 px Breite, aktiviere 200 % Zoom und beschreibe, was passiert.', acceptance: 'Kein horizontales Scrollen für Lesetext; du nennst Stellen, die nur zweidimensional lesbar sind (falls vorhanden), und begründest sie oder behebst sie.' },
      { task: 'Fehlerfall: Entferne beim Themenschalter aria-pressed und beschreibe, was ein Screenreader ansagt; lass die Tests laufen.', acceptance: 'Der Test mit aria-pressed schlägt fehl; du erklärst, dass der Zustand nicht erkennbar ist, und stellst ihn wieder her.' },
    ],
    quiz: [
      { q: 'Warum automatisierst du Teile der Abnahme als Tests?',
        options: ['Damit die Seite nie manuell geprüft werden muss.', 'Damit Qualitätskriterien bei jeder Änderung wiederholbar geprüft werden.', 'Damit Tests die Barrierefreiheit der Seite garantieren.', 'Damit der Code kürzer wird.'],
        correct: 1,
        rationales: ['Manuelle Prüfung bleibt nötig, etwa mit Screenreader.', 'Tests bewahren Entscheidungen und fangen Rückschritte ab.', 'Tests belegen nur die benannten Kriterien; sie garantieren nichts darüber hinaus.', 'Tests ändern die Länge des Produktivcodes nicht.'],
        explain: 'Automatisierte Prüfungen sorgen dafür, dass benannte Kriterien dauerhaft erfüllt bleiben; Manuelles bleibt zusätzlich nötig.' },
      { q: 'Wo gehört die Bewegung der Karten im Abschlussprojekt hin?',
        options: ['In die Ebene reset, damit sie immer gilt.', 'In den Grundzustand jeder Karte, ohne Bedingung.', 'In @media (prefers-reduced-motion: no-preference).', 'In ein Skript, das die Einstellung beim Laden ausliest.'],
        correct: 2,
        rationales: ['Die Ebene reset ist für Grundeinstellungen gedacht.', 'Dann würde sie auch bei reduzierter Bewegung laufen.', 'So läuft Bewegung nur für Personen, die sie nicht abgewählt haben.', 'CSS genügt und ist robuster.'],
        explain: 'Bewegung ist ein Zusatz und wird nur bei no-preference eingeschaltet.' },
      { q: 'Wie lautet die richtige Aussage nach grünen Projekttests?',
        options: ['Die Seite ist vollständig barrierefrei und in jedem Browser nutzbar.', 'Benannte Kriterien sind in Chromium erfüllt; Screenreader und Zoom sind offen.', 'Die Seite funktioniert in allen Browsern und auf allen Geräten gleich.', 'Die Seite erreicht dadurch automatisch ein gutes Suchmaschinen-Ranking.'],
        correct: 1,
        rationales: ['Diese Aussage geht über das Geprüfte hinaus.', 'Sie benennt, was geprüft wurde, und was nicht.', 'Getestet wurde nur Chromium.', 'Rankings hängen von vielen Faktoren ab, die hier nicht geprüft werden.'],
        explain: 'Gute Aussagen nennen das Geprüfte und die offenen Punkte, statt auf allgemeine Qualität zu schließen.' },
    ],
    sources: [
      mdn('Responsive Bilder', 'Web/HTML/Guides/Responsive_images'),
      mdn('Container Queries', 'Web/CSS/Guides/Containment/Container_queries'),
      mdn('dialog-Element', 'Web/HTML/Reference/Elements/dialog'),
      { title: 'W3C WAI: Easy Checks – A First Review of Web Accessibility', url: 'https://www.w3.org/WAI/test-evaluate/preliminary/', note: 'Einfache erste Prüfungen, die automatische und manuelle Schritte verbinden.' },
    ],
    verification: 'Geprüft wurde mit Playwright in Chromium 158: Kopf- und Barrierefreiheitsprüfung in beiden Modi, kein Überlauf bei drei Breiten, das Kartenlayout nach Container bei zwei Fensterbreiten, Dialog per Tastatur und Themenwechsel. Nicht geprüft wurden Screenreader, 200-%-Zoom, Kontrastmodus, Firefox, Safari, Druck, echte Netzwerkbedingungen sowie axe und Lighthouse.',
  },
];
