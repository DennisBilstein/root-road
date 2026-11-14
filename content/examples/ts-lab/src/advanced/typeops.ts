// Typen aus Typen ableiten: keyof, typeof, Indexzugriff, Utility-, Mapped- und Conditional Types.
import type { Task } from '../basics/shapes.ts';

// as const: Werte werden zu Literaltypen, das Objekt wird readonly.
export const STATUS = { open: 'offen', done: 'erledigt', archived: 'archiviert' } as const;
export type StatusKey = keyof typeof STATUS; // 'open' | 'done' | 'archived'
export type StatusLabel = (typeof STATUS)[StatusKey]; // 'offen' | 'erledigt' | 'archiviert'

// Indexzugriff auf Eigenschaftstypen.
export type TaskTitle = Task['title']; // string

// Utility Types: Standard-Werkzeuge der Sprache.
export type TaskDraft = Pick<Task, 'title' | 'dueDate'>;
export type TaskSummary = Omit<Task, 'done'>;
export type TaskUpdate = Partial<Pick<Task, 'title' | 'done'>>;
export type Labels = Record<StatusKey, string>;
export type FrozenTask = Readonly<Task>;

// Eigener Mapped Type: aus jedem Feld eine Getter-Funktion machen.
export type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] };
export type TaskGetters = Getters<Pick<Task, 'title' | 'done'>>; // { getTitle(): string; getDone(): boolean }

// Conditional Type mit infer: Rückgabetyp einer Funktion, die ein Promise liefert.
export type Awaited2<T> = T extends Promise<infer U> ? U : T;
export type Unwrapped = Awaited2<Promise<number>>; // number

// satisfies: prüft gegen einen Typ, ohne den Typ des Werts zu überschreiben. Mit "as const" bleiben die Texte Literale.
// Mit ": Labels" statt "satisfies" wäre labels.open nur noch string.
export const labels = { open: 'Offen', done: 'Fertig', archived: 'Archiv' } as const satisfies Labels;
export const openLabel: 'Offen' = labels.open;

export function labelFor(key: StatusKey): string {
  return labels[key];
}

// Template-Literal-Typ: Event-Namen werden aus Schlüsseln gebaut.
export type EventName = `task:${StatusKey}`;
export const evt: EventName = 'task:done';

export function erwarteteFehler(): void {
  // @ts-expect-error TS2322: Type '"gelöscht"' is not assignable to type 'StatusLabel'.
  const falsch: StatusLabel = 'gelöscht';
  void falsch;
  // @ts-expect-error TS2561: 'titel' does not exist in type 'TaskDraft'. Did you mean to write 'title'?
  const draft: TaskDraft = { titel: 'x' };
  void draft;
  // @ts-expect-error TS1360: Type '{ open: string; }' does not satisfy the expected type 'Labels'.
  const unvollstaendig = { open: 'a' } satisfies Labels;
  void unvollstaendig;
}
