import {test,expect} from '@playwright/test';
import {readSourceVariable} from './support/source-variable.mjs';
test('Alte Evidenz gilt nicht für fachlich ersetzte Fragen',async({page})=>{
  const revisions=readSourceVariable('RP_QUIZ_REVISIONS');
  await page.goto('/');await page.waitForFunction(()=>window.RP_APP_READY);await page.evaluate(()=>rpLoadQuizzes());
  const result=await page.evaluate(()=>{
    const lesson=lessonById('m1-l2');
    state.stats['m1-l2#0']={right:99,wrong:0};state.srs['m1-l2#0']={iv:90,due:Date.now()+86400000};
    const current=rpQuestionId(lesson,0);
    return {current,newUnlearned:!state.srs[current]&&!state.stats[current],oldPreserved:state.stats['m1-l2#0'].right===99,};
  });expect(revisions).toHaveLength(1277);expect(revisions.every(q=>q.rationales.length===q.options.length)).toBe(true);expect(result.current).toBe('m1-l2#0@2026-11-scenario-v1-polish1');expect(result.newUnlearned).toBe(true);expect(result.oldPreserved).toBe(true);
});
