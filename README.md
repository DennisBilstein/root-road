# Root Road

> Seit 14.11.2026 heißt die Plattform „Root Road“ (früher ROOTPFAD). Geändert wurden nur sichtbare Namen. Technische Kennungen bleiben bewusst, damit gespeicherte Lernstände und Konten gültig bleiben: `localStorage`-Schlüssel `rootpfad-*`, Datenbankdatei `rootpfad.sqlite`, Export-Format `rootpfad-account-export-v1`, Header `X-Rootpfad-User`, Umgebungsvariablen `ROOTPFAD_*`, Java-Pakete `de.rootpfad.lab`. Seit 15.11.2026 heißen das npm-Paket in `package.json` und das GitHub-Repository `root-road` (`github.com/DennisBilstein/root-road`; der alte Name leitet weiter, der lokale Ordner heißt weiter `rootpfad`).

## Qualität: Start, Header, Caching · 13.11.2026

- `index.html` hat einen gültigen `<head>` (Titel, Meta-Description, `utf-8`), die Startseite eine `h1` und einen Footer mit Link zu Impressum und Datenschutz (`#/recht`).
- `assets/bootstrap.js` lädt alle Skripte parallel und führt sie in fester Reihenfolge aus; `RP_APP_READY` gilt erst nach dem Konto-Abgleich (`RP_ACCOUNT_READY` in `accounts.js`). Bis dahin sind die dynamischen Bereiche per CSS (`html:not(.rp-bereit)`) unsichtbar, damit nichts springt (CLS 0,00 statt 0,08/0,20).
- Große Datensätze laden erst beim Öffnen ihrer Ansicht über `rpLoadScriptOnce()` (`bootstrap.js`): Glossar, Quellenliste (`source-review-data.js`), Modulabnahmen (`module-assessments-data.js`). Abruf-/Bewertungskriterien der Quizfragen (`assets/quiz-contracts-data.js`, 2,5 MB) laden erst beim ersten Quiz oder der ersten Wiederholung (`rpLoadQuizContracts()`, `window.RP_QUIZ_CONTRACTS_READY`; Platzhalter und Selbstprüfkriterien erscheinen nach dem Nachladen ohne neues Rendern; Tests rufen `rpLoadQuizContracts()` auf). Die Lektionsstruktur (Titel, Quiz, Ziele, Quellen …) lädt beim Start als 5 Skripte (`assets/learning/`) plus einen rohen JSON-Datensatz (`assets/learning-data/literal-1.json`, die schlanke Modulstruktur). Die Lektionstexte (`body`, `body2`, `body3`, `tip`, `code`–`code4`, zusammen ca. 3,3 MB roh) liegen je Modul in `assets/lesson-bodies/<Modul>.json` und werden beim Öffnen einer Lektion nachgeladen (`rpLoadBodies` in `bootstrap.js`; bis dahin tragen die Lektionen `lazy:true`, die Seite zeigt „Lektion wird geladen …“, Fehler lassen sich wiederholen). Die Quizfragen (Frage, Optionen, Lösung, Erklärung; rund 1,5 MB roh) liegen in `assets/quiz-data.json`: Der Start kennt je Lektion nur Platzhalter (`{revision}` je Frage, `lazyQuiz:true`, damit Anzahl und Karten-IDs stimmen) und Karten ohne Fragetext. `rpLoadQuizzes()` in `bootstrap.js` lädt die Datei beim ersten Bedarf (Lektion mit Quiz, Wiederholung, Prüfung, Fehlerheft, Tagesmission) und füllt dieselben Objekte, danach gilt `window.RP_QUIZ_READY`. Der Splitter rekonstruiert die Karten beim Build aus Platzhaltern und `quiz-data.json` und bricht bei Abweichung von der Quellkette ab; die Quellkette (`RP_QUIZ_REVISIONS`, `RP_EXTRA_REVISIONS`) bleibt nur in `assets/script-01.js` (Tests lesen sie mit `tests/support/source-variable.mjs`). Die Volltextsuche startet mit Titeln und ergänzt den Volltext, sobald `rpHydrateAll()` alle Texte geladen hat; Tests rufen `rpHydrateAll()` auf, wenn sie Texte lesen. Erzeugt wird das in `scripts/split-learning-bundle.mjs`: Der Bereich von `var MODULES` bis `MODULES.sort(` (Grundbestand, Experten, Verfeinerungen, Faktenkorrekturen, Ergänzungen) wird in einer VM ausgewertet; eine neue Anweisung in diesem Bereich bricht den Build ab, bis sie eingeordnet ist. `assets/script-01.js` bleibt das vollständige Quellaggregat für Build und Audits. `bootstrap.js` holt Manifest, Konto und Datensätze gleichzeitig, lädt die Skripte per `preload` vor und führt sie erst danach in Reihenfolge aus.
- Start-Renderläufe: Solange `window.RP_BOOTING` gilt, überspringen die Startaufrufe von `render()` (`learning-paths.js`, `guided-practice.js`, `learning-missions.js`, `competencies.js`, `accounts.js`); `bootstrap.js` rendert danach einmal. Der Spickzettel wird je Lernpfad nur einmal gefiltert (`rpSheetHtml`).
- Lighthouse (mobil, lokal, einmaliger `npx lighthouse@12`-Lauf): Barrierefreiheit 100, Best Practices 100, SEO 100, Leistung 33 → 49 (simuliertes 4G, kalter Start; LCP 19 s → 12,4 s, TBT 17,6 s → 1,4 s). Der Rest ist Netzwerk: rund 2,1 MB Übertragung müssen vor der ersten Anzeige da sein, weil die Oberfläche bis dahin versteckt bleibt. Seit 15.11.2026 laden die Lektionstexte nach (siehe oben): Leistung 47 → 52 (LCP 13,2 → 8,9 s, TBT 1,6 → 1,05 s, Übertragung 2,25 → 1,54 MB; Messung gegen den lokalen Server, ein Lauf von zweien lieferte keinen Wert). Danach: ein gebündeltes Stylesheet `assets/app.css` statt elf (erzeugt von `scripts/build-css-bundle.mjs` im Build; `admin.html` lädt weiter die Einzeldateien) und Quiz-Kriterien nur bei Bedarf: Leistung 51 und 56 in zwei Läufen (Schwankung ±5; LCP 8,5–8,9 s, TBT 0,8–1,2 s, Übertragung 1,54 → 1,21 MB). Mit lazy geladenen Quizfragen: Leistung 53 und 59 in zwei Läufen, LCP 6,1 s, TBT 0,8–1,2 s, Übertragung 1,21 → 0,75 MB; die drei anderen Kategorien blieben bei 100. Ausführungszeit beim Start (15.11.2026, abends): `render()` ist bis zum ersten Aufruf durch `bootstrap.js` gesperrt (`RP_BOOTING`), `code-theme.js` rendert nicht mehr zusätzlich beim Laden, die Seitenleiste legt Lektionsknöpfe erst beim Aufklappen eines Moduls an (rund 2.500 Elemente weniger), die WebGL-Aurora startet im Leerlauf und zeichnet mit 30 statt 60 Bildern pro Sekunde. Fünf Läufe gegen die Vorversion, gleiche Maschine: Leistung median 59 → 71, TBT 750 → 300 ms (Streuung der Vorversion 50–60, jetzt 71–72); LCP bleibt bei etwa 6 s, weil bei simuliertem 4G die rund 750 KB Übertragung (davon rund 200 KB Schriften, die Überschriftenschrift (Source Serif 4, heute `root-road-serif-variable-latin.woff2`) allein 120 KB) den Takt vorgeben. Danach wurden die Achsen der Source-Serif-Dateien auf die genutzten Bereiche beschnitten (`wght` 400–700, `opsz` 14–36): 122 → 74 KB (latin) und 101 → 64 KB (latin-ext), pixelgleich zur vorherigen Darstellung (≤ 0,08 % abweichende Pixel in 12 Ansichten). Messung danach (16.11.2026, drei Läufe, lokal): Leistung 70 und 71 (ein Ausreißer mit 50 bei TBT 1,6 s), LCP 5,9–6,1 s, Übertragung 701 KB; Barrierefreiheit, Best Practices und SEO je 100. Die Schrift heißt seit dem 16.11.2026 „Root Road Serif“ (Dateien `root-road-serif-variable-*.woff2`), weil der Hersteller den Namen „Source“ als Reserved Font Name reserviert hat; Einzelheiten in `assets/fonts/LICENSE.md`.
- Der Tutor prüft `localhost:8787` nicht mehr beim Start, sondern nur auf der Tutor-Seite (Knopf „Verbinden“) oder wenn eine Frage gestellt wird.
- `server.mjs` sendet zusätzlich Permissions-Policy, COOP und CORP (HSTS nur in Produktion über HTTPS). HTML und Manifest: `no-cache`. Skripte, Styles und Lern-JSON tragen einen Inhalts-Hash (`?v=`, zur Laufzeit aus dem Dateiinhalt gebildet) und gelten dann als unveränderlich (1 Jahr); ohne passenden Hash wird revalidiert. Schriften: 30 Tage. Komprimierung: Brotli Stufe 9.
- Tests: `tests/page-quality.spec.mjs`.

