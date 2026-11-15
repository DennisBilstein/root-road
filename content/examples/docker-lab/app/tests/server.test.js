import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

test('Gesundheitscheck und Zähler (Datenverzeichnis im temporären Ordner)', async () => {
  process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'dk-'));
  const { createServer } = await import('../src/server.js');
  const server = createServer().listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.deepEqual(await (await fetch(`${base}/healthz`)).json(), { status: 'ok' });
  await fetch(`${base}/visit`, { method: 'POST' });
  assert.deepEqual(await (await fetch(`${base}/visit`, { method: 'POST' })).json(), { visits: 2 });
  assert.equal((await fetch(`${base}/gibt-es-nicht`)).status, 404);
  server.close();
});
