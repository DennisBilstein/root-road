#!/usr/bin/env bash
# logreport.sh – fasst ein Zugriffsprotokoll im Format der Beispieldaten zusammen.
# Aufruf: logreport.sh [-n ANZAHL] [-s STATUS] DATEI
#   -n  wie viele häufigste Adressen angezeigt werden (Standard 3)
#   -s  nur Zeilen, deren Statuscode so beginnt (z. B. 4 für alle 4xx, 404 für genau 404)
# Exit-Codes: 0 Erfolg, 2 ungültiger Wert, 64 falsche Verwendung, 66 Datei nicht lesbar.
set -euo pipefail
export LC_ALL=C   # feste Sortierreihenfolge, auch bei Gleichstand

usage() { printf 'Aufruf: %s [-n ANZAHL] [-s STATUS] DATEI\n' "${0##*/}" >&2; }

top=3
prefix=''
while getopts ':n:s:h' option; do
  case "$option" in
    n) top="$OPTARG" ;;
    s) prefix="$OPTARG" ;;
    h) usage; exit 0 ;;
    :) printf 'Option -%s braucht einen Wert\n' "$OPTARG" >&2; usage; exit 64 ;;
    *) printf 'Unbekannte Option: -%s\n' "$OPTARG" >&2; usage; exit 64 ;;
  esac
done
shift $((OPTIND - 1))

[[ $# -eq 1 ]] || { usage; exit 64; }
file="$1"
[[ "$top" =~ ^[1-9][0-9]*$ ]] || { printf -- '-n braucht eine positive ganze Zahl, nicht "%s"\n' "$top" >&2; exit 2; }
[[ -z "$prefix" || "$prefix" =~ ^[1-5][0-9]{0,2}$ ]] || { printf -- '-s braucht 1 bis 3 Ziffern, nicht "%s"\n' "$prefix" >&2; exit 2; }
[[ -f "$file" && -r "$file" ]] || { printf 'Datei nicht lesbar: %s\n' "${file##*/}" >&2; exit 66; }

# Gefilterte Zeilen einmal in eine temporäre Datei schreiben; sie wird beim Beenden immer gelöscht.
tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT
awk -v p="$prefix" 'p == "" || index($9, p) == 1' "$file" > "$tmp"

total=$(wc -l < "$tmp")
errors=$(awk '$9 >= 400' "$tmp" | wc -l)
printf 'Anfragen: %d\nFehler (4xx/5xx): %d\n' "$total" "$errors"

echo 'Häufigste Adressen:'
# awk statt head: head würde früh schließen, und mit pipefail brächte das SIGPIPE den Lauf zum Abbruch.
awk '{print $1}' "$tmp" | sort | uniq -c | sort -rn | awk -v n="$top" 'NR <= n {printf "%7d %s\n", $1, $2}'

printf 'Statuscodes:'
awk '{print $9}' "$tmp" | sort | uniq -c | awk '{printf " %s=%s", $2, $1}'
printf '\n'