## Lernfunktionen: Videos, Denkaufgaben, Wiederholplan · 13.11.2026

- **Videos zu Lektionen** (`content/lesson-videos.json`, aktuell 23 Videos zu 21 Lektionen, Englisch, offizielle Kanäle (Java, Spring, SAP, Laravel) sowie freeCodeCamp u. a.):
  nichts wird heruntergeladen oder gespiegelt. Das Video wird erst nach einem Klick auf „Video laden“ über
  `youtube-nocookie.com` eingebettet; vorher gibt es keine Anfrage an YouTube/Google. Daneben steht immer ein Direktlink.
  Titel und Kanal prüft `npm run verify:videos` per oEmbed (braucht Netz); der Inhalt der Videos ist nicht geprüft.
  Der Server sendet dafür eine CSP (frame-src, object-src, base-uri, frame-ancestors) und seit 15.11.2026 zusätzlich default-src 'self' und script-src 'self' (ohne eval, Inline-Skriptblöcke und Inline-Ereignisattribute: script-src-attr 'none'; Ausnahmen: style-src 'unsafe-inline', img-src data:/blob:, connect-src http:/https: für den einstellbaren KI-Tutor; die Sandbox der Code-Werkstatt hat eine eigene CSP). Klicks und Eingaben laufen über `data-on…`-Attribute und die Delegation in `assets/actions.js`. Die Datenschutzseite nennt die Einbettung
  (Entwurf, rechtlich prüfen lassen).
- **Kleine Denkaufgaben** (`content/puzzles.json`, 7 Aufgaben in `java-m25-l1`, `java-m25-l2`, `js-m4-l1`, `js-m4-l2`, `js-m4-l4`):
  „Fehler finden“ und „Zeilen ordnen“ (Parsons-Aufgabe, per Pfeil-Schaltflächen bedienbar). Jede Aufgabe nennt, womit sie geprüft wurde;
  Java-Aufgaben prüft `npm run verify:puzzles` mit `javac`. Einmal 10 Grund-XP je Aufgabe (20 mit dem globalen XP-Faktor), nicht nach Lösungsansicht. Kein neuer Speicher:
  der Marker liegt im vorhandenen `xpLog`.
- **Wiederholplan und schwächste Lektionen** im Fehlerheft (`assets/weak-spots.js`): fällige Karten der nächsten 7 Tage und die Lektionen
  mit der niedrigsten Trefferquote (ab 3 Antworten, unter 80 %), berechnet aus den vorhandenen Lerndaten.
- **Syntax-Glossar** (Menü „Referenz“, `content/syntax-glossary/`): 650 Einträge für HTML, CSS, JavaScript/TypeScript, Vue 3, PHP, Laravel,
  Java, SQL (MariaDB), Git, ABAP, SAP Fiori/UI5 und SAP BTP. Weitere Einträge liegen in `<sprache>.more*.mjs`. Jeder Eintrag hat Syntax, Erklärung, Beispiel, typischen Fehler und Link zur Lektion; Suche (auch über alle
  Sprachen) und Kategorie-Filter. `npm run verify:glossary` führt 253 Beispiele wirklich aus (Node 22, PHP 8.5, Java 26, SQLite, Git) und
  vergleicht die Ausgabe; jeder Eintrag zeigt, ob sein Beispiel getestet oder nur gezeigt wird. HTML, CSS, Vue, Laravel, ABAP, Fiori und BTP werden
  nicht ausgeführt. Keine unabhängige Fachprüfung.
- **Secret-Scan** (`npm run scan:secrets`): prüft alle von Git verfolgten Textdateien auf typische Schlüssel, Tokens, Zugangsdaten in URLs und lokale Home-Pfade; gibt nie den gefundenen Wert aus. Prüft nicht die Git-Historie (Stand 13.11.2026: Verlauf manuell mit denselben Mustern gescannt, keine Funde).
- `npm run build` erzeugt `assets/lesson-videos-data.js`, `assets/syntax-glossary-data.js` und `assets/practice-puzzles-data.js`.

## TypeScript, Node.js, Linux & Shell und Web-Sicherheit · 14.11.2026

33 neue Lektionen in acht Modulen, jede mit „In einfachen Worten“, Schritt-für-Schritt-Ablauf, Hintergrund, Code aus einem
getesteten Lab, Beleg (Ausgabe), typischen Fehlern, drei Übungen, drei Quizfragen mit Begründungen und Quellen. Neue Lernpfade:
`typescript` (ts-m1, ts-m2; 8 Lektionen), `node` (node-m1, node-m2; 8), `linux` (lx-m1, lx-m2; 8), `websec` (ws-m1, ws-m2; 9).
Je Modul eine eigene Abnahme in `content/assessments-tech-tracks.json`.

- Quellen der Inhalte: `content/tech-tracks/*.mjs` (eigene Texte); Generator `node scripts/prepare-tech-tracks.mjs`
  (gemeinsamer Baukasten `scripts/lib/lesson-builder.mjs`) schreibt in `content/learning-refinements.json`; danach `npm run build`.
