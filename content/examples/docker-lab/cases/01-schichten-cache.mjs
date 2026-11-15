// Fall 1: Schichten und Build-Cache. Die Reihenfolge der Dockerfile-Zeilen entscheidet, was nach einer Änderung neu gebaut werden muss.
const yesNo = (value) => (value ? 'ja' : 'nein');
export default async function run(ctx) {
  const out = [];
  const dir = ctx.copyApp();
  const good = ctx.name('good');
  const naive = ctx.name('naive');
  const installStep = /RUN node -e/;

  const first = ctx.build(good, dir, { target: 'runtime', noCache: true });
  out.push(`Erster Build ohne Cache (Erfolg: ${yesNo(first.ok)}): Installationsschritt übernommen: ${yesNo(first.step(installStep).cached)}`);

  const second = ctx.build(good, dir, { target: 'runtime' });
  out.push(`Zweiter Build, nichts geändert: Installationsschritt übernommen: ${yesNo(second.step(installStep).cached)}, Quelltext-Schritt übernommen: ${yesNo(second.step(/COPY --from=test/).cached)}`);

  const fs = await import('node:fs');
  fs.appendFileSync(`${dir}/src/server.js`, '\n// kleine Änderung am Quelltext\n');
  const third = ctx.build(good, dir, { target: 'runtime' });
  out.push(`Nach Quelltext-Änderung (Dockerfile mit getrennter Reihenfolge): Installationsschritt übernommen: ${yesNo(third.step(installStep).cached)}, Quelltext-Schritt übernommen: ${yesNo(third.step(/COPY --from=test/).cached)}`);

  ctx.build(naive, dir, { file: 'Dockerfile.naive', noCache: true });
  fs.appendFileSync(`${dir}/src/server.js`, '// noch eine Änderung\n');
  const naiveRebuild = ctx.build(naive, dir, { file: 'Dockerfile.naive' });
  out.push(`Nach Quelltext-Änderung (naives Dockerfile: erst alles kopieren): Installationsschritt übernommen: ${yesNo(naiveRebuild.step(installStep).cached)}`);
  return out.join('\n');
}
