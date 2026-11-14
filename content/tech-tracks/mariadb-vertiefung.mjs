// MariaDB · Vertiefung. Stichtag 14.11.2026.
// Eigene Texte; Code und erwartete Ausgaben liegen unter content/examples/sql-lab/ (Docker-Image mariadb:11, Server siehe cases/_version.txt).
// Die Ausgaben der Lektionen werden aus den .expected-Dateien gelesen; node content/examples/sql-lab/run.mjs prüft sie gegen einen frischen Container.
import fs from 'node:fs';

const lab = 'content/examples/sql-lab/';
const version = fs.readFileSync(`${lab}cases/_version.txt`, 'utf8').trim();
const expectedLines = (name) => fs.readFileSync(`${lab}cases/${name}.expected`, 'utf8').trimEnd().split('\n');
const header = (name) => `Docker-Image mariadb:11, Server ${version}; Befehl: node ${lab}run.mjs ${name.slice(0, 2)}`;
/** Gibt Zeilenbereiche [von, bis) der erwarteten Ausgabe zurück; mehrere Bereiche werden durch „…“ getrennt. */
const pick = (name, ...ranges) => `${header(name)}\n${ranges.map(([from, to]) => expectedLines(name).slice(from, to).join('\n')).join('\n…\n')}`;
const whole = (name, note = '') => `${header(name)}\n${expectedLines(name).join('\n')}${note ? `\n${note}` : ''}`;
/** Liest die drei Handler-Zähler je Variante aus der erwarteten Ausgabe von Fall 5. */
const handlerCounts = () => {
  const rows = expectedLines('05-seiten').filter((line) => /Handler_read_/.test(line)).map((line) => Number(line.split('|')[2]));
  return [0, 1, 2].map((variant) => ({ first: rows[variant * 3], key: rows[variant * 3 + 1], next: rows[variant * 3 + 2] }));
};

const mdb = (title, url, note = 'Referenz; Inhalt hier eigenständig zusammengefasst.') => ({ title: `MariaDB-Dokumentation: ${title}`, url, note });

export const module = {
  id: 'mariadb-m2', course: 'mariadb', part: 25, partTitle: 'MariaDB · Datenbanken in der Praxis',
  title: 'MariaDB Vertiefung · Auswertungen, Modellierung, Nebenläufigkeit, Migration und Projekt',
};

const prerequisites = 'Modul „MariaDB · SQL, Integrität und Betrieb“, besonders SELECT, JOIN, Schlüssel, Transaktionen und Indizes.';
const verificationCommon = (what, notTested) => `Geprüft wurde mit dem SQL-Lab: ${what} Jede Ausgabe stammt aus einem Lauf gegen einen frischen Container (Image mariadb:11, Server ${version}) und wird mit der gespeicherten erwarteten Ausgabe verglichen. Nicht geprüft: ${notTested} Das Lab läuft nicht in der Playwright-Suite, weil es Docker braucht.`;

const ranking = (() => {
  const [first, second, third] = handlerCounts();
  return { first, second, third };
})();

