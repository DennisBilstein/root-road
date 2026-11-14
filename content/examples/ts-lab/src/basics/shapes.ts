// Objekte und Funktionen beschreiben: type, interface, optional, readonly.
export interface Task {
  readonly id: number; // nach dem Anlegen nicht mehr änderbar
  title: string;
  done: boolean;
  dueDate?: string; // optional: darf fehlen
}

// interface lässt sich erweitern; type kann zusätzlich Unions und Tupel benennen.
export interface Subtask extends Task {
  parentId: number;
}

export type TaskPatch = Partial<Omit<Task, 'id'>>; // Teilmenge ohne id (mehr dazu in ts-m2)

export function createTask(id: number, title: string, dueDate?: string): Task {
  // exactOptionalPropertyTypes: dueDate darf fehlen, aber nicht explizit undefined sein.
  return dueDate === undefined ? { id, title, done: false } : { id, title, done: false, dueDate };
}

export function applyPatch(task: Task, patch: TaskPatch): Task {
  return { ...task, ...patch };
}

// Funktionstyp als Alias und Standardwert / Rest-Parameter.
export type Formatter = (task: Task) => string;
export const plain: Formatter = (task) => `${task.done ? '[x]' : '[ ]'} ${task.title}`;

export function join(separator = ', ', ...parts: string[]): string {
  return parts.join(separator);
}

// Index-Signatur: beliebige Schlüssel mit gleichem Werttyp.
export type Counter = Record<string, number>;
export function count(words: string[]): Counter {
  const result: Counter = {};
  for (const word of words) result[word] = (result[word] ?? 0) + 1; // ?? wegen noUncheckedIndexedAccess
  return result;
}

export function erwarteteFehler(task: Task): void {
  // @ts-expect-error TS2540: Cannot assign to 'id' because it is a read-only property.
  task.id = 2;
  // @ts-expect-error TS2561: 'titel' does not exist in type 'Task'. Did you mean to write 'title'?
  const tippfehler: Task = { id: 1, titel: 'x', done: false };
  void tippfehler;
  // @ts-expect-error TS2375: ... with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the target's property type.
  const mitUndefined: Task = { id: 1, title: 'x', done: false, dueDate: undefined };
  void mitUndefined;
}
