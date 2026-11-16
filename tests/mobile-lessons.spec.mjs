import { test, expect } from '@playwright/test';

// Regression: Das Quiz (fieldset.qcard) machte Lektionen bei 375 px horizontal scrollbar.
for (const lessonId of ['html-m1-l1', 'abap-m7-l1', 'java-m25-l1']) {
  test(`Lektion ${lessonId} läuft bei 375 px nicht horizontal über`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/');
    await page.waitForFunction(() => window.RP_APP_READY);
    await page.evaluate((id) => selectLesson(id), lessonId);
    await expect(page.locator('fieldset.qcard').first()).toBeAttached();
    const overflow = await page.evaluate(() => document.scrollingElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

// Handy-Kopfzeile, Seitenmenü und untere Leiste (Abweichungen zum PC-Aussehen, die früher auffielen).
for (const width of [320, 390]) {
  test(`Handy ${width} px: Kopfzeile in einer Zeile, Menü geschlossen unsichtbar, Leiste ohne Leerraum`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await page.waitForFunction(() => window.RP_APP_READY);
    const m = await page.evaluate(() => {
      const chip = document.querySelector('.lvl-chip').getBoundingClientRect();
      const lvl = document.querySelector('.lc-lvl').getBoundingClientRect();
      const bar = document.querySelector('#mobilbar');
      const barContent = [...bar.children].reduce((max, child) => Math.max(max, child.getBoundingClientRect().height), 0);
      const side = document.querySelector('#sidebar');
      return { chipLines: Math.round(chip.height / lvl.height), sidebarVisibility: getComputedStyle(side).visibility,
        barEmpty: Math.round(bar.getBoundingClientRect().height - barContent), overflow: document.scrollingElement.scrollWidth - innerWidth };
    });
    expect(m.chipLines).toBeLessThanOrEqual(2); // Chip = eine Textzeile + Innenabstand, kein Umbruch von „Lv 1“
    expect(m.sidebarVisibility).toBe('hidden');
    expect(m.barEmpty).toBeLessThanOrEqual(20); // nur Innenabstand; früher blieben ~30 px leer
    expect(m.overflow).toBeLessThanOrEqual(0);
    // Tab-Fokus darf nicht in das geschlossene Menü laufen.
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => document.activeElement.closest('#sidebar') === null)).toBe(true);
    }
  });
}

test('Handy: geöffnetes Menü ist sichtbar und sein letzter Eintrag liegt nicht hinter der unteren Leiste', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForFunction(() => window.RP_APP_READY);
  await page.click('.hamburger');
  await expect(page.locator('#sidebar')).toBeVisible();
  const gap = await page.evaluate(() => {
    const side = document.querySelector('#sidebar');
    side.scrollTop = side.scrollHeight;
    const items = [...side.querySelectorAll('a,button')].filter((e) => e.getBoundingClientRect().height > 0);
    return document.querySelector('#mobilbar').getBoundingClientRect().top - items[items.length - 1].getBoundingClientRect().bottom;
  });
  expect(gap).toBeGreaterThanOrEqual(0);
});