export const lessons = [
  {
    id: 'mariadb-m2-l1', title: 'Auswertungen mit Fensterfunktionen und CTEs', minutes: 40,
    prerequisites,
    objectives: [
      'Zwischenergebnisse mit WITH (CTE) benennen und von oben nach unten lesbar halten',
      'Laufende Summen und Rangfolgen mit Fensterfunktionen berechnen, ohne Zeilen zusammenzufassen',
      'ROW_NUMBER, RANK und DENSE_RANK bei Gleichstand unterscheiden',
      'Mit LAG auf die Vorgängerzeile zugreifen und mit rekursiven CTEs Hierarchien durchlaufen',
    ],
    simple: `Mit GROUP BY fasst du Zeilen zusammen: Aus vielen Bestellungen wird eine Zeile pro Monat. Oft willst du aber die Einzelzeilen behalten und trotzdem etwas Gemeinsames daneben sehen, zum Beispiel die laufende Summe bis zu diesem Monat oder den Platz in einer Rangliste. Dafür gibt es Fensterfunktionen. Das „Fenster“ ist die Gruppe von Zeilen, die eine Funktion für die aktuelle Zeile betrachtet. OVER (PARTITION BY stadt ORDER BY umsatz DESC) heißt: Bilde je Stadt ein Fenster, sortiere es absteigend nach Umsatz und rechne darin.

Eine CTE (Common Table Expression, WITH name AS (…)) gibt einem Zwischenergebnis einen Namen. Statt Unterabfragen zu verschachteln, baust du die Abfrage in Schritten: erst „Umsatz je Bestellung“, dann „Umsatz je Monat“. Das liest sich wie ein Rezept und lässt sich Schritt für Schritt prüfen.

Eine rekursive CTE (WITH RECURSIVE) ruft sich selbst auf. Ein Ankerteil liefert die Startzeilen, ein rekursiver Teil hängt immer wieder die nächsten an, bis nichts mehr dazukommt. Damit durchläufst du Bäume wie Kategorien oder Organigramme ohne feste Tiefe.`,
    steps: [
      'Starte das Lab mit „node content/examples/sql-lab/run.mjs 01“. Es startet einen Wegwerf-Container, legt das Schema „Shop“ mit erfundenen Daten an und führt cases/01-fenster-cte.sql aus.',
      'Schritt 1: Die CTE order_totals berechnet je Bestellung die Summe aus Menge mal Einzelpreis und lässt stornierte Bestellungen weg. Die äußere Abfrage fasst nach Monat zusammen und legt mit SUM(SUM(total)) OVER (ORDER BY month) die laufende Summe darüber. Das innere SUM gehört zu GROUP BY, das äußere ist die Fensterfunktion, die auf das gruppierte Ergebnis wirkt.',
      'Schritt 2: ROW_NUMBER() und RANK() mit PARTITION BY city ordnen die Kunden je Stadt nach Ausgaben. Je Stadt beginnt die Zählung neu bei 1. Fenster werden nach GROUP BY ausgewertet, deshalb darf die CTE vorher aggregieren.',
      'Schritt 2b: Bei Gleichstand teilen sich Zeilen den Platz. Zwei Kurse kosten 59,00: ROW_NUMBER zählt 1, 2, 3; RANK vergibt 1, 1, 3 und überspringt die Zwei; DENSE_RANK vergibt 1, 1, 2. WINDOW w AS (…) benennt ein Fenster, das mehrere Funktionen teilen.',
      'Schritt 3: LAG(wert) OVER (PARTITION BY kunde ORDER BY zeitpunkt) liefert den Wert der Vorgängerzeile im Fenster. Die erste Bestellung jedes Kunden hat keinen Vorgänger, LAG ergibt NULL und DATEDIFF damit ebenfalls NULL. So siehst du, wie viele Tage zwischen zwei Bestellungen liegen.',
      'Schritt 4: Die rekursive CTE tree startet bei den Wurzelkategorien (parent_id IS NULL, Tiefe 0) und hängt über den JOIN auf parent_id die Kinder an. CONCAT baut den Pfad auf; ORDER BY path sortiert die Ausgabe wie einen Baum. Der Pfad ist mit CAST(name AS CHAR(200)) bewusst breit genug typisiert.',
      'Vergleiche deine Ausgabe mit cases/01-fenster-cte.expected. Ändere eine Zahl in seed.sql und beobachte, welche Zeilen sich ändern; setze sie danach zurück.',
    ],
    background: `Wann CTE, wann Unterabfrage? Für den Server ist beides oft gleichwertig; der Gewinn der CTE ist Lesbarkeit und Wiederverwendung innerhalb einer Abfrage. Ob eine CTE „materialisiert“ (zwischengespeichert) wird, entscheidet der Optimierer; verlass dich nicht darauf, dass sie schneller ist als eine Unterabfrage, und miss bei großen Datenmengen mit EXPLAIN.

Fensterfunktionen haben einen Rahmen (frame): Mit ORDER BY im Fenster gilt standardmäßig „vom Anfang der Partition bis zur aktuellen Zeile“, wobei Zeilen mit gleichem Sortierwert als gleichrangig zusammen zählen. Deshalb ist die laufende Summe über month eindeutig, solange jeder Monat nur eine Zeile hat. Bei Gleichstand im Sortierwert ist die Reihenfolge der Zeilen undefiniert: Im Lab steht „Kurs Docker“ bei ROW_NUMBER vor „Kurs Python“, aber das ist Zufall des Plans, keine Garantie. Wer eindeutige Plätze braucht, ergänzt ein zweites Sortierkriterium im Fenster, etwa ORDER BY price DESC, name.

Rekursive CTEs brauchen eine Abbruchsicherung: Enthalten die Daten einen Zyklus, läuft die Rekursion, bis eine Obergrenze greift (Systemvariable max_recursive_iterations; den Wert deines Servers liest du mit SELECT @@max_recursive_iterations). Der Lab-Fall nutzt eine azyklische Kategorietabelle und hat keinen Zyklusschutz.`,
    terms: [
      { term: 'Fensterfunktion', text: 'Berechnet einen Wert über eine Gruppe verwandter Zeilen, ohne die Zeilen zusammenzufassen; steht vor OVER (…).' },
      { term: 'PARTITION BY', text: 'Teilt die Zeilen im Fenster in unabhängige Gruppen; die Berechnung beginnt je Gruppe neu.' },
      { term: 'CTE', text: 'Common Table Expression: benanntes Zwischenergebnis, das mit WITH vor einer Abfrage definiert wird.' },
      { term: 'rekursive CTE', text: 'CTE, die aus einem Anker und einem rekursiven Teil besteht und sich wiederholt selbst auswertet.' },
    ],
    code: { file: lab + 'cases/01-fenster-cte.sql', lang: 'SQL', from: '-- Schritt 1', to: 'ORDER BY month;' },
    code2: { file: lab + 'cases/01-fenster-cte.sql', lang: 'SQL', from: '-- Schritt 2b', to: 'ORDER BY price DESC, name;' },
    code3: { file: lab + 'cases/01-fenster-cte.sql', lang: 'SQL', from: '-- Schritt 4', to: 'SELECT depth, path' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: pick('01-fenster-cte', [0, 8], [18, 25], [38, 48]),
    mistakes: [
      { wrong: 'Plätze mit ROW_NUMBER() zu vergeben und dabei zu übersehen, dass bei Gleichstand die Reihenfolge nicht festgelegt ist.', why: 'Zwei gleiche Preise bekommen Plätze 1 und 2 in beliebiger Reihenfolge; die Rangliste kann sich zwischen Läufen ändern.', fix: 'Im Fenster ein eindeutiges zweites Sortierkriterium angeben oder bewusst RANK/DENSE_RANK nutzen.' },
      { wrong: 'Eine Fensterfunktion in WHERE zu verwenden (WHERE ROW_NUMBER() OVER (…) = 1).', why: 'WHERE wird vor den Fenstern ausgewertet; die Abfrage wird abgelehnt.', fix: 'Das Fenster in einer CTE oder Unterabfrage berechnen und außen mit WHERE filtern.' },
      { wrong: 'Mit GROUP BY zu aggregieren und gleichzeitig Spalten auszugeben, die nicht gruppiert sind.', why: 'Der Wert stammt aus einer beliebigen Zeile der Gruppe, oder die Abfrage scheitert je nach Einstellung.', fix: 'Entweder alle Ausgabespalten gruppieren, aggregieren oder eine Fensterfunktion benutzen.' },
      { wrong: 'Eine rekursive CTE auf Daten mit möglichem Zyklus ohne Schutz laufen zu lassen.', why: 'Die Rekursion hört erst an der Obergrenze auf und kostet bis dahin Zeit und Speicher.', fix: 'Tiefe mitzählen und begrenzen oder Zyklen in den Daten per Schlüsselregel verhindern.' },
    ],
    practice: 'Schreibe auf dem Shop-Schema eine Abfrage „Top 2 Produkte je Kategorie nach verkaufter Menge“ mit CTE und ROW_NUMBER, einmal mit eindeutigem Zweitkriterium. Prüfe das Ergebnis von Hand an drei Kategorien und lege die Abfrage als Fall 9 im Lab ab.',
    exercises: [
      { task: 'Berechne den Umsatzanteil jedes Monats am Gesamtumsatz in Prozent mit SUM() OVER ().', acceptance: 'Die Anteile ergeben gerundet 100 Prozent; die Abfrage nutzt eine CTE; die Monate stimmen mit der Ausgabe von Schritt 1 überein.' },
      { task: 'Grenzfall: Gib die Rangfolge der Kurse mit Gleichstand aus und ergänze ein zweites Sortierkriterium, sodass ROW_NUMBER eindeutig ist.', acceptance: 'Bei zwei Läufen ist die Zuordnung identisch; du erklärst, warum RANK trotzdem bei gleichen Preisen denselben Platz vergibt.' },
      { task: 'Fehlerfall: Schreibe WHERE rank_nr = 1 direkt in die Abfrage von Schritt 2.', acceptance: 'Der Server meldet, dass der Alias in WHERE unbekannt ist; du verschiebst die Berechnung in eine CTE und erklärst die Auswertungsreihenfolge.' },
    ],
    quiz: [
      { q: 'Was unterscheidet eine Fensterfunktion von GROUP BY?',
        options: ['Sie behält die Einzelzeilen und rechnet über eine Zeilengruppe.', 'Sie ist nur in Unterabfragen erlaubt.', 'Sie arbeitet nur mit Zahlenspalten.', 'Sie ersetzt WHERE und filtert Zeilen.'],
        correct: 0,
        rationales: ['Jede Zeile bleibt erhalten; die Funktion betrachtet das Fenster um sie herum.', 'Sie steht normal in der SELECT-Liste.', 'Auch ROW_NUMBER, RANK oder LAG arbeiten ohne Zahlenspalte.', 'Gefiltert wird mit WHERE oder HAVING, nicht mit OVER.'],
        explain: 'GROUP BY fasst Zeilen zusammen, Fensterfunktionen berechnen über eine Gruppe, lassen die Zeilen aber stehen.' },
      { q: 'Zwei Kurse stehen mit gleichem Preis auf Platz 1. Welchen Platz vergibt RANK dem nächsten Kurs?',
        options: ['Platz 2.', 'Platz 1.', 'Platz 3.', 'Keinen, die Zeile fällt weg.'],
        correct: 2,
        rationales: ['Das wäre DENSE_RANK, das Lücken vermeidet.', 'Platz 1 haben die beiden gleichen Kurse.', 'RANK überspringt nach einem Gleichstand die belegten Plätze.', 'Keine Zeile fällt weg.'],
        explain: 'RANK springt nach Gleichstand (1, 1, 3); DENSE_RANK nicht (1, 1, 2); ROW_NUMBER zählt stur durch.' },
      { q: 'Warum gehört der Filter auf eine Fensterfunktion in eine äußere Abfrage oder CTE?',
        options: ['Fensterfunktionen stehen immer in der FROM-Klausel.', 'WHERE zählt nur indizierte Spalten.', 'Weil die Fenster erst nach WHERE und GROUP BY berechnet werden.', 'MariaDB erlaubt nur ein Fenster je Abfrage.'],
        correct: 2,
        rationales: ['Sie stehen in der SELECT-Liste oder in ORDER BY.', 'WHERE arbeitet mit beliebigen Ausdrücken.', 'Zum Zeitpunkt von WHERE gibt es den Fensterwert noch nicht.', 'Es dürfen mehrere Fenster vorkommen, auch benannt mit WINDOW.'],
        explain: 'Die Auswertungsreihenfolge macht eine Zwischenstufe nötig: erst das Fenster berechnen, dann außen filtern.' },
    ],
    sources: [
      mdb('Window Functions', 'https://mariadb.com/docs/server/reference/sql-functions/special-functions/window-functions', 'Referenz zu OVER, PARTITION BY, Rahmen und Rangfunktionen.'),
      mdb('WITH (Common Table Expressions)', 'https://mariadb.com/docs/server/reference/sql-statements/data-manipulation/selecting-data/common-table-expressions/with', 'Referenz zu CTEs.'),
      mdb('Recursive Common Table Expressions Overview', 'https://mariadb.com/docs/server/reference/sql-statements/data-manipulation/selecting-data/common-table-expressions/recursive-common-table-expressions-overview', 'Anleitung zu Anker, rekursivem Teil und Abbruch.'),
    ],
    verification: verificationCommon('Laufende Summe, ROW_NUMBER/RANK/DENSE_RANK bei Gleichstand, LAG und eine rekursive CTE auf dem Shop-Schema mit erfundenen Daten.', 'andere Serverversionen (MySQL, MariaDB 10.x und 12.x), Laufzeit und Pläne bei großen Datenmengen, Zyklusschutz bei rekursiven CTEs.'),
  },
  {
    id: 'mariadb-m2-l2', title: 'Normalisierung und Integrität: Anomalien erleben und beheben', minutes: 40,
    prerequisites,
    objectives: [
      'Einfüge-, Änderungs- und Löschanomalien an einer flachen Tabelle erkennen',
      'Eine Tabelle in die dritte Normalform zerlegen und Daten verlustfrei migrieren',
      'Mit Primär-, Fremdschlüsseln und CHECK Regeln im Schema verankern',
      'Die Fehlernummern 1451, 1452 und 4025 den Regelverletzungen zuordnen',
    ],
    simple: `Eine „flache“ Tabelle, in der Kunde, Stadt, Produkt und Menge in jeder Zeile stehen, ist bequem, bis sich etwas ändert. Zieht ein Kunde um, steht seine Stadt in vielen Zeilen, und wer nur einige ändert, hinterlässt eine Tabelle, die sich widerspricht: Der Kunde wohnt gleichzeitig in Berlin und Hamburg. Solche Fehler heißen Anomalien.

Normalisierung heißt: Jede Tatsache steht genau einmal. Kunden bekommen eine eigene Tabelle mit einem Schlüssel, Produkte auch; die Bestellpositionen verweisen nur noch auf diese Schlüssel. Eine Stadtänderung ist dann ein einziges UPDATE.

Damit die Datenbank die Zerlegung auch durchsetzt, nutzt du Constraints: PRIMARY KEY macht Zeilen eindeutig, FOREIGN KEY verbietet Verweise ins Leere, CHECK verbietet unsinnige Werte wie eine Menge von null. Fehler fallen dann beim Schreiben auf, nicht Monate später in einer Auswertung.`,
    steps: [
      'Starte „node content/examples/sql-lab/run.mjs 02“. Dieser Fall nutzt kein Shop-Schema (Marker -- @no-seed), sondern legt die flache Tabelle orders_flat selbst an.',
      'Änderungsanomalie: Das UPDATE ändert die Stadt nur in einer Zeile von Ada. Die Abfrage mit DISTINCT zeigt zwei Städte für denselben Kunden. Die Tabelle kann nicht sagen, welche stimmt.',
      'Zerlegung: n_customers, n_products, n_orders und n_items. Jede Tabelle hat einen Primärschlüssel; n_items hat einen zusammengesetzten (Bestellnummer, Artikelnummer) und verweist mit zwei Fremdschlüsseln auf Bestellung und Produkt.',
      'Datenmigration: Bei Ada widersprechen sich die Städte. MAX(customer_city) wählt alphabetisch „Hamburg“. Das ist eine Notlösung, keine fachliche Regel; in echten Projekten entscheidet ein Mensch oder eine Quelle der Wahrheit, welche Stadt gilt, bevor migriert wird.',
      'Das UPDATE auf n_customers genügt jetzt an einer Stelle; alle Bestellungen zeigen die Änderung über den Join.',
      'Drei Verstöße: Produkt löschen, das noch in Positionen steht (Fehler 1451), Menge 0 einfügen (Fehler 4025 für die CHECK-Regel) und eine Position mit unbekannter Artikelnummer einfügen (Fehler 1452). Alle drei lehnt der Server ab, und die Daten bleiben unverändert.',
      'Lies die Fehlermeldungen: Sie nennen Tabelle und Regel. Bei der Fehlersuche in Anwendungen ist das die erste Anlaufstelle.',
    ],
    background: `Normalformen sind ein Werkzeug, kein Selbstzweck. Die dritte Normalform verlangt grob, dass jedes Nicht-Schlüsselattribut vom Schlüssel abhängt, vom ganzen Schlüssel und von nichts anderem. Wer dennoch bewusst redundant speichert (Denormalisierung), etwa eine Summe in der Bestellung, tut das für Leseleistung und muss die Redundanz selbst konsistent halten, zum Beispiel per Transaktion oder Trigger. Nenne den Grund im Schema-Kommentar.

CHECK-Regeln prüft MariaDB seit Version 10.2.1 tatsächlich. In der Lernumgebung (Server ${version}) lehnt sie die Menge 0 ab. Hast du ältere Server oder MySQL-Versionen vor 8.0.16 im Einsatz, prüfe, ob CHECK dort wirkt, bevor du dich darauf verlässt.

Fremdschlüssel verlangen InnoDB und passende Spaltentypen. Das Verhalten beim Löschen steuerst du mit ON DELETE (RESTRICT ist der Standard, CASCADE löscht Kinder mit, SET NULL entkoppelt sie). CASCADE spart Code, kann aber unbemerkt viele Zeilen löschen; setze es nur dort ein, wo Kinder ohne Eltern keinen Sinn haben.`,
    terms: [
      { term: 'Anomalie', text: 'Fehler durch Redundanz: Einfügen, Ändern oder Löschen führt zu widersprüchlichen oder verlorenen Daten.' },
      { term: '3. Normalform', text: 'Jedes Nicht-Schlüsselattribut hängt direkt und nur vom Schlüssel ab.' },
      { term: 'FOREIGN KEY', text: 'Regel, dass ein Wert auf eine vorhandene Zeile einer anderen Tabelle verweisen muss.' },
      { term: 'CHECK', text: 'Bedingung, die jede geschriebene Zeile erfüllen muss.' },
    ],
    code: { file: lab + 'cases/02-normalisierung.sql', lang: 'SQL', from: '-- Änderungsanomalie', to: 'ORDER BY customer_city;' },
    code2: { file: lab + 'cases/02-normalisierung.sql', lang: 'SQL', from: '-- Zerlegung', to: 'PRIMARY KEY (order_no, sku)' },
    code3: { file: lab + 'cases/02-normalisierung.sql', lang: 'SQL', from: '-- Jetzt genügt', to: 'INSERT INTO n_items VALUES (3, \'XX-9999\', 1);' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: whole('02-normalisierung'),
    mistakes: [
      { wrong: 'Eine Stadt in jeder Bestellzeile zu speichern „damit es schneller geht“.', why: 'Jede Änderung muss alle Zeilen treffen; eine vergessene Zeile erzeugt Widersprüche, die niemand bemerkt.', fix: 'Die Tatsache einmal in einer eigenen Tabelle speichern und über den Schlüssel verbinden.' },
      { wrong: 'Integritätsregeln nur in der Anwendung zu prüfen.', why: 'Skripte, Importe und zweite Anwendungen umgehen die Prüfung; Waisen und ungültige Werte entstehen.', fix: 'Fremdschlüssel, NOT NULL, UNIQUE und CHECK im Schema definieren; die Anwendung zeigt nur freundliche Meldungen.' },
      { wrong: 'Widersprüchliche Altdaten bei der Migration mit MAX() oder DISTINCT zu glätten und das nicht zu dokumentieren.', why: 'Der Wert wirkt abgesichert, ist aber geraten; Fehler wandern in die neue Struktur.', fix: 'Widersprüche vor der Migration auflisten, entscheiden lassen und die Entscheidung festhalten.' },
      { wrong: 'ON DELETE CASCADE überall zu setzen, damit Löschen „einfach klappt“.', why: 'Ein Löschvorgang kann unbemerkt ganze Teilbäume entfernen.', fix: 'RESTRICT als Standard; CASCADE nur für Abhängige, die ohne Eltern bedeutungslos sind.' },
    ],
    practice: 'Zerlege eine eigene flache Tabelle (zum Beispiel Kursbuchungen mit Teilnehmer, Kurs, Termin) in die dritte Normalform, schreibe CREATE TABLE mit Schlüsseln und CHECK und teste mindestens drei Regelverstöße. Dokumentiere, welche Fehlermeldung zu welcher Regel gehört.',
    exercises: [
      { task: 'Füge n_products eine Spalte price DECIMAL(10,2) mit CHECK (price >= 0) hinzu und trage Preise ein.', acceptance: 'Ein negativer Preis wird abgelehnt (Fehler 4025); gültige Preise lassen sich eintragen.' },
      { task: 'Grenzfall: Lege zwei Kunden mit demselben Namen, aber verschiedenen Städten an.', acceptance: 'Der UNIQUE-Schlüssel auf dem Namen lehnt den zweiten ab; du erklärst, warum ein Name kein guter natürlicher Schlüssel ist, und schlägst eine Alternative vor.' },
      { task: 'Fehlerfall: Ändere den Fremdschlüssel von n_items auf ON DELETE CASCADE und lösche ein Produkt.', acceptance: 'Die zugehörigen Positionen verschwinden ohne Fehlermeldung; du beschreibst, warum das gefährlich sein kann, und stellst RESTRICT wieder her.' },
    ],
    quiz: [
      { q: 'Welche Anomalie zeigt sich, wenn eine Stadt nur in einer von mehreren Zeilen desselben Kunden geändert wird?',
        options: ['Einfügeanomalie.', 'Löschanomalie.', 'Änderungsanomalie.', 'Indexanomalie.'],
        correct: 2,
        rationales: ['Sie betrifft das Anlegen neuer Datensätze, die ohne andere Daten nicht speicherbar sind.', 'Sie betrifft den Verlust von Tatsachen beim Löschen von Zeilen.', 'Die redundante Tatsache wird nur teilweise aktualisiert, die Tabelle widerspricht sich.', 'Diesen Begriff gibt es in der Normalisierung nicht.'],
        explain: 'Redundanz macht jede Änderung zur Mehrfacharbeit; vergisst man eine Stelle, widersprechen sich die Daten.' },
      { q: 'Welchen Fehler liefert MariaDB, wenn du ein Produkt löschst, das noch in Bestellpositionen vorkommt?',
        options: ['Fehler 1062: doppelter Eintrag.', 'Fehler 1451: Eltern-Zeile kann wegen Fremdschlüssel nicht gelöscht werden.', 'Fehler 1452: Kind-Zeile kann nicht hinzugefügt werden.', 'Keinen, die Positionen werden still mitgelöscht.'],
        correct: 1,
        rationales: ['Das wäre ein Verstoß gegen einen UNIQUE-Schlüssel.', 'Der Fremdschlüssel schützt die Kind-Zeilen mit RESTRICT.', 'Das tritt beim Einfügen mit unbekanntem Verweis auf.', 'Das passiert nur mit ON DELETE CASCADE.'],
        explain: 'Beim Löschen eines referenzierten Elternsatzes meldet der Server 1451, beim Einfügen mit unbekanntem Verweis 1452.' },
      { q: 'Wann ist eine bewusste Denormalisierung vertretbar?',
        options: ['Immer, weil Joins grundsätzlich langsam sind.', 'Wenn niemand die Daten ändert und Tests fehlen.', 'Nie, die dritte Normalform ist Pflicht.', 'Wenn ein gemessener Lesevorteil die Pflege der Redundanz rechtfertigt.'],
        correct: 3,
        rationales: ['Joins sind mit passenden Indizes meist günstig.', 'Fehlende Tests sind kein Grund für Redundanz.', 'Es ist ein Werkzeug, kein Gesetz; Ausnahmen sind erlaubt, wenn sie begründet sind.', 'Dann muss die Redundanz dokumentiert und konsistent gehalten werden.'],
        explain: 'Redundanz ist ein Kompromiss zwischen Leseleistung und Pflegeaufwand und gehört begründet.' },
    ],
    sources: [
      mdb('Foreign Keys', 'https://mariadb.com/docs/server/ha-and-performance/optimization-and-tuning/optimization-and-indexes/foreign-keys', 'Referenz zu Fremdschlüsseln und ON DELETE/ON UPDATE.'),
      mdb('Constraint', 'https://mariadb.com/docs/server/reference/sql-statements/data-definition/constraint', 'Referenz zu CHECK, UNIQUE und benannten Regeln.'),
      mdb('Database Normalization: Overview', 'https://mariadb.com/docs/general-resources/database-theory/database-normalization/database-normalization-overview', 'Überblick zur Normalisierung und den Normalformen.'),
    ],
    verification: verificationCommon('Änderungsanomalie, Zerlegung in die dritte Normalform, Migration mit gemischten Städten und die drei Regelverletzungen 1451, 4025 und 1452.', 'MySQL und ältere MariaDB-Versionen (CHECK-Durchsetzung), ON DELETE CASCADE im Lab, große Datenmengen.'),
  },
  {
    id: 'mariadb-m2-l3', title: 'JSON, generierte Spalten und Indizes darauf', minutes: 35,
    prerequisites,
    objectives: [
      'Entscheiden, wann ein JSON-Feld sinnvoll ist und wann eine eigene Spalte oder Tabelle',
      'Werte mit JSON_VALUE, JSON_EXISTS und JSON_QUERY lesen',
      'Mit einer virtuellen Spalte einen JSON-Pfad indexierbar machen',
      'Mit JSON_TABLE ein Array in Zeilen auflösen',
    ],
    simple: `Manche Daten sind von Zeile zu Zeile verschieden: Eine Tastatur hat ein Layout, ein Monitor eine Größe und ein Panel. Für jede Eigenschaft eine Spalte anzulegen, würde die Tabelle mit leeren Feldern füllen. Eine JSON-Spalte speichert diese „weichen“ Eigenschaften als Dokument in einer Zelle.

MariaDB kennt den Typ JSON als Alias für langen Text; zusätzlich prüft der Server bei der Spalte, ob der Inhalt gültiges JSON ist. Mit JSON_VALUE(attrs, '$.layout') liest du einen Wert, JSON_EXISTS prüft, ob ein Pfad vorhanden ist, und JSON_QUERY liefert ein Teildokument wie ein Array.

Suchen im JSON ist ohne Hilfe langsam, weil der Server den Text bei jeder Zeile parsen müsste. Die Lösung ist eine generierte Spalte: Sie wird aus dem JSON berechnet (layout CHAR(2) AS (JSON_VALUE(attrs, '$.layout')) VIRTUAL), und auf diese Spalte legst du einen normalen Index.`,
    steps: [
      'Starte „node content/examples/sql-lab/run.mjs 03“. Das Skript fügt der Tabelle products die Spalte attrs JSON hinzu und füllt sie für drei Produkte.',
      'Lesen: JSON_VALUE liefert „DE“ beziehungsweise „US“ und NULL, wenn der Pfad fehlt. JSON_EXISTS ergibt 1 auch für den Wert false (der Schlüssel ist ja da) und 0 beim Monitor ohne Schlüssel „wireless“. JSON_QUERY liefert das Array tags als Text.',
      'Ungültiges JSON: Das UPDATE mit „{kaputt“ wird mit Fehler 4025 abgelehnt. In MariaDB ist JSON ein Alias für LONGTEXT; die Prüfung kommt von einer JSON_VALID-Regel, die der Server für die Spalte anlegt.',
      'Generierte Spalte: layout CHAR(2) AS (JSON_VALUE(attrs, \'$.layout\')) VIRTUAL wird beim Lesen berechnet und braucht keinen Platz in der Zeile. Der Index idx_products_layout speichert die berechneten Werte.',
      'Die Abfrage WHERE layout = \'US\' nutzt die Spalte wie jede andere. information_schema.STATISTICS zeigt den Index mit der Spalte layout und non_unique = 1.',
      'JSON_TABLE klappt das Array tags in Zeilen auf: Das JOIN-artige Muster FROM products p, JSON_TABLE(p.attrs, \'$.tags[*]\' COLUMNS (tag VARCHAR(20) PATH \'$\')) t liefert eine Zeile je Tag und erlaubt GROUP BY oder JOIN darüber.',
      'Überlege, welche der drei Eigenschaften du besser als eigene Spalte oder Tabelle modellierst, weil du sie ständig filterst oder verknüpfst (zum Beispiel Tags).',
    ],
    background: `JSON ersetzt kein Schema. Was du ständig filterst, sortierst, verknüpfst oder mit Regeln absichern willst (Pflichtfeld, Fremdschlüssel, Eindeutigkeit), gehört in Spalten. Gut passt JSON zu optionalen, selten gefilterten Eigenschaften oder zu Daten, die du unverändert von außen übernimmst.

Eine virtuelle Spalte rechnet bei jedem Lesen, spart aber Speicher; eine persistente (STORED) speichert den Wert und kostet Platz, aber nicht jedes Mal Rechenzeit. Für den Index auf einer virtuellen Spalte gelten Einschränkungen je nach Engine und Version; prüfe die Dokumentation deiner Version.

Typen: JSON_VALUE liefert immer Text. Wer Zahlen vergleicht, muss casten, sonst vergleicht er Texte („10“ ist kleiner als „9“). Auch Zeichensatz und Collation (siehe Lektion 7) wirken auf die Ergebnisse.`,
    terms: [
      { term: 'JSON_VALUE', text: 'Liest einen skalaren Wert über einen Pfad wie $.layout aus einem JSON-Dokument und gibt ihn als Text zurück.' },
      { term: 'JSON_TABLE', text: 'Wandelt JSON-Daten, etwa ein Array, in Tabellenzeilen um.' },
      { term: 'generierte Spalte', text: 'Spalte, deren Wert aus anderen Spalten berechnet wird; VIRTUAL rechnet beim Lesen, STORED speichert.' },
    ],
    code: { file: lab + 'cases/03-json-generated.sql', lang: 'SQL', from: '-- Lesen', to: 'FROM products WHERE attrs IS NOT NULL ORDER BY sku;' },
    code2: { file: lab + 'cases/03-json-generated.sql', lang: 'SQL', from: '-- Eine generierte', to: "index_name = 'idx_products_layout';" },
    code3: { file: lab + 'cases/03-json-generated.sql', lang: 'SQL', from: '-- JSON_TABLE', to: 'ORDER BY p.sku, t.tag;' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: whole('03-json-generated'),
    mistakes: [
      { wrong: 'Alle Eigenschaften eines Produkts in ein JSON-Feld zu legen, auch solche, nach denen ständig gefiltert wird.', why: 'Jede Suche parst Text; Regeln wie Pflichtfeld oder Fremdschlüssel lassen sich nicht ausdrücken.', fix: 'Filterbare, verknüpfte und pflichtige Eigenschaften als Spalten oder Tabellen, JSON nur für den variablen Rest.' },
      { wrong: 'Nach JSON-Pfaden zu suchen, ohne einen Index auf einer generierten Spalte anzulegen.', why: 'Der Server liest und parst alle Zeilen; die Abfrage wird mit wachsender Tabelle langsamer.', fix: 'Eine generierte Spalte für den Pfad anlegen und indizieren, danach mit EXPLAIN prüfen.' },
      { wrong: 'Zahlen aus JSON_VALUE ohne CAST zu vergleichen.', why: 'Das Ergebnis ist Text; „10“ sortiert vor „9“.', fix: 'Mit CAST(JSON_VALUE(…) AS DECIMAL(10,2)) oder einer typisierten generierten Spalte arbeiten.' },
      { wrong: 'Sich darauf zu verlassen, dass JSON in MariaDB wie in MySQL ein eigener Binärtyp ist.', why: 'In MariaDB ist JSON ein Alias für LONGTEXT; Verhalten, Speicherung und Leistung unterscheiden sich.', fix: 'Dokumentation der eingesetzten Version lesen und Verhalten mit einem Lab-Fall absichern.' },
    ],
    practice: 'Ergänze products um ein JSON-Feld für Zusatzangaben, lege eine generierte Spalte für einen häufig gefilterten Pfad samt Index an, vergleiche EXPLAIN vor und nach dem Index und notiere, ab welcher Tabellengröße sich der Unterschied zeigt.',
    exercises: [
      { task: 'Lege eine zweite generierte Spalte wireless (TINYINT) aus JSON_VALUE(attrs, \'$.wireless\') an und zähle die kabellosen Produkte.', acceptance: 'Die Zählung stimmt mit den Daten überein; du erklärst, wie JSON true und false als Text ankommen.' },
      { task: 'Grenzfall: Füge ein Produkt ohne attrs (NULL) und eines mit leerem Objekt {} hinzu und lies layout.', acceptance: 'Beide liefern NULL für layout; JSON_EXISTS unterscheidet sie von einem vorhandenen Pfad; du beschreibst den Unterschied zwischen NULL und fehlendem Schlüssel.' },
      { task: 'Fehlerfall: Schreibe ungültiges JSON (fehlende Klammer) in attrs.', acceptance: 'Der Server lehnt das Update mit Fehler 4025 ab; du nennst die Regel, die das erzwingt, und was in der Anwendung vor dem Speichern geprüft werden sollte.' },
    ],
    quiz: [
      { q: 'Was ist der Typ JSON in MariaDB?',
        options: ['Ein binärer Spezialtyp wie in MySQL.', 'Ein Alias für langen Text mit JSON-Prüfung.', 'Eine eigene Tabelle im Hintergrund.', 'Ein Typ, der nur Zahlen speichert.'],
        correct: 1,
        rationales: ['Die MariaDB-Dokumentation beschreibt JSON als Alias für LONGTEXT.', 'Der Server legt für die Spalte eine JSON_VALID-Prüfung an.', 'Es entsteht keine zusätzliche Tabelle.', 'Beliebige gültige JSON-Dokumente lassen sich speichern.'],
        explain: 'JSON ist ein Alias für LONGTEXT; die Gültigkeit wird per Regel geprüft, was der Lab-Fehler 4025 zeigt.' },
      { q: 'Wie machst du den Pfad $.layout eines JSON-Felds schnell durchsuchbar?',
        options: ['Mit LIMIT 1 an jeder Abfrage.', 'Mit einer Tabelle ohne Primärschlüssel.', 'Mit einem Index direkt auf der JSON-Spalte, ohne weitere Schritte.', 'Mit einer generierten Spalte und einem Index darauf.'],
        correct: 3,
        rationales: ['LIMIT ändert nichts an der Suche.', 'Ohne Schlüssel wird es nicht schneller.', 'Der Server indiziert den Text, nicht den Pfad darin.', 'Die Spalte macht den Pfad zu einem normalen, indizierbaren Wert.'],
        explain: 'Der Pfad wird als virtuelle Spalte berechnet; der Index speichert diese Werte.' },
      { q: 'Wofür nutzt du JSON_TABLE?',
        options: ['Um ein Array in Zeilen aufzufächern, die du verknüpfen oder gruppieren kannst.', 'Um JSON in eine Datei zu schreiben.', 'Um Tabellen zu löschen.', 'Um die Zeichenkodierung zu ändern.'],
        correct: 0,
        rationales: ['Jede Array-Position wird zu einer Zeile.', 'JSON_TABLE schreibt nichts in Dateien.', 'Löschen geht mit DROP TABLE.', 'Dafür sind CONVERT und Collations zuständig.'],
        explain: 'JSON_TABLE macht aus Dokumentstrukturen Zeilen, damit du sie mit normalem SQL weiterverarbeiten kannst.' },
    ],
    sources: [
      mdb('JSON Data Type', 'https://mariadb.com/docs/server/reference/data-types/string-data-types/json', 'Referenz zum Typ JSON (Alias für LONGTEXT).'),
      mdb('JSON_VALUE', 'https://mariadb.com/docs/server/reference/sql-functions/special-functions/json-functions/json_value', 'Referenz zu JSON_VALUE.'),
      mdb('JSON_TABLE', 'https://mariadb.com/docs/server/reference/sql-functions/special-functions/json-functions/json_table', 'Referenz zu JSON_TABLE.'),
      mdb('Generated (Virtual and Persistent/Stored) Columns', 'https://mariadb.com/docs/server/reference/sql-statements/data-definition/create/generated-columns', 'Anleitung zu virtuellen und gespeicherten Spalten samt Indizes.'),
    ],
    verification: verificationCommon('JSON lesen, Fehler 4025 bei ungültigem JSON, virtuelle Spalte mit Index (information_schema.STATISTICS) und JSON_TABLE auf drei Produkten.', 'Leistung des Index bei großen Datenmengen (EXPLAIN im Lab nicht ausgewertet), STORED-Spalten, MySQL-Verhalten.'),
  },
  {
    id: 'mariadb-m2-l4', title: 'Sperren, Wartezeit und Deadlocks', minutes: 40,
    prerequisites,
    objectives: [
      'Zeilensperren mit SELECT … FOR UPDATE und ihre Wirkung auf eine zweite Sitzung erklären',
      'Eine Lock-Wait-Timeout-Meldung (1205) von einem Deadlock (1213) unterscheiden',
      'Deadlocks durch gleiche Sperrreihenfolge und kurze Transaktionen vermeiden',
      'Eine Wiederholungsstrategie für abgebrochene Transaktionen formulieren',
    ],
    simple: `Wenn zwei Menschen gleichzeitig dasselbe Konto ändern, braucht die Datenbank Regeln. InnoDB sperrt dazu Zeilen: Wer eine Zeile ändert oder mit FOR UPDATE liest, hält eine Sperre bis zum Ende der Transaktion (COMMIT oder ROLLBACK). Wer dieselbe Zeile ändern will, wartet. Die Wartezeit ist begrenzt (Standard 50 Sekunden, Variable innodb_lock_wait_timeout); danach bricht der Server die Anweisung mit Fehler 1205 ab.

Ein Deadlock ist schlimmer: Zwei Transaktionen halten je eine Sperre und warten auf die des anderen. Keine kann weitermachen. InnoDB erkennt das, bricht eine Transaktion ab (Fehler 1213) und lässt die andere durchlaufen. Die abgebrochene muss die Anwendung wiederholen.

Du verhinderst Deadlocks nicht ganz, aber du machst sie selten: Sperre Zeilen immer in derselben Reihenfolge, halte Transaktionen kurz, und fange Fehler 1213 ab, um die Transaktion zu wiederholen.`,
    steps: [
      'Starte „node content/examples/sql-lab/run.mjs 04“. Der Fall ist ein Node-Skript, weil er zwei Datenbanksitzungen gleichzeitig braucht. Er legt die Tabelle accounts an (Ada und Ben mit je 100,00).',
      'Teil A: Sitzung 1 startet eine Transaktion, sperrt Adas Zeile mit FOR UPDATE und hält sie drei Sekunden. Sitzung 2 setzt innodb_lock_wait_timeout auf 1 Sekunde und will dieselbe Zeile ändern. Nach einer Sekunde bricht der Server mit Fehler 1205 „Lock wait timeout exceeded“ ab; die Kontostände bleiben bei 100,00.',
      'Teil B: Sitzung 1 ändert Konto 1 und danach Konto 2, Sitzung 2 ändert erst Konto 2 und danach Konto 1. Beide halten nach kurzer Zeit eine Sperre und brauchen die andere: ein Zyklus.',
      'InnoDB erkennt den Zyklus und bricht genau eine Sitzung mit Fehler 1213 „Deadlock found when trying to get lock; try restarting transaction“ ab. Welche, entscheidet der Server; das Skript gibt deshalb nur aus, dass genau eine betroffen ist.',
      'Die Summe aller Kontostände ist danach 200,00: Die Überlebende hat festgeschrieben, die Abgebrochene nichts. Atomarität bleibt erhalten, aber ein Teil der Arbeit ging verloren und muss wiederholt werden.',
      'Lösung für Teil B: Beide Sitzungen sperren die Konten in derselben Reihenfolge (zum Beispiel immer die kleinere ID zuerst). Dann kann kein Zyklus entstehen; die zweite Sitzung wartet nur.',
      'Formuliere die Wiederholungsregel für die Anwendung: Bei 1213 (und je nach Fall 1205) Transaktion vollständig zurückrollen, kurz warten, neu beginnen, nach einigen Versuchen mit klarer Meldung aufgeben.',
    ],
    background: `Das Lab nutzt die Standardisolation REPEATABLE READ (laut Serverabfrage im Lab-Container). Wie weit sich Sperren ausdehnen (Zeilen, Lücken), hängt von Isolationsstufe und Indexnutzung ab; ein UPDATE ohne passenden Index kann deutlich mehr Zeilen sperren als erwartet. Prüfe bei Problemen die InnoDB-Statusausgabe (SHOW ENGINE INNODB STATUS) für den letzten Deadlock.

Die Wartezeit ist ein Schutz gegen hängende Transaktionen, keine Lösung. Wer 50 Sekunden auf eine Sperre wartet, hat meist ein Konzeptproblem: zu lange Transaktionen, offene Transaktionen ohne COMMIT oder Nutzereingaben mitten in der Transaktion. Halte Transaktionen kurz und mache keine Netzwerkaufrufe in ihnen.

Das Lab arbeitet mit Pausen von einer bis drei Sekunden, um die Reihenfolge der Sitzungen zu erzwingen. Auf sehr langsamen Rechnern kann das Timing wackeln; die Pausen stehen im Skript und lassen sich erhöhen.`,
    terms: [
      { term: 'Zeilensperre', text: 'Sperre auf einzelne Zeilen, die bis zum Ende der Transaktion gilt und gleichzeitige Änderungen verhindert.' },
      { term: 'Lock Wait Timeout', text: 'Fehler 1205: Eine Transaktion wartete zu lange auf eine Sperre und wurde abgebrochen.' },
      { term: 'Deadlock', text: 'Zwei oder mehr Transaktionen warten aufeinander; InnoDB bricht eine ab (Fehler 1213).' },
      { term: 'FOR UPDATE', text: 'Liest Zeilen und sperrt sie für andere Schreiber bis zum Transaktionsende.' },
    ],
    code: { file: lab + 'cases/04-sperren.mjs', lang: 'JavaScript', from: '// Teil A', to: "run('SELECT id, balance FROM accounts ORDER BY id;')" },
    code2: { file: lab + 'cases/04-sperren.mjs', lang: 'JavaScript', from: '// Teil B', to: 'const deadlocks' },
    order: ['body', 'code', 'code2', 'body2'],
    output: whole('04-sperren'),
    mistakes: [
      { wrong: 'Eine Transaktion offen zu lassen (kein COMMIT/ROLLBACK), etwa während auf eine Nutzereingabe gewartet wird.', why: 'Die Sperren bleiben bestehen; andere Sitzungen laufen in Wartezeit-Fehler.', fix: 'Transaktionen kurz halten, erst eingeben lassen, dann in einem Zug schreiben.' },
      { wrong: 'Den Wartezeit-Wert massiv zu erhöhen, um Fehler 1205 loszuwerden.', why: 'Die Ursache (lange Transaktion, fehlender Index) bleibt, und Benutzer warten länger.', fix: 'Ursache suchen: offene Transaktionen, Indizes für das WHERE, Sperrreihenfolge.' },
      { wrong: 'Deadlock-Fehler 1213 dem Benutzer als „Systemfehler“ zu zeigen, ohne zu wiederholen.', why: 'Deadlocks sind bei Nebenläufigkeit normal; der Server rät ausdrücklich zum Neustart der Transaktion.', fix: 'Die Anwendung wiederholt die gesamte Transaktion begrenzt oft und meldet erst danach.' },
      { wrong: 'Nur die fehlgeschlagene Anweisung zu wiederholen statt der ganzen Transaktion.', why: 'Frühere Schritte der Transaktion sind verworfen; ein Teilneustart schreibt inkonsistente Daten.', fix: 'Transaktion vollständig zurückrollen und von Anfang an neu ausführen.' },
    ],
    practice: 'Baue eine Überweisung zwischen zwei Konten als Funktion mit Transaktion, Sperre in fester ID-Reihenfolge und Wiederholung bei 1213 (maximal drei Versuche). Teste sie mit zwei Prozessen, die gleichzeitig in entgegengesetzte Richtungen überweisen.',
    exercises: [
      { task: 'Ändere Teil B so, dass beide Sitzungen zuerst Konto 1 und dann Konto 2 sperren.', acceptance: 'Es tritt kein Fehler 1213 auf; die Summe bleibt 200,00; du erklärst, warum der Zyklus verschwindet.' },
      { task: 'Grenzfall: Erhöhe in Teil A die Wartezeit der zweiten Sitzung auf fünf Sekunden und halte die erste nur drei Sekunden.', acceptance: 'Die zweite Sitzung wartet und läuft danach durch, ohne Fehler; du liest das Ergebnis am Kontostand ab.' },
      { task: 'Fehlerfall: Lass in Teil B den Wiederholungsversuch weg und werte das Ergebnis der abgebrochenen Sitzung aus.', acceptance: 'Eine der beiden Überweisungen fehlt; du zeigst an den Kontoständen, welche Arbeit verloren ging, und fügst die Wiederholung hinzu.' },
    ],
    quiz: [
      { q: 'Was bedeutet Fehler 1205 „Lock wait timeout exceeded“?',
        options: ['Eine Transaktion wartete zu lange auf eine Sperre.', 'Zwei Transaktionen blockieren sich gegenseitig.', 'Der Server ist ausgefallen.', 'Das Passwort war falsch.'],
        correct: 0,
        rationales: ['Die Wartezeit-Grenze innodb_lock_wait_timeout wurde überschritten.', 'Das ist ein Deadlock (1213).', 'Ein Ausfall liefert Verbindungsfehler.', 'Falsche Anmeldung liefert Fehler 1045.'],
        explain: '1205 ist ein Zeitlimit beim Warten; ein Deadlock (1213) ist ein Zyklus, den InnoDB aktiv erkennt.' },
      { q: 'Wie verringerst du das Risiko von Deadlocks bei Überweisungen am wirksamsten?',
        options: ['Die Wartezeit auf 1 Sekunde setzen.', 'Beide Konten immer in derselben Reihenfolge sperren.', 'Transaktionen möglichst lange offen halten.', 'Die Fehler ignorieren.'],
        correct: 1,
        rationales: ['Das verändert nur, wann Fehler 1205 kommt.', 'Mit fester Reihenfolge kann kein Zyklus entstehen.', 'Lange Transaktionen erhöhen das Risiko.', 'Ignorierte Fehler verlieren Arbeit.'],
        explain: 'Eine einheitliche Sperrreihenfolge verhindert den Wartezyklus; kurze Transaktionen und Wiederholung ergänzen das.' },
      { q: 'Was sollte die Anwendung nach Fehler 1213 tun?',
        options: ['Nur die letzte Anweisung wiederholen.', 'Die Datenbank neu starten.', 'Den Fehler schlucken und weitermachen.', 'Die ganze Transaktion zurückrollen und begrenzt oft neu ausführen.'],
        correct: 3,
        rationales: ['Frühere Schritte sind verworfen; ein Teilneustart ist inkonsistent.', 'Das ist unverhältnismäßig.', 'Dann fehlt Arbeit unbemerkt.', 'So bleibt die Transaktion atomar, und Deadlocks lösen sich meist beim zweiten Versuch.'],
        explain: 'Deadlocks sind bei Nebenläufigkeit normal; die Transaktion läuft komplett von vorn, mit Obergrenze für Versuche.' },
    ],
    sources: [
      mdb('InnoDB Lock Modes', 'https://mariadb.com/docs/server/server-usage/storage-engines/innodb/innodb-lock-modes', 'Referenz zu Sperrarten.'),
      mdb('InnoDB System Variables (innodb_lock_wait_timeout)', 'https://mariadb.com/docs/server/server-usage/storage-engines/innodb/innodb-system-variables', 'Referenz zu innodb_lock_wait_timeout und verwandten Variablen.'),
      mdb('SELECT … FOR UPDATE', 'https://mariadb.com/docs/server/reference/sql-statements/data-manipulation/selecting-data/select', 'Referenz zu Sperren in SELECT-Anweisungen (Abschnitt LOCK IN SHARE MODE und FOR UPDATE).'),
    ],
    verification: verificationCommon('Wartezeit-Fehler 1205 mit zwei Sitzungen, ein Deadlock mit genau einem Abbruch (1213) und die Summe der Kontostände danach.', 'andere Isolationsstufen, Lückensperren, Last mit vielen Sitzungen, Zeitabhängigkeit auf langsamen Rechnern, welche Sitzung beim Deadlock abbricht (der Server entscheidet).'),
  },
  {
    id: 'mariadb-m2-l5', title: 'Blättern in großen Ergebnissen: OFFSET gegen Keyset', minutes: 35,
    prerequisites,
    objectives: [
      'Erklären, warum OFFSET bei großen Seitenzahlen langsamer wird',
      'Keyset-Paginierung mit eindeutigem Sortierschlüssel formulieren',
      'Mit Handler-Zählern messen, wie viele Zeilen der Server tatsächlich liest',
      'Grenzen von Keyset-Paginierung benennen',
    ],
    simple: `Eine lange Liste zeigt man seitenweise. Die naheliegende Lösung ist LIMIT 20 OFFSET 7980: „Überspring 7 980 Zeilen und gib mir die nächsten 20.“ Das Problem: Der Server überspringt nicht, er liest die 7 980 Zeilen und wirft sie weg. Je weiter hinten die Seite liegt, desto mehr Arbeit.

Keyset-Paginierung stellt eine andere Frage: „Gib mir die 20 Zeilen nach der letzten, die ich gesehen habe.“ Die letzte Zeile ist durch ihren Sortierschlüssel (hier Zeitpunkt und ID) bekannt. Mit passendem Index springt der Server direkt dorthin und liest nur noch 20 Zeilen, egal wie weit hinten die Seite liegt.

Der Preis: Du kannst nicht direkt zu Seite 400 springen, sondern nur „weiter“ und „zurück“. Für Endlosscrollen und API-Listen ist das meist genau richtig.`,
    steps: [
      'Starte „node content/examples/sql-lab/run.mjs 05“. Das Skript legt die Tabelle events mit 20 000 Zeilen und dem Index (created_at, id) an. Die Zeitstempel kommen aus einer rekursiven CTE; die dafür nötige Obergrenze max_recursive_iterations wird im Skript angehoben.',
      `Variante 1, OFFSET: Seite 400 mit 20 Zeilen. Der Server liest laut Handler_read_next ${ranking.first.next} Zeilen vom Indexanfang. Das ist die Arbeit, die Seite 400 kostet.`,
      `Variante 2, Zeilenvergleich (created_at, id) > (…): Sieht elegant aus, wird in diesem Server aber nicht als Bereich verwendet. Der Index wird von vorn gelesen: Handler_read_next ${ranking.second.next}, sogar mehr als bei OFFSET. Das gilt für diese Version; neuere Versionen können das ändern.`,
      `Variante 3, ausgeschrieben: created_at > x OR (created_at = x AND id > y). Der Server springt per Schlüsselzugriff zur Position (Handler_read_key ${ranking.third.key}) und liest nur ${ranking.third.next} Folgezeilen. So skaliert die Seite unabhängig von ihrer Position.`,
      'Der Sortierschlüssel muss eindeutig und stabil sein. created_at allein genügt nicht, weil mehrere Zeilen denselben Zeitstempel haben können; die ID als zweites Kriterium macht die Ordnung eindeutig.',
      'Fairness: Variante 3 liest zusätzlich die Spalte payload, die Varianten 1 und 2 nur die ID. Die Zahlen sind Zählerstände einer Sitzung (FLUSH STATUS davor), keine Zeitmessung; auf einer größeren Tabelle würdest du zusätzlich die Laufzeit messen.',
      'Überlege, was Nutzer bei Keyset verlieren: Sprung auf Seite N, Gesamtzahl der Seiten, Rückwärtsblättern verlangt umgekehrte Sortierung.',
    ],
    background: `Handler_read_next zählt, wie oft der Server im Index zur nächsten Zeile weiterging; Handler_read_key zählt gezielte Schlüsselzugriffe. Beide sind einfache, wiederholbare Maße für „wie viele Zeilen wurden angefasst“, auch auf kleinen Testtabellen, wo die Laufzeit zu kurz zum Messen wäre. Sie sagen nichts über Netzwerk, Cache oder Sortierung im Speicher.

Wann trotzdem OFFSET? Bei kleinen Tabellen oder wenn Nutzer wirklich gezielt Seitenzahlen anspringen müssen und die Daten überschaubar sind. Dann ist die Einfachheit mehr wert als die Skalierung. Bei Tabellen mit Millionen Zeilen oder öffentlichen API-Listen ist Keyset (oft „Cursor“ genannt) die Regel; der Cursor kodiert den letzten Schlüssel. Validiere ihn serverseitig wie jede Eingabe, damit niemand über manipulierte Cursor Fehler auslöst.

Der Zeilenvergleich in Variante 2 ist ein Beispiel dafür, dass „sollte gehen“ gemessen werden muss: Dieselbe Idee gibt in anderen Datenbanken oder Versionen einen Bereichszugriff. Prüfe mit EXPLAIN und Zählern, was dein Server tut.`,
    terms: [
      { term: 'OFFSET', text: 'Überspringt eine Anzahl Zeilen, die der Server vorher lesen und verwerfen muss.' },
      { term: 'Keyset-Paginierung', text: 'Blättern über den Sortierschlüssel der letzten Zeile („nach X“) statt über eine Zeilenanzahl.' },
      { term: 'Handler_read_next', text: 'Statuszähler: wie oft der Server im Index zur nächsten Zeile weiterging.' },
      { term: 'Cursor (API)', text: 'Kodierter Schlüssel der letzten Zeile, den der Client für die nächste Seite zurückgibt.' },
    ],
    code: { file: lab + 'cases/05-seiten.sql', lang: 'SQL', from: '-- Variante 1', to: "'Handler_read_next');" },
    code2: { file: lab + 'cases/05-seiten.sql', lang: 'SQL', from: '-- Variante 2', to: "'Handler_read_next');" },
    code3: { file: lab + 'cases/05-seiten.sql', lang: 'SQL', from: '-- Variante 3', to: "'Handler_read_next');" },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: `${header('05-seiten')}\nHandler-Zähler je Variante (Auszug; die ID-Listen stehen in cases/05-seiten.expected):\nVariante 1 (OFFSET 7980):          Handler_read_first ${ranking.first.first}, Handler_read_key ${ranking.first.key}, Handler_read_next ${ranking.first.next}\nVariante 2 (Zeilenvergleich):      Handler_read_first ${ranking.second.first}, Handler_read_key ${ranking.second.key}, Handler_read_next ${ranking.second.next}\nVariante 3 (ausgeschriebene OR):   Handler_read_first ${ranking.third.first}, Handler_read_key ${ranking.third.key}, Handler_read_next ${ranking.third.next}\nAlle drei liefern zwanzig Zeilen; Variante 1 ab ID 7981, Variante 2 und 3 ab ID 8460.`,
    mistakes: [
      { wrong: 'Mit LIMIT/OFFSET durch Tabellen mit Millionen Zeilen zu blättern.', why: 'Jede Folgeseite liest alle Zeilen davor; die Last wächst mit der Seitenzahl, und Seiten driften bei neuen Zeilen.', fix: 'Keyset-Paginierung mit eindeutigem Sortierschlüssel und passendem Index verwenden.' },
      { wrong: 'Nur nach einer nicht eindeutigen Spalte zu sortieren, etwa created_at, und danach zu blättern.', why: 'Gleiche Zeitstempel erzeugen Lücken oder Doppelte zwischen Seiten.', fix: 'Eine eindeutige Spalte (ID) als letztes Sortierkriterium und im Schlüsselvergleich ergänzen.' },
      { wrong: 'Sich auf den Zeilenvergleich (a, b) > (x, y) zu verlassen, ohne den Plan zu prüfen.', why: 'In diesem Server wird er nicht als Bereich genutzt und liest mehr als OFFSET.', fix: 'Mit EXPLAIN und Handler-Zählern prüfen und bei Bedarf die ausgeschriebene Form nutzen.' },
      { wrong: 'Den Cursor ungeprüft in die SQL-Anweisung zu übernehmen.', why: 'Manipulierte Werte lösen Fehler aus oder, bei Verkettung, Einschleusung.', fix: 'Cursor serverseitig validieren und die Werte als Parameter binden.' },
    ],
    practice: 'Baue die Listen-API für events als Express-Route (oder Funktion) mit Cursor: Anfrage liefert 20 Zeilen und einen nextCursor aus (created_at, id). Prüfe Anfang, Mitte und Ende der Liste und ungültige Cursor.',
    exercises: [
      { task: 'Schreibe Variante 3 für absteigende Sortierung (neueste zuerst).', acceptance: 'Die Bedingung dreht die Vergleichszeichen, die Sortierung ist ORDER BY created_at DESC, id DESC, und die Handler-Zähler bleiben klein.' },
      { task: 'Grenzfall: Frage die Seite nach der letzten Zeile ab und eine Seite nach einem Schlüssel, der nicht existiert.', acceptance: 'Das Ergebnis ist leer beziehungsweise beginnt bei der nächsten vorhandenen Zeile; du beschreibst, was der Client daraus als „Ende der Liste“ ableitet.' },
      { task: 'Fehlerfall: Entferne den Index (created_at, id) und messe Variante 3 erneut.', acceptance: 'Handler_read_next steigt stark an; du erklärst, warum der Sortierschlüssel zum Index passen muss, und legst den Index wieder an.' },
    ],
    quiz: [
      { q: 'Warum wird LIMIT 20 OFFSET 7980 langsamer als LIMIT 20 OFFSET 0?',
        options: ['Der Server liest die 7 980 Zeilen davor und verwirft sie.', 'OFFSET sperrt die Tabelle.', 'Die ID wird neu vergeben.', 'LIMIT wirkt bei großen Zahlen nicht.'],
        correct: 0,
        rationales: ['Die Arbeit wächst mit der Zahl der übersprungenen Zeilen.', 'Es entsteht keine Sperre.', 'IDs werden nicht verändert.', 'LIMIT wirkt immer, aber nach dem Überspringen.'],
        explain: 'OFFSET überspringt nicht, sondern liest und verwirft Zeilen; die Kosten steigen mit jeder Seite.' },
      { q: 'Was braucht Keyset-Paginierung unbedingt?',
        options: ['Eine Tabelle ohne Index.', 'Mindestens eine Million Zeilen.', 'Einen eindeutigen, stabilen Sortierschlüssel.', 'Eine Funktion, die Seitenzahlen berechnet.'],
        correct: 2,
        rationales: ['Ohne passenden Index wird sie langsam.', 'Auch kleine Tabellen funktionieren.', 'Nur so ist „nach dieser Zeile“ eindeutig.', 'Seitenzahlen sind bei Keyset gerade nicht vorgesehen.'],
        explain: 'Der Schlüssel (hier Zeitpunkt und ID) legt eindeutig fest, wo die nächste Seite beginnt.' },
      { q: 'Was zeigte der Lab-Fall für den Zeilenvergleich (created_at, id) > (…) in diesem Server?',
        options: ['Er springt direkt zur Position und liest 20 Zeilen.', 'Er wird nicht als Bereich genutzt und liest viele Zeilen.', 'Er führt zu einem Syntaxfehler.', 'Er sperrt die Tabelle.'],
        correct: 1,
        rationales: ['Das gilt für die ausgeschriebene OR-Form.', 'Handler_read_next war größer als bei OFFSET.', 'Die Abfrage ist gültig.', 'Es gibt keine Tabellensperre.'],
        explain: 'Das Ergebnis gilt für Server ' + version + ' und ist ein Grund, Pläne zu messen, statt zu vermuten.' },
    ],
    sources: [
      mdb('LIMIT', 'https://mariadb.com/docs/server/reference/sql-statements/data-manipulation/selecting-data/limit', 'Referenz zu LIMIT und OFFSET.'),
      mdb('Server Status Variables (Handler_read_next)', 'https://mariadb.com/docs/server/server-management/variables-and-modes/server-status-variables', 'Referenz zu den Handler-Zählern.'),
      mdb('EXPLAIN', 'https://mariadb.com/docs/server/reference/sql-statements/administrative-sql-statements/analyze-and-explain-statements/explain', 'Referenz zum Ausführungsplan.'),
    ],
    verification: verificationCommon('Seite 400 per OFFSET, Zeilenvergleich und ausgeschriebene OR-Form auf 20 000 Zeilen, gemessen mit den Handler-Zählern.', 'Laufzeit, andere Serverversionen (der Zeilenvergleich kann dort anders optimiert werden), parallele Schreibzugriffe während des Blätterns, Rückwärtsblättern.'),
  },
  {
    id: 'mariadb-m2-l6', title: 'Schema ändern ohne Ausfall: Expand, Backfill, Contract', minutes: 40,
    prerequisites,
    objectives: [
      'Eine Schemaänderung in abwärtskompatible Schritte zerlegen',
      'Migrationen idempotent schreiben, sodass ein zweiter Lauf nichts kaputt macht',
      'Daten in kleinen Stapeln übertragen und vor dem NOT NULL prüfen',
      'Die Reihenfolge „erst Code, dann Contract“ begründen',
    ],
    simple: `Im Alltag läuft die Anwendung, während das Schema sich ändert. Wenn du eine Spalte name in first_name und last_name aufteilst, darf der alte Code in der Zwischenzeit nicht brechen. Das Muster heißt Expand/Contract: Erst erweitern (neue Spalten, die der alte Code nicht kennt), dann Daten übertragen, dann den Code umstellen, und erst am Ende zurückbauen (alte Spalte entfernen, neue auf NOT NULL setzen).

Jeder Schritt muss für sich sicher sein und sich wiederholen lassen. Eine Migration, die beim zweiten Lauf scheitert, ist im Betrieb ein Risiko, denn nach Abbrüchen weiß niemand genau, wie weit sie kam. Deshalb schreibst du sie idempotent (ADD COLUMN IF NOT EXISTS) und führst eine Tabelle schema_migrations, die festhält, welche Version angewendet wurde.

Große Datenänderungen teilst du in Stapel, damit Sperren kurz bleiben, und prüfst vor dem Contract mit einer Abfrage, dass nichts mehr offen ist.`,
    steps: [
      'Starte „node content/examples/sql-lab/run.mjs 06“. Das Skript legt schema_migrations an und arbeitet auf der Tabelle customers.',
      'Expand: ALTER TABLE … ADD COLUMN IF NOT EXISTS first_name, last_name NULL, ALGORITHM=INPLACE, LOCK=NONE. Die Spalten sind NULL-fähig, der alte Code kennt sie nicht und stört sich nicht. Die Angaben ALGORITHM und LOCK lassen die Anweisung scheitern, statt unbemerkt zu blockieren, falls die Änderung nicht ohne Schreibsperre möglich ist.',
      'Idempotenz: Das ALTER und das INSERT IGNORE in schema_migrations laufen ein zweites Mal ohne Fehler und ohne doppelten Eintrag. Die Tabelle enthält genau eine Version.',
      'Backfill: Ein UPDATE mit ORDER BY id LIMIT 3 überträgt die Namensteile in einem Stapel. Danach zeigt die Kontrollabfrage 3 übertragene und 3 offene Zeilen. Im Alltag nimmst du größere Stapel (etwa 1 000) und wiederholst das UPDATE, bis keine Zeile mehr offen ist.',
      'Nach dem zweiten Stapel sind alle sechs Kunden übertragen. Die Prüfabfrage meldet 0 Zeilen ohne Namensteile; erst jetzt ist Contract erlaubt.',
      'Contract: MODIFY … NOT NULL macht die Spalten verpflichtend. Der alte Code kennt nur name; sein INSERT scheitert jetzt mit Fehler 1364, weil first_name keinen Standardwert hat. Darum gilt: erst Code umstellen und ausrollen, dann Contract. Das INSERT des neuen Codes mit first_name und last_name gelingt.',
      'Rückbau: DROP COLUMN name entfernt die alte Spalte. Ab jetzt gibt es keinen einfachen Weg zurück; die Kontrolle zählt zwei verbleibende Spalten. Dieser letzte Schritt gehört in eine spätere Migration, nachdem klar ist, dass nichts mehr auf name zugreift.',
    ],
    background: `Wie „online“ ein ALTER ist, hängt von Version, Engine und Änderung ab. Manche Änderungen laufen im Hintergrund (INPLACE), andere kopieren die Tabelle (COPY) und sperren Schreibzugriffe. Mit ALGORITHM und LOCK bestimmst du, was du akzeptierst; lies die Dokumentation zu Online-DDL für deine Version und teste mit einer Kopie der Produktionsdaten.

Zwei Dinge bleiben bei jeder Migration wichtig: eine Sicherung vor dem Start und ein Plan für den Rückweg. Bis zum Contract ist der Rückweg einfach (die alte Spalte ist ja noch da). Nach DROP COLUMN gibt es ihn nur über die Sicherung. Deshalb lohnt es, zwischen Contract und Löschen einige Tage Beobachtung einzuplanen.

Das Lab schreibt Zeitwerte fest (applied_at DEFAULT mit festem Datum), damit die Ausgabe wiederholbar ist; in echten Projekten steht dort CURRENT_TIMESTAMP. Der Namenssplit am ersten Leerzeichen ist eine Vereinfachung: Namen wie „van der Berg“ oder „Anna Maria Schmidt“ lassen sich so nicht fehlerfrei teilen. Plane dafür eine Korrekturliste ein.`,
    terms: [
      { term: 'Expand/Contract', text: 'Muster für Schemaänderungen: erst abwärtskompatibel erweitern, dann Daten und Code umstellen, am Ende zurückbauen.' },
      { term: 'idempotent', text: 'Mehrfach ausführbar mit demselben Ergebnis wie einmal.' },
      { term: 'Backfill', text: 'Nachträgliches Befüllen neuer Spalten aus vorhandenen Daten, meist in Stapeln.' },
      { term: 'Online-DDL', text: 'Schemaänderung, die parallele Lese- und Schreibzugriffe erlaubt (je nach Algorithmus und Sperrmodus).' },
    ],
    code: { file: lab + 'cases/06-migration.sql', lang: 'SQL', from: '-- Schritt 1 (Expand)', to: "INSERT IGNORE INTO schema_migrations (version) VALUES ('20261114001');" },
    code2: { file: lab + 'cases/06-migration.sql', lang: 'SQL', from: '-- Schritt 2 (Backfill)', to: 'WHERE first_name IS NULL ORDER BY id LIMIT 3;' },
    code3: { file: lab + 'cases/06-migration.sql', lang: 'SQL', from: '-- Schritt 3', to: "VALUES ('Zed Neu', 'Zed', 'Neu'" },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: whole('06-migration'),
    mistakes: [
      { wrong: 'Alle Schritte in einer Migration zu erledigen: Spalten anlegen, Daten kopieren, NOT NULL setzen, alte Spalte löschen.', why: 'Der alte Code bricht sofort, und ein Fehler mittendrin lässt kaum einen sicheren Rückweg.', fix: 'Expand, Backfill, Code umstellen, Contract und Löschen als getrennte Schritte mit Prüfung dazwischen.' },
      { wrong: 'Eine große Tabelle mit einem einzigen UPDATE zu befüllen.', why: 'Das hält Sperren lange und kann andere Sitzungen in Wartezeit-Fehler treiben.', fix: 'Stapel mit LIMIT, kurze Transaktionen und Pausen; Fortschritt per Kontrollabfrage messen.' },
      { wrong: 'Migrationen ohne Versionstabelle und ohne IF NOT EXISTS zu schreiben.', why: 'Nach einem Abbruch ist unklar, was angewendet wurde; ein zweiter Lauf scheitert oder doppelt Daten.', fix: 'schema_migrations führen und Anweisungen idempotent formulieren.' },
      { wrong: 'NOT NULL zu setzen, bevor alle Zeilen befüllt und der neue Code ausgerollt ist.', why: 'Der Server lehnt die Änderung ab oder, wie im Lab, die INSERTs des alten Codes (Fehler 1364).', fix: 'Erst Kontrollabfrage auf 0 offene Zeilen, dann Code ausrollen, dann Contract.' },
    ],
    practice: 'Plane die Migration „E-Mail-Adresse von customers in eine eigene Tabelle contacts auslagern“ als Expand/Contract mit fünf nummerierten Schritten. Schreibe die SQL-Dateien idempotent und teste sie zweimal hintereinander im Lab.',
    exercises: [
      { task: 'Ergänze eine Migration, die customers eine Spalte phone VARCHAR(30) NULL hinzufügt, und führe sie dreimal aus.', acceptance: 'Es gibt keinen Fehler; schema_migrations enthält die Version genau einmal; die Spalte existiert einmal.' },
      { task: 'Grenzfall: Setze für zwei Kunden den Namen auf einen einzigen Wort-Namen („Prince“) und führe den Backfill aus.', acceptance: 'last_name bleibt leer oder NULL je nach Formel; du erklärst, warum NOT NULL daran scheitern kann, und legst eine Regel für solche Fälle fest.' },
      { task: 'Fehlerfall: Setze NOT NULL, solange noch Zeilen ohne Namensteile existieren.', acceptance: 'Der Server lehnt die Änderung ab; du ermittelst die offenen Zeilen per Abfrage und schließt den Backfill ab.' },
    ],
    quiz: [
      { q: 'Warum werden bei Expand/Contract neue Spalten zuerst NULL-fähig angelegt?',
        options: ['Weil NULL weniger Speicher braucht.', 'Damit der alte Code, der die Spalten nicht kennt, weiter schreiben kann.', 'Weil NOT NULL in MariaDB nicht erlaubt ist.', 'Weil Indizes sonst fehlschlagen.'],
        correct: 1,
        rationales: ['Das ist nicht der Grund.', 'Alte INSERTs ohne die neuen Spalten bleiben gültig.', 'NOT NULL ist erlaubt, aber erst nach dem Backfill sinnvoll.', 'Indizes funktionieren auch mit NOT NULL.'],
        explain: 'Abwärtskompatibilität ist das Ziel der ersten Phase; Pflichtfelder kommen erst im Contract.' },
      { q: 'Was bringt IF NOT EXISTS bei ADD COLUMN?',
        options: ['Es macht die Anweisung schneller.', 'Es löscht alte Spalten.', 'Es wiederholt die Anweisung bis zum Erfolg.', 'Es macht die Migration wiederholbar, ohne Fehler beim zweiten Lauf.'],
        correct: 3,
        rationales: ['Die Geschwindigkeit ändert sich nicht.', 'Es löscht nichts.', 'Es wiederholt nichts.', 'Existiert die Spalte, wird die Anweisung ohne Fehler übersprungen.'],
        explain: 'Idempotente Migrationen lassen sich nach einem Abbruch gefahrlos erneut starten.' },
      { q: 'Warum wird die Datenübertragung in kleinen Stapeln gemacht?',
        options: ['Damit Sperren kurz bleiben und andere Sitzungen kaum warten.', 'Weil UPDATE immer nur eine Zeile ändert.', 'Weil Stapel keine Transaktion brauchen.', 'Weil sonst der Index verloren geht.'],
        correct: 0,
        rationales: ['Ein großes UPDATE hält viele Zeilensperren sehr lange.', 'UPDATE ändert beliebig viele Zeilen.', 'Auch Stapel laufen in Transaktionen.', 'Indizes bleiben erhalten.'],
        explain: 'Kurze Transaktionen vermeiden Wartezeiten und lange Rollbacks bei Fehlern.' },
    ],
    sources: [
      mdb('ALTER TABLE', 'https://mariadb.com/docs/server/reference/sql-statements/data-definition/alter/alter-table', 'Referenz zu ALTER TABLE inklusive ALGORITHM und LOCK sowie IF NOT EXISTS.'),
      mdb('InnoDB Online DDL Overview', 'https://mariadb.com/docs/server/server-usage/storage-engines/innodb/innodb-online-ddl/innodb-online-ddl-overview', 'Überblick über online ausführbare Änderungen.'),
    ],
    verification: verificationCommon('Expand mit INPLACE/LOCK=NONE, zweiter Lauf ohne Fehler, Backfill in zwei Stapeln, Prüfabfrage, Fehler 1364 für alten Code nach dem Contract und DROP COLUMN.', 'echte parallele Last während der Migration, sehr große Tabellen, andere Versionen und andere Online-DDL-Verfahren, Namenszerlegung für komplizierte Namen.'),
  },
  {
    id: 'mariadb-m2-l7', title: 'Zeichensätze, Zahlen und Zeit richtig speichern', minutes: 40,
    prerequisites,
    objectives: [
      'Bytes und Zeichen bei utf8mb4 unterscheiden und Spaltenlängen richtig wählen',
      'Die Wirkung von Collations auf Vergleich, UNIQUE und Sortierung erklären',
      'Geld mit DECIMAL statt DOUBLE speichern und Rundungsregeln kennen',
      'Den strikten Modus nutzen und TIMESTAMP von DATETIME unterscheiden',
    ],
    simple: `Drei Dinge verursachen in Datenbanken überraschend oft Fehler: Text, Zahlen und Zeit. Text, weil ein Zeichen mehr als ein Byte brauchen kann und weil die Vergleichsregel (Collation) bestimmt, wann zwei Texte „gleich“ sind. Zahlen, weil Kommazahlen im Computer nicht immer exakt sind. Zeit, weil derselbe Augenblick je nach Zeitzone anders aussieht.

Für Text gilt: utf8mb4 ist der Zeichensatz, der alle Unicode-Zeichen speichert, auch Emojis (bis zu 4 Bytes). Die Collation entscheidet zum Beispiel, ob „Ä“ und „a“ gleich sind und ob ein UNIQUE-Schlüssel „Ada@Example.test“ und „ada@example.test“ als Duplikat wertet.

Für Geld nutzt du DECIMAL, nicht DOUBLE, damit 0,1 + 0,2 genau 0,3 ist. Und für Zeitpunkte unterscheidest du TIMESTAMP (wird in UTC gespeichert und je Sitzungszeitzone angezeigt) von DATETIME (speichert den Wert unverändert).`,
    steps: [
      'Starte „node content/examples/sql-lab/run.mjs 07“. Der Fall nutzt keine Shop-Daten und legt seine Tabellen selbst an.',
      'Länge: „Bär“ hat 3 Zeichen und 4 Bytes (das „ä“ braucht 2), das Emoji 1 Zeichen und 4 Bytes. CHAR_LENGTH zählt Zeichen, LENGTH Bytes. VARCHAR(n) begrenzt Zeichen, nicht Bytes; für Zeilengrößen und Indexlängen zählen aber die Bytes.',
      'Collation: Mit utf8mb4_general_ci und utf8mb4_unicode_ci sind „Ä“ und „a“ gleich (Ergebnis 1), mit utf8mb4_bin nicht. „ss“ und „ß“ gelten bei unicode_ci als gleich, bei general_ci nicht. Je nach Collation unterscheidet sich also, was WHERE, JOIN und UNIQUE als gleich ansehen.',
      'UNIQUE auf einer Spalte mit unicode_ci lehnt „ada@example.test“ ab, wenn „Ada@Example.test“ schon vorhanden ist (Fehler 1062). Für E-Mail-Adressen ist das meist gewollt; für Fälle, in denen die Groß-/Kleinschreibung zählt, gibt es _bin oder _cs-Varianten.',
      'Zahlen: 0,1 + 0,2 = 0,3 ist mit DECIMAL wahr, mit DOUBLE falsch (die Summe ist 0,30000000000000004). ROUND(2.675, 2) ergibt mit DECIMAL 2,68 und ROUND(2.5) ergibt 3: Bei exakten Dezimalzahlen wird kaufmännisch gerundet.',
      'Strikter Modus: Er ist in diesem Server aktiv (STRICT_TRANS_TABLES). 1234,5 in DECIMAL(5,2) löst Fehler 1264 aus, der zu lange Text Fehler 1406. Die Nachkommastellen von 123,456 werden dagegen ohne Fehler auf 123,46 gerundet.',
      'Zeit: Dieselbe Zeile, einmal mit Sitzungszeitzone +00:00 und einmal mit +09:00 gelesen: TIMESTAMP zeigt 12:00 und 21:00, DATETIME beide Male 12:00. Speichere Zeitpunkte, die in der Welt „passiert sind“, als TIMESTAMP oder in UTC; nutze DATETIME für Wandzeit wie „Termin um 9 Uhr am Ort“.',
    ],
    background: `Collations sind keine Kosmetik: Sie wirken auf Indizes. Ein Vergleich mit einer anderen Collation kann den Index unbrauchbar machen; ein Join zwischen Spalten mit verschiedenen Collations scheitert oder wird langsam. Lege Datenbank, Tabellen und Spalten konsistent an und prüfe die Verbindung (SET NAMES utf8mb4), sonst entstehen „Mojibake“-Fehler, bei denen aus „ä“ zwei fremde Zeichen werden.

Der strikte Modus ist keine Garantie für gültige Daten, sondern verhindert nur bestimmte stille Korrekturen. Rundung von Nachkommastellen bleibt erlaubt; ob das für dein Fachgebiet stimmt (zum Beispiel Beträge in Cent), musst du im Schema festlegen: etwa DECIMAL(12,2) und eine Anwendungsregel für Rundung.

Zeit ist komplexer, als die Typen vermuten lassen: Sommerzeit, Zeitzonenänderungen und der Wertebereich von TIMESTAMP (je nach Version begrenzt) sind eigene Themen. Das Lab zeigt nur die Umrechnung nach Sitzungszeitzone mit festen Offsets (+00:00, +09:00), nicht benannte Zeitzonen oder Sommerzeit.`,
    terms: [
      { term: 'utf8mb4', text: 'MariaDB-Zeichensatz für vollständiges Unicode; ein Zeichen belegt bis zu vier Bytes.' },
      { term: 'Collation', text: 'Regelwerk für Vergleich und Sortierung von Text, etwa Groß-/Kleinschreibung und Umlaute.' },
      { term: 'DECIMAL', text: 'Exakter Festkomma-Zahlentyp, geeignet für Geldbeträge.' },
      { term: 'TIMESTAMP', text: 'Zeittyp, der intern UTC speichert und in der Sitzungszeitzone anzeigt.' },
    ],
    code: { file: lab + 'cases/07-zeichensaetze-zahlen-zeit.sql', lang: 'SQL', from: '-- Länge in Bytes', to: "INSERT INTO users VALUES ('ada@example.test');" },
    code2: { file: lab + 'cases/07-zeichensaetze-zahlen-zeit.sql', lang: 'SQL', from: '-- Geld:', to: 'SELECT v, label FROM amounts;' },
    code3: { file: lab + 'cases/07-zeichensaetze-zahlen-zeit.sql', lang: 'SQL', from: '-- Zeit:', to: "SET SESSION time_zone = '+09:00';", plus: 1 },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: whole('07-zeichensaetze-zahlen-zeit'),
    mistakes: [
      { wrong: 'VARCHAR-Längen und Indexgrößen in Bytes zu denken, obwohl der Zeichensatz utf8mb4 ist (oder umgekehrt).', why: 'Ein Emoji braucht vier Bytes; Grenzen für Zeilen- und Indexlängen können überraschend greifen.', fix: 'Zeichen und Bytes getrennt planen, Längen mit CHAR_LENGTH und LENGTH prüfen.' },
      { wrong: 'Geldbeträge in FLOAT oder DOUBLE zu speichern.', why: 'Binäre Gleitkommazahlen können 0,1 nicht exakt darstellen; Summen weichen ab und Vergleiche schlagen fehl.', fix: 'DECIMAL mit passender Genauigkeit oder ganze Cent-Beträge verwenden.' },
      { wrong: 'Die Collation nicht zu wählen, sondern den Standard zu übernehmen.', why: 'Was als gleich gilt (UNIQUE, WHERE), hängt davon ab; E-Mails oder Namen werden unerwartet als doppelt oder verschieden gewertet.', fix: 'Collation je Spalte bewusst festlegen und mit Lab-Fällen absichern.' },
      { wrong: 'Den strikten Modus abzuschalten, um Importfehler loszuwerden.', why: 'Der Server kürzt oder verfälscht dann stillschweigend; Datenfehler fallen erst später auf.', fix: 'Importdaten bereinigen oder Fehler gezielt behandeln, den Modus aktiv lassen.' },
    ],
    practice: 'Lege eine Tabelle users mit Name (utf8mb4_unicode_ci), E-Mail (UNIQUE) und Geld-Guthaben DECIMAL(12,2) sowie einer TIMESTAMP-Spalte an, schreibe fünf Regelverstöße als Tests und halte jedes Ergebnis mit Fehlernummer fest.',
    exercises: [
      { task: 'Prüfe mit CHAR_LENGTH und LENGTH den Text „Größe 😀“ und erkläre die beiden Zahlen.', acceptance: 'Die Zeichenzahl stimmt mit dem sichtbaren Text überein; die Bytezahl ist größer; du nennst die Anteile von ö/ß/Emoji.' },
      { task: 'Grenzfall: Vergleiche „ß“ und „ss“ mit utf8mb4_bin und utf8mb4_unicode_ci.', acceptance: 'bin liefert 0, unicode_ci liefert 1; du beschreibst, was das für UNIQUE auf Nachnamen bedeutet.' },
      { task: 'Fehlerfall: Setze für eine Sitzung sql_mode auf einen Wert ohne STRICT_TRANS_TABLES und wiederhole den Insert mit 1234,5 in DECIMAL(5,2).', acceptance: 'Der Wert wird still abgeschnitten (Warnung statt Fehler); du stellst den Modus zurück und erklärst, warum die stille Korrektur gefährlich ist.' },
    ],
    quiz: [
      { q: 'Was liefert LENGTH(\'😀\') bei utf8mb4?',
        options: ['1, weil es ein Zeichen ist.', '2, weil Emojis aus zwei Hälften bestehen.', '8, weil jeder Block doppelt zählt.', '4, weil LENGTH Bytes zählt.'],
        correct: 3,
        rationales: ['Das wäre CHAR_LENGTH.', 'Es sind vier Bytes in utf8mb4.', 'Das ist nicht der Fall.', 'Ein Emoji belegt in utf8mb4 vier Bytes.'],
        explain: 'LENGTH zählt Bytes, CHAR_LENGTH Zeichen; die beiden Werte unterscheiden sich bei Nicht-ASCII-Zeichen.' },
      { q: 'Warum sollten Geldbeträge in DECIMAL statt DOUBLE stehen?',
        options: ['DECIMAL ist immer schneller.', 'DECIMAL rechnet exakt in Dezimalstellen.', 'DOUBLE kann keine Kommazahlen speichern.', 'DECIMAL braucht keine Genauigkeitsangabe.'],
        correct: 1,
        rationales: ['Die Geschwindigkeit ist hier nicht entscheidend.', 'Im Lab ist 0,1 + 0,2 = 0,3 mit DECIMAL wahr, mit DOUBLE falsch.', 'DOUBLE speichert Kommazahlen, aber binär und ungenau.', 'DECIMAL(p,s) legt Genauigkeit und Nachkommastellen fest.'],
        explain: 'DECIMAL vermeidet Gleitkomma-Abweichungen und ist deshalb der Standard für Beträge.' },
      { q: 'Dieselbe Zeile wird mit zwei verschiedenen Sitzungszeitzonen gelesen. Was ändert sich?',
        options: ['Nur DATETIME.', 'TIMESTAMP und DATETIME ändern sich beide.', 'Nur TIMESTAMP, weil es in UTC gespeichert und umgerechnet wird.', 'Nichts, Zeitzonen wirken nie auf Spalten.'],
        correct: 2,
        rationales: ['DATETIME speichert den Wert unverändert.', 'Das Lab zeigt: DATETIME blieb gleich.', 'Das Lab zeigt 12:00 und 21:00 für TIMESTAMP bei +00:00 und +09:00.', 'Sie wirken auf TIMESTAMP.'],
        explain: 'TIMESTAMP ist ein absoluter Zeitpunkt (UTC), DATETIME ein Wert ohne Zeitzone.' },
    ],
    sources: [
      mdb('Unicode', 'https://mariadb.com/docs/server/reference/data-types/string-data-types/character-sets/unicode', 'Referenz zu utf8mb4 und Unicode-Collations.'),
      mdb('DECIMAL', 'https://mariadb.com/docs/server/reference/data-types/numeric-data-types/decimal', 'Referenz zu DECIMAL.'),
      mdb('SQL_MODE', 'https://mariadb.com/docs/server/server-management/variables-and-modes/sql_mode', 'Referenz zu sql_mode und strikten Modi.'),
      mdb('TIMESTAMP', 'https://mariadb.com/docs/server/reference/data-types/date-and-time-data-types/timestamp', 'Referenz zu TIMESTAMP und Zeitzonen.'),
    ],
    verification: verificationCommon('Längen in Zeichen und Bytes, drei Collations, UNIQUE mit unicode_ci, DECIMAL gegen DOUBLE, strikter Modus mit Fehlern 1264 und 1406 sowie TIMESTAMP gegen DATETIME bei zwei Zeitzonen-Offsets.', 'benannte Zeitzonen und Sommerzeit, Wertebereich von TIMESTAMP, andere Collations und Serverversionen, Mojibake durch falsche Verbindungseinstellungen.'),
  },
  {
    id: 'mariadb-m2-l8', title: 'Projekt: Bestellung, Bericht und Sicherung', minutes: 45,
    prerequisites: 'Die Lektionen 1 bis 7 dieses Moduls, besonders Transaktionen, Sperren, Ansichten und Sicherung.',
    objectives: [
      'Eine Bestellung als Transaktion mit Bestandsprüfung und Sperre umsetzen',
      'Einen Kennzahlenbericht als Ansicht (VIEW) bereitstellen',
      'Mit mariadb-dump sichern, in eine neue Datenbank einspielen und per Prüfsumme vergleichen',
      'Grenzen der Lösung benennen und Verbesserungen vorschlagen',
    ],
    simple: `Im Abschlussprojekt kommt zusammen, was du in diesem Modul geübt hast. Ein Shop soll Bestellungen sicher annehmen: Wenn zu wenig Bestand da ist, darf nichts gebucht werden, und wenn zwei Kunden gleichzeitig das letzte Stück wollen, darf nur einer es bekommen. Das erreichst du mit einer Transaktion und einer Zeilensperre (FOR UPDATE).

Dazu kommt ein Bericht: Eine Ansicht (VIEW) speichert eine Abfrage unter einem Namen, hier den Umsatz je Kategorie. Der Bericht ruft nur noch die Ansicht auf.

Zuletzt sicherst du die Datenbank mit mariadb-dump, spielst die Sicherung in eine zweite Datenbank ein und beweist per Prüfsumme, dass beide gleich sind. Eine Sicherung zählt erst, wenn die Wiederherstellung getestet ist.`,
    steps: [
      'Starte „node content/examples/sql-lab/run.mjs 08“. Der Fall ist ein Node-Skript, das SQL an den Container schickt und dabei auch die Sicherung ausführt.',
      'Bestellung 1: Ein Monitor mit Bestand 5, bestellt werden 2 Stück. Die Transaktion sperrt die Produktzeile (FOR UPDATE), liest den Bestand, prüft ihn, legt Bestellung und Position an und bucht den Bestand ab. Ergebnis: „Bestellung 11 gebucht“, Bestand 3.',
      'Bestellung 2: Es werden 4 Stück bestellt, der Bestand ist 3. Die Bedingung schlägt fehl, es entsteht weder Bestellung noch Position, der Bestand bleibt 3. Das Skript gibt „abgelehnt“ aus.',
      'Hinweis zur Technik: Die Bedingungslogik mit INSERT … SELECT … WHERE @ok ist hier ein Lab-Kniff, damit der Ablauf in einer SQL-Sitzung läuft. In einer Anwendung prüfst du den Bestand im Code und führst bei Ablehnung ein ROLLBACK aus.',
      'Bericht: CREATE VIEW v_revenue fasst den Umsatz je Kategorie zusammen (stornierte Bestellungen zählen nicht); die Abfrage mit JOIN auf categories sortiert nach Umsatz. Die Ansicht enthält keine Summen über die Hierarchie, Eingabegeräte und Tastaturen stehen getrennt.',
      'Sicherung: mariadb-dump mit --single-transaction liefert einen konsistenten Snapshot der InnoDB-Tabellen, --routines nimmt gespeicherte Routinen mit. Das Skript prüft, dass die Datei geschrieben wurde und nicht leer ist.',
      'Wiederherstellung: Der Dump wird mit umbenanntem Datenbanknamen in lab_restore eingespielt. Die Prüfsumme (CRC32 über alle Bestellzeilen) und die Zeilenzahl 11 stimmen in beiden Datenbanken überein: „Prüfsumme nach Wiederherstellung gleich: ja“.',
    ],
    background: `Was die Lösung nicht kann: Die Prüfsumme deckt nur die Tabelle orders ab, nicht alle Tabellen; ein echter Wiederherstellungstest würde alle Tabellen und Beziehungen prüfen. Die Umbenennung per sed ist ein Lab-Kniff und für echte Daten fragil (der Name könnte im Inhalt vorkommen); besser ist ein Einspielen in eine leere Instanz oder ein Wiederherstellungsskript, das den Datenbanknamen als Parameter kennt.

Zugangsdaten und Rechte gehören nicht in die Sicherung: Benutzerkonten und ihre Rechte liegen in der Systemdatenbank, nicht in einer Anwendungsdatenbank. Sicherungsdateien enthalten alle Daten im Klartext, deshalb brauchen sie dieselben Schutzmaßnahmen wie die Datenbank selbst (Zugriffsrechte, Verschlüsselung, Aufbewahrungsfristen und im Fall personenbezogener Daten die Löschkonzepte nach Datenschutzrecht).

Mögliche Verbesserungen: Nutzungshäufigkeit des Berichts messen und bei Bedarf Indizes anlegen (Lektion 5), Wiederholung bei Deadlocks (Lektion 4), Sicherung automatisieren und die Wiederherstellung regelmäßig testen. Für diese Lektion bleibt es bei einem kleinen, nachvollziehbaren Kern.`,
    terms: [
      { term: 'VIEW', text: 'Gespeicherte Abfrage, die sich wie eine Tabelle abfragen lässt.' },
      { term: 'mariadb-dump', text: 'Kommandozeilenwerkzeug, das eine logische Sicherung als SQL-Anweisungen erzeugt.' },
      { term: '--single-transaction', text: 'Dump-Option, die einen konsistenten Snapshot von InnoDB-Tabellen liest, ohne sie zu sperren.' },
      { term: 'Prüfsumme', text: 'Berechneter Wert über Daten, mit dem sich Gleichheit zweier Bestände nachweisen lässt.' },
    ],
    code: { file: lab + 'cases/08-projekt.mjs', lang: 'JavaScript', from: 'const placeOrder', to: 'COMMIT;`;' },
    code2: { file: lab + 'cases/08-projekt.mjs', lang: 'JavaScript', from: '// 2) Kennzahlenbericht', to: 'ORDER BY revenue DESC;`));' },
    code3: { file: lab + 'cases/08-projekt.mjs', lang: 'JavaScript', from: '// 3) Sicherung', to: "out.push(`Prüfsumme nach Wiederherstellung gleich" },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: whole('08-projekt'),
    mistakes: [
      { wrong: 'Bestand zu lesen, im Code zu prüfen und danach ohne Sperre abzubuchen.', why: 'Zwei gleichzeitige Bestellungen sehen beide „genug Bestand“ und buchen zu viel ab.', fix: 'Zeile mit FOR UPDATE sperren (oder atomar mit bedingtem UPDATE) und Ergebnis prüfen.' },
      { wrong: 'Eine Sicherung zu erstellen, aber nie zurückzuspielen.', why: 'Fehler wie fehlende Rechte, leere Dateien oder defekte Dumps fallen erst im Ernstfall auf.', fix: 'Wiederherstellung regelmäßig testen und das Ergebnis per Prüfsumme und Zählungen belegen.' },
      { wrong: 'Sicherungsdateien ungeschützt im Projektordner oder im Repository abzulegen.', why: 'Sie enthalten sämtliche Daten im Klartext, möglicherweise personenbezogene.', fix: 'Außerhalb des Repositories speichern, Zugriff beschränken, verschlüsseln und Aufbewahrungsdauer festlegen.' },
      { wrong: 'Berichte ohne Gegenprobe aus einer Ansicht zu übernehmen.', why: 'Falsche Filter (zum Beispiel Stornierungen) führen zu falschen Kennzahlen, die gut aussehen.', fix: 'Die Ansicht an einer Handrechnung für zwei Kategorien prüfen und die Annahmen dokumentieren.' },
    ],
    practice: 'Erweitere das Projekt um eine Stornierung (Bestand zurückbuchen, Bestellung auf „cancelled“ setzen) als Transaktion und erweitere die Prüfsumme auf alle fünf Tabellen. Schreibe das Ergebnis als Fall 9 ins Lab.',
    exercises: [
      { task: 'Bestelle 3 Stück des Monitors (Bestand 3) und danach 1 Stück.', acceptance: 'Die erste Bestellung wird gebucht und der Bestand ist 0; die zweite wird abgelehnt; der Bericht zeigt den neuen Umsatz.' },
      { task: 'Grenzfall: Bestelle 0 Stück oder ein Produkt, das es nicht gibt.', acceptance: 'Es entsteht keine Bestellung; du erklärst, welche Regeln (CHECK qty > 0, Fremdschlüssel, Prüfung im Code) das verhindern und was fehlt.' },
      { task: 'Fehlerfall: Ändere in der Sicherung einen Wert in der Dump-Datei und spiele sie ein.', acceptance: 'Die Prüfsumme weicht ab; du zeigst, dass sie Änderungen erkennt, und beschreibst, was sie nicht erkennt (zum Beispiel Änderungen in nicht einbezogenen Tabellen).' },
    ],
    quiz: [
      { q: 'Wozu dient FOR UPDATE in der Bestelltransaktion?',
        options: ['Es ändert den Bestand automatisch.', 'Es macht die Abfrage schneller.', 'Es sperrt die Produktzeile, bis die Transaktion endet.', 'Es speichert die Bestellung als Sicherung.'],
        correct: 2,
        rationales: ['Der Bestand wird durch das UPDATE geändert.', 'Es sperrt und macht nichts schneller.', 'So kann eine zweite Bestellung den Bestand nicht gleichzeitig ändern.', 'Mit Sicherungen hat es nichts zu tun.'],
        explain: 'Die Sperre verhindert, dass zwei Bestellungen denselben Bestand gleichzeitig prüfen und abbuchen.' },
      { q: 'Was beweist die gleiche Prüfsumme nach der Wiederherstellung?',
        options: ['Die gesamte Datenbank ist identisch.', 'Die geprüfte Tabelle stimmt in diesem Lauf überein.', 'Die Sicherung ist verschlüsselt.', 'Der Server ist fehlerfrei.'],
        correct: 1,
        rationales: ['Im Lab wurde nur die Tabelle orders geprüft.', 'Die Prüfsumme gilt für die einbezogenen Spalten und Zeilen.', 'Verschlüsselung wird dadurch nicht geprüft.', 'Sie sagt nichts über den Server.'],
        explain: 'Eine Prüfsumme belegt nur, was sie umfasst; für mehr Sicherheit sind alle Tabellen und Zählungen einzubeziehen.' },
      { q: 'Was bewirkt --single-transaction bei mariadb-dump?',
        options: ['Der Dump enthält nur eine Tabelle.', 'Die Datenbank wird währenddessen gesperrt.', 'Die Sicherung wird komprimiert.', 'Er liest einen konsistenten Snapshot der InnoDB-Tabellen.'],
        correct: 3,
        rationales: ['Es betrifft nicht die Tabellenauswahl.', 'Genau das soll vermieden werden.', 'Komprimierung ist eine andere Funktion.', 'So bleibt der Dump konsistent, ohne Schreibzugriffe zu blockieren.'],
        explain: 'Die Option nutzt eine Transaktion und eignet sich für InnoDB; für andere Engines gelten andere Regeln.' },
    ],
    sources: [
      mdb('mariadb-dump / mysqldump', 'https://mariadb.com/docs/server/clients-and-utilities/backup-restore-and-import-clients/mariadb-dump', 'Referenz zu Optionen wie --single-transaction und --routines.'),
      mdb('CREATE VIEW', 'https://mariadb.com/docs/server/server-usage/views/create-view', 'Referenz zu Ansichten.'),
      mdb('START TRANSACTION, COMMIT und ROLLBACK', 'https://mariadb.com/docs/server/reference/sql-statements/transactions/start-transaction', 'Referenz zu Transaktionen.'),
    ],
    verification: verificationCommon('Bestellung mit Sperre und Bestandsprüfung (angenommen und abgelehnt), Bericht als Ansicht sowie Sicherung, Wiederherstellung in eine zweite Datenbank und CRC-Vergleich der Tabelle orders.', 'parallele Bestellungen auf demselben Produkt (nur Lektion 4 prüft Nebenläufigkeit), Prüfsumme über alle Tabellen, Wiederherstellung auf einem anderen Server, Verschlüsselung der Sicherung.'),
  },
];
