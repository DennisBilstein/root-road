// Fall 5: Betrieb. Konfiguration, Geheimnisse, Gesundheitscheck, Protokolle und sauberes Beenden.
const yesNo = (value) => (value ? 'ja' : 'nein');
const fakeValue = ['demo', 'wert', 'nicht', 'echt'].join('-'); // Platzhalter, zur Laufzeit zusammengesetzt

export default async function run(ctx) {
  const out = [];
  const dir = ctx.copyApp();
  const good = ctx.name('good');
  ctx.build(good, dir, { target: 'runtime' });

  // Konfiguration über Umgebungsvariablen: bequem, aber für jeden mit Docker-Zugriff in inspect sichtbar.
  const name = ctx.name('env');
  ctx.run(['-d', '--name', name, '-e', 'APP_MODE=lab', good]);
  out.push(`Gesundheitscheck wird healthy: ${yesNo(await ctx.waitHealthy(name))}`);
  out.push(`Konfiguration im Dienst: ${JSON.parse(ctx.exec(name, "fetch('http://127.0.0.1:3000/info').then((r) => r.text()).then(console.log)").out).mode}`);
  out.push(`Variable in docker inspect sichtbar: ${yesNo(ctx.docker(['inspect', '--format', '{{json .Config.Env}}', name]).out.includes('APP_MODE=lab'))}`);
  const events = ctx.docker(['logs', name]).out.split('\n').map((line) => JSON.parse(line).event);
  out.push(`Protokoll auf stdout (docker logs), Ereignisse: ${events.join(', ')}`);

  // Geheimnisse im Build: Ein Build-Argument steht im Verlauf des Images, ein Secret-Mount nicht.
  const withArg = ctx.name('arg');
  const withSecret = ctx.name('secret');
  const argDir = ctx.copyApp();
  const fs = await import('node:fs');
  const path = await import('node:path');
  fs.writeFileSync(path.join(argDir, 'Dockerfile.arg'), 'FROM node:24-slim\nARG API_TOKEN\nRUN echo "Build mit Argument"\n');
  fs.writeFileSync(path.join(argDir, 'Dockerfile.secret'), 'FROM node:24-slim\nRUN --mount=type=secret,id=api_token test -s /run/secrets/api_token && echo "Build mit Secret-Mount"\n');
  fs.writeFileSync(path.join(argDir, 'token.txt'), fakeValue);
  ctx.build(withArg, argDir, { file: 'Dockerfile.arg', args: ['--build-arg', `API_TOKEN=${fakeValue}`] });
  ctx.build(withSecret, argDir, { file: 'Dockerfile.secret', args: ['--secret', `id=api_token,src=${path.join(argDir, 'token.txt')}`] });
  const history = (tag) => ctx.docker(['history', '--no-trunc', '--format', '{{.CreatedBy}}', tag]).out;
  out.push(`Wert steht im Image-Verlauf (Build-Argument): ${yesNo(history(withArg).includes(fakeValue))}`);
  out.push(`Wert steht im Image-Verlauf (Secret-Mount): ${yesNo(history(withSecret).includes(fakeValue))}`);

  // Beenden: docker stop sendet SIGTERM und wartet die Frist ab, bevor SIGKILL folgt.
  const stopCase = async (suffix, extra) => {
    const container = ctx.name(suffix);
    ctx.run(['-d', '--name', container, '--stop-timeout', '3', ...extra]);
    await ctx.waitHealthy(container);
    const started = Date.now();
    ctx.docker(['stop', container]);
    const seconds = (Date.now() - started) / 1000;
    const code = ctx.docker(['inspect', '--format', '{{.State.ExitCode}}', container]).out;
    return { code, quick: seconds < 3 };
  };
  const handled = await stopCase('stop1', [good]);
  out.push(`Mit Signalbehandlung: Exit-Code ${handled.code}, vor Ablauf der Frist beendet: ${yesNo(handled.quick)}`);
  const ignored = await stopCase('stop2', ['-e', 'APP_HANDLE_SIGNALS=0', good]);
  out.push(`Ohne Signalbehandlung als PID 1: Exit-Code ${ignored.code}, vor Ablauf der Frist beendet: ${yesNo(ignored.quick)}`);
  const withInit = await stopCase('stop3', ['--init', '-e', 'APP_HANDLE_SIGNALS=0', good]);
  out.push(`Ohne Signalbehandlung mit --init: Exit-Code ${withInit.code}, vor Ablauf der Frist beendet: ${yesNo(withInit.quick)}`);
  return out.join('\n');
}