- Labs (Stand 14.11.2026): `content/examples/ts-lab` (27 Tests), `node-lab` (49 Tests, 48 bestanden, 1 übersprungen; Node 22.23 und 24.22, Docker-Image getestet),
  `websec-lab` (38 Tests; Node 22.23: 37 bestanden, 1 übersprungen (Argon2id braucht Node ≥ 24.7), Node 24.22 im Container: alle bestanden),
  `shell-lab` (Bash-Tests in einem Debian-Container; `./run-in-container.sh`, 216 Prüfungen ohne Fehler; braucht Docker und läuft nicht in `npm run test:labs`),
  `api-lab` (25 `node:test`-Tests, Teil von `npm run test:labs`),
  `sql-lab` (acht MariaDB-Fälle in einem Wegwerf-Container; `node content/examples/sql-lab/run.mjs`; braucht Docker und läuft nicht in `npm run test:labs`).
  `npm run test:labs` führt ts-, node- und websec-Tests mit aus.
- Nicht geprüft: Browser-Verhalten von CSP, SameSite und CORS, TLS, echte Netzwerk-Abrufe (SSRF-Beispiele mit ersetztem DNS), systemd, cron,
  logrotate, sudo, macOS und Windows. Die Sicherheitsbeispiele greifen nur eigene Lehrfunktionen und lokale Test-Server an.
  Rechtshinweise (DSGVO Art. 32 bis 34, StGB) sind Orientierung und gehören juristisch geprüft.
- `npm run build` bettet Lektionscode jetzt mit einer Ersatzfunktion in `assets/script-01.js` ein (`scripts/build-learning-content.mjs`);
  zuvor zerstörten `$'`-Muster in Shell-Beispielen die Datei.

## Java 21–27, Spring Boot 4, Vue-Komponenten und Serverdaten · 12.11.2026

24 neue Lektionen in vier Modulen, jeweils mit „In einfachen Worten“, Schritt-für-Schritt-Ablauf,
Code aus einem getesteten Lab, Typischen Fehlern, drei Übungen (Normal-/Grenz-/Fehlerfall),
drei Quizfragen mit Begründungen und Quellen:

- `java-m25` (6): Pattern Matching, Sealed Types, Sequenced Collections, Virtual Threads,
  Structured Concurrency (Preview) und Stream Gatherers.
- `java-m26` (6): Flyway, Testcontainers, ProblemDetail (RFC 9457), API-Versionierung und OpenAPI,
  Boot-4-/Framework-7-Migration, RestClient mit Resilienz.
- `js-m2` (7): defineModel, provide/inject, Scoped Slots, Teleport mit `<dialog>`, Suspense (experimentell),
  Transition und reduzierte Bewegung, generische Komponenten.
- `js-m3` (5): Zod-Formulare, Query-Cache, optimistische Updates, URL-Zustand, Mini-Projekt TaskInbox.
- `js-m4` (6): Router-Guards und sicherer Rücksprung, Anmeldung mit Token-Erneuerung (Fake-Server), Vue-3.5-APIs
  (useId, useTemplateRef, defineExpose, Attribute), Reaktivitätsfallen, dynamische Formulare, Infinite Queries mit Retry und Prefetching.

Quellen der Inhalte: `content/java-vue/*.mjs` (eigene Texte). Generator: `node scripts/prepare-java-vue-content.mjs`
schreibt die Module in `content/learning-refinements.json`; danach `npm run build`. Code-Ausschnitte werden beim Erzeugen
aus den Lab-Dateien gelesen. Vier Modulabnahmen: `content/assessments-java-vue.json`.

Ausführbare Belege (Stand 12.11.2026): `content/examples/java-modern` (JDK 21 und 26; Structured Concurrency mit
`--enable-preview`, Gatherers erst ab JDK 24), `content/examples/spring-lab` (Spring Boot 4.1.2, Maven Wrapper; 18 Tests, alle bestanden; der Testcontainers-Test
startet einen PostgreSQL-17-Container und braucht laufendes Docker, sonst wird er übersprungen) und
`content/examples/vue-lab` (110 Tests, `vue-tsc` und Build ohne Fehler). `npm run test:labs` führt alle Lab-Prüfungen aus.
Lizenzhinweise: Vue-Dokumentation steht unter CC BY 4.0, Zod und TanStack Query unter MIT; es wurde kein fremder Code
kopiert, Texte sind eigene Zusammenfassungen mit Quellenlinks. JEP- und Oracle-Texte sind nur verlinkt.
Nicht geprüft: unabhängige Fachfreigabe, echte Browser-/Screenreader-Bedienung des Dialogs.

Aktueller Bestand: **121 Module, 500 Lektionen, 1.367 Lektionsfragen + 306 Zusatzkarten = 1.673 Karten**.

## ABAP / BTP / S/4HANA / Fiori · Vertiefung 08.11.2026

Acht neue Lektionen zu durchgängiger RAP-Autorisierung, EML-/Save-Tests,
Fiori-V4-Side-Effects, BTP-Identitäten, S/4HANA-Custom-Code-Migration,
wiederanlauffähigen Application Jobs, Launchpad-Diagnose und CDS-Fachsemantik.
Zehn bestehende Lektionen besitzen zusätzliche Review-/Diagnosehinweise und
Normal-,Grenz-,Fehlerfälle. 24 neue und 20 ersetzte Szenariofragen mit jeweils
begründeten Antwortoptionen, Quellen und Abruf-/Selbstprüfkriterien.
Alte Quiz-Evidenz bleibt erhalten, zählt nicht automatisch für neue Revisionen.

Bestand nach dieser Vertiefung: 116 Module, 470 Lektionen, 1.277 Lektionsfragen + 306
Zusatzkarten = 1.583 Karten (aktueller Bestand siehe oben). Quelle: `content/abap-senior-curriculum.mjs`;
lesbare Exporte unter `content/abap-senior/`. „Senior-Praxis“ bezeichnet
quellenbasierte Reviewhinweise, keine persönliche Berufserfahrung und keine
unabhängige Senior-Freigabe. SAP-Code wurde nicht in einem SAP-System ausgeführt.

## Kontosicherheit und Auslieferung · 08.11.2026

Angemeldete Konten können unter „Kontoeinstellungen“ ihr Passwort ändern und
Konto/Serverlernstand als JSON herunterladen. Passwortänderung verlangt das alte
Passwort, widerruft alle bisherigen Sitzungen und stellt eine neue für das
aktuelle Gerät aus. „Passwort vergessen“ ermöglicht einen 15 Minuten gültigen,
einmaligen Reset; echte Zustellung benötigt SMTP-Konfiguration. Standard: kein
Versand. Einrichtung und privater Entwicklungsmodus: [Mailkonfiguration](docs/mail-configuration.md).
Unter Kontoeinstellungen ist außerdem passwortbestätigte Konto-/Datenlöschung
verfügbar; letzter Admin geschützt, Backups/Downloads/andere Geräte nicht umfasst.
Export enthält keine Passwort-Hashes oder Sessiontokens; Datei geschützt halten.

Passwortableitung nutzt asynchrones scrypt und bleibt mit bisherigen Hashes
kompatibel. Registrierung/Setup prüfen nach der Berechnung erneut Einmalrechte,
damit parallele Requests keinen Einladungs-/Setup-Token mehrfach verbrauchen.
Öffentliche Assets werden bei Clientunterstützung komprimiert. Authentifizierte
API-Antworten sind davon ausgeschlossen. Das reduziert Übertragungsgröße, ersetzt
aber kein Lasttestkonzept. Der Browser lädt jetzt 9 geordnete Skripte unter
300 KB und 5 JSON-Datensätze über `assets/learning-manifest.json`, nicht mehr das große Quellaggregat.
Das ist keine Lazy-Loading-Lösung: alle Teile werden weiterhin beim Start geladen.
`assets/script-01.js` bleibt Build-/Prüfaggregat; nach Inhaltsänderungen `npm run build`.

