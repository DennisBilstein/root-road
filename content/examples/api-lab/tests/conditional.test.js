import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startApi, call } from './helpers.js';

async function createNote(api, token) {
  const created = await call(api, 'POST', '/v1/notes', { token, json: { title: 'Ausgang' } });
  return { path: created.headers.get('location'), etag: created.headers.get('etag') };
}

test('If-None-Match: unveränderte Notiz liefert 304 ohne Rumpf', async (t) => {
  const api = await startApi();
  t.after(api.close);
  const token = api.issue();
  const { path, etag } = await createNote(api, token);
  const unchanged = await call(api, 'GET', path, { token, headers: { 'If-None-Match': etag } });
  assert.equal(unchanged.status, 304);
  assert.equal(unchanged.body, undefined);
  assert.equal(unchanged.headers.get('etag'), etag);
  const stale = await call(api, 'GET', path, { token, headers: { 'If-None-Match': '"alt"' } });
  assert.equal(stale.status, 200);
});

test('Verlorene Änderung: zweiter Schreiber mit altem ETag erhält 412', async (t) => {
  const api = await startApi();
  t.after(api.close);
  const token = api.issue();
  const { path, etag } = await createNote(api, token);
  const writerA = await call(api, 'PUT', path, { token, json: { title: 'Von A' }, headers: { 'If-Match': etag } });
  assert.equal(writerA.status, 200);
  const writerB = await call(api, 'PUT', path, { token, json: { title: 'Von B' }, headers: { 'If-Match': etag } });
  assert.equal(writerB.status, 412);
  assert.equal((await call(api, 'GET', path, { token })).body.title, 'Von A');
  // Mit dem neuen ETag gelingt die Änderung.
  const retry = await call(api, 'PUT', path, { token, json: { title: 'Von B' }, headers: { 'If-Match': writerA.headers.get('etag') } });
  assert.equal(retry.status, 200);
});

test('PUT ohne If-Match wird mit 428 abgelehnt', async (t) => {
  const api = await startApi();
  t.after(api.close);
  const token = api.issue();
  const { path } = await createNote(api, token);
  const response = await call(api, 'PUT', path, { token, json: { title: 'Ohne Bedingung' } });
  assert.equal(response.status, 428);
});
