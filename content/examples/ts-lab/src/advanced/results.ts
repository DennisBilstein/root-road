// Diskriminierte Unions: ein Feld ("kind") entscheidet, welche Form vorliegt.
import { assertNever } from '../basics/boundaries.ts';

export type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rect'; width: number; height: number }
  | { kind: 'square'; side: number };

export function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2; // hier ist shape ein circle
    case 'rect':
      return shape.width * shape.height;
    case 'square':
      return shape.side ** 2;
    default:
      return assertNever(shape); // wird ein neuer kind ergänzt, meldet tsc hier einen Fehler
  }
}

// Result: Erfolg oder Fehler als Wert statt Exception. Der Aufrufer MUSS beide Fälle behandeln.
export type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };
export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const fail = <E>(error: E): Result<never, E> => ({ ok: false, error });

export function parsePort(text: string): Result<number> {
  if (!/^\d+$/.test(text)) return fail(`"${text}" ist keine Zahl`);
  const port = Number(text);
  if (port < 1 || port > 65535) return fail(`Port ${port} liegt außerhalb von 1–65535`);
  return ok(port);
}

export function describePort(text: string): string {
  const result = parsePort(text);
  if (!result.ok) return `Fehler: ${result.error}`; // nach dieser Prüfung ist result.value noch gesperrt
  return `Port ${result.value}`;
}

export function erwarteteFehler(result: Result<number>, shape: Shape): void {
  // @ts-expect-error TS2339: Property 'value' does not exist on type 'Result<number, string>' (ok wurde nicht geprüft).
  result.value;
  // @ts-expect-error TS2339: Property 'radius' does not exist on type 'Shape' (nicht jede Form hat einen Radius).
  shape.radius;
}
