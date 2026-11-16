import {test,expect} from '@playwright/test';
test('Jede Lektionsfrage und Zusatzkarte besitzt explizite Abruf-/Bewertungskriterien',async({page})=>{
  await page.goto('/');await page.waitForFunction(()=>window.RP_APP_READY);await page.evaluate(()=>rpHydrateAll());await page.evaluate(()=>rpLoadQuizContracts());
  const result=await page.evaluate(()=>({
    cards:CARDS.length,
    contracts:RP_QUIZ_CONTRACTS.length,
    covered:CARDS.every(c=>RP_QUIZ_CONTRACT_BY_ID[c.id]?.criteria.length===4),
    extras:CARDS.filter(c=>c.id.startsWith('x#')).every(c=>RP_QUIZ_CONTRACT_BY_ID[c.id]),
  }));expect(result).toEqual({cards:1904,contracts:1904,covered:true,extras:true});
});
test('Selbstrubrik ist sichtbar, nicht als automatische Fachprüfung bewertet',async({page})=>{
  await page.goto('/');await page.waitForFunction(()=>window.RP_APP_READY);await page.evaluate(()=>rpHydrateAll());await page.evaluate(()=>rpLoadQuizContracts());
  await page.evaluate(()=>{rpChoosePath('ap1');state.currentId='m1-l1';renderContent();rpQuizReveal('m1-l1',0);});
  const correct=await page.evaluate(()=>lessonById('m1-l1').quiz[0].correct);
  await page.locator(`input[name="rq_m1-l1_0"][value="${correct}"]`).check();
  await page.evaluate(()=>checkQuiz('m1-l1'));
  await expect(page.locator('[data-rubric]')).toHaveCount(1);
  await expect(page.locator('[data-rubric]')).toContainText('einzeln als Szenario redigiert');
  await expect(page.locator('[data-rubric] input[type="checkbox"]')).toHaveCount(4);
});
test('Kriterien werden erst beim Öffnen eines Quiz geladen und ergänzen das sichtbare Feld',async({page})=>{
  const requested=[];page.on('request',r=>{if(r.url().includes('quiz-contracts-data.js'))requested.push(r.url());});
  await page.goto('/');await page.waitForFunction(()=>window.RP_APP_READY);
  await page.waitForTimeout(2500);
  expect(requested).toHaveLength(0);
  expect(await page.evaluate(()=>!!window.RP_QUIZ_CONTRACTS_READY)).toBe(false);
  await page.evaluate(()=>{rpChoosePath('ap1');state.currentId='m1-l1';renderContent();});
  await page.waitForFunction(()=>window.RP_QUIZ_CONTRACTS_READY);
  expect(requested).toHaveLength(1);
  await page.evaluate(()=>rpQuizReveal('m1-l1',0));
  await expect(page.locator('#q_m1-l1_0 textarea')).toHaveAttribute('placeholder',/.{10,}/);
});
