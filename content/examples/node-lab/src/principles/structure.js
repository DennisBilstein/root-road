// Aufbau-Prinzipien: Separation of Concerns, Law of Demeter, Komposition vor Vererbung, Fail Fast, geringste Überraschung.

// ---- Separation of Concerns: Eingabe lesen, Regel anwenden, Ausgabe formen getrennt halten ----
// Vorher: Eine Funktion liest den Text, rechnet und formatiert. Die Regel lässt sich nur über den Text prüfen.
export function handleLineMixed(line) {
  const [name, qty] = line.split(';');
  const total = Number(qty) * 250;
  return `${name.trim()}: ${(total / 100).toFixed(2)} EUR`;
}

// Nachher: drei Schichten mit je einer Aufgabe. Die Regel (priceCents) kennt weder Text noch Format.
export const parseLine = (line) => {
  const [name, qty] = line.split(';');
  return { name: name.trim(), qty: Number(qty) };
};
export const priceCents = ({ qty }) => qty * 250;
export const renderLine = (name, cents) => `${name}: ${(cents / 100).toFixed(2)} EUR`;
export const handleLine = (line) => {
  const item = parseLine(line);
  return renderLine(item.name, priceCents(item));
};

// ---- Law of Demeter: nur mit direkten Nachbarn sprechen ----
// Vorher: Der Aufrufer kennt die Innenstruktur der Bestellung und bricht, sobald sie sich ändert.
export const countryByChain = (order) => order.customer.address.country;

// Nachher: Die Bestellung beantwortet die Frage selbst; die Struktur dahinter darf sich ändern.
export class Order {
  constructor(customer) { this.customer = customer; }
  shippingCountry() { return this.customer?.address?.country ?? 'unbekannt'; }
}

// ---- Komposition vor Vererbung: Verhalten zusammensetzen statt ableiten ----
// Vorher: Jede Kombination braucht eine eigene Unterklasse.
export class Logger { log(message) { return message; } }
export class TimestampLogger extends Logger { log(message) { return `[t] ${super.log(message)}`; } }
export class PrefixTimestampLogger extends TimestampLogger { log(message) { return `app ${super.log(message)}`; } }

// Nachher: kleine Bausteine, die sich beliebig stapeln lassen.
export const plain = (message) => message;
export const withTimestamp = (next) => (message) => `[t] ${next(message)}`;
export const withPrefix = (prefix, next) => (message) => `${prefix} ${next(message)}`;

// ---- Fail Fast: ungültige Eingaben sofort und laut ablehnen ----
// Vorher: Ein ungültiger Wert wandert als NaN weiter und fällt erst weit entfernt auf.
export const parseAgeSilent = (text) => Number.parseInt(text, 10);

// Nachher: Der Fehler tritt an der Stelle auf, an der er entsteht, mit verständlicher Meldung.
export function parseAge(text) {
  if (!/^\d{1,3}$/.test(text)) throw new TypeError(`Alter muss eine Zahl von 0 bis 999 sein, war: ${JSON.stringify(text)}`);
  return Number(text);
}

// ---- Prinzip der geringsten Überraschung: Funktionen tun, was ihr Name sagt ----
// Vorher: sort() ordnet Zahlen als Text und verändert nebenbei das Original.
export const sortedBad = (values) => values.sort();

// Nachher: Kopie, numerisch, der Name sagt das Ergebnis.
export const sortedNumbers = (values) => [...values].sort((a, b) => a - b);