### Gezielte Inhaltsvertiefung

Bestehende API-/Event-Lektionen enthalten zusätzliche Abschnitte zu SSRF,
HTTP Caching und Transactional Outbox mit Normal-,Grenz-,Fehlerfällen und
begründeten Selbsttests. IDs und historische Lernstände bleiben unverändert.
Quelle: `content/application-supplements.mjs`. Der damalige Bestand war 116 Module,
462 Lektionen und 1.559 Karten; aktueller Bestand siehe oben. Technische Prüfungen sind keine unabhängige
menschliche Fachbegutachtung.

## Vollständige Abdeckung mit Selbstprüfkriterien

Alle 1.583 vorhandenen Lektions- und Zusatzkarten besitzen einen fragebezogenen
Abrufauftrag und Kriterien für Entscheidung,Begründung,Abgrenzung und Anwendung.
Die Rubrik erscheint in Lektionsquiz und Wiederholung. Sie wird nicht automatisch
benotet, bleibt sitzungsbezogen und begründet keine zusätzlichen Kompetenz-XP.
Abdeckung: `content/quality/quiz-contract-coverage.json`.
Zusätzlich ist die gesamte Inhaltsredaktion jetzt integriert: 1.253
Lektionsfragen und 306 Zusatzkarten wurden individuell neu bearbeitet. Eine
unabhängige menschliche Fach-Zweitbegutachtung ist damit nicht behauptet.

## Fachliche Quizrevisionen

Alle 1.559 Fragen/Karten wurden durch neue Anwendungsfragen samt eigener
Distraktorbegründungen ersetzt. Revidierte Fragen erhalten neue Kartenrevisionen;
alte Lernstände bleiben gespeichert, gelten aber nicht als neuer Nachweis.
Fortschrittszählung für bearbeitete Lektionen bleibt davon getrennt.
**Vollständige redaktionelle Abdeckung:** keine Lektionsfrage oder Zusatzkarte
ohne neue Inhaltsrevision. Technische Prüfung ist nicht Fachzertifizierung. Maschinenlesbarer
Stand: `content/quality/quiz-editorial-status.json`, Bericht:
`reports/Vollständige fachliche Quizredaktion.md`.

## Kompetenzen, Prüfqualität und praktische Arbeiten

„Kompetenzen & Abnahmen“ trennt Lesemarkierungen und Auswahl-Erkennen von
praktisch eingereichter/abgenommener Arbeit. Alle 121 Module haben eigene
Abnahmeaufträge mit 363 konkreten Fällen und modulspezifischen Kriterien.
Sie bleiben manuell zu prüfen, keine 121 unabhängig validierten Fachprüfungen. Adminfreigaben sind serverseitig
geschützt. Der bestehende Ampelvertrag bleibt Aktivität/Bearbeitung.

Drei Aufgabenfamilien haben je zwei getrennte numerische Parallelformen, mit
einer transparenten Dreitagesregel. Noch keine Parallelformen für jeden Stoff.
Fragenunklarheit kann gemeldet werden. Adminauswertung zählt Erstversuche pro
Revision und Konto, keine vorgetäuschte statistische Schwierigkeit bei kleinen
Stichproben. Quellenregister trennt Abrufstatus und Inhaltsprüfung; einige
automatisierte Abrufe sind gesperrt. Ein Link-200 ist kein Inhaltsnachweis.

`npm run audit:learning` prüft Vollständigkeit, Karten-IDs und Laufnachweise.
`npm run test:labs` führt die separaten Laravel-/Vue-Laborprüfungen aus.

## Einheitliches Codebild und vertiefte Quizansicht

Tokyo Night gilt auch für neu hinzugekommene Codeflächen. Der vorhandene
escaped Regex-Tokenizer wurde um JS/TS,Vue/HTML,CSS,Java und ABAP ergänzt;
er ist keine vollständige Sprachgrammatik. Reine Codeinhalte und Kopiertexte
bleiben erhalten; editierbare Textareas nutzen die gleiche Palette, ohne
vorzutäuschen, dort einen vollständigen Syntaxeditor anzubieten.

Alle Lektionsquizze bieten zuerst eine optionale freie Erklärung mit Grenzfall
und Sicherheitseinschätzung; Optionen werden bewusst aufgeklappt. Freitext
wird nicht automatisch benotet. Nach Prüfung folgen ursprüngliche Begründung,
Antwortvergleich und Transferauftrag. Entwürfe sind nur sitzungsbezogen.
15 zusätzliche fachlich ausgearbeitete Szenariofragen mit individuellen
Distraktorbegründungen stehen in `content/quiz-transfer.mjs`; bestehende
Frageindizes bleiben unverändert. Das ist keine Behauptung, sämtliche alten
Fragen bereits fachlich neu geschrieben zu haben. Prüfungs-/Wiederholungspools
erhalten die neuen Fragen, nicht automatisch die gesamte Freitextansicht.

## MariaDB, APIs und KI-Engineering · Stichtag 06.11.2026

Drei weitere Lernpfade: MariaDB (6 Lektionen), APIs & Integration (6),
KI/MCP/Agents (4 MCP- und 7 Harness-/Arbeitsablauflektionen). Zusammen 23 neue
Lektionen mit 69 Selbsttestfragen und je drei Übungen. Zehn bestehende
AP1-KI-Lektionen behalten ihre Grundlagen und erhalten datierte Ergänzungen;
das ist keine vollständige neue Rechts-/Versionsprüfung ihrer älteren Texte.

MCP referenziert ausdrücklich Revision 2026-07-28, OpenAPI die geprüfte
veröffentlichte 3.2.1. MariaDB-Linien werden anhand der Maintenance-Policy
eingeordnet; ein konkreter lokaler DB-/SDK-Lauf wird nicht behauptet.
19 unterschiedliche neue Quellen erreichbar, Abrufprotokoll unter
`content/quality/platform-sources.json`. Eigene Beispiele und Erklärungen;
kostenlose Doku bedeutet nicht kostenlose Modell-/Cloudnutzung.

Generator: `node scripts/prepare-platform-content.mjs`, danach `npm run build`.
Inhalte: `content/platform-curriculum.mjs`. Die Werkstatt umfasst nun
15 Spuren mit 45 Aufgaben. MariaDB-/API-/MCP-Ergänzungen führen keine echte
DB-,Netzwerk- oder Agentaktion aus. Keine produktive Datenbank oder globale
Harness-Konfiguration wurde verändert.

## HTML und CSS

Eigener Lernpfad mit 12 Lektionen in zwei Modulen: HTML-Dokument, Semantik,
Links/Bilder, Formulare, Tabellen/Accessibility sowie CSS-Kaskade, Boxmodell,
Typografie/Fokus, Flexbox, Grid, Responsive Design und Abschlussprojekt.
36 Quizkarten, je drei Übungen mit Abnahme und sechs Codewerkstatt-Ergänzungen.
Das eigene statische Beispiel liegt in `content/examples/html-css-lab/` und kann
ohne Build geöffnet werden. Kein echtes Formularbackend. Generator:
`node scripts/prepare-html-css.mjs`, anschließend `npm run build`.
Die Werkstatt umfasst damit insgesamt 12 Spuren und 36 Aufgaben.

