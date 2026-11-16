import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  InvoiceAllInOne, totalCents, formatTotal, saveLine,
  discountSwitch, applyDiscount, defaultRules,
  Rectangle, SquareBroken, rect, square,
  assertMultiFunction, requireCapability, printAll,
  SmtpMailer, OrderServiceCoupled, OrderService,
} from '../src/principles/solid.js';

const items = [{ cents: 250, qty: 2 }, { cents: 100, qty: 3 }];

test('S: getrennte Teile ergeben dasselbe wie die Alleskönner-Klasse, die Rechnung braucht aber keinen Speicher', () => {
  const store = [];
  new InvoiceAllInOne(items).save(store);
  const split = [];
  saveLine(split, formatTotal(totalCents(items)));
  assert.deepEqual(split, store);
  assert.equal(totalCents(items), 800);
  assert.equal(formatTotal(800), 'Summe: 8.00 EUR');
});

test('O: eine neue Rabattart ist ein neuer Eintrag, die Funktion bleibt unverändert', () => {
  assert.equal(applyDiscount(defaultRules, 'student', 1000), discountSwitch('student', 1000));
  assert.throws(() => discountSwitch('staff', 1000), /Unbekannte Rabattart/);
  const rules = { ...defaultRules, staff: (cents) => Math.round(cents * 0.5) };
  assert.equal(applyDiscount(rules, 'staff', 1000), 500);
  assert.throws(() => applyDiscount(defaultRules, 'staff', 1000), /Unbekannte Rabattart/);
});

test('L: Code für Rechtecke bricht beim Quadrat als Unterklasse, nicht bei getrennten Formen', () => {
  const resize = (shape) => { shape.setWidth(4); shape.setHeight(5); return shape.area(); };
  assert.equal(resize(new Rectangle(1, 1)), 20);
  assert.equal(resize(new SquareBroken(1, 1)), 25); // Erwartung des Aufrufers verletzt
  assert.equal(rect(4, 5).area(), 20);
  assert.equal(square(4).area(), 16);
  assert.throws(() => { 'use strict'; rect(4, 5).width = 9; }, TypeError); // unveränderlich
});

test('I: ein kleines Gerät erfüllt den großen Vertrag nicht, aber den kleinen', () => {
  const simplePrinter = { print: (document) => `gedruckt: ${document}` };
  assert.throws(() => assertMultiFunction(simplePrinter), /scan/);
  assert.deepEqual(printAll(simplePrinter, ['a', 'b']), ['gedruckt: a', 'gedruckt: b']);
  assert.throws(() => requireCapability({}, 'print'), /print/);
  assert.throws(() => requireCapability(undefined, 'print'), TypeError);
});

test('D: mit Injektion lässt sich der Dienst ohne echten Versand prüfen', () => {
  const sentBefore = SmtpMailer.sent;
  new OrderServiceCoupled().confirm({ id: 7, email: 'a@example.org' });
  assert.equal(SmtpMailer.sent, sentBefore + 1); // der Test löst echten Versand aus

  const outbox = [];
  const spy = { send: (to, text) => outbox.push({ to, text }) };
  assert.equal(new OrderService(spy).confirm({ id: 8, email: 'b@example.org' }), 8);
  assert.deepEqual(outbox, [{ to: 'b@example.org', text: 'Bestellung 8 bestätigt' }]);
  assert.equal(SmtpMailer.sent, sentBefore + 1); // unverändert
});
