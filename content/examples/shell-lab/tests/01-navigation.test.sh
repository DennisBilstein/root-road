#!/usr/bin/env bash
# Lektion 1: Verzeichnisbaum, Pfade, Befehlsarten, $PATH und Anführungszeichen.
source "$(dirname "$0")/lib.sh"
export LC_ALL=C   # feste Sortierung, damit die Ausgabe überall gleich ist
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

# --- Pfade: absolut beginnt mit /, relativ ab dem aktuellen Verzeichnis --------------------
mkdir -p "$work/projekt/src" "$work/projekt/docs"
cd "$work/projekt" || exit 1
assert_eq "$(basename "$PWD")" "projekt" "cd wechselt das Verzeichnis, $PWD merkt es sich"
assert_eq "$(cd src && basename "$PWD")" "src" "relativer Pfad: src"
assert_eq "$(cd "$work/projekt/docs" && pwd)" "$work/projekt/docs" "absoluter Pfad"
assert_eq "$(cd src/../docs && basename "$PWD")" "docs" ".. geht eine Ebene nach oben"

touch src/main.sh .versteckt
assert_eq "$(ls)" $'docs\nsrc' "ls zeigt Dateien mit Punkt am Anfang nicht"
assert_eq "$(ls -A)" $'.versteckt\ndocs\nsrc' "ls -A zeigt sie, aber ohne . und .."

# --- Das Verzeichnisschema (FHS): feste Orte für feste Aufgaben ----------------------------
for dir in /etc /usr/bin /var/log /tmp /home /proc /dev; do
  [[ -d "$dir" ]] && ok=ja || ok=nein
  assert_eq "$ok" "ja" "Verzeichnis $dir existiert"
done
assert_contains "$(</etc/os-release)" "ID=debian" "/etc/os-release nennt die Distribution"

# --- Welche Art Befehl ist das? type -t unterscheidet ---------------------------------------
meine_funktion() { :; }
assert_eq "$(type -t cd)" "builtin" "cd ist in die Shell eingebaut"
assert_eq "$(type -t if)" "keyword" "if ist ein Schlüsselwort"
assert_eq "$(type -t meine_funktion)" "function" "selbst definierte Funktion"
assert_eq "$(type -t ls)" "file" "ls ist ein eigenes Programm (im PATH)"
assert_contains "$(command -v ls)" "/ls" "command -v zeigt den Fundort"

# --- $PATH: die Shell sucht von links nach rechts ----------------------------------------
mkdir "$work/bin"
printf '#!/usr/bin/env bash\necho "Hallo aus dem Skript"\n' > "$work/bin/hallo"
chmod +x "$work/bin/hallo"
bash -c 'hallo' 2>/dev/null; assert_status 127 "$?" "ohne PATH-Eintrag: Befehl nicht gefunden"
assert_eq "$(PATH="$work/bin:$PATH" hallo)" "Hallo aus dem Skript" "mit Verzeichnis im PATH läuft das Skript"
"$work/bin/hallo" >/dev/null; assert_status 0 "$?" "ein voller Pfad braucht keinen PATH"

# --- Anführungszeichen: Leerzeichen trennen Wörter, Zeichen in '' bleiben wörtlich -----------
count() { echo "$#"; }
name="Ada Lovelace"
# shellcheck disable=SC2086  # absichtlich ohne Anführungszeichen, um das Aufspalten zu zeigen
assert_eq "$(count $name)" "2" "ohne Anführungszeichen wird am Leerzeichen getrennt"
assert_eq "$(count "$name")" "1" "mit Anführungszeichen bleibt es ein Wert"
# shellcheck disable=SC2016  # absichtlich einfache Anführungszeichen, damit $HOME nicht ersetzt wird
# shellcheck disable=SC2116  # das echo ist hier der Gegenstand der Prüfung
assert_eq "$(echo '$HOME')" '$HOME' "einfache Anführungszeichen ersetzen nichts"
assert_eq "$(HOME=/h; echo "$HOME")" "/h" "doppelte Anführungszeichen ersetzen Variablen"

report
