import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startApi, call } from './helpers.js';
import { v0Lifecycle } from '../src/app.js';

test('Ratenbegrenzung: Stoß bis zur Kapazität, dann 429 mit Retry-After, später wieder frei', async (t) => {
  const api = await startApi({ limits: { capacity: 3, refillPerSecond: 1 } });
  t.after(api.close);
  const token = api.issue();
  for (let number = 0; number < 3; number += 1) assert.equal((await call(api, 'GET', '/v1/notes', { token })).status, 200);
  const limited = await call(api, 'GET', '/v1/notes', { token });
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get('retry-after'), '1');
  api.advance(1000);
  assert.equal((await call(api, 'GET', '/v1/notes', { token })).status, 200);
});

test('Ratenbegrenzung gilt je Benutzer', async (t) => {
  const api = await startApi({ limits: { capacity: 1, refillPerSecond: 1 } });
  t.after(api.close);
  const ada = api.issue('ada');
  const ben = api.issue('ben');
  assert.equal((await call(api, 'GET', '/v1/notes', { token: ada })).status, 200);
  assert.equal((await call(api, 'GET', '/v1/notes', { token: ada })).status, 429);
  assert.equal((await call(api, 'GET', '/v1/notes', { token: ben })).status, 200);
});

test('Veraltete Version: gleiche Antwort, aber mit Deprecation, Sunset und Nachfolger', async (t) => {
  const api = await startApi();
  t.after(api.close);
  const token = api.issue();
  const old = await call(api, 'GET', '/v0/notes', { token });
  assert.equal(old.status, 200);
  assert.equal(old.headers.get('deprecation'), `@${v0Lifecycle.deprecatedAt / 1000}`);
  assert.equal(old.headers.get('sunset'), 'Thu, 31 Dec 2026 23:59:59 GMT');
  assert.match(old.headers.get('link'), /rel="successor-version"/);
  const current = await call(api, 'GET', '/v1/notes', { token });
  assert.equal(current.headers.get('deprecation'), null);
});

test('Additive Änderung bricht Clients nicht: unbekannte Antwortfelder werden ignoriert', () => {
  // Client-Seite: liest nur, was er kennt. Ein neues optionales Feld ändert nichts, ein umbenanntes Feld schon.
  const readTitle = (note) => note.title;
  assert.equal(readTitle({ id: '0001', title: 'A', pinned: true }), 'A');
  assert.equal(readTitle({ id: '0001', name: 'A' }), undefined, 'Umbenennen ist eine unverträgliche Änderung');
});
