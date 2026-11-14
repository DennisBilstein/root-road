// Vertragstest: Jede Antwort der laufenden API wird gegen openapi.json geprüft (Status dokumentiert, Rumpf passt zum Schema,
// Pflicht-Header vorhanden). Umgekehrt muss jeder dokumentierte Status von mindestens einem Szenario ausgelöst werden.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { startApi, call } from './helpers.js';
import { check } from '../src/schema-check.js';

const doc = JSON.parse(fs.readFileSync(new URL('../openapi.json', import.meta.url), 'utf8'));

function findOperation(method, template) {
  const operation = doc.paths[template]?.[method.toLowerCase()];
  assert.ok(operation, `${method} ${template} fehlt im Vertrag`);
  return operation;
}

function verify(label, operation, response) {
  const documented = operation.responses[String(response.status)];
  assert.ok(documented, `${label}: Status ${response.status} ist nicht dokumentiert`);
  for (const [name, header] of Object.entries(documented.headers ?? {})) {
    if (header.required) assert.ok(response.headers.get(name), `${label}: Header ${name} fehlt`);
  }
  if (documented.content) {
    const mediaType = Object.keys(documented.content)[0];
    assert.match(response.headers.get('content-type') ?? '', new RegExp(`^${mediaType.replace(/[+]/g, '\\+')}`), `${label}: Medientyp`);
    const errors = check(documented.content[mediaType].schema, response.body, doc);
    assert.deepEqual(errors, [], `${label}: Rumpf verletzt das Schema`);
  } else {
    assert.equal(response.body, undefined, `${label}: Status ${response.status} hat im Vertrag keinen Rumpf`);
  }
}

