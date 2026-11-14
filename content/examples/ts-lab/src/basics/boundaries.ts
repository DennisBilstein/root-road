// Grenzen zur Außenwelt: unknown statt any, Typwächter, never.
export interface User {
  name: string;
  age: number;
}

// unknown = "irgendetwas, das ich erst prüfen muss". any schaltet die Prüfung ab und ist deshalb tabu.
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Typwächter ("type predicate"): Gibt true zurück, ist value danach ein User.
export function isUser(value: unknown): value is User {
  return isRecord(value) && typeof value['name'] === 'string' && typeof value['age'] === 'number' && Number.isInteger(value['age']) && value['age'] >= 0;
}

export function parseUser(json: string): User {
  const data: unknown = JSON.parse(json); // JSON.parse liefert any: sofort auf unknown festlegen
  if (!isUser(data)) throw new TypeError('Kein gültiger Nutzer');
  return data;
}

// never: Dieser Zweig darf nie erreicht werden. Der Compiler beweist das.
export function assertNever(value: never): never {
  throw new Error(`Unerwarteter Wert: ${JSON.stringify(value)}`);
}

export function erwarteteFehler(value: unknown): void {
  // @ts-expect-error TS18046: 'value' is of type 'unknown'.
  value.name;
  // @ts-expect-error TS2345: Argument of type '"x"' is not assignable to parameter of type 'never'.
  assertNever('x');
}
