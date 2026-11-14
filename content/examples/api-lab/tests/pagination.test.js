import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startApi, call } from './helpers.js';

async function seed(api, token, count) {
  for (let number = 1; number <= count; number += 1) await call(api, 'POST', '/v1/notes', { token, json: { title: `Notiz ${number}` } });
}

test('Cursor-Seiten laufen lückenlos bis zum Ende, auch wenn alle Zeitstempel gleich sind', async (t) => {
  const api = await startApi();
  t.after(api.close);
  const token = api.issue();
  await seed(api, token, 7); // feste Uhr: alle createdAt gleich, die ID entscheidet über die Reihenfolge

  const titles = [];
  let cursor = null;
  let pages = 0;
  do {
    const response = await call(api, 'GET', `/v1/notes?limit=3${cursor ? `&cursor=${cursor}` : ''}`, { token });
    assert.equal(response.status, 200);
    titles.push(...response.body.items.map((note) => note.title));
    cursor = response.body.nextCursor;
    pages += 1;
  } while (cursor);
  assert.equal(pages, 3);
  assert.deepEqual(titles, Array.from({ length: 7 }, (_, index) => `Notiz ${index + 1}`));
});

test('Löschen zwischen zwei Seiten überspringt mit Cursor nichts, mit OFFSET schon', async (t) => {
  const api = await startApi();
  t.after(api.close);
  const token = api.issue();
  await seed(api, token, 7);
  const first = await call(api, 'GET', '/v1/notes?limit=3', { token });
  assert.match(first.headers.get('link'), /rel="next"/);
  await call(api, 'DELETE', `/v1/notes/${first.body.items[0].id}`, { token });

  const next = await call(api, 'GET', `/v1/notes?limit=3&cursor=${first.body.nextCursor}`, { token });
  assert.deepEqual(next.body.items.map((note) => note.title), ['Notiz 4', 'Notiz 5', 'Notiz 6']);

  // Zum Vergleich dieselbe Lage mit OFFSET 3 auf der verkürzten Liste: Notiz 4 würde nie angezeigt.
  const remaining = ['Notiz 2', 'Notiz 3', 'Notiz 4', 'Notiz 5', 'Notiz 6', 'Notiz 7'];
  assert.deepEqual(remaining.slice(3, 6), ['Notiz 5', 'Notiz 6', 'Notiz 7']);
});

test('Ungültige Cursor und Limits werden mit 400 abgelehnt', async (t) => {
  const api = await startApi();
  t.after(api.close);
  const token = api.issue();
  for (const query of ['cursor=kaputt', 'limit=0', 'limit=101', 'limit=abc', 'limit=2.5']) {
    const response = await call(api, 'GET', `/v1/notes?${query}`, { token });
    assert.equal(response.status, 400, query);
    assert.match(response.body.type, /^https:\/\/example\.test\/probleme\//);
  }
});
