#!/usr/bin/env bash
# Startet alle *.test.sh und fasst zusammen. Beendet mit Exit-Code 1, wenn ein Test scheitert.
set -uo pipefail
if [[ "$(uname -s)" != Linux ]]; then echo "Die Tests brauchen Linux. Starte ../run-in-container.sh (Docker nötig)."; exit 2; fi
cd "$(dirname "$0")" || exit 2
overall=0
for file in ./*.test.sh; do
  bash "$file" || overall=1
done
exit "$overall"
