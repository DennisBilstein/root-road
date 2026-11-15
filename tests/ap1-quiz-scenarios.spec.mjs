import {test,expect} from '@playwright/test';
import {revisions} from '../content/quiz-ap1-round2.mjs';
import {readSourceVariable} from './support/source-variable.mjs';

test('AP1-Szenarien ersetzen gültige Positionen mit vollständigen Begründungen',async({page})=>{
  await page.goto('/');await page.waitForFunction(()=>window.RP_APP_READY);await page.evaluate(()=>rpLoadQuizzes());
  const errors=await page.evaluate(rows=>rows.flatMap(row=>{
    const lesson=lessonById(row.lesson),q=lesson?.quiz[row.index];
    return !q||!q.revision||q.rationales.length!==q.options.length||!CARD_BY_ID[rpQuestionId(lesson,row.index)]?[row.lesson+'#'+row.index]:[];
  }),revisions);
  expect(errors).toEqual([]);
});

test('Redaktion enthält keine mehrfach belegte Lektionsposition',async({page})=>{
  const keys=readSourceVariable('RP_QUIZ_REVISIONS').map(q=>q.lesson+'#'+q.index);
  expect(new Set(keys).size).toBe(keys.length);
});
