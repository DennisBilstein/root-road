import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { delay, mapLimit, retry, summarize, withTimeout } from '../src/async/tasks.js';

test('delay liefert den Wert und lässt sich abbrechen', async () => {
  assert.equal(await delay(5, 'fertig'), 'fertig');
  const controller = new AbortController();
  const pending = delay(1000, 'nie', { signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
});

test('withTimeout: schnell genug, zu langsam und fremder Fehler', async () => {
  assert.equal(await withTimeout((signal) => delay(5, 'ok', { signal }), 200), 'ok');
  await assert.rejects(withTimeout((signal) => delay(500, 'spät', { signal }), 20), /Zeitlimit von 20 ms überschritten/);
  await assert.rejects(withTimeout(async () => { throw new TypeError('anderer Fehler'); }, 200), TypeError);
});

test('retry: Erfolg nach Fehlversuchen, Wartezeiten wachsen, am Ende wird der letzte Fehler geworfen', async () => {
  const waits = [];
  const sleep = async (ms) => { waits.push(ms); };
  const result = await retry(async (attempt) => {
    if (attempt < 2) throw new Error(`Versuch ${attempt}`);
    return `ok nach ${attempt}`;
  }, { retries: 3, base: 10, sleep });
  assert.equal(result, 'ok nach 2');
  assert.deepEqual(waits, [10, 20]);

  waits.length = 0;
  await assert.rejects(retry(async () => { throw new Error('immer'); }, { retries: 2, base: 5, sleep }), /immer/);
  assert.deepEqual(waits, [5, 10]);

  // Nicht alles lohnt eine Wiederholung: shouldRetry beendet sofort.
  let calls = 0;
  await assert.rejects(retry(async () => { calls += 1; throw new RangeError('Eingabe falsch'); }, { shouldRetry: (e) => !(e instanceof RangeError), sleep }), RangeError);
  assert.equal(calls, 1);
});

test('mapLimit: Reihenfolge bleibt, Parallelität bleibt unter dem Limit', async () => {
  let running = 0;
  let peak = 0;
  const out = await mapLimit([5, 1, 4, 2, 3, 6], 2, async (n) => {
    running += 1;
    peak = Math.max(peak, running);
    await delay(n * 3);
    running -= 1;
    return n * 10;
  });
  assert.deepEqual(out, [50, 10, 40, 20, 30, 60]);
  assert.equal(peak, 2);
  assert.deepEqual(await mapLimit([], 3, async (x) => x), []);
  await assert.rejects(mapLimit([1], 0, async (x) => x), RangeError);
});

test('summarize zeigt Teilerfolge, Promise.all würde beim ersten Fehler abbrechen', async () => {
  const jobs = [Promise.resolve(1), Promise.reject(new Error('a')), Promise.resolve(3), Promise.reject(new Error('b'))];
  assert.deepEqual(await summarize(jobs), { fulfilled: 2, reasons: ['a', 'b'] });
  await assert.rejects(Promise.all([Promise.resolve(1), Promise.reject(new Error('x'))]), /x/);
});

test('Unbehandelte Promise-Ablehnung beendet den Prozess mit Exit-Code 1', () => {
  const file = fileURLToPath(new URL('../src/async/unhandled.js', import.meta.url));
  const crashed = spawnSync(process.execPath, [file], { encoding: 'utf8' });
  assert.equal(crashed.status, 1);
  assert.match(crashed.stderr, /Error: vergessen/);
  const handled = spawnSync(process.execPath, [file, 'handled'], { encoding: 'utf8' });
  assert.equal(handled.status, 0);
  assert.match(handled.stdout, /behandelt: vergessen/);
  assert.match(handled.stdout, /weiter/);
});
