// Typinferenz und strict: TypeScript erkennt viele Typen selbst.
const title = 'Einkaufen'; // Typ: "Einkaufen" (const -> Literaltyp)
let count = 3; // Typ: number (let -> breiter Typ)
const prices = [1.5, 2, 4.25]; // Typ: number[]

export function total(values: number[]): number {
  let sum = 0;
  for (const value of values) sum += value;
  return sum;
}

export const summary = `${title}: ${count} Stück, Summe ${total(prices)} €`;

// noUncheckedIndexedAccess: Ein Zugriff über den Index kann undefined liefern.
export function first(values: number[]): number | undefined {
  return values[0]; // ohne die Option wäre der Typ nur "number"
}

// Fehler, die TypeScript vor dem Ausführen meldet. @ts-expect-error erklärt: "genau hier ist ein Fehler erwartet".
// Meldet tsc dort keinen Fehler, schlägt tsc selbst fehl. Die Funktion wird nie aufgerufen.
export function erwarteteFehler(): void {
  // @ts-expect-error TS2322: Type 'string' is not assignable to type 'number'.
  count = 'vier';

  // @ts-expect-error TS7006: Parameter 'x' implicitly has an 'any' type.
  const double = (x) => x * 2;
  void double;
}
