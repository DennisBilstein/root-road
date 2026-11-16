import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  shippingCents, shippingCentsTangled, validateCustomerName, validateSupplierName, requireText, exportRowsSpeculative, toCsv,
} from '../src/principles/basics.js';

test('KISS: flache und verschachtelte Fassung liefern für alle Stufen dasselbe', () => {
  for (const kg of [0.1, 1, 1.01, 5, 5.5, 20, 20.1, 25, 100]) {
    assert.equal(shippingCents(kg), shippingCentsTangled(kg), `bei ${kg} kg`);
  }
  assert.deepEqual([shippingCents(1), shippingCents(5), shippingCents(20), shippingCents(21)], [499, 699, 999, 1049]);
});

test('KISS: ungültiges Gewicht wird in beiden Fassungen abgelehnt (0, negativ, NaN)', () => {
  for (const kg of [0, -1, Number.NaN]) {
    assert.throws(() => shippingCents(kg), RangeError);
    assert.throws(() => shippingCentsTangled(kg), RangeError);
  }
});

test('DRY: kopierte Regeln laufen auseinander, die gemeinsame Regel nicht', () => {
  // Vorher: dieselbe Eingabe wird bei Kunden getrimmt, bei Lieferanten nicht.
  assert.equal(validateCustomerName('  Ada '), 'Ada');
  assert.equal(validateSupplierName('  Ada '), '  Ada ');
  // Nachher: eine Regel, überall gleich.
  assert.equal(requireText('Kunde', '  Ada '), 'Ada');
  assert.equal(requireText('Lieferant', '  Ada '), 'Ada');
  assert.throws(() => requireText('Lieferant', '   '), /Lieferant: 1 bis 40 Zeichen/);
  assert.throws(() => requireText('Lieferant', 'x'.repeat(41)), TypeError);
  assert.throws(() => requireText('Lieferant', 42), TypeError);
});

test('YAGNI: die schlanke Fassung liefert dasselbe wie die spekulative mit Standardwerten', () => {
  const rows = [['a', 1], ['b', 2]];
  assert.equal(toCsv(rows), 'a,1\nb,2');
  assert.equal(exportRowsSpeculative(rows).text, toCsv(rows));
  // Die „für später“ eingebauten Optionen sind schon heute nur Last: xml ist angekündigt, aber nicht umgesetzt.
  assert.throws(() => exportRowsSpeculative(rows, { format: 'xml' }), /noch nicht umgesetzt/);
});
