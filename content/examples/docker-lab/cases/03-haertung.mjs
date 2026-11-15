// Fall 3: Laufzeit härten. Weniger Rechte, schreibgeschütztes Dateisystem, begrenzte Ressourcen.
const yesNo = (value) => (value ? 'ja' : 'nein');
const probe = `
const fs = require('node:fs');
const status = fs.readFileSync('/proc/self/status', 'utf8');
const field = (name) => (status.match(new RegExp('^' + name + ':\\\\s*(.*)$', 'm')) || [])[1];
const result = { uid: process.getuid(), capEff: field('CapEff'), noNewPrivs: field('NoNewPrivs') };
for (const [key, file] of [['appWrite', '/app/x'], ['tmpWrite', '/tmp/x']]) {
  try { fs.writeFileSync(file, '1'); result[key] = 'ok'; } catch (error) { result[key] = error.code; }
}
result.interfaces = Object.keys(require('node:os').networkInterfaces()).sort();
console.log(JSON.stringify(result));`;

export default async function run(ctx) {
  const out = [];
  const dir = ctx.copyApp();
  const good = ctx.name('good');
  const naive = ctx.name('naive');
  ctx.build(good, dir, { target: 'runtime' });
  ctx.build(naive, dir, { file: 'Dockerfile.naive' });
  const parse = (result) => JSON.parse(result.out.split('\n').pop());

  const strict = parse(ctx.run(['--rm', '--read-only', '--tmpfs', '/tmp', '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges', '--network', 'none', '--entrypoint', 'node', good, '-e', probe]));
  out.push(`Gehärtet: Benutzer ${strict.uid}, Rechte (CapEff) ${strict.capEff}, no-new-privileges ${strict.noNewPrivs}`);
  out.push(`Gehärtet: Schreiben nach /app: ${strict.appWrite}, Schreiben nach /tmp (tmpfs): ${strict.tmpWrite}, Netzwerkschnittstellen: ${strict.interfaces.join(', ')}`);

  const loose = parse(ctx.run(['--rm', '--entrypoint', 'node', naive, '-e', probe]));
  out.push(`Naives Image mit Standardeinstellungen: Benutzer ${loose.uid}, Rechte ungleich null: ${yesNo(/[1-9a-f]/i.test(loose.capEff))}, Schreiben nach /app: ${loose.appWrite}`);

  // Speichergrenze: Das Überschreiten beendet den Prozess (Exit 137) und wird als OOMKilled vermerkt.
  const name = ctx.name('oom');
  ctx.run(['--name', name, '--memory', '64m', '--memory-swap', '64m', '--entrypoint', 'node', good, '-e', "const big = []; while (true) big.push(Buffer.alloc(8 * 1024 * 1024, 1));"]);
  const state = ctx.docker(['inspect', '--format', '{{.State.ExitCode}} {{.State.OOMKilled}} {{.HostConfig.Memory}}', name]).out;
  out.push(`Speichergrenze 64 MiB: Exit-Code, OOMKilled, Grenze in Bytes: ${state}`);
  return out.join('\n');
}
