// Zugriffskontrolle: Besitzprüfung gegen IDOR, Rollenprüfung pro Funktion und kein Verraten, ob etwas existiert.
export class NotFoundError extends Error {
  constructor() { super('Nicht gefunden'); this.status = 404; }
}
export class ForbiddenError extends Error {
  constructor() { super('Keine Berechtigung'); this.status = 403; }
}

/** UNSICHER, nur zur Vorführung: Jede angemeldete Person kann jede Rechnung abrufen, wenn sie die Nummer errät. */
export function getInvoiceUnsafe(invoices, id) {
  return invoices.get(id);
}

/** Sicher: Besitz wird auf dem Server geprüft. Fremde und fehlende Rechnungen sehen gleich aus (404). */
export function getInvoice(invoices, user, id) {
  const invoice = invoices.get(id);
  if (!invoice || (invoice.ownerId !== user.id && user.role !== 'admin')) throw new NotFoundError();
  return invoice;
}

/** Funktionsebene: Verwaltungsaktionen prüfen die Rolle jedes Mal, nicht nur die versteckte Schaltfläche. */
export function requireRole(user, ...roles) {
  if (!user || !roles.includes(user.role)) throw new ForbiddenError();
}

/** Mass Assignment: nur erlaubte Felder werden aus der Eingabe übernommen. */
export function pick(input, allowed) {
  if (typeof input !== 'object' || input === null) throw new TypeError('Objekt erwartet');
  return Object.fromEntries(allowed.filter((key) => Object.hasOwn(input, key)).map((key) => [key, input[key]]));
}
