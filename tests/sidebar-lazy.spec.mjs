import { test, expect } from '@playwright/test';

// Die Seitenleiste legt Lektionsknöpfe erst an, wenn ein Modul geöffnet wird (aktuelles Modul sofort); das spart ~2.500 Elemente beim Start.
test('Lektionsknöpfe entstehen für das aktuelle Modul sofort, für andere beim Aufklappen', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => window.RP_APP_READY);
  await page.evaluate(() => { rpChoosePath('ap1'); state.currentId = 'm1-l2'; render(); });
  const before = await page.evaluate(() => ({
    modules: document.querySelectorAll('#moduleNav details.module').length,
    filled: document.querySelectorAll('#moduleNav details.module[data-gefuellt]').length,
    buttons: document.querySelectorAll('#moduleNav .lesson-btn').length,
    activeInOpen: !!document.querySelector('#moduleNav details.module[open] .lesson-btn.active'),
  }));
  expect(before.modules).toBeGreaterThan(10);
  expect(before.filled).toBe(1);
  expect(before.buttons).toBe(await page.evaluate(() => moduleOfLesson('m1-l2').lessons.length));
  expect(before.activeInOpen).toBe(true);

  // Teil öffnen und ein anderes Modul per Zusammenfassung aufklappen: erst dann entstehen seine Knöpfe, und ein Klick wählt die Lektion.
  const target = await page.evaluate(() => { const m = MODULES.find((x) => x.id !== moduleOfLesson('m1-l2').id); return { id: m.id, first: m.lessons[0].id, count: m.lessons.length }; });
  await page.evaluate((id) => { document.querySelectorAll('#moduleNav details.rb-teil').forEach((d) => { d.open = true; }); return id; }, target.id);
  const summary = page.locator(`#moduleNav details.module[data-modul="${target.id}"] > summary`);
  expect(await page.locator(`#moduleNav details.module[data-modul="${target.id}"] .lesson-btn`).count()).toBe(0);
  await summary.click();
  await expect(page.locator(`#moduleNav details.module[data-modul="${target.id}"] .lesson-btn`)).toHaveCount(target.count);
  await page.locator(`#moduleNav details.module[data-modul="${target.id}"] .lesson-btn`).first().click();
  await expect.poll(() => page.evaluate(() => state.currentId)).toBe(target.first);
});

test('Beim Start wird die Seitenleiste nur einmal aufgebaut', async ({ page }) => {
  await page.addInitScript(() => {
    window.__partLabels = 0;
    new MutationObserver((list) => { for (const m of list) m.addedNodes.forEach((n) => { if (n.matches && n.matches('.part-label')) window.__partLabels++; }); }).observe(document, { childList: true, subtree: true });
  });
  await page.goto('/');
  await page.waitForFunction(() => window.RP_APP_READY);
  await page.waitForTimeout(800);
  const result = await page.evaluate(() => ({ added: window.__partLabels, parts: document.querySelectorAll('#moduleNav details.rb-teil').length }));
  expect(result.added).toBe(result.parts);
});
