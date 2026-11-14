import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Stack, firstOf, groupBy, indexById, paginate } from '../src/advanced/generics.ts';

test('firstOf und indexById', () => {
  assert.equal(firstOf([] as number[]), undefined);
  assert.equal(firstOf(['a']), 'a');
  const map = indexById([{ id: 2, t: 'b' }, { id: 1, t: 'a' }]);
  assert.equal(map.get(1)?.t, 'a');
  assert.equal(map.get(3), undefined);
});

test('groupBy gruppiert nach berechnetem Schlüssel', () => {
  const grouped = groupBy([1, 2, 3, 4, 5], (n) => (n % 2 === 0 ? 'gerade' : 'ungerade'));
  assert.deepEqual(grouped, { ungerade: [1, 3, 5], gerade: [2, 4] });
  assert.deepEqual(groupBy([], () => 'x'), {});
});

test('Stack arbeitet last-in-first-out', () => {
  const stack = new Stack<number>();
  stack.push(1);
  stack.push(2);
  assert.equal(stack.pop(), 2);
  assert.equal(stack.size, 1);
  assert.equal(new Stack().pop(), undefined);
});

test('paginate schneidet Seiten und kennt die Gesamtzahl', () => {
  const data = ['a', 'b', 'c', 'd', 'e'];
  assert.deepEqual(paginate(data, 2, 2), { items: ['c', 'd'], total: 5 });
  assert.deepEqual(paginate(data, 3, 2), { items: ['e'], total: 5 });
  assert.deepEqual(paginate(data, 9, 2), { items: [], total: 5 });
});
