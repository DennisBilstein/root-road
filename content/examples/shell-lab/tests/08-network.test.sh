#!/usr/bin/env bash
# Lektion 7 (Modul 2, Lektion 3): Ports, curl, rsync-Schrägstrich, SSH-Schlüssel. Alles lokal, ohne Internet.
source "$(dirname "$0")/lib.sh"
export LC_ALL=C
root="$(cd "$(dirname "$0")/.." && pwd)"
work=$(mktemp -d)
main_pid=$$
cleanup() {
  [[ "$BASHPID" == "$main_pid" ]] || return 0
  if [[ -n "${server:-}" ]]; then kill "$server" 2>/dev/null; wait "$server" 2>/dev/null; fi
  rm -rf "$work"
}
trap cleanup EXIT
cd "$work" || exit 1
port=8099

# --- Einen Server starten und finden: ss zeigt lauschende Ports ------------------------------------
python3 -m http.server "$port" --bind 127.0.0.1 --directory "$root/data" >/dev/null 2>&1 &
server=$!
for _ in $(seq 1 50); do ss -ltn | grep -q "127.0.0.1:$port" && break; sleep 0.1; done
assert_contains "$(ss -ltn)" "127.0.0.1:$port" "ss -ltn: der Server lauscht auf 127.0.0.1:$port"
assert_contains "$(ss -ltnp 2>/dev/null)" "python3" "ss -ltnp: Prozessname (eigene Prozesse sichtbar)"

# --- curl: Statuscode, Fehler, Header --------------------------------------------------------
assert_eq "$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$port/access.log")" "200" "curl -w: Statuscode 200"
assert_eq "$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$port/nope")" "404" "curl -w: Statuscode 404"
curl -fsS -o /dev/null "http://127.0.0.1:$port/nope" 2>/dev/null; assert_status 22 "$?" "curl -f: HTTP-Fehler wird zum Exit-Code 22"
curl -sS "http://127.0.0.1:$port/nope" >/dev/null; assert_status 0 "$?" "ohne -f ist ein 404 für curl kein Fehler"
assert_eq "$(curl -s "http://127.0.0.1:$port/access.log" | wc -l)" "16" "Inhalt wird in eine Pipe geschrieben"
assert_contains "$(curl -sI "http://127.0.0.1:$port/access.log")" "200 OK" "curl -I: nur die Header (HEAD-Anfrage)"
curl -s --max-time 2 "http://127.0.0.1:1" >/dev/null 2>&1; assert_status 7 "$?" "Verbindung abgelehnt: Exit-Code 7"
assert_eq "$(curl -s -o /dev/null -w '%{size_download}' "http://127.0.0.1:$port/access.log")" "$(stat -c %s "$root/data/access.log")" "heruntergeladene Größe = Dateigröße"

# --- Namensauflösung und Schnittstellen ---------------------------------------------------------
assert_contains "$(getent hosts localhost)" "localhost" "getent hosts: localhost wird aufgelöst"
assert_contains "$(ip -brief address show lo)" "127.0.0.1" "ip -brief address: Loopback hat 127.0.0.1"

# --- rsync: der Schrägstrich am Ende entscheidet --------------------------------------------------
mkdir -p quelle/sub && printf 'x\n' > quelle/sub/datei.txt && printf 'y\n' > quelle/oben.txt
rsync -a quelle ziel1/                       # ohne Schrägstrich: der Ordner selbst wird kopiert
rsync -a quelle/ ziel2/                      # mit Schrägstrich: nur der Inhalt
assert_eq "$(ls ziel1)" "quelle" "ohne Schrägstrich entsteht ziel1/quelle/"
assert_eq "$(find ziel2 -mindepth 1 -maxdepth 1 -printf '%f\n' | sort | tr '\n' ' ')" "oben.txt sub " "mit Schrägstrich landet der Inhalt direkt im Ziel"
touch ziel2/ueberfluessig.txt
trocken=$(rsync -a --delete --dry-run --itemize-changes quelle/ ziel2/)
assert_contains "$trocken" "*deleting   ueberfluessig.txt" "--dry-run zeigt, was --delete löschen würde, ohne es zu tun"
assert_eq "$([[ -e ziel2/ueberfluessig.txt ]] && echo da)" "da" "nach --dry-run ist nichts gelöscht"
rsync -a --delete quelle/ ziel2/
assert_eq "$([[ -e ziel2/ueberfluessig.txt ]] && echo da || echo weg)" "weg" "--delete gleicht das Ziel an die Quelle an"

# --- SSH-Schlüssel erzeugen und Rechte prüfen (nur lokal, es wird keine Verbindung aufgebaut) -----
ssh-keygen -q -t ed25519 -N '' -C 'lab-beispiel' -f schluessel   # leere Passphrase nur für diesen Test
assert_eq "$(stat -c %a schluessel)" "600" "privater Schlüssel: 600 (nur Besitzer)"
assert_eq "$(stat -c %a schluessel.pub)" "644" "öffentlicher Schlüssel: 644"
assert_contains "$(<schluessel.pub)" "ssh-ed25519 " "der öffentliche Schlüssel beginnt mit dem Typ"
assert_contains "$(ssh-keygen -lf schluessel.pub)" "SHA256:" "Fingerabdruck beginnt mit SHA256:"
chmod 644 schluessel
ssh-keygen -y -f schluessel >/dev/null 2>"$work/ssh.err"; assert_status 255 "$?" "ein privater Schlüssel mit Rechten 644 wird abgelehnt"
assert_contains "$(<"$work/ssh.err")" "UNPROTECTED PRIVATE KEY FILE" "OpenSSH warnt: Schlüsseldatei zu offen (ssh verhält sich beim Verbinden ebenso)"
chmod 600 schluessel
assert_contains "$(ssh-keygen -y -f schluessel)" "ssh-ed25519 " "mit 600 lässt sich der öffentliche Schlüssel ableiten"

report
