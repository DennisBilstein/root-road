// Union-Typen, Literaltypen und Narrowing (Eingrenzen).
export type Priority = 'niedrig' | 'mittel' | 'hoch'; // Literaltypen: nur diese drei Werte sind erlaubt
export type Id = number | string; // Union: entweder eine Zahl oder ein Text

const order: Record<Priority, number> = { niedrig: 0, mittel: 1, hoch: 2 };

export function compare(a: Priority, b: Priority): number {
  return order[a] - order[b];
}

// typeof grenzt die Union pro Zweig ein: in "if" ist id ein string, danach ein number.
export function idLabel(id: Id): string {
  if (typeof id === 'string') return `Kürzel ${id.toUpperCase()}`;
  return `Nummer ${id.toFixed(0)}`;
}

// Array.isArray, "in" und Gleichheit sind weitere Eingrenzungen.
export function lengthOf(value: string | string[] | null | undefined): number {
  if (value == null) return 0; // fängt null UND undefined
  if (Array.isArray(value)) return value.length;
  return value.length;
}

// Tupel: feste Länge, feste Typen pro Position.
export type Range = readonly [from: number, to: number];
export function inRange(value: number, [from, to]: Range): boolean {
  return value >= from && value <= to;
}

export function erwarteteFehler(p: Priority, id: Id): void {
  // @ts-expect-error TS2345: Argument of type '"dringend"' is not assignable to parameter of type 'Priority'.
  compare(p, 'dringend');
  // @ts-expect-error TS2339: Property 'toFixed' does not exist on type 'Id' (denn 'string' hat kein toFixed).
  id.toFixed(0);
  // @ts-expect-error TS2322: Source has 3 element(s) but target allows only 2.
  const falsch: Range = [1, 2, 3];
  void falsch;
}
