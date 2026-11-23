import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { mainPolicy, sandboxPolicy, sandboxPath, permissionsPolicy } from '../server/web-policy.mjs';

// Der Static-Build (Netlify o. Ä.) muss dieselben Hashes und Sicherheitsheader liefern wie der Express-Server.
const out = path.resolve('dist-static-test');
const read = (file) => fs.readFileSync(path.join(out, file), 'utf8');

test.beforeAll(() => {
  execFileSync(process.execPath, ['scripts/build-static.mjs', path.relative(process.cwd(), out)], { stdio: 'pipe' });
});
test.afterAll(() => fs.rmSync(out, { recursive: true, force: true }));

test('index.html und Lernmanifest sind identisch zu dem, was der Server ausliefert', async ({ request }) => {
  expect(read('index.html')).toBe(await (await request.get('/')).text());
  expect(JSON.parse(read('assets/learning-manifest.json'))).toEqual(await (await request.get('/assets/learning-manifest.json')).json());
});

test('Server-only-Dateien fehlen, App-Dateien sind vorhanden', () => {
  const names = fs.readdirSync(path.join(out, 'assets'));
  expect(names.filter((name) => /^admin|^style-\d+\.css$/.test(name))).toEqual([]);
  for (const name of ['app.css', 'script-01.js', 'guided-sandbox.html', 'learning-manifest.json', 'fonts']) expect(names).toContain(name);
  expect(fs.existsSync(path.join(out, 'admin.html'))).toBe(false);
  expect(fs.existsSync(path.join(out, 'api'))).toBe(false);
});

test('_headers enthält dieselben Richtlinien wie der Server, je Pfad genau eine CSP', async ({ request }) => {
  const rules = Object.fromEntries(read('_headers').trim().split(/\n\n+/).map((block) => {
    const [route, ...lines] = block.split('\n');
    return [route, Object.fromEntries(lines.map((line) => { const at = line.indexOf(':'); return [line.slice(0, at).trim().toLowerCase(), line.slice(at + 1).trim()]; }))];
  }));
  for (const route of ['/', '/index.html']) {
    expect(rules[route]['content-security-policy']).toBe(mainPolicy);
    expect(rules[route]['x-frame-options']).toBe('DENY');
  }
  expect(rules[sandboxPath]['content-security-policy']).toBe(sandboxPolicy);
  expect(rules[sandboxPath]['x-frame-options']).toBe('SAMEORIGIN');
  expect(rules['/*']['permissions-policy']).toBe(permissionsPolicy);
  expect(rules['/assets/manifest.webmanifest']['content-type']).toBe('application/manifest+json');
  expect(rules['/*']['content-security-policy']).toBeUndefined();
  // Gegenprobe: Der Server sendet dieselben Werte.
  const served = (await request.get('/')).headers();
  expect(served['content-security-policy']).toBe(mainPolicy);
  expect(served['permissions-policy']).toBe(permissionsPolicy);
  expect((await request.get(sandboxPath)).headers()['content-security-policy']).toBe(sandboxPolicy);
});

// Solange Impressum oder Datenschutzerklärung Platzhalter (mark.luecke) enthalten, darf der Static-Build nicht indexierbar sein.
// Wird noindex entfernt (Livegang), müssen vorher alle Platzhalter durch echte Angaben ersetzt sein.
test('noindex bleibt, solange Impressum und Datenschutz Platzhalter enthalten', async ({ page }) => {
  const noindex = /^\/\*\n(?:.*\n)*?\s+x-robots-tag:\s*noindex/im.test(read('_headers'));
  await page.goto('/#/recht');
  await page.waitForFunction(() => window.RP_APP_READY);
  const placeholders = [];
  for (const tab of ['impressum', 'datenschutz']) {
    await page.evaluate((name) => setzeRecht(name), tab);
    await expect(page.locator('#content h1')).toContainText('Impressum');
    for (const text of await page.locator('#content mark.luecke').allTextContents()) placeholders.push(tab + ': ' + text);
  }
  if (placeholders.length) expect(noindex, 'noindex fehlt, aber Platzhalter vorhanden:\n' + placeholders.join('\n')).toBe(true);
});
