#!/usr/bin/env bash
# Lektion 2: Dateien kopieren/verschieben/löschen, Links, Muster (Globbing) und find.
source "$(dirname "$0")/lib.sh"
export LC_ALL=C
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
cd "$work" || exit 1

# --- Kopieren, Verschieben, Löschen -------------------------------------------------------
mkdir -p tief/in/der/mitte          # -p legt alle fehlenden Ebenen an
printf 'inhalt\n' > a.txt
cp a.txt b.txt && mv b.txt tief/in/b.txt
assert_eq "$(cat tief/in/b.txt)" "inhalt" "cp kopiert, mv verschiebt"
[[ ! -e b.txt ]] && gone=ja || gone=nein
assert_eq "$gone" "ja" "nach mv liegt die Datei nur noch am Ziel"
cp -r tief kopie
assert_eq "$(find kopie -type f)" "kopie/in/b.txt" "cp -r kopiert ganze Verzeichnisse"
rm -r kopie
[[ ! -d kopie ]] && gone=ja || gone=nein
assert_eq "$gone" "ja" "rm -r löscht ein Verzeichnis samt Inhalt (ohne Papierkorb)"

# --- Harter Link und symbolischer Link -----------------------------------------------------
ln a.txt hart.txt          # zweiter Name für dieselben Daten
ln -s a.txt weich.txt      # Verweis auf den Namen
assert_eq "$(stat -c %i a.txt)" "$(stat -c %i hart.txt)" "harter Link: gleiche Inode-Nummer"
assert_eq "$(stat -c %h a.txt)" "2" "die Datei hat jetzt zwei Namen"
assert_eq "$(readlink weich.txt)" "a.txt" "readlink zeigt das Ziel des symbolischen Links"
rm a.txt
assert_eq "$(cat hart.txt)" "inhalt" "harter Link überlebt das Löschen des Originalnamens"
[[ -e weich.txt ]] && ziel=da || ziel=weg
[[ -L weich.txt ]] && link=ja || link=nein
assert_eq "$ziel/$link" "weg/ja" "symbolischer Link zeigt ins Leere (hängt), existiert aber selbst"

# --- Muster (Globbing): die Shell ersetzt sie, bevor das Programm startet --------------------
mkdir muster && cd muster || exit 1
touch a1.txt a2.txt b1.md "mein bericht.txt"
assert_eq "$(echo *.txt)" "a1.txt a2.txt mein bericht.txt" "* passt auf beliebig viele Zeichen"
assert_eq "$(echo a?.txt)" "a1.txt a2.txt" "? passt auf genau ein Zeichen"
assert_eq "$(echo [ab]1.*)" "a1.txt b1.md" "[ab] passt auf eines der Zeichen"
assert_eq "$(echo *.zip)" "*.zip" "ohne Treffer bleibt das Muster stehen (Standard)"
shopt -s nullglob
zip_files=(*.zip)
assert_eq "${#zip_files[@]}" "0" "mit nullglob ergibt kein Treffer eine leere Liste"
shopt -u nullglob
assert_eq "$(echo datei{1,2,3}.log)" "datei1.log datei2.log datei3.log" "Klammern { } erzeugen Namen, sie suchen nichts"

# --- Dateinamen mit Leerzeichen: immer in Anführungszeichen --------------------------------
ls mein bericht.txt >/dev/null 2>&1; assert_status 2 "$?" "ohne Anführungszeichen sind es zwei Namen: ls scheitert"
ls "mein bericht.txt" >/dev/null; assert_status 0 "$?" "mit Anführungszeichen ist es ein Name"
anzahl=0
# shellcheck disable=SC2034  # die Schleifenvariable wird nur gezählt
for datei in *.txt; do anzahl=$((anzahl + 1)); done   # jeder Name kommt als Ganzes, auch mit Leerzeichen
assert_eq "$anzahl" "3" "for über ein Muster liefert jeden Namen als Ganzes"

# --- find: nach Eigenschaften suchen, nicht nach Mustern in der Shell -----------------------
cd "$work" || exit 1
mkdir -p proj/logs proj/src
printf 'x\n' > proj/src/app.sh
head -c 2048 /dev/zero > proj/logs/gross.log
printf 'klein\n' > proj/logs/klein.log
touch -d '10 days ago' proj/logs/alt.log
assert_eq "$(find proj -name '*.log' -type f | sort)" $'proj/logs/alt.log\nproj/logs/gross.log\nproj/logs/klein.log' "find -name -type"
assert_eq "$(find proj -type f -size +1k)" "proj/logs/gross.log" "find -size +1k"
assert_eq "$(find proj -type f -mtime +7)" "proj/logs/alt.log" "find -mtime +7: älter als 7 Tage"
assert_eq "$(find proj -maxdepth 1 -type d | sort)" $'proj\nproj/logs\nproj/src' "find -maxdepth begrenzt die Tiefe"
assert_eq "$(find proj -name '*.log' -type f -mtime +7 -exec basename {} \;)" "alt.log" "find -exec führt einen Befehl je Treffer aus"
printf 'a b\n' > "proj/logs/mit leerzeichen.log"
zeilen=$(find proj/logs -name '*.log' -print0 | xargs -0 cat | wc -l)
assert_eq "$((zeilen))" "2" "-print0 mit xargs -0 kommt auch mit Leerzeichen im Namen zurecht (klein.log + mit leerzeichen.log)"
find proj -name '*.log' -mtime +7 -delete
[[ ! -e proj/logs/alt.log ]] && gone=ja || gone=nein
assert_eq "$gone" "ja" "find -delete löscht (vorher mit -print prüfen)"

report
