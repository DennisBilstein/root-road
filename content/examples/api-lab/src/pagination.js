// Keyset-Paginierung: Der Cursor kodiert die Position der letzten gelieferten Notiz, nicht eine Zeilenzahl.
import { HttpError } from './problem.js';

export const defaultLimit = 20;
export const maxLimit = 100;

export function encodeCursor(note) {
  return Buffer.from(JSON.stringify({ c: note.createdAt, i: note.id })).toString('base64url');
}

export function decodeCursor(text) {
  try {
    const value = JSON.parse(Buffer.from(text, 'base64url').toString('utf8'));
    if (typeof value?.c === 'string' && typeof value?.i === 'string' && !Number.isNaN(Date.parse(value.c))) return value;
  } catch { /* fällt unten in denselben Fehler */ }
  throw new HttpError(400, 'Ungültiger Cursor', { detail: 'Der Cursor stammt nicht aus einer früheren Antwort.', type: 'https://example.test/probleme/cursor' });
}

export function parseLimit(text) {
  if (text === null) return defaultLimit;
  const limit = Number(text);
  if (!Number.isInteger(limit) || limit < 1 || limit > maxLimit) {
    throw new HttpError(400, 'Ungültiges Limit', { detail: `limit muss eine ganze Zahl von 1 bis ${maxLimit} sein.`, type: 'https://example.test/probleme/limit' });
  }
  return limit;
}

/** Liefert die Notizen nach dem Cursor in der Ordnung (createdAt, id) und den nächsten Cursor (oder null am Ende). */
export function page(sorted, { limit, cursor }) {
  const after = cursor ? decodeCursor(cursor) : null;
  const rest = after ? sorted.filter((note) => note.createdAt > after.c || (note.createdAt === after.c && note.id > after.i)) : sorted;
  const items = rest.slice(0, limit);
  return { items, nextCursor: rest.length > limit ? encodeCursor(items[items.length - 1]) : null };
}