// Touch-Geräte: Menü-Bedienung, Eingabegrößen (iOS zoomt unter 16 px), Zielgrößen und Kopf-Metadaten.
test.describe('Touch-Gerät, 390 px', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('Menü: Zustand für Screenreader, Fokus, inert, Escape und erneuter Klick', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.RP_APP_READY);
    const burger = page.locator('#hamburger');
    await expect(burger).toHaveAttribute('aria-expanded', 'false');
    await burger.click();
    await expect(burger).toHaveAttribute('aria-expanded', 'true');
    expect(await page.evaluate(() => !!document.activeElement.closest('#sidebar'))).toBe(true);
    expect(await page.evaluate(() => ['content', 'mobilbar'].map((id) => document.getElementById(id).inert))).toEqual([true, true]);
    await page.keyboard.press('Escape');
    await expect(burger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#sidebar')).toBeHidden();
    expect(await page.evaluate(() => document.activeElement.id)).toBe('hamburger');
    expect(await page.evaluate(() => ['content', 'mobilbar'].map((id) => document.getElementById(id).inert))).toEqual([false, false]);
    await burger.click();
    await burger.click();
    await expect(burger).toHaveAttribute('aria-expanded', 'false');
  });

  test('Eingabefelder haben mindestens 16 px, kleine Knöpfe eine Trefferfläche von 44 px', async ({ page }) => {
    await page.goto('/#/pp-m1-l1');
    await page.waitForFunction(() => window.RP_APP_READY);
    await expect(page.locator('fieldset.qcard').first()).toBeAttached();
    const small = await page.evaluate(() => [...document.querySelectorAll('textarea,select,input:not([type=checkbox]):not([type=radio]):not([type=hidden])')]
      .filter((e) => e.getBoundingClientRect().width > 0 && parseFloat(getComputedStyle(e).fontSize) < 16).map((e) => e.id || e.className));
    expect(small).toEqual([]);
    const reach = await page.evaluate(() => ['#hamburger', '#rbTeilenKnopf', '#lvlChip'].map((sel) => {
      const el = document.querySelector(sel), r = el.getBoundingClientRect(), cx = r.x + r.width / 2, cy = r.y + r.height / 2;
      const hit = (dx, dy) => { const t = document.elementFromPoint(cx + dx, cy + dy); return t === el || el.contains(t); };
      return [sel, hit(0, -21), hit(0, 21), hit(-21, 0), hit(21, 0)];
    }));
    for (const row of reach) expect(row.slice(1), row[0]).toEqual([true, true, true, true]);
  });
});

test('Kopfbereich meldet Farben der Browserleiste für helles und dunkles Schema', async ({ request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toMatch(/<meta name="theme-color" content="#ffffff" media="\(prefers-color-scheme: light\)">/);
  expect(html).toMatch(/<meta name="theme-color" content="#121a25" media="\(prefers-color-scheme: dark\)">/);
});

// Im Mobilmodus wächst das Layout-Viewport mit zu breitem Inhalt (innerWidth > Gerätebreite); scrollWidth - innerWidth bliebe dabei 0.
for (const width of [320, 390]) {
  test(`Handy ${width} px: Layout-Viewport bleibt so breit wie das Gerät, Schrift mindestens 12 px`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 800 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    for (const route of ['#/', '#/heute', '#/pp-m1-l1', '#/labor', '#/exam']) {
      await page.goto(`/${route}`);
      await page.waitForFunction(() => window.RP_APP_READY);
      await page.waitForTimeout(500);
      expect(await page.evaluate(() => innerWidth), route).toBe(width);
      const tiny = await page.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && e.tagName !== 'KBD' && !e.closest('#sidebar') && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
          && parseFloat(getComputedStyle(e).fontSize) < 11.95;
      }).map((e) => `${e.tagName}.${e.className} ${getComputedStyle(e).fontSize}`));
      expect(tiny, route).toEqual([]);
    }
    await context.close();
  });
}

test('Querformat: Kopfzeile und untere Leiste sind niedrig, die Seite bleibt so breit wie das Gerät', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await page.goto('/#/pp-m1-l1');
  await page.waitForFunction(() => window.RP_APP_READY);
  const m = await page.evaluate(() => ({ iw: innerWidth, top: document.querySelector('.topbar').getBoundingClientRect().height, bar: document.querySelector('#mobilbar').getBoundingClientRect().height }));
  expect(m.iw).toBe(844);
  expect(m.top + m.bar).toBeLessThanOrEqual(104); // vorher 121 px
  await context.close();
});

test('Home-Screen-Icon und Manifest sind eingebunden und erreichbar', async ({ request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain('<link rel="manifest" href="assets/manifest.webmanifest">');
  expect(html).toContain('<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">');
  const manifestResponse = await request.get('/assets/manifest.webmanifest');
  expect(manifestResponse.headers()['content-type']).toContain('manifest+json');
  const manifest = await manifestResponse.json();
  expect(manifest.name).toBe('Root Road');
  for (const icon of manifest.icons) {
    const response = await request.get(`/assets/${icon.src}`);
    expect(response.status(), icon.src).toBe(200);
    expect(response.headers()['content-type']).toBe('image/png');
  }
  expect((await request.get('/assets/apple-touch-icon.png')).status()).toBe(200);
});
