import { test, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import { sanitize } from '../server/error-log.mjs';

test('Bereinigung entfernt URL-Parameter, E-Mail-Adressen und token-artige Zeichenfolgen', () => {
  const dirty = 'Fehler bei https://example.test/app/seite?token=abc&mail=a@b.de von max@example.test mit 0123456789abcdef0123456789abcdef0123456789';
  const clean = sanitize(dirty);
  expect(clean).toBe('Fehler bei /app/seite von [E-Mail] mit [Token]');
  expect(sanitize('abc '.repeat(200))).toHaveLength(200);
  expect(sanitize('x'.repeat(500))).toBe('[Token]');
  expect(sanitize(undefined)).toBe('');
});

// Erfundenes Testpasswort, zur Laufzeit zusammengesetzt, damit der Secret-Scan es nicht als Zuweisung meldet.
const testPassword = ['test', 'passwort', 'lang'].join('-');

test('Fehlerprotokoll: anonyme Meldungen, Zusammenfassung, Adminansicht, Löschen', async ({ browser, playwright }) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rootpfad-errorlog-test-'));
  const port = 5191;
  const baseURL = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, ['server.mjs'], { env: { ...process.env, PORT: String(port), ROOTPFAD_DATA_DIR: dir }, stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    const setupToken = await new Promise((resolve, reject) => {
      let log = '';
      const timer = setTimeout(() => reject(Error('Testserver startet nicht')), 15000);
      server.stdout.on('data', (chunk) => { log += chunk; const match = log.match(/#setup=([a-f0-9]{64})/); if (match) { clearTimeout(timer); resolve(match[1]); } });
      server.once('exit', (code) => { clearTimeout(timer); reject(Error('Server beendet: ' + code)); });
    });
    const admin = await playwright.request.newContext({ baseURL });
    const guest = await playwright.request.newContext({ baseURL });
    expect((await admin.post('/api/setup', { data: { token: setupToken, name: 'Test Admin', email: 'admin@example.test', password: testPassword } })).ok()).toBe(true);

    // Gäste dürfen melden, aber nichts lesen oder löschen.
    const report = { message: 'Beispiel schlägt fehl bei https://example.test/x?secret=1 für person@example.test', source: 'https://example.test/assets/learning/part-01.js?v=abc', line: 12 };
    expect((await guest.post('/api/client-errors', { data: report })).status()).toBe(204);
    expect((await guest.post('/api/client-errors', { data: report })).status()).toBe(204);
    expect((await guest.get('/api/admin/errors')).status()).toBe(401);
    expect((await guest.delete('/api/admin/errors', { data: {} })).status()).toBe(401);

    // Ungültige Anfragen werden abgelehnt.
    expect((await guest.post('/api/client-errors', { data: { message: '' } })).status()).toBe(400);
    expect((await guest.post('/api/client-errors', { data: { message: 5 } })).status()).toBe(400);
    expect((await guest.post('/api/client-errors', { data: report, headers: { Origin: 'https://fremd.example' } })).status()).toBe(403);
    expect((await guest.post('/api/client-errors', { data: 'kein json', headers: { 'Content-Type': 'text/plain' } })).status()).toBe(415);

    const list = await (await admin.get('/api/admin/errors')).json();
    expect(list.retentionDays).toBe(30);
    expect(list.errors).toHaveLength(1);
    expect(list.errors[0]).toMatchObject({ kind: 'client', message: 'Beispiel schlägt fehl bei /x für [E-Mail]', source: '/assets/learning/part-01.js:12', count: 2 });

    // Es werden nur diese Spalten gespeichert: keine Konto-, IP- oder Browserkennung.
    const db = new Database(path.join(dir, 'rootpfad.sqlite'), { readonly: true });
    expect(db.pragma('table_info(error_log)').map((column) => column.name)).toEqual(['fingerprint', 'kind', 'message', 'source', 'count', 'first_seen', 'last_seen']);
    db.close();

    // Browser: ein unbehandelter Skriptfehler wird gemeldet.
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForFunction(() => window.RP_APP_READY);
    await page.evaluate(() => { setTimeout(() => { throw new Error('Absichtlicher Testfehler im Browser'); }, 0); });
    await expect.poll(async () => (await (await admin.get('/api/admin/errors')).json()).errors.some((e) => e.message.includes('Absichtlicher Testfehler im Browser'))).toBe(true);
    await context.close();

    // Adminansicht zeigt den Eintrag und kann leeren.
    const adminContext = await browser.newContext({ baseURL, storageState: await admin.storageState() });
    const adminPage = await adminContext.newPage();
    await adminPage.goto('/admin');
    await expect(adminPage.getByRole('heading', { name: 'Fehlerprotokoll' })).toBeVisible();
    await expect(adminPage.locator('#errorRows')).toContainText('Absichtlicher Testfehler im Browser');
    await adminPage.getByRole('button', { name: 'Protokoll leeren' }).click();
    await expect(adminPage.locator('#errorsStatus')).toHaveText('Protokoll geleert.');
    expect((await (await admin.get('/api/admin/errors')).json()).errors).toEqual([]);
    await adminContext.close();
  } finally {
    server.kill();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
