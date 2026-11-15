// Docker & Container · Grundlagen und Praxis. Stichtag 15.11.2026.
// Eigene Texte; Code und erwartete Ausgaben liegen unter content/examples/docker-lab/ (Docker 29.8.2 mit Docker Desktop auf macOS, Compose 5.6.0).
// Die Ausgaben der Lektionen werden aus den .expected-Dateien gelesen; node content/examples/docker-lab/run.mjs prüft sie gegen echte Container.
import fs from 'node:fs';

const lab = 'content/examples/docker-lab/';
const dockerVersion = fs.readFileSync(`${lab}cases/_version.txt`, 'utf8').trim();
const expectedLines = (name) => fs.readFileSync(`${lab}cases/${name}.expected`, 'utf8').trimEnd().split('\n');
const whole = (name) => `Docker ${dockerVersion} (Docker Desktop, macOS); Befehl: node ${lab}run.mjs ${name.slice(0, 2)}\n${expectedLines(name).join('\n')}`;
const docs = (title, url, note = 'Offizielle Dokumentation; Inhalt hier eigenständig zusammengefasst.') => ({ title: `Docker-Dokumentation: ${title}`, url, note });

export const module = {
  id: 'dk-m1', course: 'docker', part: 32, partTitle: 'Docker & Container',
  title: 'Docker & Container · Images, Härtung, Daten, Betrieb und Compose',
};

const prerequisites = 'Grundkenntnisse in der Kommandozeile (Modul „Linux & Shell“) und ein kleiner Dienst, zum Beispiel aus dem Modul „Node.js“.';
const verification = (what, notTested) => `Geprüft wurde mit dem Docker-Lab (Docker ${dockerVersion} mit Docker Desktop auf macOS, Basisimage node:24-slim aus dem lokalen Speicher): ${what} Jede Ausgabe stammt aus einem echten Lauf und wird mit der gespeicherten erwarteten Ausgabe verglichen. Nicht geprüft: ${notTested} Das Lab braucht Docker und läuft nicht in der Playwright-Suite.`;

