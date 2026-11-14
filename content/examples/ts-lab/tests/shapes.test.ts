import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyPatch, count, createTask, join, plain } from '../src/basics/shapes.ts';

test('createTask lässt dueDate weg, wenn keines übergeben wird', () => {
  assert.deepEqual(createTask(1, 'Milch'), { id: 1, title: 'Milch', done: false });
  assert.deepEqual(createTask(2, 'Brot', '2026-12-01'), { id: 2, title: 'Brot', done: false, dueDate: '2026-12-01' });
});

test('applyPatch verändert das Original nicht', () => {
  const original = createTask(1, 'Milch');
  const changed = applyPatch(original, { done: true });
  assert.equal(original.done, false);
  assert.equal(changed.done, true);
  assert.equal(plain(changed), '[x] Milch');
});

test('join nutzt Standardwert und Rest-Parameter', () => {
  assert.equal(join(undefined, 'a', 'b'), 'a, b');
  assert.equal(join('-', 'a', 'b', 'c'), 'a-b-c');
  assert.equal(join(), '');
});

test('count zählt Wörter', () => {
  assert.deepEqual(count(['a', 'b', 'a']), { a: 2, b: 1 });
  assert.deepEqual(count([]), {});
});
