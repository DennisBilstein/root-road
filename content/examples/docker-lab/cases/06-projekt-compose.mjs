// Fall 6 (Abschlussprojekt): Zwei Dienste mit Docker Compose. Compose baut das Image, wartet auf den Gesundheitscheck und räumt danach auf.
import path from 'node:path';
const yesNo = (value) => (value ? 'ja' : 'nein');

export default async function run(ctx) {
  const out = [];
  const project = ctx.name('compose');
  ctx.track.project(project);
  const env = { ...process.env, LAB_DIR: ctx.here };
  const file = path.join(ctx.here, 'compose.yaml');
  const config = ctx.docker(['compose', '-p', project, '-f', file, 'config', '--quiet'], { env });
  out.push(`Compose-Datei gültig: ${yesNo(config.status === 0)}`);
  const up = ctx.docker(['compose', '-p', project, '-f', file, 'up', '--build', '--abort-on-container-exit', '--exit-code-from', 'checker'], { env });
  const line = `${up.out}\n${up.err}`.split('\n').find((text) => /\{"visits"/.test(text)) ?? '';
  const report = line.slice(line.indexOf('{'));
  out.push(`checker beendet mit Exit-Code: ${up.status}`);
  out.push(`Ausgabe des checkers: ${report}`);
  const state = ctx.docker(['compose', '-p', project, '-f', file, 'ps', '--all', '--format', '{{.Service}}={{.State}}'], { env }).out.split('\n').sort().join(', ');
  out.push(`Zustand der Dienste danach: ${state}`);
  return out.join('\n');
}
