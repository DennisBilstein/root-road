#!/usr/bin/env bash
# Kleine Prüf-Hilfen für die Lab-Tests. Jede Prüfung zählt; am Ende gibt report den Stand aus und setzt den Exit-Code.
passed=0
failed=0

assert_eq() { # erwartet actual expected beschreibung
  if [[ "$1" == "$2" ]]; then passed=$((passed + 1)); printf 'ok   %s\n' "$3"
  else failed=$((failed + 1)); printf 'FAIL %s\n  erwartet: %q\n  erhalten: %q\n' "$3" "$2" "$1"; fi
}

assert_contains() { # erwartet text teil beschreibung
  if [[ "$1" == *"$2"* ]]; then passed=$((passed + 1)); printf 'ok   %s\n' "$3"
  else failed=$((failed + 1)); printf 'FAIL %s\n  "%s" fehlt in: %q\n' "$3" "$2" "$1"; fi
}

assert_status() { # erwartet status_erwartet status_erhalten beschreibung
  assert_eq "$2" "$1" "$3 (Exit-Code $1)"
}

report() {
  printf '%s: %d bestanden, %d fehlgeschlagen\n' "${0##*/}" "$passed" "$failed"
  [[ "$failed" -eq 0 ]]
}
