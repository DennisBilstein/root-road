// Fall 4: Daten und Netzwerk. Der Container-Speicher verschwindet mit dem Container, ein Volume nicht; Namen lösen nur im selben Netzwerk auf.
const yesNo = (value) => (value ? 'ja' : 'nein');
const get = (path, method = 'GET') => `fetch('http://127.0.0.1:3000${path}', { method: '${method}' }).then((r) => r.text()).then(console.log)`;

export default async function run(ctx) {
  const out = [];
  const dir = ctx.copyApp();
  const good = ctx.name('good');
  ctx.build(good, dir, { target: 'runtime' });
  const start = (suffix, extra = []) => {
    const name = ctx.name(suffix);
    ctx.run(['-d', '--name', name, ...extra, good]);
    return name;
  };

  // Ohne Volume: Der Zähler liegt im beschreibbaren Container-Speicher und geht mit dem Container verloren.
  const plain = start('plain');
  await ctx.waitHealthy(plain);
  ctx.exec(plain, get('/visit', 'POST'));
  const plainSecond = JSON.parse(ctx.exec(plain, get('/visit', 'POST')).out).visits;
  ctx.docker(['rm', '-f', plain]);
  const plainAgain = start('plain2');
  await ctx.waitHealthy(plainAgain);
  out.push(`Ohne Volume: Zähler vor dem Entfernen ${plainSecond}, im neuen Container ${JSON.parse(ctx.exec(plainAgain, get('/info')).out).visits}`);

  // Mit Volume: Der Zähler überlebt das Entfernen des Containers.
  const volume = ctx.name('data');
  ctx.docker(['volume', 'create', '--label', 'rootpfad.lab=docker-lab', volume]);
  ctx.track.volume(volume);
  const first = start('vol1', ['-v', `${volume}:/data`, '--read-only']);
  await ctx.waitHealthy(first);
  ctx.exec(first, get('/visit', 'POST'));
  ctx.exec(first, get('/visit', 'POST'));
  ctx.docker(['rm', '-f', first]);
  const second = start('vol2', ['-v', `${volume}:/data`, '--read-only']);
  await ctx.waitHealthy(second);
  const third = JSON.parse(ctx.exec(second, get('/visit', 'POST')).out).visits;
  out.push(`Mit Volume (Root-Dateisystem schreibgeschützt): Zähler im zweiten Container nach einem weiteren Besuch: ${third}`);

  // Netzwerk: In einem selbst angelegten Netzwerk lösen Containernamen auf; ein Container in einem anderen Netzwerk erreicht ihn nicht.
  const network = ctx.name('net');
  const other = ctx.name('other');
  for (const name of [network, other]) { ctx.docker(['network', 'create', '--label', 'rootpfad.lab=docker-lab', name]); ctx.track.network(name); }
  const api = ctx.name('api');
  ctx.run(['-d', '--name', api, '--network', network, '--network-alias', 'api', '-p', '127.0.0.1::3000', good]);
  await ctx.waitHealthy(api);
  const reach = (net) => ctx.run(['--rm', '--network', net, '--entrypoint', 'node', good, '-e', "fetch('http://api:3000/healthz', { signal: AbortSignal.timeout(3000) }).then((r) => console.log('status ' + r.status)).catch((e) => console.log('Fehler ' + (e.cause?.code ?? e.name)))"]).out;
  out.push(`Gleiches Netzwerk: ${reach(network)}`);
  out.push(`Anderes Netzwerk: ${/^Fehler/.test(reach(other)) ? 'nicht erreichbar' : 'erreichbar'}`);

  // Veröffentlichter Port: an 127.0.0.1 gebunden, damit nur der eigene Rechner zugreifen kann.
  const mapping = ctx.docker(['port', api, '3000/tcp']).out.split('\n')[0];
  const [host, hostPort] = mapping.split(':');
  const answer = await (await fetch(`http://127.0.0.1:${hostPort}/healthz`)).json();
  out.push(`Veröffentlicht an 127.0.0.1: ${yesNo(host === '127.0.0.1')}, Antwort vom Host: ${answer.status}`);
  return out.join('\n');
}
