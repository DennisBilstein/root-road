// Praxis: enum-Ersatz, Overloads, Branded Types, Grenzen von "as" und "!".

// 1) Statt enum: ein const-Objekt plus abgeleiteter Typ. Das ist "erasable" und läuft in Node ohne Umbau.
export const Role = { admin: 'admin', editor: 'editor', viewer: 'viewer' } as const;
export type Role = (typeof Role)[keyof typeof Role]; // Wert und Typ dürfen denselben Namen tragen

export function canWrite(role: Role): boolean {
  return role === Role.admin || role === Role.editor;
}

// 2) Overloads: mehrere Signaturen, eine Implementierung.
export function toList(value: string): string[];
export function toList(value: string[]): string[];
export function toList(value: string | string[]): string[] {
  return typeof value === 'string' ? value.split(',').map((part) => part.trim()).filter(Boolean) : value;
}

// 3) Branded Type: gleiche Laufzeitform, aber nicht austauschbar. Eine Euro-Zahl ist keine Cent-Zahl.
declare const brand: unique symbol;
export type Cents = number & { readonly [brand]: 'Cents' };
export type Euros = number & { readonly [brand]: 'Euros' };

export const cents = (value: number): Cents => {
  if (!Number.isInteger(value)) throw new RangeError('Cent-Beträge sind ganze Zahlen');
  return value as Cents; // einzige Stelle mit "as": hier wird geprüft und die Marke vergeben
};
export const toEuros = (value: Cents): Euros => (value / 100) as Euros;

// 4) Nicht-null-Zusicherung "!" und "as" lügen den Compiler an. Besser: prüfen.
export function firstWord(text: string): string {
  const match = /\S+/.exec(text);
  if (match === null) return '';
  return match[0];
}

export function erwarteteFehler(euros: Euros, role: string): void {
  // @ts-expect-error TS2345: Argument of type 'Euros' is not assignable to parameter of type 'Cents'.
  toEuros(euros);
  // @ts-expect-error TS2345: Argument of type 'string' is not assignable to parameter of type 'Role'.
  canWrite(role);
  // @ts-expect-error TS2769: No overload matches this call.
  toList(42);
}
