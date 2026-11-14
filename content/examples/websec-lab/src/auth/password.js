// Passwörter speichern: langsames, gesalzenes Hashing (scrypt; Argon2id, wenn Node.js es mitbringt) und Vergleich in konstanter Zeit.
// Lehrbeispiel: In Produktion eine geprüfte Bibliothek oder die Plattform-Funktionen verwenden.
import crypto, { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const MAX_LENGTH = 1024; // sehr lange Eingaben nicht erst aufwendig hashen (Schutz vor Überlastung)

// Empfohlene Mindestwerte laut OWASP Password Storage Cheat Sheet (Stand 14.11.2026):
// scrypt: N = 2^17, r = 8, p = 1. Argon2id: 19 MiB Speicher, 2 Durchläufe, Parallelität 1.
export const SCRYPT_DEFAULTS = { N: 2 ** 17, r: 8, p: 1 };
export const ARGON2_DEFAULTS = { memory: 19456, passes: 2, parallelism: 1 };

// argon2Sync gibt es erst ab Node.js 24.7; als Named Import würde das Laden auf älteren Versionen scheitern.
const argon2Sync = crypto.argon2Sync;
export const argon2Available = typeof argon2Sync === 'function';

function check(password) {
  if (typeof password !== 'string' || password.length === 0 || password.length > MAX_LENGTH) throw new RangeError(`Passwort muss 1 bis ${MAX_LENGTH} Zeichen lang sein`);
  return password.normalize('NFKC'); // gleiche Zeichenfolge, unabhängig von der Eingabeform (ü als ein Zeichen oder u + Trema)
}

const maxmemFor = ({ N, r }) => 128 * N * r + 1024 * 1024;

/** Liefert eine Zeichenkette, die Verfahren, Kosten, Salz und Hash enthält, damit sich Parameter später erhöhen lassen. */
export async function hashPassword(password, { algorithm = 'scrypt', ...overrides } = {}) {
  const input = check(password);
  const salt = randomBytes(16);
  if (algorithm === 'argon2id') {
    if (!argon2Available) throw new Error('argon2id braucht Node.js ab 24.7');
    const { memory, passes, parallelism } = { ...ARGON2_DEFAULTS, ...overrides };
    const hash = argon2Sync('argon2id', { message: input, nonce: salt, parallelism, tagLength: 32, memory, passes });
    return ['argon2id', memory, passes, parallelism, salt.toString('base64'), hash.toString('base64')].join('$');
  }
  const { N, r, p } = { ...SCRYPT_DEFAULTS, ...overrides };
  const hash = await scryptAsync(input, salt, 64, { N, r, p, maxmem: maxmemFor({ N, r }) });
  return ['scrypt', N, r, p, salt.toString('base64'), hash.toString('base64')].join('$');
}

function parse(stored) {
  const parts = String(stored).split('$');
  if (parts.length !== 6) return undefined;
  const [algorithm, a, b, c, salt, hash] = parts;
  const numbers = [a, b, c].map(Number);
  if (!['scrypt', 'argon2id'].includes(algorithm ?? '') || numbers.some((n) => !Number.isInteger(n) || n < 1)) return undefined;
  return { algorithm, numbers, salt: Buffer.from(salt ?? '', 'base64'), hash: Buffer.from(hash ?? '', 'base64') };
}

export async function verifyPassword(password, stored) {
  const parsed = parse(stored);
  if (!parsed || typeof password !== 'string' || password.length === 0 || password.length > MAX_LENGTH) return false;
  const input = password.normalize('NFKC');
  const [x, y, z] = parsed.numbers;
  let actual;
  if (parsed.algorithm === 'scrypt') {
    // Gespeicherte Kosten prüfen und begrenzen, falls die Datenbank manipuliert wurde (N: Zweierpotenz, 2 bis 2^20).
    if (!x || !y || !z || x < 2 || x > 2 ** 20 || !Number.isInteger(Math.log2(x)) || y > 32 || z > 16) return false;
    actual = await scryptAsync(input, parsed.salt, parsed.hash.length, { N: x, r: y, p: z, maxmem: maxmemFor({ N: x, r: y }) });
  } else {
    if (!argon2Available || !x || !y || !z || x > 2 ** 20 || y > 20 || z > 16 || x < 8 * z) return false;
    actual = argon2Sync('argon2id', { message: input, nonce: parsed.salt, parallelism: z, tagLength: parsed.hash.length, memory: x, passes: y });
  }
  return actual.length === parsed.hash.length && timingSafeEqual(actual, parsed.hash);
}

/** True, wenn der gespeicherte Hash schwächer ist als die heutige Vorgabe: nach erfolgreicher Anmeldung neu hashen. */
export function needsRehash(stored) {
  const parsed = parse(stored);
  if (!parsed || !parsed.numbers[0] || !parsed.numbers[1]) return true;
  if (parsed.algorithm === 'scrypt') return parsed.numbers[0] < SCRYPT_DEFAULTS.N || parsed.numbers[1] < SCRYPT_DEFAULTS.r;
  return parsed.numbers[0] < ARGON2_DEFAULTS.memory || parsed.numbers[1] < ARGON2_DEFAULTS.passes;
}
