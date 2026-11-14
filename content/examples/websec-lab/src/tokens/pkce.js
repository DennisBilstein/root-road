// OAuth 2.0 / OpenID Connect: PKCE (RFC 7636), state-Prüfung und genaue Prüfung der Weiterleitungsadresse.
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export const randomUrlSafe = (bytes = 32) => randomBytes(bytes).toString('base64url');

export const createVerifier = () => randomUrlSafe(32); // 43 Zeichen, im erlaubten Bereich 43 bis 128

export const challengeS256 = (verifier) => createHash('sha256').update(verifier).digest('base64url');

export function buildAuthorizationUrl({ endpoint, clientId, redirectUri, scope, state, verifier }) {
  const url = new URL(endpoint);
  if (url.protocol !== 'https:') throw new RangeError('Autorisierungsendpunkt braucht https');
  url.search = new URLSearchParams({
    response_type: 'code', client_id: clientId, redirect_uri: redirectUri, scope, state,
    code_challenge: challengeS256(verifier), code_challenge_method: 'S256',
  }).toString();
  return url.href;
}

/** Beim Rücksprung: state muss zum gespeicherten Wert passen (konstante Zeit), sonst Abbruch (gegen CSRF im Anmeldefluss). */
export function checkState(expected, received) {
  if (typeof expected !== 'string' || typeof received !== 'string') return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Serverseitig: Die Weiterleitungsadresse muss genau einer registrierten entsprechen (kein Präfix, kein Muster). */
export function isRegisteredRedirect(redirectUri, registered) {
  return registered.includes(redirectUri);
}
