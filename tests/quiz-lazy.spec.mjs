import { test, expect } from '@playwright/test';

// Fragen, Optionen und Erklärungen kommen erst mit assets/quiz-data.json; der Start kennt nur Platzhalter und Karten-IDs.
async function open(page) {
  const requested = [];
  page.on('request', (request) => { if (request.url().includes('quiz-data.json')) requested.push(request.url()); });
  await page.goto('/');
  await page.waitForFunction(() => window.RP_APP_READY);
  return requested;
}

test('Start lädt keine Quizfragen, kennt aber Karten, Zähler und IDs', async ({ page }) => {
  const requested = await open(page);
  await page.waitForTimeout(1500);
  expect(requested).toHaveLength(0);
  const start = await page.evaluate(() => ({
    ready: !!window.RP_QUIZ_READY,
    cards: CARDS.length,
    withText: CARDS.filter((card) => card.q !== undefined).length,
    quizLength: lessonById('m1-l2').quiz.length,
    id: rpQuestionId(lessonById('m1-l2'), 0),
    lazy: !!lessonById('m1-l2').lazyQuiz,
  }));
  expect(start).toEqual({ ready: false, cards: 1904, withText: 0, quizLength: 3, id: 'm1-l2#0@2026-11-scenario-v1-polish1', lazy: true });
});

test('Eine Lektion lädt die Fragen einmal nach und zeigt das Quiz', async ({ page }) => {
  const requested = await open(page);
  await page.evaluate(() => { rpChoosePath('ap1'); state.currentId = 'm1-l2'; renderContent(); });
  await expect(page.locator('#q_m1-l2_0 legend')).toBeVisible();
  await expect(page.locator('#q_m1-l2_0 legend')).not.toBeEmpty();
  expect(requested).toHaveLength(1);
  expect(await page.evaluate(() => ({ ready: window.RP_QUIZ_READY, lazy: !!lessonById('m1-l2').lazyQuiz, card: CARD_BY_ID[rpQuestionId(lessonById('m1-l2'), 0)].q === lessonById('m1-l2').quiz[0].q }))).toEqual({ ready: true, lazy: false, card: true });
});

test('Wiederholung, Prüfung und Fehlerheft laden die Fragen bei Bedarf und zeigen Fragetexte', async ({ page }) => {
  await open(page);
  await page.evaluate(() => { rpChoosePath('ap1'); startReview('new'); });
  await expect(page.locator('.srs-q')).toBeVisible();
  await expect(page.locator('.srs-q')).not.toBeEmpty();
  await page.reload();
  await page.waitForFunction(() => window.RP_APP_READY);
  await page.evaluate(() => { state.stats['m1-l2#0@2026-11-scenario-v1-polish1'] = { right: 0, wrong: 2 }; state.currentId = 'fehler'; renderContent(); });
  await expect(page.locator('.fh-frage').first()).toBeVisible();
  await expect(page.locator('.fh-frage').first()).not.toBeEmpty();
});

test('Tagesmission lädt die Fragen vor dem Start', async ({ page }) => {
  await open(page);
  await page.evaluate(() => { rpChoosePath('abap'); rpStartMission(); });
  await expect(page.locator('.srs-card h2')).toBeVisible();
  await expect(page.locator('.srs-card h2')).not.toBeEmpty();
});

test('Fehlschlag beim Laden zeigt eine Meldung mit „Erneut versuchen“, danach klappt es', async ({ page }) => {
  await open(page);
  let blocked = true;
  await page.route('**/quiz-data.json*', (route) => (blocked ? route.abort() : route.continue()));
  await page.evaluate(() => { rpChoosePath('ap1'); state.currentId = 'm1-l2'; renderContent(); });
  await expect(page.getByRole('alert')).toContainText('nicht geladen werden');
  blocked = false;
  await page.getByRole('button', { name: 'Erneut versuchen' }).click();
  await expect(page.locator('#q_m1-l2_0 legend')).toBeVisible();
});
