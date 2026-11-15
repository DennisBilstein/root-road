import { test, expect } from '@playwright/test';

// Skripte und Styles tragen einen Inhalts-Hash (?v=) und gelten dann als unveränderlich; ohne passenden Hash wird revalidiert.
test('index.html und Lernmanifest setzen Inhalts-Hashes ein', async ({ request }) => {
  const html = await (await request.get('/')).text();
  const scripts = [...html.matchAll(/data-rp-src="(assets\/[^"?]+\.js)\?v=([0-9a-f]{10})"/g)];
  const styles = [...html.matchAll(/href="(assets\/[^"?]+\.css)\?v=([0-9a-f]{10})"/g)];
  expect(scripts.length).toBeGreaterThan(20);
  expect(styles.length).toBe(1);
  expect(html).not.toMatch(/data-rp-src="assets\/[^"?]+"/);
  const index = await request.get('/');
  expect(index.headers()['cache-control']).toBe('no-cache');

  const manifestResponse = await request.get('/assets/learning-manifest.json');
  expect(manifestResponse.headers()['cache-control']).toBe('no-cache');
  const manifest = await manifestResponse.json();
  expect(manifest.data.length).toBeGreaterThan(0);
  expect(Object.keys(manifest.versions).sort()).toEqual([...manifest.files,...manifest.data,...Object.values(manifest.bodies),manifest.quiz].sort());
  for (const hash of Object.values(manifest.versions)) expect(hash).toMatch(/^[0-9a-f]{10}$/);
});

test('Mit passendem Hash unveränderlich, sonst revalidieren', async ({ request }) => {
  const manifest = await (await request.get('/assets/learning-manifest.json')).json();
  const file = manifest.files[1];
  const withHash = await request.get(`/${file}?v=${manifest.versions[file]}`);
  expect(withHash.status()).toBe(200);
  expect(withHash.headers()['cache-control']).toBe('public, max-age=31536000, immutable');
  const withoutHash = await request.get(`/${file}`);
  expect(withoutHash.headers()['cache-control']).toBe('no-cache');
  const dataFile = manifest.data[0];
  const jsonWithHash = await request.get(`/${dataFile}?v=${manifest.versions[dataFile]}`);
  expect(jsonWithHash.headers()['cache-control']).toBe('public, max-age=31536000, immutable');
  expect((await request.get(`/${dataFile}`)).headers()['cache-control']).toBe('no-cache');
  const bodyFile = manifest.bodies.m2;
  const bodyWithHash = await request.get(`/${bodyFile}?v=${manifest.versions[bodyFile]}`);
  expect(bodyWithHash.status()).toBe(200);
  expect(bodyWithHash.headers()['cache-control']).toBe('public, max-age=31536000, immutable');
  expect((await request.get(`/${bodyFile}`)).headers()['cache-control']).toBe('no-cache');
  const data = await request.get('/assets/module-assessments-data.js');
  expect(data.headers()['cache-control']).toBe('no-cache');
});

test('Zweiter Seitenaufruf holt die versionierten Lernskripte aus dem Cache', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => window.RP_APP_READY);
  await page.reload();
  await page.waitForFunction(() => window.RP_APP_READY);
  // Aus dem HTTP-Cache bediente Antworten haben transferSize 0.
  const fresh = await page.evaluate(() => performance.getEntriesByType('resource').filter((e) => /assets\/learning\/part-\d+\.js/.test(e.name) && e.transferSize > 0).length);
  expect(fresh).toBe(0);
  expect(await page.evaluate(() => FLAT.length)).toBeGreaterThan(500);
});
