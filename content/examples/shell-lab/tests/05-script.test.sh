#!/usr/bin/env bash
# Lektion 5 (Modul 2, Lektion 1): Bash-Skript mit Optionen, Prüfungen und Exit-Codes (scripts/logreport.sh).
source "$(dirname "$0")/lib.sh"
export LC_ALL=C
root="$(cd "$(dirname "$0")/.." && pwd)"
script="$root/scripts/logreport.sh"
log="$root/data/access.log"

out=$(bash "$script" "$log"); status=$?
assert_status 0 "$status" "Normalfall: Bericht für die Beispieldaten"
assert_contains "$out" "Anfragen: 16" "Gesamtzahl der Anfragen"
assert_contains "$out" "Fehler (4xx/5xx): 6" "Fehlerzeilen"
assert_contains "$out" "198.51.100.7" "häufigste Adresse steht im Bericht"
assert_contains "$out" "Statuscodes: 200=7 201=1 204=1 304=1 401=3 404=2 500=1" "Statuscodes"

out=$(bash "$script" -s 4 -n 1 "$log")
assert_contains "$out" "Anfragen: 5" "-s 4 filtert auf 4xx"
assert_eq "$(grep -c '^ *[0-9]* [0-9.]*$' <<<"$out")" "1" "-n 1 zeigt genau eine Adresse"

out=$(bash "$script" -s 404 "$log")
assert_contains "$out" "Statuscodes: 404=2" "-s 404 filtert auf genau 404"

# Grenzfälle der Optionen
bash "$script" -n 0 "$log" >/dev/null 2>&1; assert_status 2 "$?" "-n 0 ist ungültig"
bash "$script" -n 1.5 "$log" >/dev/null 2>&1; assert_status 2 "$?" "-n 1.5 ist ungültig"
bash "$script" -s 6 "$log" >/dev/null 2>&1; assert_status 2 "$?" "-s 6 ist ungültig (keine 6xx-Statuscodes)"
out=$(bash "$script" -n 100 "$log"); assert_contains "$out" "Anfragen: 16" "-n größer als die Zahl der Adressen: kein Fehler"

# Fehlerfälle
err=$(bash "$script" 2>&1 >/dev/null); status=$?
assert_status 64 "$status" "ohne Datei: falsche Verwendung"
assert_contains "$err" "Aufruf:" "die Meldung nennt den Aufruf"
err=$(bash "$script" -z "$log" 2>&1 >/dev/null); status=$?
assert_status 64 "$status" "unbekannte Option"
assert_contains "$err" "Unbekannte Option: -z" "Meldung nennt die Option"
err=$(bash "$script" -n 2>&1 >/dev/null); status=$?
assert_status 64 "$status" "Option ohne Wert"
err=$(bash "$script" /gibt/es/nicht.log 2>&1 >/dev/null); status=$?
assert_status 66 "$status" "Datei fehlt"
assert_eq "$err" "Datei nicht lesbar: nicht.log" "die Meldung nennt nur den Dateinamen, nicht den Pfad"

# leere Datei und Datei mit Leerzeichen im Namen
work=$(mktemp -d); trap 'rm -rf "$work"' EXIT
: > "$work/leer.log"
out=$(bash "$script" "$work/leer.log"); assert_contains "$out" "Anfragen: 0" "leere Datei: 0 Anfragen"
cp "$log" "$work/mit leerzeichen.log"
out=$(bash "$script" "$work/mit leerzeichen.log"); assert_contains "$out" "Anfragen: 16" "Leerzeichen im Dateinamen"

# der Hilfsfehler 'SIGPIPE mit pipefail': head schließt früh, die Pipe meldet 141
bash -c 'set -o pipefail; yes | head -n 1 >/dev/null'; assert_status 141 "$?" "yes | head mit pipefail: Exit-Code 141 (128 + SIGPIPE 13)"
# temporäre Datei wird entfernt
vorher=$(find "${TMPDIR:-/tmp}" -maxdepth 1 -name 'tmp.*' 2>/dev/null | wc -l)
bash "$script" "$log" >/dev/null
nachher=$(find "${TMPDIR:-/tmp}" -maxdepth 1 -name 'tmp.*' 2>/dev/null | wc -l)
assert_eq "$nachher" "$vorher" "der EXIT-Trap räumt die temporäre Datei auf"

report
