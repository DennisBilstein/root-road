import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm, writeFile, chmod } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { bytes, countLines, gzipFile, readJson, safeJoin, writeJsonAtomic } from '../src/files/files.js';

async function withTempDir(run) {
  const dir = await mkdtemp(path.join(tmpdir(), 'node-lab-'));
  try {
    await run(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test('safeJoin lässt Unterpfade zu und blockt Ausbruchsversuche', () => {
  const root = path.resolve('/srv/data');
  assert.equal(safeJoin(root, 'a/b.txt'), path.join(root, 'a/b.txt'));
  assert.equal(safeJoin(root, './a/../b.txt'), path.join(root, 'b.txt'));
  for (const evil of ['../etc/passwd', 'a/../../x', '/etc/passwd', '..']) {
    assert.throws(() => safeJoin(root, evil), RangeError, evil);
  }
  // Ein Verzeichnis mit gleichem Präfix ist kein Unterverzeichnis: /srv/data-backup liegt nicht in /srv/data.
  assert.throws(() => safeJoin(root, '../data-backup/x'), RangeError);
});

test('readJson und writeJsonAtomic', async () => {
  await withTempDir(async (dir) => {
    const file = path.join(dir, 'config.json');
    await writeJsonAtomic(file, { port: 8080 });
    assert.deepEqual(await readJson(file), { port: 8080 });
    assert.deepEqual(await readdir(dir), ['config.json']); // keine .tmp-Reste

    await assert.rejects(readJson(path.join(dir, 'fehlt.json')), /Datei fehlt: fehlt\.json/);
    await writeFile(path.join(dir, 'kaputt.json'), '{nein');
    await assert.rejects(readJson(path.join(dir, 'kaputt.json')), SyntaxError);
  });
});

test('readJson meldet fehlende Rechte (nicht als root)', { skip: process.getuid?.() === 0 }, async () => {
  await withTempDir(async (dir) => {
    const file = path.join(dir, 'geheim.json');
    await writeFile(file, '{}');
    await chmod(file, 0o000);
    await assert.rejects(readJson(file), /Kein Zugriff auf geheim\.json/);
  });
});

test('countLines: Grenzfälle', async () => {
  await withTempDir(async (dir) => {
    const cases = [['', 0], ['a\n', 1], ['a\nb', 2], ['a\nb\n', 2], ['\n\n', 2]];
    for (const [content, expected] of cases) {
      const file = path.join(dir, 'f.txt');
      await writeFile(file, content);
      assert.equal(await countLines(file), expected, JSON.stringify(content));
    }
    await assert.rejects(countLines(path.join(dir, 'fehlt.txt')), { code: 'ENOENT' });
  });
});

test('gzipFile komprimiert als Stream', async () => {
  await withTempDir(async (dir) => {
    const from = path.join(dir, 'a.txt');
    await writeFile(from, 'Hallo '.repeat(1000));
    await gzipFile(from, path.join(dir, 'a.txt.gz'));
    assert.equal(gunzipSync(await readFile(path.join(dir, 'a.txt.gz'))).toString(), 'Hallo '.repeat(1000));
  });
});

test('Zeichen sind keine Bytes', () => {
  assert.deepEqual(bytes('abc'), { zeichen: 3, bytes: 3 });
  assert.deepEqual(bytes('äöü'), { zeichen: 3, bytes: 6 });
  assert.deepEqual(bytes('😀'), { zeichen: 2, bytes: 4 }); // .length zählt UTF-16-Einheiten
});
