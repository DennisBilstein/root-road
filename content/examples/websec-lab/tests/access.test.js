import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { getInvoiceUnsafe, getInvoice, requireRole, pick, NotFoundError, ForbiddenError } from '../src/access/guards.js';
import { joinInside, resolveInside } from '../src/access/paths.js';
import { isBlockedAddress, resolvePublicTarget } from '../src/access/ssrf.js';

const invoices = new Map([[1, { id: 1, ownerId: 'ada', total: 100 }], [2, { id: 2, ownerId: 'grace', total: 250 }]]);

test('IDOR: ohne Besitzprüfung genügt das Raten der Nummer', () => {
  assert.equal(getInvoiceUnsafe(invoices, 2)?.total, 250, 'unsicher: ada liest die Rechnung von grace');
  const ada = { id: 'ada', role: 'user' };
  assert.equal(getInvoice(invoices, ada, 1).total, 100);
  assert.throws(() => getInvoice(invoices, ada, 2), NotFoundError, 'fremde Rechnung: 404');
  assert.throws(() => getInvoice(invoices, ada, 99), NotFoundError, 'fehlende Rechnung: genauso 404 (verrät nichts)');
  assert.equal(getInvoice(invoices, { id: 'root', role: 'admin' }, 2).total, 250, 'Admin darf');
});

test('Funktionsebene und Mass Assignment', () => {
  assert.throws(() => requireRole({ id: 'ada', role: 'user' }, 'admin'), ForbiddenError);
  assert.throws(() => requireRole(undefined, 'admin'), ForbiddenError);
  assert.doesNotThrow(() => requireRole({ id: 'x', role: 'admin' }, 'admin', 'support'));
  assert.deepEqual(pick({ name: 'Ada', role: 'admin', isAdmin: true }, ['name', 'email']), { name: 'Ada' });
  assert.deepEqual(pick(JSON.parse('{"__proto__":{"admin":true},"name":"x"}'), ['name']), { name: 'x' });
  assert.throws(() => pick(null, ['a']), TypeError);
  assert.equal(({}).admin, undefined, 'Object.prototype blieb unberührt');
});

test('Pfade: Text-Prüfung stoppt ../, realpath stoppt Links', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'ws-'));
  try {
    const root = path.join(dir, 'public');
    mkdirSync(root);
    writeFileSync(path.join(root, 'ok.txt'), 'ok');
    writeFileSync(path.join(dir, 'geheim.txt'), 'geheim');
    symlinkSync(path.join(dir, 'geheim.txt'), path.join(root, 'link.txt'));
    assert.equal(joinInside(root, 'ok.txt'), path.join(root, 'ok.txt'));
    assert.throws(() => joinInside(root, '../geheim.txt'), RangeError);
    assert.throws(() => joinInside(root, '/etc/passwd'), RangeError);
    assert.throws(() => joinInside(root, 'a/../../geheim.txt'), RangeError);
    assert.doesNotThrow(() => joinInside(root, '..hidden'), 'ein Name, der nur mit .. beginnt, ist erlaubt');
    assert.doesNotThrow(() => joinInside(root, 'link.txt'), 'nur Text geprüft: der Link rutscht durch');
    assert.equal(await resolveInside(root, 'ok.txt'), path.join(await import('node:fs/promises').then((m) => m.realpath(root)), 'ok.txt'));
    await assert.rejects(resolveInside(root, 'link.txt'), /Link/, 'realpath erkennt den Link nach außen');
    await assert.rejects(resolveInside(root, 'fehlt.txt'), { code: 'ENOENT' });
    await assert.rejects(resolveInside(root, 'a\0b'), TypeError);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('SSRF: Adressbereiche', () => {
  for (const address of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254', '0.0.0.0', '::1', 'fe80::1', 'fd00::1', '::ffff:127.0.0.1', '::ffff:7f00:1', 'kein-ip']) {
    assert.equal(isBlockedAddress(address), true, `${address} muss blockiert sein`);
  }
  for (const address of ['93.184.216.34', '8.8.8.8', '172.32.0.1', '2606:2800:220:1:248:1893:25c8:1946']) {
    assert.equal(isBlockedAddress(address), false, `${address} ist öffentlich`);
  }
});

test('SSRF: URL-Prüfung mit ersetztem DNS', async () => {
  const resolve = async (host) => ({
    'ok.example': [{ address: '93.184.216.34' }],
    'intern.example': [{ address: '10.0.0.5' }],
    'gemischt.example': [{ address: '93.184.216.34' }, { address: '127.0.0.1' }],
    'leer.example': [],
  })[host] ?? [];
  const ok = await resolvePublicTarget('https://ok.example/pfad', { resolve });
  assert.equal(ok.address, '93.184.216.34');
  for (const url of ['http://intern.example/', 'http://gemischt.example/', 'http://leer.example/', 'http://127.0.0.1/', 'http://2130706433/', 'http://0x7f.1/', 'http://[::1]/', 'http://[::ffff:127.0.0.1]/', 'http://169.254.169.254/latest/meta-data/']) {
    await assert.rejects(resolvePublicTarget(url, { resolve }), RangeError, url);
  }
  await assert.rejects(resolvePublicTarget('file:///etc/passwd', { resolve }), /http und https/);
  await assert.rejects(resolvePublicTarget('ftp://ok.example/', { resolve }), /http und https/);
  await assert.rejects(resolvePublicTarget('https://user:pw@ok.example/', { resolve }), /Zugangsdaten/);
  await assert.rejects(resolvePublicTarget('keine url', { resolve }), TypeError);
  await assert.rejects(resolvePublicTarget('https://ok.example/', { resolve, allowedHosts: ['andere.example'] }), /Liste/);
  assert.equal((await resolvePublicTarget('https://ok.example/', { resolve, allowedHosts: ['ok.example'] })).address, '93.184.216.34');
});
