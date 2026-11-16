import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Money, Bestellung, kundeImVerkauf, empfaengerImVersand, alsEmpfaenger } from '../src/principles/ddd.js';

test('Value Object: gleiche Werte sind gleich, Rechnen erzeugt neue Objekte, Währungen mischen geht nicht', () => {
  const a = new Money(250, 'EUR');
  assert.ok(a.equals(new Money(250, 'EUR')));
  assert.ok(!a.equals(new Money(250, 'USD')));
  const sum = a.plus(new Money(100, 'EUR'));
  assert.equal(sum.cents, 350);
  assert.equal(a.cents, 250); // unverändert
  assert.throws(() => a.plus(new Money(1, 'USD')), /Währungen/);
  assert.throws(() => new Money(1.5, 'EUR'), TypeError);
  assert.ok(Object.isFrozen(a));
});

test('Aggregate: Regeln der Bestellung gelten, weil nur ihre Methoden den Zustand ändern', () => {
  const bestellung = new Bestellung();
  assert.throws(() => bestellung.bestaetigen(), /leere Bestellung/);
  bestellung.positionHinzufuegen('Kabel', new Money(250, 'EUR'));
  bestellung.positionHinzufuegen('Stecker', new Money(100, 'EUR'));
  assert.equal(bestellung.gesamtpreis().cents, 350);
  bestellung.bestaetigen();
  assert.equal(bestellung.bestaetigt, true);
  assert.throws(() => bestellung.positionHinzufuegen('Hülle', new Money(1, 'EUR')), /nicht mehr änderbar/);
  assert.equal(bestellung.gesamtpreis().cents, 350);
  assert.equal(bestellung.lines, undefined); // privater Zustand ist von außen nicht erreichbar
});

test('Bounded Context: Verkauf und Versand haben je ein eigenes Modell, die Grenze übersetzt', () => {
  const kunde = kundeImVerkauf('Ada', 5000);
  const empfaenger = alsEmpfaenger(kunde, 'Hauptstraße 1');
  assert.deepEqual(empfaenger, empfaengerImVersand('Ada', 'Hauptstraße 1'));
  assert.equal('kreditlimit' in empfaenger, false); // der Versand erfährt kein Kreditlimit
});
