# Shell-Lab

Geprüfter Code für die Lektionen `lx-m1` und `lx-m2` (Kurs Linux & Shell). Alles läuft in einem Wegwerf-Container mit Debian 13 („trixie“), Bash 5.2.37.

```bash
./run-in-container.sh   # baut das Image (Dockerfile) und startet alle Tests als normaler Benutzer
```

Docker wird nur für das Bauen und Ausführen des Images gebraucht. Das Lab wird schreibgeschützt eingehängt, die Tests schreiben nur in temporäre Verzeichnisse. Das Image installiert beim Bauen Pakete aus den Debian-Quellen (curl, rsync, openssh-client, iproute2, procps, python3, shellcheck).

| Datei | Lektion |
| --- | --- |
| `tests/01-navigation.test.sh` | Shell, Pfade, Verzeichnisbaum, `$PATH`, Anführungszeichen |
| `tests/02-files-links.test.sh` | cp/mv/rm, Links, Globbing, find |
| `tests/03-permissions.test.sh` | Rechte, umask, `/etc/shadow`, Ausführbarkeit |
| `tests/04-pipelines.test.sh` + `data/access.log` | Pipes, Umleitungen, grep/sed/awk |
| `scripts/logreport.sh` + `tests/05-script.test.sh` | Bash-Skript mit `getopts`, Exit-Codes |
| `scripts/worker.sh` + `tests/06-processes.test.sh` | Signale, `trap`, Exit-Codes 143/137/130 |
| `tests/08-network.test.sh` | `ss`, `curl`, `rsync`, SSH-Schlüssel (nur lokal) |
| `scripts/backup.sh` + `tests/07-backup.test.sh` | Backup mit `rsync --link-dest`, Prüfsummen, Sperre |
| `tests/09-packages-security.test.sh` | Pakete, Logs, Skript-Sicherheit, ShellCheck |
| `deploy/*` | systemd-Einheit, crontab, logrotate: **nicht ausgeführt** (nur Beispiele) |

Die Beispieldaten in `data/access.log` sind selbst erzeugt; die Adressen stammen aus den für Dokumentation reservierten Bereichen.
Die Testdatei `tests/lib.sh` enthält die kleinen Prüf-Hilfen (`assert_eq`, `assert_contains`, `assert_status`).
Nicht geprüft: macOS (Bash 3.2, BSD-Werkzeuge), andere Distributionen, systemd, ein echter SSH-Login.