### HTML und CSS: Vertiefung (9 weitere Lektionen)

Zwei zusätzliche Module `html-m2` (responsive Bilder, Kopfbereich und strukturierte Daten, native Interaktion mit
dialog/popover/details, Barrierefreiheit prüfen) und `css-m2` (Designtokens und Dunkelmodus, `@layer`/`:where`/`:is`/`:has`,
Container Queries und `clamp()`, Bewegung mit `prefers-reduced-motion`, Abschlussprojekt Lernkarten-Galerie). Der Pfad hat
damit 21 Lektionen und 63 Selbsttestfragen. Quellen: `content/tech-tracks/html-vertiefung.mjs` und `css-vertiefung.mjs` →
`node scripts/prepare-html-css-vertiefung.mjs` → `npm run build`. Das Lab liegt in
`content/examples/html-css-lab/vertiefung/` (ohne Build im Browser zu öffnen, Prüfskripte `check-head.js` und `check-a11y.js`);
`tests/html-css-vertiefung.spec.mjs` (30 Tests, Playwright 1.65.0 mit Chromium 158) belegt Dateiauswahl bei `srcset`, Kontraste in
beiden Farbmodi, Kaskadenreihenfolge, Container-Spalten, Bewegungsregeln, Dialog per Tastatur und das Abschlussprojekt.
Nur Chromium getestet; Firefox, Safari, Screenreader und Kontrastmodus sind offen und in den Lektionen so benannt. Aufgaben zur
Modulabnahme: `content/assessments-html-css.json`.

### MariaDB: Vertiefung (8 weitere Lektionen)

Modul `mariadb-m2` (Fensterfunktionen und CTEs, Normalisierung und Integrität, JSON und generierte Spalten, Sperren und Deadlocks,
Blättern mit OFFSET gegen Keyset, Schema-Migration mit Expand/Contract, Zeichensätze/Zahlen/Zeit, Abschlussprojekt mit Bestellung,
Bericht und Sicherung). Der Pfad `mariadb` hat damit 14 Lektionen. Quellen: `content/tech-tracks/mariadb-vertiefung.mjs` →
`node scripts/prepare-platform-tracks.mjs` → `npm run build` (der Generator nimmt künftige Plattform-Module wie APIs, Docker, CI/CD
und Python mit auf). Das Lab liegt in `content/examples/sql-lab/` (`node content/examples/sql-lab/run.mjs [NN] [--update]`):
ein Wegwerf-Container aus dem lokal vorhandenen Image `mariadb:11` (Server 11.8.9, ohne Download, ohne veröffentlichte Ports,
zufälliges Passwort, wird immer entfernt), erfundene Daten, acht Fälle mit erwarteter Ausgabe. Die Lektionstexte lesen ihre
Ausgaben aus diesen Dateien. Das Lab braucht Docker und läuft deshalb nicht in `npm test`, `npm run test:labs` oder der CI; die
Playwright-Suite prüft nur Umfang, Darstellung und Überlauf. Nicht geprüft: MySQL und andere MariaDB-Versionen, Lastverhalten,
Zeitzonen mit Sommerzeit. Abnahmeaufgabe: `content/assessments-platform-tracks.json`.

### APIs: Vertiefung (8 weitere Lektionen)

Modul `api-m2` (Ressourcen und Statuscodes, Fehler als Problem Details nach RFC 9457, Cursor-Paginierung, Idempotency-Key,
ETag mit If-Match/If-None-Match, Bearer-Token mit Scopes und Objektprüfung, Ratenbegrenzung und Abkündigung von Versionen,
Projekt mit OpenAPI-Vertrag und Vertragstest). Der Pfad `apis` hat damit 14 Lektionen. Quelle:
`content/tech-tracks/api-vertiefung.mjs` → `node scripts/prepare-platform-tracks.mjs` → `npm run build`. Das Lab
`content/examples/api-lab/` kommt ohne Abhängigkeiten aus (`npm test`, 25 Tests mit `node:test`; Node 22.23 lokal und 24.22 im Container
geprüft) und ist Teil von `npm run test:labs`. Die Testausgaben in den Lektionen entstehen beim Erzeugen aus einem echten Testlauf. Nicht geprüft:
mehrere Instanzen, TLS, Anmeldung/Widerruf von Token, ein OpenAPI-Validator (der Vertrag wird nur durch den Vertragstest geprüft; die
Spezifikation hat am Stichtag Version 3.2.1, das Lab nutzt 3.1.0). `Idempotency-Key` ist ein IETF-Entwurf, kein RFC.

### Docker & Container (neuer Pfad `docker`, 6 Lektionen)

Modul `dk-m1` (Image und Build-Cache, `.dockerignore` und mehrstufige Builds mit Tests, Härtung, Volumes/Netzwerke/Ports, Betrieb mit Geheimnissen,
Gesundheitscheck und Signalen, Projekt mit Docker Compose). Quelle: `content/tech-tracks/docker-grundlagen.mjs` →
`node scripts/prepare-platform-tracks.mjs` → `npm run build`; der Pfad ist in `assets/learning-paths.js` und `tests/learning-paths.spec.mjs` eingetragen.
Das Lab `content/examples/docker-lab/` startet echte Container (Docker 29.8.2 mit Docker Desktop auf macOS, Compose 5.6.0, Image `node:24-slim` aus dem
lokalen Speicher, ohne Download): `node content/examples/docker-lab/run.mjs [NN] [--update]`. Es räumt nur Ressourcen auf, die es selbst angelegt hat
(Präfix `rootpfad-dk-<pid>`, Label `rootpfad.lab=docker-lab`). Es braucht Docker und läuft nicht in `npm test` oder der CI; die App-Tests laufen in
`npm run test:labs`. Nicht geprüft: native Linux-Hosts, rootless Docker, Podman, Registry und Veröffentlichung, Last- und Ausfallverhalten.

### CI/CD mit GitHub Actions (neuer Pfad `cicd`, 6 Lektionen)

Modul `ci-m1` (Workflow-Aufbau, Cache/Matrix/concurrency/Zeitlimits, Rechte nach dem Minimalprinzip, Script-Injection, Lieferkette mit
SHA-Festlegung und `pull_request_target`, Release mit Freigabe und OIDC). Quelle: `content/tech-tracks/cicd-grundlagen.mjs` →
`node scripts/prepare-platform-tracks.mjs` → `npm run build`; der Pfad ist in `assets/learning-paths.js` und `tests/learning-paths.spec.mjs` eingetragen.
Das Lab `content/examples/ci-lab/` enthält einen zeilenbasierten Linter für Workflow-Dateien (sechs Regeln, keine Abhängigkeiten), Beispiel-Workflows
(`workflows/good-*.yml`, `bad-*.yml`, nie unter `.github/workflows`) und 15 Tests (`npm test`, auch in `npm run test:labs`). Die Ausgaben der Lektionen stammen aus
echten Läufen der Lab-CLI. Nicht geprüft: echte GitHub-Läufe der Beispiele, Freigaben und OIDC, das Workflow-Lockfile (nur nach der Dokumentation beschrieben),
Dependabot; der Linter ist eine Heuristik und ersetzt actionlint oder zizmor nicht.

