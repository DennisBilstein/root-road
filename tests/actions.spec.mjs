import { test, expect } from '@playwright/test';

// Die Oberfläche nutzt data-on…-Attribute und eine Delegation (assets/actions.js); echte Inline-Handler blockiert die CSP.
async function open(page) {
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await page.waitForFunction(() => window.RP_APP_READY);
  return errors;
}

test('Freigegebene Aktionen laufen mit festen Argumenten, this.checked und Tastenfilter', async ({ page }) => {
  await open(page);
  await page.evaluate(() => {
    document.body.insertAdjacentHTML('beforeend',
      `<div id="t"><input id="c" type="checkbox" data-onchange="rpRubricSet('a:1', this.checked)">
       <input id="k" data-onkeydown="if(event.key==='Enter'){rpRubricSet('k:1', true)}">
       <a id="l" href="#x" data-onclick="rpRubricSet('l:1', true);return false">x</a></div>`);
  });
  await page.locator('#c').check();
  await page.locator('#k').press('a');
  expect(await page.evaluate(() => [rpRubricSession['a:1'], rpRubricSession['k:1']])).toEqual([true, undefined]);
  await page.locator('#k').press('Enter');
  await page.locator('#l').click();
  expect(await page.evaluate(() => [rpRubricSession['k:1'], rpRubricSession['l:1'], location.hash])).toEqual([true, true, '']);
});

test('Nicht freigegebene oder unzulässig geschriebene Aktionen werden abgelehnt und gemeldet', async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => {
    window.rpNichtFreigegeben = () => { window.__aufgerufen = (window.__aufgerufen || 0) + 1; };
    document.body.insertAdjacentHTML('beforeend',
      `<button id="a" data-onclick="rpNichtFreigegeben()">a</button>
       <button id="b" data-onclick="rpRubricSet('x' + 'y', true)">b</button>
       <button id="c" data-onclick="alert(1)">c</button>
       <button id="d" data-onclick="rpRubricSet(document.cookie, true)">d</button>`);
  });
  for (const id of ['a', 'b', 'c', 'd']) await page.locator(`#${id}`).click();
  expect(await page.evaluate(() => window.__aufgerufen || 0)).toBe(0);
  expect(await page.evaluate(() => Object.keys(rpRubricSession))).toEqual([]);
  expect(errors.filter((text) => text.includes('Ereignis-Attribut abgelehnt'))).toHaveLength(4);
});

test('Echte Inline-Handler führt die CSP nicht aus', async ({ page }) => {
  await open(page);
  const result = await page.evaluate(() => new Promise((resolve) => {
    let violation = '';
    document.addEventListener('securitypolicyviolation', (event) => { violation = event.violatedDirective; });
    document.body.insertAdjacentHTML('beforeend', '<button id="x" onclick="window.__inline = true">x</button>');
    document.getElementById('x').click();
    setTimeout(() => resolve({ ran: window.__inline === true, violation }), 100);
  }));
  expect(result).toEqual({ ran: false, violation: 'script-src-attr' });
});

test('Ansichten tragen keine Inline-Handler, und die CSP wird nirgends verletzt', async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => rpHydrateAll());
  const ids = ['m1-l1', 'm52-l3', 'html-m1-l1', 'ap1-m1-l1'];
  const found = [];
  for (const id of ids) {
    const exists = await page.evaluate((lessonId) => !!lessonById(lessonId), id);
    if (!exists) continue;
    await page.evaluate(async (lessonId) => { state.currentId = lessonId; renderContent(); await new Promise((resolve) => setTimeout(resolve, 300)); }, id);
    found.push(await page.evaluate(() => document.querySelectorAll('[onclick],[onchange],[oninput],[onkeydown],[onfocus],[onsubmit]').length));
  }
  for (const view of ['review', 'exam', 'tutor', 'sources', 'glossary', 'labor']) {
    await page.evaluate(async (target) => { state.currentId = target; try { renderContent(); } catch (error) { /* Ansicht gibt es nicht */ } await new Promise((resolve) => setTimeout(resolve, 200)); }, view);
    found.push(await page.evaluate(() => document.querySelectorAll('[onclick],[onchange],[oninput],[onkeydown],[onfocus],[onsubmit]').length));
  }
  expect(found.length).toBeGreaterThan(3);
  expect(found.every((count) => count === 0)).toBe(true);
  expect(errors.filter((text) => /Content Security Policy|Refused to/.test(text))).toEqual([]);
});
