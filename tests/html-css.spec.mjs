import {test,expect} from '@playwright/test';
import fs from 'node:fs';
test('HTML/CSS-Pfad enthält 21 Lektionen und 63 Selbsttestfragen',async({page})=>{
  await page.goto('/');await page.waitForFunction(()=>window.RP_APP_READY);await page.evaluate(()=>rpHydrateAll());
  const result=await page.evaluate(()=>{
    rpChoosePath('htmlcss');const lessons=rpData().lessons;const failures=[];
    for(const l of lessons){state.currentId=l.id;renderContent();if(!document.querySelector('main')?.textContent.includes('Drei Übungen')||document.querySelectorAll('fieldset.qcard').length!==l.quiz.length)failures.push(l.id);}
    return {lessons:lessons.length,cards:rpData().cards.length,failures};
  });expect(result).toEqual({lessons:21,cards:65,failures:[]});
});
test('Eigenes HTML/CSS-Projekt bleibt bei kleiner Breite und Tastatur bedienbar',async({page})=>{
  const html=fs.readFileSync('content/examples/html-css-lab/index.html','utf8').replace('<link rel="stylesheet" href="styles.css">','<style>'+fs.readFileSync('content/examples/html-css-lab/styles.css','utf8')+'</style>');
  await page.setViewportSize({width:320,height:800});await page.setContent(html);
  await expect(page.getByRole('heading',{level:1})).toHaveCount(1);
  await expect(page.getByLabel('Testname')).toBeVisible();
  await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Zum Inhalt'})).toBeFocused();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.getByRole('button',{name:'Demo – kein Versand'})).toHaveAttribute('type','button');
});
