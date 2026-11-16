// Domain-Driven Design im Kleinen: Value Object, Aggregate mit Invarianten, Bounded Contexts, einheitliche Fachsprache.

// Value Object: durch seinen Wert bestimmt, unveränderlich, mit eigener Regel (nur gleiche Währung addieren).
export class Money {
  #cents;
  #currency;
  constructor(cents, currency) {
    if (!Number.isInteger(cents)) throw new TypeError('Cent müssen eine ganze Zahl sein');
    this.#cents = cents;
    this.#currency = currency;
    Object.freeze(this);
  }
  get cents() { return this.#cents; }
  get currency() { return this.#currency; }
  plus(other) {
    if (other.currency !== this.#currency) throw new Error('Währungen passen nicht zusammen');
    return new Money(this.#cents + other.cents, this.#currency);
  }
  equals(other) { return other.cents === this.#cents && other.currency === this.#currency; }
}

// Aggregate: Die Bestellung ist die Wurzel. Änderungen laufen nur über ihre Methoden, damit die Regeln immer gelten.
// Die Namen stammen aus der Fachsprache (Ubiquitous Language): So sprechen Fachabteilung und Code dasselbe Deutsch.
export class Bestellung {
  #lines = [];
  #bestaetigt = false;
  positionHinzufuegen(name, preis) {
    if (this.#bestaetigt) throw new Error('Eine bestätigte Bestellung ist nicht mehr änderbar');
    this.#lines.push({ name, preis });
  }
  bestaetigen() {
    if (this.#lines.length === 0) throw new Error('Eine leere Bestellung lässt sich nicht bestätigen');
    this.#bestaetigt = true;
  }
  get bestaetigt() { return this.#bestaetigt; }
  gesamtpreis() { return this.#lines.reduce((sum, line) => sum.plus(line.preis), new Money(0, 'EUR')); }
}

// Bounded Context: „Kunde“ bedeutet im Verkauf etwas anderes als im Versand. Jeder Kontext hat sein eigenes Modell.
export const kundeImVerkauf = (name, kreditlimit) => ({ name, kreditlimit });
export const empfaengerImVersand = (name, adresse) => ({ name, adresse });

// Übersetzung an der Grenze: Der Versand bekommt nur, was er braucht, und nennt es in seiner Sprache.
export const alsEmpfaenger = (kunde, adresse) => empfaengerImVersand(kunde.name, adresse);
