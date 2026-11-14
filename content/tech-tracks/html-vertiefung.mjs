// HTML & CSS · HTML Vertiefung. Stichtag 14.11.2026.
// Eigene Texte; Code und Tests liegen unter content/examples/html-css-lab/vertiefung/ und tests/html-css-vertiefung.spec.mjs
// (Playwright 1.65.0 mit Chromium 158.0.8127.18; Firefox und Safari wurden nicht getestet).
const lab = 'content/examples/html-css-lab/vertiefung/';
const mdn = (title, path, note = 'Referenz; Inhalt hier eigenständig zusammengefasst.') => ({ title: `MDN: ${title}`, url: `https://developer.mozilla.org/en-US/docs/${path}`, note });
const wcag = (title, page) => ({ title: `WCAG 2.2 verstehen: ${title}`, url: `https://www.w3.org/WAI/WCAG22/Understanding/${page}.html`, note: 'W3C-Erläuterung zum Erfolgskriterium; Inhalt hier eigenständig zusammengefasst.' });

export const module = {
  id: 'html-m2', course: 'htmlcss', part: 24, partTitle: 'HTML & CSS · Webfundament',
  title: 'HTML Vertiefung · Bilder, Kopfbereich, native Interaktion und Prüfung',
};

export const lessons = [
  {
    id: 'html-m2-l1', title: 'Responsive Bilder: srcset, sizes, picture und Layoutstabilität', minutes: 35,
    prerequisites: 'Modul „HTML · Struktur und Bedeutung“, besonders Links, Listen und Bilder; Grundwissen zum Boxmodell hilft.',
    objectives: [
      'Mit srcset und sizes erklären, wie der Browser aus mehreren Dateien eine passende wählt',
      'Mit picture einen anderen Bildausschnitt für schmale Anzeigen ausliefern (Art Direction)',
      'width und height so setzen, dass kein Layoutsprung beim Laden entsteht',
      'loading, fetchpriority und alt passend für wichtige, nachrangige und dekorative Bilder wählen',
    ],
    simple: `Ein Bild, das für einen großen Bildschirm gedacht ist, wäre auf einem Smartphone Verschwendung: Es lädt unnötig viele Bytes. Umgekehrt wirkt ein kleines Bild auf einem Bildschirm mit doppelter Pixeldichte unscharf. Deshalb bietest du dem Browser mehrere Dateien an und sagst ihm, wie breit das Bild später auf der Seite dargestellt wird. Er rechnet dann selbst aus, welche Datei reicht.

Dafür gibt es zwei Attribute. srcset listet die Dateien mit ihrer Breite in Pixeln (480w, 960w, 1440w). sizes sagt, wie breit das Bild im Layout ist, zum Beispiel „ab 60 rem Fensterbreite 30 rem, sonst die volle Breite“. Der Browser kennt Fensterbreite und Pixeldichte, kombiniert beides mit deiner Angabe und wählt eine Datei. Du bestimmst also das Ziel, nicht die Datei.

Etwas anderes ist die Art Direction: Hier soll nicht dieselbe Szene kleiner werden, sondern ein anderer Ausschnitt erscheinen, etwa ein quadratisches Detail statt eines breiten Panoramas. Dafür nutzt du das Element picture mit source-Elementen und media-Bedingungen. Und schließlich: Mit width und height legst du das Seitenverhältnis fest, damit der Browser den Platz reserviert, bevor die Datei da ist. Ohne diese Angaben springt der Text nach dem Laden nach unten (Layoutverschiebung).`,
    steps: [
      'Öffne bilder.html. Das erste Bild hat src (Rückfall für alte Browser), srcset mit drei Breiten und sizes. width="960" height="640" geben das Seitenverhältnis 3:2 an, nicht die Anzeigegröße.',
      'sizes="(min-width: 60rem) 30rem, 100vw" heißt: Ab 60 rem Fensterbreite ist das Bild 30 rem breit, sonst so breit wie das Fenster. Die Bedingungen werden von links nach rechts geprüft, die erste zutreffende gewinnt; die letzte Angabe ohne Bedingung ist der Standard.',
      'Rechne nach: Bei 400 px Fensterbreite und einfacher Pixeldichte braucht das Bild 400 Pixel, die kleinste Datei, die mindestens so breit ist, ist 480w. Bei doppelter Pixeldichte werden 800 Pixel gebraucht: 960w. Bei 1280 px Fenster und einfacher Dichte sind es 480 Pixel (30 rem), also wieder 480w, bei doppelter Dichte 960w. Der Test bestätigt diese vier Fälle in Chromium.',
      'Beachte: Die Regeln im HTML-Standard erlauben dem Browser, von dieser Rechnung abzuweichen, etwa weil eine größere Datei schon im Cache liegt. Verlass dich also nicht auf eine bestimmte Datei, sondern gib sinnvolle Kandidaten und ein ehrliches sizes an.',
      'Das zweite Bild steckt in picture. Das source-Element mit media="(max-width: 30rem)" liefert auf schmalen Anzeigen die quadratische Datei, sonst gilt das img darin. Das img-Element bleibt Pflicht: Es trägt alt, width, height und den Rückfall.',
      'Mit img { max-width: 100%; height: auto; } schrumpft das Bild mit dem Container, ohne sich zu verzerren. Der Browser leitet aus width und height ein Seitenverhältnis ab; der Test blockiert die Bilddateien und misst trotzdem das Verhältnis 3:2 – der Platz ist also vor dem Laden reserviert.',
      'Setze loading="lazy" nur für Bilder außerhalb des ersten Bildschirms. Das wichtigste Bild (oft das größte sichtbare, der LCP-Kandidat) bekommt kein lazy, sondern fetchpriority="high". Dekorative Bilder erhalten alt="", damit Screenreader sie überspringen.',
    ],
    background: `Warum width und height, wenn CSS die Größe doch ohnehin bestimmt? Weil CSS erst geladen und angewendet sein muss, das Bild aber oft schon im HTML steht. Der Browser baut die Seite von oben nach unten auf. Kennt er das Seitenverhältnis, reserviert er die Höhe sofort und alles darunter bleibt an seinem Platz. Das schützt vor Layoutverschiebungen, die Nutzerinnen und Nutzer beim Lesen stören und in Messungen wie Core Web Vitals (CLS) auffallen.

Wann lohnt picture, wann reicht srcset? Reicht dieselbe Szene in verschiedenen Größen, nimm srcset und sizes: Der Browser entscheidet besser als jede feste Regel, weil er Pixeldichte, Netz und Cache kennt. Brauchst du einen anderen Ausschnitt oder ein anderes Format (zum Beispiel ein moderneres Bildformat mit Rückfall), nimm picture. Bildformate wie AVIF oder WebP werden mit source type="image/avif" angeboten; das Lab zeigt das nicht, weil es nur SVG-Dateien nutzt.`,
    terms: [
      { term: 'srcset', text: 'Liste von Bilddateien mit ihrer Breite (w) oder Pixeldichte (x); der Browser wählt eine aus.' },
      { term: 'sizes', text: 'Angabe, wie breit das Bild im Layout dargestellt wird; Grundlage für die Auswahl aus srcset.' },
      { term: 'Art Direction', text: 'Anderer Bildausschnitt je nach Anzeige, umgesetzt mit picture und source media.' },
      { term: 'Layoutverschiebung (CLS)', text: 'Sichtbares Springen von Inhalten, weil Platz nicht reserviert war.' },
    ],
    code: { file: lab + 'bilder.html', lang: 'HTML', from: '<img id="held"', to: 'fetchpriority="high">', plus: 0 },
    code2: { file: lab + 'bilder.html', lang: 'HTML', from: '<picture>', to: '</picture>' },
    code3: { file: 'tests/html-css-vertiefung.spec.mjs', lang: 'JavaScript', from: "test('srcset und sizes: Der Browser wählt", to: "expect(await chosen(page, 1280, 2)).toBe('lernkarte-960.svg');", plus: 1 },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: `Playwright 1.65.0, Chromium 158.0.8127.18, 4 Tests für Bilder grün:
400 px, Dichte 1  -> lernkarte-480.svg
400 px, Dichte 2  -> lernkarte-960.svg
1280 px, Dichte 1 -> lernkarte-480.svg   (sizes: 30 rem = 480 px)
1280 px, Dichte 2 -> lernkarte-960.svg
picture: 400 px -> lernkarte-quadrat.svg, 900 px -> lernkarte-960.svg
Dateien blockiert: Seitenverhältnis des Platzhalters 960/640 = 1,5
Nicht getestet: Firefox, Safari, Auswahl bei gefülltem Cache, echte Netzwerkzeiten, AVIF/WebP.`,
    mistakes: [
      { wrong: 'srcset ohne sizes zu verwenden, obwohl das Bild nicht die volle Fensterbreite einnimmt.', why: 'Ohne sizes nimmt der Browser 100vw an und lädt zu große Dateien.', fix: 'sizes ehrlich an das Layout anpassen und mit dem Entwicklerwerkzeug prüfen, welche Datei gewählt wird.' },
      { wrong: 'Das wichtigste Bild im oberen Bereich mit loading="lazy" zu versehen.', why: 'Der Browser verzögert dann genau das Bild, das den sichtbaren Aufbau bestimmt.', fix: 'Oberhalb der Falz kein lazy, dafür fetchpriority="high"; lazy nur für Bilder weiter unten.' },
      { wrong: 'width und height wegzulassen, weil das CSS die Größe setzt.', why: 'Vor dem Laden ist keine Höhe bekannt; der Inhalt darunter springt.', fix: 'Immer die Originalmaße als Seitenverhältnis angeben und in CSS height: auto setzen.' },
      { wrong: 'Dekorative Bilder mit Dateinamen als alt oder ganz ohne alt auszuliefern.', why: 'Screenreader lesen den Dateinamen vor oder melden das Bild ohne Namen.', fix: 'Informative Bilder beschreiben, rein dekorative mit alt="" kennzeichnen.' },
    ],
    practice: 'Nimm ein echtes Bild deiner Seite, erzeuge zwei bis drei Breiten, trage srcset, sizes, width und height ein und prüfe im Netzwerk-Tab der Entwicklerwerkzeuge, welche Datei bei welcher Fensterbreite und Pixeldichte geladen wird. Notiere die gesparten Bytes auf dem Smartphone.',
    exercises: [
      { task: 'Ergänze bilder.html um ein weiteres Bild mit 1440w und passe sizes so an, dass es ab 80 rem Fensterbreite 40 rem breit ist; sage vorher voraus, welche Datei bei 1600 px Fenster und Dichte 2 gewählt wird.', acceptance: 'Die Vorhersage (80 rem = 1280 px; 40 rem = 640 px; Dichte 2 = 1280 Pixel) stimmt mit der im Netzwerk-Tab gesehenen Datei überein oder die Abweichung ist begründet.' },
      { task: 'Grenzfall: Was passiert bei 320 px Fensterbreite und Dichte 1 mit dem picture-Beispiel, und warum bleibt das Layout stabil, wenn die quadratische Datei geladen wird?', acceptance: 'Es erscheint lernkarte-quadrat.svg; du erklärst, dass width und height des img-Elements trotzdem das Verhältnis 3:2 reservieren, und nennst den Nachteil (der Ausschnitt ist quadratisch, die reservierte Fläche nicht) sowie einen Ausweg (width/height pro source).' },
      { task: 'Fehlerfall: Entferne width und height, blockiere die Bilddateien im Entwicklerwerkzeug und miss die Höhe des Bildes vor dem Laden.', acceptance: 'Die Höhe ist 0 oder nur so groß wie das alt; du erklärst den Layoutsprung beim Laden und stellst ihn mit den Attributen wieder her.' },
    ],
    quiz: [
      { q: 'Wozu dient das Attribut sizes zusammen mit srcset?',
        options: ['Es verrät dem Browser, wie breit das Bild im Layout erscheint.', 'Es legt fest, wie viele Bytes die Datei höchstens haben darf.', 'Es erzwingt, dass immer die größte Datei der Liste geladen wird.', 'Es ersetzt die Angabe von width und height im img-Element.'],
        correct: 0,
        rationales: ['Mit der Layoutbreite und der Pixeldichte wählt der Browser aus srcset die passende Datei.', 'Dateigrößen werden damit nicht begrenzt.', 'Das Gegenteil ist das Ziel: eine ausreichende, nicht die größte Datei.', 'width und height sichern das Seitenverhältnis und bleiben nötig.'],
        explain: 'sizes ist die Layoutangabe, aus der der Browser mit der Pixeldichte die passende srcset-Datei ableitet.' },
      { q: 'Wann ist picture mit source media die richtige Wahl gegenüber reinem srcset?',
        options: ['Wenn die Datei auf jedem Gerät möglichst klein sein soll.', 'Wenn der Browser die Dateiauswahl komplett selbst treffen soll.', 'Wenn auf schmalen Anzeigen ein anderer Bildausschnitt erscheinen soll.', 'Wenn das Bild keinen Alternativtext braucht, weil es dekorativ ist.'],
        correct: 2,
        rationales: ['Dafür genügt srcset mit passenden Breiten.', 'Genau das leistet srcset mit sizes; picture legt dagegen feste Bedingungen fest.', 'Art Direction (anderer Ausschnitt oder anderes Format) ist der Einsatzzweck von picture.', 'Der Alternativtext gehört am img-Element zu jedem Bild, auch in picture.'],
        explain: 'picture steuert Ausschnitt und Format über feste Bedingungen; srcset überlässt die Wahl der Dateigröße dem Browser.' },
      { q: 'Warum gehören width und height auch dann ins img, wenn CSS die Größe bestimmt?',
        options: ['Sie sind die Pflichtangabe, ohne die ein Bild nicht anzeigt wird.', 'Sie liefern das Seitenverhältnis, damit der Platz vor dem Laden reserviert wird.', 'Sie verbessern die Bildqualität auf Bildschirmen mit hoher Dichte.', 'Sie verhindern, dass der Browser srcset und sizes auswertet.'],
        correct: 1,
        rationales: ['Ohne die Attribute wird das Bild trotzdem angezeigt, es springt nur beim Laden.', 'So bleibt der Inhalt darunter stabil und die Layoutverschiebung (CLS) klein.', 'Die Qualität hängt von der gewählten Datei ab, nicht von diesen Attributen.', 'Beide Mechanismen wirken unabhängig voneinander.'],
        explain: 'Der Browser leitet aus width und height ein Seitenverhältnis ab und reserviert die Höhe vor dem Laden.' },
    ],
    sources: [
      mdn('Responsive Bilder', 'Web/HTML/Guides/Responsive_images', 'Anleitung zu srcset, sizes und picture.'),
      mdn('img-Element', 'Web/HTML/Reference/Elements/img'),
      { title: 'W3C WAI: Images Tutorial', url: 'https://www.w3.org/WAI/tutorials/images/', note: 'Wann ein Bild Alternativtext braucht und wann alt="" richtig ist.' },
      { title: 'web.dev: Optimize Cumulative Layout Shift', url: 'https://web.dev/articles/optimize-cls', note: 'Erläutert Layoutverschiebungen und die Rolle von width und height.' },
    ],
    verification: 'Geprüft wurde mit den Playwright-Tests in Chromium 158: die Dateiauswahl in vier Kombinationen aus Fensterbreite und Pixeldichte, der picture-Wechsel, das Seitenverhältnis bei blockierten Bildern und die Attribute. Nicht geprüft wurden Firefox, Safari, die Auswahl bei gefülltem Cache, reale Netzwerkzeiten und moderne Bildformate (das Lab nutzt nur eigene SVG-Dateien).',
  },
  {
    id: 'html-m2-l2', title: 'Kopfbereich, Meta-Angaben und strukturierte Daten', minutes: 30,
    prerequisites: 'Lektion „Deine erste HTML-Seite und das Dokumentgerüst“; Überschriften und Semantik aus der zweiten Lektion.',
    objectives: [
      'Die wichtigsten Angaben im head benennen und begründen (lang, title, description, canonical, viewport)',
      'Erkennen, warum user-scalable=no und maximum-scale=1 die Barrierefreiheit verletzen',
      'JSON-LD nur für Inhalte einsetzen, die auf der Seite sichtbar sind',
      'Eine kleine Prüffunktion schreiben und an einer guten und einer fehlerhaften Seite testen',
    ],
    simple: `Der head einer Seite ist unsichtbar, aber er entscheidet mit: Er sagt Browsern, Suchmaschinen, Screenreadern und Vorschaudiensten, worum es geht. Der title steht im Browser-Tab, in der Verlaufsliste und meist als Überschrift eines Suchergebnisses. Die description ist eine Zusammenfassung, die Suchmaschinen oft, aber nicht immer als Vorschautext verwenden. Das lang-Attribut am html-Element nennt die Sprache, damit Screenreader die richtige Aussprache wählen.

Zwei weitere Angaben verdienen Aufmerksamkeit. Der canonical-Link nennt die bevorzugte Adresse einer Seite, wenn dieselbe Seite unter mehreren Adressen erreichbar ist. Das meta viewport sorgt dafür, dass Smartphones die Seite in ihrer echten Breite darstellen. Wer dort das Zoomen verbietet, sperrt Menschen aus, die ohne Vergrößern nicht lesen können.

Strukturierte Daten (JSON-LD) beschreiben den Inhalt für Maschinen, zum Beispiel einen Artikel mit Titel, Datum und Autorin. Sie sind kein Zaubermittel für bessere Plätze: Suchmaschinen verlangen, dass sie zum sichtbaren Inhalt passen. Was auf der Seite nicht steht, gehört auch nicht in die Daten.`,
    steps: [
      'Öffne head.html. Das html-Element trägt lang="de". Der title lautet „Flexbox lernen: Navigation und Reihen | Root Road“, passt zur h1 und nennt zuerst das Thema, dann die Marke.',
      'Die description fasst den Nutzen in einem Satz zusammen. Die Prüffunktion erwartet 50 bis 170 Zeichen: Das ist eine Faustregel dieses Labs, keine Vorgabe von Suchmaschinen, die längere Texte abschneiden oder umschreiben können.',
      'link rel="canonical" zeigt auf die bevorzugte Adresse. Die Adresse steht hier mit example.test, damit niemand sie versehentlich als echte Seite versteht.',
      'meta viewport enthält nur width=device-width und initial-scale=1. Die Prüffunktion meldet user-scalable=no und maximum-scale=1 als Fehler, weil sie das Vergrößern verhindern (WCAG 1.4.4 verlangt, dass Text auf 200 % vergrößert werden kann).',
      'Die Open-Graph-Angaben (og:title, og:description, og:type, og:url) steuern die Vorschau in Chats und sozialen Netzwerken. Sie sind keine Pflicht und ersetzen die normale description nicht.',
      'Der JSON-LD-Block beschreibt einen Article mit headline, inLanguage, datePublished und author. Die Prüffunktion liest ihn mit JSON.parse; ungültiges JSON würde als Befund gemeldet. Der Test vergleicht die headline mit dem title und der sichtbaren h1.',
      'head-fehler.html enthält absichtlich: kein lang, ein zu kurzer title, eine zu kurze description, kein canonical, gesperrtes Zoomen und zwei h1. Die Prüffunktion meldet jeden Fehler einzeln mit Klartext.',
    ],
    background: `Warum prüft man den head per Code? Weil Fehler dort unsichtbar sind. Eine Seite ohne lang sieht gleich aus, klingt für Screenreader aber falsch; ein vergessenes noindex oder ein falscher canonical fällt erst in der Statistik auf. Eine kleine Prüffunktion, die bei jedem Seitentyp läuft, macht aus dem Gefühl „sollte passen“ eine wiederholbare Prüfung. Sie ersetzt aber keine inhaltliche Prüfung: Ob ein title die Suchabsicht trifft, sagt dir kein Skript.

Zu JSON-LD: Die Richtlinien für strukturierte Daten bei Google verlangen, dass die Auszeichnung zum sichtbaren Inhalt der Seite passt und nicht in die Irre führt. Außerdem wird jede Auszeichnung nur für bestimmte Seitentypen ausgewertet. Behandle JSON-LD deshalb als Beschreibung dessen, was da ist, und validiere es mit einem Prüfwerkzeug; dieses Lab prüft nur, ob das JSON gültig ist und zum Titel passt, nicht, ob eine Suchmaschine es anzeigt.`,
    terms: [
      { term: 'canonical', text: 'Link auf die bevorzugte Adresse einer Seite, wenn mehrere Adressen denselben Inhalt liefern.' },
      { term: 'viewport', text: 'Meta-Angabe, die die Darstellungsbreite auf Mobilgeräten steuert.' },
      { term: 'Open Graph', text: 'Meta-Angaben für die Linkvorschau in Chats und sozialen Netzwerken.' },
      { term: 'JSON-LD', text: 'Strukturierte Beschreibung des Inhalts als JSON in einem script-Block mit type="application/ld+json".' },
    ],
    code: { file: lab + 'head.html', lang: 'HTML', from: '<html lang="de">', to: '</script>' },
    code2: { file: lab + 'check-head.js', lang: 'JavaScript' },
    code3: { file: 'tests/html-css-vertiefung.spec.mjs', lang: 'JavaScript', from: "test('Vollständige Seite besteht, Fehlerseite", to: "'erwartet genau eine h1, gefunden: 2',", plus: 2 },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: `Playwright 1.65.0, Chromium 158.0.8127.18, 2 Tests für den Kopfbereich grün:
checkHead() für head.html -> []   (keine Befunde)
checkHead() für head-fehler.html ->
  lang am html-Element fehlt
  title ist zu kurz, um die Seite zu beschreiben
  meta description hat 5 Zeichen (Richtwert: 50 bis 170)
  canonical-Link fehlt
  viewport verhindert das Zoomen (user-scalable/maximum-scale)
  erwartet genau eine h1, gefunden: 2
JSON-LD parsebar, @type = Article, headline = Teil des title vor " | "
Nicht geprüft: Darstellung in Suchergebnissen, Rich-Result-Berechtigung, Wirkung der description, Linkvorschau in Chat-Diensten.`,
    mistakes: [
      { wrong: 'Das Zoomen mit user-scalable=no oder maximum-scale=1 zu sperren, weil die Seite „sauberer“ wirkt.', why: 'Menschen mit Sehbehinderung können Text nicht vergrößern; WCAG 1.4.4 verlangt Vergrößerbarkeit.', fix: 'Nur width=device-width, initial-scale=1 setzen und das Layout für Zoom und schmale Fenster auslegen.' },
      { wrong: 'Auf jeder Seite denselben title und dieselbe description zu verwenden.', why: 'Tab, Lesezeichen und Suchergebnisse sind nicht unterscheidbar; Screenreader-Nutzer verlieren Orientierung.', fix: 'Pro Seite einen eigenen title (Thema zuerst) und eine eigene description.' },
      { wrong: 'JSON-LD mit Angaben zu füllen, die auf der Seite nicht zu sehen sind (Bewertungen, Preise, Autoren).', why: 'Die Auszeichnung führt in die Irre und verstößt gegen die Richtlinien von Suchmaschinen.', fix: 'Nur beschreiben, was sichtbar ist; mit einem Validierungswerkzeug prüfen.' },
      { wrong: 'lang wegzulassen oder auf der falschen Sprache stehen zu lassen.', why: 'Screenreader wählen die falsche Aussprache; Übersetzungsfunktionen erraten die Sprache.', fix: 'lang="de" am html-Element, bei fremdsprachigen Abschnitten lang am jeweiligen Element.' },
    ],
    practice: 'Binde check-head.js als Lesezeichen oder Test in dein Projekt ein, lass es über jede Seitenvorlage laufen und notiere die Befunde. Entscheide bei jedem Befund, ob die Regel des Labs oder deine Seite angepasst werden muss.',
    exercises: [
      { task: 'Schreibe für eine eigene Seite title, description, canonical und lang und prüfe sie mit checkHead().', acceptance: 'checkHead() liefert eine leere Liste; der title nennt das Thema zuerst und passt zur h1.' },
      { task: 'Grenzfall: Setze den title auf genau 65 und auf 66 Zeichen und die description auf 49, 50, 170 und 171 Zeichen.', acceptance: 'Die Grenzen 65/66 und 49/50, 170/171 verhalten sich wie in der Funktion definiert; du erklärst, dass diese Zahlen Faustregeln des Labs sind und keine Regeln einer Suchmaschine.' },
      { task: 'Fehlerfall: Mache das JSON-LD ungültig (Komma am Ende) und führe die Prüfung aus.', acceptance: 'Der Befund „JSON-LD Nr. 1 ist kein gültiges JSON“ erscheint; du korrigierst den Fehler und erklärst, warum ein Parser kein nachgestelltes Komma erlaubt.' },
    ],
    quiz: [
      { q: 'Warum ist user-scalable=no im viewport-Meta problematisch?',
        options: ['Es verhindert, dass Text auf Mobilgeräten vergrößert werden kann.', 'Es lädt die Seite auf Smartphones deutlich langsamer.', 'Es verbietet Suchmaschinen, die Seite zu indexieren.', 'Es deaktiviert das responsive Layout der gesamten Seite.'],
        correct: 0,
        rationales: ['Die Sperre nimmt Menschen mit eingeschränktem Sehvermögen die Möglichkeit zur Vergrößerung.', 'Die Ladezeit bleibt unverändert.', 'Indexierung steuern robots-Angaben, nicht das viewport-Meta.', 'Das Layout hängt von CSS ab; die Sperre betrifft nur das Zoomen.'],
        explain: 'WCAG 1.4.4 verlangt, dass Text ohne Hilfsmittel auf 200 % vergrößert werden kann; die Zoomsperre verletzt das.' },
      { q: 'Was gehört in strukturierte Daten (JSON-LD) einer Seite?',
        options: ['Alle Angaben, die Suchmaschinen gefallen könnten, auch wenn sie unsichtbar sind.', 'Nur Angaben, die auch im sichtbaren Inhalt der Seite vorkommen.', 'Ausschließlich Preise, denn andere Felder werden nicht ausgewertet.', 'Ein Duplikat der gesamten Seite, damit nichts verloren geht.'],
        correct: 1,
        rationales: ['Unsichtbare Angaben führen in die Irre und widersprechen den Richtlinien.', 'Die Auszeichnung beschreibt den sichtbaren Inhalt; sie muss zur Seite passen.', 'Es gibt viele Typen (Artikel, Veranstaltung, Organisation); Preise sind nur einer davon.', 'Strukturierte Daten sind eine knappe Beschreibung, keine Kopie.'],
        explain: 'JSON-LD soll beschreiben, was auf der Seite zu sehen ist; unsichtbare Angaben gelten als irreführend.' },
      { q: 'Wozu dient der canonical-Link?',
        options: ['Er schützt die Seite vor dem Kopieren durch andere Websites.', 'Er verbessert die Ladezeit, indem er Dateien im Voraus lädt.', 'Er legt die Schriftart fest, die auf allen Seiten gilt.', 'Er nennt die bevorzugte Adresse, wenn der Inhalt mehrfach erreichbar ist.'],
        correct: 3,
        rationales: ['Ein Link verhindert kein Kopieren.', 'Das Vorladen übernehmen andere Angaben, etwa preload.', 'Schriften werden im CSS festgelegt.', 'Er hilft Suchmaschinen, doppelte Inhalte auf eine Adresse zu bündeln.'],
        explain: 'canonical bündelt mehrere Adressen desselben Inhalts auf eine bevorzugte Adresse; er ist ein Hinweis, keine Garantie.' },
    ],
    sources: [
      mdn('Dokument-Metadaten (meta-Element)', 'Web/HTML/Reference/Elements/meta'),
      wcag('Resize Text (1.4.4)', 'resize-text'),
      { title: 'Google Search Central: Titellinks', url: 'https://developers.google.com/search/docs/appearance/title-link', note: 'Erläutert, wie Suchergebnistitel entstehen und warum Längen nur Richtwerte sind.' },
      { title: 'Google Search Central: Richtlinien für strukturierte Daten', url: 'https://developers.google.com/search/docs/appearance/structured-data/sd-policies', note: 'Verlangt, dass Auszeichnung zum sichtbaren Inhalt passt.' },
    ],
    verification: 'Geprüft wurde mit Playwright in Chromium 158: Die Prüffunktion findet auf der Fehlerseite alle sechs eingebauten Fehler und meldet auf der guten Seite nichts; das JSON-LD ist gültig und passt zu title und h1. Nicht geprüft wurden die Anzeige in Suchmaschinen und Chat-Diensten sowie die Wirkung der Angaben auf Rankings. Die Zeichenzahlen sind Faustregeln dieses Labs.',
  },
  {
    id: 'html-m2-l3', title: 'Native Interaktion: dialog, popover und details ohne Framework', minutes: 35,
    prerequisites: 'Lektion „Formulare, Labels und native Validierung“; Grundkenntnisse in JavaScript (Ereignisse) für den Dialog.',
    objectives: [
      'Einen modalen Dialog mit showModal() öffnen und sein Tastatur- und Fokusverhalten erklären',
      'Mit method="dialog" und returnValue zwischen Bestätigen und Abbrechen unterscheiden',
      'Ein Popover mit dem Attribut popovertarget ohne JavaScript öffnen und schließen',
      'Mehrere details-Elemente mit gleichem name exklusiv machen und passend einsetzen',
    ],
    simple: `Früher bauten Entwicklerteams Dialoge, Menüs und Aufklapplisten mit div-Elementen, Skripten und ARIA-Attributen. Das ist aufwendig und oft fehlerhaft: Der Fokus landet an der falschen Stelle, Escape tut nichts, der Hintergrund bleibt bedienbar. Heute bringt der Browser vieles selbst mit, und genau das solltest du zuerst nutzen.

Das Element dialog ist ein Fenster in der Seite. Öffnest du es mit showModal(), wird der Rest der Seite abgedunkelt und unbedienbar (inert), der Fokus wandert in den Dialog, Escape schließt ihn, und nach dem Schließen springt der Fokus zum Auslöser zurück. Ein Formular mit method="dialog" schließt den Dialog beim Absenden und liefert den value des gedrückten Buttons als returnValue. So lässt sich „Abbrechen“ von „Bestätigen“ unterscheiden.

Das Attribut popover macht ein Element zu einer eingeblendeten Fläche, die ein Button mit popovertarget öffnet und schließt. Escape und Klick daneben schließen sie, ganz ohne JavaScript. Und mehrere details-Elemente mit gleichem name verhalten sich wie eine Aufklappliste, bei der immer nur ein Eintrag offen ist.`,
    steps: [
      'Öffne interaktion.html. Der Button „Fortschritt zurücksetzen …“ ruft dialog.showModal() auf. Der Dialog trägt aria-labelledby, damit sein Name die Überschrift ist.',
      'Im Dialog sitzt ein Formular mit method="dialog". Der Button „Abbrechen“ hat autofocus: Bei einer zerstörerischen Aktion beginnt der Fokus auf der sicheren Wahl, nicht auf „Zurücksetzen“.',
      'Der Test drückt Tab mehrere Male im geöffneten Dialog: Der Fokus verlässt den Dialog nicht auf die Seite dahinter. Mit Escape schließt der Dialog, der Fokus liegt wieder am Auslöser, returnValue ist leer und die Meldung lautet „Abgebrochen.“.',
      'Wird „Zurücksetzen“ gedrückt, ist returnValue gleich „loeschen“. Das close-Ereignis wertet das aus. Wichtig: Der Dialog selbst löscht nichts; die Demo zeigt nur eine Meldung, echtes Löschen braucht eigene Logik und Absicherung.',
      'Der Popover-Button (popovertarget="hinweis") öffnet das Element mit dem Attribut popover. Escape und ein Klick außerhalb schließen es („Light Dismiss“). Es ist nicht modal: Der Rest der Seite bleibt bedienbar.',
      'Zwei details-Elemente mit name="faq" sind exklusiv: Öffnest du das zweite, schließt sich das erste. Das summary-Element ist der Schalter und per Tastatur mit Enter oder Leertaste bedienbar.',
      'Wann welches Mittel? dialog für Entscheidungen, die den Ablauf unterbrechen. popover für kleine Zusatzinformationen oder Menüs. details für Inhalte, die man bei Bedarf aufklappt. Ein Dialog für alles zu nutzen, überfordert Menschen und unterbricht ihre Arbeit unnötig.',
    ],
    background: `Warum sind native Elemente besser als eigene Bausteine? Sie liefern Tastaturbedienung, Fokusführung und Bedeutung für assistive Technik von Haus aus und werden vom Browserhersteller gepflegt. Ein selbstgebauter Dialog muss all das nachbauen, und jede Lücke trifft zuerst Menschen, die Tastatur oder Screenreader nutzen. Native Elemente sind kein Freibrief: Du musst trotzdem beschriften (Name des Dialogs, Text des summary), den Startfokus bewusst wählen und Inhalte so schreiben, dass sie ohne Sehen und ohne Maus funktionieren.

Zur Verfügbarkeit: Für details mit name führt MDN den Stand „Baseline 2024, neu verfügbar“ (in allen Kernbrowsern seit September 2024). Prüfe vor dem Einsatz die aktuelle Verfügbarkeit von popover, dialog und details name auf den MDN-Seiten, denn der Stand ändert sich. Dieses Lab wurde nur in Chromium getestet.`,
    terms: [
      { term: 'inert', text: 'Zustand, in dem Teile der Seite weder fokussierbar noch bedienbar sind; showModal() setzt den Hintergrund inert.' },
      { term: 'returnValue', text: 'Wert des Buttons, mit dem ein Dialog geschlossen wurde.' },
      { term: 'Light Dismiss', text: 'Schließen eines Popovers durch Escape oder Klick außerhalb.' },
      { term: 'modal', text: 'Blockiert die Bedienung der Seite dahinter, bis die Entscheidung getroffen ist.' },
    ],
    code: { file: lab + 'interaktion.html', lang: 'HTML', from: '<button type="button" id="dialog-auf">', to: '<p id="ergebnis" role="status"></p>' },
    code2: { file: lab + 'interaktion.html', lang: 'HTML', from: '<button type="button" id="hinweis-auf"', to: '<summary>Wofür ist <code>alt</code> da?</summary><p>Es ersetzt das Bild für Menschen, die es nicht sehen.</p></details>' },
    code3: { file: lab + 'interaktion.html', lang: 'JavaScript', from: 'const dialog = document.getElementById', to: "dialog.addEventListener('close'", plus: 0 },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: `Playwright 1.65.0, Chromium 158.0.8127.18, 4 Tests für Interaktion grün:
Dialog: Fokus auf "Abbrechen", Tab bleibt im Dialog, Escape schließt, Fokus zurück am Auslöser, Meldung "Abgebrochen."
Dialog: "Zurücksetzen" -> returnValue "loeschen" -> Meldung "Zurückgesetzt (Demo)."
Popover: Button öffnet, Escape schließt, Klick daneben schließt
details name="faq": [offen, zu] -> Klick auf zweiten Eintrag -> [zu, offen]
Nicht getestet: Screenreader-Ansagen, Firefox, Safari, Touch-Bedienung, mehrere verschachtelte Dialoge.`,
    mistakes: [
      { wrong: 'Einen Dialog mit show() statt showModal() zu öffnen und trotzdem „modal“ zu erwarten.', why: 'show() öffnet einen nicht-modalen Dialog: Der Hintergrund bleibt bedienbar, es gibt keinen Backdrop und keine Fokusführung.', fix: 'Für Entscheidungen showModal() nutzen; show() nur für bewusst nicht-modale Hinweise.' },
      { wrong: 'Bei einer zerstörerischen Aktion den Startfokus auf „Löschen“ zu setzen.', why: 'Ein versehentliches Enter löscht sofort.', fix: 'autofocus auf die sichere Wahl („Abbrechen“) setzen und die Bestätigung bewusst anbieten.' },
      { wrong: 'Dialog und Popover zu verwechseln und Pflichtentscheidungen in ein Popover zu legen.', why: 'Ein Popover lässt sich durch Klick daneben schließen und blockiert nichts; die Entscheidung kann unbemerkt verschwinden.', fix: 'Entscheidungen im modalen Dialog, Zusatzinfos im Popover.' },
      { wrong: 'Alle Inhalte hinter details zu verstecken, die Nutzerinnen und Nutzer sofort brauchen.', why: 'Zusätzliche Klicks kosten Zeit; Suchfunktion und Orientierung leiden.', fix: 'Aufklappen nur für wirklich nachrangige Inhalte wie Zusatzfragen.' },
    ],
    practice: 'Ersetze in einem eigenen Projekt eine selbstgebaute Bestätigung durch ein dialog-Element. Prüfe nur mit der Tastatur: Fokus beim Öffnen, Tab-Reihenfolge, Escape, Fokus beim Schließen. Notiere, was du an Code löschen konntest.',
    exercises: [
      { task: 'Baue einen Dialog „Abmelden bestätigen?“ mit zwei Buttons und werte returnValue aus.', acceptance: 'Escape und Abbrechen liefern dasselbe Ergebnis (kein returnValue bzw. „abbrechen“); der Fokus kehrt zum Auslöser zurück; der Dialog hat einen zugänglichen Namen.' },
      { task: 'Grenzfall: Öffne den Dialog bei 320 px Fensterbreite und 200 % Zoom und prüfe, ob alle Buttons erreichbar sind.', acceptance: 'Der Dialog bleibt innerhalb des Fensters (max-width mit calc), Inhalt ist scrollbar oder umbricht; nichts ragt ab; du nennst die verwendete CSS-Regel.' },
      { task: 'Fehlerfall: Entferne autofocus und beschreibe, wo der Fokus beim Öffnen landet; ändere dann die Reihenfolge der Buttons und prüfe erneut.', acceptance: 'Der Fokus liegt standardmäßig auf dem ersten fokussierbaren Element im Dialog; du erklärst, warum bei zerstörerischen Aktionen autofocus auf der sicheren Wahl besser ist.' },
    ],
    quiz: [
      { q: 'Was passiert beim Öffnen eines dialog-Elements mit showModal()?',
        options: ['Der Dialog erscheint, die Seite dahinter bleibt voll bedienbar.', 'Der Rest der Seite wird inert, der Fokus wandert in den Dialog.', 'Der Dialog öffnet sich in einem neuen Browserfenster.', 'Die Seite wird neu geladen und der Dialog ist danach offen.'],
        correct: 1,
        rationales: ['Das wäre show(): nicht modal, ohne Fokusführung.', 'Hintergrund inert, Fokus im Dialog, Escape schließt, Fokus kehrt zurück.', 'Ein Dialog ist Teil der Seite, kein Fenster.', 'Es findet kein Neuladen statt.'],
        explain: 'showModal() blockiert die Seite dahinter, setzt den Fokus in den Dialog und gibt ihn beim Schließen zurück.' },
      { q: 'Woran erkennt JavaScript, welcher Button einen Dialog mit method="dialog" geschlossen hat?',
        options: ['Am Wert dialog.returnValue, der dem value des Buttons entspricht.', 'An der Reihenfolge der Buttons im Formular.', 'An einem versteckten Eingabefeld, das der Browser automatisch anlegt.', 'Gar nicht, dafür braucht jeder Button einen eigenen Klick-Handler.'],
        correct: 0,
        rationales: ['Das close-Ereignis kann returnValue lesen.', 'Die Reihenfolge wird nicht ausgewertet.', 'Der Browser legt kein verstecktes Feld an.', 'Klick-Handler sind nicht nötig; returnValue genügt.'],
        explain: 'Ein Formular mit method="dialog" schließt den Dialog und setzt returnValue auf den value des gedrückten Buttons.' },
      { q: 'Worin unterscheidet sich ein Popover von einem modalen Dialog?',
        options: ['Ein Popover blockiert die Seite, ein Dialog nicht.', 'Ein Popover braucht immer JavaScript, ein Dialog nie.', 'Ein Popover lässt sich nicht per Tastatur erreichen.', 'Ein Popover blockiert nichts und schließt per Escape oder Klick daneben.'],
        correct: 3,
        rationales: ['Es ist umgekehrt: Der modale Dialog blockiert.', 'Mit popovertarget funktioniert das Popover ohne JavaScript.', 'Der auslösende Button ist normal per Tastatur bedienbar.', 'Deshalb eignet sich das Popover für Zusatzinfos, nicht für Pflichtentscheidungen.'],
        explain: 'Popover sind nicht modal und lassen sich leicht schließen; wichtige Entscheidungen gehören in einen modalen Dialog.' },
    ],
    sources: [
      mdn('dialog-Element', 'Web/HTML/Reference/Elements/dialog'),
      mdn('popover-Attribut', 'Web/HTML/Reference/Global_attributes/popover'),
      mdn('details-Element', 'Web/HTML/Reference/Elements/details'),
      mdn('HTMLDetailsElement: name', 'Web/API/HTMLDetailsElement/name', 'Beschreibt die exklusive Gruppe und führt den Baseline-Status.'),
    ],
    verification: 'Geprüft wurde mit Playwright in Chromium 158 per Tastatur und Maus: Fokus, Tab-Verhalten, Escape, returnValue, Popover und exklusive details. Nicht geprüft wurden Screenreader, Firefox, Safari, Touchbedienung und das Verhalten bei verschachtelten Dialogen. Die Verfügbarkeit in anderen Browsern ist vor dem Einsatz auf den MDN-Seiten zu prüfen.',
  },
  {
    id: 'html-m2-l4', title: 'Barrierefreiheit prüfen: Werkzeuge, Skript und Tastaturdurchlauf', minutes: 35,
    prerequisites: 'Alle Lektionen des Moduls „HTML · Struktur und Bedeutung“; Grundlagen zu Formularen und Fokus.',
    objectives: [
      'Typische Fehler (fehlendes alt, fehlendes Label, fehlender Name, Überschriftensprung, geringer Kontrast, kleine Ziele) systematisch finden',
      'Kontrastverhältnisse berechnen und die Schwellen 4,5:1, 3:1 und 24 px Zielgröße einordnen',
      'Die Grenzen automatischer Prüfung benennen und durch einen Tastaturdurchlauf ergänzen',
      'Eine kleine Prüffunktion an einer guten und einer fehlerhaften Seite testen',
    ],
    simple: `Barrierefreiheit zu prüfen heißt zuerst, Fehler zu finden, die sich zählen lassen: ein Bild ohne alt, ein Feld ohne Beschriftung, ein Button ohne Namen, eine übersprungene Überschrift, zu blasser Text, zu kleine Schaltflächen. Solche Fehler kann ein Skript melden. Werkzeuge wie axe, Lighthouse oder WAVE tun das mit deutlich größerem Regelumfang als das kleine Skript in dieser Lektion.

Aber: Automatische Werkzeuge finden nur einen Teil der Probleme. Ob ein alt-Text sinnvoll ist, ob die Reihenfolge beim Tabben logisch ist, ob ein Dialog verständlich ist, ob ein Screenreader das Richtige vorliest – das beurteilt ein Mensch. Deshalb gehört zu jeder Prüfung ein Durchlauf mit der Tastatur, bei dem du nur Tab, Umschalt+Tab, Enter, Leertaste und Escape benutzt und dabei auf sichtbaren Fokus achtest.

Das Skript dieser Lektion ist ein Lernwerkzeug: Du siehst, wie ein Prüfregel aussieht, und kannst sie selbst erweitern. Für echte Projekte nutze zusätzlich ein etabliertes Werkzeug.`,
    steps: [
      'Öffne check-a11y.js. checkA11y(root) sammelt Befunde in einer Liste und gibt sie zurück. Jeder Befund ist ein Satz, der das Problem und die Stelle nennt.',
      'Bilder: Jedes img braucht ein alt-Attribut (WCAG 1.1.1). Auch alt="" ist erlaubt, es kennzeichnet dekorative Bilder; fehlendes alt nicht.',
      'Formularfelder: Jedes Eingabefeld braucht eine Beschriftung, entweder per label-Element (field.labels), aria-label oder aria-labelledby (WCAG 1.3.1 und 4.1.2). Ein placeholder allein ersetzt kein Label.',
      'Buttons, Links und summary brauchen einen zugänglichen Namen aus Text, aria-label oder dem alt eines enthaltenen Bildes. Ein leerer Button wird als „Schaltfläche“ ohne Zweck angesagt.',
      'Überschriften sollen keine Ebene überspringen: h1 gefolgt von h3 meldet das Skript. Es soll genau ein main-Element geben. Positive tabindex-Werte und doppelte ids werden ebenfalls gemeldet.',
      'Zielgröße: Nach WCAG 2.2 (2.5.8, Stufe AA) sollen Bedienelemente mindestens 24 × 24 CSS-Pixel groß sein, wenn keine Ausnahme greift. Das Skript prüft Buttons, Felder und summary; die Ausnahmen (zum Beispiel Links im Fließtext) bleiben unberücksichtigt. Dieses Projekt strebt für Schaltflächen 44 Pixel an.',
      'Kontrast: Das Skript berechnet das Verhältnis aus der relativen Leuchtdichte (Text gegen den ersten deckenden Hintergrund) und vergleicht mit 4,5:1 oder 3:1 bei großer Schrift (ab 24 px oder 18,66 px fett). Verläufe und Bilder als Hintergrund erfasst es nicht.',
      'Danach folgt der Tastaturdurchlauf: Tab durch die Seite, Fokus sichtbar, Reihenfolge sinnvoll, nichts ohne Maus unerreichbar, Escape schließt Überlagerungen. Der Test macht das für die gute Seite: Tab erreicht das Suchfeld, dann den Button, mit sichtbarem Fokusrahmen (mindestens 2 px).',
    ],
    background: `Wie viel findet Automatik? Aussagen wie „Werkzeuge finden X Prozent der Fehler“ hängen stark von der Messmethode ab und sind keine verlässliche Zahl für deine Seite. Sicher ist nur: Ein Teil der Kriterien lässt sich maschinell prüfen (Vorhandensein, Berechnung), ein anderer Teil braucht Urteilsvermögen (Sinn, Verständlichkeit, Reihenfolge, Bedienbarkeit). Plane deshalb beides ein und dokumentiere, was du wie geprüft hast.

Warum 4,5:1 und 3:1? Die Verhältnisse stammen aus WCAG 2.2: Normaler Text braucht mindestens 4,5:1 (1.4.3), große Schrift und Bedienelemente-Grenzen (1.4.11) mindestens 3:1. Wer unter diesen Werten bleibt, riskiert, dass Menschen mit Sehschwäche den Text nicht lesen können. Die Berechnung selbst ist einfach: Beide Farben werden in relative Leuchtdichten umgerechnet und ins Verhältnis (hellere + 0,05) / (dunklere + 0,05) gesetzt. Das Lab rechnet sie in JavaScript nach.`,
    terms: [
      { term: 'zugänglicher Name', text: 'Der Text, mit dem assistive Technik ein Bedienelement ankündigt (Text, aria-label, alt).' },
      { term: 'Kontrastverhältnis', text: 'Verhältnis der Leuchtdichten von Vorder- und Hintergrundfarbe; mindestens 4,5:1 für normalen Text.' },
      { term: 'Zielgröße', text: 'Fläche eines Bedienelements; WCAG 2.2 verlangt mindestens 24 × 24 CSS-Pixel (AA).' },
      { term: 'Tastaturdurchlauf', text: 'Manuelle Prüfung, bei der die ganze Seite nur mit der Tastatur bedient wird.' },
    ],
    code: { file: lab + 'check-a11y.js', lang: 'JavaScript', from: "root.querySelectorAll('img:not([alt])')", to: 'issues.push(`${el.tagName.toLowerCase()} ohne zugänglichen Namen`)', plus: 0 },
    code2: { file: lab + 'a11y-fehler.html', lang: 'HTML', from: '<body>', to: '</body>' },
    code3: { file: 'tests/html-css-vertiefung.spec.mjs', lang: 'JavaScript', from: "test('Gute Seite hat keine Befunde", to: "expect(issues.some((issue) => issue.startsWith(expected)), `Befund fehlt: ${expected}`).toBe(true);", plus: 2 },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: `Playwright 1.65.0, Chromium 158.0.8127.18, 2 Tests grün:
checkA11y() für a11y-gut.html     -> []
checkA11y() für a11y-fehler.html  -> Befunde in allen Kategorien:
  Bild ohne alt-Attribut: bilder/lernkarte-480.svg
  Formularfeld ohne Beschriftung: suche
  button ohne zugänglichen Namen
  Überschriftenebene springt von h1 auf h3: Ebene übersprungen
  erwartet genau ein main-Element
  id mehrfach vergeben: doppelt
  Zielgröße unter 24 px: ...
  Kontrast ...:1 statt 4.5:1: Zu wenig Kontrast für normalen Text.
Tab-Durchlauf (gute Seite): Suchfeld -> Button "Suchen", Fokusrahmen >= 2 px
Nicht geprüft: Screenreader-Ausgabe, Qualität der Alternativtexte, Lesereihenfolge, Kontrast über Bildern/Verläufen, WCAG-Konformität der Seite insgesamt.`,
    mistakes: [
      { wrong: 'Eine Seite „barrierefrei“ zu nennen, weil Lighthouse oder ein Skript keine Fehler meldet.', why: 'Automatische Prüfung deckt nur einen Teil der Kriterien ab und beurteilt keine Sinnhaftigkeit.', fix: 'Zusätzlich Tastaturdurchlauf und mindestens einen Test mit Screenreader dokumentieren.' },
      { wrong: 'Den Fokusrahmen mit outline: none zu entfernen, weil er „hässlich“ wirkt.', why: 'Tastaturnutzer sehen nicht mehr, wo sie sind (WCAG 2.4.7 Fokus sichtbar).', fix: ':focus-visible mit gut sichtbarem Rahmen gestalten, nicht entfernen.' },
      { wrong: 'placeholder als einziges Label zu verwenden.', why: 'Der Platzhalter verschwindet bei Eingabe, hat oft geringen Kontrast und ist nicht immer ein zugänglicher Name.', fix: 'Sichtbares label mit for/id verbinden; placeholder nur als Beispielwert.' },
      { wrong: 'Kontrast nur im hellen Design zu prüfen.', why: 'Im Dunkelmodus oder bei erzwungenen Farben können dieselben Rollen zu wenig Kontrast haben.', fix: 'Alle Farbrollen in jedem Modus prüfen; Tests wie im Token-Lab laufen lassen.' },
    ],
    practice: 'Lass checkA11y() über eine deiner Seiten laufen, behebe die Befunde, führe danach einen Tastaturdurchlauf durch und prüfe mit einem etablierten Werkzeug (axe, Lighthouse oder WAVE) gegen. Dokumentiere, was nur der manuelle Durchlauf gefunden hat.',
    exercises: [
      { task: 'Ergänze check-a11y.js um eine Regel, die Links mit dem Text „hier“ oder „mehr“ meldet, und teste sie an beiden Seiten.', acceptance: 'Ein Test zeigt: Fehlerseite meldet den Link, gute Seite nicht; du begründest, warum aussagekräftige Linktexte wichtig sind (WCAG 2.4.4).' },
      { task: 'Grenzfall: Setze die Textfarbe auf einen Wert mit Kontrast knapp unter und knapp über 4,5:1 und prüfe beide.', acceptance: 'Der Wert knapp darunter wird gemeldet, der darüber nicht; du berechnest eines der Verhältnisse von Hand nach der Formel (L1+0,05)/(L2+0,05).' },
      { task: 'Fehlerfall: Bau ein Bedienelement, das das Skript nicht erkennt (zum Beispiel ein div mit Klick-Handler, aber ohne Rolle) und beschreibe, warum der Test grün bleibt.', acceptance: 'Du zeigst, dass das div nicht per Tastatur erreichbar und für Screenreader keine Schaltfläche ist, und ersetzt es durch ein button-Element.' },
    ],
    quiz: [
      { q: 'Welches Kontrastverhältnis verlangt WCAG 2.2 AA mindestens für normalen Text?',
        options: ['3:1 für jeden Text, egal wie groß.', '7:1, sonst gilt der Text als nicht lesbar.', '4,5:1 für normalen und 3:1 für großen Text.', 'Es gibt keinen festen Wert, nur ein Gefühl.'],
        correct: 2,
        rationales: ['3:1 gilt nur für große Schrift und bestimmte Bedienelemente.', '7:1 ist die strengere Stufe AAA.', 'Das ist die Anforderung der Stufe AA (1.4.3).', 'Der Wert ist messbar und festgelegt.'],
        explain: 'Normaler Text braucht 4,5:1, großer Text 3:1 (Stufe AA, Kriterium 1.4.3).' },
      { q: 'Warum reicht ein grünes Ergebnis eines automatischen Prüfwerkzeugs nicht als Nachweis?',
        options: ['Weil solche Werkzeuge grundsätzlich fehlerhaft arbeiten.', 'Weil Sinn, Reihenfolge und Bedienbarkeit eine menschliche Prüfung brauchen.', 'Weil ein grünes Ergebnis nur auf Smartphones gilt.', 'Weil Tools nur Farben, aber keinen HTML-Code prüfen können.'],
        correct: 1,
        rationales: ['Sie arbeiten verlässlich, aber nur in ihrem Prüfumfang.', 'Ob ein alt-Text passt oder die Tab-Reihenfolge logisch ist, beurteilt ein Mensch.', 'Das Ergebnis hängt nicht vom Gerät ab.', 'Sie prüfen auch HTML-Struktur, Namen und Rollen.'],
        explain: 'Automatik prüft Vorhandensein und Berechenbares; Sinn und Bedienbarkeit bleiben menschliche Aufgabe.' },
      { q: 'Wie groß sollen Bedienelemente nach WCAG 2.2 (2.5.8, AA) mindestens sein, sofern keine Ausnahme greift?',
        options: ['24 × 24 CSS-Pixel.', '10 × 10 CSS-Pixel.', '44 × 44 CSS-Pixel ausnahmslos.', 'Die Größe ist frei, nur der Abstand zählt.'],
        correct: 0,
        rationales: ['Das ist die Mindestgröße für Stufe AA; 44 Pixel entsprechen der strengeren AAA-Empfehlung.', 'Das ist zu klein.', '44 Pixel nennt das strengere Kriterium 2.5.5 (AAA), nicht das AA-Kriterium.', 'Abstände können eine Ausnahme begründen, ersetzen die Größe aber nicht grundsätzlich.'],
        explain: 'Kriterium 2.5.8 verlangt mindestens 24 × 24 CSS-Pixel, mit Ausnahmen; 44 Pixel sind eine strengere Empfehlung.' },
    ],
    sources: [
      wcag('Contrast (Minimum) (1.4.3)', 'contrast-minimum'),
      wcag('Non-text Contrast (1.4.11)', 'non-text-contrast'),
      wcag('Target Size (Minimum) (2.5.8)', 'target-size-minimum'),
      { title: 'axe-core: Regeln für Barrierefreiheit', url: 'https://github.com/dequelabs/axe-core', note: 'Verbreitete Prüfbibliothek; in dieser Lektion nicht ausgeführt.' },
    ],
    verification: 'Geprüft wurde mit Playwright in Chromium 158: Das Skript meldet auf der Fehlerseite jede eingebaute Fehlerklasse und auf der guten Seite nichts; der Tab-Durchlauf der guten Seite erreicht Feld und Button mit sichtbarem Fokus. Nicht geprüft wurden axe, Lighthouse, WAVE, Screenreader, Alternativtexte inhaltlich und die Konformität einer ganzen Website.',
  },
];
