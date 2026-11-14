import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import http from 'node:http';
import { buildCookie, parseCookies } from '../src/common/cookies.js';
import { createCsrfToken, verifyCsrfToken, isSameOriginRequest, corsHeaders } from '../src/csrf/csrf.js';
import { createBank } from '../src/csrf/app.js';

test('Cookies: sichere Standardattribute und Prüfungen', () => {
  assert.equal(buildCookie('__Host-sid', 'abc123', { maxAgeSeconds: 3600 }), '__Host-sid=abc123; Path=/; SameSite=Lax; Secure; HttpOnly; Max-Age=3600');
  assert.equal(buildCookie('sid', 'x', { sameSite: 'Strict', secure: false, httpOnly: false }), 'sid=x; Path=/; SameSite=Strict');
  assert.throws(() => buildCookie('sid', 'a; Domain=evil', {}), TypeError, 'Wert mit Strichpunkt');
  assert.throws(() => buildCookie('sid x', 'a'), TypeError, 'Name mit Leerzeichen');
  assert.throws(() => buildCookie('sid', 'a', { sameSite: 'None', secure: false }), TypeError);
  assert.throws(() => buildCookie('__Host-sid', 'a', { secure: false }), TypeError);
  assert.throws(() => buildCookie('sid', 'a', { maxAgeSeconds: -1 }), RangeError);
  assert.deepEqual([...parseCookies('a=1; b=2; a=3; kaputt')], [['a', '1'], ['b', '2']], 'erster Wert gewinnt, kaputte Teile werden übergangen');
});

test('CSRF-Token: an die Sitzung gebunden, manipulationssicher', () => {
  const secret = Buffer.from('s'.repeat(32));
  const token = createCsrfToken('sitzung-1', secret);
  assert.equal(verifyCsrfToken(token, 'sitzung-1', secret), true);
  assert.equal(verifyCsrfToken(token, 'sitzung-2', secret), false, 'anderes Sitzungsband');
  assert.equal(verifyCsrfToken(token, 'sitzung-1', Buffer.from('t'.repeat(32))), false, 'anderes Geheimnis');
  const [nonce] = token.split('.');
  assert.equal(verifyCsrfToken(`${nonce}.AAAA`, 'sitzung-1', secret), false, 'falsche Signatur');
  for (const bad of [undefined, null, '', 'x', 'a.b.c', 42]) assert.equal(verifyCsrfToken(bad, 'sitzung-1', secret), false);
  assert.notEqual(createCsrfToken('sitzung-1', secret), token, 'jedes Token ist neu');
});

test('Herkunftsprüfung: Sec-Fetch-Site, Origin, Rückfall', () => {
  const own = 'https://app.example';
  assert.equal(isSameOriginRequest('GET', {}, own), true, 'lesende Methoden ändern nichts');
  assert.equal(isSameOriginRequest('POST', { 'sec-fetch-site': 'same-origin' }, own), true);
  assert.equal(isSameOriginRequest('POST', { 'sec-fetch-site': 'none' }, own), true, 'direkter Aufruf des Nutzers');
  assert.equal(isSameOriginRequest('POST', { 'sec-fetch-site': 'cross-site' }, own), false);
  assert.equal(isSameOriginRequest('POST', { 'sec-fetch-site': 'same-site' }, own), false, 'Nachbar-Subdomain zählt nicht');
  assert.equal(isSameOriginRequest('POST', { origin: own }, own), true);
  assert.equal(isSameOriginRequest('POST', { origin: 'https://evil.example' }, own), false);
  assert.equal(isSameOriginRequest('POST', { origin: 'https://app.example.evil.example' }, own), false, 'ganzer Vergleich, kein Teilstring');
  assert.equal(isSameOriginRequest('POST', {}, own), false, 'weder noch: ablehnen');
  assert.equal(isSameOriginRequest('DELETE', {}, own), false);
});

