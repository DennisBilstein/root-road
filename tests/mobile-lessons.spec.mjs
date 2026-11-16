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
