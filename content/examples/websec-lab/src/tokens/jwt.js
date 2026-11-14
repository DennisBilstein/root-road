// Minimale HS256-Prüfung zur Veranschaulichung typischer JWT-Fehler. Produktiv: bewährte Bibliothek verwenden.
import { createHmac, timingSafeEqual } from 'node:crypto';

const b64 = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const sign = (secret, data) => createHmac('sha256', secret).update(data).digest();

export function signJwt(claims, secret, { now = () => Date.now() } = {}) {
  if (!Buffer.isBuffer(secret) || secret.length < 32) throw new RangeError('Geheimnis muss mindestens 32 Bytes haben');
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = { iat: Math.floor(now() / 1000), ...claims };
  const data = `${b64(header)}.${b64(body)}`;
  return `${data}.${sign(secret, data).toString('base64url')}`;
}

/** UNSICHER: liest nur, prüft nichts. Entschlüsseln (dekodieren) ist nicht prüfen. */
export function decodeUnsafe(token) {
  const [, payload] = String(token).split('.');
  return JSON.parse(Buffer.from(payload ?? '', 'base64url').toString('utf8'));
}

/**
 * Prüft Aufbau, Algorithmus (fest vorgegeben), Signatur (konstante Zeit) und danach erst die Aussagen.
 * Der Algorithmus kommt NIE aus dem Token, sondern aus der Konfiguration des Servers.
 */
export function verifyJwt(token, secret, { issuer, audience, leewaySeconds = 30, now = () => Date.now() } = {}) {
  if (typeof token !== 'string' || token.length > 4096) throw new Error('Token ungültig');
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Token ungültig');
  const [headerPart, payloadPart, signaturePart] = parts;
  let header;
  try {
    header = JSON.parse(Buffer.from(headerPart ?? '', 'base64url').toString('utf8'));
  } catch {
    throw new Error('Token ungültig');
  }
  if (header?.alg !== 'HS256') throw new Error('Algorithmus nicht erlaubt'); // lehnt "none", RS256-Tricks u. a. ab
  const expected = sign(secret, `${headerPart}.${payloadPart}`);
  const given = Buffer.from(signaturePart ?? '', 'base64url');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) throw new Error('Signatur ungültig');
  let claims;
  try {
    claims = JSON.parse(Buffer.from(payloadPart ?? '', 'base64url').toString('utf8'));
  } catch {
    throw new Error('Token ungültig');
  }
  const nowSeconds = Math.floor(now() / 1000);
  if (typeof claims.exp !== 'number') throw new Error('exp fehlt');
  if (nowSeconds > claims.exp + leewaySeconds) throw new Error('Token abgelaufen');
  if (typeof claims.nbf === 'number' && nowSeconds + leewaySeconds < claims.nbf) throw new Error('Token noch nicht gültig');
  if (issuer !== undefined && claims.iss !== issuer) throw new Error('Aussteller falsch');
  if (audience !== undefined && !(Array.isArray(claims.aud) ? claims.aud.includes(audience) : claims.aud === audience)) throw new Error('Zielgruppe falsch');
  return claims;
}