test('CORS: nur Einträge aus der Liste, kein Zurückspiegeln', () => {
  const allowed = ['https://app.example'];
  assert.deepEqual(corsHeaders('https://app.example', allowed), { 'access-control-allow-origin': 'https://app.example', vary: 'Origin' });
  assert.deepEqual(corsHeaders('https://evil.example', allowed), {});
  assert.deepEqual(corsHeaders('null', allowed), {});
  assert.deepEqual(corsHeaders(undefined, allowed), {});
  assert.deepEqual(corsHeaders('https://app.example.evil.example', allowed), {});
});

function request(port, { method, path, headers = {} }) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, method, path, headers }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode ?? 0, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

let bank;
let port;
before(async () => {
  bank = createBank({ origin: 'https://app.example', allowedCorsOrigins: ['https://app.example'] });
  bank.server.listen(0, '127.0.0.1');
  await once(bank.server, 'listening');
  port = bank.server.address().port;
});
after(async () => {
  bank.server.close();
  await once(bank.server, 'close');
});

test('Anwendung: Angriff von fremder Seite scheitert, eigene Anfrage gelingt', async () => {
  const login = await request(port, { method: 'POST', path: '/login' });
  assert.equal(login.status, 204);
  const setCookie = String(login.headers['set-cookie']);
  assert.match(setCookie, /^__Host-sid=[A-Za-z0-9_-]{43}; Path=\/; SameSite=Lax; Secure; HttpOnly; Max-Age=3600$/);
  const cookie = setCookie.split(';')[0] ?? '';

  // Der Browser hängt das Cookie auch an die fremde Anfrage; ohne Prüfung wäre sie erfolgreich. Mit Prüfung scheitert sie.
  const attack = await request(port, { method: 'POST', path: '/transfer', headers: { cookie, origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' } });
  assert.equal(attack.status, 403);
  const noToken = await request(port, { method: 'POST', path: '/transfer', headers: { cookie, 'sec-fetch-site': 'same-origin' } });
  assert.equal(noToken.status, 403, 'gleiche Herkunft, aber kein Token');
  assert.equal(bank.transfers.length, 0);

  const { token } = JSON.parse((await request(port, { method: 'GET', path: '/csrf', headers: { cookie } })).body);
  const ok = await request(port, { method: 'POST', path: '/transfer', headers: { cookie, 'sec-fetch-site': 'same-origin', 'x-csrf-token': token } });
  assert.equal(ok.status, 200);
  assert.deepEqual(JSON.parse(ok.body), { balance: 90 });
  assert.equal(bank.transfers.length, 1);
  const noSession = await request(port, { method: 'POST', path: '/transfer', headers: { 'sec-fetch-site': 'same-origin' } });
  assert.equal(noSession.status, 401);
});

test('Anwendung ohne Prüfung: dieselbe fremde Anfrage hat Erfolg (Vorführung)', async () => {
  const open = createBank({ origin: 'https://app.example', checkCsrf: false });
  open.server.listen(0, '127.0.0.1');
  await once(open.server, 'listening');
  try {
    const openPort = open.server.address().port;
    const login = await request(openPort, { method: 'POST', path: '/login' });
    const cookie = String(login.headers['set-cookie']).split(';')[0] ?? '';
    const attack = await request(openPort, { method: 'POST', path: '/transfer', headers: { cookie, origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' } });
    assert.equal(attack.status, 200, 'ohne CSRF-Schutz geht die fremde Überweisung durch');
    assert.equal(open.transfers.length, 1);
  } finally {
    open.server.close();
    await once(open.server, 'close');
  }
});

test('CORS-Antwort: nur für den erlaubten Origin', async () => {
  const allowed = await request(port, { method: 'GET', path: '/csrf', headers: { origin: 'https://app.example' } });
  assert.equal(allowed.headers['access-control-allow-origin'], 'https://app.example');
  assert.equal(allowed.headers['vary'], 'Origin');
  const denied = await request(port, { method: 'GET', path: '/csrf', headers: { origin: 'https://evil.example' } });
  assert.equal(denied.headers['access-control-allow-origin'], undefined);
});
