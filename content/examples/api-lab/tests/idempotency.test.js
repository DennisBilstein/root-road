import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startApi, call } from './helpers.js';

const count = async (api, token) => (await call(api, 'GET', '/v1/notes', { token })).body.items.length;

test('Wiederholtes POST mit demselben Idempotency-Key legt nur eine Notiz an', async (t) => {
  const api = await startApi();
  t.after(api.close);
  const token = api.issue();
  const headers = { 'Idempotency-Key': 'bestellung-0001' };
  const first = await call(api, 'POST', '/v1/notes', { token, headers, json: { title: 'Einmal' } });
  const second = await call(api, 'POST', '/v1/notes', { token, headers, json: { title: 'Einmal' } });
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  assert.equal(second.body.id, first.body.id);
  assert.equal(second.headers.get('idempotent-replayed'), 'true');
  assert.equal(first.headers.get('idempotent-replayed'), null);
  assert.equal(await count(api, token), 1);
});

test('Ohne Schlüssel erzeugt jedes POST eine neue Notiz', async (t) => {
  const api = await startApi();
  t.after(api.close);
  const token = api.issue();
  await call(api, 'POST', '/v1/notes', { token, json: { title: 'A' } });
  await call(api, 'POST', '/v1/notes', { token, json: { title: 'A' } });
  assert.equal(await count(api, token), 2);
});

test('Derselbe Schlüssel mit anderem Inhalt oder ungültiges Format: Fehler', async (t) => {
  const api = await startApi();
  t.after(api.close);
  const token = api.issue();
  const headers = { 'Idempotency-Key': 'schluessel-0002' };
  await call(api, 'POST', '/v1/notes', { token, headers, json: { title: 'Erste' } });
  const reused = await call(api, 'POST', '/v1/notes', { token, headers, json: { title: 'Andere' } });
  assert.equal(reused.status, 422);
  assert.equal(reused.body.type, 'https://example.test/probleme/idempotency-key');
  const invalid = await call(api, 'POST', '/v1/notes', { token, headers: { 'Idempotency-Key': 'kurz' }, json: { title: 'x' } });
  assert.equal(invalid.status, 400);
  assert.equal(await count(api, token), 1);
});

test('Schlüssel gelten je Benutzer: ein fremder Schlüssel wird nicht wiedergegeben', async (t) => {
  const api = await startApi();
  t.after(api.close);
  const ada = api.issue('ada');
  const ben = api.issue('ben');
  const headers = { 'Idempotency-Key': 'gemeinsam-0003' };
  const first = await call(api, 'POST', '/v1/notes', { token: ada, headers, json: { title: 'Adas Notiz' } });
  const other = await call(api, 'POST', '/v1/notes', { token: ben, headers, json: { title: 'Bens Notiz' } });
  assert.notEqual(other.body.id, first.body.id);
  assert.equal(other.headers.get('idempotent-replayed'), null);
});