export const lessons = [
  {
    id: 'dk-m1-l1', title: 'Image, Container und Build-Cache: Schichten verstehen', minutes: 35,
    prerequisites,
    objectives: [
      'Image (Vorlage) und Container (laufende Instanz) unterscheiden',
      'Erklären, dass jede Dockerfile-Anweisung eine Schicht ergibt, die der Build-Cache wiederverwenden kann',
      'Ein Dockerfile so ordnen, dass Änderungen am Quelltext keine Installationsschritte erneut auslösen',
      'Am Build-Protokoll erkennen, welche Schritte übernommen (CACHED) wurden',
    ],
    simple: `Ein Image ist eine unveränderliche Vorlage: Dateisystem plus Startanweisung. Ein Container ist eine laufende Instanz eines Images mit einer beschreibbaren Schicht obenauf. Aus einem Image lassen sich beliebig viele Container starten; was im Container geschieht, verändert das Image nicht.

Ein Image besteht aus Schichten. Fast jede Dockerfile-Anweisung (FROM, COPY, RUN …) erzeugt eine. Beim Bauen prüft Docker für jede Anweisung, ob es genau diese Anweisung mit genau denselben Eingaben schon gebaut hat. Wenn ja, übernimmt es das Ergebnis aus dem Cache und das Protokoll meldet CACHED. Sobald sich eine Schicht ändert, werden alle folgenden neu gebaut.

Daraus folgt die wichtigste Regel für die Reihenfolge: Erst das, was sich selten ändert (Abhängigkeitslisten, Installation), dann das, was sich oft ändert (dein Quelltext).`,
    steps: [
      'Wechsle nach content/examples/docker-lab und starte „node run.mjs 01“. Das Lab braucht ein laufendes Docker und das lokal vorhandene Image node:24-slim. Alles, was es anlegt, trägt das Label rootpfad.lab und einen Namen mit Präfix; am Ende räumt es nur das wieder auf. Fremde Container bleiben unberührt.',
      'Öffne app/Dockerfile. Die Stufe runtime kopiert zuerst nur package.json, führt dann den Installationsschritt aus und kopiert erst danach den Quelltext. Das ist die empfohlene Reihenfolge: Die Abhängigkeitsliste ändert sich selten.',
      'Der erste Build läuft mit --no-cache. Der Installationsschritt wird ausgeführt, nicht übernommen. Der zweite Build ohne Änderung übernimmt dagegen alle Schritte (CACHED).',
      'Danach ändert das Skript eine Zeile in src/server.js. Der Installationsschritt wird weiter übernommen, nur der Quelltext-Schritt wird neu gebaut. Bei echten Projekten spart das Minuten, weil die Installation von Abhängigkeiten der teuerste Schritt ist.',
      'Öffne app/Dockerfile.naive. Hier steht COPY . . vor dem Installationsschritt: Jede Quelltextänderung macht die Kopierschicht ungültig, und die Installation läuft jedes Mal neu. Das Lab zeigt das mit „Installationsschritt übernommen: nein“.',
      'Merke die Regel für den Cache: Eine Schicht wird übernommen, wenn die Anweisung und alle Dateien, die sie betrifft, unverändert sind. Bei COPY zählt der Inhalt der kopierten Dateien, nicht ihr Änderungsdatum.',
      'Überlege für ein eigenes Projekt, welche Dateien die Installation bestimmen (zum Beispiel package.json und package-lock.json) und welche nur den Quelltext enthalten.',
    ],
    background: `Wofür ist die Schichtung gut? Schichten werden von Images geteilt: Zehn Images auf demselben Basisimage speichern dieses nur einmal. Beim Herunterladen werden nur fehlende Schichten geladen. Das ist der Grund, warum kleine Basisimages und eine stabile Reihenfolge den Speicher und die Zeit sparen.

Der Cache kann auch täuschen: Ein Schritt wie „RUN apt-get update“ ändert sich nicht, obwohl sich die Paketlisten im Netz geändert haben, und wird deshalb zu lange aus dem Cache bedient. Daher gehören Aktualisierung und Installation in eine Anweisung, und für Sicherheitsupdates baut man gelegentlich bewusst ohne Cache (--no-cache), wie es das Lab beim ersten Build tut.

Zum Stand: Das Lab nutzt BuildKit, den Standard-Builder von Docker. Die Ausgabe des Fortschritts (--progress=plain) ist ein Textformat, das sich zwischen Versionen ändern kann; das Lab liest nur die Zeilen „#N [Stufe M/N] …“ und „#N CACHED“. Dass das Basisimage aus dem lokalen Speicher kommt und kein Netzwerk nötig ist, gilt für dieses Lab; ein frischer Rechner lädt es zuerst.`,
    terms: [
      { term: 'Image', text: 'Unveränderliche Vorlage aus Schichten mit Dateisystem und Startanweisung.' },
      { term: 'Container', text: 'Laufende Instanz eines Images mit eigener beschreibbarer Schicht und isolierten Prozessen.' },
      { term: 'Schicht', text: 'Ergebnis einer Dockerfile-Anweisung; wird vom Build-Cache und zwischen Images wiederverwendet.' },
      { term: 'Build-Cache', text: 'Speicher bereits gebauter Schritte; ein Schritt wird übernommen, wenn Anweisung und Eingaben gleich sind.' },
    ],
    code: { file: lab + 'app/Dockerfile', lang: 'Dockerfile', from: 'FROM node:24-slim AS runtime', to: 'COPY --from=test --chown=node:node /app/src ./src' },
    code2: { file: lab + 'app/Dockerfile.naive', lang: 'Dockerfile' },
    code3: { file: lab + 'cases/01-schichten-cache.mjs', lang: 'JavaScript', from: 'const first = ctx.build', to: 'Nach Quelltext-Änderung (naives' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: whole('01-schichten-cache'),
    mistakes: [
      { wrong: 'Zuerst den gesamten Quelltext zu kopieren und danach Abhängigkeiten zu installieren.', why: 'Jede Quelltextänderung macht die Installation ungültig; jeder Build dauert so lange wie der erste.', fix: 'Erst die Abhängigkeitsliste kopieren, installieren, dann den Quelltext kopieren.' },
      { wrong: 'Dem Cache blind zu vertrauen, auch für Sicherheitsupdates.', why: 'Ein unveränderter Schritt wird aus dem Cache bedient, auch wenn es neue Paketversionen gibt.', fix: 'Regelmäßig ohne Cache bauen (--no-cache) und Basisimages aktualisieren.' },
      { wrong: 'Images und Container zu verwechseln und Daten im Container zu „speichern“.', why: 'Der Container-Speicher verschwindet mit dem Container; das Image bleibt unverändert.', fix: 'Dauerhafte Daten in Volumes legen (Lektion 4).' },
      { wrong: 'Für jede kleine Aktion eine eigene RUN-Anweisung zu schreiben.', why: 'Es entstehen viele Schichten, und Dateien, die in einer späteren Schicht gelöscht werden, bleiben in der früheren erhalten.', fix: 'Zusammengehörige Schritte in einer Anweisung bündeln.' },
    ],
    practice: 'Nimm ein eigenes Projekt, das du in ein Image packen willst. Schreibe das Dockerfile mit Abhängigkeitsliste vor Quelltext, miss die Bauzeit des ersten und des zweiten Builds und die nach einer Quelltextänderung. Notiere, welche Schritte übernommen wurden.',
    exercises: [
      { task: 'Ändere die Datei package.json im Lab (zum Beispiel die Version) und baue erneut.', acceptance: 'Der Installationsschritt wird nicht mehr übernommen; du erklärst, warum die Abhängigkeitsliste die Installation bestimmt.' },
      { task: 'Grenzfall: Füge am Anfang des Dockerfiles eine Anweisung ARG ZEIT hinzu und baue mit zwei verschiedenen Werten.', acceptance: 'Du beschreibst, ab welcher Anweisung der Cache ungültig wird (ab der Verwendung des Arguments) und warum die Position der Anweisung zählt.' },
      { task: 'Fehlerfall: Setze COPY . . vor den Installationsschritt der Stufe runtime und ändere eine Quelltextzeile.', acceptance: 'Der Installationsschritt läuft neu; du stellst die Reihenfolge wieder her und vergleichst die Zeiten.' },
    ],
    quiz: [
      { q: 'Wann übernimmt Docker einen Schritt aus dem Build-Cache?',
        options: ['Wenn Anweisung und betroffene Dateien unverändert sind.', 'Immer, wenn der Schritt schon einmal gebaut wurde.', 'Nur nach einem Neustart des Docker-Dienstes.', 'Wenn das Image kleiner als 100 MB ist.'],
        correct: 0,
        rationales: ['Dann ist das Ergebnis gleich, und die Schicht wird wiederverwendet.', 'Bei geänderten Eingaben muss neu gebaut werden.', 'Der Neustart ändert nichts am Cache.', 'Die Größe spielt keine Rolle.'],
        explain: 'Der Cache vergleicht Anweisung und Eingaben; nach einer Änderung werden auch alle folgenden Schritte neu gebaut.' },
      { q: 'Wo gehört der Installationsschritt im Dockerfile hin?',
        options: ['Ans Ende, nach allen Kopieranweisungen.', 'Vor die Anweisung FROM.', 'Nach dem Kopieren der Abhängigkeitsliste, aber vor dem Quelltext.', 'In eine eigene Datei außerhalb des Dockerfiles.'],
        correct: 2,
        rationales: ['Dann läuft er nach jeder Quelltextänderung neu.', 'FROM muss zuerst stehen.', 'So bleibt er bei Quelltextänderungen im Cache.', 'Er gehört ins Dockerfile, damit er Teil des Builds ist.'],
        explain: 'Was sich selten ändert, steht vorn; was sich oft ändert, steht hinten.' },
      { q: 'Was passiert mit dem Image, wenn im laufenden Container eine Datei geändert wird?',
        options: ['Das Image wird dauerhaft verändert.', 'Das Image wird gelöscht.', 'Alle anderen Container sehen die Änderung sofort.', 'Es bleibt unverändert; die Änderung liegt in der Schicht des Containers.'],
        correct: 3,
        rationales: ['Images sind unveränderlich.', 'Es wird nichts gelöscht.', 'Jeder Container hat seine eigene beschreibbare Schicht.', 'Mit dem Container verschwindet auch die Änderung.'],
        explain: 'Trenne Vorlage (Image) und Instanz (Container); für dauerhafte Daten gibt es Volumes.' },
    ],
    sources: [
      docs('Build-Cache', 'https://docs.docker.com/build/cache/'),
      docs('Best Practices für Dockerfiles', 'https://docs.docker.com/build/building/best-practices/'),
      docs('Dockerfile-Referenz', 'https://docs.docker.com/reference/dockerfile/'),
    ],
    verification: verification('Cache-Verhalten bei unverändertem Build, bei Quelltextänderung mit geordnetem Dockerfile und bei einem naiven Dockerfile.', 'andere Builder-Einstellungen (Remote-Cache, andere Treiber), Linux-Hosts, Mehrplattform-Builds.'),
  },
  {
    id: 'dk-m1-l2', title: 'Dockerfile-Praxis: Build-Kontext, .dockerignore und mehrstufige Builds', minutes: 35,
    prerequisites,
    objectives: [
      'Erklären, was der Build-Kontext ist und warum .dockerignore wichtig ist',
      'Mit einem mehrstufigen Build Tests im Build ausführen und das Image schlank halten',
      'Ein Dockerfile so schreiben, dass fehlschlagende Tests kein Image erzeugen',
      'Die Größe und den Inhalt eines Images prüfen',
    ],
    simple: `Beim Bauen schickt Docker den Build-Kontext an den Builder: alle Dateien des angegebenen Ordners, auf die COPY zugreifen könnte. Liegen im Ordner große Testdaten, ein Git-Verlauf oder eine .env-Datei, gehen sie mit auf die Reise, und mit COPY . . landen sie im Image. Die Datei .dockerignore wirkt wie .gitignore: Was dort steht, gehört nicht in den Kontext.

Ein mehrstufiger Build verwendet mehrere FROM-Zeilen. Jede beginnt eine Stufe. In der ersten (hier test) werden die Tests ausgeführt. Die zweite (runtime) holt sich mit COPY --from=test nur das Ergebnis, das sie braucht. Alles andere bleibt zurück und kommt nicht in das fertige Image. Weil die runtime-Stufe vom Ergebnis der test-Stufe abhängt, gibt es kein Image, wenn ein Test fehlschlägt.`,
    steps: [
      'Starte „node run.mjs 02“. Das Skript kopiert app/ in einen temporären Ordner und legt dort eine 20 MB große Datei big.bin ab.',
      'Öffne app/.dockerignore: node_modules, .git, Protokolle, .env-Dateien und big.bin bleiben draußen. Die Datei steht im Ordner des Kontexts und wirkt für jeden COPY-Schritt.',
      'Das getrennte Image enthält in /app nur package.json und src. Das naive Image (ohne .dockerignore, mit COPY . .) enthält zusätzlich big.bin, Dockerfile, Dockerfile.naive und tests und ist mehr als 20 MB größer.',
      'Öffne app/Dockerfile: Die Stufe test kopiert Quelltext und Tests und führt „node --test“ aus. Die Stufe runtime kopiert mit COPY --from=test --chown=node:node nur src. Tests und Testdaten gelangen nie ins Laufzeit-Image.',
      'Das Skript fügt eine absichtlich fehlschlagende Testdatei hinzu und baut neu. Der Build bricht ab, und es entsteht kein Image. Der Fehler wird dort sichtbar, wo er hingehört: in der CI und beim lokalen Bauen, nicht erst im Betrieb.',
      'Beachte --chown: COPY legt Dateien sonst mit Besitzer root an. Das Laufzeit-Image läuft später mit einem unprivilegierten Benutzer (Lektion 3) und soll seine Dateien lesen können.',
      'Prüfe eigene Images mit docker image inspect (Größe) und mit einem kurzen Container, der den Inhalt auflistet (wie das Lab: ls -A /app).',
    ],
    background: `Mit .dockerignore wirkst du auf Sicherheit und Geschwindigkeit: Ein Kontext mit Gigabytes dauert, und ein versehentlich kopiertes .env oder ein privater Schlüssel im Image kann jedem ausgeliefert werden, der das Image bekommt. Schreibe die Liste lieber als Positivliste (alles ausschließen, nur Benötigtes erlauben), wenn die Quelltexte klar umrissen sind.

Warum nicht einfach nur ein schlankes Basisimage? Auch das hilft (zum Beispiel slim-Varianten), aber das Weglassen von Build-Werkzeugen, Tests und Quellen ist unabhängig davon und verkleinert zugleich die Angriffsfläche. Je weniger im Image liegt, desto weniger kann ausgenutzt werden und desto weniger wird bei Sicherheitsmeldungen gefunden.

Zur Basis: Das Lab nutzt den Tag node:24-slim. Ein Tag kann auf neue Versionen zeigen. Ein Digest (@sha256:…) fixiert genau ein Image und macht Builds wiederholbar, verlangt aber Pflege, damit Sicherheitsupdates ankommen. Beides hat Vor- und Nachteile; entscheide bewusst und dokumentiere es.`,
    terms: [
      { term: 'Build-Kontext', text: 'Die Dateien, die Docker beim Bauen an den Builder sendet und auf die COPY zugreifen kann.' },
      { term: '.dockerignore', text: 'Liste von Pfaden, die aus dem Build-Kontext ausgeschlossen werden.' },
      { term: 'mehrstufiger Build', text: 'Dockerfile mit mehreren FROM-Stufen; spätere Stufen übernehmen gezielt Ergebnisse früherer.' },
      { term: 'Digest', text: 'Eindeutiger Hash eines Images (sha256:…), der genau diese Version festlegt, im Gegensatz zu einem Tag.' },
    ],
    code: { file: lab + 'app/.dockerignore', lang: 'Text' },
    code2: { file: lab + 'app/Dockerfile', lang: 'Dockerfile', from: 'FROM node:24-slim AS test', to: 'RUN node --test "tests/*.test.js"' },
    code3: { file: lab + 'cases/02-groesse-tests.mjs', lang: 'JavaScript', from: '// Tests im Build', to: 'out.push(`Build mit rotem Test' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: whole('02-groesse-tests'),
    mistakes: [
      { wrong: 'COPY . . zu verwenden, ohne .dockerignore zu pflegen.', why: 'Geheimnisse, Verlauf, Testdaten und Abhängigkeiten des Rechners landen im Image und im Cache.', fix: '.dockerignore anlegen und nur kopieren, was gebraucht wird.' },
      { wrong: 'Tests und Build-Werkzeuge im Laufzeit-Image zu lassen.', why: 'Das Image wird größer und bietet mehr Angriffsfläche.', fix: 'Mehrstufig bauen und nur das Ergebnis in die letzte Stufe kopieren.' },
      { wrong: 'Tests nur außerhalb des Builds auszuführen und das Image trotzdem zu veröffentlichen.', why: 'Ein Image kann entstehen, obwohl der Test rot ist.', fix: 'Tests in einer Stufe ausführen, von der das Laufzeit-Image abhängt, oder die CI die Tests vor dem Build erzwingen lassen.' },
      { wrong: 'Dateien als root zu kopieren und das Image als normaler Benutzer laufen zu lassen.', why: 'Der Dienst kann die eigenen Dateien nicht ändern oder lesen, oder man macht sie aus Bequemlichkeit für alle beschreibbar.', fix: 'COPY --chown verwenden und Rechte gezielt vergeben.' },
    ],
    practice: 'Erweitere die Stufen um eine dritte, lint, die vor test läuft und fehlschlägt, wenn ein Format-Check meldet. Beschreibe, wie du das Ergebnis in die runtime-Stufe einbindest, damit der Check nicht übersprungen wird.',
    exercises: [
      { task: 'Ergänze .dockerignore um tests und baue noch einmal die Stufe test.', acceptance: 'Der Build der Stufe test scheitert, weil tests/ fehlt; du erklärst, warum .dockerignore für alle Stufen gilt, und nimmst die Zeile zurück.' },
      { task: 'Grenzfall: Lege eine .env-Datei mit einem erfundenen Wert in den Kontext und prüfe, ob sie im Image landet.', acceptance: 'Mit .dockerignore ist sie nicht im Image, ohne ist sie es; du belegst es mit einem Listing und erklärst das Risiko.' },
      { task: 'Fehlerfall: Entferne in der runtime-Stufe die Zeile COPY --from=test und kopiere stattdessen src direkt aus dem Kontext.', acceptance: 'Ein roter Test bricht den Build nicht mehr ab; du erklärst, warum die Abhängigkeit zwischen den Stufen wichtig ist, und stellst sie wieder her.' },
    ],
    quiz: [
      { q: 'Wozu dient .dockerignore?',
        options: ['Es verhindert, dass Container starten.', 'Es schließt Dateien aus dem Build-Kontext aus.', 'Es löscht Images nach dem Bauen.', 'Es verschlüsselt das Image.'],
        correct: 1,
        rationales: ['Es betrifft den Build, nicht den Start.', 'Ausgeschlossene Dateien werden nicht an den Builder gesendet und können nicht ins Image kopiert werden.', 'Es löscht nichts.', 'Es verschlüsselt nichts.'],
        explain: 'Es verkleinert den Kontext und hält Geheimnisse und Ballast draußen.' },
      { q: 'Warum entsteht im Lab kein Image, wenn ein Test fehlschlägt?',
        options: ['Docker prüft Tests grundsätzlich selbst.', 'Das Laufzeit-Image übernimmt Dateien aus der Stufe, die die Tests ausführt.', 'Der Build-Cache ist leer.', 'Die Tests laufen nach dem Build.'],
        correct: 1,
        rationales: ['Docker führt nur aus, was im Dockerfile steht.', 'Scheitert die Testanweisung, kann die Stufe nicht abgeschlossen werden, und die abhängige Stufe wird nicht gebaut.', 'Der Cache hat damit nichts zu tun.', 'Die Tests laufen in der Stufe test vor dem Kopieren.'],
        explain: 'Die Abhängigkeit zwischen den Stufen macht aus dem Test eine Bauvoraussetzung.' },
      { q: 'Was bringt ein Digest gegenüber einem Tag?',
        options: ['Er macht das Image kleiner.', 'Er legt genau ein Image fest und macht Builds wiederholbar.', 'Er ersetzt die Tests.', 'Er sorgt automatisch für Sicherheitsupdates.'],
        correct: 1,
        rationales: ['Die Größe ändert sich nicht.', 'Ein Tag kann später auf ein anderes Image zeigen, ein Digest nicht.', 'Tests bleiben nötig.', 'Im Gegenteil: Updates müssen bewusst nachgezogen werden.'],
        explain: 'Ein Digest sichert Wiederholbarkeit, verlangt aber Pflege der Basis.' },
    ],
    sources: [
      docs('Mehrstufige Builds', 'https://docs.docker.com/build/building/multi-stage/'),
      docs('Build-Kontext und .dockerignore', 'https://docs.docker.com/build/concepts/context/'),
      docs('Best Practices für Dockerfiles', 'https://docs.docker.com/build/building/best-practices/'),
    ],
    verification: verification('Inhalt und Größe von Images mit und ohne .dockerignore sowie der Abbruch des Builds bei einem fehlschlagenden Test.', 'Image-Scanner, Mehrplattform-Images, Veröffentlichung in einer Registry, Digest-Pinning mit automatischer Aktualisierung.'),
  },
  {
    id: 'dk-m1-l3', title: 'Container härten: Benutzer, Rechte, Dateisystem und Grenzen', minutes: 40,
    prerequisites,
    objectives: [
      'Einen Container ohne Root-Rechte betreiben und die Rechte (Capabilities) entfernen',
      'Das Root-Dateisystem schreibgeschützt halten und gezielt beschreibbare Bereiche (tmpfs) erlauben',
      'Speicher- und Prozessgrenzen setzen und deren Wirkung (OOM-Kill) erkennen',
      'Ein Netzwerk vollständig abschalten, wenn ein Dienst keines braucht',
    ],
    simple: `Ein Container ist kein virtueller Rechner, sondern ein normaler Prozess mit Einschränkungen des Linux-Kerns. Nach dem Prinzip der geringsten Rechte nimmst du ihm alles, was er nicht braucht. Standardmäßig läuft ein Container-Prozess als root (Benutzer 0) mit einer Reihe von Sonderrechten (Capabilities). Das ist bequem, aber riskanter: Wenn ein Angreifer den Dienst übernimmt, hat er diese Rechte im Container.

Die Härtung hat fünf Hebel. Ein unprivilegierter Benutzer (USER im Dockerfile). Keine Sonderrechte (--cap-drop ALL). Kein Rechtegewinn durch Programme (--security-opt no-new-privileges). Ein schreibgeschütztes Root-Dateisystem (--read-only), wo der Dienst gezielt in /tmp (tmpfs) oder Volumes schreibt. Und Grenzen für Speicher und Prozesse (--memory, --pids-limit), damit ein Fehler oder Angriff nicht den ganzen Rechner lahmlegt.`,
    steps: [
      'Starte „node run.mjs 03“. Das Skript startet kurze Container und lässt ein Node-Programm aus dem Container selbst Auskunft geben: Benutzer, Rechte aus /proc/self/status, Schreibversuche und Netzwerkschnittstellen.',
      'Gehärtet (Benutzer 1000, CapEff 0000000000000000, NoNewPrivs 1): Der Prozess läuft als node, besitzt keine Capabilities und kann keine neuen Rechte erwerben. Schreiben nach /app scheitert mit EROFS (schreibgeschütztes Dateisystem), Schreiben nach /tmp gelingt, weil dort ein tmpfs gemountet ist.',
      'Mit --network none gibt es nur die Schnittstelle lo: Der Container kann nichts erreichen und ist von nichts erreichbar. Für Dienste ohne Netzwerkbedarf (Batchjobs, Umwandlungen) ist das die sicherste Einstellung.',
      'Zum Vergleich läuft das naive Image mit Standardeinstellungen: Benutzer 0, Rechte ungleich null, Schreiben nach /app gelingt. Genau diese Rechte nutzt ein Angreifer nach einer Übernahme.',
      'Speichergrenze: Ein Programm, das unbegrenzt Speicher belegt, läuft mit --memory 64m (und --memory-swap gleich groß) in die Grenze. Der Kernel beendet es: Exit-Code 137, OOMKilled true, die Grenze steht in Bytes im inspect. Ohne Grenze würde der Container den Speicher des Docker-Hosts verbrauchen.',
      'Lies die Einstellungen in compose.yaml (Dienst api): read_only, tmpfs, cap_drop, security_opt, mem_limit und pids_limit. Dieselben Hebel, nur deklarativ.',
      'Teste bei eigenen Diensten schrittweise: Mit allen Einschränkungen starten, am Fehler lesen, was der Dienst braucht (zum Beispiel ein Schreibverzeichnis oder eine Capability wie NET_BIND_SERVICE für Ports unter 1024), und nur das gezielt erlauben.',
    ],
    background: `Härtung ist Risikominderung, kein Beweis für Sicherheit. Container teilen sich den Kernel des Hosts; eine Schwachstelle im Kernel oder in der Container-Laufzeit kann die Isolation brechen. Die Maßnahmen verkleinern, was ein Angreifer nach einer Übernahme des Dienstes tun kann. Sie ersetzen weder Updates noch das Prüfen der eigenen Abhängigkeiten.

Plattformhinweis: Das Lab lief mit Docker Desktop auf macOS, wo Container in einer Linux-VM laufen. Verhalten und Ausgaben zu Capabilities und Speichergrenzen entsprechen dem Linux-Kernel in dieser VM; auf einem nativen Linux-Host oder mit anderen Laufzeiten (Podman, rootless Docker) können Einzelheiten abweichen. Prüfe sie dort selbst.

Ein weiterer Hebel ist rootless Betrieb: Dabei läuft nicht nur der Container-Prozess, sondern auch der Docker-Daemon ohne Root-Rechte. Das ist ein größerer Eingriff in die Installation und nicht Teil dieses Labs. Ebenfalls außerhalb des Labs: seccomp-Profile, AppArmor oder SELinux. Standardprofile sind meist aktiv und sollten nicht abgeschaltet werden (zum Beispiel mit --privileged).`,
    terms: [
      { term: 'Capability', text: 'Einzelne Sonderberechtigung von root im Linux-Kernel, die sich einzeln erlauben oder entziehen lässt.' },
      { term: 'no-new-privileges', text: 'Einstellung, die verhindert, dass ein Prozess über setuid-Programme mehr Rechte erhält.' },
      { term: 'tmpfs', text: 'Dateisystem im Arbeitsspeicher, das beim Beenden des Containers verschwindet.' },
      { term: 'OOM-Kill', text: 'Beenden eines Prozesses durch den Kernel, weil er die Speichergrenze überschreitet (Exit-Code 137).' },
    ],
    code: { file: lab + 'cases/03-haertung.mjs', lang: 'JavaScript', from: 'const strict = parse', to: 'Netzwerkschnittstellen' },
    code2: { file: lab + 'cases/03-haertung.mjs', lang: 'JavaScript', from: '// Speichergrenze', to: 'out.push(`Speichergrenze' },
    code3: { file: lab + 'compose.yaml', lang: 'YAML', from: 'read_only: true', to: 'pids_limit: 64' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: whole('03-haertung'),
    mistakes: [
      { wrong: 'Container als root zu betreiben, weil es „sowieso nur ein Container“ ist.', why: 'Nach einer Übernahme hat der Angreifer Root-Rechte im Container und kann Fehler in der Isolation leichter ausnutzen.', fix: 'USER im Dockerfile setzen, cap-drop ALL, no-new-privileges und das Dateisystem schreibschützen.' },
      { wrong: '--privileged zu verwenden, damit „es endlich läuft“.', why: 'Es hebt fast alle Schutzmaßnahmen auf und gibt dem Container nahezu Hostrechte.', fix: 'Die fehlende Fähigkeit gezielt identifizieren (Capability, Gerät) und nur diese erlauben.' },
      { wrong: 'Keine Speicher- und Prozessgrenzen zu setzen.', why: 'Ein Fehler oder Angriff kann den Host erschöpfen und alle Container beeinträchtigen.', fix: 'Realistische Grenzen setzen und Ausfälle (137, OOMKilled) überwachen.' },
      { wrong: 'Zu glauben, ein gehärteter Container sei „sicher“.', why: 'Container teilen sich den Kernel; Härtung verringert Schaden, verhindert aber keine Schwachstellen im Dienst.', fix: 'Härtung als eine Schicht unter mehreren sehen: Updates, Abhängigkeitsprüfung, Netzwerktrennung, Protokolle.' },
    ],
    practice: 'Starte einen eigenen Dienst mit allen fünf Hebeln. Notiere für jeden Hebel, welche Fehlermeldung beim ersten Start kam und welche gezielte Ausnahme du erlaubt hast (zum Beispiel tmpfs für ein temporäres Verzeichnis).',
    exercises: [
      { task: 'Starte das gehärtete Image mit --pids-limit 20 und lies den Wert mit docker inspect (HostConfig.PidsLimit) aus.', acceptance: 'Der Wert steht in der Ausgabe; du erklärst, was eine Prozessgrenze gegen Fork-Bomben bringt.' },
      { task: 'Grenzfall: Starte das Image ohne --read-only, aber mit --cap-drop ALL, und versuche nach /app zu schreiben.', acceptance: 'Das Schreiben gelingt (kein Schreibschutz), obwohl keine Capabilities mehr vorhanden sind; du erklärst, dass jeder Hebel eine eigene Wirkung hat.' },
      { task: 'Fehlerfall: Starte das gehärtete Image, aber mit --memory 8m.', acceptance: 'Der Dienst wird beendet (137, OOMKilled); du beschreibst, wie du eine passende Grenze findest, ohne sie zu erraten (Messen unter Last).' },
    ],
    quiz: [
      { q: 'Was bedeutet der Exit-Code 137 bei einem Container?',
        options: ['Der Dienst wurde erfolgreich beendet.', 'Der Prozess wurde mit SIGKILL beendet, zum Beispiel wegen der Speichergrenze.', 'Der Dienst hat einen Syntaxfehler.', 'Der Container hatte kein Netzwerk.'],
        correct: 1,
        rationales: ['Erfolg wäre 0.', '137 ist 128 plus Signal 9 (SIGKILL).', 'Ein Syntaxfehler hat einen anderen Code.', 'Das Netzwerk führt nicht zu 137.'],
        explain: 'Der Code 128+9 weist auf ein hartes Beenden hin; bei OOMKilled true war es die Speichergrenze.' },
      { q: 'Was bewirkt --read-only?',
        options: ['Es verbietet jede Netzwerkverbindung.', 'Es entfernt alle Rechte des Benutzers.', 'Es macht das Root-Dateisystem schreibgeschützt.', 'Es löscht den Container nach dem Beenden.'],
        correct: 2,
        rationales: ['Dafür gibt es --network none.', 'Dafür gibt es --cap-drop und USER.', 'Beschreibbar bleiben nur eingehängte Volumes und tmpfs.', 'Dafür gibt es --rm.'],
        explain: 'Ein schreibgeschütztes Dateisystem verhindert, dass ein Angreifer Dateien im Image verändert.' },
      { q: 'Warum ist --privileged keine gute Lösung für ein Berechtigungsproblem?',
        options: ['Es funktioniert nur unter Windows.', 'Es verlangsamt den Dienst deutlich.', 'Es benötigt eine Lizenz.', 'Es hebt fast alle Schutzmaßnahmen auf.'],
        correct: 3,
        rationales: ['Es funktioniert plattformunabhängig.', 'Die Geschwindigkeit ist nicht der Grund.', 'Eine Lizenz ist nicht nötig.', 'Der Container erhält nahezu Hostrechte; gezielte Ausnahmen sind sicherer.'],
        explain: 'Statt alles freizugeben, erlaubt man nur die konkret fehlende Fähigkeit.' },
    ],
    sources: [
      docs('Docker Engine Security', 'https://docs.docker.com/engine/security/'),
      docs('Ressourcengrenzen für Container', 'https://docs.docker.com/engine/containers/resource_constraints/'),
      { title: 'OWASP Docker Security Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html', note: 'Checkliste; Inhalt hier eigenständig zusammengefasst.' },
    ],
    verification: verification('Benutzer, Capabilities, no-new-privileges, Schreibschutz mit tmpfs, abgeschaltetes Netzwerk und eine Speichergrenze mit OOM-Kill gegen ein naives Image.', 'rootless Docker, seccomp, AppArmor/SELinux, native Linux-Hosts, Podman und Ausbruchsversuche.'),
  },
  {
    id: 'dk-m1-l4', title: 'Daten und Netzwerk: Volumes, Namensauflösung und veröffentlichte Ports', minutes: 40,
    prerequisites,
    objectives: [
      'Erklären, warum Daten im Container-Speicher mit dem Container verschwinden',
      'Mit einem benannten Volume Daten dauerhaft speichern',
      'Containernamen in einem eigenen Netzwerk auflösen und Netzwerke als Trennung nutzen',
      'Ports nur an 127.0.0.1 veröffentlichen, wenn kein fremder Zugriff nötig ist',
    ],
    simple: `Alles, was ein Container in sein Dateisystem schreibt, liegt in seiner eigenen Schicht und geht mit ihm verloren, wenn er entfernt wird. Für Daten, die bleiben sollen (Datenbanken, Uploads, Zähler), gibt es Volumes: von Docker verwalteter Speicher, der unabhängig vom Container existiert und in einen Container eingehängt wird.

Beim Netzwerk gilt: Container auf demselben selbst angelegten Netzwerk erreichen sich über ihren Namen (Docker stellt dafür DNS bereit). Container in verschiedenen Netzwerken sehen sich nicht. Das ist eine einfache, wirksame Trennung: Die Datenbank hängt nur im Netzwerk des Dienstes, nicht im öffentlichen.

Von außen erreichbar wird ein Container nur, wenn du einen Port veröffentlichst (-p). Dabei entscheidest du, an welche Adresse des Hosts er gebunden wird. 127.0.0.1 bedeutet: nur dieser Rechner. Ohne Angabe gilt 0.0.0.0, also alle Schnittstellen.`,
    steps: [
      'Starte „node run.mjs 04“. Das Skript startet Container aus dem Image des Labs und schickt über docker exec HTTP-Anfragen an den Dienst im Container.',
      'Ohne Volume: Zwei Besuche ergeben den Zählerstand 2. Wird der Container entfernt und ein neuer gestartet, steht der Zähler wieder bei 0. Die Datei lag im Container-Speicher.',
      'Mit benanntem Volume (-v name:/data): Zwei Besuche, Container entfernen, neuen Container mit demselben Volume starten, ein weiterer Besuch ergibt 3. Dabei bleibt das Root-Dateisystem schreibgeschützt; beschreibbar ist nur das Volume.',
      'Die Rechte: Das Volume erbt beim ersten Mal Inhalt und Besitzer des Verzeichnisses aus dem Image (/data gehört dem Benutzer node). Deshalb kann der unprivilegierte Dienst schreiben. Mit einem Bind-Mount eines Host-Ordners wäre das nicht automatisch so.',
      'Netzwerk: Im selbst angelegten Netzwerk erreicht ein zweiter Container den Dienst unter dem Namen api (Antwort 200). Ein Container in einem anderen Netzwerk erreicht ihn nicht.',
      'Veröffentlichter Port: -p 127.0.0.1::3000 lässt Docker einen freien Host-Port wählen und bindet ihn an die Loopback-Adresse. docker port zeigt die Zuordnung; vom Host aus antwortet der Dienst. Von anderen Rechnern im Netz ist er nicht erreichbar.',
      'Überlege für eine Datenbank: Welches Volume, welches Netzwerk, welche Veröffentlichung? Meist genügt Volume und internes Netzwerk; ein veröffentlichter Port ist nur zur Fehlersuche nötig, dann an 127.0.0.1.',
    ],
    background: `Volume oder Bind-Mount? Ein Volume wird von Docker verwaltet, ist portabel und eignet sich für Daten der Anwendung. Ein Bind-Mount hängt einen Ordner des Hosts ein: praktisch für Entwicklung (Quelltext wird live gesehen), aber abhängig vom Host-Pfad und seinen Rechten. Ein tmpfs liegt im Arbeitsspeicher und eignet sich für Temporäres. Wichtige Datenbank-Volumes gehören in die Sicherung (die MariaDB-Lektion zeigt, wie man sichert und die Wiederherstellung prüft).

Zur Veröffentlichung: Eine Veröffentlichung ohne Adresse (-p 3000:3000) bindet an alle Schnittstellen des Hosts. Auf Servern ist das ein häufiger Fehler, besonders bei Datenbanken: Docker setzt dafür eigene Firewall-Regeln, die Einstellungen einer Host-Firewall umgehen können. Veröffentliche deshalb gezielt und prüfe, was von außen erreichbar ist.

Zum Lab: Es lief auf Docker Desktop (macOS). Das Netzwerk-Verhalten zwischen Containern (DNS, Trennung) entspricht dem von Docker Engine; die Anbindung des Hosts läuft über die VM und kann sich von Linux-Hosts unterscheiden. Daten auf Bind-Mounts mit anderen Besitzern und Rechten sind nicht Teil des Labs.`,
    terms: [
      { term: 'Volume', text: 'Von Docker verwalteter, dauerhafter Speicher, der unabhängig von Containern existiert.' },
      { term: 'Bind-Mount', text: 'Eingehängter Ordner des Hosts im Container; abhängig von Pfad und Rechten des Hosts.' },
      { term: 'Netzwerk (user-defined)', text: 'Selbst angelegtes Docker-Netzwerk, in dem Container sich per Namen finden und von anderen Netzwerken getrennt sind.' },
      { term: 'Port-Veröffentlichung', text: 'Verbindung eines Container-Ports mit einer Adresse und einem Port des Hosts (-p).' },
    ],
    code: { file: lab + 'cases/04-daten-netz.mjs', lang: 'JavaScript', from: '// Mit Volume', to: 'out.push(`Mit Volume' },
    code2: { file: lab + 'cases/04-daten-netz.mjs', lang: 'JavaScript', from: '// Netzwerk:', to: 'out.push(`Anderes Netzwerk' },
    code3: { file: lab + 'cases/04-daten-netz.mjs', lang: 'JavaScript', from: '// Veröffentlichter Port', to: 'out.push(`Veröffentlicht' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: whole('04-daten-netz'),
    mistakes: [
      { wrong: 'Wichtige Daten im Container-Speicher zu belassen.', why: 'Beim Entfernen oder Neuaufbau des Containers gehen sie verloren.', fix: 'Benanntes Volume für Daten verwenden und es in die Sicherung aufnehmen.' },
      { wrong: 'Datenbankports ohne Adresse zu veröffentlichen (-p 3306:3306).', why: 'Der Port ist an allen Schnittstellen des Hosts erreichbar, unter Umständen auch aus dem Internet.', fix: 'Nur bei Bedarf und an 127.0.0.1 veröffentlichen; sonst ein internes Netzwerk nutzen.' },
      { wrong: 'Alle Container im Standardnetzwerk zu betreiben.', why: 'Dort lösen Namen nicht auf, und alle Container sehen sich gegenseitig.', fix: 'Eigene Netzwerke je Anwendungsteil anlegen und Dienste gezielt verbinden.' },
      { wrong: 'Einen Bind-Mount ohne Beachtung von Besitzer und Rechten zu verwenden.', why: 'Der Dienst läuft als anderer Benutzer als der Besitzer der Dateien und kann nicht schreiben oder schreibt Dateien mit falschem Besitzer.', fix: 'Rechte abstimmen oder ein Volume nutzen.' },
    ],
    practice: 'Starte eine MariaDB aus dem lokalen Image mit Volume und eigenem Netzwerk, lege Daten an, entferne den Container, starte einen neuen mit demselben Volume und beweise per Abfrage, dass die Daten noch da sind. Notiere, welchen Port du nicht veröffentlicht hast und warum.',
    exercises: [
      { task: 'Hänge dasselbe Volume gleichzeitig in zwei Container ein und lass beide den Zähler erhöhen.', acceptance: 'Beide sehen den gemeinsamen Stand; du erklärst, warum gleichzeitiges Schreiben ohne Koordination riskant ist.' },
      { task: 'Grenzfall: Veröffentliche den Port ohne Adresse (-p 3000) und lies mit docker port die Bindung ab.', acceptance: 'Die Bindung erfolgt an 0.0.0.0; du vergleichst sie mit 127.0.0.1 und beschreibst das Risiko.' },
      { task: 'Fehlerfall: Hänge das Volume mit Root-Besitz ein (Bind-Mount eines Ordners, der root gehört) und starte den Dienst.', acceptance: 'Der Zähler meldet 500 mit dem Code EACCES oder EROFS; du behebst es durch passende Rechte.' },
    ],
    quiz: [
      { q: 'Was geschieht mit Daten im Container-Dateisystem, wenn der Container entfernt wird?',
        options: ['Sie werden automatisch in ein Volume kopiert.', 'Sie bleiben dauerhaft im Image.', 'Sie gehen verloren.', 'Sie werden verschlüsselt archiviert.'],
        correct: 2,
        rationales: ['Das geschieht nur, wenn ein Volume eingehängt war.', 'Das Image bleibt unverändert.', 'Die beschreibbare Schicht verschwindet mit dem Container.', 'Es gibt keine automatische Archivierung.'],
        explain: 'Dauerhafte Daten gehören in Volumes.' },
      { q: 'Wie erreicht ein Container einen anderen im selben selbst angelegten Netzwerk?',
        options: ['Über den Containernamen oder Alias.', 'Nur über die Host-IP-Adresse.', 'Nur über einen veröffentlichten Port.', 'Gar nicht, Container sind immer isoliert.'],
        correct: 0,
        rationales: ['Docker stellt in selbst angelegten Netzwerken einen DNS-Dienst bereit.', 'Das ist nicht nötig.', 'Veröffentlichte Ports sind für Zugriffe von außen.', 'Im gemeinsamen Netzwerk sind sie erreichbar.'],
        explain: 'Netzwerke sind Namensraum und Trennung zugleich.' },
      { q: 'Was bedeutet -p 127.0.0.1:8080:3000?',
        options: ['Der Dienst ist für das ganze Netzwerk erreichbar.', 'Der Port ist nur vom Docker-Host selbst erreichbar.', 'Der Container nutzt Port 127.', 'Der Port wird verschlüsselt.'],
        correct: 1,
        rationales: ['Dafür müsste die Adresse 0.0.0.0 oder weggelassen sein.', 'Gebunden wird an die Loopback-Adresse.', 'Die Zahl ist eine Adresse, kein Port.', 'Verschlüsselung leistet das nicht.'],
        explain: 'Die Adresse legt fest, wer den veröffentlichten Port erreichen kann.' },
    ],
    sources: [
      docs('Volumes', 'https://docs.docker.com/engine/storage/volumes/'),
      docs('Netzwerke', 'https://docs.docker.com/engine/network/'),
      docs('Docker Engine Security', 'https://docs.docker.com/engine/security/'),
    ],
    verification: verification('Verlust von Daten ohne Volume, Fortbestand mit Volume bei schreibgeschütztem Root-Dateisystem, Namensauflösung und Trennung zwischen Netzwerken sowie die Bindung an 127.0.0.1.', 'Bind-Mounts mit abweichenden Rechten, Zugriffe von anderen Rechnern, Firewall-Wechselwirkungen auf Linux-Servern, Volume-Treiber und Datenbank-Sicherungen.'),
  },
  {
    id: 'dk-m1-l5', title: 'Betrieb: Konfiguration, Geheimnisse, Gesundheit, Protokolle und Beenden', minutes: 40,
    prerequisites,
    objectives: [
      'Konfiguration über Umgebungsvariablen von Geheimnissen unterscheiden',
      'Erklären, warum Build-Argumente keine Geheimnisse transportieren dürfen und was ein Secret-Mount leistet',
      'Einen Gesundheitscheck definieren und das Protokoll über stdout nutzen',
      'Signale beim Beenden verstehen: SIGTERM, Frist, SIGKILL und die Rolle von PID 1',
    ],
    simple: `Ein Dienst im Container braucht Konfiguration. Üblich sind Umgebungsvariablen (-e APP_MODE=lab). Sie sind bequem, aber nicht geheim: Wer docker inspect ausführen darf, sieht sie. Echte Geheimnisse wie Passwörter und Schlüssel gehören nicht ins Image und nicht in Build-Argumente, denn Build-Argumente stehen im Verlauf des Images (docker history). Für den Build gibt es Secret-Mounts, die das Geheimnis nur während eines Schritts bereitstellen und nicht in einer Schicht hinterlassen.

Zum Betrieb gehören ein Gesundheitscheck (HEALTHCHECK: ein kleiner Befehl, der prüft, ob der Dienst antwortet) und Protokolle. Der Dienst schreibt sie auf die Standardausgabe, und Docker sammelt sie (docker logs).

Beim Beenden sendet docker stop zuerst SIGTERM und wartet eine Frist. Reagiert der Prozess nicht, folgt SIGKILL (Exit-Code 137). Ein Dienst sollte SIGTERM abfangen, laufende Anfragen beenden und sauber aussteigen.`,
    steps: [
      'Starte „node run.mjs 05“. Das Skript startet den Dienst mit -e APP_MODE=lab und wartet, bis der Gesundheitscheck „healthy“ meldet. Der Dienst gibt die Variable über /info zurück; docker inspect zeigt sie ebenfalls. Konfiguration ist damit nicht vertraulich.',
      'Das Protokoll: docker logs liefert JSON-Zeilen („listening“ …), die der Dienst auf stdout schreibt. Er legt keine Protokolldatei an; Aufbewahrung und Rotation übernimmt der Logtreiber von Docker oder ein Sammler.',
      'Der Gesundheitscheck im Dockerfile ruft /healthz im Container mit Node auf (kein curl nötig, weil das Image keines enthält). Intervall und Wiederholungen sind kurz gewählt, damit das Lab schnell ist; produktiv wählst du längere Werte.',
      'Geheimnisse: Das Lab baut zwei kleine Images. Mit ARG und --build-arg steht der Wert anschließend in docker history --no-trunc („ja“). Mit RUN --mount=type=secret und --secret steht er nicht darin („nein“). Der Wert ist ein erfundener Platzhalter.',
      'Beenden: Mit Signalbehandlung (der Dienst fängt SIGTERM, schließt den Server und beendet sich) endet der Container sofort mit Exit-Code 0. Ohne Behandlung ignoriert Node als PID 1 das Signal, docker stop wartet die Frist (hier 3 Sekunden) ab, dann folgt SIGKILL: Exit-Code 137.',
      'Mit --init startet vor dem Dienst ein kleines Init-Programm als PID 1, das Signale weiterreicht. Der Dienst wird dann vom Standardverhalten beendet (Exit-Code 143 = 128 + SIGTERM), und docker stop wartet nicht.',
      'Lies im Quelltext (src/server.js, letzter Block), wie das Signal behandelt wird: process.on(signal) und server.close mit Beenden des Prozesses. Prüfe bei eigenen Diensten, ob sie bei SIGTERM wirklich beenden, mit docker stop und der Zeit bis zum Ende.',
    ],
    background: `Warum ist PID 1 besonders? Im Linux-Kernel gelten für den ersten Prozess eines Namensraums eigene Regeln: Signale ohne Handler werden für ihn nicht mit der Standardaktion (Beenden) behandelt. Ein Dienst, der selbst keinen Handler hat, überlebt SIGTERM. Deshalb entweder Signale im Dienst behandeln oder --init (in Compose init: true) verwenden. Skripte als Startbefehl (sh -c „…“) leiten Signale oft nicht weiter; mit exec starten oder die exec-Form von CMD verwenden (wie das Dockerfile des Labs).

Geheimnisse im Betrieb: Umgebungsvariablen erscheinen in inspect, in Prozesslisten und oft in Absturzberichten. Dateien aus einem Secrets-Mechanismus (Compose-Secrets, Orchestrator, Secret-Manager) sind besser, aber nicht der Gegenstand dieses Labs. Zum Mindeststandard gehört: nie im Image, nie im Repository, regelmäßig rotieren und bei Verdacht ersetzen.

Zu Gesundheitschecks: „healthy“ heißt nur, dass der Befehl Erfolg meldet. Ein zu oberflächlicher Check (Prozess läuft) meldet gesund, obwohl die Datenbank fehlt; ein zu tiefer Check kann durch Fehler im Nachbardienst einen Neustart-Sturm auslösen. Wähle die Prüfung so, dass sie zeigt, ob dieser Dienst seine Aufgabe erfüllen kann.`,
    terms: [
      { term: 'HEALTHCHECK', text: 'Dockerfile-Anweisung, die einen Befehl festlegt, mit dem Docker den Zustand des Dienstes prüft (healthy/unhealthy).' },
      { term: 'Secret-Mount', text: 'Build-Funktion, die ein Geheimnis nur während eines RUN-Schritts bereitstellt, ohne es in einer Schicht zu speichern.' },
      { term: 'SIGTERM', text: 'Signal mit der Bitte, sich zu beenden; docker stop sendet es zuerst.' },
      { term: 'PID 1', text: 'Erster Prozess im Container; für ihn gelten besondere Regeln bei Signalen.' },
    ],
    code: { file: lab + 'cases/05-betrieb.mjs', lang: 'JavaScript', from: '// Geheimnisse im Build', to: 'out.push(`Wert steht im Image-Verlauf (Secret-Mount)' },
    code2: { file: lab + 'cases/05-betrieb.mjs', lang: 'JavaScript', from: '// Beenden:', to: 'out.push(`Ohne Signalbehandlung mit --init' },
    code3: { file: lab + 'app/src/server.js', lang: 'JavaScript', from: 'if (process.argv[1] ===' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: whole('05-betrieb'),
    mistakes: [
      { wrong: 'Passwörter oder Schlüssel mit ARG/--build-arg oder ENV in das Image zu geben.', why: 'Sie stehen im Image-Verlauf und in docker inspect; wer das Image oder den Zugriff hat, liest sie.', fix: 'Secret-Mounts für den Build, Secrets-Mechanismen für den Betrieb und nie ins Image.' },
      { wrong: 'Einen Dienst als Shell-Skript zu starten und Signale nicht weiterzureichen.', why: 'SIGTERM erreicht den Dienst nicht, docker stop wartet die Frist ab und beendet hart (137).', fix: 'exec-Form von CMD, im Skript exec verwenden und/oder --init.' },
      { wrong: 'Protokolle in Dateien im Container zu schreiben.', why: 'Sie füllen die beschreibbare Schicht und gehen verloren; docker logs sieht sie nicht.', fix: 'Auf stdout/stderr schreiben und Aufbewahrung und Rotation außerhalb regeln.' },
      { wrong: 'Einen Gesundheitscheck zu schreiben, der immer Erfolg meldet.', why: 'Der Status „healthy“ ist wertlos, und Orchestrierung oder Abhängigkeiten verlassen sich auf ihn.', fix: 'Eine Prüfung wählen, die die Kernaufgabe des Dienstes abbildet, und sie testen.' },
    ],
    practice: 'Ergänze den Dienst um einen Endpunkt /readyz, der erst nach dem Laden einer Datei aus dem Volume Erfolg meldet. Stelle den Gesundheitscheck darauf um, simuliere eine fehlende Datei und beschreibe, wie sich docker ps und docker logs verhalten.',
    exercises: [
      { task: 'Starte den Dienst mit einer Umgebungsvariablen API_KEY mit erfundenem Wert und finde den Wert über docker inspect.', acceptance: 'Der Wert ist sichtbar; du beschreibst, warum das für echte Geheimnisse nicht genügt, und nennst eine Alternative.' },
      { task: 'Grenzfall: Setze --stop-timeout 1 und --stop-timeout 30 beim Dienst ohne Signalbehandlung und miss die Zeit bis zum Beenden.', acceptance: 'Die Zeit entspricht in etwa der Frist; du erklärst, wann eine längere Frist nötig ist (laufende Anfragen beenden).' },
      { task: 'Fehlerfall: Ändere CMD in die Shell-Form (CMD node src/server.js) und stoppe den Container.', acceptance: 'Beobachte, ob das Signal ankommt (Exit-Code und Dauer); beschreibe den Unterschied zur exec-Form und stelle sie wieder her.' },
    ],
    quiz: [
      { q: 'Warum stehen Build-Argumente nicht für Geheimnisse zur Verfügung?',
        options: ['Sie sind auf 8 Zeichen begrenzt.', 'Sie werden automatisch verschlüsselt.', 'Sie gelten nur für Windows-Container.', 'Sie erscheinen im Verlauf des Images.'],
        correct: 3,
        rationales: ['Eine solche Grenze gibt es nicht.', 'Sie werden nicht verschlüsselt.', 'Sie gelten für alle Plattformen.', 'docker history zeigt die Anweisungen mit den Werten.'],
        explain: 'Wer das Image erhält, kann den Verlauf lesen; Secret-Mounts hinterlassen keine Spur in den Schichten.' },
      { q: 'Was passiert, wenn ein Dienst als PID 1 SIGTERM erhält und keinen Handler hat?',
        options: ['Er beendet sich sofort und ohne Verzögerung.', 'Es bleibt ohne Wirkung; nach der Frist folgt SIGKILL.', 'Docker startet ihn automatisch sofort neu.', 'Das Signal wird in eine Protokolldatei geschrieben.'],
        correct: 1,
        rationales: ['Für PID 1 gilt die Standardaktion nicht.', 'Das Lab zeigt Exit-Code 137 nach Ablauf der Frist.', 'Ein Neustart erfolgt nur mit Neustart-Regel.', 'Das geschieht nicht.'],
        explain: 'Deshalb braucht ein Dienst einen Signal-Handler oder --init.' },
      { q: 'Wohin schreibt ein Container-Dienst seine Protokolle am besten?',
        options: ['In eine Datei im Container.', 'Auf stdout/stderr, damit Docker sie sammelt.', 'In die Umgebungsvariablen.', 'In den Gesundheitscheck.'],
        correct: 1,
        rationales: ['Dateien gehen mit dem Container verloren und füllen seine Schicht.', 'docker logs und Logtreiber arbeiten mit diesen Strömen.', 'Dafür sind sie nicht gedacht.', 'Der Check prüft nur den Zustand.'],
        explain: 'Standardausgabe entkoppelt den Dienst von Aufbewahrung und Rotation.' },
    ],
    sources: [
      docs('Build-Secrets', 'https://docs.docker.com/build/building/secrets/'),
      docs('docker container stop', 'https://docs.docker.com/reference/cli/docker/container/stop/'),
      docs('Dockerfile-Referenz: HEALTHCHECK und ARG', 'https://docs.docker.com/reference/dockerfile/'),
    ],
    verification: verification('Konfiguration über Umgebungsvariablen und deren Sichtbarkeit, Gesundheitscheck, JSON-Protokoll über docker logs, Build-Argument gegen Secret-Mount im Image-Verlauf sowie Beenden mit Signalbehandlung, ohne Behandlung und mit --init.', 'Compose-Secrets, Orchestratoren, Logtreiber und Rotation, rootless Betrieb, andere Laufzeiten.'),
  },
  {
    id: 'dk-m1-l6', title: 'Projekt: Zwei Dienste mit Docker Compose', minutes: 40,
    prerequisites: 'Die Lektionen 1 bis 5 dieses Moduls.',
    objectives: [
      'Eine Mehrdienst-Anwendung deklarativ in einer Compose-Datei beschreiben',
      'Abhängigkeiten über Gesundheitschecks statt über Wartezeiten steuern',
      'Die Härtungsoptionen aus Lektion 3 in Compose übernehmen',
      'Ein Compose-Projekt reproduzierbar starten, prüfen und restlos aufräumen',
    ],
    simple: `Docker Compose beschreibt mehrere Container, Netzwerke und Volumes in einer Datei (compose.yaml) und startet sie gemeinsam. Compose legt ein eigenes Netzwerk für das Projekt an, sodass sich die Dienste unter ihren Namen finden. Mit depends_on und condition: service_healthy startet ein Dienst erst, wenn der andere gesund ist. Das ist verlässlicher als „warte zehn Sekunden“.

Im Projekt laufen zwei Dienste: api (der Dienst des Labs, gehärtet, mit Volume) und checker, ein kleiner Prüfer, der erst startet, wenn api gesund ist, drei Besuche schickt und den Zustand abfragt. Endet der Prüfer mit Exit-Code 0, ist das Zusammenspiel in Ordnung. Dieser Code wird als Ergebnis des gesamten Compose-Laufs zurückgegeben (--exit-code-from).`,
    steps: [
      'Öffne compose.yaml. Der Dienst api baut das Image aus app/ (Stufe runtime), ist schreibgeschützt (read_only mit tmpfs für /tmp), hat keine Capabilities, no-new-privileges, Speicher- und Prozessgrenzen und ein Volume data für /data. Alle Optionen kennst du aus den Lektionen 3 und 4.',
      'Der Dienst checker nutzt das Image node:24-slim, wartet mit depends_on und condition: service_healthy auf api (der HEALTHCHECK des Dockerfiles liefert den Status) und ist ebenfalls schreibgeschützt und ohne Capabilities.',
      'Starte „node run.mjs 06“. Das Skript prüft die Datei mit docker compose config, startet das Projekt mit up --build --abort-on-container-exit --exit-code-from checker und liest die Ausgabe des Prüfers.',
      'Ergebnis: checker endet mit Exit-Code 0 und gibt {"visits":3,"uid":1000,"mode":"compose"} aus: drei Besuche im Volume, Benutzer 1000 (nicht root) und die Konfiguration aus der Umgebungsvariablen in der Compose-Datei.',
      'Danach stehen beide Dienste im Zustand exited. Compose beendet bei --abort-on-container-exit alle Dienste, sobald einer endet. Das Lab räumt anschließend mit down -v --rmi local auf (Container, Netzwerk, Volume, selbst gebautes Image); fremde Container bleiben unberührt.',
      'Prüfe bei eigenen Projekten: Läuft docker compose config --quiet fehlerfrei? Sind alle Pfade relativ (hier über die Variable LAB_DIR, damit der Lab-Lauf von überall startet)? Gibt es Dienste ohne Gesundheitscheck, auf die andere warten?',
      'Überlege, wie du die Datei um eine Datenbank erweiterst: Image, Volume, internes Netzwerk, Gesundheitscheck, kein veröffentlichter Port und Zugangsdaten aus einer Secret-Quelle statt aus der Datei.',
    ],
    background: `Compose ist für Entwicklung, Tests und kleine Einzelrechner-Betriebe gedacht. Für Hochverfügbarkeit über mehrere Rechner braucht es einen Orchestrator (Kubernetes oder Ähnliches), der hier nicht behandelt wird. Die Konzepte (Image, Gesundheit, Volume, Netzwerk, Grenzen, Signale) übertragen sich aber unmittelbar.

Grenzen des Projekts: Der Lauf beweist das Zusammenspiel der zwei Dienste in einer Umgebung (Docker Desktop, macOS). Er beweist nicht Verhalten unter Last, Ausfälle des Hosts, Neustartverhalten, Aktualisierungen ohne Ausfall und Sicherungen des Volumes. Die Compose-Datei enthält keine echten Geheimnisse; die einzige Konfiguration (APP_MODE) ist unkritisch.

Die Variable LAB_DIR in compose.yaml ist ein Lab-Kniff, damit das Skript die Datei aus jedem Arbeitsordner starten kann. In einem echten Projekt liegt compose.yaml neben dem Quelltext, und der Kontext heißt einfach „.“.`,
    terms: [
      { term: 'Compose', text: 'Werkzeug, das mehrere Container, Netzwerke und Volumes aus einer Datei beschreibt und gemeinsam startet.' },
      { term: 'service_healthy', text: 'Bedingung in depends_on: Der Dienst startet erst, wenn der andere den Gesundheitscheck besteht.' },
      { term: '--exit-code-from', text: 'Compose-Option, die den Exit-Code eines bestimmten Dienstes als Ergebnis des Laufs zurückgibt.' },
      { term: 'Projektname', text: 'Namensraum, den Compose für Container, Netzwerke und Volumes eines Projekts verwendet.' },
    ],
    code: { file: lab + 'compose.yaml', lang: 'YAML' },
    code2: { file: lab + 'cases/06-projekt-compose.mjs', lang: 'JavaScript', from: 'const up = ctx.docker', to: 'out.push(`Zustand der Dienste' },
    order: ['body', 'code', 'code2', 'body2'],
    output: whole('06-projekt-compose'),
    mistakes: [
      { wrong: 'Mit festen Wartezeiten (sleep 10) auf Abhängigkeiten zu warten.', why: 'Zu kurz bricht den Start, zu lang verschwendet Zeit; echte Bereitschaft wird nicht geprüft.', fix: 'Gesundheitscheck definieren und depends_on mit service_healthy verwenden.' },
      { wrong: 'Zugangsdaten für Datenbanken direkt in compose.yaml zu schreiben und einzuchecken.', why: 'Sie landen im Repository und im Verlauf.', fix: 'Werte aus einer nicht eingecheckten Datei oder einem Secret-Mechanismus beziehen und nur eine Beispieldatei einchecken.' },
      { wrong: 'Ein Projekt nur mit down zu beenden und Volumes und Images liegenzulassen.', why: 'Speicher füllt sich, und alte Daten beeinflussen den nächsten Lauf.', fix: 'Für Testläufe down -v (und --rmi local) verwenden; für produktive Daten bewusst nicht.' },
      { wrong: 'Compose-Dateien ohne Härtung zu schreiben, weil „es nur Entwicklung“ ist.', why: 'Die Datei wird kopiert und landet im Betrieb.', fix: 'Gehärtete Einstellungen von Anfang an übernehmen und nur gezielt lockern.' },
    ],
    practice: 'Erweitere das Projekt um einen dritten Dienst (zum Beispiel MariaDB aus dem lokalen Image) mit Volume, Gesundheitscheck und internem Netzwerk. Schreibe den Prüfer so um, dass er einen Eintrag in der Datenbank anlegt, und notiere, was du über Zugangsdaten entschieden hast.',
    exercises: [
      { task: 'Füge dem Dienst api die Option init: true hinzu und stoppe das Projekt.', acceptance: 'Du beschreibst den Effekt auf das Beenden (Lektion 5) und belegst ihn mit dem Exit-Code des Dienstes.' },
      { task: 'Grenzfall: Setze im Healthcheck-Pfad einen falschen Endpunkt (/gesund) und starte neu.', acceptance: 'Der Dienst bleibt unhealthy, checker startet nie, und der Lauf scheitert; du liest den Grund mit docker compose ps und logs.' },
      { task: 'Fehlerfall: Entferne read_only und tmpfs aus dem Dienst api und lasse die Prüfung aus Lektion 3 laufen.', acceptance: 'Schreiben nach /app gelingt wieder; du erklärst die Folge für die Sicherheit und stellst die Einstellung wieder her.' },
    ],
    quiz: [
      { q: 'Wozu dient depends_on mit condition: service_healthy?',
        options: ['Es startet einen Dienst erst, wenn ein anderer gesund gemeldet wird.', 'Es kopiert Daten zwischen Diensten.', 'Es vergrößert das Image.', 'Es verschlüsselt das Netzwerk.'],
        correct: 0,
        rationales: ['So wird auf echte Bereitschaft gewartet statt auf eine feste Zeit.', 'Dafür sind Volumes da.', 'Es hat keinen Einfluss auf Images.', 'Verschlüsselung ist nicht seine Aufgabe.'],
        explain: 'Die Bedingung nutzt den Gesundheitscheck des anderen Dienstes.' },
      { q: 'Was bewirkt --exit-code-from checker?',
        options: ['Es startet nur den Dienst checker.', 'Es beendet checker nach einer Sekunde.', 'Es gibt den Exit-Code von checker als Ergebnis des Compose-Laufs zurück.', 'Es löscht den Dienst checker.'],
        correct: 2,
        rationales: ['Es startet weiterhin das ganze Projekt.', 'Die Dauer wird nicht begrenzt.', 'So lässt sich ein Prüfer als Testergebnis verwenden, zum Beispiel in der CI.', 'Es löscht nichts.'],
        explain: 'Der Prüfer-Dienst entscheidet über Erfolg oder Misserfolg des Laufs.' },
      { q: 'Warum übernimmt compose.yaml die Härtungsoptionen aus Lektion 3?',
        options: ['Weil Compose sie vorschreibt.', 'Weil sie die Anwendung schneller machen.', 'Weil sonst keine Volumes möglich sind.', 'Weil Dateien kopiert werden und gehärtete Standardwerte sicher mitwandern.'],
        correct: 3,
        rationales: ['Compose schreibt sie nicht vor.', 'Sie dienen der Sicherheit.', 'Volumes sind unabhängig davon möglich.', 'Was in Entwicklung gilt, landet später oft im Betrieb.'],
        explain: 'Sichere Voreinstellungen vermeiden, dass Lockerungen unbemerkt in den Betrieb wandern.' },
    ],
    sources: [
      docs('Compose-Dateireferenz: Dienste', 'https://docs.docker.com/reference/compose-file/services/'),
      docs('Startreihenfolge in Compose', 'https://docs.docker.com/compose/how-tos/startup-order/'),
      docs('Docker Engine Security', 'https://docs.docker.com/engine/security/'),
    ],
    verification: verification('Gültigkeit der Compose-Datei, Start mit Wartebedingung auf den Gesundheitscheck, drei Besuche im Volume, Benutzer 1000 und das restlose Aufräumen mit down -v --rmi local.', 'Verhalten unter Last, Neustart des Hosts, Aktualisierungen ohne Ausfall, Sicherung des Volumes, eine Datenbank im Projekt, Betrieb auf Linux-Servern.'),
  },
];
