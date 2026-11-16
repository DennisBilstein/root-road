// SOLID: fünf Entwurfsregeln, jeweils mit einer „vorher“-Fassung, die an der Regel scheitert, und einer besseren.

// ---- S: Single Responsibility, ein Grund zur Änderung ----
// Vorher: Eine Klasse rechnet, formatiert und speichert. Ändert sich eines davon, wird die ganze Klasse angefasst.
export class InvoiceAllInOne {
  constructor(items) { this.items = items; }
  totalCents() { return this.items.reduce((sum, item) => sum + item.cents * item.qty, 0); }
  toText() { return `Summe: ${(this.totalCents() / 100).toFixed(2)} EUR`; }
  save(store) { store.push(this.toText()); }
}

// Nachher: drei kleine Teile; die Rechnung braucht weder Format noch Speicher.
export const totalCents = (items) => items.reduce((sum, item) => sum + item.cents * item.qty, 0);
export const formatTotal = (cents) => `Summe: ${(cents / 100).toFixed(2)} EUR`;
export const saveLine = (store, line) => { store.push(line); };

// ---- O: Open/Closed, offen für Erweiterung, geschlossen für Änderung ----
// Vorher: Jede neue Rabattart verlangt eine Änderung dieser Funktion.
export function discountSwitch(kind, cents) {
  switch (kind) {
    case 'none': return cents;
    case 'student': return Math.round(cents * 0.8);
    default: throw new Error(`Unbekannte Rabattart: ${kind}`);
  }
}

// Nachher: Die Regeln sind Daten. Eine neue Regel ist ein neuer Eintrag, die Funktion bleibt unverändert.
export const defaultRules = { none: (cents) => cents, student: (cents) => Math.round(cents * 0.8) };
export function applyDiscount(rules, kind, cents) {
  const rule = rules[kind];
  if (!rule) throw new Error(`Unbekannte Rabattart: ${kind}`);
  return rule(cents);
}

// ---- L: Liskov, Untertypen müssen sich wie ihr Obertyp verhalten ----
// Vorher: Ein Quadrat „ist ein“ Rechteck, bricht aber die Erwartung, dass Breite und Höhe unabhängig sind.
export class Rectangle {
  constructor(width, height) { this.width = width; this.height = height; }
  setWidth(width) { this.width = width; }
  setHeight(height) { this.height = height; }
  area() { return this.width * this.height; }
}
export class SquareBroken extends Rectangle {
  setWidth(width) { this.width = width; this.height = width; }
  setHeight(height) { this.width = height; this.height = height; }
}

// Nachher: unveränderliche Formen mit gemeinsamer Schnittstelle area(); keine Vererbung, die etwas verspricht, das nicht hält.
export const rect = (width, height) => Object.freeze({ width, height, area: () => width * height });
export const square = (side) => Object.freeze({ side, area: () => side * side });

// ---- I: Interface Segregation, kleine, passgenaue Verträge ----
// Vorher: Ein großer Vertrag zwingt jedes Gerät, alles zu können.
export function assertMultiFunction(device) {
  for (const method of ['print', 'scan', 'fax']) {
    if (typeof device[method] !== 'function') throw new TypeError(`Gerät kann nicht: ${method}`);
  }
}

// Nachher: Wer drucken will, verlangt nur „print“.
export function requireCapability(device, method) {
  if (typeof device?.[method] !== 'function') throw new TypeError(`Gerät kann nicht: ${method}`);
  return device;
}
export function printAll(device, documents) {
  requireCapability(device, 'print');
  return documents.map((document) => device.print(document));
}

// ---- D: Dependency Inversion, von Abstraktionen abhängen, nicht von konkreten Klassen ----
// Vorher: Der Dienst erzeugt seinen Mailversand selbst und lässt sich nicht ohne Versand prüfen (hier zählt SmtpMailer.sent die Aufrufe).
export class SmtpMailer {
  static sent = 0;
  send() { SmtpMailer.sent += 1; }
}
export class OrderServiceCoupled {
  confirm(order) { new SmtpMailer().send(order.email, `Bestellung ${order.id} bestätigt`); return order.id; }
}

// Nachher: Der Dienst bekommt etwas mit send() übergeben (Konstruktor-Injektion). Im Test genügt ein Spion.
export class OrderService {
  constructor(mailer) { this.mailer = mailer; }
  confirm(order) { this.mailer.send(order.email, `Bestellung ${order.id} bestätigt`); return order.id; }
}