### Python (neuer Pfad `python`, 6 Lektionen)

Modul `py-m1` (Werte und Zahlen, Datenstrukturen, Dateien/Kodierung/CSV/JSON, Fehler und Kontextmanager, Klassen mit `dataclass` und Typhinweise,
ein getestetes Kommandozeilenprojekt). Quelle: `content/tech-tracks/python-grundlagen.mjs` → `node scripts/prepare-platform-tracks.mjs` → `npm run build`;
der Pfad ist in `assets/learning-paths.js` und `tests/learning-paths.spec.mjs` eingetragen. Das Lab `content/examples/python-lab/` nutzt nur die Standardbibliothek
(`python3 -m unittest`, 27 Tests, auch in `npm run test:labs`; Demo-Skripte `demos/0N_*.py` liefern die Ausgaben der Lektionen). Getestet mit Python 3.12.15, 3.13.16 und 3.14.6
(Ausgaben aus 3.14.6). Nicht geprüft: Python 3.15 (laut python.org am 15.11.2026 die aktuelle Version), Windows, Linux, `pip`/`venv`/Packaging, Typprüfer.

**Programmierprinzipien (16.11.2026):** Modul `pp-m1` mit einer Lektion (`pp-m1-l1`: KISS, DRY, YAGNI, SOLID, Separation of Concerns, Law of Demeter, Komposition vor Vererbung, Fail Fast, geringste Überraschung und DDD im Überblick), neuer Pfad `prinzipien`.
Quelle: `content/tech-tracks/programmierprinzipien.mjs` → `node scripts/prepare-principles-track.mjs` (eigenes Skript mit eigenem Stichtag) → `npm run build`; der Pfad ist in `assets/learning-paths.js` und `tests/learning-paths.spec.mjs` eingetragen,
die Modulabnahme in `content/assessments-tech-tracks.json`. Der Lektionsbaukasten (`scripts/lib/lesson-builder.mjs`) kennt jetzt vier Code-Slots (`code4`). Die Beispiele (je eine „Vorher“- und eine „Nachher“-Fassung) liegen unter
`content/examples/node-lab/src/principles/` mit 17 Tests (`tests/principles-*.test.js`, Teil von `npm test` im node-lab). Urheber und Jahreszahlen im Hintergrundtext am 16.11.2026 gegen die verlinkten Quellen gegengelesen. Nicht geprüft: andere Sprachen, der Wortlaut der Bücher, DDD nur im Überblick.
Bestand danach: 137 Module, 577 Lektionen, 1598+306=1904 Karten.

## Geführte Codewerkstatt

30 eigene interaktive Aufgaben für JavaScript, TypeScript, Vue, PHP, Laravel,
Java, ABAP, SQL, Git und Pseudocode. Über „Geführte Codewerkstatt“ in der
Seitenleiste öffnen; die Spuren folgen der Lernpfadauswahl. Erklären, bearbeiten,
Feedback, Hinweise und Lösungen sind direkt verbunden. Drei JS-Funktionsaufgaben
werden in einer netzwerkgesperrten Frame-/Worker-Umgebung mit Zeitlimit ausgeführt.
Alle anderen Spuren kennzeichnen die Prüfung als Codeergänzung ohne Laufzeit.
Kein beliebiger PHP-/Java-/ABAP-Code wird auf dem App-Server ausgeführt.
Details und Grenzen: `reports/Geführte Codewerkstatt.md`.

## Aktueller Lerninhalt nach Gesamtrevision

Alle 72 PHP-/Laravel-Lektionen besitzen jetzt Lernziele, verlinkte Quellen,
themenspezifische Fehler-/Entscheidungshinweise, drei abgestufte Aufgaben und
Abnahmekriterien. Der JavaScript-/Vue-Pfad umfasst 16 zusammenhängende Einheiten
bis zu einem Aufgaben-Dashboard. Ältere unten dokumentierte Ausbauzahlen sind
historisch; maßgeblich ist `reports/Lernpfade Gesamtrevision.md`.

Ausführbare Labore (separat von der Node-Lernplattform):

- `content/examples/laravel-lab`: Laravel 13, PHP 8.5, PHPUnit, SQLite-Testdaten.
- `content/examples/vue-lab`: Vue 3.5, Router 5, Pinia 4, Vite 8, TS und Vitest; seit 12.11.2026 mit Zod 4 und TanStack Query.
- `content/examples/spring-lab`: Spring Boot 4.1, Java 21, Maven Wrapper (`./mvnw test`), H2 für Tests.
- `content/examples/java-modern`: einzelne Java-Dateien (`java Datei.java`), siehe README dort.

`content/quality/` unterscheidet pro Block Syntaxcheck, tatsächliche Ausführung
und nicht integrierte Projektfragmente. Die Überarbeitung ist kein Beweis für
Produktionsreife sämtlicher Codebeispiele. Setup/Prüfbefehle stehen in den
Lab-READMEs. Lokale vendor/node_modules, DBs, Secrets und Buildartefakte bleiben
außerhalb von Git. Keine neue Root-Road-UI oder technische Vue-Migration der
Lernplattform: Vue ist hier Lerninhalt und separates Übungsprojekt.

Übernahme aus `ROOTPFAD_pro.html` mit Node-Server, Anmeldung und SQLite-Datenbank.
Design, Lerninhalte und die vorhandene Anwendungslogik bleiben erhalten.

## Starten

```sh
npm install
npm run dev
```

Anschließend http://localhost:5173 öffnen. Benötigt werden Node.js 22 und npm.
Für das optionale erneute Importieren des Originalexports wird Python 3 benötigt.

## Anmeldung und Teilnehmerampel

Beim ersten Serverstart erscheint im Terminal ein einmaliger `#setup=…`-Link.
Darüber den eigenen Admin mit Name, E-Mail und mindestens zwölf Passwortzeichen
anlegen. Der Token ist geheim, wird nicht im Repository gespeichert und ist
nach Einrichtung unbrauchbar. Ein Neustart vor Einrichtung erzeugt einen neuen.

Unter `/admin` können Administratoren einmalige, sieben Tage gültige
Einladungslinks erzeugen und manuell weitergeben. Es gibt keine offene
Registrierung. Teilnehmer sehen vor Anmeldung, welche Daten übertragen und vom
Administrator eingesehen werden. E-Mail dient als Anmeldename; E-Mail-Versand,
Adressverifikation, Passwort-Wiederherstellung und Kontolöschung per UI sind
noch nicht implementiert.

Lernstände werden nach Änderungen verzögert sowie alle 30 Sekunden übertragen.
Ein Fehler ist im Kontobereich sichtbar; lokale Daten bleiben bestehen. Jedes
Konto besitzt einen getrennten Browser-Speicherbereich. Gastdaten werden nicht
automatisch einem Konto zugeordnet. Mehrere Geräte werden additiv zusammengeführt;
gleichzeitige Antwortzähler werden wie im bisherigen Import mit Maxima statt
Summierung abgeglichen und können dadurch Aktivitäten unterzählen. Dies ist
kein manipulationssicheres Prüfungs- oder Leistungserfassungssystem.

