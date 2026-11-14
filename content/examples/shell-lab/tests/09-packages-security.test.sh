#!/usr/bin/env bash
# Lektion 8 (Modul 2, Lektion 4): Pakete, Logs und Skript-Sicherheit. ShellCheck prüft alle Lab-Skripte.
source "$(dirname "$0")/lib.sh"
export LC_ALL=C
root="$(cd "$(dirname "$0")/.." && pwd)"
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
cd "$work" || exit 1

# --- Pakete: welches Paket liefert eine Datei, welche Version ist installiert? --------------------
assert_contains "$(dpkg -S /usr/bin/ls 2>/dev/null)" "coreutils" "dpkg -S: ls gehört zum Paket coreutils"
assert_eq "$(dpkg-query -W -f='${Status}' coreutils)" "install ok installed" "dpkg-query: Status des Pakets"
[[ -n "$(dpkg-query -W -f='${Version}' coreutils)" ]] && hat=ja || hat=nein
assert_eq "$hat" "ja" "dpkg-query nennt die Version"
assert_eq "$(dpkg-query -W -f='${Status}' gibt-es-nicht 2>/dev/null || echo unbekannt)" "unbekannt" "unbekanntes Paket: Fehler statt Ausgabe"

# --- Logs: typische Fragen an eine Logdatei ----------------------------------------------------------
log="$root/data/access.log"
assert_eq "$(grep -c ' 500 ' "$log")" "1" "wie viele Serverfehler?"
assert_eq "$(awk '$9 == 401 {print $1}' "$log" | sort -u)" "198.51.100.7" "welche Adresse hat sich dreimal vergeblich angemeldet?"
assert_eq "$(grep -cE '10:0[0-2]:' "$log")" "14" "Zeitraum mit Muster eingrenzen (10:00 bis 10:02)"
assert_eq "$(tail -n 1 "$log" | awk '{print $9}')" "304" "tail -n 1: neuester Eintrag"
printf 'Zeile\n' > rotiert.log; gzip -k rotiert.log
assert_eq "$(zcat rotiert.log.gz)" "Zeile" "zcat liest gepackte (rotierte) Logs"

# --- Skript-Sicherheit: gefährliche Muster und ihr Gegenmittel --------------------------------------
eingabe='x; echo GEHACKT > pwn.txt'
eval "echo $eingabe" >/dev/null 2>&1   # SO NICHT: eval führt die Eingabe als Befehl aus
[[ -e pwn.txt ]] && wirkt=ja || wirkt=nein
assert_eq "$wirkt" "ja" "unsicher: eval mit Eingabe führt den eingeschleusten Befehl aus"
rm -f pwn.txt
echo "$eingabe" >/dev/null
[[ -e pwn.txt ]] && wirkt=ja || wirkt=nein
assert_eq "$wirkt" "nein" "sicher: die Eingabe als Text behandeln (in Anführungszeichen, nie als Befehl)"

mkdir "ordner mit -rf"; touch ./-rf-datei "ordner mit -rf/x"
rm -- ./-rf-datei                      # -- beendet die Optionen; ./ schützt vor Dateinamen mit Strich
assert_eq "$([[ -e ./-rf-datei ]] && echo da || echo weg)" "weg" "Dateiname mit führendem Strich: rm -- bzw. ./"
tmp=$(mktemp); assert_eq "$(stat -c %a "$tmp")" "600" "mktemp: eindeutiger Name, nur für den Besitzer lesbar"
rm -f "$tmp"
name='../../etc/passwd'
assert_eq "$([[ "$name" =~ ^[A-Za-z0-9._-]+$ && "$name" != *..* ]] && echo ok || echo abgelehnt)" "abgelehnt" "Dateiname prüfen, bevor man ihn verwendet"
# shellcheck disable=SC2154  # absichtlich nicht gesetzte Variable
( set -u; echo "$gibt_es_nicht" ) 2>/dev/null
assert_status 1 "$?" "set -u: unbekannte Variable bricht ab, statt leer zu bleiben"
assert_eq "$(bash -c 'set -e; false; echo danach' 2>&1)" "" "set -e: Abbruch beim ersten Fehler"
assert_eq "$(bash -c 'set -e; if false; then :; fi; echo weiter')" "weiter" "set -e greift nicht in if-Bedingungen"
assert_eq "$(bash -c 'set -e; f() { false; echo in-f; }; f || true; echo ende')" "in-f"$'\n'"ende" "set -e wirkt nicht in Funktionen, die mit || aufgerufen werden"

# --- ShellCheck über alle Skripte des Labs -------------------------------------------------------------------
if command -v shellcheck >/dev/null; then
  LC_ALL=C.UTF-8 shellcheck -x -P "$root/tests" "$root"/scripts/*.sh "$root"/tests/*.sh >"$work/shellcheck.out" 2>&1; status=$?
  assert_status 0 "$status" "shellcheck findet in scripts/ und tests/ nichts"
  [[ "$status" -eq 0 ]] || cat "$work/shellcheck.out"
  # shellcheck disable=SC2016  # absichtlich einfache Anführungszeichen
  printf '#!/usr/bin/env bash\nrm -rf $1/*\n' > schlecht.sh
  LC_ALL=C.UTF-8 shellcheck schlecht.sh >"$work/schlecht.out" 2>&1; status=$?
  assert_status 1 "$status" "shellcheck meldet das Beispiel mit ungeschützter Variable"
  assert_contains "$(<"$work/schlecht.out")" "SC2086" "SC2086: Anführungszeichen fehlen"
else
  echo "shellcheck nicht installiert: Prüfung übersprungen (nicht ausgeführt)"
fi

report
