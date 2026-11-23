import { test, expect } from '@playwright/test';

// Aufgabentexte, Tipps und Lösungen kommen erst mit assets/exercise-data.json; der Start kennt nur Stubs.
async function open(page) {
  const requested = [];
  page.on('request', (request) => { if (request.url().includes('exercise-data.json')) requested.push(request.url()); });
  await page.goto('/');
  await page.waitForFunction(() => window.RP_APP_READY);
  return requested;
}

test('Start lädt keine Aufgabentexte, kennt aber Anzahl, Stufen und Themen', async ({ page }) => {
  const requested = await open(page);
  await page.waitForTimeout(1200);
  expect(requested).toHaveLength(0);
  const start = await page.evaluate(() => ({
    ready: !!window.RP_EXERCISES_READY,
    count: EXERCISES.length,
    lazy: EXERCISES.every((e) => e.lazy === true && e.task === undefined && e.solution === undefined),
    meta: EXERCISES.every((e) => e.id && [1, 2, 3].includes(e.level) && e.title && e.topic),
  }));
  expect(start.ready).toBe(false);
  expect(start.count).toBeGreaterThan(50);
  expect(start.lazy).toBe(true);
  expect(start.meta).toBe(true);
});

test('Übungsaufgaben laden die Texte einmal nach und zeigen Aufgabe, Tipps und Lösung', async ({ page }) => {
  const requested = await open(page);
  await page.evaluate(() => { rpChoosePath('all'); selectLesson('exercises'); });
  await expect(page.locator('.ex-card').first().locator('.ex-task')).not.toBeEmpty();
  await expect(page.locator('.ex-card').first().getByRole('button', { name: /Tipp 1/ })).toBeVisible();
  expect(requested).toHaveLength(1);
  const result = await page.evaluate(() => ({
    ready: window.RP_EXERCISES_READY,
    stubsLeft: rpCatalog.exercises.filter((e) => e.lazy || !e.task || !e.solution || !e.hints).length,
    solutions: document.querySelectorAll('[id^="sol_"]').length,
    cards: document.querySelectorAll('.ex-card').length,
  }));
  expect(result.ready).toBe(true);
  expect(result.stubsLeft).toBe(0);
  expect(result.cards).toBe(result.solutions);
  await page.evaluate(() => { state.currentId = 'intro'; renderContent(); selectLesson('exercises'); });
  await expect(page.locator('.ex-card').first()).toBeVisible();
  expect(requested).toHaveLength(1);
});

test('Die Klausur lädt die Aufgaben, bevor sie gezogen werden', async ({ page }) => {
  await open(page);
  await page.evaluate(() => { rpChoosePath('all'); selectLesson('klausur'); });
  await page.locator('button.hk').first().click();
  await expect(page.locator('.kl-aufgabe, .ex-task, .kl-task').first()).toBeVisible();
  const text = await page.evaluate(() => klausur.aufgaben.map((a) => String(a.task || '').length));
  expect(text.every((length) => length > 20)).toBe(true);
});

test('Die Suche findet Aufgaben auch im Text, sobald alle Daten da sind', async ({ page }) => {
  await open(page);
  const hits = await page.evaluate(async () => {
    await rpHydrateAll();
    SEARCH_INDEX.length = 0; indexFertig = false; buildIndex();
    const sample = EXERCISES.find((e) => e.task);
    const word = sample.task.replace(/<[^>]+>/g, ' ').split(/\s+/).find((w) => w.length > 9);
    return { word, found: SEARCH_INDEX.some((i) => i.kind === 'exercise' && i.hay.includes(word.toLowerCase())), undef: SEARCH_INDEX.some((i) => i.kind === 'exercise' && /\bundefined\b/.test(i.hay) && !EXERCISES.some((e) => /\bundefined\b/i.test(e.task + e.title))) };
  });
  expect(hits.found).toBe(true);
  expect(hits.undef).toBe(false);
});

test('Fehlende Aufgabendaten zeigen eine Fehlermeldung mit Wiederholung', async ({ page }) => {
  await page.route('**/exercise-data.json*', (route) => route.abort());
  await open(page);
  await page.evaluate(() => { rpChoosePath('all'); selectLesson('exercises'); });
  await expect(page.getByRole('alert')).toContainText('Aufgaben konnten nicht geladen werden');
  await page.unroute('**/exercise-data.json*');
  await page.getByRole('button', { name: 'Erneut versuchen' }).click();
  await expect(page.locator('.ex-card').first()).toBeVisible();
});
