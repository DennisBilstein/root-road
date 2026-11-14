// Linux & Shell · Grundlagen. Stichtag 14.11.2026.
// Eigene Texte; Code und Tests liegen unter content/examples/shell-lab/ (Debian 13 "trixie" im Container, Bash 5.2.37).
// Die Handbücher und Manpages werden nur verlinkt, nichts daraus kopiert.
const lab = 'content/examples/shell-lab/';
const docs = (title, url, note = 'Offizielle Dokumentation; Inhalt hier eigenständig zusammengefasst.') => ({ title, url, note });
const bash = docs('GNU Bash Reference Manual', 'https://www.gnu.org/software/bash/manual/bash.html', 'Referenz zu Shell-Syntax, Variablen, Umleitungen und eingebauten Befehlen.');
const coreutils = docs('GNU Coreutils Manual', 'https://www.gnu.org/software/coreutils/manual/coreutils.html', 'Referenz zu ls, cp, mv, chmod, sort, uniq, cut, tr und weiteren Standardwerkzeugen.');
const man7 = (title, page, note) => docs(title, `https://man7.org/linux/man-pages/${page}`, note ?? 'Linux man-pages; Inhalt hier eigenständig zusammengefasst.');

export const module = {
  id: 'lx-m1', course: 'linux', part: 30, partTitle: 'Linux & Shell · Kommandozeile, Skripte und Betrieb',
  title: 'Linux Grundlagen · Shell, Dateien, Rechte und Textwerkzeuge',
};

