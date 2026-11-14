import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startApi, call } from './helpers.js';

test('Validierungsfehler: 422 als Problem Details mit Feldliste', async (t) => {
  const api = await startApi();
  t.after(api.close);
  const token = api.issue();
  const response = await call(api, 'POST', '/v1/notes', { token, json: { title: '   ', tags: ['GROSS', 'ok'], extra: 1 } });
  assert.equal(response.status, 422);
  assert.match(response.headers.get('content-type'), /^application\/problem\+json/);
  assert.equal(response.body.type, 'https://example.test/probleme/validierung');
  assert.equal(response.body.status, 422);
  assert.deepEqual(response.body.errors.map((error) => error.field).sort(), ['extra', 'tags', 'title']);
});

test('Ungültiges JSON ist ein 400-Fehler und kein 422', async (t) => {
  const api = await startApi();
  t.after(api.close);
  const response = await call(api, 'POST', '/v1/notes', { token: api.issue(), raw: '{"title": ' });
  assert.equal(response.status, 400);
  assert.equal(response.body.title, 'Ungültiges JSON');
});

test('Unerwartete Fehler: allgemeine 500-Antwort ohne Details, Ursache im Protokoll', async (t) => {
  const api = await startApi();
  t.after(api.close);
  const logged = [];
  api.app.server.on('appError', (error) => logged.push(error.message));
  api.app.store.create = () => { throw new Error('Datenbank unter /var/db/geheim.sqlite nicht erreichbar'); };
  const response = await call(api, 'POST', '/v1/notes', { token: api.issue(), json: { title: 'x' } });
  assert.equal(response.status, 500);
  assert.equal(response.body.detail, undefined);
  assert.doesNotMatch(JSON.stringify(response.body), /geheim|sqlite/);
  assert.equal(logged.length, 1);
  assert.match(logged[0], /geheim/);
});
