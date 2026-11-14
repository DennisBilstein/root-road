import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { lateTimer, orderInsideIo } from '../src/runtime/loop-order.js';
import { run } from '../src/runtime/cli.js';

const cli = fileURLToPath(new URL('../src/runtime/cli.js', import.meta.url));

function orderOf(file) {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL(`../src/runtime/${file}`, import.meta.url))], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

test('Reihenfolge der Warteschlangen: Microtasks vor Timern, aber nextTick/Promise je nach Modulart', () => {
  // ES-Modul: Das Modul selbst läuft schon als Promise-Job, deshalb kommt die Promise-Microtask zuerst.
  assert.match(orderOf('order.mjs'), /^sync > promise > nextTick > (timeout > immediate|immediate > timeout)$/);
  // CommonJS: process.nextTick hat Vorrang vor Promise-Microtasks.
  assert.match(orderOf('order.cjs'), /^sync > nextTick > promise > (timeout > immediate|immediate > timeout)$/);
});

test('Im I/O-Callback läuft setImmediate vor dem 0-ms-Timer', async () => {
  assert.deepEqual(await orderInsideIo(cli), ['immediate', 'timeout']);
});

test('Ein blockierter Event Loop verspätet Timer', async () => {
  const waited = await lateTimer(10, 80);
  assert.ok(waited >= 80, `Timer kam nach ${waited} ms, erwartet >= 80`);
});

test('cli.run: Normal-, Grenz- und Fehlerfall', () => {
  assert.deepEqual(run(['Ada'], {}), { code: 0, out: 'Hallo Ada!\n', err: '' });
  assert.equal(run(['-u', '-n', '2'], { USER_NAME: 'Bo' }).out, 'HALLO BO!\nHALLO BO!\n');
  assert.equal(run(['-n', '100'], {}).out.split('\n').length, 101);
  for (const bad of ['0', '101', '1.5', 'x']) assert.equal(run(['-n', bad], {}).code, 2, bad);
});

test('cli als Programm: Exit-Codes und stderr', () => {
  const ok = spawnSync(process.execPath, [cli, 'Ada'], { encoding: 'utf8' });
  assert.equal(ok.status, 0);
  assert.equal(ok.stdout, 'Hallo Ada!\n');
  const bad = spawnSync(process.execPath, [cli, '--times', '0'], { encoding: 'utf8' });
  assert.equal(bad.status, 2);
  assert.match(bad.stderr, /ganze Zahl/);
  const unknown = spawnSync(process.execPath, [cli, '--nope'], { encoding: 'utf8' });
  assert.equal(unknown.status, 64);
  assert.match(unknown.stderr, /Unknown option/);
  assert.equal(execFileSync(process.execPath, [cli], { encoding: 'utf8', env: { ...process.env, USER_NAME: 'Cy' } }), 'Hallo Cy!\n');
});
