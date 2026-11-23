/* Werkstattaufgaben der Spur linux. Wird erst geladen, wenn die Spur in der Werkstatt geöffnet wird. */
(function(){
var W=window.RP_WS,L=W.L,need=W.need,bad=W.bad;
W.add('linux',[
{id:'linux-w1',modules:['lx-m1'],level:'schwer',type:'write',language:'shell',rows:16,
  title:'Logdatei auswerten und Rechte setzen',
  text:'Schreibe sechs Shell-Befehle, jeweils einer pro Zeile, in dieser Reihenfolge.',
  details:['1. Die fünf häufigsten IP-Adressen (erste Spalte) in access.log mit Anzahl: awk \'{print $1}\' access.log | sort | uniq -c | sort -rn | head -5','2. Wie viele Zeilen in access.log enthalten einen 5xx-Statuscode (Leerzeichen, 5, zwei Ziffern, Leerzeichen)? grep -c \' 5[0-9][0-9] \' access.log','3. Alle Dateien ab 10 MB unterhalb von /var/log, ohne Fehlermeldungen: find /var/log -type f -size +10M 2>/dev/null','4. Nur der Eigentümer darf die Datei secrets.env lesen und schreiben: chmod 600 secrets.env','5. deploy.sh für den Eigentümer ausführbar machen, ohne andere Rechte zu ändern: chmod u+x deploy.sh','6. Alle .tmp-Dateien in /tmp/build, die älter als 7 Tage sind, löschen: find /tmp/build -name \'*.tmp\' -mtime +7 -delete','Kein sudo, kein chmod 777, kein rm -rf.'],
  starter:L('# Schreibe hier deine Befehle','',''),
  rules:[
    need('Top-5-IP-Pipeline',/^awk\s+'\{print\s+\$1\}'\s+access\.log\s*\|\s*sort\s*\|\s*uniq\s+-c\s*\|\s*sort\s+-rn\s*\|\s*head\s+-(?:n\s*)?5\s*$/m),
    need('grep -c für 5xx',/^grep\s+-c\s+(['"]) 5\[0-9\]\[0-9\] \1\s+access\.log\s*$/m),
    need('find /var/log -type f -size +10M 2>/dev/null',/^find\s+\/var\/log\s+-type\s+f\s+-size\s+\+10M\s+2>\/dev\/null\s*$/m),
    need('chmod 600 secrets.env',/^chmod\s+600\s+secrets\.env\s*$/m),
    need('chmod u+x deploy.sh',/^chmod\s+u\+x\s+deploy\.sh\s*$/m),
    need('find mit -mtime +7 -delete',/^find\s+\/tmp\/build\s+-name\s+(['"])\*\.tmp\1\s+-mtime\s+\+7\s+-delete\s*$/m),
    bad(/\bsudo\b/,'Wer sudo für Alltagsaufgaben nutzt, merkt Rechteprobleme nicht mehr. Hier ist es nicht nötig.'),
    bad(/\bchmod\s+(?:-R\s+)?(?:0?777|a\+rwx|ugo\+rwx)\b/,'777 erlaubt jedem Lesen, Schreiben und Ausführen: nie die Lösung.'),
    bad(/\brm\s+(?:-\w*[rf]\w*)/,'rm -rf löscht ohne Rückfrage und ohne Papierkorb. Nutze find mit gezieltem Filter.'),
    bad(/\bcat\s+[\w.\/-]+\s*\|\s*(?:grep|awk|sort|head)\b/,'Unnötiges cat: Die meisten Werkzeuge lesen die Datei selbst (grep Muster datei).'),
    bad(/\bfind\b[^\n]*-name\s+\*/,'Setze Muster in Anführungszeichen, damit die Shell sie nicht selbst auflöst.')
  ],
  solution:L('awk \'{print $1}\' access.log | sort | uniq -c | sort -rn | head -5','grep -c \' 5[0-9][0-9] \' access.log','find /var/log -type f -size +10M 2>/dev/null','chmod 600 secrets.env','chmod u+x deploy.sh','find /tmp/build -name \'*.tmp\' -mtime +7 -delete'),
  hint:'uniq zählt nur direkt aufeinanderfolgende Zeilen – deshalb vorher sort. u+x ändert nur das Ausführungsrecht des Eigentümers.',
  why:'Pipelines kombinieren kleine Werkzeuge zu Auswertungen. Genaue Rechte (600 statt 777) und gezielte Löschbefehle verhindern, dass Geheimnisse offenliegen oder Daten verloren gehen.'},
{id:'linux-w2',modules:['lx-m2'],level:'schwer',type:'write',language:'shell',rows:30,
  title:'Robustes Backup-Skript',
  text:'Schreibe das Bash-Skript backup.sh, das ein Verzeichnis sicher in ein Archiv packt.',
  details:['Erste Zeile #!/usr/bin/env bash, danach set -euo pipefail.','Aufruf: ./backup.sh QUELLE ZIEL_DIR. Ohne genau zwei Argumente (if [[ $# -ne 2 ]]) gib auf der Fehlerausgabe "Aufruf: $0 QUELLE ZIEL_DIR" aus (>&2) und beende mit exit 2.','source_dir="$1" und target_dir="$2". Prüfe mit [[ -d "$source_dir" ]], dass die Quelle ein Verzeichnis ist; sonst Fehlermeldung nach >&2 und exit 1.','tmp_dir="$(mktemp -d)" und trap \'rm -rf "$tmp_dir"\' EXIT.','Archiv erst in tmp_dir bauen: tar -czf "$tmp_dir/backup.tar.gz" -C "$source_dir" . und dann atomar verschieben: mv "$tmp_dir/backup.tar.gz" "$target_dir/backup-$(date +%F).tar.gz".','Alle Variablen in Anführungszeichen, kein ls zum Parsen, kein eval.'],
  starter:L('#!/usr/bin/env bash','','# Schreibe hier dein Skript','',''),
  rules:[
    need('Shebang als erste Zeile',/^#!\/usr\/bin\/env bash\s*\n/),
    need('set -euo pipefail',/^set\s+-euo\s+pipefail\s*$/m),
    need('Prüfung der Argumentzahl',/\bif\s+\[\[\s*\$#\s+-ne\s+2\s*\]\]\s*;\s*then/),
    need('Aufrufhinweis nach stderr mit exit 2',/echo\s+"Aufruf:\s*\$0\s+QUELLE\s+ZIEL_DIR"\s*>&2\s*\n\s*exit\s+2\b/),
    need('source_dir und target_dir',/\bsource_dir="\$1"[\s\S]*\btarget_dir="\$2"/),
    need('Verzeichnisprüfung mit exit 1',/\bif\s+\[\[\s*!\s+-d\s+"\$source_dir"\s*\]\]\s*;\s*then[\s\S]*>&2[\s\S]*exit\s+1\b/),
    need('mktemp -d',/\btmp_dir="\$\(\s*mktemp\s+-d\s*\)"/),
    need('trap mit Aufräumen bei EXIT',/\btrap\s+'rm\s+-rf\s+"\$tmp_dir"'\s+EXIT\b/),
    need('tar mit -C',/\btar\s+-czf\s+"\$tmp_dir\/backup\.tar\.gz"\s+-C\s+"\$source_dir"\s+\./),
    need('mv ins Ziel mit Datum',/\bmv\s+"\$tmp_dir\/backup\.tar\.gz"\s+"\$target_dir\/backup-\$\(date\s+\+%F\)\.tar\.gz"/),
    bad(/\beval\b/,'eval führt Text als Code aus – bei Eingaben eine Sicherheitslücke.'),
    bad(/\bls\b[^\n|]*\|/,'Die Ausgabe von ls ist zum Weiterverarbeiten ungeeignet (Leerzeichen, Zeilenumbrüche in Namen).'),
    bad(/(?<![\w"'\\$])\$(?:source_dir|target_dir|tmp_dir|1|2)\b(?!["'])/,'Setze Variablen in Anführungszeichen ("$var"), sonst zerfallen Pfade mit Leerzeichen.'),
    bad(/\bsudo\b|\bchmod\s+777\b/,'Ein Backup-Skript braucht weder sudo noch 777.'),
    bad(/\brm\s+-rf\s+\/(?:\s|$)|\brm\s+-rf\s+\*/,'Gefährliches Löschen.')
  ],
  solution:L('#!/usr/bin/env bash','set -euo pipefail','','if [[ $# -ne 2 ]]; then','  echo "Aufruf: $0 QUELLE ZIEL_DIR" >&2','  exit 2','fi','','source_dir="$1"','target_dir="$2"','','if [[ ! -d "$source_dir" ]]; then','  echo "Kein Verzeichnis: $source_dir" >&2','  exit 1','fi','','tmp_dir="$(mktemp -d)"','trap \'rm -rf "$tmp_dir"\' EXIT','','tar -czf "$tmp_dir/backup.tar.gz" -C "$source_dir" .','mv "$tmp_dir/backup.tar.gz" "$target_dir/backup-$(date +%F).tar.gz"'),
  hint:'set -e bricht bei Fehlern ab, -u meldet unbekannte Variablen, pipefail erkennt Fehler in Pipelines. trap sorgt dafür, dass der temporäre Ordner immer verschwindet.',
  why:'Skripte laufen oft unbeaufsichtigt. Strikter Modus, geprüfte Argumente, Anführungszeichen und Aufräumen per trap verhindern halb fertige Archive und beschädigte Daten.'}
]);
})();
