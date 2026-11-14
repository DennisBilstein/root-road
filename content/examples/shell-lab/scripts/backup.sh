#!/usr/bin/env bash
# backup.sh – Schnappschüsse mit rsync --link-dest: unveränderte Dateien teilen sich den Speicher (harte Links).
# Aufruf: backup.sh QUELLE ZIEL [ANZAHL_BEHALTEN]    (Standard: 7)
# Ablauf: sperren, in ein Zwischenverzeichnis kopieren, Prüfsummen vergleichen, atomar umbenennen, alte löschen.
# Exit-Codes: 0 Erfolg, 64 falsche Verwendung, 66 Quelle fehlt, 70 Prüfsummen weichen ab,
#             73 Schnappschuss existiert, 75 Sperre belegt; Fehler von rsync werden unverändert weitergegeben.
# Benötigt Bash >= 4 (mapfile) und GNU/Linux-Werkzeuge; auf macOS (Bash 3.2, BSD-Werkzeuge) nicht getestet.
set -euo pipefail
umask 077   # Sicherungen enthalten oft Vertrauliches: nur der Besitzer darf lesen

usage() { printf 'Aufruf: %s QUELLE ZIEL [ANZAHL_BEHALTEN]\n' "${0##*/}" >&2; }
[[ $# -ge 2 && $# -le 3 ]] || { usage; exit 64; }

source_dir="${1%/}"
dest_dir="${2%/}"
keep="${3:-7}"
[[ -d "$source_dir" ]] || { printf 'Quelle ist kein Verzeichnis: %s\n' "${source_dir##*/}" >&2; exit 66; }
[[ "$keep" =~ ^[1-9][0-9]*$ ]] || { echo 'ANZAHL_BEHALTEN muss eine positive ganze Zahl sein' >&2; exit 64; }

mkdir -p -- "$dest_dir"
lock="$dest_dir/.lock"
# mkdir ist atomar: Wer es zuerst schafft, hält die Sperre.
if ! mkdir -- "$lock" 2>/dev/null; then
  printf 'Eine Sicherung läuft bereits oder wurde abgebrochen: %s\n' "$lock" >&2
  exit 75
fi
lock_taken=1
partial=''
cleanup() {
  if [[ -n "$partial" && -d "$partial" ]]; then rm -rf -- "$partial"; fi
  if [[ "${lock_taken:-0}" -eq 1 ]]; then rmdir -- "$lock" 2>/dev/null || true; fi
}
trap cleanup EXIT

name="${BACKUP_NOW:-$(date -u +%Y-%m-%dT%H%M%SZ)}"   # BACKUP_NOW nur für Tests
final="$dest_dir/$name"
[[ ! -e "$final" ]] || { printf 'Schnappschuss existiert schon: %s\n' "$name" >&2; exit 73; }
partial="$dest_dir/.partial-$name"

link_args=()
if [[ -L "$dest_dir/latest" ]]; then
  link_args=("--link-dest=$(readlink -f -- "$dest_dir/latest")")
fi
rsync -a --delete ${link_args[@]+"${link_args[@]}"} -- "$source_dir/" "$partial/"

checksums() { (cd "$1" && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 -r sha256sum); }
# Jede Seite einzeln einlesen und den Exit-Code prüfen: In [[ "$(a)" != "$(b)" ]] bleibt ein Fehler von a oder b
# unbemerkt, und zwei gleich fehlgeschlagene Seiten sähen „gleich“ aus.
src_sums=$(checksums "$source_dir") || { echo 'Prüfsummen der Quelle nicht lesbar. Schnappschuss verworfen.' >&2; exit 70; }
dst_sums=$(checksums "$partial") || { echo 'Prüfsummen des Schnappschusses nicht lesbar. Schnappschuss verworfen.' >&2; exit 70; }
if [[ "$src_sums" != "$dst_sums" ]]; then
  echo 'Prüfsummen weichen ab (Quelle während der Sicherung geändert?). Schnappschuss verworfen.' >&2
  exit 70
fi

mv -- "$partial" "$final"   # erst jetzt ist der Schnappschuss sichtbar
partial=''
ln -sfn -- "$name" "$dest_dir/latest"

mapfile -t snapshots < <(find "$dest_dir" -mindepth 1 -maxdepth 1 -type d -name '20*' | LC_ALL=C sort)
excess=$(( ${#snapshots[@]} - keep ))
if (( excess > 0 )); then
  for old in "${snapshots[@]:0:excess}"; do
    [[ "$old" == "$dest_dir"/20* ]] || continue   # Sicherheitsgurt: nur Schnappschüsse löschen
    rm -rf -- "$old"
  done
  snapshots=("${snapshots[@]:excess}")
fi
printf 'Sicherung angelegt: %s (%d Schnappschüsse, behalten: %d)\n' "$name" "${#snapshots[@]}" "$keep"