Die Ampel wird serverseitig aus bekannten Lektions-IDs berechnet. Standard:
Grün ab 70%, Gelb ab 30%, Rot darunter oder nach sieben Tagen ohne übertragene
Lernaktivität. Pausierte und noch nicht aktive Teilnehmer sind grau. Regeln
sind im Adminbereich einstellbar. Synchronisations-Heartbeats und Pfadwechsel
allein aktualisieren die Lernaktivität nicht. Die Ampel zeigt den Bearbeitungsstand
des zuletzt übertragenen Lernpfads, keine vereinbarte Frist und keine Beherrschung.

Konten, Passwort-Hashes, Sessions und Lernstände liegen in `.data/rootpfad.sqlite`.
Dieses Verzeichnis ist von Git ausgeschlossen und darf niemals öffentlich
ausgeliefert werden. Backups der Datenbank sicher und zugriffsbeschränkt halten.
Der Server liefert nur die freigegebenen Seiten und `assets/` aus.

### Datenbank sichern und wiederherstellen

```bash
npm run db:backup                      # Online-Sicherung nach .data/backups/rootpfad-JJJJMMTT-HHMMSS.sqlite (Server darf laufen)
npm run db:backup -- --keep 30         # letzte 30 Sicherungen behalten (Standard: 14)
npm run db:restore -- <datei> --force  # Datenbank ersetzen; Server vorher stoppen
```

Die Sicherung nutzt die SQLite-Backup-API (konsistent auch im WAL-Betrieb), wird mit `integrity_check` und Tabellenprüfung
verifiziert und ist nur für den Besitzer lesbar (0600). `ROOTPFAD_BACKUP_DIR` legt einen anderen Zielordner fest; für echten
Schutz vor Datenverlust gehören Sicherungen zusätzlich auf einen anderen Datenträger oder Rechner. Die Wiederherstellung prüft die
Sicherung vorab, bewahrt den bisherigen Stand als `rootpfad.sqlite.vor-wiederherstellung-<Zeitstempel>` auf und entfernt dabei
keine Begleitdateien (`-wal`, `-shm`), sondern verschiebt sie mit. Zeitplan (z. B. täglich per cron) ist nicht eingerichtet.
Tests: `tests/db-backup.spec.mjs`.

### Fehlerprotokoll

Unbehandelte Skriptfehler im Browser (`assets/error-report.js`, höchstens 5 verschiedene Meldungen je Seitenaufruf) und
unerwartete Serverfehler (HTTP 500) landen zusammengefasst in der Tabelle `error_log` (Fehlertext, Stelle, Anzahl, erstes und
letztes Auftreten). Nicht gespeichert werden Konto, IP-Adresse, Browserkennung oder Seitenadresse mit Parametern; URL-Parameter,
E-Mail-Adressen und token-artige Zeichenfolgen werden aus den Texten entfernt. Einträge verfallen nach 30 Tagen, höchstens 500
Zeilen. Die Meldeschnittstelle `POST /api/client-errors` ist ohne Anmeldung nutzbar (Ratenlimit 60 je 15 Minuten) und
akzeptiert nur JSON vom eigenen Ursprung. Administratoren sehen und leeren das Protokoll unter `/admin`. Die
Datenschutzerklärung (Rechtstexte-Gerüst) nennt das Protokoll; sie bleibt eine Vorlage zur rechtlichen Prüfung.
Tests: `tests/error-log.spec.mjs`.

### Continuous Integration

`.github/workflows/ci.yml` baut (`npm run build`), prüft, dass generierte Dateien (ohne `content/quality` wegen Zeitstempeln)
zum Quellstand passen, und führt Secret-Scan, Lernaudit und alle Playwright-Tests aus. Der Workflow ist lokal nicht ausgeführt
worden und läuft erstmals nach dem nächsten Push; Lab-Tests (`npm run test:labs`, brauchen PHP, Java, Docker) laufen dort nicht.

### Gemeinsamer Betrieb

Standardmäßig ist der Server nur lokal erreichbar. Für andere Geräte benötigt
er einen gemeinsamen Server mit persistenter Datenablage. `HOST`, `PORT` und
`ROOTPFAD_DATA_DIR` konfigurieren Bindung und Datenpfad. Vor Internetbetrieb:
HTTPS-Reverse-Proxy, `NODE_ENV=production` (Secure-Cookies), bei genau einem
vertrauenswürdigen vorgeschalteten Proxy `TRUST_PROXY=1`, Backups, Datenschutz-
und Löschkonzept sowie Sicherheitsprüfung einrichten. Nicht unverschlüsselt im
Internet betreiben. GitHub Pages kann diesen Node-/SQLite-Server nicht hosten.
Passwörter werden mit scrypt gesalzen gehasht; Sessions sind HttpOnly/SameSite,
Admin-APIs rollenbeschränkt und Anmeldungen rate-limitiert.

## Struktur

- `index.html`: Oberfläche und Einbindung der Assets
- `assets/style-*.css`: Styles in der Reihenfolge des Originals
- `assets/script-*.js`: Anwendungslogik und Lerninhalte in ursprünglicher Ausführungsreihenfolge
- `scripts/import-source.py`: reproduzierbarer Import des HTML-Exports

Der Lernfortschritt wird durch die Original-App im Browser gespeichert. Daten aus
einer zuvor per `file://` geöffneten Version werden nicht automatisch übernommen.
Google Fonts werden weiterhin extern geladen; ohne Internet greifen Ersatzschriften.
Der KI-Tutor benötigt den im Original vorgesehenen separaten Dienst bzw. einen
konfigurierten Endpunkt; dieser ist im HTML-Export nicht enthalten.

## ABAP- und Java-Expertenpfade

Zusätzlich integriert sind 44 Module mit 136 Lektionen, allen Lektionsquizzen,
92 Zusatzkarten, 36 Übungen, 9 Algorithmus-Traces und beiden Spickzetteln.
Die Inhalte erscheinen in eigenen Kursteilen in der Seitenleiste. Quizfragen
stehen auch im gemeinsamen Wiederholungs- und Prüfungspool zur Verfügung.
Die ursprünglichen IDs und Lernstände bleiben unverändert.

```sh
npm run build:experts  # angegebenes build.mjs ausführen und Artefakte integrieren
npm run build          # aus lokalem Datensnapshot neu integrieren, ohne Temp-Dateien
npm test               # Browser-Integrationstest (nach npm install)
```

`scripts/build-experts.mjs` nutzt das vom Benutzer bereitgestellte Build-Skript
und dessen `load.mjs`. Über `ROOTPFAD_EXPERT_BUILD` kann ein anderer Pfad zum
Build-Skript angegeben werden. Die Markdown-Ausgabe und ein vollständiger
Datensnapshot liegen unter `content/expertenpfade/`. Ein erneuter HTML-Import
bindet die Expertenpfade aus diesem Snapshot automatisch wieder ein.

## Lernpfade und Trainingsfilter

Auf „Heute“ und der Kursübersicht sowie über die Seitenleiste lassen sich AP1,
Java, ABAP, PHP & Laravel, Git oder alle Inhalte auswählen. Die Auswahl wird
lokal gespeichert. Navigation, Lektionsfortschritt, Weiterlernen, Wiederholung,
Fehlerheft, Übungen, Mitschreib-Klausuren, Traces und Code-Labor verwenden den
gewählten Pfad. Nicht verfügbare Trainings zeigen einen Hinweis statt fremder
Aufgaben. XP, Abzeichen und der gespeicherte Lernstand bleiben global erhalten.

