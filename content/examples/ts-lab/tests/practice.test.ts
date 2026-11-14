import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Role, canWrite, cents, firstWord, toEuros, toList } from '../src/advanced/practice.ts';

test('canWrite und Role', () => {
  assert.equal(canWrite(Role.admin), true);
  assert.equal(canWrite('viewer'), false);
});

test('toList nimmt Text oder Liste', () => {
  assert.deepEqual(toList('a, b,,c'), ['a', 'b', 'c']);
  assert.deepEqual(toList(['x']), ['x']);
  assert.deepEqual(toList(''), []);
});

test('Cents: ganze Zahlen werden akzeptiert, Kommazahlen abgelehnt', () => {
  assert.equal(toEuros(cents(1250)), 12.5);
  assert.throws(() => cents(12.5), RangeError);
});

test('firstWord ohne "!"', () => {
  assert.equal(firstWord('  Hallo Welt'), 'Hallo');
  assert.equal(firstWord('   '), '');
});
