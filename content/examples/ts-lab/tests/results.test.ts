import { test } from 'node:test';
import assert from 'node:assert/strict';
import { area, describePort, parsePort } from '../src/advanced/results.ts';

test('area für alle Formen', () => {
  assert.equal(area({ kind: 'rect', width: 3, height: 4 }), 12);
  assert.equal(area({ kind: 'square', side: 5 }), 25);
  assert.equal(Math.round(area({ kind: 'circle', radius: 1 }) * 100) / 100, 3.14);
});

test('area wirft bei einer unbekannten Form zur Laufzeit', () => {
  // Von außen kann trotz Typen Unerwartetes ankommen (z. B. aus JSON): assertNever fängt das ab.
  assert.throws(() => area({ kind: 'triangle' } as never), /Unerwarteter Wert/);
});

test('parsePort: Normal-, Grenz- und Fehlerfälle', () => {
  assert.deepEqual(parsePort('8080'), { ok: true, value: 8080 });
  assert.equal(describePort('1'), 'Port 1');
  assert.equal(describePort('65535'), 'Port 65535');
  assert.match(describePort('0'), /außerhalb/);
  assert.match(describePort('65536'), /außerhalb/);
  assert.match(describePort('80a'), /keine Zahl/);
  assert.match(describePort(''), /keine Zahl/);
});
