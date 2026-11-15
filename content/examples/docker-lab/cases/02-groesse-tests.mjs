// Fall 2: Was ins Image gehört. .dockerignore und mehrstufiger Build halten Unnötiges draußen; fehlschlagende Tests verhindern das Image.
import fs from 'node:fs';
import path from 'node:path';
const yesNo = (value) => (value ? 'ja' : 'nein');

export default async function run(ctx) {
  const out = [];
  const dir = ctx.copyApp();
  fs.writeFileSync(path.join(dir, 'big.bin'), Buffer.alloc(20 * 1024 * 1024, 1)); // 20 MB Ballast im Build-Kontext
  const good = ctx.name('good');
  const naive = ctx.name('naive');

  ctx.build(good, dir, { target: 'runtime' });
  // Gegenbeispiel: ohne .dockerignore kommt der Ballast samt Tests und Dockerfile mit ins Image.
  fs.rmSync(path.join(dir, '.dockerignore'));
  ctx.build(naive, dir, { file: 'Dockerfile.naive' });

  const listing = (tag) => ctx.run(['--rm', '--entrypoint', 'ls', tag, '-A', '/app']).out.split('\n').sort().join(', ');
  out.push(`Inhalt /app (getrennte Stufen mit .dockerignore): ${listing(good)}`);
  out.push(`Inhalt /app (naives Image ohne .dockerignore): ${listing(naive)}`);

  const size = (tag) => Number(ctx.docker(['image', 'inspect', '--format', '{{.Size}}', tag]).out);
  out.push(`Naives Image mindestens 20 MB größer: ${yesNo(size(naive) - size(good) >= 20 * 1024 * 1024)}`);

  // Tests im Build: Ein fehlschlagender Test bricht den Build ab, es entsteht kein Image.
  fs.writeFileSync(path.join(dir, 'tests', 'rot.test.js'), "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\ntest('absichtlich rot', () => assert.equal(1, 2));\n");
  fs.writeFileSync(path.join(dir, '.dockerignore'), 'node_modules\n');
  const broken = ctx.name('broken');
  const failing = ctx.build(broken, dir, { target: 'runtime', noCache: true });
  const exists = ctx.docker(['image', 'inspect', broken]).status === 0;
  out.push(`Build mit rotem Test erfolgreich: ${yesNo(failing.ok)}, Image vorhanden: ${yesNo(exists)}`);
  return out.join('\n');
}