Die Prüfungsmodi Kurztest, Vollprüfung und Prüfungslänge verwenden ausschließlich
AP1-Module (Teile 1–9), unabhängig vom ausgewählten Lernpfad. „Lernpfadtraining“,
Fehlerheft und Schwachstellen folgen der Auswahl. PHP- und Git-Prüfungen bleiben
explizite Zusatzprüfungen. Es handelt sich um Übungssimulationen, nicht um
offizielle IHK-Prüfungen.

Die Erweiterung liegt in `assets/learning-paths.js` und `assets/learning-paths.css`.

## Recherchierte ABAP-Erweiterungen

22 zusätzliche deutsche Lektionen mit 54 Kontrollfragen vertiefen die bestehenden
ABAP-Module m7–m14 und m16–m20. Sie stehen jeweils vor den vorhandenen
Expertenlektionen. Schwerpunkte sind Grundlagen, Tabellen, SQL, OO, Debugging,
ADT/SAP GUI, S/4HANA, CDS, RAP, Fiori/UI5, BTP/Clean Core, Transporte, HTTP/JSON,
OData und Integration Suite. Jede Lektion enthält ein eigenes Arbeitsbeispiel,
eine Praxisaufgabe und Quellen mit konkreten Zugangshinweisen.

- `content/abap-erweiterungen/lessons.json`: redaktioneller Quelldatensatz
- `content/abap-erweiterungen/*.md`: lesbare Ausgabe pro Lektion
- `research_notes/ABAP Lernquellen und Modulerweiterung/`: Recherche und Belegprüfung
- `reports/ABAP Lernquellen und Modulerweiterung.md`: Quellenbericht

`npm run build` integriert die Ergänzungen automatisch. Freie Lektüre bedeutet
nicht kostenlosen SAP-Systemzugang; konkrete Voraussetzungen stehen pro Quelle.
Recherche vom 06.11.2026. Lehrbeispiele wurden nicht in einem SAP-System kompiliert.

## Lernwerkstatt, Missionen und Modul-Bosse

„Lernwerkstatt & Missionen“ ist über die Seitenleiste und die Startansichten
erreichbar. Tagesmissionen folgen dem Lernpfad: bis zu fünf fällige Karten
zuerst, eine Fehler-/Vertiefungsfrage und eine Frage mit eigener Antwort vor
den Auswahloptionen. Freitext wird nicht automatisch benotet. 15 Minuten sind
ein Richtwert, kein Timer. Abgeschlossene Missionen geben einmal täglich pro
Pfad 15 XP; laufende Sitzungen selbst werden beim Neuladen nicht fortgesetzt.

Drei ABAP-Bosse (Grundlagen, CDS, RAP) enthalten jeweils zwei unterschiedliche
Varianten mit je drei gemischten Fallfragen. Hinweise sind erlaubt. Für den
Selbstständigkeitsnachweis muss eine Variante vollständig ohne Hinweise richtig
gelöst sein. Jede solche Variante gibt nur einmal 30 XP.

Die Wissenskarte unterscheidet Erkundet, Geübt, Gefestigt und Übertragen. Für
„Gefestigt“ muss jede Quizfrage seit dem letzten erfassten Fehler mindestens
zweimal richtig beantwortet worden sein, mit mindestens drei Tagen Abstand
zwischen erster und letzter richtiger Antwort. „Übertragen“ erfordert zusätzlich
beide Boss-Varianten ohne Hinweise. Der Modulstatus entspricht der niedrigsten
Lektionsstufe; ein Boss-Sieg allein stuft also nicht alle Lektionen hoch.
Die Regeln sind heuristische Lernhilfen, kein validiertes Kompetenzzertifikat.

Neue Antwortzeitpunkte und Boss-Ergebnisse werden im bestehenden Lernstand unter
`learning` gespeichert und in Export/Import einbezogen. Alte Antwortstatistiken
bleiben erhalten, liefern aber keine rückwirkenden Zeitnachweise. Quellen:
`assets/learning-missions.js` (Mechanik) und `assets/learning-bosses.js` (Aufgaben).

## Ausgearbeitete Einstiegslektionen und PHP-Prüfung

`m52-l1` wurde mit Lernzielen, CLI-/PATH-Diagnose, lauffähigem Beispiel,
Fehleranalyse, Quellen, drei abgestuften Übungen und Selbsttest überarbeitet.
Die vorhandene ID bleibt bestehen; die drei Quizfragen wurden inhaltlich
aktualisiert. Bereits gespeicherte Quizstatistiken werden nicht rückwirkend
als neuer Kompetenznachweis gewertet oder gelöscht.

Auch `m52-l2` (Strings, echo und Verkettung) wurde vollständig ausgearbeitet:
Interpolation, Punkt/.=, sprintf, Heredoc/Nowdoc, typische Fehler, Quellen und
drei abgestufte Aufgaben. `content/examples/php/strings.php` wird im Test mit
der vollständigen Sollausgabe verglichen (PHP CLI erforderlich). Damit sind
2 von 72 PHP-Lektionen überarbeitet, nicht der gesamte Pfad.

Der neue Lernpfad „JavaScript & Vue“ enthält zunächst **nur Einheit 1**
(`js-m1-l1`: Werte, Variablen und Kontrollfluss), noch keinen vollständigen
Vue-Kurs. Beide Inhalte werden aus `content/learning-refinements.json` beim
Build reproduzierbar integriert. Beispiele: `content/examples/`.

`node scripts/audit-php-content.mjs` prüft die Struktur aller 72 PHP-Lektionen.
Ergebnis und konkrete redaktionelle Stichprobenbefunde stehen in
`reports/PHP Laravel Inhaltsprüfung.md`. Das ist kein Nachweis, dass alle
Framework-Beispiele vollständig ausführbar oder fachlich fehlerfrei sind.
Das PHP-Einstiegsbeispiel wurde unter PHP 8.5.11 ausgeführt, das JavaScript-
Beispiel unter Node 22.23.3; keine automatische Installation neuer Laufzeiten.

## Original-HTML erneut importieren

```sh
python3 scripts/import-source.py ~/Downloads/ROOTPFAD_pro.html
```

Dabei werden `index.html` und die aus dem Export erzeugten Assets überschrieben.

## Lizenz

- **Code** (Skripte, Server, Oberfläche, Tests, Beispielcode): [MIT](LICENSE), © 2026 Dennis Bilstein.
- **Lerninhalte** (Lektionstexte, Quizfragen, Glossartexte, Erklärungen): [CC BY 4.0](LICENSE-CONTENT). Bei Weiterverwendung bitte
  „Dennis Bilstein, Root Road“ nennen und auf die Lizenz verweisen.
- **Ausnahmen:** Die Schriften unter `assets/fonts/` stehen unter der SIL Open Font License 1.1 (siehe `assets/fonts/LICENSE.md`).
  Inhalte Dritter behalten ihre Lizenz (zum Beispiel Vue-Dokumentation CC BY 4.0, Zod und TanStack Query MIT). `research_notes/` enthält
  Arbeitsnotizen mit Verweisen auf Fremdquellen; die Rechte an dort zitierten Fremdtexten liegen bei deren Urhebern.
  Namen, Logos und Marken Dritter (SAP, Oracle, Spring, Laravel usw.) gehören den jeweiligen Inhabern.
