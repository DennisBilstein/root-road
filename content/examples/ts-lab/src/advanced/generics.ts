// Generics: Typen als Parameter.
export function firstOf<T>(items: readonly T[]): T | undefined {
  return items[0];
}

// Einschränkung mit "extends": T muss mindestens ein id-Feld haben.
export function indexById<T extends { id: number }>(items: readonly T[]): Map<number, T> {
  return new Map(items.map((item) => [item.id, item]));
}

// Zwei Typparameter: K ist der Schlüsseltyp, den die Funktion selbst bestimmt.
export function groupBy<T, K extends PropertyKey>(items: readonly T[], keyOf: (item: T) => K): Record<K, T[]> {
  const result = {} as Record<K, T[]>; // "as": die leere Map wird gleich gefüllt (begründete Ausnahme)
  for (const item of items) (result[keyOf(item)] ??= []).push(item);
  return result;
}

// Generische Klasse mit Standardtyp.
export class Stack<T = string> {
  readonly #items: T[] = [];
  push(item: T): void {
    this.#items.push(item);
  }
  pop(): T | undefined {
    return this.#items.pop();
  }
  get size(): number {
    return this.#items.length;
  }
}

// Generisches interface für eine Antwort mit Nutzdaten.
export interface Page<T> {
  items: T[];
  total: number;
}

export function paginate<T>(items: readonly T[], page: number, size: number): Page<T> {
  const start = (page - 1) * size;
  return { items: items.slice(start, start + size), total: items.length };
}

export function erwarteteFehler(): void {
  // @ts-expect-error TS2353: Object literal may only specify known properties, and 'name' does not exist in type '{ id: number; }'.
  indexById([{ name: 'ohne id' }]);
  const numbers = new Stack<number>();
  // @ts-expect-error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
  numbers.push('x');
}
