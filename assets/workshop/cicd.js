/* Werkstattaufgaben der Spur cicd. Wird erst geladen, wenn die Spur in der Werkstatt geöffnet wird. */
(function(){
var W=window.RP_WS,L=W.L,need=W.need,bad=W.bad;
W.add('cicd',[
{id:'cicd-w1',modules:['ci-m1'],level:'schwer',type:'write',language:'yaml',rows:36,
  title:'Sicherer CI-Workflow',
  text:'Schreibe .github/workflows/ci.yml: Tests bei Pull Requests und Pushes auf main, mit minimalen Rechten, gepinnten Actions und sicherer Behandlung von Eingaben.',
  details:['name: ci. Auslöser: on: pull_request und push auf Branch main.','Rechte auf Workflow-Ebene: permissions: contents: read (nichts darüber hinaus).','concurrency mit group: ci-${{ github.ref }} und cancel-in-progress: true.','Job test auf ubuntu-latest mit timeout-minutes: 15.','Actions werden auf einen vollen 40-stelligen Commit-SHA gepinnt, der Versionsname steht als Kommentar. Für die Aufgabe nimmst du den Platzhalter 0123456789abcdef0123456789abcdef01234567 (im echten Projekt trägst du den SHA der geprüften Version ein): actions/checkout (# v4) mit persist-credentials: false, dann actions/setup-node (# v4) mit node-version-file: .nvmrc und cache: npm.','Danach run: npm ci und run: npm test.','Ein weiterer Schritt "Titel prüfen" übergibt den PR-Titel über env (PR_TITLE: ${{ github.event.pull_request.title }}) und prüft ihn in run mit echo "$PR_TITLE" | grep -E \'^(feat|fix|chore)\'. Der Titel darf nie direkt im run-Text stehen.'],
  starter:L('# Schreibe hier deinen Workflow','',''),
  rules:[
    need('name: ci',/^name:\s*ci\s*$/m),
    need('on: pull_request und push auf main',/^on:\s*\n\s+pull_request:\s*\n\s+push:\s*\n\s+branches:\s*\[\s*main\s*\]\s*$/m),
    need('permissions: contents: read',/^permissions:\s*\n\s+contents:\s*read\s*$/m),
    need('concurrency mit Abbruch',/^concurrency:\s*\n\s+group:\s*ci-\$\{\{\s*github\.ref\s*\}\}\s*\n\s+cancel-in-progress:\s*true\s*$/m),
    need('Job test auf ubuntu-latest',/^jobs:\s*\n\s+test:\s*\n\s+runs-on:\s*ubuntu-latest\s*$/m),
    need('timeout-minutes: 15',/^\s+timeout-minutes:\s*15\s*$/m),
    need('checkout auf SHA gepinnt',/uses:\s*actions\/checkout@[0-9a-f]{40}\b/),
    need('persist-credentials: false',/persist-credentials:\s*false\b/),
    need('setup-node auf SHA gepinnt',/uses:\s*actions\/setup-node@[0-9a-f]{40}\b/),
    need('node-version-file und cache',/node-version-file:\s*\.nvmrc\s*\n\s+cache:\s*npm\b/),
    need('npm ci und npm test',/run:\s*npm\s+ci\s*\n[\s\S]*run:\s*npm\s+test\b/),
    need('PR-Titel über env',/env:\s*\n\s+PR_TITLE:\s*\$\{\{\s*github\.event\.pull_request\.title\s*\}\}/),
    need('Prüfung mit "$PR_TITLE"',/run:\s*echo\s+"\$PR_TITLE"\s*\|\s*grep\s+-E\s+'\^\(feat\|fix\|chore\)'/),
    bad(/uses:\s*[\w.-]+\/[\w.-]+@(?![0-9a-f]{40}\b)\S+/,'Tags und Branches kann der Autor der Action nachträglich verschieben. Pinne auf den vollen Commit-SHA.'),
    bad(/^permissions:\s*write-all|:\s*write\b/m,'Vergib keine Schreibrechte, die der Job nicht braucht.'),
    bad(/^(?!\s*\w+:\s*\$\{\{).*\$\{\{\s*github\.(?:event\.(?:pull_request\.(?:title|body|head\.ref)|issue\.(?:title|body)|comment\.body)|head_ref)/m,'Daten aus Pull Requests nie direkt im Skript verwenden (Script-Injection): Übergib sie über env und nutze die Variable in Anführungszeichen.'),
    bad(/pull_request_target\b/,'pull_request_target läuft mit Schreibrechten und Geheimnissen auf Fremdcode. Hier genügt pull_request.'),
    bad(/\bcurl\b[^\n]*\|\s*(?:sh|bash)\b/,'Keine ungeprüften Skripte aus dem Netz ausführen.')
  ],
  solution:L('name: ci','on:','  pull_request:','  push:','    branches: [main]','','permissions:','  contents: read','','concurrency:','  group: ci-${{ github.ref }}','  cancel-in-progress: true','','jobs:','  test:','    runs-on: ubuntu-latest','    timeout-minutes: 15','    steps:','      - uses: actions/checkout@0123456789abcdef0123456789abcdef01234567 # v4','        with:','          persist-credentials: false','      - uses: actions/setup-node@0123456789abcdef0123456789abcdef01234567 # v4','        with:','          node-version-file: .nvmrc','          cache: npm','      - run: npm ci','      - run: npm test','      - name: Titel prüfen','        env:','          PR_TITLE: ${{ github.event.pull_request.title }}','        run: echo "$PR_TITLE" | grep -E \'^(feat|fix|chore)\''),
  hint:'Alles, was ein Fremder beeinflussen kann (PR-Titel, Branch-Name), ist Eingabe: Über env wird sie zu einer Variable statt zu Skripttext.',
  why:'CI-Workflows laufen mit Zugriff auf Code und oft auf Geheimnisse. Minimale Rechte, gepinnte Actions und geschützte Eingaben verhindern, dass ein manipulierter PR oder eine verschobene Action die Pipeline übernimmt.'}
]);
})();
