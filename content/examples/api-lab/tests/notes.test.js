import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startApi, call } from './helpers.js';

test('Ressource Notiz: Anlegen, Lesen, Ändern und Löschen mit passenden Statuscodes', async (t) => {
  const api = await startApi();
  t.after(api.close);
  const token = api.issue();

  const created = await call(api, 'POST', '/v1/notes', { token, json: { title: 'Erste Notiz', tags: ['api'] } });
  assert.equal(created.status, 201);
  assert.equal(created.headers.get('location'), `/v1/notes/${created.body.id}`);
  assert.equal(created.body.owner, undefined, 'interne Felder gehören nicht in die Antwort');
  assert.equal(created.headers.get('etag'), `"${created.body.id}-v1"`);

  const read = await call(api, 'GET', created.headers.get('location'), { token });
  assert.equal(read.status, 200);
  assert.deepEqual(read.body, created.body);

  const replaced = await call(api, 'PUT', created.headers.get('location'), { token, json: { title: 'Neu' }, headers: { 'If-Match': created.headers.get('etag') } });
  assert.equal(replaced.status, 200);
  assert.equal(replaced.body.title, 'Neu');
  assert.equal(replaced.body.version, 2);

  assert.equal((await call(api, 'DELETE', created.headers.get('location'), { token })).status, 204);
  // Das zweite DELETE ändert nichts mehr, meldet aber 404: Die Ressource gibt es nicht mehr.
  assert.equal((await call(api, 'DELETE', created.headers.get('location'), { token })).status, 404);
});

test('Falsche Methode, Medientyp und zu großer Rumpf', async (t) => {
  const api = await startApi();
  t.after(api.close);
  const token = api.issue();

  const wrongMethod = await call(api, 'DELETE', '/v1/notes', { token });
  assert.equal(wrongMethod.status, 405);
  assert.equal(wrongMethod.headers.get('allow'), 'GET, POST');

  const wrongType = await call(api, 'POST', '/v1/notes', { token, headers: { 'Content-Type': 'text/plain' }, raw: 'hallo' });
  assert.equal(wrongType.status, 415);
  assert.equal(wrongType.body.title, 'Nicht unterstützter Medientyp');

  const tooLarge = await call(api, 'POST', '/v1/notes', { token, raw: JSON.stringify({ title: 'x', body: 'a'.repeat(20_000) }) });
  assert.equal(tooLarge.status, 413);

  assert.equal((await call(api, 'GET', '/v1/gibt-es-nicht', { token })).status, 404);
  assert.equal((await call(api, 'GET', '/v1/notes/abc', { token })).status, 404);
});
