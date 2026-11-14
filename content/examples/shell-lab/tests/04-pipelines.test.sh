#!/usr/bin/env bash
# Lektion 4: Pipes, Umleitungen und Textwerkzeuge auf einem Zugriffsprotokoll.
source "$(dirname "$0")/lib.sh"
export LC_ALL=C
log="$(cd "$(dirname "$0")/.." && pwd)/data/access.log"   # absolut, weil das Skript gleich das Verzeichnis wechselt
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
cd "$work" || exit 1

# --- Eine Pipe verbindet die Ausgabe des einen mit der Eingabe des nächsten Programms -------------
assert_eq "$(wc -l < "$log")" "16" "wc -l zählt Zeilen"
assert_eq "$(head -n 2 "$log" | cut -d' ' -f1)" $'203.0.113.5\n203.0.113.5' "head + cut: erste Spalte der ersten zwei Zeilen"
top_ips=$(awk '{print $1}' "$log" | sort | uniq -c | sort -rn | head -n 2)
assert_eq "$top_ips" $'      5 198.51.100.7\n      4 203.0.113.5' "sort | uniq -c | sort -rn: häufigste Adressen"
assert_eq "$(awk '{print $1}' "$log" | uniq | wc -l)" "7" "uniq ohne sort fasst nur aufeinanderfolgende gleiche Zeilen zusammen (7 statt 4)"
assert_eq "$(awk '{print $1}' "$log" | sort -u | wc -l)" "4" "sort -u: 4 verschiedene Adressen"

# --- Statuscodes zählen: awk wählt Spalten, $9 ist hier der Statuscode ------------------------------
status=$(awk '{print $9}' "$log" | sort | uniq -c | awk '{printf "%s=%s ", $2, $1}')
assert_eq "$status" "200=7 201=1 204=1 304=1 401=3 404=2 500=1 " "Statuscodes pro Wert"
assert_eq "$(awk '$9 >= 400' "$log" | wc -l)" "6" "awk mit Bedingung: Fehlerzeilen (4xx und 5xx)"
assert_eq "$(awk '{sum += $10} END {print sum}' "$log")" "7346" "awk summiert die Bytes (letzte Spalte)"

# --- grep: suchen, zählen, negieren ---------------------------------------------------------
assert_eq "$(grep -cF '/api/tasks/99' "$log")" "1" "grep -F sucht Text wörtlich (kein Muster)"
assert_eq "$(grep -c ' 401 ' "$log")" "3" "grep -c zählt passende Zeilen"
assert_eq "$(grep -E 'POST /login' "$log" | grep -c ' 401 ')" "3" "zwei grep hintereinander (und)"
assert_eq "$(grep -vc ' 200 ' "$log")" "9" "grep -v: alle Zeilen ohne Status 200 (-c zählt)"
assert_eq "$(grep -oE '/api/[a-z]+' "$log" | sort -u)" "/api/tasks" "grep -o gibt nur den Treffer aus"

# --- sed: ersetzen -----------------------------------------------------------------------------
erste=$(sed -n '1p' "$log" | sed -E 's/^([0-9.]+) .*"([A-Z]+) ([^ ]+) [^"]*" ([0-9]+) .*/\1 \2 \3 \4/')
assert_eq "$erste" "203.0.113.5 GET /index.html 200" "sed -E mit Gruppen \\1 ... \\4"
anonym=$(sed -n '1p' "$log" | sed -E 's/^([0-9]+\.[0-9]+\.[0-9]+)\.[0-9]+/\1.x/' | cut -d' ' -f1)
assert_eq "$anonym" "203.0.113.x" "letzte Stelle der Adresse unkenntlich machen"
assert_eq "$(echo 'Hallo Welt' | tr '[:lower:]' '[:upper:]')" "HALLO WELT" "tr wandelt Zeichen um"

# --- Umleitungen: > überschreibt, >> hängt an, 2> fängt Fehler -----------------------------------
echo erste > aus.txt; echo zweite >> aus.txt
assert_eq "$(<aus.txt)" $'erste\nzweite' "> überschreibt, >> hängt an"
ls /gibt-es-nicht 2> fehler.txt; fehlercode=$?
assert_status 2 "$fehlercode" "ls auf fehlenden Pfad"
assert_contains "$(<fehler.txt)" "No such file or directory" "2> schreibt die Fehlermeldung in eine Datei"
ls /gibt-es-nicht > beides.txt 2>&1
assert_contains "$(<beides.txt)" "No such file" "> datei 2>&1: beide Kanäle in dieselbe Datei (Reihenfolge wichtig)"
{ echo ausgabe; echo fehler >&2; } 2>&1 > nur-aus.txt | grep -c "fehler" > zaehler.txt
assert_eq "$(<zaehler.txt)" "1" "2>&1 > datei: Fehler gehen weiter in die Pipe, nur stdout in die Datei"
echo sichtbar | tee kopie.txt >/dev/null
assert_eq "$(<kopie.txt)" "sichtbar" "tee schreibt in die Datei und reicht den Strom weiter"

# --- Exit-Codes und Verkettung ---------------------------------------------------------------
grep -q 'DELETE' "$log"; assert_status 0 "$?" "grep -q: gefunden = 0"
grep -q 'PATCH' "$log"; assert_status 1 "$?" "grep -q: nichts gefunden = 1"
grep -q 'x' /gibt-es-nicht 2>/dev/null; assert_status 2 "$?" "grep: Fehler (Datei fehlt) = 2"
assert_eq "$(grep -q PATCH "$log" && echo ja || echo nein)" "nein" "&& nur bei Erfolg, || nur bei Misserfolg"
bash -c 'false | true'; assert_status 0 "$?" "Pipe ohne pipefail: nur der letzte Befehl zählt"
bash -c 'set -o pipefail; false | true'; assert_status 1 "$?" "mit pipefail zählt der erste Fehler"

report
