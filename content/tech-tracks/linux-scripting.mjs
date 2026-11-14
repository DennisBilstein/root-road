// Linux & Shell · Skripte und Betrieb. Stichtag 14.11.2026.
// Eigene Texte; Code und Tests liegen unter content/examples/shell-lab/ (Debian 13 "trixie" im Container, Bash 5.2.37).
// Die Handbücher und Manpages werden nur verlinkt, nichts daraus kopiert.
const lab = 'content/examples/shell-lab/';
const docs = (title, url, note = 'Offizielle Dokumentation; Inhalt hier eigenständig zusammengefasst.') => ({ title, url, note });
const bash = docs('GNU Bash Reference Manual', 'https://www.gnu.org/software/bash/manual/bash.html', 'Referenz zu Shell-Syntax, Variablen, getopts, trap und eingebauten Befehlen.');
const shellcheck = docs('ShellCheck Wiki', 'https://www.shellcheck.net/wiki/', 'Beschreibt jede ShellCheck-Meldung (SC2086 usw.) mit Beispiel und Lösung.');
const man7 = (title, page, note) => docs(title, `https://man7.org/linux/man-pages/${page}`, note ?? 'Linux man-pages; Inhalt hier eigenständig zusammengefasst.');

export const module = {
  id: 'lx-m2', course: 'linux', part: 30, partTitle: 'Linux & Shell · Kommandozeile, Skripte und Betrieb',
  title: 'Linux Fortgeschritten · Skripte, Prozesse, Netzwerk und Betrieb',
};

