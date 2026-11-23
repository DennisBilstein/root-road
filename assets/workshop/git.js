/* Werkstattaufgaben der Spur git (Original Root Road). Wird erst geladen, wenn die Spur in der Werkstatt geöffnet wird. */
(function(){
var W=window.RP_WS,L=W.L,need=W.need,bad=W.bad;
var tasks=[
  {id:'git-w1',modules:['m61'],level:'schwer',type:'write',language:'shell',rows:14,
    title:'Feature-Branch sauber einreichen',
    text:'Schreibe die Befehlsfolge, mit der du eine Änderung an lesson.php auf einem eigenen Branch einreichst.',
    details:['Erzeuge den Branch feature/lernplan und wechsle darauf (git switch -c).','Prüfe mit git status, stage nur die Datei lesson.php, sieh dir den vorgemerkten Diff an (git diff --staged), bevor du committest.','Commit mit einer Nachricht im Conventional-Commits-Stil: feat(lesson): add study plan.','Lade den Branch hoch und setze den Upstream (git push -u origin feature/lernplan).'],
    starter:L('# Schreibe hier deine Git-Befehle','',''),
    rules:[
      need('git switch -c feature/lernplan',/^git\s+(?:switch\s+-c|checkout\s+-b)\s+feature\/lernplan\s*$/m),
      need('git status',/^git\s+status\b/m),
      need('git add lesson.php (nur diese Datei)',/^git\s+add\s+lesson\.php\s*$/m),
      need('git diff --staged vor dem Commit',/^git\s+diff\s+(?:--staged|--cached)\b[\s\S]*^git\s+commit\b/m),
      need('git commit -m "feat(lesson): add study plan"',/^git\s+commit\s+-m\s+["']feat\(lesson\):\s*add study plan["']\s*$/m),
      need('git push -u origin feature/lernplan',/^git\s+push\s+(?:-u|--set-upstream)\s+origin\s+feature\/lernplan\s*$/m),
      bad(/^git\s+add\s+(?:-A|--all|\.)\s*$/m,'git add . oder -A staged alles, auch Unbeabsichtigtes. Nenne die Datei.'),
      bad(/\bgit\s+push\b[^\n]*(?:--force|-f)\b/,'Kein Force-Push: Er überschreibt fremde Arbeit.'),
      bad(/--no-verify/,'Überspringe keine Hooks: Sie schützen vor kaputten Commits.'),
      bad(/^git\s+commit\s+-(?:a|am)\b/m,'git commit -a nimmt auch ungeprüfte Änderungen mit. Staged gezielt mit git add.')
    ],
    solution:L('git switch -c feature/lernplan','git status','git add lesson.php','git diff --staged','git commit -m "feat(lesson): add study plan"','git push -u origin feature/lernplan'),
    hint:'Der Weg ist: Branch, ansehen, gezielt vormerken, Vorgemerktes prüfen, committen, hochladen.',
    why:'Wer gezielt staged und den Diff vor dem Commit liest, bringt keine Zufallsdateien ins Repository. Ein eigener Branch hält main sauber.'},
  {id:'git-w2',modules:['m64'],level:'schwer',type:'write',language:'shell',rows:14,
    title:'Fehler zurücknehmen, ohne Arbeit zu zerstören',
    text:'Schreibe die passenden Befehle für drei Situationen – ohne zerstörerische Varianten.',
    details:['1. Die letzte, noch nicht hochgeladene Commit-Nachricht hat einen Tippfehler: ändere sie auf „fix(api): handle empty list“.','2. Die Datei secrets.txt ist versehentlich gestaged: nimm sie aus dem Staging zurück, ohne die Datei zu löschen (git restore --staged).','3. Der Commit abc1234 ist schon hochgeladen und fehlerhaft: mache ihn mit einem neuen Commit rückgängig (git revert).','Nicht erlaubt: git reset --hard und Force-Push.'],
    starter:L('# Schreibe hier deine Git-Befehle','',''),
    rules:[
      need('git commit --amend mit neuer Nachricht',/^git\s+commit\s+--amend\s+-m\s+["']fix\(api\):\s*handle empty list["']\s*$/m),
      need('git restore --staged secrets.txt',/^git\s+restore\s+--staged\s+secrets\.txt\s*$/m),
      need('git revert abc1234',/^git\s+revert\s+abc1234\b/m),
      bad(/\breset\s+--hard\b/,'reset --hard verwirft Änderungen unwiderruflich. Nimm restore oder revert.'),
      bad(/\bgit\s+push\b[^\n]*(?:--force|-f)\b/,'Kein Force-Push: Er überschreibt fremde Arbeit.'),
      bad(/^git\s+rm\s+secrets\.txt\b/m,'git rm löscht die Datei. Gefragt war: nur aus dem Staging nehmen.'),
      bad(/^git\s+checkout\s+--\s+\./m,'Das verwirft alle lokalen Änderungen. Gefragt war nur secrets.txt im Staging.')
    ],
    solution:L('git commit --amend -m "fix(api): handle empty list"','git restore --staged secrets.txt','git revert abc1234'),
    hint:'Unveröffentlichte Commits darfst du ändern (amend). Veröffentlichte machst du mit einem neuen Commit rückgängig (revert).',
    why:'Die Regel lautet: Geschichte, die andere schon haben, wird nie umgeschrieben. revert hinterlässt eine nachvollziehbare Spur statt eine Lücke.'}
];
W.add('git',tasks);
W.add('git',[
{id:'git-w3',modules:['m65'],level:'schwer',type:'write',language:'shell',rows:14,
  title:'Das Repository nur lesen und verstehen',
  text:'Schreibe fünf Git-Befehle, die ein Repository untersuchen, ohne etwas zu verändern.',
  details:['1. Welchen Objekttyp hat HEAD? (git cat-file -t HEAD)','2. Welche Dateien und Ordner enthält der Baum von HEAD? (git ls-tree HEAD)','3. Wo stand HEAD zuletzt? Zeige die letzten fünf Einträge. (git reflog -n 5)','4. Wer hat Zeile 12 von app.js zuletzt geändert? (git blame -L 12,12 app.js)','5. Kurzer Status mit Branch-Infos. (git status --short --branch)','Reihenfolge wie oben, jeweils ein Befehl pro Zeile. Es dürfen keine verändernden Befehle vorkommen.'],
  starter:L('# Schreibe hier deine Git-Befehle','',''),
  rules:[
    need('git cat-file -t HEAD',/^git\s+cat-file\s+-t\s+HEAD\s*$/m),
    need('git ls-tree HEAD',/^git\s+ls-tree\s+HEAD\s*$/m),
    need('git reflog -n 5',/^git\s+reflog\s+(?:-n\s*5|-5|--max-count=5)\s*$/m),
    need('git blame -L 12,12 app.js',/^git\s+blame\s+-L\s*12,12\s+(?:--\s+)?app\.js\s*$/m),
    need('git status --short --branch',/^git\s+status\s+(?:--short\s+--branch|-sb|-s\s+-b|--branch\s+--short)\s*$/m),
    bad(/\bgit\s+(?:commit|push|reset|checkout|switch|merge|rebase|clean|rm|add|stash|gc|prune|restore)\b/,'Diese Aufgabe liest nur. Dieser Befehl verändert das Repository.'),
    bad(/\bgit\s+log\b[^\n]*(?:--all\s+)?--(?:force|delete)/,'Zum Lesen braucht es keine Optionen, die verändern.')
  ],
  solution:L('git cat-file -t HEAD','git ls-tree HEAD','git reflog -n 5','git blame -L 12,12 app.js','git status --short --branch'),
  hint:'Die „Plumbing“-Befehle (cat-file, ls-tree) zeigen die Objekte hinter den Commits, reflog zeigt die Bewegungen von HEAD.',
  why:'Wer die Objekte (Commit, Baum, Blob) und das Reflog kennt, kann auch scheinbar verlorene Arbeit wiederfinden und Fehlermeldungen einordnen.'},
{id:'git-w4',modules:['m62'],level:'schwer',type:'write',language:'shell',rows:16,
  title:'Feature-Branch aktualisieren und zusammenführen',
  text:'Schreibe die Befehlsfolge: Dein privater Branch feature/search soll auf den neuesten Stand von origin/main gebracht und dann in main übernommen werden.',
  details:['Wechsle auf feature/search (git switch) und hole die Änderungen (git fetch origin).','Setze den Branch auf origin/main auf (git rebase origin/main). Es gibt einen Konflikt in src/search.js: Markiere ihn als gelöst (git add src/search.js) und mache weiter (git rebase --continue).','Wechsle auf main und führe feature/search mit einem echten Merge-Commit zusammen (git merge --no-ff feature/search).','Lösche den fertigen Branch sicher mit git branch -d feature/search (nicht -D).','Kein Force-Push, kein interaktives Rebase.'],
  starter:L('# Schreibe hier deine Git-Befehle','',''),
  rules:[
    need('git switch feature/search',/^git\s+(?:switch|checkout)\s+feature\/search\s*$/m),
    need('git fetch origin vor dem Rebase',/^git\s+fetch\s+origin\s*$[\s\S]*^git\s+rebase\s+origin\/main\s*$/m),
    need('git rebase origin/main',/^git\s+rebase\s+origin\/main\s*$/m),
    need('git add src/search.js',/^git\s+add\s+src\/search\.js\s*$/m),
    need('git rebase --continue',/^git\s+rebase\s+--continue\s*$/m),
    need('git switch main vor dem Merge',/^git\s+(?:switch|checkout)\s+main\s*$[\s\S]*^git\s+merge\s+--no-ff\s+feature\/search\s*$/m),
    need('git branch -d feature/search',/^git\s+branch\s+-d\s+feature\/search\s*$/m),
    bad(/\bgit\s+branch\s+-D\b/,'-D löscht auch ungemergte Arbeit ohne Rückfrage. Nimm -d: Git bricht ab, wenn noch etwas fehlt.'),
    bad(/\bgit\s+push\b[^\n]*(?:--force\b|\s-f\b)/,'Kein Force-Push: Er überschreibt fremde Arbeit.'),
    bad(/\bgit\s+rebase\s+(?:-i|--interactive)\b/,'Ein interaktives Rebase öffnet einen Editor und ist hier nicht gewünscht.'),
    bad(/^git\s+add\s+(?:-A|--all|\.)\s*$/m,'Staged nur die Konfliktdatei, nicht alles.')
  ],
  solution:L('git switch feature/search','git fetch origin','git rebase origin/main','git add src/search.js','git rebase --continue','git switch main','git merge --no-ff feature/search','git branch -d feature/search'),
  hint:'Erst fetch, damit origin/main aktuell ist. Rebase schreibt nur deinen PRIVATEN Branch um, in main wird anschließend zusammengeführt.',
  why:'Rebase hält die Historie linear, merge --no-ff dokumentiert, dass ein Feature zusammenkam. Die Regel: nie umschreiben, was andere schon haben.'},
{id:'git-w5',modules:['m63'],level:'schwer',type:'write',language:'shell',rows:16,
  title:'Abgelehnten Push sauber lösen',
  text:'Dein git push origin main wurde mit „non-fast-forward“ abgelehnt, weil jemand anderes zuerst gepusht hat. Schreibe die Befehle für den sauberen Weg.',
  details:['Hole zuerst den Stand des Servers: git fetch origin.','Sieh nach, welche Commits dir fehlen: git log --oneline HEAD..origin/main.','Lege deine lokalen Commits obenauf: git pull --rebase origin main.','Lade danach hoch: git push origin main.','Verwende keine Force-Option. Auch --force-with-lease ist hier nicht nötig.'],
  starter:L('# Schreibe hier deine Git-Befehle','',''),
  rules:[
    need('git fetch origin',/^git\s+fetch\s+origin\s*$/m),
    need('git log --oneline HEAD..origin/main',/^git\s+log\s+--oneline\s+HEAD\.\.origin\/main\s*$/m),
    need('git pull --rebase origin main',/^git\s+pull\s+--rebase\s+origin\s+main\s*$/m),
    need('git push origin main (zuletzt)',/^git\s+push\s+origin\s+main\s*$(?![\s\S]*^git\s+pull)/m),
    bad(/\bgit\s+push\b[^\n]*(?:--force(?:-with-lease)?\b|\s-f\b)/,'Force-Optionen überschreiben die Arbeit anderer oder verdecken das Problem. Hole erst deren Commits.'),
    bad(/^git\s+pull\s*$/m,'Ein blankes git pull erzeugt einen unnötigen Merge-Commit. Sage, was du willst: --rebase.'),
    bad(/\bgit\s+reset\s+--hard\b/,'reset --hard verwirft deine lokalen Commits.')
  ],
  solution:L('git fetch origin','git log --oneline HEAD..origin/main','git pull --rebase origin main','git push origin main'),
  hint:'Der Server lehnt ab, weil dir seine neuen Commits fehlen. Hole sie, setze deine darauf und lade dann hoch.',
  why:'Ein abgelehnter Push ist ein Schutz, kein Fehler. Wer erst integriert und dann pusht, überschreibt nie die Arbeit der anderen.'}
]);
})();
