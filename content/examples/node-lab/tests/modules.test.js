import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import slugify, { label, version } from 'rootpfad-node-lab/text'; // Selbstverweis über "exports"
import legacy from '../src/modules/legacy.cjs'; // ESM importiert CommonJS: module.exports wird zum Default
import data from '../src/modules/data.json' with { type: 'json' };
import { here } from '../src/modules/where.js';

const require = createRequire(import.meta.url);

test('ESM: benannte und Standard-Exports, Subpath-Import #format', () => {
  assert.equal(slugify('Äpfel & Birnen!'), 'apfel-birnen');
  assert.equal(slugify('  --Hallo   Welt-- '), 'hallo-welt');
  assert.equal(slugify(''), '');
  // ß hat keine Zerlegung in Grundbuchstaben und wird deshalb wie ein Sonderzeichen behandelt.
  assert.equal(label(7, 'Größe Ü'), '0007 gro-e-u');
  assert.equal(version, '1.0.0');
});

test('ESM importiert CommonJS, JSON per import attributes', () => {
  assert.match(legacy.describe('/x/y/datei.txt'), /^datei\.txt \(CommonJS, __filename vorhanden: true\)$/);
  assert.deepEqual(data, { name: 'demo', items: [1, 2, 3] });
});

test('CommonJS kann ESM laden: require() eines ES-Moduls ohne Top-Level-Await', () => {
  const text = require('../src/modules/text.js');
  assert.equal(text.slugify('A b'), 'a-b');
  assert.equal(text.default('X y'), 'x-y');
});

test('Dynamisches import() liefert ein Promise und eignet sich für optionale Module', async () => {
  const module = await import('../src/modules/format.js');
  assert.equal(module.pad(5, 3), '005');
  await assert.rejects(import('../src/modules/gibt-es-nicht.js'), { code: 'ERR_MODULE_NOT_FOUND' });
});

test('"exports" sperrt alles, was nicht aufgeführt ist', async () => {
  await assert.rejects(import('rootpfad-node-lab/src/modules/format.js'), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
});

test('import.meta statt __dirname; kein require im ES-Modul', () => {
  assert.equal(path.basename(here.file), 'where.js');
  assert.equal(path.basename(here.dir), 'modules');
  assert.equal(here.hasRequire, false);
});