export const lessons = [
  {
    id: 'lx-m2-l1', title: 'Bash-Skripte: Optionen, Prüfungen, Exit-Codes und set -euo pipefail', minutes: 55,
    prerequisites: 'Modul lx-m1 (Shell, Dateien, Rechte, Pipes).',
    objectives: [
      'Ein Skript mit Shebang, Variablen, Funktionen und Optionen (getopts) schreiben',
      'Eingaben prüfen, klare Fehlermeldungen auf stderr ausgeben und sinnvolle Exit-Codes liefern',
      'set -euo pipefail einsetzen und seine Grenzen (SIGPIPE, Bedingungen, Funktionen) kennen',
      'Temporäre Dateien mit mktemp anlegen und mit trap zuverlässig aufräumen',
    ],
    simple: `Ein Shell-Skript ist eine Textdatei mit Befehlen. Die erste Zeile, der Shebang (#!/usr/bin/env bash), sagt dem System, welcher Interpreter sie ausführt. Mit chmod +x wird die Datei ausführbar. Alles, was du auf der Kommandozeile tippst, funktioniert auch im Skript; dazu kommen Variablen, Verzweigungen, Schleifen und Funktionen.

Ein gutes Skript verhält sich wie ein gutes Kommandozeilenprogramm. Es hat Optionen (-n 5), prüft seine Eingaben, schreibt Ergebnisse auf stdout und Fehlermeldungen auf stderr und gibt einen Exit-Code zurück, an dem Aufrufer erkennen, was passiert ist. Das Lab-Skript logreport.sh fasst ein Zugriffsprotokoll zusammen und nutzt dafür getopts (eingebauter Optionsleser): -n für die Anzahl, -s für einen Statuscode-Anfang.

Bash macht standardmäßig weiter, wenn ein Befehl fehlschlägt, und behandelt unbekannte Variablen als leer. Das ist bequem für die Kommandozeile und gefährlich für Skripte. Deshalb beginnen viele Skripte mit set -euo pipefail: -e bricht beim ersten Fehler ab, -u macht unbekannte Variablen zum Fehler, -o pipefail lässt Pipes den ersten Fehlercode melden. Das hilft, ist aber kein Allheilmittel; die Grenzen kennst du am Ende dieser Lektion.

Temporäre Dateien legst du mit mktemp an (eindeutiger Name, nur für dich lesbar) und löschst sie mit einem trap auf EXIT, das bei jedem Ende läuft: normal, nach einem Fehler und nach einem Abbruch durch Signale, die du behandelst.`,
    steps: [
      'Das Skript beginnt mit Shebang, Beschreibung und set -euo pipefail. export LC_ALL=C sorgt für eine feste Sortierreihenfolge, auch bei Gleichstand (sonst kann die Reihenfolge je nach Spracheinstellung wechseln).',
      'getopts ":n:s:h" liest Optionen. Der Doppelpunkt am Anfang schaltet eigene Fehlerbehandlung ein, n: und s: erwarten einen Wert, h nicht. In der Schleife wertet case die Option aus, $OPTARG enthält den Wert.',
      'Fehlt ein Wert (:) oder ist die Option unbekannt (*), schreibt das Skript auf stderr und beendet mit 64, der Konvention „falsche Verwendung“. shift $((OPTIND - 1)) entfernt die gelesenen Optionen, übrig bleibt die Datei.',
      'Die Eingaben werden geprüft, bevor gearbeitet wird: -n muss eine positive ganze Zahl sein (Exit-Code 2), -s darf nur 1 bis 3 Ziffern haben, die Datei muss lesbar sein (66). Die Meldung nennt nur den Dateinamen, nicht den vollen Pfad.',
      'mktemp legt eine temporäre Datei an, trap rm -f "$tmp" EXIT räumt sie auf. Der Test prüft, dass nach dem Lauf keine neue tmp.*-Datei zurückbleibt.',
      'Das Ergebnis entsteht aus awk, sort und uniq. Für „die ersten n“ nutzt das Skript awk mit NR <= n statt head: head schließt die Pipe früh, der Vorgänger bekommt SIGPIPE, und mit pipefail wäre der Lauf sonst gescheitert.',
      'Der Test ruft das Skript mit Normal-, Grenz- und Fehlerfällen auf: -n 0, -n 1.5, -s 6 sind ungültig (2), keine Datei oder unbekannte Option ergibt 64, eine fehlende Datei 66, eine leere Datei und ein Dateiname mit Leerzeichen funktionieren.',
      'ShellCheck prüft das Skript statisch und fand im Lab keine Meldung. Im Alltag findet es Fehler, die man sonst erst später bemerkt (fehlende Anführungszeichen, unbenutzte Variablen).',
    ],
    background: `Warum set -e kein Allheilmittel ist: Bash schaltet -e in bestimmten Zusammenhängen wieder ab. In Bedingungen (if, while, &&, ||) gilt es nicht, und in Funktionen, die aus einer solchen Bedingung aufgerufen werden, ebenfalls nicht. Der Test zeigt: f || true ruft f auf, und in f läuft nach einem fehlgeschlagenen Befehl trotz set -e weiter. Auch Befehle in $( ) innerhalb von Bedingungen können ihren Fehler verlieren. Rechne deshalb nicht blind damit, sondern prüfe wichtige Befehle selbst: cd verzeichnis || exit 1.

Zu SIGPIPE und pipefail: Wenn der Leser einer Pipe früher aufhört, endet der Schreiber mit Exit-Code 141 (128 + 13). Mit pipefail macht das die ganze Pipe zum Fehler, und set -e bricht ab, obwohl nichts falsch war. Bei kleinen Eingaben tritt es selten auf, bei großen oft zufällig. Lösungen: den Leser alles lesen lassen (awk statt head) oder den Fehlercode gezielt auswerten.

Zum Verhalten von Exit-Codes: Die Werte 0 bis 255 sind verfügbar. Üblich sind 0 (Erfolg), 1 (allgemeiner Fehler), 2 (falsche Verwendung durch Bash selbst und viele Werkzeuge), 126 und 127 (nicht ausführbar, nicht gefunden) sowie 128 + n (Signal n). Die Werte 64 bis 78 stammen aus der BSD-Konvention sysexits und sind nur eine Orientierung. Dokumentiere im Skriptkopf, was du zurückgibst.

Portabilität: Dieses Lab nutzt Bash-Besonderheiten ([[ ]], mapfile, Arrays) und GNU-Werkzeuge. Auf macOS (Bash 3.2, BSD-Werkzeuge) laufen nicht alle Teile unverändert; getestet wurde nur auf Debian 13.`,
    terms: [
      { term: 'Shebang', text: 'Erste Zeile #!/usr/bin/env bash: nennt den Interpreter.' },
      { term: 'getopts', text: 'Eingebauter Befehl zum Lesen von Optionen wie -n 5.' },
      { term: 'set -euo pipefail', text: 'Abbruch bei Fehler, bei unbekannter Variable und bei Fehlern in Pipes.' },
      { term: 'trap … EXIT', text: 'Befehl, der beim Beenden des Skripts immer läuft (Aufräumen).' },
      { term: 'SIGPIPE', text: 'Signal an den Schreiber, wenn der Leser einer Pipe schon geschlossen hat.' },
    ],
    code: { file: lab + 'scripts/logreport.sh', lang: 'Bash' },
    code2: { file: lab + 'tests/05-script.test.sh', lang: 'Bash' },
    order: ['body', 'code', 'code2', 'body2'],
    output: `$ scripts/logreport.sh data/access.log
Anfragen: 16
Fehler (4xx/5xx): 6
Häufigste Adressen:
      5 198.51.100.7
      4 203.0.113.5
      4 192.0.2.44
Statuscodes: 200=7 201=1 204=1 304=1 401=3 404=2 500=1
$ scripts/logreport.sh -s 4 -n 1 data/access.log   ->  Anfragen: 5, Statuscodes: 401=3 404=2
$ scripts/logreport.sh -n x data/access.log        ->  -n braucht eine positive ganze Zahl, nicht "x"   (Exit-Code 2)
$ scripts/logreport.sh -z data/access.log          ->  Unbekannte Option: -z + Aufruf-Hinweis           (Exit-Code 64)
$ scripts/logreport.sh /gibt/es/nicht              ->  Datei nicht lesbar: nicht                         (Exit-Code 66)
yes | head -n 1 mit pipefail -> Exit-Code 141
Test 05-script: 23 bestanden, 0 fehlgeschlagen; ShellCheck 0.10.0: keine Meldung für scripts/ und tests/`,
    mistakes: [
      { wrong: 'Variablen ohne Anführungszeichen verwenden: rm $datei.', why: 'Leerzeichen und Sonderzeichen im Wert verändern den Befehl; eine leere Variable verschwindet aus der Befehlszeile.', fix: 'Immer "$datei" schreiben; ShellCheck meldet das (SC2086).' },
      { wrong: 'Sich auf set -e als „ich muss keine Fehler prüfen“ verlassen.', why: 'In Bedingungen, in aufgerufenen Funktionen und in Befehlsersetzungen wirkt -e nicht wie erwartet.', fix: 'Wichtige Befehle mit || exit prüfen und Skripte mit Tests absichern.' },
      { wrong: 'Pipes mit head -n in Skripten mit pipefail verwenden.', why: 'head schließt früh, der Vorgänger endet mit 141, und set -e bricht ab.', fix: 'awk mit NR <= n, oder den Fehlercode 141 ausdrücklich zulassen.' },
      { wrong: 'Temporäre Dateien unter festem Namen anlegen (/tmp/ergebnis).', why: 'Andere Prozesse können sie vorab anlegen oder lesen (Wettlauf, Sicherheitslücke); parallele Läufe überschreiben sich.', fix: 'mktemp verwenden und per trap … EXIT löschen.' },
    ],
    practice: 'Beginne jedes Skript mit Shebang, set -euo pipefail, einer Hilfefunktion und der Eingabeprüfung. Schreibe die Logik so, dass sie ohne Ausgabe testbar ist (Funktionen mit Rückgabewerten), und lasse ShellCheck in der Pipeline laufen.',
    exercises: [
      { task: 'Ergänze logreport.sh um die Option -p PFAD, die nur Zeilen zählt, deren Pfad (Spalte 7) mit PFAD beginnt. Ergänze Tests.', acceptance: '-p /api liefert 4 Anfragen; ungültige Werte (z. B. leer) enden mit Exit-Code 2; die bestehenden Tests bleiben grün und ShellCheck meldet nichts.' },
      { task: 'Grenzfall: Rufe das Skript mit -n 1 -n 2 auf (Option doppelt) und mit einer Datei, die mit - beginnt. Was passiert, und wie machst du das Verhalten eindeutig?', acceptance: 'Die letzte -n gewinnt; für Dateien mit führendem Strich hilft -- (Ende der Optionen) oder ./; du dokumentierst beides im Skriptkopf.' },
      { task: 'Fehlerfall: Entferne awk statt head im Skript und ersetze es durch head -n "$top". Welches Verhalten beobachtest du bei einer sehr großen Eingabe mit set -o pipefail?', acceptance: 'Zufällige Abbrüche mit Exit-Code 141; du erklärst SIGPIPE und stellst awk wieder her.' },
    ],
    quiz: [
      { q: 'Was bewirkt set -u in einem Skript?',
        options: ['Eine unbekannte (nicht gesetzte) Variable führt zu einem Fehler statt zu einem leeren Wert.', 'Es erlaubt Updates des Skripts, wenn eine neuere Version vorhanden ist.', 'Es schaltet die Anführungszeichen um Variablen für das ganze Skript ab.', 'Es macht das Skript schneller, weil weniger Prüfungen laufen müssen.'],
        correct: 0,
        rationales: ['So fallen Tippfehler in Variablennamen sofort auf und rm -rf "$dir"/* löscht nicht plötzlich /*.', 'Mit Updates hat es nichts zu tun.', 'Anführungszeichen bleiben nötig.', 'Geschwindigkeit ändert sich nicht.'],
        explain: 'set -u schützt vor Tippfehlern und leeren Variablen.' },
      { q: 'Warum nutzt logreport.sh awk statt head, um die ersten n Adressen auszugeben?',
        options: ['head beendet früh, der Vorgänger erhält SIGPIPE und pipefail macht daraus einen Fehler.', 'awk ist grundsätzlich schneller als head und deshalb immer die bessere Wahl.', 'head existiert auf Linux-Systemen nicht und muss nachinstalliert werden.', 'Weil head keine Zahlen als Argument versteht und sofort abbricht.'],
        correct: 0,
        rationales: ['Mit pipefail und set -e kann das zufällig zu Abbrüchen führen.', 'Geschwindigkeit ist nicht der Grund.', 'head existiert.', 'head versteht Zahlen.'],
        explain: 'awk liest bis zum Ende und vermeidet SIGPIPE in der Pipe.' },
      { q: 'Welchen Zweck hat trap … EXIT in einem Skript, das mit mktemp eine temporäre Datei anlegt?',
        options: ['Es löscht die Datei bei jedem Ende des Skripts.', 'Es verhindert, dass das Skript endet.', 'Es verschlüsselt die Datei.', 'Es führt das Skript erneut aus.'],
        correct: 0,
        rationales: ['Der Handler läuft bei normalem Ende und bei Fehlern.', 'trap hält das Skript nicht an.', 'Verschlüsselung findet nicht statt.', 'Es startet nichts neu.'],
        explain: 'EXIT-Handler räumen auf, egal wie das Skript endet (außer bei SIGKILL).' },
    ],
    sources: [
      bash,
      shellcheck,
      docs('GNU Bash Manual: The Set Builtin', 'https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html', 'Beschreibt -e, -u, pipefail und deren Ausnahmen.'),
      man7('Linux man-pages: signal(7) – SIGPIPE und weitere Signale', 'man7/signal.7.html'),
    ],
    verification: 'Lab shell-lab: Alle 23 Prüfungen von 05-script.test.sh liefen im Container debian:trixie-slim (Bash 5.2.37) grün; ShellCheck 0.10.0 meldete für scripts/ und tests/ nichts. Das Verhalten von set -e in Funktionen und der Exit-Code 141 wurden beobachtet. Nicht geprüft: macOS (Bash 3.2), andere Shells (dash, zsh) und sehr große Eingaben.',
  },
  {
    id: 'lx-m2-l2', title: 'Prozesse, Signale, trap, systemd und cron', minutes: 50,
    prerequisites: 'Lektion „Bash-Skripte“ (lx-m2-l1).',
    objectives: [
      'Prozesse mit ps starten, ansehen und mit kill beenden und die gängigen Signale (TERM, INT, KILL) unterscheiden',
      'Aus Exit-Codes wie 143, 137 und 130 ablesen, womit ein Prozess endete',
      'Mit trap einen Dienst sauber beenden lassen und wissen, was bei SIGKILL zurückbleibt',
      'Die Grundlagen von systemd-Einheiten und cron-Zeilen lesen (hier ohne Ausführung)',
    ],
    simple: `Jedes laufende Programm ist ein Prozess mit einer Nummer (PID). Du startest ihn im Vordergrund (die Shell wartet) oder mit & im Hintergrund; $! enthält die PID des letzten Hintergrundprozesses, wait wartet auf ihn und liefert seinen Exit-Code. ps zeigt Prozesse, kill schickt ihnen Signale.

Signale sind kurze Nachrichten an einen Prozess. SIGTERM (15) bedeutet „bitte beende dich“ und ist der Standard von kill. SIGINT (2) kommt bei Strg+C. SIGKILL (9) beendet sofort und kann nicht abgefangen werden; der Prozess kann nicht mehr aufräumen. Wird ein Prozess durch ein Signal beendet, ist sein Exit-Code 128 plus die Signalnummer: 143 für TERM, 137 für KILL, 130 für INT. kill -0 prüft nur, ob der Prozess existiert, und sendet nichts.

Ein gut gebauter Dienst fängt SIGTERM ab und räumt auf. In Bash geschieht das mit trap: trap auf_signal TERM INT ruft eine Funktion auf, trap aufraeumen EXIT läuft bei jedem Ende. Der Lab-Worker schreibt seine PID in eine Datei, wartet in einer Schleife und beendet sich bei TERM mit Exit-Code 0 und aufgeräumter PID-Datei.

Dauerläufer startet man heute nicht von Hand, sondern lässt sie von systemd verwalten, dem Dienstmanager der meisten Distributionen. Eine Unit-Datei beschreibt Benutzer, Startbefehl, Neustartverhalten und Schutzmaßnahmen. Regelmäßige Aufgaben startet cron nach einem Zeitplan mit fünf Feldern. Beides zeigt die Lektion als Beispiel; im Lab-Container gibt es kein systemd, daher sind diese Dateien nicht ausgeführt.`,
    steps: [
      'sleep 30 & startet einen Prozess im Hintergrund, $! liefert die PID. kill -0 "$pid" prüft, ob er lebt. ps -o comm= -p "$pid" nennt das Programm.',
      'kill -TERM und danach wait ergibt Exit-Code 143 (128 + 15). Mit kill -KILL ergibt es 137. bash -c "kill -INT $$" liefert 130, wie bei Strg+C im Vordergrund.',
      'Hintergrundprozesse in einem nicht interaktiven Skript ignorieren SIGINT: Ein kill -INT auf sleep 30 & lässt den Prozess weiterleben (der Test belegt es). Zum Beenden braucht man TERM oder KILL.',
      'worker.sh legt mit echo "$$" die PID in eine Datei, setzt trap cleanup EXIT und trap on_signal TERM INT und wartet in einer Schleife auf einen Hintergrund-sleep mit wait.',
      'Warum wait? Bash führt einen trap erst aus, wenn der gerade laufende Befehl im Vordergrund fertig ist. Mit sleep 30 & und wait unterbricht ein Signal das Warten sofort; der Handler läuft ohne Verzögerung.',
      'Nach SIGTERM schreibt der Worker „Signal erhalten, beende sauber“, beendet sich mit 0, der EXIT-Trap entfernt die PID-Datei und den Hintergrund-sleep („aufgeräumt“).',
      'SIGKILL kann der Worker nicht abfangen: Der Exit-Code ist 137, die PID-Datei bleibt liegen und der sleep läuft weiter. Programme müssen veraltete PID-Dateien deshalb erkennen (existiert die PID wirklich und gehört sie noch zum Dienst?).',
      'Die Datei rootpfad-worker.service zeigt eine systemd-Einheit mit eigenem Benutzer, Neustart bei Fehler, Zeitlimit zum Stoppen und Schutzoptionen (NoNewPrivileges, ProtectSystem=strict, ProtectHome, PrivateTmp). crontab.example zeigt einen cron-Eintrag. Beide wurden nicht ausgeführt.',
    ],
    background: `Warum nicht gleich SIGKILL? Weil ein Prozess auf SIGTERM aufräumen kann: Dateien schließen, Datenbankverbindungen sauber beenden, laufende Anfragen abschließen, Sperrdateien löschen. SIGKILL ist die letzte Möglichkeit, wenn der Prozess nicht mehr reagiert. Dienstmanager wie systemd und Container-Laufzeiten gehen deshalb zweistufig vor: erst SIGTERM, nach einer Frist (TimeoutStopSec bzw. bei Docker 10 Sekunden) SIGKILL.

Eine Besonderheit des Tests: Ein frisch gestarteter Hintergrundprozess ist für einen Augenblick noch eine Kopie der Shell und erbt deren Handler. Trifft ihn in dieser Zeit ein Signal, läuft der geerbte EXIT-Trap in der Kopie. Im Test löschte das das Arbeitsverzeichnis unter ihm weg, bis der Cleanup nur noch im Hauptprozess lief ($BASHPID gleich der Hauptprozess-ID). Das zeigt, warum man Aufräum-Code nicht zu großzügig schreibt.

Warum PID-Dateien problematisch sind: Nach einem Absturz bleibt die Datei stehen, und die PID kann später ein ganz anderer Prozess bekommen. systemd verfolgt Prozesse selbst (über Kontrollgruppen) und braucht keine PID-Dateien; der Lab-Worker nutzt eine nur zur Anschauung.

Zu cron: Es startet Befehle nach Zeitplan mit stark reduzierter Umgebung (kleiner PATH, keine Anmeldung). Deshalb volle Pfade und Umleitung der Ausgabe in eine Datei verwenden. Das Prozentzeichen hat dort Sonderbedeutung. Auf Systemen mit systemd lassen sich Zeitpläne auch mit Timer-Einheiten abbilden; beides nicht im Lab ausgeführt.`,
    terms: [
      { term: 'PID', text: 'Nummer eines laufenden Prozesses.' },
      { term: 'SIGTERM / SIGKILL', text: 'Bitte zum Beenden (abfangbar) / sofortiges Beenden (nicht abfangbar).' },
      { term: '128 + n', text: 'Exit-Code eines Prozesses, der durch Signal n beendet wurde (TERM 143, KILL 137, INT 130).' },
      { term: 'systemd-Unit', text: 'Datei, die einen Dienst beschreibt und von systemd verwaltet wird.' },
      { term: 'cron', text: 'Dienst, der Befehle nach Zeitplan startet.' },
    ],
    code: { file: lab + 'scripts/worker.sh', lang: 'Bash' },
    code2: { file: lab + 'tests/06-processes.test.sh', lang: 'Bash', from: '# --- Hintergrund, PID', to: 'kill -l 15' },
    code3: { file: lab + 'deploy/rootpfad-worker.service', lang: 'systemd-Unit (nicht ausgeführt)' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: `Worker (Container, Bash 5.2.37):
 gestartet
 Signal erhalten, beende sauber
 aufgeräumt                       (Exit-Code 0 nach SIGTERM)
Exit-Codes nach Signalen: sleep + TERM -> 143 ; sleep + KILL -> 137 ; bash -c "kill -INT $$" -> 130
Nach SIGKILL des Workers: Exit-Code 137, PID-Datei bleibt liegen.
kill -INT auf einen Hintergrund-sleep im Skript: der Prozess lebt weiter.
Test 06-processes: 18 bestanden, 0 fehlgeschlagen
systemd-Unit und crontab: nicht ausgeführt (kein systemd im Container).`,
    mistakes: [
      { wrong: 'Dienste sofort mit kill -9 beenden.', why: 'Der Prozess kann nicht aufräumen: Sperren, temporäre Dateien und halbe Schreibvorgänge bleiben zurück.', fix: 'Erst SIGTERM senden, auf Ende warten, SIGKILL nur nach einer Frist.' },
      { wrong: 'Einen trap setzen, aber im Vordergrund mit langem Befehl (sleep 30) warten.', why: 'Bash führt den Handler erst nach dem Ende des laufenden Befehls aus; das Beenden verzögert sich.', fix: 'Befehl im Hintergrund starten und mit wait warten.' },
      { wrong: 'Sich auf PID-Dateien verlassen, ohne zu prüfen, ob der Prozess noch lebt und der richtige ist.', why: 'Nach einem Absturz bleibt die Datei bestehen, die PID kann neu vergeben sein.', fix: 'Dienst von systemd verwalten lassen oder PID und Programmnamen prüfen.' },
      { wrong: 'cron-Zeilen mit relativen Pfaden und ohne Ausgabeumleitung schreiben.', why: 'cron läuft mit kleinem PATH und anderem Arbeitsverzeichnis; Fehler gehen unbemerkt verloren.', fix: 'Volle Pfade, Ausgabe in eine Logdatei umleiten (>> datei 2>&1) und auf % achten.' },
    ],
    practice: 'Baue jeden Dienst so, dass er auf SIGTERM sauber endet, und teste das aktiv: starten, PID merken, kill -TERM, Exit-Code und Aufräumen prüfen. Überlass Start, Neustart und Protokolle systemd und begrenze die Rechte des Dienstes (eigener Benutzer, wenige Schreibrechte).',
    exercises: [
      { task: 'Starte worker.sh in einer zweiten Shell, notiere die PID aus der Datei und beende ihn mit kill -TERM. Prüfe Ausgabe, Exit-Code und PID-Datei.', acceptance: 'Ausgabe „Signal erhalten, beende sauber“ und „aufgeräumt“, Exit-Code 0, PID-Datei weg.' },
      { task: 'Grenzfall: Beende denselben Worker mit kill -KILL. Was bleibt zurück, und wie erkennst du das beim nächsten Start?', acceptance: 'PID-Datei und Hintergrund-sleep bleiben; ein Neustart sollte mit kill -0 prüfen, ob die PID lebt, und die Datei bei Nicht-Existenz ersetzen.' },
      { task: 'Fehlerfall: Lies die Unit rootpfad-worker.service und nenne zu jeder Schutzoption (NoNewPrivileges, ProtectSystem, ProtectHome, PrivateTmp), was sie verhindert. Schlage jede in der Dokumentation nach.', acceptance: 'Du belegst jede Aussage mit der systemd.exec-Dokumentation und erkennst, was der Dienst trotzdem darf (z. B. Schreiben in RuntimeDirectory).' },
    ],
    quiz: [
      { q: 'Ein Prozess endet mit Exit-Code 143. Was ist passiert?',
        options: ['Er wurde mit SIGTERM beendet (128 + 15).', 'Er wurde mit SIGKILL beendet.', 'Er wurde mit Strg+C unterbrochen.', 'Er hat erfolgreich beendet.'],
        correct: 0,
        rationales: ['143 = 128 + 15, die Signalnummer von TERM.', 'SIGKILL ergibt 137.', 'Strg+C (SIGINT) ergibt 130.', 'Erfolg ist 0.'],
        explain: 'Exit-Code = 128 + Signalnummer, wenn ein Signal den Prozess beendet.' },
      { q: 'Warum startet worker.sh seinen Schlaf im Hintergrund und wartet mit wait?',
        options: ['Damit ein Signal das Warten sofort unterbricht und der trap-Handler ohne Verzögerung läuft.', 'Damit der Worker insgesamt schneller läuft, weil der Schlaf parallel geschieht.', 'Damit der Schlaf-Befehl für die Benutzer nicht sichtbar ist.', 'Damit auch SIGKILL abgefangen werden kann, bevor der Prozess endet.'],
        correct: 0,
        rationales: ['Ein Vordergrundbefehl würde den Handler bis zu seinem Ende aufhalten.', 'Es geht nicht um Geschwindigkeit.', 'Sichtbarkeit spielt keine Rolle.', 'SIGKILL ist nie abfangbar.'],
        explain: 'wait ist unterbrechbar; ein laufendes sleep im Vordergrund nicht.' },
      { q: 'Was passiert bei SIGKILL mit dem EXIT-Trap eines Skripts?',
        options: ['Er läuft nicht; der Prozess endet sofort.', 'Er läuft wie immer.', 'Er läuft doppelt.', 'Er läuft nach 10 Sekunden.'],
        correct: 0,
        rationales: ['SIGKILL lässt dem Prozess keine Chance zum Aufräumen.', 'Das gilt für normale Enden und abfangbare Signale.', 'Doppelte Ausführung gibt es nicht.', 'Es gibt keine Verzögerung.'],
        explain: 'SIGKILL ist nicht abfangbar; Aufräumen muss von außen oder beim nächsten Start geschehen.' },
    ],
    sources: [
      man7('Linux man-pages: signal(7) – Signale und ihre Bedeutung', 'man7/signal.7.html'),
      docs('systemd.service – Dienst-Einheiten', 'https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html', 'Beschreibt Restart, ExecStart, TimeoutStopSec u. a.; Inhalt hier eigenständig zusammengefasst.'),
      docs('systemd.exec – Ausführungsumgebung und Härtung', 'https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html', 'Beschreibt NoNewPrivileges, ProtectSystem, PrivateTmp u. a.'),
      docs('Debian-Manpage: crontab(5)', 'https://manpages.debian.org/trixie/cron/crontab.5.en.html', 'Format der crontab-Dateien.'),
    ],
    verification: 'Lab shell-lab: Alle 18 Prüfungen von 06-processes.test.sh liefen im Container debian:trixie-slim grün (mehrfach wiederholt, ohne Schwankung). Die systemd-Einheit, der cron-Eintrag und die logrotate-Datei im Ordner deploy/ wurden NICHT ausgeführt (kein systemd im Container); ihre Aussagen stammen aus der Dokumentation. Nicht geprüft: Verhalten unter macOS und mit anderen Init-Systemen.',
  },
  {
    id: 'lx-m2-l3', title: 'Netzwerk und Fernzugriff: ss, curl, rsync und SSH-Schlüssel', minutes: 50,
    prerequisites: 'Lektionen 1 und 2 dieses Moduls; Grundwissen zu Netzwerken (Modul net-m1) ist hilfreich.',
    objectives: [
      'Mit ss prüfen, welche Dienste auf welchen Ports lauschen',
      'Mit curl Anfragen ausführen, Statuscodes und Header lesen und Exit-Codes (22, 7) deuten',
      'Mit rsync Verzeichnisse synchronisieren und die Wirkung des Schrägstrichs und von --delete beherrschen',
      'SSH-Schlüssel erzeugen, ihre Rechte prüfen und die Regeln für sicheren Fernzugriff nennen',
    ],
    simple: `Ein Dienst hört auf einem Port, ein Client verbindet sich dorthin. Mit ss -ltn (listening, TCP, numerisch) siehst du, welche Ports offen sind und an welche Adresse sie gebunden sind. 127.0.0.1 heißt: nur vom eigenen Rechner erreichbar. 0.0.0.0 heißt: aus dem Netzwerk erreichbar. Ein Dienst, der nur lokal gebraucht wird, sollte auch nur lokal lauschen.

curl ist das Werkzeug für HTTP von der Kommandozeile. Mit -s ist es still, -o datei speichert, -w "%{http_code}" gibt den Statuscode aus, -I schickt nur eine HEAD-Anfrage. Ein 404 ist für curl zunächst kein Fehler; mit -f endet curl bei HTTP-Fehlern mit Exit-Code 22. Exit-Code 7 heißt: Verbindung nicht möglich (kein Dienst am Port). --max-time setzt ein Zeitlimit, sonst wartet curl sehr lange.

rsync synchronisiert Verzeichnisse und überträgt nur Unterschiede. Der Schrägstrich am Ende der Quelle entscheidet: quelle/ meint den Inhalt, quelle den Ordner selbst. --dry-run zeigt, was passieren würde. --delete entfernt im Ziel, was in der Quelle fehlt; das ist mächtig und gefährlich.

Für den Zugriff auf andere Rechner nutzt man SSH. Statt Passwort verwendet man ein Schlüsselpaar: Der private Schlüssel bleibt geheim auf deinem Rechner, der öffentliche wird auf dem Server hinterlegt. ssh-keygen erzeugt das Paar; der private Schlüssel braucht die Rechte 600, sonst lehnt OpenSSH ihn ab. Beim ersten Kontakt prüfst du den Fingerabdruck des Servers.`,
    steps: [
      'Der Test startet einen kleinen HTTP-Server auf 127.0.0.1:8099 (Python http.server über data/) und wartet, bis ss -ltn die Zeile 127.0.0.1:8099 zeigt. ss -ltnp nennt zusätzlich den Prozess.',
      'curl -s -o /dev/null -w "%{http_code}" liefert 200 für eine vorhandene und 404 für eine fehlende Datei. curl -f macht daraus Exit-Code 22. Ohne -f ist 404 für curl kein Fehler (Exit-Code 0).',
      'Zeigt der Port ins Leere, endet curl mit Exit-Code 7. curl -I schickt HEAD und liefert nur Header. Die heruntergeladene Größe stimmt mit stat -c %s überein.',
      'getent hosts localhost fragt die Namensauflösung des Systems ab, ip -brief address show lo zeigt die Adresse der Loopback-Schnittstelle (127.0.0.1).',
      'rsync -a quelle ziel/ legt ziel/quelle an, rsync -a quelle/ ziel/ legt den Inhalt direkt im Ziel ab. Das ist die häufigste Fehlerquelle bei rsync.',
      'rsync -a --delete --dry-run --itemize-changes zeigt die Änderungen ohne Ausführung: *deleting für Löschungen, >f+++++++++ für neue Dateien. Nach dem Trockenlauf ist nichts gelöscht; erst ohne --dry-run passiert es.',
      'ssh-keygen -t ed25519 erzeugt ein Schlüsselpaar. Der Test nutzt -N "" (keine Passphrase) nur für die Prüfung; echte Schlüssel brauchen eine Passphrase. Private Datei 600, öffentliche 644; ssh-keygen -lf zeigt den Fingerabdruck (SHA256:…).',
      'Mit Rechten 644 verweigert OpenSSH den privaten Schlüssel („UNPROTECTED PRIVATE KEY FILE“; getestet mit ssh-keygen -y). Ein echter Verbindungsaufbau mit ssh zu einem Server wurde nicht ausgeführt.',
    ],
    background: `Warum ein Schlüsselpaar statt Passwort? Ein Passwort geht bei jeder Anmeldung über die Leitung (verschlüsselt, aber der Server sieht es) und lässt sich erraten oder abgreifen. Beim Schlüsselverfahren beweist der Client den Besitz des privaten Schlüssels, ohne ihn zu übertragen. Wird der öffentliche Schlüssel abgegriffen, nützt er niemandem. Üblich ist zusätzlich, auf dem Server die Anmeldung per Passwort abzuschalten (PasswordAuthentication no in der sshd-Konfiguration) und root nicht direkt zuzulassen. Diese Einstellungen wurden hier nicht ausgeführt, sie stehen in der Dokumentation von sshd_config.

Zum Fingerabdruck: Beim ersten Verbinden zeigt SSH den Fingerabdruck des Servers und fragt nach. Wer „ja“ tippt, ohne ihn mit einer sicheren Quelle zu vergleichen, schützt sich nicht vor einem Mann-in-der-Mitte-Angriff. Danach merkt sich SSH den Schlüssel in known_hosts und warnt bei Änderungen.

Zu rsync --delete: Ein vertauschter Pfad oder ein fehlender Schrägstrich kann ein Ziel leeren. Deshalb immer zuerst --dry-run, besser mit --itemize-changes. Für Backups nutzt Lektion 8 --link-dest und prüft Prüfsummen. Außerdem lohnt es sich, bei Netzwerkaufrufen in Skripten Zeitlimits und Wiederholungen bewusst zu setzen (curl --max-time, --retry).`,
    terms: [
      { term: 'Port / Lauschen', text: 'Ein Dienst wartet an einer Portnummer auf Verbindungen (ss -ltn zeigt sie).' },
      { term: '127.0.0.1', text: 'Loopback: Nur vom eigenen Rechner erreichbar.' },
      { term: 'curl -f', text: 'Macht HTTP-Fehler (4xx, 5xx) zu Exit-Code 22.' },
      { term: 'rsync --dry-run', text: 'Trockenlauf: zeigt Änderungen, ohne sie auszuführen.' },
      { term: 'SSH-Schlüsselpaar', text: 'Privater Schlüssel (geheim, 600) und öffentlicher Schlüssel (für den Server).' },
    ],
    code: { file: lab + 'tests/08-network.test.sh', lang: 'Bash' },
    order: ['body', 'code', 'body2'],
    output: `ss -ltn (im Container, Auszug):
 State  Recv-Q Send-Q Local Address:Port Peer Address:Port
 LISTEN 0      5          127.0.0.1:8099      0.0.0.0:*
curl -s -o /dev/null -w "%{http_code}" .../access.log -> 200
curl -fsS .../nope -> curl: (22) The requested URL returned error: 404   (Exit-Code 22)
curl .../ auf geschlossenen Port -> Exit-Code 7
rsync -a --delete --dry-run --itemize-changes quelle/ ziel/ -> *deleting   b  /  >f+++++++++ a
ssh-keygen: Rechte 600 (privat) und 644 (öffentlich); Fingerabdruck "256 SHA256:... (ED25519)"
Test 08-network: 24 bestanden, 0 fehlgeschlagen. Nicht ausgeführt: ssh-Verbindung zu einem Server, sshd-Konfiguration.`,
    mistakes: [
      { wrong: 'Einen Dienst auf 0.0.0.0 lauschen lassen, obwohl nur lokale Zugriffe nötig sind.', why: 'Er ist damit aus dem ganzen Netzwerk erreichbar und wird angreifbar.', fix: 'An 127.0.0.1 binden oder über Firewall und Proxy absichern; mit ss -ltn prüfen.' },
      { wrong: 'curl ohne -f und ohne Statuscode-Prüfung in Skripten verwenden.', why: 'Ein 404 oder 500 hat Exit-Code 0; das Skript verarbeitet die Fehlerseite wie Daten.', fix: 'curl -fsS verwenden oder -w "%{http_code}" prüfen; Zeitlimit mit --max-time setzen.' },
      { wrong: 'rsync --delete ohne Trockenlauf und ohne auf den Schrägstrich zu achten.', why: 'Ein falscher Zielpfad löscht Daten dort, wo man es nicht beabsichtigte.', fix: 'Zuerst --dry-run --itemize-changes lesen; Ziel und Schrägstrich bewusst setzen.' },
      { wrong: 'Den privaten SSH-Schlüssel mit 644 ablegen oder in Repositories speichern.', why: 'OpenSSH lehnt ihn ab, und jede Weitergabe kompromittiert den Zugang.', fix: 'chmod 600, Passphrase setzen, nie einchecken; bei Verlust Schlüssel auf dem Server entfernen.' },
    ],
    practice: 'Prüfe nach dem Start jedes Dienstes mit ss -ltn, wo er lauscht. Nutze für Dateiübertragungen rsync mit Trockenlauf, für HTTP-Aufrufe in Skripten curl -fsS mit Zeitlimit, und für Fernzugriff ausschließlich Schlüssel mit Passphrase. Vergleiche Fingerabdrücke von Servern über einen zweiten Weg.',
    exercises: [
      { task: 'Starte python3 -m http.server 8100 --bind 127.0.0.1 und prüfe mit ss -ltn, curl -I und curl -s -w "%{http_code}", ob er antwortet. Beende ihn dann sauber.', acceptance: 'ss zeigt 127.0.0.1:8100, curl -I zeigt 200 OK, nach dem Beenden liefert curl den Exit-Code 7.' },
      { task: 'Grenzfall: Lege eine Quelle mit einer Datei und einem leeren Unterordner an. Synchronisiere mit und ohne Schrägstrich und beschreibe die Unterschiede. Was macht --delete, wenn die Quelle leer ist?', acceptance: 'Ohne Schrägstrich entsteht ziel/quelle, mit Schrägstrich liegt der Inhalt im Ziel; bei leerer Quelle löscht --delete das Ziel; du bestätigst das mit --dry-run.' },
      { task: 'Fehlerfall: Erzeuge ein Schlüsselpaar, setze den privaten Schlüssel auf 644 und führe ssh-keygen -y -f aus. Behebe den Fehler.', acceptance: 'Meldung „UNPROTECTED PRIVATE KEY FILE“; nach chmod 600 liefert der Befehl den öffentlichen Schlüssel.' },
    ],
    quiz: [
      { q: 'Ein Dienst zeigt in ss -ltn die Adresse 127.0.0.1:8099. Wer kann ihn erreichen?',
        options: ['Nur Programme auf demselben Rechner.', 'Jeder im Internet.', 'Jeder im lokalen Netzwerk.', 'Niemand.'],
        correct: 0,
        rationales: ['127.0.0.1 ist die Loopback-Adresse des eigenen Rechners.', 'Dazu müsste er auf 0.0.0.0 oder einer öffentlichen Adresse lauschen.', 'Dazu wäre die Adresse des Netzwerks nötig.', 'Lokale Programme erreichen ihn.'],
        explain: 'Bindung an 127.0.0.1 beschränkt den Zugriff auf den eigenen Rechner.' },
      { q: 'Was liefert curl -f bei einem Server, der 404 antwortet?',
        options: ['Exit-Code 22 und eine Fehlermeldung.', 'Exit-Code 0 und die Fehlerseite.', 'Exit-Code 7.', 'Exit-Code 404.'],
        correct: 0,
        rationales: ['Mit -f wird ein HTTP-Fehler zum Exit-Code 22.', 'So verhält sich curl ohne -f.', '7 bedeutet: Verbindung nicht möglich.', 'Exit-Codes gehen nur bis 255.'],
        explain: 'curl -f eignet sich, damit Skripte HTTP-Fehler als Fehler erkennen.' },
      { q: 'Worauf musst du bei rsync quelle/ ziel/ gegenüber rsync quelle ziel/ achten?',
        options: ['Mit Schrägstrich wird der Inhalt kopiert, ohne wird der Ordner selbst kopiert.', 'Es gibt keinen Unterschied.', 'Ohne Schrägstrich werden nur Dateien kopiert.', 'Mit Schrägstrich werden Dateien gelöscht.'],
        correct: 0,
        rationales: ['Das ist die zentrale Regel; der Test belegt sie.', 'Der Unterschied ist erheblich.', 'Auch Unterordner werden kopiert.', 'Löschen passiert nur mit --delete.'],
        explain: 'Der Schrägstrich am Ende der Quelle entscheidet, ob Inhalt oder Ordner kopiert wird.' },
    ],
    sources: [
      docs('curl: Handbuch', 'https://curl.se/docs/manpage.html', 'Optionen und Exit-Codes von curl.'),
      docs('rsync: Handbuch', 'https://download.samba.org/pub/rsync/rsync.1', 'Optionen wie --delete, --dry-run, --link-dest.'),
      docs('OpenBSD: ssh-keygen', 'https://man.openbsd.org/ssh-keygen', 'Schlüsselerzeugung, Typen und Fingerabdrücke.'),
      docs('OpenBSD: sshd_config', 'https://man.openbsd.org/sshd_config', 'Serverseitige Optionen wie PasswordAuthentication; in diesem Lab nicht ausgeführt.'),
    ],
    verification: 'Lab shell-lab: Alle 24 Prüfungen von 08-network.test.sh liefen im Container debian:trixie-slim (curl 8.14.1, rsync 3.5.0, OpenSSH 10.0p2, iproute2 6.15.0) grün; die Netzwerk-Beispiele laufen nur lokal. NICHT ausgeführt: ein SSH-Login auf einem Server, sshd-Konfiguration, Firewall-Regeln und Übertragungen über das Internet.',
  },
  {
    id: 'lx-m2-l4', title: 'Pakete, Logs, Skript-Sicherheit und ein Backup-Projekt', minutes: 60,
    prerequisites: 'Alle vorherigen Lektionen des Kurses.',
    objectives: [
      'Pakete mit dpkg/apt einordnen und Paketquellen als Vertrauensfrage verstehen',
      'Logdateien gezielt nach Fehlern und Auffälligkeiten durchsuchen',
      'Typische Sicherheitslücken in Skripten erkennen (eval, ungeschützte Variablen, Dateinamen mit Strich) und vermeiden',
      'Ein Backup-Skript mit rsync --link-dest, Prüfsummen, Sperre und Rücksicherungstest bauen und prüfen',
    ],
    simple: `Auf Debian und Ubuntu verwaltet apt Pakete aus signierten Paketquellen; darunter arbeitet dpkg, das einzelne Pakete installiert. dpkg -S pfad sagt, zu welchem Paket eine Datei gehört, dpkg-query -W zeigt Version und Status. Jedes installierte Paket ist Code, dem du vertraust: Quellen und Schlüssel sind eine Sicherheitsfrage, und Updates schließen Sicherheitslücken.

Logs sind das Gedächtnis eines Systems. Dienste schreiben nach /var/log oder in das Journal von systemd (journalctl -u dienst). Du filterst sie mit grep, awk und sort und zählst, was auffällt: viele Fehlerseiten, wiederholte fehlgeschlagene Anmeldungen, ungewöhnliche Zeiten. Alte Logs werden rotiert und gepackt (zcat liest sie).

Skripte laufen oft mit hohen Rechten und verarbeiten Daten von außen. Deshalb gehören Sicherheitsregeln dazu: Eingaben nie als Befehl auswerten (eval), Variablen in Anführungszeichen, Optionen mit -- beenden, Dateinamen prüfen, temporäre Dateien mit mktemp und Fehler früh abfangen. ShellCheck findet viele dieser Fehler automatisch.

Das Abschlussprojekt verbindet alles: ein Backup-Skript. Es nutzt rsync --link-dest, damit jeder Schnappschuss ein vollständiges Abbild ist, unveränderte Dateien aber nur einmal Platz belegen (harte Links, Lektion 2). Es sperrt gegen parallele Läufe, schreibt erst in ein Zwischenverzeichnis, vergleicht Prüfsummen, benennt dann atomar um und löscht alte Schnappschüsse. Ein Backup gilt erst, wenn die Rücksicherung getestet ist.`,
    steps: [
      'Pakete: dpkg -S /usr/bin/ls ergibt coreutils; dpkg-query -W -f=\'${Status}\' coreutils meldet install ok installed; ein unbekanntes Paket liefert einen Fehler statt einer Ausgabe.',
      'Logs: grep -c " 500 " zählt Serverfehler (1), awk \'$9 == 401 {print $1}\' | sort -u nennt die Adresse mit den fehlgeschlagenen Anmeldungen (198.51.100.7), grep -E grenzt Zeiträume ein, tail -n 1 liefert den neuesten Eintrag, zcat liest rotierte .gz-Logs.',
      'Unsicher: eval "echo $eingabe" mit der Eingabe x; echo GEHACKT > pwn.txt führt den eingeschleusten Befehl aus (der Test belegt es). Sicher ist, Eingaben nur als Text in Anführungszeichen zu verwenden.',
      'Dateinamen mit führendem Strich werden von rm als Optionen gelesen: rm -- datei beendet die Optionen, ./datei schützt ebenso. mktemp liefert eine Datei mit Rechten 600. Dateinamen aus Eingaben prüft man mit einem strengen Muster und lehnt ../ ab.',
      'set -u bricht bei unbekannten Variablen ab; set -e bricht bei Fehlern ab, wirkt aber nicht in if-Bedingungen und nicht in Funktionen, die per || aufgerufen werden.',
      'ShellCheck 0.10.0 meldet für rm -rf $1/* sowohl SC2115 (Variable kann leer sein, es würde /* gelöscht) als auch SC2086 (Anführungszeichen fehlen). Die Lab-Skripte sind ohne Meldung.',
      'backup.sh sperrt per mkdir (atomar), kopiert mit rsync -a --delete und --link-dest auf das letzte Backup in ein .partial-Verzeichnis, liest die Prüfsummen beider Seiten einzeln und prüft den Exit-Code, benennt erst dann um, setzt latest per ln -sfn und löscht Schnappschüsse über ANZAHL_BEHALTEN hinaus.',
      'Der Test belegt: unveränderte Dateien haben dieselbe Inode (zwei Namen), geänderte eine eigene Kopie, der alte Stand bleibt erhalten, eine in der Quelle gelöschte Datei fehlt nur im neuen Schnappschuss, und die Rücksicherung (rsync -a latest/ wieder/) stimmt mit diff -r überein.',
    ],
    background: `Wie fand das Lab einen echten Fehler? Beim ersten Entwurf verglich das Skript Prüfsummen so: if [[ "$(checksums quelle)" != "$(checksums kopie)" ]]. Eine unlesbare Datei, die rsync dank --link-dest nur verlinkt hatte, ließ beide Seiten mit „Permission denied“ scheitern. Beide Ausgaben waren gleich, der Vergleich bestand, und das Skript meldete Erfolg, obwohl die Datei nie geprüft wurde. Der Fehler in $( ) innerhalb von [[ ]] ging verloren. Die Korrektur liest jede Seite einzeln und prüft den Exit-Code. Merke: Ein Test, der auch bei beschädigter Eingabe besteht, prüft nichts.

Warum so viele Sicherungen? Wer nur überschreibt, sichert auch Fehler: Eine versehentlich gelöschte oder verschlüsselte (Ransomware) Datei steckt beim nächsten Lauf im „Backup“. Mehrere Stände (hier: ANZAHL_BEHALTEN) erlauben die Rückkehr. Zusätzlich gilt die 3-2-1-Regel als Faustregel: drei Kopien, auf zwei Arten von Medien, eine außer Haus. Das Lab bildet nur einen lokalen Schnappschuss ab; Verschlüsselung der Sicherung und Offsite-Kopie wurden nicht umgesetzt und nicht geprüft.

Zur Atomarität: mv innerhalb desselben Dateisystems ist atomar, deshalb sieht niemand einen halben Schnappschuss. Die Sperre per mkdir nutzt, dass das Anlegen eines Verzeichnisses entweder gelingt oder scheitert, und funktioniert auch ohne flock. Bleibt nach einem harten Abbruch (SIGKILL) eine Sperre liegen, muss sie von Hand entfernt werden; das Skript meldet dann Exit-Code 75.

Zur Einordnung: Für ein echtes Backup gibt es erprobte Werkzeuge (z. B. restic, borg). Dieses Skript dient dem Verständnis; für Produktivdaten Werkzeuge mit Verschlüsselung und Prüfmechanismen prüfen.`,
    terms: [
      { term: 'dpkg / apt', text: 'dpkg installiert einzelne Pakete, apt verwaltet Quellen und Abhängigkeiten.' },
      { term: 'eval', text: 'Führt Text als Befehl aus; mit Eingaben von außen gefährlich.' },
      { term: '--link-dest', text: 'rsync verlinkt unveränderte Dateien auf einen früheren Stand, statt sie zu kopieren.' },
      { term: 'Prüfsumme', text: 'Kurzer Wert aus dem Inhalt (sha256); gleiche Datei, gleicher Wert.' },
      { term: 'Rücksicherungstest', text: 'Wiederherstellen und vergleichen; erst das beweist, dass ein Backup taugt.' },
    ],
    code: { file: lab + 'scripts/backup.sh', lang: 'Bash' },
    code2: { file: lab + 'tests/09-packages-security.test.sh', lang: 'Bash', from: '# --- Skript-Sicherheit', to: 'set -e wirkt nicht in Funktionen' },
    code3: { file: lab + 'tests/07-backup.test.sh', lang: 'Bash', from: '# --- Zweiter Schnappschuss', to: 'Rücksicherung stimmt' },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: `Backup (Container, Bash 5.2.37, rsync 3.5.0):
 Sicherung angelegt: 2026-11-14T100000Z (1 Schnappschüsse, behalten: 3)
 Sicherung angelegt: 2026-11-14T110000Z (2 Schnappschüsse, behalten: 3)
 stat -c "%i %h" a.txt in beiden Schnappschüssen: gleiche Inode, 2 Namen; geänderte b.txt: verschiedene Inodes
Fehlerfälle: unlesbare Quelldatei ->  sha256sum: ./a.txt: Permission denied / Prüfsummen der Quelle nicht lesbar. Schnappschuss verworfen. (Exit-Code 70)
             belegte Sperre -> Eine Sicherung läuft bereits oder wurde abgebrochen: z/.lock (Exit-Code 75)
dpkg -S /usr/bin/ls -> coreutils: /usr/bin/ls ; coreutils 9.7-3
ShellCheck: rm -rf $1/* -> SC2115 (Variable kann leer sein) und SC2086 (Anführungszeichen fehlen)
Test 07-backup: 26 bestanden ; Test 09-packages-security: 21 bestanden ; alle neun Testdateien zusammen: 216 Prüfungen, 0 fehlgeschlagen`,
    mistakes: [
      { wrong: 'Eingaben mit eval oder bash -c "…$eingabe…" auswerten.', why: 'Wer die Eingabe kontrolliert, kontrolliert den Befehl (Command Injection).', fix: 'Eingaben nur als Argumente in Anführungszeichen übergeben, Werte validieren, notfalls Arrays statt Befehlstext verwenden.' },
      { wrong: 'Ein Backup nur anlegen und nie zurückspielen.', why: 'Unlesbare, leere oder falsche Sicherungen fallen erst im Ernstfall auf.', fix: 'Rücksicherung regelmäßig testen (diff -r) und Prüfsummen vergleichen.' },
      { wrong: 'Prüfungen so bauen, dass beide Seiten bei einem Fehler gleich aussehen.', why: 'Ein Vergleich kann „bestehen“, obwohl nichts geprüft wurde (wie beim Prüfsummenfehler im Lab).', fix: 'Jede Seite einzeln einlesen, Exit-Codes prüfen, und den Fehlerfall im Test nachstellen.' },
      { wrong: 'Pakete aus beliebigen Quellen installieren (curl … | sudo bash).', why: 'Der Code wird ohne Prüfung mit hohen Rechten ausgeführt.', fix: 'Signierte Paketquellen nutzen, Prüfsummen vergleichen und Skripte vor der Ausführung lesen.' },
    ],
    practice: 'Mache aus einer wiederkehrenden Aufgabe ein Skript mit Eingabeprüfung, Sperre, Aufräumen und Tests, lasse ShellCheck laufen und plane Rücksicherungstests ein. Prüfe Pakete und Skripte aus fremden Quellen, bevor du sie mit hohen Rechten ausführst.',
    exercises: [
      { task: 'Ergänze backup.sh eine Option --dry-run, die rsync mit -n aufruft und nichts anlegt. Schreibe einen Test.', acceptance: 'Im Trockenlauf entsteht weder ein Schnappschuss noch ein latest-Link; Exit-Code 0; ShellCheck meldet nichts.' },
      { task: 'Grenzfall: Sichere eine leere Quelle, eine Quelle mit einer 0-Byte-Datei und eine mit einem Dateinamen aus Leerzeichen und Umlauten. Was prüfst du jeweils?', acceptance: 'Alle drei Fälle ergeben einen Schnappschuss; die Rücksicherung stimmt mit diff -r überein; Tests belegen jeden Fall.' },
      { task: 'Fehlerfall: Simuliere einen Abbruch mit kill -KILL mitten im Lauf (z. B. mit einer großen Quelle). Was bleibt zurück, und wie stellst du den Betrieb her?', acceptance: 'Das .partial-Verzeichnis und die Sperre bleiben; du entfernst beides von Hand, prüfst, dass latest unverändert ist, und startest neu. Du beschreibst, wie das Skript das künftig erkennen könnte.' },
    ],
    quiz: [
      { q: 'Wozu dient rsync --link-dest=ALTER_SCHNAPPSCHUSS?',
        options: ['Unveränderte Dateien werden als harte Links auf den alten Stand angelegt und brauchen keinen Platz.', 'Es verschlüsselt die Sicherung, bevor sie auf das Ziel geschrieben wird.', 'Es löscht den alten Schnappschuss, sobald der neue vollständig ist.', 'Es lädt die Sicherung zusätzlich auf einen Server im Netz hoch.'],
        correct: 0,
        rationales: ['So ist jeder Schnappschuss vollständig, kostet aber nur den Platz der Änderungen.', 'Verschlüsselung leistet es nicht.', 'Das Löschen übernimmt das Skript separat.', 'Es hat keine Netzwirkung.'],
        explain: 'Harte Links teilen unveränderte Dateien zwischen Schnappschüssen.' },
      { q: 'Warum ist eval "echo $eingabe" bei Eingaben von außen gefährlich?',
        options: ['Die Eingabe wird als Befehl ausgeführt; ein Strichpunkt hängt weitere an.', 'Es ist zu langsam, weil die Zeichenkette jedes Mal neu geparst wird.', 'eval gibt es in Bash nicht, der Aufruf schlägt deshalb immer fehl.', 'Es verbraucht sehr viel Speicher, sobald die Eingabe länger ist.'],
        correct: 0,
        rationales: ['Das zeigt der Test mit x; echo GEHACKT > pwn.txt.', 'Geschwindigkeit ist nicht das Problem.', 'eval existiert.', 'Speicher ist nicht das Problem.'],
        explain: 'eval macht aus Text einen Befehl; Eingaben dürfen nie dort landen.' },
      { q: 'Warum prüft das Backup-Skript die Prüfsummen jeder Seite einzeln und mit Exit-Code, statt sie direkt in [[ ]] zu vergleichen?',
        options: ['Ein Fehler beim Berechnen bliebe im [[ ]]-Vergleich unbemerkt, und beide Seiten wirkten gleich.', 'Weil sha256sum nur mit einzelnen Dateien und nie in Vergleichen funktioniert.', 'Weil [[ ]] keine Befehle ausführen und keine Ausgaben lesen kann.', 'Weil das einzelne Berechnen grundsätzlich schneller ist als ein Vergleich.'],
        correct: 0,
        rationales: ['Genau das passierte im Lab bei einer unlesbaren, nur verlinkten Datei; der Test deckt den Fall jetzt ab.', 'sha256sum funktioniert auch in Befehlsersetzungen.', 'Befehlsersetzungen sind in [[ ]] erlaubt.', 'Geschwindigkeit ist nicht der Grund.'],
        explain: 'Fehler in Befehlsersetzungen innerhalb von Bedingungen gehen sonst verloren.' },
    ],
    sources: [
      shellcheck,
      docs('Debian Wiki: SecureApt', 'https://wiki.debian.org/SecureApt', 'Beschreibt, wie apt Paketquellen mit Signaturen prüft.'),
      docs('rsync: Handbuch (--link-dest)', 'https://download.samba.org/pub/rsync/rsync.1', 'Beschreibt --link-dest, --delete, -a.'),
      docs('OWASP: Command Injection', 'https://owasp.org/www-community/attacks/Command_Injection', 'Beschreibung des Angriffs; Inhalt hier eigenständig zusammengefasst.'),
      docs('Debian-Manpage: dpkg-query(1)', 'https://manpages.debian.org/trixie/dpkg/dpkg-query.1.en.html', 'Abfragen installierter Pakete.'),
    ],
    verification: 'Lab shell-lab: Alle 26 Prüfungen von 07-backup.test.sh und alle 21 von 09-packages-security.test.sh liefen im Container debian:trixie-slim grün; ShellCheck 0.10.0 meldet für scripts/ und tests/ nichts. Der Prüfsummenfehler wurde im Lab gefunden, behoben und mit einem Test abgesichert. NICHT geprüft: apt install/upgrade gegen echte Paketquellen im Betrieb, journalctl und logrotate (nicht ausgeführt), Verschlüsselung und Offsite-Kopie, sehr große Datenmengen, Abbruch per SIGKILL mitten im Lauf und macOS.',
  },
];
