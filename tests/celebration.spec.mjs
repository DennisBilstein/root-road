import {test,expect} from '@playwright/test';

async function openTask(page,track,index=0){
  await page.goto('/');await page.waitForFunction(()=>window.RP_APP_READY);
  await page.evaluate(async id=>{rpChoosePath('all');rpPracticeStart(id);await rpPracticeSetMode('werkstatt',true);},track);
  await page.waitForFunction(()=>rpPractice.mode==='werkstatt'&&!rpPractice.loading&&!!rpPracticeTask());
  if(index)await page.evaluate(i=>{rpPractice.index=i;rpPractice.feedback='';renderContent();},index);
}
async function solve(page){
  const solution=await page.evaluate(()=>rpPracticeTask().solution);
  await page.locator('#rpCodeEditor').fill(solution);
  await page.evaluate(()=>document.querySelectorAll('.levelup').forEach(el=>el.remove()));
  await page.getByRole('button',{name:/^Code (ausführen & prüfen|prüfen)$/}).click();
}

test('Gelöste Werkstattaufgabe zeigt Erfolgsfeld, Ausbruch und XP; Änderung am Code nimmt es wieder weg',async({page})=>{
  await openTask(page,'php');
  await expect(page.locator('#gpWin')).toHaveCount(0);
  await solve(page);
  const win=page.locator('#gpWin');
  await expect(win).toBeVisible();
  await expect(win).toContainText('Aufgabe gelöst');
  await expect(win).toContainText(/\d+ von \d+ Anforderungen erfüllt/);
  await expect(win.locator('.gp-win-xp')).toContainText('+50 XP');
  await expect(page.locator('.rp-fx .rp-p').first()).toBeAttached();
  expect(await page.locator('.rp-fx .rp-p').count()).toBeGreaterThan(20);
  await expect(page.locator('.gp-workbench')).toHaveClass(/gp-solved/);
  await expect(page.locator('.gp-feedback')).toContainText('Alle Anforderungen sind erfüllt');
  // Nach dem Ausbruch bleiben keine Partikel zurück.
  await expect(page.locator('.rp-fx .rp-p')).toHaveCount(0,{timeout:5000});
  // Eine Änderung am Code entfernt das Erfolgsfeld (es gilt nur für genau diesen Stand).
  await page.locator('#rpCodeEditor').press('End');
  await page.locator('#rpCodeEditor').pressSequentially('\n// geändert');
  await expect(page.locator('#gpWin')).toHaveCount(0);
  await expect(page.locator('.gp-workbench')).not.toHaveClass(/gp-solved/);
  // Ein weiterer Klick auf „Nächste Aufgabe“ aus dem Erfolgsfeld führt zur nächsten Aufgabe.
  await page.evaluate(()=>{rpPractice.index=0;rpPractice.feedback='';renderContent();});
  await solve(page);
  await page.locator('#gpWin').getByRole('button',{name:'Nächste Aufgabe'}).click();
  await expect(page.locator('.badge.topic').first()).toContainText('Schritt 2 /');
  await expect(page.locator('#gpWin')).toHaveCount(0);
});

test('Wer die Lösung ansieht, bekommt kein Erfolgsfeld und keinen Ausbruch',async({page})=>{
  await openTask(page,'php');
  await page.getByRole('button',{name:'Lösung ansehen'}).click();
  await solve(page);
  await expect(page.locator('.gp-feedback')).toContainText('Alle Anforderungen sind erfüllt');
  await expect(page.locator('#gpWin')).toHaveCount(0);
  await expect(page.locator('.rp-fx .rp-p')).toHaveCount(0);
});

test('Falsche Lösung zeigt kein Erfolgsfeld',async({page})=>{
  await openTask(page,'php');
  await page.locator('#rpCodeEditor').fill('<?php\necho 1;');
  await page.getByRole('button',{name:'Code prüfen'}).click();
  await expect(page.locator('mark.gp-err, .gp-req-bad').first()).toBeVisible();
  await expect(page.locator('#gpWin')).toHaveCount(0);
  await expect(page.locator('.rp-fx .rp-p')).toHaveCount(0);
});

test('Bei „Bewegung reduzieren“ bleibt das Erfolgsfeld sichtbar, aber ohne Partikel und Animation',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await openTask(page,'php');
  await solve(page);
  const win=page.locator('#gpWin');
  await expect(win).toContainText('Aufgabe gelöst');
  await expect(page.locator('.rp-fx .rp-p')).toHaveCount(0);
  const animation=await win.evaluate(el=>getComputedStyle(el).animationName);
  expect(animation).toBe('none');
  // Der Haken ist ohne Animation vollständig gezeichnet.
  const offset=await page.locator('#gpWin .gp-win-ring path').evaluate(el=>getComputedStyle(el).strokeDashoffset);
  expect(parseFloat(offset)).toBe(0);
});

for(const width of [320,390]){
  test('Erfolgsfeld läuft bei '+width+' px ohne seitliches Scrollen und mit lesbarer Schrift',async({page})=>{
    await page.setViewportSize({width,height:800});
    await openTask(page,'css');
    await solve(page);
    await expect(page.locator('#gpWin')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const box=await page.locator('#gpWin').boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x+box.width).toBeLessThanOrEqual(width);
    const small=await page.evaluate(()=>Array.from(document.querySelectorAll('#gpWin *')).filter(el=>Array.from(el.childNodes).some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(el).fontSize)<11.95).map(el=>el.className||el.tagName));
    expect(small).toEqual([]);
  });
}

test('Richtige Quizantwort und abgeschlossene Lektion lösen sichtbare Rückmeldung aus',async({page})=>{
  await page.goto('/');await page.waitForFunction(()=>window.RP_APP_READY);
  await page.evaluate(()=>{rpChoosePath('all');selectLesson('m1-l1');});
  await page.waitForFunction(()=>{const l=lessonById('m1-l1');return l&&l.quiz&&l.quiz.length&&document.querySelector('input[name^="rq_m1-l1_"]');});
  await page.evaluate(()=>{
    const lesson=lessonById('m1-l1');
    lesson.quiz.forEach((q,qi)=>{const radio=document.querySelector('input[name="rq_m1-l1_'+qi+'"][value="'+q.correct+'"]');radio.checked=true;});
    checkQuiz('m1-l1');
  });
  await expect(page.locator('.qfeedback.show.correct').first()).toBeVisible();
  await expect(page.locator('.opt.is-correct.rp-hit').first()).toBeAttached();
  await expect(page.locator('.rp-fx .rp-p').first()).toBeAttached();
  await page.evaluate(()=>document.querySelectorAll('.levelup').forEach(el=>el.remove()));
  await page.locator('.complete-toggle input').check();
  await expect(page.locator('.complete-toggle.on')).toBeVisible();
  await expect(page.locator('.toast.celebrate').first()).toBeAttached();
  await expect(page.locator('.rp-fx .rp-p').first()).toBeAttached();
});
