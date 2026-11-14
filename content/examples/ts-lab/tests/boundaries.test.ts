import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isUser, parseUser } from '../src/basics/boundaries.ts';

test('parseUser akzeptiert gültige Daten', () => {
  assert.deepEqual(parseUser('{"name":"Ada","age":36}'), { name: 'Ada', age: 36 });
});

test('parseUser lehnt falsche Typen und Grenzfälle ab', () => {
  for (const bad of ['{"name":"Ada","age":"36"}', '{"name":"Ada","age":-1}', '{"name":"Ada","age":1.5}', '[]', 'null', '{"age":1}']) {
    assert.throws(() => parseUser(bad), TypeError, bad);
  }
});

test('JSON.parse mit kaputtem Text wirft einen SyntaxError', () => {
  assert.throws(() => parseUser('{kaputt'), SyntaxError);
});

test('isUser ist ein reiner Wächter', () => {
  assert.equal(isUser({ name: 'x', age: 0 }), true);
  assert.equal(isUser(undefined), false);
});
