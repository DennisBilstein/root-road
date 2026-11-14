import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { createLogger, redact } from '../src/ops/logger.js';
import { fib, fibInWorker } from '../src/ops/worker-pool.js';

const main = fileURLToPath(new URL('../src/ops/main.js', import.meta.url));

// loadConfig lehnt PORT=0 ab, deshalb zuerst einen freien Port beim Betriebssystem erfragen.
async function freePort() {
  const probe = createServer();
  probe.listen(0, '127.0.0.1');
  await once(probe, 'listening');
  const { port } = probe.address();
  probe.close();
  await once(probe, 'close');
  return port;
}

test('Logger: JSON-Zeilen, Level-Filter, Geheimnisse geschwärzt', () => {
  const lines = [];
  const log = createLogger({ level: 'info', write: (l) => lines.push(JSON.parse(l)), now: () => new Date('2026-11-14T10:00:00Z') });
  log.debug('wird gefiltert');
  log.info('Anmeldung', { user: 'ada', password: 'hunter2', headers: { authorization: 'Bearer abc', accept: 'json' } });
  log.error('Fehler', { error: new TypeError('kaputt') });
  assert.equal(lines.length, 2);
  assert.deepEqual(lines[0], { time: '2026-11-14T10:00:00.000Z', level: 'info', message: 'Anmeldung', user: 'ada', password: '[geschwärzt]', headers: { authorization: '[geschwärzt]', accept: 'json' } });
  assert.deepEqual(lines[1]?.error, { name: 'TypeError', message: 'kaputt' }); // kein Stacktrace mit Pfaden im Log
  assert.ok(!JSON.stringify(lines).includes('hunter2'));
  assert.equal(redact(null), null);
});

test('Worker Thread liefert dasselbe Ergebnis, lehnt falsche Eingaben ab', async () => {
  assert.equal(await fibInWorker(20), fib(20));
  assert.equal(await fibInWorker(0), 0);
  await assert.rejects(fibInWorker(-1), RangeError);
  await assert.rejects(fibInWorker(46), RangeError);
  await assert.rejects(fibInWorker(1.5), RangeError);
});

test('Ungültige Konfiguration beendet mit Exit-Code 78 und nennt das Problem', () => {
  const result = spawnSync(process.execPath, [main], { encoding: 'utf8', env: { ...process.env, PORT: 'abc' } });
  assert.equal(result.status, 78);
  assert.match(result.stdout, /PORT muss eine ganze Zahl/);
});

test('SIGTERM: laufende Anfrage wird fertig, danach Exit-Code 0', async () => {
  const wanted = await freePort();
  const child = spawn(process.execPath, [main], { env: { ...process.env, PORT: String(wanted) }, stdio: ['ignore', 'pipe', 'inherit'] });
  let output = '';
  child.stdout.setEncoding('utf8');
  const ready = new Promise((resolve) => child.stdout.on('data', (chunk) => {
    output += chunk;
    const match = /"port":(\d+)/.exec(output);
    if (match) resolve(Number(match[1]));
  }));
  const port = await ready;
  const health = await fetch(`http://127.0.0.1:${port}/health`);
  assert.equal(health.status, 200);

  child.kill('SIGTERM');
  const [code] = await once(child, 'exit');
  assert.equal(code, 0);
  assert.match(output, /Beenden angefordert/);
  assert.match(output, /"message":"Beendet"/);
  await assert.rejects(fetch(`http://127.0.0.1:${port}/health`)); // Port ist zu
});
