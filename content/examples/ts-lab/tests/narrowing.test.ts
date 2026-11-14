import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compare, idLabel, inRange, lengthOf } from '../src/basics/narrowing.ts';

test('compare ordnet Prioritäten', () => {
  assert.ok(compare('hoch', 'niedrig') > 0);
  assert.equal(compare('mittel', 'mittel'), 0);
});

test('idLabel unterscheidet Text und Zahl', () => {
  assert.equal(idLabel('ab'), 'Kürzel AB');
  assert.equal(idLabel(7), 'Nummer 7');
});

test('lengthOf behandelt null, undefined, Text und Listen', () => {
  assert.equal(lengthOf(null), 0);
  assert.equal(lengthOf(undefined), 0);
  assert.equal(lengthOf('abc'), 3);
  assert.equal(lengthOf(['a', 'b']), 2);
  assert.equal(lengthOf(''), 0);
});

test('inRange prüft beide Grenzen inklusive', () => {
  assert.equal(inRange(5, [1, 5]), true);
  assert.equal(inRange(6, [1, 5]), false);
});
