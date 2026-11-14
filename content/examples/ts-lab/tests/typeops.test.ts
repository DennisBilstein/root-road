import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STATUS, evt, labelFor, labels, openLabel, type TaskGetters, type Unwrapped } from '../src/advanced/typeops.ts';

test('STATUS ist ein gewöhnliches Objekt zur Laufzeit', () => {
  assert.deepEqual(Object.keys(STATUS), ['open', 'done', 'archived']);
  assert.equal(labelFor('done'), 'Fertig');
  assert.equal(openLabel, 'Offen');
  assert.equal(evt, 'task:done');
  assert.equal(Object.keys(labels).length, 3);
});

test('Typen sind erst beim Prüfen sichtbar: hier nur als Zuweisungen belegt', () => {
  const getters: TaskGetters = { getTitle: () => 'x', getDone: () => false };
  const unwrapped: Unwrapped = 42;
  assert.equal(getters.getTitle(), 'x');
  assert.equal(unwrapped, 42);
});
