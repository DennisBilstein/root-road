import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../src/server/app.js';

let server;
let base;

before(async () => {
  server = createApp();
  server.listen(0, '127.0.0.1'); // Port 0: das Betriebssystem wählt einen freien Port
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.close();
  await once(server, 'close');
});

const post = (body, headers = { 'content-type': 'application/json' }) => fetch(`${base}/tasks`, { method: 'POST', headers, body });

test('Gesundheitscheck und Sicherheitsheader', async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
});

test('POST legt an (201 + Location), GET liest, DELETE löscht (204), danach 404', async () => {
  const created = await post(JSON.stringify({ title: '  Milch  ' }));
  assert.equal(created.status, 201);
  const task = await created.json();
  assert.deepEqual(task, { id: 1, title: 'Milch', done: false });
  assert.equal(created.headers.get('location'), '/tasks/1');
  assert.deepEqual(await (await fetch(`${base}/tasks/1`)).json(), task);
  assert.equal((await fetch(`${base}/tasks/1`, { method: 'DELETE' })).status, 204);
  assert.equal((await fetch(`${base}/tasks/1`)).status, 404);
  assert.equal((await fetch(`${base}/tasks/1`, { method: 'DELETE' })).status, 404);
});

test('Fehlerfälle: 400, 413, 415, 422', async () => {
  assert.equal((await post('{kaputt')).status, 400);
  assert.equal((await post(JSON.stringify({ title: 'x'.repeat(2000) }))).status, 413);
  assert.equal((await post('title=x', { 'content-type': 'text/plain' })).status, 415);
  for (const bad of [{}, { title: '' }, { title: '   ' }, { title: 5 }, [], null, { title: 'x'.repeat(121) }]) {
    assert.equal((await post(JSON.stringify(bad))).status, 422, JSON.stringify(bad));
  }
  assert.equal((await post(JSON.stringify({ title: 'x'.repeat(120) }))).status, 201); // Grenzwert gilt noch
});

test('404 für unbekannte Pfade, 405 mit Allow-Header, Fehlermeldungen ohne interne Details', async () => {
  assert.equal((await fetch(`${base}/nope`)).status, 404);
  const wrong = await fetch(`${base}/tasks`, { method: 'PUT' });
  assert.equal(wrong.status, 405);
  assert.equal(wrong.headers.get('allow'), 'GET, POST');
  assert.deepEqual(await wrong.json(), { error: 'Methode nicht erlaubt' });
});
