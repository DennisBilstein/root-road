#!/usr/bin/env bash
# Lektion 8 (Modul 2, Lektion 4): Backup mit rsync --link-dest, Prüfsummen, Sperre, Aufräumen (scripts/backup.sh).
source "$(dirname "$0")/lib.sh"
export LC_ALL=C
root="$(cd "$(dirname "$0")/.." && pwd)"
script="$root/scripts/backup.sh"
work=$(mktemp -d)
trap 'chmod -R u+rwx "$work" 2>/dev/null; rm -rf "$work"' EXIT
cd "$work" || exit 1

mkdir -p quelle/unter
printf 'eins\n' > quelle/a.txt
printf 'zwei\n' > quelle/unter/b.txt
printf 'drei\n' > "quelle/mit leerzeichen.txt"

# --- Erster Schnappschuss ------------------------------------------------------------------
out=$(BACKUP_NOW=2026-11-14T100000Z bash "$script" quelle ziel 3); status=$?
assert_status 0 "$status" "erster Schnappschuss"
assert_contains "$out" "Sicherung angelegt: 2026-11-14T100000Z (1 Schnappschüsse, behalten: 3)" "Meldung nennt Name und Anzahl"
assert_eq "$(cat "ziel/2026-11-14T100000Z/unter/b.txt")" "zwei" "Dateien liegen im Schnappschuss"
assert_eq "$(cat "ziel/2026-11-14T100000Z/mit leerzeichen.txt")" "drei" "Leerzeichen im Namen sind kein Problem"
assert_eq "$(readlink ziel/latest)" "2026-11-14T100000Z" "latest zeigt auf den neuesten Schnappschuss"
assert_eq "$(stat -c %a ziel)" "700" "umask 077: Zielverzeichnis nur für den Besitzer"
[[ ! -e ziel/.lock && -z "$(find ziel -name '.partial-*')" ]] && sauber=ja || sauber=nein
assert_eq "$sauber" "ja" "weder Sperre noch Zwischenverzeichnis bleiben zurück"

# --- Zweiter Schnappschuss: nur b.txt ändert sich ----------------------------------------------
printf 'zwei, neu\n' > quelle/unter/b.txt
BACKUP_NOW=2026-11-14T110000Z bash "$script" quelle ziel 3 >/dev/null
s1=ziel/2026-11-14T100000Z; s2=ziel/2026-11-14T110000Z
assert_eq "$(stat -c %i "$s1/a.txt")" "$(stat -c %i "$s2/a.txt")" "unveränderte Datei: dieselbe Inode (kein zusätzlicher Speicher)"
[[ "$(stat -c %i "$s1/unter/b.txt")" != "$(stat -c %i "$s2/unter/b.txt")" ]] && neu=ja || neu=nein
assert_eq "$neu" "ja" "geänderte Datei: eigene Kopie"
assert_eq "$(cat "$s1/unter/b.txt")" "zwei" "der alte Schnappschuss behält den alten Stand"
assert_eq "$(cat "$s2/unter/b.txt")" "zwei, neu" "der neue enthält den neuen Stand"
assert_eq "$(stat -c %h "$s1/a.txt")" "2" "a.txt hat zwei Namen (zwei Schnappschüsse)"

# --- Dritter: eine Datei wird in der Quelle gelöscht, älteste Schnappschüsse fallen weg -----------
rm quelle/a.txt
BACKUP_NOW=2026-11-14T120000Z bash "$script" quelle ziel 2 >/dev/null
assert_eq "$(find ziel -mindepth 1 -maxdepth 1 -type d | sort | tr '\n' ' ')" "ziel/2026-11-14T110000Z ziel/2026-11-14T120000Z " "mit ANZAHL_BEHALTEN=2 bleiben die zwei neuesten"
[[ ! -e ziel/2026-11-14T120000Z/a.txt && -e ziel/2026-11-14T110000Z/a.txt ]] && ok=ja || ok=nein
assert_eq "$ok" "ja" "gelöschte Quelldatei fehlt im neuen, steckt aber im Vorgänger"

# --- Wiederherstellung prüfen: ein Backup ohne Rücksicherungstest ist nur eine Hoffnung -----------
rsync -a ziel/latest/ wiederhergestellt/
diff -r quelle wiederhergestellt >/dev/null; assert_status 0 "$?" "Rücksicherung stimmt mit der Quelle überein (diff -r)"

# --- Fehlerfälle ---------------------------------------------------------------------------
bash "$script" >/dev/null 2>&1; assert_status 64 "$?" "ohne Argumente: falsche Verwendung"
bash "$script" quelle ziel 0 >/dev/null 2>&1; assert_status 64 "$?" "ANZAHL_BEHALTEN 0 ist ungültig"
bash "$script" gibt-es-nicht ziel >/dev/null 2>&1; assert_status 66 "$?" "Quelle fehlt"
BACKUP_NOW=2026-11-14T120000Z bash "$script" quelle ziel >/dev/null 2>&1; assert_status 73 "$?" "Schnappschuss mit gleichem Namen existiert"
mkdir ziel/.lock
BACKUP_NOW=2026-11-14T130000Z bash "$script" quelle ziel >/dev/null 2>&1; assert_status 75 "$?" "belegte Sperre: Abbruch ohne zu überschreiben"
[[ -d ziel/.lock && ! -e ziel/2026-11-14T130000Z ]] && ok=ja || ok=nein
assert_eq "$ok" "ja" "die fremde Sperre bleibt, nichts Neues entsteht"
rmdir ziel/.lock

# Unlesbare Datei: rsync meldet Fehler 23, das Skript räumt auf und lässt latest unberührt
printf 'geheim\n' > quelle/gesperrt.txt; chmod 000 quelle/gesperrt.txt
BACKUP_NOW=2026-11-14T140000Z bash "$script" quelle ziel >/dev/null 2>&1; assert_status 23 "$?" "unlesbare Quelldatei: rsync-Fehler 23 wird durchgereicht"
[[ -z "$(find ziel -name '.partial-*')" && ! -e ziel/.lock && ! -e ziel/2026-11-14T140000Z ]] && ok=ja || ok=nein
assert_eq "$ok" "ja" "nach dem Fehler: kein Zwischenverzeichnis, keine Sperre, kein halber Schnappschuss"
assert_eq "$(readlink ziel/latest)" "2026-11-14T120000Z" "latest zeigt weiter auf den letzten guten Schnappschuss"
rm -f quelle/gesperrt.txt

# Unlesbare Datei, die schon im letzten Schnappschuss steckt: rsync kann sie verlinken, ohne sie zu lesen.
# Ohne eigene Prüfung bliebe der Fehler beim Berechnen der Prüfsummen unbemerkt (beide Seiten schlagen gleich fehl).
chmod 000 quelle/unter/b.txt
BACKUP_NOW=2026-11-14T150000Z bash "$script" quelle ziel >/dev/null 2>&1; assert_status 70 "$?" "Prüfsummen nicht lesbar: Schnappschuss wird verworfen (Exit-Code 70)"
[[ ! -e ziel/2026-11-14T150000Z && -z "$(find ziel -name '.partial-*')" && ! -e ziel/.lock ]] && ok=ja || ok=nein
assert_eq "$ok" "ja" "auch hier bleibt nichts Halbes zurück"
chmod 644 quelle/unter/b.txt

report
