import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, needsRehash, argon2Available, SCRYPT_DEFAULTS } from '../src/auth/password.js';
import { createSessionStore } from '../src/auth/session.js';

const FAST = { N: 2 ** 12 }; // nur für Tests: schnell. Produktiv gelten die Standardwerte.

test('Passwort: Salz, Verifikation, Normalisierung, Grenzen', async () => {
  const one = await hashPassword('Correct Horse 7!', FAST);
  const two = await hashPassword('Correct Horse 7!', FAST);
  assert.notEqual(one, two, 'gleiches Passwort, anderes Salz, anderer Hash');
  assert.match(one, /^scrypt\$4096\$8\$1\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/);
  assert.equal(await verifyPassword('Correct Horse 7!', one), true);
  assert.equal(await verifyPassword('correct horse 7!', one), false);
  assert.equal(await verifyPassword('', one), false);
  assert.equal(await verifyPassword('x'.repeat(1025), one), false);
  assert.equal(await verifyPassword('Correct Horse 7!', 'kein-hash'), false);
  assert.equal(await verifyPassword('Correct Horse 7!', 'scrypt$1$1$1$AAAA$AAAA'), false, 'manipulierte Kosten');
  assert.equal(await verifyPassword('Correct Horse 7!', 'scrypt$3$8$1$AAAA$AAAA'), false, 'N keine Zweierpotenz');
  assert.equal(await verifyPassword('Correct Horse 7!', 'scrypt$4294967296$8$1$AAAA$AAAA'), false, 'überhöhte Kosten werden abgelehnt');
  const umlaut = await hashPassword('Müller-Passwort1', FAST);
  assert.equal(await verifyPassword('Müller-Passwort1', umlaut), true, 'u + Trema entspricht ü');
  await assert.rejects(hashPassword('', FAST), RangeError);
  await assert.rejects(hashPassword('x'.repeat(1025), FAST), RangeError);
  await assert.rejects(hashPassword(12345, FAST), RangeError);
});

test('Passwort: schwächere Kosten werden zum Neu-Hashen markiert', async () => {
  const weak = await hashPassword('abc12345XYZ', { N: 2 ** 14 });
  assert.equal(needsRehash(weak), true);
  assert.equal(needsRehash('unsinn'), true);
  assert.equal(SCRYPT_DEFAULTS.N, 131072);
});

test('Passwort: empfohlene Kosten funktionieren (scrypt N=2^17, 128 MiB)', async () => {
  const start = performance.now();
  const hash = await hashPassword('Langsam-ist-gut-9', {});
  assert.equal(needsRehash(hash), false);
  assert.equal(await verifyPassword('Langsam-ist-gut-9', hash), true);
  const ms = performance.now() - start;
  assert.ok(ms > 20, `zwei Hash-Berechnungen dauerten ${Math.round(ms)} ms; auf einem schnellen Rechner trotzdem spürbar`); // nur eine grobe Untergrenze, keine Zeit-Aussage
});

test('Passwort: Argon2id (nur wenn Node.js es bietet)', { skip: !argon2Available && 'Node.js < 24.7: crypto.argon2Sync fehlt' }, async () => {
  const hash = await hashPassword('Argon-Passwort-1', { algorithm: 'argon2id' });
  assert.match(hash, /^argon2id\$19456\$2\$1\$/);
  assert.equal(await verifyPassword('Argon-Passwort-1', hash), true);
  assert.equal(await verifyPassword('argon-passwort-1', hash), false);
  assert.equal(needsRehash(hash), false);
  assert.equal(needsRehash(await hashPassword('Argon-Passwort-1', { algorithm: 'argon2id', memory: 4096 })), true);
});

test('Sitzung: Kennung, Hash im Speicher, Rotation, Zeitlimits', () => {
  let time = 1_000_000;
  const store = createSessionStore({ idleMs: 10 * 60_000, absoluteMs: 60 * 60_000, now: () => time });
  const id = store.create('ada');
  assert.equal(Buffer.from(id, 'base64url').length, 32, '256 Bit');
  assert.equal(store.hasPlainId(id), false, 'im Speicher steht nur der Hash');
  assert.deepEqual(store.get(id), { userId: 'ada' });
  assert.equal(store.get('geraten'), undefined);
  assert.equal(store.get(undefined), undefined);

  const fresh = store.rotate(id, 'ada');
  assert.notEqual(fresh, id);
  assert.equal(store.get(id), undefined, 'alte Kennung ist ungültig (Session Fixation)');
  assert.deepEqual(store.get(fresh), { userId: 'ada' });

  time += 9 * 60_000;
  assert.deepEqual(store.get(fresh), { userId: 'ada' }, 'Aktivität verlängert die Leerlaufzeit');
  time += 11 * 60_000;
  assert.equal(store.get(fresh), undefined, 'Leerlauf abgelaufen');

  const long = store.create('grace');
  for (let i = 0; i < 7; i++) { time += 9 * 60_000; store.get(long); } // 63 Minuten mit Aktivität alle 9 Minuten
  assert.equal(store.get(long), undefined, 'absolute Höchstdauer: auch bei Aktivität');

  store.create('ada'); store.create('ada'); store.create('grace');
  store.destroyAllFor('ada');
  assert.equal(store.size(), 1, 'Passwortwechsel beendet alle Sitzungen der Person');
});
