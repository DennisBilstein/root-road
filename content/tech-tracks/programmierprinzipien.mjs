// Programmierprinzipien · Überblick. Stichtag 16.11.2026.
// Eigene Texte; Code und Tests liegen unter content/examples/node-lab/src/principles/ (node:test, Node.js 22.23).
// Die Quellen werden nur verlinkt, nichts daraus kopiert.
const lab = 'content/examples/node-lab/src/principles/';
const link = (title, url, note) => ({ title, url, note });

export const module = {
  id: 'pp-m1', course: 'prinzipien', part: 35, partTitle: 'Programmierprinzipien',
  title: 'Programmierprinzipien · KISS, DRY, YAGNI, SOLID, Aufbauregeln und DDD im Überblick',
};

export const lessons = [
  {
    id: 'pp-m1-l1', title: 'Die wichtigsten Prinzipien im Überblick: KISS, DRY, YAGNI, SOLID, Aufbauregeln und DDD', minutes: 70,
    prerequisites: 'Funktionen und Klassen in irgendeiner Sprache; die Beispiele sind JavaScript und stehen im Lab, jede Idee gilt aber sprachunabhängig.',
    objectives: [
      'Die Prinzipien KISS, DRY, YAGNI, die fünf SOLID-Regeln, Separation of Concerns, Law of Demeter, Komposition vor Vererbung, Fail Fast und die Regel der geringsten Überraschung in je einem Satz erklären',
      'An einem Vorher/Nachher-Beispiel erkennen, welche Regel eine schlechte Lösung verletzt',
      'Die Grundbegriffe von Domain-Driven Design (einheitliche Fachsprache, Value Object, Aggregate, Bounded Context) einordnen und wissen, wann sich DDD lohnt',
      'Begründen, warum Prinzipien Faustregeln sind, sich gegenseitig widersprechen können und nie ohne Blick auf den Fall angewendet werden',
    ],
    simple: `Prinzipien sind Erfahrungssätze: Menschen haben über Jahrzehnte beobachtet, welche Entscheidungen Programme auf Dauer teuer machen, und die Ergebnisse in kurze Merksätze gefasst. Du brauchst sie, weil Software nicht nur geschrieben, sondern vor allem geändert wird. Ein Prinzip beantwortet immer dieselbe Frage: Wie bleibt die nächste Änderung billig?

Die Merksätze lassen sich in vier Gruppen ordnen. Erstens die Sparsamkeit: KISS („Keep It Simple, Stupid“, halte es einfach), DRY („Don’t Repeat Yourself“, wiederhole dich nicht) und YAGNI („You Aren’t Gonna Need It“, du wirst es nicht brauchen). Zweitens SOLID, fünf Regeln für den Entwurf von Klassen und Funktionen: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation und Dependency Inversion. Drittens Aufbauregeln für das Zusammenspiel von Teilen: Separation of Concerns, Law of Demeter, Komposition vor Vererbung, Fail Fast und die Regel der geringsten Überraschung. Viertens Domain-Driven Design (DDD), ein Ansatz für große Fachanwendungen, der den Code an der Sprache der Fachleute ausrichtet.

Wichtig ist die Haltung: Ein Prinzip ist ein Werkzeug, kein Gesetz. DRY kann übertrieben werden und Dinge verkoppeln, die nichts miteinander zu tun haben. YAGNI schützt vor überflüssigem Aufbau, ist aber keine Ausrede für fehlende Tests oder fehlende Sicherheit. SOLID auf ein Zehn-Zeilen-Skript anzuwenden macht es schlechter. Wer ein Prinzip nennt, sollte immer auch sagen können, welchen Schaden es im konkreten Fall verhindert.

Das Lab zeigt zu jedem Prinzip eine „Vorher“-Fassung, die an der Regel scheitert, und eine „Nachher“-Fassung. Die Tests belegen beides: dass die bessere Fassung dasselbe leistet und woran die schlechtere bricht.`,
    steps: [
      'KISS: Öffne basics.js und vergleiche shippingCentsTangled mit shippingCents. Beide liefern dieselben Preise. Die zweite prüft den Fehlerfall zuerst und listet danach flach die Stufen auf. Frage dich bei jedem Konstrukt: Würde ein Kollege es beim ersten Lesen verstehen?',
      'DRY: validateCustomerName und validateSupplierName enthalten dieselbe Regel, aber nur eine trimmt Leerzeichen. Genau so entstehen Widersprüche. requireText steht dagegen an einer Stelle. DRY meint Wissen, nicht Text: Zwei Zeilen, die nur zufällig gleich aussehen, gehören nicht zusammengelegt.',
      'YAGNI: exportRowsSpeculative bringt Formate, Trennzeichen und Plug-ins mit, die niemand nutzt; das angekündigte Format xml ist nicht einmal umgesetzt. toCsv macht nur, was gefragt ist. Kommt ein zweites Format wirklich, wird dann erweitert, mit Wissen statt mit Vermutungen.',
      'S, Single Responsibility: InvoiceAllInOne rechnet, formatiert und speichert. Die getrennten Funktionen totalCents, formatTotal und saveLine haben je einen Grund zur Änderung. Die Rechnung lässt sich jetzt ohne Speicher testen.',
      'O, Open/Closed: Bei discountSwitch muss jede neue Rabattart die Funktion ändern. Bei applyDiscount ist die Regel ein Eintrag in einer Tabelle; der Test ergänzt „staff“, ohne die Funktion anzufassen.',
      'L, Liskov: Code, der ein Rechteck auf Breite 4 und Höhe 5 setzt, erwartet die Fläche 20. SquareBroken liefert 25, weil es die Erwartung des Obertyps bricht. Ein Untertyp muss sich so verhalten, wie der Aufrufer es vom Obertyp erwartet; sonst ist die Vererbung eine Lüge.',
      'I, Interface Segregation: assertMultiFunction verlangt von jedem Gerät drucken, scannen und faxen. Ein einfacher Drucker scheitert daran. requireCapability fragt nur nach der einen Fähigkeit, die gebraucht wird.',
      'D, Dependency Inversion: OrderServiceCoupled erzeugt seinen Mailversand selbst; im Test löst er echten Versand aus. OrderService bekommt etwas mit send() übergeben, im Test genügt ein Spion, der die Nachrichten sammelt.',
      'Separation of Concerns: handleLineMixed liest, rechnet und formatiert in einem Zug. In structure.js liegen die drei Aufgaben in parseLine, priceCents und renderLine. Die Preisregel kennt keinen Text mehr und ist ohne Text prüfbar.',
      'Law of Demeter: order.customer.address.country verlangt vom Aufrufer, die Innenstruktur zu kennen, und bricht bei fehlender Adresse. order.shippingCountry() beantwortet die Frage selbst; die Struktur dahinter darf sich ändern.',
      'Komposition vor Vererbung: Für jede Kombination aus Zeitstempel und Präfix wäre bei Vererbung eine neue Unterklasse nötig. withTimestamp und withPrefix lassen sich in beliebiger Reihenfolge stapeln.',
      'Fail Fast: parseAgeSilent macht aus „abc“ stillschweigend NaN und aus „12abc“ eine 12. parseAge lehnt beides sofort mit einer verständlichen Meldung ab. Je näher ein Fehler an seiner Ursache auffällt, desto billiger ist er zu finden.',
      'Geringste Überraschung: sortedBad ordnet Zahlen als Text ([1, 10, 9]) und verändert nebenbei das Original. sortedNumbers sortiert numerisch auf einer Kopie. Eine Funktion soll tun, was ihr Name verspricht, und nichts Verstecktes nebenher.',
      'DDD: Öffne ddd.js. Money ist ein Value Object (unveränderlich, durch den Wert bestimmt). Bestellung ist ein Aggregate: Nur ihre Methoden ändern den Zustand, deshalb gelten die Regeln „leere Bestellung nicht bestätigbar“ und „bestätigte Bestellung nicht änderbar“ immer. Im Verkauf und im Versand bedeutet „Kunde“ Verschiedenes; jeder Kontext hat sein eigenes Modell, und alsEmpfaenger übersetzt an der Grenze.',
      'Führe zum Schluss im Ordner content/examples/node-lab die Tests mit „node --test tests/principles-*.test.js“ aus und lies in jedem Test, welche Eigenschaft er belegt.',
    ],
    background: `Warum stehen Prinzipien oft im Konflikt? Weil jedes etwas anderes optimiert. DRY drückt Duplikate weg und erzeugt dadurch Abhängigkeiten: Wer zwei ähnliche Dinge in eine gemeinsame Funktion zwingt, muss sie künftig immer zusammen ändern. Die verbreitete Faustregel „Rule of Three“ (erst beim dritten Mal abstrahieren) bremst das. YAGNI spricht gegen Vorausplanung, SOLID verlangt Erweiterbarkeit; die Auflösung ist die Frage, ob der Bedarf heute belegt ist. Eine Erweiterungsstelle, für die es schon einen zweiten Fall gibt, ist berechtigt, eine für „irgendwann“ nicht.

Herkunft und Einordnung in Stichworten: KISS wird dem Flugzeugbauer Kelly Johnson zugeschrieben. DRY stammt aus dem Buch „The Pragmatic Programmer“ von Andrew Hunt und David Thomas und bezieht sich auf Wissen, nicht auf Textzeilen. YAGNI kommt aus Extreme Programming. Die fünf SOLID-Regeln hat Robert C. Martin zusammengestellt; das Open/Closed-Prinzip geht auf Bertrand Meyer zurück, die Substitutionsregel auf Barbara Liskov. Separation of Concerns beschrieb Edsger Dijkstra 1974. Das Law of Demeter entstand Ende der 1980er Jahre an der Northeastern University. „Fail Fast“ wurde durch Jim Shore bekannt, „Komposition vor Vererbung“ durch das Buch der „Gang of Four“. Domain-Driven Design prägte Eric Evans 2003.

Zu DDD ein ehrlicher Hinweis: Es lohnt sich dort, wo die Fachlogik schwierig und die Fachsprache reichhaltig ist, etwa in Versicherungen, Logistik oder Abrechnung. Für ein Formular, das Daten in eine Tabelle schreibt, ist es Überbau. Die Ideen im Lab (Value Object, Aggregate mit geschützten Regeln, getrennte Modelle je Kontext) sind der Einstieg; strategische Teile wie Context Maps und das Zusammenspiel mehrerer Teams gehören in ein eigenes Thema.

Der Maßstab für alle Prinzipien ist am Ende derselbe: Wie viel kostet die nächste Änderung, und wie leicht lässt sich prüfen, dass sie nichts anderes kaputt macht? Wenn eine Anwendung eines Prinzips die Antwort nicht verbessert, hast du es falsch oder zur falschen Zeit angewendet.`,
    terms: [
      { term: 'KISS', text: 'Keep It Simple, Stupid: unter mehreren Lösungen die einfachste wählen, die das Problem löst.' },
      { term: 'DRY', text: 'Don’t Repeat Yourself: jedes Stück Wissen (eine Regel, eine Konstante) hat genau eine maßgebliche Stelle.' },
      { term: 'YAGNI', text: 'You Aren’t Gonna Need It: nur bauen, was heute gebraucht wird; Vorrat kostet Pflege.' },
      { term: 'Single Responsibility', text: 'Ein Baustein hat genau einen Grund, sich zu ändern.' },
      { term: 'Open/Closed', text: 'Erweiterbar, ohne bestehenden Code zu ändern, zum Beispiel über Regeln als Daten.' },
      { term: 'Liskov Substitution', text: 'Ein Untertyp lässt sich überall einsetzen, wo der Obertyp erwartet wird, ohne dass sich die Erwartungen ändern.' },
      { term: 'Interface Segregation', text: 'Lieber mehrere kleine, passgenaue Verträge als ein großer, den niemand ganz erfüllt.' },
      { term: 'Dependency Inversion', text: 'Fachlicher Code hängt von einer Abstraktion ab (etwas mit send()), nicht von einer konkreten Klasse; die Abhängigkeit wird von außen übergeben.' },
      { term: 'Separation of Concerns', text: 'Verschiedene Aufgaben (Eingabe, Regel, Ausgabe) in getrennten Teilen halten.' },
      { term: 'Law of Demeter', text: 'Ein Baustein spricht nur mit seinen direkten Nachbarn, nicht mit deren Innenleben („nur ein Punkt“).' },
      { term: 'Komposition vor Vererbung', text: 'Verhalten aus kleinen, kombinierbaren Teilen zusammensetzen, statt tiefe Klassenketten zu bauen.' },
      { term: 'Fail Fast', text: 'Ungültige Zustände sofort und laut melden, nicht erst weit hinter der Ursache.' },
      { term: 'Geringste Überraschung', text: 'Eine Funktion verhält sich so, wie ihr Name und ihre Signatur es erwarten lassen.' },
      { term: 'Ubiquitous Language', text: 'Eine einheitliche Fachsprache, die Fachleute und Entwickler gemeinsam verwenden, bis in die Namen im Code.' },
      { term: 'Value Object', text: 'Unveränderliches Objekt, das nur durch seinen Wert bestimmt wird, zum Beispiel ein Geldbetrag mit Währung.' },
      { term: 'Aggregate', text: 'Gruppe von Objekten mit einer Wurzel; Änderungen laufen nur über die Wurzel, damit ihre Regeln immer gelten.' },
      { term: 'Bounded Context', text: 'Abgegrenzter Bereich, in dem ein Fachbegriff genau eine Bedeutung hat; jeder Kontext hat sein eigenes Modell.' },
    ],
    code: { file: lab + 'basics.js', lang: 'JavaScript (ES-Modul)' },
    code2: { file: lab + 'solid.js', lang: 'JavaScript (ES-Modul)' },
    code3: { file: lab + 'structure.js', lang: 'JavaScript (ES-Modul)' },
    code4: { file: lab + 'ddd.js', lang: 'JavaScript (ES-Modul)' },
    order: ['body', 'code', 'code2', 'code3', 'code4', 'body2'],
    output: `Node.js 22.23; Befehl: cd content/examples/node-lab && node --test --test-reporter=spec tests/principles-*.test.js
✔ KISS: flache und verschachtelte Fassung liefern für alle Stufen dasselbe
✔ KISS: ungültiges Gewicht wird in beiden Fassungen abgelehnt (0, negativ, NaN)
✔ DRY: kopierte Regeln laufen auseinander, die gemeinsame Regel nicht
✔ YAGNI: die schlanke Fassung liefert dasselbe wie die spekulative mit Standardwerten
✔ Value Object: gleiche Werte sind gleich, Rechnen erzeugt neue Objekte, Währungen mischen geht nicht
✔ Aggregate: Regeln der Bestellung gelten, weil nur ihre Methoden den Zustand ändern
✔ Bounded Context: Verkauf und Versand haben je ein eigenes Modell, die Grenze übersetzt
✔ S: getrennte Teile ergeben dasselbe wie die Alleskönner-Klasse, die Rechnung braucht aber keinen Speicher
✔ O: eine neue Rabattart ist ein neuer Eintrag, die Funktion bleibt unverändert
✔ L: Code für Rechtecke bricht beim Quadrat als Unterklasse, nicht bei getrennten Formen
✔ I: ein kleines Gerät erfüllt den großen Vertrag nicht, aber den kleinen
✔ D: mit Injektion lässt sich der Dienst ohne echten Versand prüfen
✔ Separation of Concerns: getrennte Schichten ergeben dieselbe Ausgabe, die Regel ist ohne Text prüfbar
✔ Law of Demeter: die Kette bricht bei fehlender Adresse, die Frage an die Bestellung nicht
✔ Komposition vor Vererbung: dieselben Ausgaben ohne Klassenkette
✔ Fail Fast: Müll wird sofort gemeldet statt als NaN weiterzuwandern
✔ Geringste Überraschung: sort() verändert das Original und ordnet Zahlen als Text
ℹ tests 17, pass 17, fail 0`,
    mistakes: [
      { wrong: 'Zwei Codestücke, die nur zufällig gleich aussehen, zu einer gemeinsamen Funktion zusammenzulegen, weil „DRY“ es verlangt.', why: 'DRY meint gemeinsames Wissen. Fachlich verschiedene Regeln, die heute gleich aussehen, ändern sich morgen getrennt; die gemeinsame Funktion zwingt sie dann in Sonderfälle.', fix: 'Erst abstrahieren, wenn derselbe Grund zur Änderung belegt ist (Faustregel: beim dritten Vorkommen), und die Abstraktion nach dem Wissen benennen, nicht nach der Form.' },
      { wrong: 'YAGNI als Begründung zu nehmen, Tests, Eingabeprüfung oder Sicherheitsmaßnahmen wegzulassen.', why: 'YAGNI betrifft vermutete künftige Funktionen. Prüfung, Tests und Schutz gehören zur heutigen Funktion; sie nachzurüsten ist teurer.', fix: 'Funktionen auf Vorrat streichen, Qualitätsmerkmale der heutigen Funktion nicht.' },
      { wrong: 'Für jede Klasse ein Interface und für jede Abhängigkeit eine Fabrik anzulegen, „weil SOLID“.', why: 'Jede Schicht kostet Lesbarkeit. Ohne zweiten Fall oder Testbedarf entsteht nur Umweg.', fix: 'Abstraktionen dort einführen, wo ein Austausch oder ein Test sie verlangt, und die einfachste Form wählen (hier ein übergebenes Objekt mit send()).' },
      { wrong: 'Vererbung zu verwenden, nur um Code wiederzuverwenden, auch wenn der Untertyp den Obertyp nicht vollständig erfüllt.', why: 'Das bricht die Erwartung der Aufrufer (Liskov) und bindet beide Klassen eng aneinander.', fix: '„Ist ein“ nur bei echter Ersetzbarkeit verwenden; sonst Komposition: das Gemeinsame als eigenes Teil, das beide benutzen.' },
      { wrong: 'DDD auf eine einfache Anwendung zu übertragen, die nur Daten speichert und anzeigt.', why: 'Der Aufwand für Aggregates, Kontexte und Fachsprache zahlt sich nur bei schwieriger Fachlogik aus.', fix: 'Zuerst klären, wo die Fachlogik wirklich schwierig ist, und DDD-Mittel nur dort einsetzen.' },
    ],
    practice: `Nimm ein eigenes kleines Programm (oder ein Beispiel aus einer früheren Lektion) und suche je ein Beispiel für drei Prinzipien: eine Stelle mit kopierter Regel (DRY), eine Funktion mit mehr als einem Grund zur Änderung (Single Responsibility) und eine Stelle, die ungültige Eingaben erst spät bemerkt (Fail Fast). Schreibe zu jeder Stelle einen Satz, welche Änderung sie heute teuer macht, und verbessere genau eine davon mit einem Test, der vor und nach der Änderung dasselbe Verhalten belegt.`,
    exercises: [
      { task: 'Normalfall: Erkläre KISS, DRY und YAGNI in je einem Satz und nenne zu jedem ein Beispiel aus dem Lab, das du ohne Blick in die Lektion wiedergeben kannst.', acceptance: 'Die Sätze benennen den Nutzen (billigere Änderung), nicht nur die Abkürzung; die Beispiele nennen Funktion und Eigenschaft (zum Beispiel „requireText: eine Stelle für die Regel“).' },
      { task: 'Grenzfall: Zwei Funktionen berechnen heute zufällig dieselbe Zahl, gehören aber zu verschiedenen Fachregeln (Mehrwertsteuer und Pfand). Entscheide, ob du sie zusammenlegst, und begründe mit DRY und der Rule of Three.', acceptance: 'Du legst nicht zusammen, weil die Regeln sich aus verschiedenen Gründen ändern; du nennst, was passieren würde, wenn sich nur eine Regel ändert.' },
      { task: 'Fehlerfall: Ein Kollege sagt: „Nach YAGNI brauchen wir keine Eingabeprüfung, die baut noch niemand.“ Widerlege das mit der Lektion.', acceptance: 'Du unterscheidest vermutete künftige Funktionen (YAGNI) von Qualitätsmerkmalen der heutigen Funktion und verweist auf Fail Fast und parseAge.' },
    ],
    quiz: [
      {
        q: 'Ein Team baut für einen Export ein Plug-in-System und vier Formate, obwohl nur CSV verlangt ist. Welches Prinzip spricht dagegen, und warum?',
        options: [
          'DRY, weil vier Formate dasselbe Wissen mehrfach ablegen.',
          'Liskov, weil Plug-ins als Untertypen auftreten und ersetzbar sein müssen.',
          'YAGNI, weil Ungebrauchtes trotzdem gebaut und gepflegt werden muss.',
          'Law of Demeter, weil Plug-ins mit den Innenobjekten Fremder sprechen.',
        ],
        correct: 2,
        explain: 'YAGNI warnt vor Funktionen auf Vorrat: Sie kosten Bau, Tests und Pflege, und ob der vermutete Bedarf eintritt, ist offen.',
        rationales: [
          'Die Formate vervielfachen kein Wissen; es geht um Funktionen, die niemand verlangt hat.',
          'Liskov betrifft die Ersetzbarkeit von Untertypen, nicht die Frage, ob etwas gebraucht wird.',
          'Richtig: Auf Vorrat gebaute Optionen verursachen laufende Kosten, ohne dass ein Bedarf belegt ist.',
          'Das Law of Demeter betrifft Zugriffsketten auf fremde Innenstruktur, nicht überzählige Funktionen.',
        ],
      },
      {
        q: 'Code setzt ein Rechteck auf Breite 4 und Höhe 5 und erwartet die Fläche 20. Bei einem Quadrat als Unterklasse kommt 25 heraus. Welche Regel ist verletzt?',
        options: [
          'Das Liskovsche Substitutionsprinzip: Der Untertyp erfüllt die Erwartung des Obertyps nicht.',
          'Dependency Inversion: Das Quadrat hängt von einer konkreten Klasse ab.',
          'Single Responsibility: Das Quadrat hat mehrere Aufgaben.',
          'Fail Fast: Das Quadrat hätte einen Fehler werfen müssen.',
        ],
        correct: 0,
        explain: 'Ein Untertyp muss überall einsetzbar sein, wo der Obertyp erwartet wird. Hier ändert setWidth auch die Höhe und bricht die Annahme des Aufrufers.',
        rationales: [
          'Richtig: Das Quadrat lässt sich nicht an der Stelle des Rechtecks einsetzen, ohne dass der Aufrufer ein falsches Ergebnis bekommt.',
          'Dependency Inversion betrifft die Richtung von Abhängigkeiten, nicht das Verhalten von Untertypen.',
          'Das Quadrat hat eine Aufgabe; das Problem ist das gebrochene Versprechen des Obertyps.',
          'Ein Fehler wäre hier kein Ausweg: Der Aufrufer darf das Verhalten des Obertyps erwarten.',
        ],
      },
      {
        q: 'Im Verkauf bedeutet „Kunde“ etwas anderes als im Versand: Dort zählen Kreditlimit, hier die Lieferadresse. Welche DDD-Idee löst das sauber?',
        options: [
          'Eine einzige Klasse Kunde mit allen Feldern für beide Bereiche.',
          'Ein Value Object, das alle Felder unveränderlich zusammenfasst.',
          'Ein Aggregate, das Verkauf und Versand unter einer Wurzel vereint.',
          'Zwei Bounded Contexts mit je eigenem Modell und einer Übersetzung an der Grenze.',
        ],
        correct: 3,
        explain: 'Ein Bounded Context grenzt ab, wo ein Begriff genau eine Bedeutung hat. Jeder Kontext hat sein eigenes Modell; an der Grenze wird übersetzt.',
        rationales: [
          'Eine Alleskönner-Klasse vermischt beide Bedeutungen und koppelt die Bereiche eng aneinander.',
          'Ein Value Object beschreibt einen unveränderlichen Wert wie einen Geldbetrag, löst aber keine Mehrdeutigkeit zwischen Fachbereichen.',
          'Ein Aggregate sichert Regeln innerhalb eines Modells; es vereint nicht zwei Bedeutungen desselben Begriffs.',
          'Richtig: So sieht der Versand kein Kreditlimit, und beide Modelle bleiben klein und für ihren Zweck passend.',
        ],
      },
    ],
    sources: [
      link('The Pragmatic Programmer (Hunt, Thomas), Verlagsseite', 'https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/', 'Herkunft von DRY; Buch, hier nur verlinkt und in eigenen Worten wiedergegeben.'),
      link('Martin Fowler: Yagni', 'https://martinfowler.com/bliki/Yagni.html', 'Erklärt, warum Funktionen auf Vorrat teuer sind, und wo YAGNI nicht gilt.'),
      link('Robert C. Martin: Design Principles and Design Patterns (Archivkopie)', 'https://web.archive.org/web/20150906155800/http://www.objectmentor.com/resources/articles/Principles_and_Patterns.pdf', 'Zusammenstellung der Prinzipien, aus denen SOLID entstand; Archivkopie des Dokuments.'),
      link('Edsger W. Dijkstra: On the role of scientific thought (EWD447)', 'https://www.cs.utexas.edu/~EWD/transcriptions/EWD04xx/EWD447.html', 'Ursprung des Begriffs „Separation of Concerns“.'),
      link('Jim Shore: Fail Fast (IEEE Software)', 'https://martinfowler.com/ieeeSoftware/failFast.pdf', 'Begründung, warum Fehler früh und laut gemeldet werden sollten.'),
      link('Wikipedia: Law of Demeter', 'https://en.wikipedia.org/wiki/Law_of_Demeter', 'Überblick und Herkunft; Enzyklopädie, Inhalt hier eigenständig zusammengefasst.'),
      link('Wikipedia: Composition over inheritance', 'https://en.wikipedia.org/wiki/Composition_over_inheritance', 'Überblick und Abwägung gegenüber Vererbung; Inhalt hier eigenständig zusammengefasst.'),
      link('Wikipedia: KISS principle', 'https://en.wikipedia.org/wiki/KISS_principle', 'Herkunft und Bedeutung von KISS.'),
      link('Eric Evans: Domain-Driven Design Reference', 'https://www.domainlanguage.com/ddd/reference/', 'Kurzreferenz des Autors zu Begriffen wie Bounded Context, Aggregate, Value Object.'),
      link('Martin Fowler: Bounded Context', 'https://martinfowler.com/bliki/BoundedContext.html', 'Erklärt Bounded Context an einem Beispiel mit mehrdeutigem Begriff.'),
    ],
    verification: `Geprüft wurde mit dem Node.js-Lab (Node.js 22.23 auf macOS): 17 Tests in vier Dateien (basics, solid, structure, ddd) belegen jeweils, dass die „Nachher“-Fassung dasselbe leistet und woran die „Vorher“-Fassung bricht. Jede Ausgabe stammt aus einem echten Lauf. Nicht geprüft: andere Sprachen und Node-Versionen sowie größere Systeme; die Beispiele sind bewusst klein und zeigen eine Idee, keine vollständige Architektur. DDD ist nur im Überblick behandelt (keine Context Maps, keine Ereignisse, keine Persistenz). Die genannten Urheber und Jahreszahlen wurden am 16.11.2026 gegen die verlinkten Quellen und die zugehörigen Wikipedia-Artikel gegengelesen (Meyer und Liskov bei Martin, Jim Shore 2004, Dijkstra 1974, Evans 2003, Demeter 1987, DRY und YAGNI); nicht geprüft ist der Wortlaut der Bücher selbst.`,
  },
];
