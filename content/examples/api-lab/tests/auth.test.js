import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startApi, call } from './helpers.js';

test('Fehlendes, falsches und abgelaufenes Token ergeben 401 mit WWW-Authenticate', async (t) => {
  const api = await startApi();
  t.after(api.close);
  const missing = await call(api, 'GET', '/v1/notes');
  assert.equal(missing.status, 401);
  assert.match(missing.headers.get('www-authenticate'), /^Bearer/);
  assert.equal((await call(api, 'GET', '/v1/notes', { token: 'erfunden' })).status, 401);
  const token = api.issue('ada', ['notes:read'], 1000);
  assert.equal((await call(api, 'GET', '/v1/notes', { token })).status, 200);
  api.advance(1001);
  assert.equal((await call(api, 'GET', '/v1/notes', { token })).status, 401);
});

test('Fehlender Scope ist 403, nicht 401', async (t) => {
  const api = await startApi();
  t.after(api.close);
  const readOnly = api.issue('ada', ['notes:read']);
  const response = await call(api, 'POST', '/v1/notes', { token: readOnly, json: { title: 'x' } });
  assert.equal(response.status, 403);
  assert.match(response.headers.get('www-authenticate'), /insufficient_scope/);
});

test('Fremde Notizen sehen aus wie nicht vorhandene (kein IDOR, keine ID-Aufzählung)', async (t) => {
  const api = await startApi();
  t.after(api.close);
  const ada = api.issue('ada');
  const ben = api.issue('ben');
  const created = await call(api, 'POST', '/v1/notes', { token: ada, json: { title: 'Privat' } });
  const path = created.headers.get('location');
  const foreign = await call(api, 'GET', path, { token: ben });
  const missing = await call(api, 'GET', '/v1/notes/9999', { token: ben });
  assert.equal(foreign.status, 404);
  assert.equal(missing.status, 404);
  assert.equal((await call(api, 'PUT', path, { token: ben, json: { title: 'Übernommen' }, headers: { 'If-Match': created.headers.get('etag') } })).status, 404);
  assert.equal((await call(api, 'DELETE', path, { token: ben })).status, 404);
  assert.equal((await call(api, 'GET', path, { token: ada })).body.title, 'Privat');
  assert.deepEqual((await call(api, 'GET', '/v1/notes', { token: ben })).body.items, []);
});

test('Der Gesundheitscheck braucht kein Token und verrät nichts', async (t) => {
  const api = await startApi();
  t.after(api.close);
  const response = await call(api, 'GET', '/healthz');
  assert.deepEqual(response.body, { status: 'ok' });
});
