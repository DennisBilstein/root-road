// Undurchsichtige Bearer-Token: zufällig erzeugt, nur als SHA-256-Hash gespeichert, mit Ablaufzeit und Berechtigungen (Scopes).
import { createHash, randomBytes } from 'node:crypto';

const hash = (token) => createHash('sha256').update(token).digest('hex');

export function createTokens(clock) {
  const known = new Map();
  return {
    issue(subject, scopes, ttlMs) {
      const token = randomBytes(24).toString('base64url');
      known.set(hash(token), { subject, scopes: new Set(scopes), expiresAt: clock() + ttlMs });
      return token;
    },
    /** Gibt { subject, scopes } zurück oder null, wenn das Token unbekannt oder abgelaufen ist. */
    verify(token) {
      const entry = known.get(hash(token));
      return entry && entry.expiresAt > clock() ? { subject: entry.subject, scopes: entry.scopes } : null;
    },
  };
}
