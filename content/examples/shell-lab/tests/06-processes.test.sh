#!/usr/bin/env bash
# Lektion 6 (Modul 2, Lektion 2): Prozesse, Signale, trap und Exit-Codes bei Signalen (scripts/worker.sh).
source "$(dirname "$0")/lib.sh"
export LC_ALL=C
root="$(cd "$(dirname "$0")/.." && pwd)"
work=$(mktemp -d)
main_pid=$$
cleanup() {
  # Ein frisch geforkter Hintergrundprozess erbt den EXIT-Trap und führt ihn aus, wenn ihn ein Signal
  # vor dem exec trifft. Deshalb räumt nur der Hauptprozess auf.
  [[ "$BASHPID" == "$main_pid" ]] || return 0
  jobs -p | xargs -r kill 2>/dev/null
  rm -rf "$work"
}
trap cleanup EXIT

# --- Hintergrund, PID und Exit-Code nach Signal ------------------------------------------------
sleep 30 & pid=$!
kill -0 "$pid"; assert_status 0 "$?" "kill -0 prüft nur, ob der Prozess lebt"
assert_eq "$(ps -o comm= -p "$pid")" "sleep" "ps -o comm= nennt das Programm"
kill -TERM "$pid"; wait "$pid"; assert_status 143 "$?" "SIGTERM ohne Behandlung: Exit-Code 143 (128 + 15)"
sleep 30 & pid=$!
{ kill -KILL "$pid"; wait "$pid"; } 2>/dev/null; assert_status 137 "$?" "SIGKILL: Exit-Code 137 (128 + 9), nicht abfangbar"
bash -c 'kill -INT $$'; assert_status 130 "$?" "SIGINT (Strg+C) beendet einen Vordergrundprozess: Exit-Code 130 (128 + 2)"
sleep 30 & pid=$!
sleep 0.2; kill -INT "$pid"; sleep 0.2
kill -0 "$pid"; assert_status 0 "$?" "Hintergrundprozesse eines Skripts ignorieren SIGINT: der Prozess lebt noch"
{ kill -TERM "$pid"; wait "$pid"; } 2>/dev/null
kill -0 "$pid" 2>/dev/null; assert_status 1 "$?" "nach dem Ende existiert der Prozess nicht mehr"
assert_eq "$(kill -l 15)" "TERM" "kill -l 15 übersetzt die Nummer in den Namen"

# --- trap: eigenes Aufräumen ----------------------------------------------------------------
bash "$root/scripts/worker.sh" "$work/worker.pid" > "$work/worker.out" 2>&1 &
worker=$!
for _ in $(seq 1 50); do [[ -s "$work/worker.pid" ]] && break; sleep 0.1; done
assert_eq "$(<"$work/worker.pid")" "$worker" "der Worker schreibt seine PID in die Datei"
kill -TERM "$worker"; wait "$worker"; assert_status 0 "$?" "SIGTERM mit trap: Exit-Code 0 (sauber beendet)"
out=$(<"$work/worker.out")
assert_contains "$out" "Signal erhalten, beende sauber" "der Handler lief"
assert_contains "$out" "aufgeräumt" "der EXIT-Trap lief danach"
[[ ! -e "$work/worker.pid" ]] && weg=ja || weg=nein
assert_eq "$weg" "ja" "PID-Datei wurde entfernt"
assert_eq "$(pgrep -f "sleep 30" | wc -l)" "0" "der Hintergrund-sleep des Workers wurde mit aufgeräumt"

# SIGKILL kann der Worker nicht abfangen: PID-Datei und sleep bleiben zurück
bash "$root/scripts/worker.sh" "$work/hart.pid" > /dev/null 2>&1 &
worker=$!
for _ in $(seq 1 50); do [[ -s "$work/hart.pid" ]] && break; sleep 0.1; done
{ kill -KILL "$worker"; wait "$worker"; } 2>/dev/null; assert_status 137 "$?" "SIGKILL: kein Aufräumen möglich"
[[ -e "$work/hart.pid" ]] && bleibt=ja || bleibt=nein
assert_eq "$bleibt" "ja" "die PID-Datei bleibt liegen (veraltete PID: Programme müssen das erkennen)"
pkill -f "sleep 30" 2>/dev/null || true

# --- Der Worker verlangt eine PID-Datei ----------------------------------------------------------
bash "$root/scripts/worker.sh" >/dev/null 2>&1; assert_status 1 "$?" "ohne Argument: Abbruch mit Meldung"

# --- Jobs in der Shell ---------------------------------------------------------------------
(sleep 30 & echo $! > "$work/bg.pid"; wait) 2>/dev/null &
for _ in $(seq 1 20); do [[ -s "$work/bg.pid" ]] && break; sleep 0.1; done
bgpid=$(<"$work/bg.pid")
assert_eq "$(ps -o stat= -p "$bgpid" | cut -c1)" "S" "ein wartender Prozess hat den Zustand S (schläft)"
kill "$bgpid" 2>/dev/null

report
