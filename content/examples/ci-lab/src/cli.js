// Prüft Workflow-Dateien (.yml/.yaml). Jeder Pfad darf eine Datei oder ein Ordner sein; ohne Angabe wird .github/workflows geprüft.
// Exit-Code 1 bei Fehlern (error), 2 ohne Dateien; Warnungen (warn) geben nur Hinweise aus.
import fs from 'node:fs';
import path from 'node:path';
import { lintWorkflow } from './lint-workflow.js';

const files = [];
for (const arg of process.argv.slice(2).length ? process.argv.slice(2) : ['.github/workflows']) {
  const target = path.resolve(arg);
  if (fs.statSync(target).isDirectory()) files.push(...fs.readdirSync(target).filter((name) => /\.ya?ml$/.test(name)).sort().map((name) => path.join(target, name)));
  else files.push(target);
}
if (!files.length) { console.error('Keine Workflow-Dateien gefunden'); process.exit(2); }
let errors = 0;
for (const file of files) {
  const findings = lintWorkflow(fs.readFileSync(file, 'utf8'));
  const name = path.basename(file);
  for (const finding of findings) {
    if (finding.severity === 'error') errors += 1;
    console.log(`${name}:${finding.line}  ${finding.severity}  ${finding.rule}  ${finding.message}`);
  }
  if (!findings.length) console.log(`${name}: keine Befunde`);
}
process.exit(errors ? 1 : 0);
