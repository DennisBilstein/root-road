#!/usr/bin/env bash
# Lektion 3: Benutzer, Gruppen, Rechte (rwx), umask und ausführbare Dateien. Muss als normaler Benutzer laufen.
source "$(dirname "$0")/lib.sh"
export LC_ALL=C
if [[ "$EUID" -eq 0 ]]; then echo "Bitte als normaler Benutzer starten (root umgeht fast alle Rechteprüfungen)."; exit 2; fi
work=$(mktemp -d)
trap 'chmod -R u+rwx "$work" 2>/dev/null; rm -rf "$work"' EXIT
cd "$work" || exit 1

# --- Wer bin ich? ------------------------------------------------------------------------
assert_eq "$(id -un)" "$(whoami)" "id -un und whoami nennen denselben Benutzer"
[[ "$(id -u)" -ne 0 ]] && normal=ja || normal=nein
assert_eq "$normal" "ja" "die Benutzer-ID ist nicht 0 (kein root)"
assert_contains "$(id -Gn)" "$(id -gn)" "die Hauptgruppe gehört zu den Gruppen des Benutzers"

# --- Rechte lesen: -rw-r--r-- = Besitzer, Gruppe, Andere --------------------------------------
umask 022
printf 'geheim\n' > datei.txt
assert_eq "$(stat -c '%A' datei.txt)" "-rw-r--r--" "umask 022: neue Datei ist 644 (rw-r--r--)"
mkdir ordner
assert_eq "$(stat -c '%A' ordner)" "drwxr-xr-x" "umask 022: neues Verzeichnis ist 755 (rwxr-xr-x)"
assert_eq "$(stat -c '%a' datei.txt)" "644" "stat -c %a zeigt die Zahlenform"

chmod 640 datei.txt
assert_eq "$(stat -c '%A' datei.txt)" "-rw-r-----" "chmod 640: Andere haben keinen Zugriff"
chmod u+x,g-r,o+r datei.txt
assert_eq "$(stat -c '%A' datei.txt)" "-rwx---r--" "symbolisch: u+x, g-r, o+r"
chmod 000 datei.txt
cat datei.txt 2>fehler.txt; status=$?
assert_status 1 "$status" "ohne Leserecht scheitert cat sogar beim Besitzer"
assert_contains "$(<fehler.txt)" "Permission denied" "die Meldung lautet 'Permission denied'"

# --- Verzeichnisse: r = Namen auflisten, x = hineingehen/Dateien erreichen -------------------
mkdir -p nur-lesen nur-x
printf 'a\n' > nur-lesen/a.txt
printf 'b\n' > nur-x/b.txt
chmod 444 nur-lesen   # r ohne x
chmod 111 nur-x       # x ohne r
(cd nur-lesen 2>/dev/null || exit 1); assert_status 1 "$?" "r ohne x: Hineinwechseln scheitert"
assert_eq "$(cat nur-x/b.txt)" "b" "x ohne r: eine bekannte Datei ist erreichbar"
ls nur-x >/dev/null 2>&1; assert_status 2 "$?" "x ohne r: Auflisten scheitert"

# --- umask: Rechte, die neuen Dateien abgezogen werden -----------------------------------------
assert_eq "$(umask 077; touch u1; stat -c %a u1)" "600" "umask 077: neue Datei 600 (nur Besitzer)"
assert_eq "$(umask 077; mkdir u2; stat -c %a u2)" "700" "umask 077: neues Verzeichnis 700"
assert_eq "$(umask 002; touch u3; stat -c %a u3)" "664" "umask 002: Gruppe darf mitschreiben (664)"

# --- Ein echtes Beispiel: Passwörter liegen in /etc/shadow, nicht lesbar für Normale -------------
assert_eq "$(stat -c '%a %U:%G' /etc/shadow)" "640 root:shadow" "/etc/shadow gehört root:shadow, Rechte 640"
cat /etc/shadow >/dev/null 2>&1; assert_status 1 "$?" "als normaler Benutzer ist /etc/shadow nicht lesbar"
assert_eq "$(stat -c %a /etc/passwd)" "644" "/etc/passwd ist für alle lesbar (enthält keine Passwörter)"
assert_eq "$(stat -c %a /tmp)" "1777" "/tmp hat das Sticky-Bit: jeder darf anlegen, nur der Besitzer löschen"

# --- Ausführbar machen ---------------------------------------------------------------------
printf '#!/usr/bin/env bash\necho laeuft\n' > skript.sh
./skript.sh >/dev/null 2>&1; assert_status 126 "$?" "ohne x-Recht: Exit-Code 126 (nicht ausführbar)"
assert_eq "$(bash skript.sh)" "laeuft" "bash skript.sh geht auch ohne x-Recht"
chmod +x skript.sh
assert_eq "$(./skript.sh)" "laeuft" "mit x-Recht startet ./skript.sh direkt"

# --- Besitzer ändern darf nur root -----------------------------------------------------------
chown root datei.txt 2>/dev/null; assert_status 1 "$?" "chown auf root: 'Operation not permitted' ohne root"
assert_eq "$(command -v sudo || echo fehlt)" "fehlt" "sudo ist in diesem Container nicht installiert (nicht ausgeführt)"

report
