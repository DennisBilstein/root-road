import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  handleLineMixed, handleLine, parseLine, priceCents, renderLine,
  countryByChain, Order,
  Logger, TimestampLogger, PrefixTimestampLogger, plain, withTimestamp, withPrefix,
  parseAgeSilent, parseAge, sortedBad, sortedNumbers,
} from '../src/principles/structure.js';

test('Separation of Concerns: getrennte Schichten ergeben dieselbe Ausgabe, die Regel ist ohne Text prüfbar', () => {
  assert.equal(handleLine('Kabel; 3'), handleLineMixed('Kabel; 3'));
  assert.equal(handleLine('Kabel; 3'), 'Kabel: 7.50 EUR');
  assert.deepEqual(parseLine(' Kabel ;3'), { name: 'Kabel', qty: 3 });
  assert.equal(priceCents({ qty: 4 }), 1000);
  assert.equal(renderLine('x', 5), 'x: 0.05 EUR');
});

test('Law of Demeter: die Kette bricht bei fehlender Adresse, die Frage an die Bestellung nicht', () => {
  const complete = { customer: { address: { country: 'DE' } } };
  const noAddress = { customer: {} };
  assert.equal(countryByChain(complete), 'DE');
  assert.throws(() => countryByChain(noAddress), TypeError);
  assert.equal(new Order({ address: { country: 'DE' } }).shippingCountry(), 'DE');
  assert.equal(new Order({}).shippingCountry(), 'unbekannt');
  assert.equal(new Order(undefined).shippingCountry(), 'unbekannt');
});

test('Komposition vor Vererbung: dieselben Ausgaben ohne Klassenkette', () => {
  assert.equal(new Logger().log('x'), 'x');
  assert.equal(new TimestampLogger().log('x'), '[t] x');
  assert.equal(new PrefixTimestampLogger().log('x'), 'app [t] x');
  assert.equal(withPrefix('app', withTimestamp(plain))('x'), 'app [t] x');
  // Die Reihenfolge ist frei wählbar; bei Vererbung wäre dafür eine weitere Klasse nötig.
  assert.equal(withTimestamp(withPrefix('app', plain))('x'), '[t] app x');
});

test('Fail Fast: Müll wird sofort gemeldet statt als NaN weiterzuwandern', () => {
  assert.ok(Number.isNaN(parseAgeSilent('abc')));
  assert.equal(parseAgeSilent('12abc'), 12); // schluckt den Rest stillschweigend
  assert.equal(parseAge('42'), 42);
  for (const bad of ['abc', '12abc', '-1', '', ' 5', '1000']) {
    assert.throws(() => parseAge(bad), /Alter muss eine Zahl von 0 bis 999 sein/, bad);
  }
});

test('Geringste Überraschung: sort() verändert das Original und ordnet Zahlen als Text', () => {
  const original = [10, 9, 1];
  assert.deepEqual(sortedBad([...original]), [1, 10, 9]);
  const mutated = [10, 9, 1];
  sortedBad(mutated);
  assert.deepEqual(mutated, [1, 10, 9]);
  assert.deepEqual(sortedNumbers(original), [1, 9, 10]);
  assert.deepEqual(original, [10, 9, 1]);
});
