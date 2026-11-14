import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { signJwt, verifyJwt, decodeUnsafe } from '../src/tokens/jwt.js';
import { challengeS256, createVerifier, buildAuthorizationUrl, checkState, isRegisteredRedirect, randomUrlSafe } from '../src/tokens/pkce.js';

const secret = Buffer.from('k'.repeat(32));
const now = () => Date.parse('2026-11-14T10:00:00Z');
const claims = { sub: 'ada', iss: 'https://login.example', aud: 'api', exp: Math.floor(now() / 1000) + 600 };
const b64 = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

test('JWT: gültiges Token wird akzeptiert, Aussagen werden geprüft', () => {
  const token = signJwt(claims, secret, { now });
  assert.deepEqual(verifyJwt(token, secret, { issuer: 'https://login.example', audience: 'api', now }).sub, 'ada');
  assert.throws(() => verifyJwt(token, secret, { issuer: 'https://anderer.example', now }), /Aussteller/);
  assert.throws(() => verifyJwt(token, secret, { audience: 'andere-api', now }), /Zielgruppe/);
  const later = () => now() + 700_000;
  assert.throws(() => verifyJwt(token, secret, { now: later }), /abgelaufen/);
  assert.doesNotThrow(() => verifyJwt(token, secret, { now: () => now() + 620_000 }), 'innerhalb der Toleranz von 30 s');
  assert.throws(() => verifyJwt(signJwt({ ...claims, exp: undefined }, secret, { now }), secret, { now }), /exp fehlt/);
  assert.throws(() => verifyJwt(signJwt({ ...claims, nbf: Math.floor(now() / 1000) + 3600 }, secret, { now }), secret, { now }), /noch nicht/);
  assert.throws(() => signJwt(claims, Buffer.from('kurz'), { now }), RangeError);
});

test('JWT: typische Angriffe', () => {
  const token = signJwt(claims, secret, { now });
  const [h, p, s] = token.split('.');
  // 1. alg=none ohne Signatur
  const none = `${b64({ alg: 'none', typ: 'JWT' })}.${p}.`;
  assert.throws(() => verifyJwt(none, secret, { now }), /Algorithmus/);
  // 2. Inhalt ändern, Signatur behalten
  const admin = `${h}.${b64({ ...claims, sub: 'root' })}.${s}`;
  assert.throws(() => verifyJwt(admin, secret, { now }), /Signatur/);
  // 3. Algorithmus-Verwechslung: Kopf behauptet RS256 oder HS512
  for (const alg of ['RS256', 'HS512', 'hs256']) {
    const head = b64({ alg, typ: 'JWT' });
    const sig = createHmac('sha256', secret).update(`${head}.${p}`).digest('base64url');
    assert.throws(() => verifyJwt(`${head}.${p}.${sig}`, secret, { now }), /Algorithmus/, alg);
  }
  // 4. Strukturfehler
  for (const bad of ['', 'a.b', 'a.b.c.d', '###.###.###', undefined, 'x'.repeat(5000)]) assert.throws(() => verifyJwt(bad, secret, { now }), /ungültig/);
  // 5. Kürzere oder leere Signatur
  assert.throws(() => verifyJwt(`${h}.${p}.`, secret, { now }), /Signatur/);
  assert.throws(() => verifyJwt(`${h}.${p}.${s.slice(0, 10)}`, secret, { now }), /Signatur/);
  // 6. falsches Geheimnis
  assert.throws(() => verifyJwt(token, Buffer.from('z'.repeat(32)), { now }), /Signatur/);
  // Dekodieren ist nicht Prüfen: das gefälschte Token lässt sich problemlos lesen
  assert.equal(decodeUnsafe(admin).sub, 'root');
});

test('PKCE: Testvektor aus RFC 7636 (Anhang B) und Aufbau', () => {
  assert.equal(challengeS256('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'), 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
  const verifier = createVerifier();
  assert.equal(verifier.length, 43);
  assert.match(verifier, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(createVerifier(), verifier);
  const url = new URL(buildAuthorizationUrl({ endpoint: 'https://login.example/authorize', clientId: 'abc', redirectUri: 'https://app.example/cb', scope: 'openid profile', state: 'zustand-1', verifier }));
  assert.equal(url.searchParams.get('code_challenge'), challengeS256(verifier));
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(url.searchParams.get('response_type'), 'code');
  assert.equal(url.searchParams.get('scope'), 'openid profile');
  assert.throws(() => buildAuthorizationUrl({ endpoint: 'http://login.example/authorize', clientId: 'a', redirectUri: 'x', scope: 's', state: 's', verifier }), RangeError);
});

test('OAuth: state und Weiterleitungsadresse', () => {
  const state = randomUrlSafe();
  assert.equal(checkState(state, state), true);
  assert.equal(checkState(state, 'anderer-wert'), false);
  assert.equal(checkState(state, undefined), false);
  assert.equal(checkState(undefined, state), false);
  const registered = ['https://app.example/cb'];
  assert.equal(isRegisteredRedirect('https://app.example/cb', registered), true);
  assert.equal(isRegisteredRedirect('https://app.example/cb/../evil', registered), false);
  assert.equal(isRegisteredRedirect('https://app.example.evil.example/cb', registered), false);
  assert.equal(isRegisteredRedirect('https://app.example/cb?x=1', registered), false, 'genau gleich, kein Präfix');
});
