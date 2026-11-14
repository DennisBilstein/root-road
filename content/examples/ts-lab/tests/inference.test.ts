import { test } from 'node:test';
import assert from 'node:assert/strict';
import { first, summary, total } from '../src/basics/inference.ts';

test('total und summary', () => {
  assert.equal(total([1.5, 2, 4.25]), 7.75);
  assert.equal(total([]), 0);
  assert.equal(summary, 'Einkaufen: 3 Stück, Summe 7.75 €');
});

test('first liefert bei leerer Liste undefined', () => {
  assert.equal(first([]), undefined);
  assert.equal(first([9, 8]), 9);
});
