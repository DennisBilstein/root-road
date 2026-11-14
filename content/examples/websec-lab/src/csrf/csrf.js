// CSRF-Schutz: signierte Token, Prüfung von Sec-Fetch-Site/Origin und eine feste CORS-Liste.
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const mac = (secret, text) => createHmac('sha256', secret).update(text).digest('base64url');

/** Token = Zufall + HMAC über (Sitzung, Zufall). An die Sitzung gebunden und serverseitig überprüfbar, ohne Speicher. */
export function createCsrfToken(sessionId, secret) {
  const nonce = randomBytes(16).toString('base64url');
  return `${nonce}.${mac(secret, `${sessionId}.${nonce}`)}`;
}

export function verifyCsrfToken(token, sessionId, secret) {
  if (typeof token !== 'string') return false;
  const [nonce, given, ...rest] = token.split('.');
  if (!nonce || !given || rest.length > 0) return false;
  const expected = Buffer.from(mac(secret, `${sessionId}.${nonce}`));
  const actual = Buffer.from(given);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/**
 * Prüft, ob eine zustandsändernde Anfrage von der eigenen Seite kommt.
 * Sec-Fetch-Site setzt der Browser und kann von Seiten nicht gefälscht werden; Origin ist die Rückfalloption.
 * Fehlen beide bei einer unsicheren Methode, wird abgelehnt.
 */
export function isSameOriginRequest(method, headers, expectedOrigin) {
  if (SAFE_METHODS.has(method)) return true;
  const site = headers['sec-fetch-site'];
  if (site !== undefined) return site === 'same-origin' || site === 'none';
  const origin = headers['origin'];
  return origin !== undefined && origin === expectedOrigin;
}

/** CORS: genaue Übereinstimmung mit einer Liste, nie den Origin einfach zurückspiegeln und nie * mit Cookies. */
export function corsHeaders(origin, allowedOrigins) {
  if (typeof origin !== 'string' || !allowedOrigins.includes(origin)) return {};
  return { 'access-control-allow-origin': origin, vary: 'Origin' };
}
