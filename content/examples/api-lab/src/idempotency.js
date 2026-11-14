// Idempotency-Key für POST: derselbe Schlüssel mit demselben Inhalt liefert die gespeicherte Antwort erneut, mit anderem Inhalt einen Fehler.
import { createHash } from 'node:crypto';

export const fingerprint = (rawBody) => createHash('sha256').update(rawBody).digest('hex');

export function createIdempotency() {
  const saved = new Map();
  return {
    lookup: (scope, key) => saved.get(`${scope}:${key}`),
    save: (scope, key, entry) => saved.set(`${scope}:${key}`, entry),
  };
}