test('Alle Antworten entsprechen dem Vertrag, und der Vertrag ist vollständig geprüft', async (t) => {
  const api = await startApi();
  const tight = await startApi({ limits: { capacity: 1, refillPerSecond: 0.001 } });
  t.after(api.close);
  t.after(tight.close);
  const token = api.issue('ada');
  const readOnly = api.issue('ben', ['notes:read']);
  const writeOnly = api.issue('cem', ['notes:write']);
  const created = await call(api, 'POST', '/v1/notes', { token, json: { title: 'Vertrag', tags: ['api'] } });
  const path = created.headers.get('location');
  const etag = created.headers.get('etag');
  const tightToken = tight.issue();
  await call(tight, 'GET', '/v1/notes', { token: tightToken }); // verbraucht die einzige Anfrage

  const scenarios = [
    ['GET /v1/notes', () => call(api, 'GET', '/v1/notes?limit=1', { token })],
    ['GET /v1/notes', () => call(api, 'GET', '/v1/notes?limit=0', { token })],
    ['GET /v1/notes', () => call(api, 'GET', '/v1/notes')],
    ['GET /v1/notes', () => call(api, 'GET', '/v1/notes', { token: writeOnly })],
    ['GET /v1/notes', () => call(tight, 'GET', '/v1/notes', { token: tightToken })],
    ['POST /v1/notes', () => call(api, 'POST', '/v1/notes', { token, json: { title: 'Neu' } })],
    ['POST /v1/notes', () => call(api, 'POST', '/v1/notes', { token, raw: '{' })],
    ['POST /v1/notes', () => call(api, 'POST', '/v1/notes', { json: { title: 'x' } })],
    ['POST /v1/notes', () => call(api, 'POST', '/v1/notes', { token: readOnly, json: { title: 'x' } })],
    ['POST /v1/notes', () => call(api, 'POST', '/v1/notes', { token, raw: JSON.stringify({ title: 'x', body: 'a'.repeat(20_000) }) })],
    ['POST /v1/notes', () => call(api, 'POST', '/v1/notes', { token, headers: { 'Content-Type': 'text/plain' }, raw: 'x' })],
    ['POST /v1/notes', () => call(api, 'POST', '/v1/notes', { token, json: { title: '' } })],
    ['POST /v1/notes', () => call(tight, 'POST', '/v1/notes', { token: tightToken, json: { title: 'x' } })],
    ['GET /v1/notes/{id}', () => call(api, 'GET', path, { token })],
    ['GET /v1/notes/{id}', () => call(api, 'GET', path, { token, headers: { 'If-None-Match': etag } })],
    ['GET /v1/notes/{id}', () => call(api, 'GET', path)],
    ['GET /v1/notes/{id}', () => call(api, 'GET', path, { token: writeOnly })],
    ['GET /v1/notes/{id}', () => call(api, 'GET', '/v1/notes/9999', { token })],
    ['GET /v1/notes/{id}', () => call(tight, 'GET', path, { token: tightToken })],
    ['PUT /v1/notes/{id}', () => call(api, 'PUT', path, { token, json: { title: 'Geändert' }, headers: { 'If-Match': etag } })],
    ['PUT /v1/notes/{id}', () => call(api, 'PUT', path, { token, raw: '{', headers: { 'If-Match': '*' } })],
    ['PUT /v1/notes/{id}', () => call(api, 'PUT', path, { json: { title: 'x' } })],
    ['PUT /v1/notes/{id}', () => call(api, 'PUT', path, { token: readOnly, json: { title: 'x' }, headers: { 'If-Match': '*' } })],
    ['PUT /v1/notes/{id}', () => call(api, 'PUT', '/v1/notes/9999', { token, json: { title: 'x' }, headers: { 'If-Match': '*' } })],
    ['PUT /v1/notes/{id}', () => call(api, 'PUT', path, { token, json: { title: 'x' }, headers: { 'If-Match': '"veraltet"' } })],
    ['PUT /v1/notes/{id}', () => call(api, 'PUT', path, { token, raw: JSON.stringify({ title: 'x', body: 'a'.repeat(20_000) }), headers: { 'If-Match': '*' } })],
    ['PUT /v1/notes/{id}', () => call(api, 'PUT', path, { token, headers: { 'Content-Type': 'text/plain', 'If-Match': '*' }, raw: 'x' })],
    ['PUT /v1/notes/{id}', () => call(api, 'PUT', path, { token, json: { title: '' }, headers: { 'If-Match': '*' } })],
    ['PUT /v1/notes/{id}', () => call(api, 'PUT', path, { token, json: { title: 'x' } })],
    ['PUT /v1/notes/{id}', () => call(tight, 'PUT', path, { token: tightToken, json: { title: 'x' }, headers: { 'If-Match': '*' } })],
    ['DELETE /v1/notes/{id}', () => call(api, 'DELETE', '/v1/notes/9999', { token })],
    ['DELETE /v1/notes/{id}', () => call(api, 'DELETE', path)],
    ['DELETE /v1/notes/{id}', () => call(api, 'DELETE', path, { token: readOnly })],
    ['DELETE /v1/notes/{id}', () => call(tight, 'DELETE', path, { token: tightToken })],
    ['DELETE /v1/notes/{id}', () => call(api, 'DELETE', path, { token })], // zuletzt: löscht die Notiz (204)
  ];

  const seen = new Set();
  for (const [label, run] of scenarios) {
    const [method, template] = label.split(' ');
    const response = await run();
    verify(label, findOperation(method, template), response);
    seen.add(`${label} ${response.status}`);
  }
  const untested = [];
  for (const [template, item] of Object.entries(doc.paths)) {
    for (const [method, operation] of Object.entries(item)) {
      for (const status of Object.keys(operation.responses)) if (!seen.has(`${method.toUpperCase()} ${template} ${status}`)) untested.push(`${method.toUpperCase()} ${template} ${status}`);
    }
  }
  assert.deepEqual(untested, [], 'Dokumentierte Antworten ohne Test');
});

test('Der Prüfer erkennt Abweichungen: fehlendes Pflichtfeld, falscher Typ, unbekanntes Feld', () => {
  const schema = { $ref: '#/components/schemas/Note' };
  const valid = { id: '0001', title: 'A', body: '', tags: [], version: 1, createdAt: '2026-11-14T12:00:00.000Z', updatedAt: '2026-11-14T12:00:00.000Z' };
  assert.deepEqual(check(schema, valid, doc), []);
  assert.match(check(schema, { ...valid, title: undefined, version: '1' }, doc).join('\n'), /version: erwartet integer/);
  assert.match(check(schema, { ...valid, extra: true }, doc).join('\n'), /unbekanntes Feld extra/);
  const { id, ...withoutId } = valid;
  assert.match(check(schema, withoutId, doc).join('\n'), /Pflichtfeld id fehlt/);
  assert.match(check(schema, { ...valid, createdAt: 'gestern' }, doc).join('\n'), /kein date-time/);
});
