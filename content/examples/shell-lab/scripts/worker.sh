#!/usr/bin/env bash
# worker.sh – läuft, bis er ein Signal bekommt, und räumt dann auf.
# Aufruf: worker.sh PIDDATEI
# SIGTERM/SIGINT: sauber beenden (Exit-Code 0). Der EXIT-Trap läuft bei jedem Ende, auch bei Fehlern.
set -euo pipefail

pidfile="${1:?Aufruf: worker.sh PIDDATEI}"
sleeper=''

cleanup() {
  if [[ -n "$sleeper" ]]; then kill "$sleeper" 2>/dev/null || true; fi
  rm -f -- "$pidfile"
  echo 'aufgeräumt'
}
on_signal() { echo 'Signal erhalten, beende sauber'; exit 0; }

trap cleanup EXIT
trap on_signal TERM INT

echo "$$" > "$pidfile"
echo 'gestartet'
while true; do
  # In den Hintergrund und mit wait warten: So unterbricht ein Signal das Warten sofort,
  # statt erst nach dem Ende eines laufenden sleep behandelt zu werden.
  sleep 30 &
  sleeper=$!
  wait "$sleeper" || true
done
