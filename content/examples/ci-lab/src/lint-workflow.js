// Zeilenbasierter Linter für GitHub-Actions-Workflows. Er liest den Text, ohne YAML vollständig zu parsen, und prüft sechs
// Regeln, die in der Praxis oft Sicherheits- oder Betriebsprobleme sind. Das ist eine Heuristik: Sie findet typische Muster,
// ersetzt aber keinen YAML-Parser und keine Werkzeuge wie actionlint oder zizmor.

// Felder, die Angreifer kontrollieren können (Titel, Branchnamen, Kommentare, Commit-Nachrichten). Sie dürfen nie direkt in einem Shell-Skript stehen.
const untrusted = [
  /github\.event\.issue\.(title|body)/,
  /github\.event\.pull_request\.(title|body|head\.ref|head\.label|head\.repo\.default_branch)/,
  /github\.event\.(comment|review|review_comment)\.body/,
  /github\.event\.head_commit\.(message|author\.(email|name))/,
  /github\.event\.commits\[.*\]\.message/,
  /github\.head_ref/,
];
const isSha = (ref) => /^[0-9a-f]{40}$/.test(ref);
const firstParty = (name) => /^(actions|github)\//.test(name);

/** @returns {{rule: string, severity: 'error'|'warn', line: number, message: string}[]} */
export function lintWorkflow(text) {
  const lines = text.split('\n');
  const findings = [];
  const add = (rule, severity, line, message) => findings.push({ rule, severity, line, message });

  const hasTopLevelPermissions = lines.some((line) => /^permissions:/.test(line));
  const usesPullRequestTarget = lines.some((line) => /^\s*(pull_request_target:|on:\s*\[?.*pull_request_target)/.test(line) || /^\s*-\s*pull_request_target\b/.test(line));

  // Aufgaben (jobs): Schlüssel mit zwei Leerzeichen Einzug unter "jobs:".
  const jobsAt = lines.findIndex((line) => /^jobs:\s*$/.test(line));
  const jobs = [];
  if (jobsAt >= 0) {
    for (let index = jobsAt + 1; index < lines.length; index += 1) {
      if (/^\S/.test(lines[index])) break;
      const match = /^ {2}([A-Za-z0-9_-]+):\s*$/.exec(lines[index]);
      if (match) jobs.push({ name: match[1], start: index, end: lines.length });
    }
    jobs.forEach((job, position) => { if (jobs[position + 1]) job.end = jobs[position + 1].start; });
  }

  if (!hasTopLevelPermissions) {
    const everyJobHasOwn = jobs.length > 0 && jobs.every((job) => lines.slice(job.start, job.end).some((line) => /^ {4}permissions:/.test(line)));
    if (!everyJobHasOwn) add('missing-permissions', 'warn', 1, 'Kein permissions-Block: Das GITHUB_TOKEN erhält die Standardrechte des Repositories. Setze permissions: contents: read und erweitere nur gezielt.');
  }

  lines.forEach((line, index) => {
    const number = index + 1;
    if (/^\s*permissions:\s*write-all\s*$/.test(line)) add('write-all', 'error', number, 'permissions: write-all gibt dem Token alle Schreibrechte. Nenne nur die Rechte, die der Job braucht.');
    const uses = /^\s*-?\s*uses:\s*([^@\s#]+)@([^\s#]+)/.exec(line);
    if (uses && !uses[1].startsWith('./') && !isSha(uses[2]) && !firstParty(uses[1])) {
      add('unpinned-action', 'error', number, `${uses[1]}@${uses[2]} ist nicht auf einen Commit (40 Zeichen SHA) festgelegt. Ein Tag kann verschoben werden; Fremdcode im Workflow läuft mit Zugriff auf Secrets.`);
    }
  });

  // Skriptblöcke: Zeilen unter "run: |" (oder "run: >") und einzeilige run-Werte.
  for (let index = 0; index < lines.length; index += 1) {
    const match = /^(\s*)(?:-\s+)?run:\s*(.*)$/.exec(lines[index]);
    if (!match) continue;
    const indent = match[1].length + (/^\s*-\s+run:/.test(lines[index]) ? 2 : 0);
    const bodyLines = [];
    if (/^[|>][+-]?$/.test(match[2].trim())) {
      for (let next = index + 1; next < lines.length; next += 1) {
        if (lines[next].trim() !== '' && lines[next].match(/^ */)[0].length <= indent) break;
        bodyLines.push([next, lines[next]]);
      }
    } else bodyLines.push([index, match[2]]);
    for (const [at, body] of bodyLines) {
      if (/\$\{\{[^}]*\}\}/.test(body) && untrusted.some((pattern) => pattern.test(body))) {
        add('script-injection', 'error', at + 1, 'Ein von außen steuerbarer Wert steht direkt im Skript. Übergib ihn über env: und lies die Umgebungsvariable in der Shell, damit sie nicht als Code ausgewertet wird.');
      }
    }
  }

  if (usesPullRequestTarget) {
    lines.forEach((line, index) => {
      if (/ref:\s*\$\{\{\s*github\.(event\.pull_request\.head\.(sha|ref)|head_ref)\s*\}\}/.test(line)) {
        add('pull-request-target-checkout', 'error', index + 1, 'pull_request_target läuft mit Schreibrechten und Secrets des Ziel-Repositories; den Code des Pull Requests dort auszuchecken und auszuführen ist ein bekannter Angriffsweg.');
      }
    });
  }

  for (const job of jobs) {
    const block = lines.slice(job.start, job.end);
    if (!block.some((line) => /^ {4}timeout-minutes:/.test(line)) && !block.some((line) => /^ {4}uses:/.test(line))) {
      add('missing-timeout', 'warn', job.start + 1, `Job ${job.name} hat kein timeout-minutes: Ein hängender Job läuft bis zum Standardlimit (laut Dokumentation 360 Minuten) und verbraucht Laufzeit.`);
    }
  }
  return findings.sort((a, b) => a.line - b.line);
}