export const lessons = [
  {
    id: 'lx-m1-l1', title: 'Die Shell und das Dateisystem: Pfade, Verzeichnisbaum und Befehle', minutes: 45,
    prerequisites: 'Keine. Du solltest ein Terminal öffnen können (Linux, macOS oder WSL).',
    objectives: [
      'Erklären, was eine Shell ist und wie sie einen eingegebenen Befehl findet und ausführt',
      'Absolute und relative Pfade lesen und mit cd, pwd und ls im Verzeichnisbaum navigieren',
      'Die wichtigsten Verzeichnisse des Linux-Dateisystems (etc, usr, var, home, tmp, proc, dev) einordnen',
      'Mit Anführungszeichen steuern, ob die Shell Leerzeichen trennt und Variablen ersetzt',
    ],
    simple: `Eine Shell ist ein Programm, das Befehle entgegennimmt und ausführt. Du tippst eine Zeile, die Shell zerlegt sie in Wörter, ersetzt Variablen und Muster, sucht das Programm und startet es. Bash ist die verbreitetste Shell unter Linux. Das Fenster, in dem du tippst, heißt Terminal; die Shell läuft darin.

Alles liegt in einem einzigen Baum. Er beginnt an der Wurzel /, und jedes Verzeichnis darunter ist ein Ast. Ein absoluter Pfad beginnt mit / und gilt von überall (/etc/os-release). Ein relativer Pfad beginnt ohne / und gilt vom aktuellen Verzeichnis aus (src/main.sh). Der Punkt . bedeutet „hier“, zwei Punkte .. bedeuten „eine Ebene höher“. Das aktuelle Verzeichnis zeigt pwd, wechseln kannst du mit cd.

Linux legt Dinge nach festen Regeln ab, dem Filesystem Hierarchy Standard (FHS). Einstellungen liegen in /etc, Programme in /usr/bin, veränderliche Daten und Protokolle in /var, persönliche Dateien in /home, Temporäres in /tmp. Unter /proc und /dev gibt es keine echten Dateien auf der Platte, sondern Fenster in den Kernel und auf Geräte. Das Prinzip „alles ist eine Datei“ macht Werkzeuge kombinierbar.

Nicht jeder Befehl ist ein Programm. cd ist in die Shell eingebaut (es muss das Verzeichnis der Shell selbst ändern), if ist ein Schlüsselwort, und ls ist ein eigenes Programm irgendwo im Dateisystem. Die Shell findet Programme über die Variable PATH, eine Liste von Verzeichnissen, die sie von links nach rechts absucht.`,
    steps: [
      'Starte die Tests im Container (./run-in-container.sh) oder lies die Datei 01-navigation.test.sh. Jede Zeile assert_eq vergleicht den erhaltenen mit dem erwarteten Wert; so ist jede Aussage dieser Lektion geprüft.',
      'mkdir -p legt verschachtelte Verzeichnisse an. cd wechselt, $PWD enthält das aktuelle Verzeichnis. Der Test prüft relative Pfade (src), absolute Pfade und ..',
      'ls zeigt Dateien, die mit einem Punkt beginnen, nicht an (versteckte Dateien). ls -A zeigt sie, ls -la zeigt sie mit Rechten, Besitzer, Größe und Datum.',
      'Der Test prüft, ob Verzeichnisse wie /etc, /usr/bin, /var/log, /tmp, /home, /proc und /dev existieren, und liest /etc/os-release, die die Distribution benennt (im Lab Debian).',
      'type -t zeigt die Art eines Befehls: builtin (eingebaut), keyword (Schlüsselwort), function (eigene Funktion) oder file (Programm). command -v zeigt den Fundort eines Programms.',
      'Ein selbst geschriebenes Skript wird nur gefunden, wenn sein Verzeichnis im PATH steht. Ohne den Eintrag meldet Bash „command not found“ und gibt Exit-Code 127 zurück. Ein voller Pfad (./skript oder /opt/x/skript) braucht keinen PATH.',
      'Ohne Anführungszeichen trennt die Shell einen Wert an Leerzeichen: count $name sieht zwei Wörter. Mit "$name" bleibt es eines. Einfache Anführungszeichen ersetzen nichts, doppelte ersetzen Variablen.',
      'Faustregel für die Praxis: Setze Variablen und Pfade fast immer in doppelte Anführungszeichen. Das ist die Quelle der meisten Shell-Fehler und einiger Sicherheitslücken (Lektion 8).',
    ],
    background: `Warum gibt es „eingebaute“ Befehle? Ein Programm läuft als eigener Prozess und kann die Umgebung seines Aufrufers nicht ändern. Würde cd ein eigenes Programm sein, wechselte es sein eigenes Verzeichnis und endete; deine Shell bliebe, wo sie war. Deshalb müssen cd, export oder exit in der Shell selbst stecken.

Warum PATH? Die Shell kann nicht das ganze Dateisystem nach ls durchsuchen. Sie hält sich an eine Liste. Das ist praktisch und eine Sicherheitsfrage: Steht ein beschreibbares Verzeichnis (oder gar „.“) vorn im PATH, kann jemand dort ein Programm namens ls ablegen, das statt des echten läuft. Deshalb gehört „.“ nicht in den PATH, und Skripte nutzen gern volle Pfade.

Zur Einordnung von Linux-Varianten: Dieses Lab läuft auf Debian 13. Andere Distributionen (Ubuntu, Fedora, Arch) teilen den Kern, unterscheiden sich aber bei Paketverwaltung und Standardwerkzeugen. macOS hat ebenfalls eine Shell, aber BSD-Werkzeuge und eine alte Bash 3.2; das Lab wurde dort nicht geprüft.`,
    terms: [
      { term: 'Shell / Terminal', text: 'Die Shell führt Befehle aus, das Terminal ist das Fenster dazu.' },
      { term: 'absoluter / relativer Pfad', text: 'Mit / am Anfang gilt er von der Wurzel, sonst vom aktuellen Verzeichnis.' },
      { term: 'FHS', text: 'Filesystem Hierarchy Standard: feste Orte für Einstellungen, Programme, Daten.' },
      { term: 'PATH', text: 'Liste von Verzeichnissen, in denen die Shell nach Programmen sucht.' },
      { term: 'Exit-Code 127', text: 'Der Befehl wurde nicht gefunden.' },
    ],
    code: { file: lab + 'tests/01-navigation.test.sh', lang: 'Bash' },
    order: ['body', 'code', 'body2'],
    output: `ls -la in einem frischen Verzeichnis (Datum und Besitzer gekürzt):
 drwxr-xr-x 4 u lernen 4096 DATUM .
 drwx------ 3 u lernen 4096 DATUM ..
 -rw-r--r-- 1 u lernen    0 DATUM .versteckt
 drwxr-xr-x 2 u lernen 4096 DATUM docs
 drwxr-xr-x 2 u lernen 4096 DATUM src
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
type -t cd ls if   ->  builtin, file, keyword
command -v ls      ->  /usr/bin/ls
Test 01-navigation: 26 bestanden, 0 fehlgeschlagen (Debian 13, Bash 5.2.37)`,
    mistakes: [
      { wrong: 'Datei- oder Verzeichnisnamen mit Leerzeichen ohne Anführungszeichen verwenden.', why: 'Die Shell trennt am Leerzeichen und übergibt zwei Argumente; rm oder cp treffen dann falsche Dateien.', fix: 'Pfade und Variablen in doppelte Anführungszeichen setzen: "$datei".' },
      { wrong: 'Erwarten, dass ein Skript im aktuellen Ordner einfach mit seinem Namen startet.', why: 'Der Ordner steht nicht im PATH; Bash meldet „command not found“ (Exit-Code 127).', fix: './skript.sh aufrufen oder einen bewusst gewählten Ordner in den PATH aufnehmen.' },
      { wrong: 'Den aktuellen Ordner („.“) in den PATH aufnehmen.', why: 'Wer in einem fremden Ordner arbeitet, kann versehentlich dort abgelegte Programme ausführen.', fix: 'Skripte mit ./ starten oder in ein eigenes bin-Verzeichnis legen.' },
      { wrong: 'Einfache und doppelte Anführungszeichen verwechseln.', why: 'In einfachen bleibt alles wörtlich ($HOME), in doppelten werden Variablen ersetzt.', fix: 'Einfache für feste Texte, doppelte für Texte mit Variablen.' },
    ],
    practice: 'Lege dir einen Übungsordner an und baue darin mit mkdir -p, cd und ls eine kleine Projektstruktur. Lies bei jedem neuen Befehl die Kurzhilfe (befehl --help) oder die Manpage (man befehl). Gewöhne dir an, Pfade und Variablen immer in doppelte Anführungszeichen zu setzen.',
    exercises: [
      { task: 'Erstelle in einem temporären Ordner die Struktur projekt/src, projekt/docs und eine versteckte Datei .env. Zeige sie mit ls, ls -A und ls -la und beschreibe die Unterschiede.', acceptance: 'ls zeigt .env nicht, ls -A zeigt sie ohne . und .., ls -la zeigt sie mit Rechten und Besitzer; du nennst die Reihenfolge der Spalten.' },
      { task: 'Grenzfall: Lege ein Verzeichnis "Mein Ordner" (mit Leerzeichen) an, wechsle hinein und lass pwd laufen. Was geschieht ohne Anführungszeichen bei cd Mein Ordner?', acceptance: 'Mit Anführungszeichen funktioniert es; ohne meldet cd, dass zu viele Argumente vorliegen oder der Ordner nicht existiert; du erklärst die Wortaufteilung.' },
      { task: 'Fehlerfall: Lege ein Skript hallo in einem neuen Ordner ab und starte es mit seinem Namen. Behebe den Fehler auf zwei Wegen (./ und PATH).', acceptance: 'Ohne Maßnahme: command not found (Exit-Code 127). Mit ./hallo und mit PATH="$PWD:$PATH" läuft es; du nennst, warum der zweite Weg im Alltag nicht empfohlen ist.' },
    ],
    quiz: [
      { q: 'Warum ist cd ein eingebauter Befehl und kein eigenes Programm?',
        options: ['Ein Programm kann das Arbeitsverzeichnis der Shell nicht ändern, die es gestartet hat.', 'Weil cd als eigenes Programm zu langsam wäre und zu viel Speicher belegte.', 'Weil externe Programme grundsätzlich keine Argumente entgegennehmen können.', 'Weil es historisch so beschlossen wurde, ohne technischen Grund.'],
        correct: 0,
        rationales: ['Ein eigener Prozess ändert nur sein eigenes Verzeichnis und endet; die Shell bliebe unverändert.', 'Geschwindigkeit ist nicht der Grund.', 'Programme nehmen Argumente.', 'Es gibt einen klaren technischen Grund.'],
        explain: 'Befehle, die die Shell selbst verändern (cd, export, exit), müssen in der Shell stecken.' },
      { q: 'Was bedeutet der Exit-Code 127?',
        options: ['Der Befehl wurde nicht gefunden.', 'Der Befehl wurde mit Strg+C abgebrochen.', 'Das Programm hatte keine Berechtigung.', 'Der Befehl war erfolgreich.'],
        correct: 0,
        rationales: ['Das geschieht, wenn die Shell das Programm nicht im PATH findet.', 'Das wäre 130 (128 + SIGINT).', 'Fehlende Berechtigung zum Ausführen ergibt 126.', 'Erfolg ist 0.'],
        explain: '127 = nicht gefunden, 126 = nicht ausführbar, 130 = Strg+C.' },
      { q: 'Was ergibt count "$name" bei name="Ada Lovelace", wenn count die Zahl der Argumente ausgibt?',
        options: ['1', '2', '0', 'Einen Fehler.'],
        correct: 0,
        rationales: ['Anführungszeichen halten den Wert als ein Argument zusammen.', '2 ergäbe sich ohne Anführungszeichen.', 'Es wird ein Argument übergeben.', 'Es entsteht kein Fehler.'],
        explain: 'Doppelte Anführungszeichen verhindern die Aufteilung am Leerzeichen.' },
    ],
    sources: [
      bash,
      man7('Linux man-pages: hier(7) – Aufbau des Dateisystems', 'man7/hier.7.html'),
      docs('Debian Reference: Debian-Systeme und Shell', 'https://www.debian.org/doc/manuals/debian-reference/', 'Handbuch zu Debian; für diese Lektion die Kapitel zu Shell und Dateisystem.'),
    ],
    verification: 'Lab shell-lab: Alle 26 Prüfungen von 01-navigation.test.sh liefen im Container debian:trixie-slim (Bash 5.2.37) als normaler Benutzer grün; die Distribution wurde über /etc/os-release als Debian bestätigt. Nicht geprüft: macOS (Bash 3.2, BSD-Werkzeuge), andere Distributionen, andere Shells (zsh, fish) und Windows (WSL).',
  },
  {
    id: 'lx-m1-l2', title: 'Dateien, Links, Muster und find', minutes: 45,
    prerequisites: 'Lektion „Die Shell und das Dateisystem“ (lx-m1-l1).',
    objectives: [
      'Dateien und Verzeichnisse kopieren, verschieben und löschen und die Folgen von rm -r einschätzen',
      'Harte und symbolische Links unterscheiden und ihr Verhalten beim Löschen erklären',
      'Muster (*, ?, [ ], { }) einsetzen und wissen, dass die Shell sie vor dem Programmstart ersetzt',
      'Mit find nach Name, Typ, Größe und Alter suchen und sicher mit Dateinamen mit Leerzeichen umgehen',
    ],
    simple: `Die Grundwerkzeuge sind cp (kopieren), mv (verschieben oder umbenennen), rm (löschen) und mkdir (anlegen). Es gibt keinen Papierkorb: rm löscht endgültig, und rm -r löscht ein ganzes Verzeichnis samt Inhalt. Deshalb gilt die Regel: erst mit ls ansehen, was ein Muster trifft, dann löschen.

Eine Datei besteht aus Daten und einem Namen. Ein harter Link ist ein zweiter Name für dieselben Daten (dieselbe Inode-Nummer); die Daten verschwinden erst, wenn der letzte Name weg ist. Ein symbolischer Link (Symlink) ist ein Verweis auf einen Namen. Löschst du das Ziel, bleibt der Symlink „hängend“ zurück und zeigt ins Leere. Symlinks funktionieren über Dateisystemgrenzen und für Verzeichnisse; harte Links nicht.

Muster (Globbing) schreibst du, wenn du viele Dateien meinst: * steht für beliebig viele Zeichen, ? für genau eines, [ab] für eines der Zeichen. Wichtig ist: Die Shell ersetzt das Muster durch die passende Dateiliste, bevor das Programm startet. Das Programm sieht nie das Muster, nur die Namen. Passt nichts, bleibt das Muster stehen (Standardverhalten).

find durchsucht ganze Verzeichnisbäume nach Eigenschaften: Name, Typ (f Datei, d Verzeichnis), Größe, Alter. Mit -exec oder mit xargs führst du für die Treffer Befehle aus. Der sichere Weg bei Namen mit Leerzeichen ist -print0 zusammen mit xargs -0, weil die Namen dann durch ein Nullzeichen getrennt werden.`,
    steps: [
      'mkdir -p legt alle fehlenden Ebenen an. cp kopiert, mv verschiebt oder benennt um. Nach mv liegt die Datei nur noch am Ziel. cp -r kopiert Verzeichnisse, rm -r löscht sie ohne Rückfrage.',
      'ln a.txt hart.txt erzeugt einen zweiten Namen. stat -c %i zeigt die Inode-Nummer: bei harten Links identisch. stat -c %h zeigt, wie viele Namen eine Datei hat.',
      'ln -s a.txt weich.txt erzeugt einen Symlink; readlink zeigt das Ziel. Nach rm a.txt lebt der harte Link weiter (Daten bleiben), der Symlink ist hängend: [[ -e ]] ist falsch, [[ -L ]] wahr.',
      'Muster: echo *.txt, a?.txt, [ab]1.*. Die Shell ersetzt sie. Ohne Treffer bleibt *.zip stehen; mit shopt -s nullglob ergibt es eine leere Liste. { } (Brace Expansion) erzeugt nur Namen, sucht aber nichts.',
      'Der Dateiname "mein bericht.txt" braucht Anführungszeichen. Ohne sie sind es zwei Namen und ls scheitert mit Exit-Code 2. Eine for-Schleife über *.txt liefert jeden Namen als Ganzes.',
      'find proj -name "*.log" -type f sucht nach Name und Typ. Das Muster steht in Anführungszeichen, damit find es auswertet und nicht die Shell. -size +1k, -mtime +7 (älter als 7 Tage) und -maxdepth 1 grenzen ein.',
      'find -exec basename {} \\; führt den Befehl für jeden Treffer aus. find -print0 | xargs -0 cat ist die sichere Variante für viele Treffer und für Namen mit Leerzeichen.',
      'find -delete löscht die Treffer. Zuerst dieselbe Suche ohne -delete mit -print laufen lassen und das Ergebnis lesen.',
    ],
    background: `Warum zeigt ein harter Link auf dieselben Daten? Ein Dateisystem trennt Namen (Verzeichniseinträge) von Daten (Inodes). Ein Verzeichnis ist eine Liste aus Namen und Inode-Nummern. Ein harter Link ist ein weiterer Eintrag mit derselben Nummer; ein Zähler in der Inode merkt sich, wie viele Namen es gibt. Erst bei null werden die Daten freigegeben. Dieses Prinzip nutzt das Backup-Projekt in Lektion 8: Unveränderte Dateien erscheinen in jedem Schnappschuss, belegen aber nur einmal Platz.

Warum ersetzt die Shell Muster und nicht das Programm? So müssen sich nicht alle Programme um Muster kümmern, und alle Werkzeuge verhalten sich einheitlich. Die Folge: Ein Muster, das zu viele Treffer hat, kann die Befehlszeile sprengen („Argument list too long“). Dann nimmst du find mit xargs.

Beim Löschen gilt: Ein Tippfehler in rm -rf kann ein ganzes System treffen. Typische Fallen sind eine leere Variable (rm -rf "$dir"/* wird zu rm -rf /*) und ein Leerzeichen an falscher Stelle. Schützen kannst du dich mit set -u, Anführungszeichen, der Form "\${dir:?}"/* und einer Probe mit ls oder echo vorab.`,
    terms: [
      { term: 'Inode', text: 'Datenstruktur mit Metadaten und Verweis auf die Daten einer Datei.' },
      { term: 'harter Link', text: 'Weiterer Name für dieselbe Inode; Daten bleiben, bis der letzte Name fehlt.' },
      { term: 'symbolischer Link', text: 'Verweis auf einen Pfad; kann ins Leere zeigen.' },
      { term: 'Globbing', text: 'Die Shell ersetzt Muster wie *.txt durch passende Namen.' },
      { term: 'xargs -0', text: 'Liest durch Nullzeichen getrennte Namen und ruft einen Befehl damit auf.' },
    ],
    code: { file: lab + 'tests/02-files-links.test.sh', lang: 'Bash' },
    order: ['body', 'code', 'body2'],
    output: `Test 02-files-links (Debian 13, Bash 5.2.37): 25 bestanden, 0 fehlgeschlagen
Beobachtet:
 - Harter Link: gleiche Inode, 2 Namen; nach rm a.txt bleibt hart.txt lesbar.
 - Symlink nach rm a.txt: [[ -e ]] falsch, [[ -L ]] wahr (hängt).
 - echo *.zip ohne Treffer gibt "*.zip" aus; mit nullglob eine leere Liste.
 - ls mein bericht.txt (ohne Anführungszeichen) endet mit Exit-Code 2.
 - find proj -type f -size +1k -> proj/logs/gross.log; -mtime +7 -> proj/logs/alt.log`,
    mistakes: [
      { wrong: 'rm -rf "$verzeichnis"/* mit einer Variablen, die leer sein kann.', why: 'Bei leerer Variable wird daraus rm -rf /*.', fix: '"${verzeichnis:?}" verwenden (bricht bei leerem Wert ab) und set -u setzen; vorher mit ls prüfen.' },
      { wrong: 'Das Muster beim find-Aufruf ohne Anführungszeichen schreiben: find . -name *.log.', why: 'Die Shell ersetzt *.log im aktuellen Ordner, bevor find startet; find erhält falsche oder zu viele Argumente.', fix: 'find . -name "*.log" schreiben.' },
      { wrong: 'find ... | xargs rm bei Namen mit Leerzeichen.', why: 'xargs trennt standardmäßig an Leerzeichen und löscht falsche Dateien.', fix: 'find … -print0 | xargs -0 rm oder find … -delete.' },
      { wrong: 'Einen Symlink wie eine Kopie behandeln.', why: 'Wird das Ziel gelöscht oder verschoben, zeigt der Link ins Leere; ein relativer Link bricht beim Verschieben des Links.', fix: 'Für echte Kopien cp nutzen, für zusätzliche Namen auf demselben Dateisystem ln.' },
    ],
    practice: 'Probiere jede löschende Suche zuerst aus: find … -print zeigt die Treffer, erst danach -delete. Nutze set -u in Skripten und prüfe Variablen vor rm -rf. Lege für unwiederbringliche Dateien ein Backup an (Lektion 8).',
    exercises: [
      { task: 'Lege in einem Testordner Dateien log1.txt bis log5.txt an und lösche mit einem Muster nur log2.txt und log4.txt. Probiere erst mit echo, dann mit rm.', acceptance: 'echo log[24].txt zeigt genau die zwei Namen; danach bleiben log1, log3, log5 übrig.' },
      { task: 'Grenzfall: Erzeuge eine Datei "a b.txt", eine Datei "-x.txt" und eine leere Datei. Lösche sie mit einer Methode, die bei jedem Namen funktioniert.', acceptance: 'rm -- "a b.txt" ./-x.txt; du erklärst, was -- und ./ bewirken.' },
      { task: 'Fehlerfall: Lege einen Symlink an, lösche sein Ziel und prüfe mit ls -l, test -e und test -L. Repariere ihn.', acceptance: 'ls -l zeigt den Pfeil, test -e ist falsch, test -L wahr; nach Wiederherstellen des Ziels oder ln -sf funktioniert der Link wieder.' },
    ],
    quiz: [
      { q: 'Was passiert mit einer Datei, wenn du ihren Namen löschst, aber ein harter Link auf sie existiert?',
        options: ['Die Daten bleiben erhalten und sind über den harten Link erreichbar.', 'Die Daten werden sofort gelöscht.', 'Der harte Link zeigt ins Leere.', 'Die Datei wird in den Papierkorb verschoben.'],
        correct: 0,
        rationales: ['Beide Namen verweisen auf dieselbe Inode; sie wird erst freigegeben, wenn kein Name mehr übrig ist.', 'Das würde nur ohne weiteren Namen gelten.', 'Hängende Verweise gibt es bei Symlinks, nicht bei harten Links.', 'Linux hat in der Shell keinen Papierkorb.'],
        explain: 'Ein harter Link ist ein gleichberechtigter zweiter Name für dieselben Daten.' },
      { q: 'Wer ersetzt das Muster *.txt in dem Befehl ls *.txt?',
        options: ['Die Shell, bevor ls startet.', 'Das Programm ls.', 'Das Betriebssystem beim Lesen der Platte.', 'Der Compiler.'],
        correct: 0,
        rationales: ['Die Shell übergibt ls die fertige Liste von Namen.', 'ls sieht nur die ersetzten Namen.', 'Das Dateisystem kennt keine Muster.', 'Es gibt keinen Compiler im Spiel.'],
        explain: 'Globbing ist Sache der Shell; deshalb braucht find sein Muster in Anführungszeichen.' },
      { q: 'Wie verarbeitest du Treffer mit Leerzeichen im Namen sicher mit xargs?',
        options: ['find … -print0 | xargs -0 befehl', 'find … | xargs befehl', 'find … | cat | xargs befehl', 'Leerzeichen sind in Dateinamen nicht erlaubt.'],
        correct: 0,
        rationales: ['Das Nullzeichen kommt in Dateinamen nie vor und trennt eindeutig.', 'Hier würde an Leerzeichen getrennt.', 'cat ändert die Trennung nicht.', 'Sie sind erlaubt.'],
        explain: '-print0 und -0 ersetzen die unsichere Trennung durch das Nullzeichen.' },
    ],
    sources: [
      bash,
      coreutils,
      docs('GNU findutils Manual', 'https://www.gnu.org/software/findutils/manual/find.html', 'Referenz zu find und xargs: Tests, Aktionen, -print0.'),
      man7('Linux man-pages: path_resolution(7) – Pfadauflösung und Links', 'man7/path_resolution.7.html'),
    ],
    verification: 'Lab shell-lab: Alle 25 Prüfungen von 02-files-links.test.sh liefen im Container debian:trixie-slim (GNU coreutils, findutils) grün. Nicht geprüft: BSD- und macOS-Varianten von cp, find und stat (andere Optionen), Dateisysteme ohne harte Links und sehr lange Argumentlisten.',
  },
  {
    id: 'lx-m1-l3', title: 'Benutzer, Gruppen, Rechte, umask und sudo', minutes: 45,
    prerequisites: 'Lektionen „Die Shell und das Dateisystem“ und „Dateien, Links, Muster und find“.',
    objectives: [
      'Die Rechteanzeige von ls -l (z. B. -rw-r-----) lesen und in Zahlen (640) übersetzen',
      'Rechte mit chmod (symbolisch und numerisch) und Besitzer mit chown verstehen',
      'Erklären, was r, w und x bei Verzeichnissen bedeuten und wie umask Standardrechte bestimmt',
      'Das Prinzip der geringsten Rechte erläutern und sudo sinnvoll einordnen',
    ],
    simple: `Jede Datei gehört einem Benutzer und einer Gruppe. Dazu kommen drei Rechte, die jeweils für drei Gruppen gelten: Besitzer (u), Gruppe (g) und alle anderen (o). Die Rechte sind r (lesen), w (schreiben) und x (ausführen). ls -l zeigt das als Zeichenkette: -rw-r----- heißt: normale Datei, Besitzer darf lesen und schreiben, die Gruppe lesen, andere nichts. Als Zahl rechnet man r=4, w=2, x=1 und addiert pro Gruppe: rw- = 6, r-- = 4, --- = 0, zusammen 640.

Bei Verzeichnissen heißen die Rechte etwas anderes. r erlaubt, die Namen aufzulisten. x erlaubt, hineinzuwechseln und auf Dateien darin zuzugreifen, wenn man ihren Namen kennt. w erlaubt, Namen anzulegen und zu löschen. Ein Verzeichnis ohne x ist praktisch gesperrt, auch wenn man es lesen darf.

Neue Dateien bekommen nicht jedes Recht. Die umask zieht Rechte ab: Bei umask 022 entsteht eine Datei mit 644 und ein Verzeichnis mit 755; bei umask 077 sind es 600 und 700 (nur der Besitzer). Die Standard-umask ist eine wichtige Sicherheitseinstellung.

root, der Benutzer mit der ID 0, darf fast alles. Deshalb arbeitet man als normaler Benutzer und holt sich Rechte nur für einzelne Befehle mit sudo. Das ist das Prinzip der geringsten Rechte. Dienste laufen unter eigenen Benutzern ohne Anmeldung und mit möglichst wenigen Rechten.`,
    steps: [
      'id zeigt Benutzer-ID, Gruppen-ID und Gruppen. whoami zeigt den Namen. Eine Benutzer-ID ungleich 0 bedeutet: kein root. Der Test bricht ab, wenn er als root läuft, weil root fast alle Rechteprüfungen umgeht.',
      'Mit umask 022 entsteht eine Datei mit -rw-r--r-- (644) und ein Verzeichnis mit drwxr-xr-x (755). stat -c %A zeigt die Textform, stat -c %a die Zahl.',
      'chmod 640 setzt absolut. chmod u+x,g-r,o+r ändert einzelne Rechte relativ. Beides führt zum gleichen Ergebnis; Zahlen sind kurz, die symbolische Form sagt, was sich ändert.',
      'Mit chmod 000 verliert sogar der Besitzer das Leserecht: cat meldet „Permission denied“ (Exit-Code 1). Als Besitzer kann man die Rechte aber wieder setzen, ohne root zu sein.',
      'Verzeichnisse: Mit r ohne x lässt sich der Inhalt nicht betreten (cd scheitert). Mit x ohne r lässt sich eine bekannte Datei lesen, das Auflisten scheitert (ls: Exit-Code 2).',
      'umask 077 liefert 600/700, umask 002 liefert 664 (die Gruppe darf mitschreiben, z. B. in Arbeitsgruppen).',
      'Ein echtes Beispiel: /etc/shadow hat 640 root:shadow, ein normaler Benutzer kann es nicht lesen. /etc/passwd ist 644 und enthält keine Passwörter. /tmp hat 1777: Das Sticky-Bit (die 1) erlaubt jedem anzulegen, aber nur dem Besitzer zu löschen.',
      'Ausführbar machen: Ohne x-Recht liefert ./skript.sh Exit-Code 126. bash skript.sh geht trotzdem, weil Bash die Datei nur liest. chown auf einen anderen Benutzer ist nur root erlaubt (Operation not permitted). sudo ist im Container nicht installiert; die Beschreibung unten ist Theorie und wurde nicht ausgeführt.',
    ],
    background: `Warum Zahlen und Buchstaben? Die Zahlen sind Bitmasken: Drei Bits pro Gruppe, die man als Ziffer von 0 bis 7 schreibt. Die Buchstaben sind für Menschen gedacht. Beide sind gleichwertig; in der Praxis lesen die meisten ls -l und schreiben chmod mit Zahlen.

Wie arbeitet sudo? Es führt einen Befehl mit den Rechten eines anderen Benutzers aus (meist root), wenn die Konfiguration das erlaubt. Die Regeln stehen in /etc/sudoers und werden mit visudo bearbeitet, das die Syntax prüft. Gut ist: Nur einzelne Befehle laufen mit hohen Rechten, und es bleibt eine Spur im Protokoll. Schlecht ist: Wer sudo für jeden Befehl voranstellt oder uneingeschränkte Rechte ohne Passwort vergibt, hat das Prinzip ausgehebelt. Aussagen zu sudoers-Details und zur Protokollierung wurden hier nicht im Container geprüft.

Setuid-Programme laufen mit den Rechten ihres Besitzers (z. B. root), egal wer sie startet. Sie sind nötig (etwa für passwd), aber ein beliebtes Ziel von Angreifern. Jedes unnötige setuid-Programm ist ein Risiko, und Skripte sollten nie setuid sein. Wer ein Linux-System absichert, prüft deshalb auch beschreibbare Verzeichnisse, setuid-Dateien und Dienste, die als root laufen.`,
    terms: [
      { term: 'rwx', text: 'Lesen (4), Schreiben (2), Ausführen (1).' },
      { term: 'umask', text: 'Rechte, die neuen Dateien und Verzeichnissen abgezogen werden.' },
      { term: 'root', text: 'Benutzer mit der ID 0 und fast unbeschränkten Rechten.' },
      { term: 'sudo', text: 'Führt einen einzelnen Befehl mit anderen (meist höheren) Rechten aus.' },
      { term: 'Sticky-Bit', text: 'Bei Verzeichnissen wie /tmp: Nur der Besitzer einer Datei darf sie löschen.' },
    ],
    code: { file: lab + 'tests/03-permissions.test.sh', lang: 'Bash' },
    order: ['body', 'code', 'body2'],
    output: `umask -> 0022
ls -l f -> -rw-r--r-- 1 lernen lernen 1 DATUM f ;  nach chmod 640: stat -> 640 -rw-r-----
cat /etc/shadow -> cat: /etc/shadow: Permission denied   (Exit-Code 1)
ls -l /etc/passwd /etc/shadow:
 -rw-r--r-- 1 root root   882 DATUM /etc/passwd
 -rw-r----- 1 root shadow 502 DATUM /etc/shadow
id -> uid=1000(lernen) gid=1000(lernen) groups=1000(lernen)
Test 03-permissions: 25 bestanden, 0 fehlgeschlagen (als normaler Benutzer im Container)`,
    mistakes: [
      { wrong: 'chmod 777 setzen, weil „es sonst nicht geht“.', why: 'Jeder Benutzer und jeder Dienst darf dann schreiben und ausführen; das öffnet Sicherheitslücken und verdeckt die eigentliche Ursache.', fix: 'Ursache klären (falscher Besitzer? fehlendes x bei Verzeichnis?) und nur das nötige Recht gewähren.' },
      { wrong: 'Alle Befehle als root ausführen.', why: 'Ein Tippfehler oder ein Angriff wirkt mit voller Macht.', fix: 'Als normaler Benutzer arbeiten und nur einzelne Befehle mit sudo ausführen.' },
      { wrong: 'Geheime Dateien (Schlüssel, Zugangsdaten) mit 644 ablegen.', why: 'Andere Benutzer des Systems können sie lesen; OpenSSH verweigert private Schlüssel mit zu offenen Rechten.', fix: 'chmod 600 für Dateien, chmod 700 für Ordner; Standard-umask 027 oder 077 setzen.' },
      { wrong: 'Bei Verzeichnissen nur r vergeben und wundern, dass cd scheitert.', why: 'Zum Betreten braucht man x, nicht r.', fix: 'Verzeichnisse mit 755 oder 750 anlegen; x für den Zugriff, r für das Auflisten.' },
    ],
    practice: 'Lege Dateien mit Geheimnissen immer mit 600 an (am besten mit umask 077 vor dem Anlegen, damit sie nie kurz offen sind). Prüfe mit ls -l und stat, wer was darf, und arbeite als normaler Benutzer; sudo nur bei Bedarf.',
    exercises: [
      { task: 'Lege eine Datei an, setze sie auf 640 und dann mit der symbolischen Form auf -rwx---r-- . Schreibe beide chmod-Aufrufe auf.', acceptance: 'chmod 640 datei und chmod u+x,g-r,o+r datei; stat zeigt zuletzt -rwx---r--.' },
      { task: 'Grenzfall: Setze auf einem Ordner nur r (444), dann nur x (111). Probiere jeweils cd, ls und cat auf eine bekannte Datei darin.', acceptance: 'Mit 444: cd scheitert; mit 111: cat einer bekannten Datei geht, ls scheitert. Du erklärst die Rolle von r und x bei Verzeichnissen.' },
      { task: 'Fehlerfall: Lies als normaler Benutzer /etc/shadow und lege dann eine Datei mit umask 077 an. Vergleiche die Ergebnisse.', acceptance: 'cat meldet Permission denied; die neue Datei hat 600. Du begründest, warum Passwörter nicht in /etc/passwd stehen.' },
    ],
    quiz: [
      { q: 'Welche Rechte entsprechen der Zahl 640?',
        options: ['Besitzer lesen und schreiben, Gruppe lesen, andere nichts', 'Besitzer alles, Gruppe nichts, andere lesen', 'Alle dürfen lesen und schreiben', 'Nur der Besitzer darf ausführen'],
        correct: 0,
        rationales: ['6 = rw-, 4 = r--, 0 = ---.', '6 und 4 sind nicht „alles“.', 'Das wäre 666.', 'x ist hier für niemanden gesetzt.'],
        explain: 'Die Ziffern stehen für Besitzer, Gruppe und andere; r=4, w=2, x=1.' },
      { q: 'Was bewirkt das x-Recht bei einem Verzeichnis?',
        options: ['Man darf hineinwechseln und auf Dateien darin zugreifen.', 'Man darf es kopieren.', 'Man darf es auflisten.', 'Es lässt sich ausführen wie ein Programm.'],
        correct: 0,
        rationales: ['Ohne x ist das Verzeichnis praktisch gesperrt, selbst mit r.', 'Kopieren hängt vom Lesen und Schreiben ab.', 'Das Auflisten erlaubt r.', 'Verzeichnisse lassen sich nicht ausführen.'],
        explain: 'x heißt bei Verzeichnissen „durchlaufen“, r heißt „Namen auflisten“.' },
      { q: 'Welche umask führt dazu, dass neue Dateien 600 und neue Verzeichnisse 700 bekommen?',
        options: ['077', '022', '002', '700'],
        correct: 0,
        rationales: ['077 zieht alles für Gruppe und andere ab.', '022 ergibt 644 und 755.', '002 ergibt 664 und 775.', '700 ist keine übliche umask.'],
        explain: 'Die umask ist eine Maske der abzuziehenden Rechte.' },
    ],
    sources: [
      man7('Linux man-pages: credentials(7) – Benutzer, Gruppen, Prozessrechte', 'man7/credentials.7.html'),
      docs('GNU Coreutils: chmod, chown, umask', 'https://www.gnu.org/software/coreutils/manual/html_node/chmod-invocation.html', 'Beschreibt Numerik und symbolische Modi.'),
      man7('Linux man-pages: inode(7) – Dateityp und Modus', 'man7/inode.7.html'),
      docs('sudo – Handbuch', 'https://www.sudo.ws/docs/man/sudo.man/', 'Beschreibung von sudo; in diesem Lab nicht ausgeführt.'),
    ],
    verification: 'Lab shell-lab: Alle 25 Prüfungen von 03-permissions.test.sh liefen im Container debian:trixie-slim als normaler Benutzer (UID 1000) grün. sudo, chown auf andere Benutzer und setuid-Programme wurden nicht ausgeführt (sudo ist im Image nicht installiert); die Aussagen dazu stammen aus der Dokumentation. Als root laufen die Rechteprüfungen anders.',
  },
  {
    id: 'lx-m1-l4', title: 'Pipes, Umleitungen und Textwerkzeuge: grep, sed, awk, sort, uniq', minutes: 50,
    prerequisites: 'Lektionen 1 bis 3 dieses Moduls.',
    objectives: [
      'Programme mit Pipes verbinden und Ausgaben mit >, >>, 2> und 2>&1 umleiten',
      'Mit grep, sed, awk, cut, tr, sort und uniq Text filtern und zusammenfassen',
      'Exit-Codes lesen und mit && und || verknüpfen; die Rolle von pipefail erklären',
      'Aus einem Zugriffsprotokoll Kennzahlen gewinnen (Statuscodes, häufigste Adressen, Fehler)',
    ],
    simple: `Die Kernidee von Linux: viele kleine Programme, die Text lesen und Text schreiben, und eine Möglichkeit, sie zu verbinden. Jedes Programm hat drei Kanäle: Eingabe (stdin, Nr. 0), Ausgabe (stdout, Nr. 1) und Fehlerausgabe (stderr, Nr. 2). Die Pipe | verbindet die Ausgabe des einen mit der Eingabe des nächsten. Mit > schreibst du in eine Datei (überschreibt), mit >> hängst du an, mit 2> fängst du Fehlermeldungen getrennt ab, mit 2>&1 legst du Fehler auf denselben Kanal wie die Ausgabe.

Die wichtigsten Textwerkzeuge: grep sucht Zeilen (mit -c zählen, -v umkehren, -o nur Treffer, -E erweiterte Muster, -F wörtlich). cut schneidet Spalten, tr tauscht Zeichen, sort sortiert, uniq -c zählt aufeinanderfolgende gleiche Zeilen (deshalb immer erst sort). sed ersetzt Text mit s/alt/neu/. awk arbeitet mit Spalten und kann rechnen: awk '{print $1}' gibt die erste Spalte aus, awk '{sum += $10} END {print sum}' summiert.

Jedes Programm liefert einen Exit-Code: 0 heißt Erfolg, alles andere Fehler. grep gibt 0 zurück, wenn etwas gefunden wurde, 1 wenn nicht, 2 bei einem Fehler. Mit && führst du den nächsten Befehl nur bei Erfolg aus, mit || nur bei Misserfolg. Standardmäßig zählt bei einer Pipe nur der Exit-Code des letzten Befehls; mit set -o pipefail zählt der erste Fehler.

In dieser Lektion arbeitest du mit einem kleinen, selbst erzeugten Zugriffsprotokoll (16 Zeilen, Adressen aus den für Dokumentation reservierten Bereichen). Die Fragen sind echte: Wer greift am häufigsten zu? Wie viele Fehler gab es? Wer hat sich mehrfach vergeblich angemeldet?`,
    steps: [
      'wc -l zählt Zeilen, head -n 2 | cut -d" " -f1 nimmt die ersten zwei Zeilen und die erste Spalte (Trennzeichen Leerzeichen).',
      'awk "{print $1}" log | sort | uniq -c | sort -rn zeigt die häufigsten Adressen: Zuerst alle Adressen holen, sortieren (damit gleiche nebeneinander stehen), zählen, absteigend nach Zahl sortieren.',
      'Ohne sort fasst uniq nur direkt aufeinanderfolgende Zeilen zusammen: Im Beispiel entstehen 7 statt 4 Gruppen. sort -u liefert die verschiedenen Werte.',
      'awk wählt Spalten und rechnet: $9 ist der Statuscode, awk "$9 >= 400" findet Fehlerzeilen (6), die Summe der Bytes in der letzten Spalte ist 7346.',
      'grep -c zählt Treffer, grep -v kehrt um, grep -o gibt nur den Treffer aus, grep -F sucht Text wörtlich. Mehrere grep hintereinander wirken als „und“.',
      'sed -E "s/^([0-9.]+) .*/\\1/" ersetzt mit Gruppen; \\1 bis \\4 greifen auf die Klammern zu. Damit lässt sich zum Beispiel die letzte Stelle einer IP-Adresse unkenntlich machen (203.0.113.x).',
      'Umleitungen: > überschreibt, >> hängt an, 2> fängt Fehler. > datei 2>&1 sendet beide Kanäle in die Datei; 2>&1 > datei sendet nur stdout in die Datei und die Fehler weiter in die Pipe (Reihenfolge zählt).',
      'Exit-Codes: grep -q liefert 0 (gefunden), 1 (nicht gefunden), 2 (Fehler, z. B. Datei fehlt). false | true ergibt 0, mit set -o pipefail ergibt es 1.',
    ],
    background: `Warum funktioniert das? Weil Unix-Programme eine einfache, einheitliche Schnittstelle haben: Zeilen Text auf stdin und stdout. Wer sich daran hält, lässt sich mit allen anderen kombinieren. Die Pipe nutzt einen Puffer im Kernel: Der erste Prozess schreibt, der zweite liest, beide laufen gleichzeitig. Ist der Puffer voll, wird der Schreiber angehalten, ist er leer, der Leser; so braucht eine Pipe wenig Speicher, auch bei riesigen Daten.

Ein oft übersehener Punkt ist SIGPIPE: Schließt der Leser früher (zum Beispiel head -n 1), bekommt der Schreiber das Signal SIGPIPE und endet mit Exit-Code 141. Mit set -o pipefail meldet die Pipe dann einen Fehler, obwohl alles richtig lief. Lektion 5 zeigt, wie man das in Skripten umgeht.

Grenzen der Werkzeuge: awk, sed und grep sind für Zeilen mit Muster gemacht. Verschachtelte Formate wie JSON, XML oder CSV mit Anführungszeichen und Zeilenumbrüchen sollte man mit passenden Werkzeugen lesen (zum Beispiel jq für JSON), nicht mit regulären Ausdrücken. Außerdem unterscheiden sich GNU- und BSD-Versionen (macOS) bei Optionen; dieses Lab wurde nur mit GNU-Werkzeugen geprüft.`,
    terms: [
      { term: 'stdin / stdout / stderr', text: 'Eingabe-, Ausgabe- und Fehlerkanal (0, 1, 2).' },
      { term: 'Pipe |', text: 'Verbindet die Ausgabe eines Programms mit der Eingabe des nächsten.' },
      { term: 'Umleitung', text: '>, >>, 2> und 2>&1 lenken Kanäle in Dateien oder zusammen.' },
      { term: 'Exit-Code', text: '0 = Erfolg; bei grep zusätzlich 1 = nichts gefunden, 2 = Fehler.' },
      { term: 'pipefail', text: 'Option, bei der eine Pipe den ersten Fehlercode meldet statt des letzten.' },
    ],
    code: { file: lab + 'tests/04-pipelines.test.sh', lang: 'Bash' },
    code2: { file: lab + 'data/access.log', lang: 'Text (Beispieldaten)' },
    order: ['body', 'code', 'code2', 'body2'],
    output: `Häufigste Adressen (awk '{print $1}' | sort | uniq -c | sort -rn | head -3):
       5 198.51.100.7
       4 203.0.113.5
       4 192.0.2.44
Statuscodes: 200=7 201=1 204=1 304=1 401=3 404=2 500=1   (zusammen 16 Zeilen)
Fehlerzeilen (Status >= 400): 6 ; Summe der Bytes: 7346
grep -q gefunden/nicht gefunden/Datei fehlt -> Exit-Codes 0 / 1 / 2
false | true -> 0 ;  mit pipefail -> 1
Test 04-pipelines: 28 bestanden, 0 fehlgeschlagen (Debian 13, GNU awk/sed/grep)`,
    mistakes: [
      { wrong: 'uniq -c ohne vorheriges sort.', why: 'uniq zählt nur aufeinanderfolgende gleiche Zeilen; das Ergebnis ist unvollständig (7 statt 4 Gruppen im Beispiel).', fix: 'Immer sort | uniq -c verwenden (oder sort -u).' },
      { wrong: 'cmd > datei 2>&1 und cmd 2>&1 > datei für gleichwertig halten.', why: 'Umleitungen werden von links nach rechts ausgewertet; im zweiten Fall zeigt stderr noch auf den alten stdout.', fix: 'Erst > datei, dann 2>&1.' },
      { wrong: 'Zeilen mit grep zählen und das Ergebnis ungeprüft als Zahl verwenden, wenn grep auch Fehler liefern kann.', why: 'grep -c liefert bei Fehlern (Datei fehlt) eine leere Ausgabe und Exit-Code 2.', fix: 'Exit-Code prüfen oder set -e/pipefail nutzen und Fehlermeldungen nicht unterdrücken.' },
      { wrong: 'Ein CSV mit Anführungszeichen oder JSON mit cut und grep zerlegen.', why: 'Kommas in Feldern, Zeilenumbrüche in Werten und Verschachtelung zerstören das Muster.', fix: 'Passendes Werkzeug (zum Beispiel jq für JSON) oder eine Programmiersprache nutzen.' },
    ],
    practice: 'Beginne bei jeder Auswertung mit der Frage und baue die Pipe Schritt für Schritt auf: erst eine Stufe ausführen, Ausgabe ansehen, dann die nächste ergänzen. Setze Pipelines in Skripten mit set -o pipefail und prüfe die Exit-Codes.',
    exercises: [
      { task: 'Finde im Beispielprotokoll die drei häufigsten angefragten Pfade (Spalte 7) mit Anzahl.', acceptance: 'awk "{print $7}" data/access.log | sort | uniq -c | sort -rn | head -3 liefert /login (4), /index.html (4) und /api/tasks (3); bei Gleichstand steht /login vor /index.html, weil sort -r auch die Namen absteigend ordnet. Du erklärst jeden Schritt.' },
      { task: 'Grenzfall: Zähle die Zeilen mit Status 401 und die davon betroffenen Adressen. Was liefert dein Befehl für eine leere Datei?', acceptance: 'Drei Zeilen, eine Adresse (198.51.100.7); für eine leere Datei 0 bzw. keine Ausgabe, ohne Fehler.' },
      { task: 'Fehlerfall: Rufe grep -q Muster /gibt-es-nicht auf und lies den Exit-Code. Welche Unterschiede gibt es zu „nicht gefunden“?', acceptance: 'Exit-Code 2 mit Fehlermeldung statt 1; du erklärst, warum Skripte beide Fälle trennen müssen.' },
    ],
    quiz: [
      { q: 'Warum muss vor uniq -c normalerweise sort stehen?',
        options: ['uniq fasst nur direkt aufeinanderfolgende gleiche Zeilen zusammen.', 'sort macht uniq schneller.', 'uniq funktioniert nur mit Zahlen.', 'Ohne sort stürzt uniq ab.'],
        correct: 0,
        rationales: ['Nur wenn gleiche Zeilen nebeneinander stehen, werden sie gezählt.', 'Es geht um Korrektheit, nicht um Geschwindigkeit.', 'uniq arbeitet mit beliebigem Text.', 'Es gibt keinen Absturz, nur falsche Zählung.'],
        explain: 'sort bringt gleiche Zeilen zusammen; ohne sort stimmt die Zählung nicht.' },
      { q: 'Was bewirkt 2>&1 hinter einer Umleitung > datei?',
        options: ['Fehlermeldungen landen ebenfalls in der Datei.', 'Die Datei wird zweimal geschrieben.', 'Die Fehlermeldungen werden gelöscht.', 'Die Ausgabe wird in die Pipe umgeleitet.'],
        correct: 0,
        rationales: ['stderr wird auf das Ziel von stdout gelegt, das zu diesem Zeitpunkt die Datei ist.', 'Es entsteht nur eine Datei.', 'Dazu wäre 2>/dev/null nötig.', 'Die Pipe kommt in dieser Form nicht vor.'],
        explain: 'Umleitungen werden von links nach rechts ausgewertet; Reihenfolge ist entscheidend.' },
      { q: 'Welchen Exit-Code liefert grep -q Muster datei, wenn das Muster nicht gefunden wird?',
        options: ['1', '0', '2', '127'],
        correct: 0,
        rationales: ['1 bedeutet „nichts gefunden“.', '0 bedeutet „gefunden“.', '2 steht für einen Fehler, zum Beispiel eine fehlende Datei.', '127 ist „Befehl nicht gefunden“.'],
        explain: 'Bei grep: 0 gefunden, 1 nicht gefunden, 2 Fehler.' },
    ],
    sources: [
      coreutils,
      docs('GNU Grep Manual', 'https://www.gnu.org/software/grep/manual/grep.html', 'Optionen und reguläre Ausdrücke von grep.'),
      docs('GNU Awk User’s Guide', 'https://www.gnu.org/software/gawk/manual/gawk.html', 'Ausführliche Einführung in awk.'),
      man7('Linux man-pages: pipe(7) – Pipes und FIFOs', 'man7/pipe.7.html'),
    ],
    verification: 'Lab shell-lab: Alle 28 Prüfungen von 04-pipelines.test.sh liefen im Container debian:trixie-slim (GNU grep, awk, sed, coreutils) grün; die Beispieldaten sind selbst erzeugt (Dokumentationsadressen). Nicht geprüft: BSD/macOS-Varianten, mawk statt gawk und lokale Zeichensätze außer C (der Test setzt LC_ALL=C).',
  },
];
