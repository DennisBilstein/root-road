import {test,expect} from '@playwright/test';

async function openWorkshop(page,track){
  await page.goto('/');await page.waitForFunction(()=>window.RP_APP_READY);
  await page.evaluate(id=>{rpChoosePath('all');rpPracticeStart(id);},track);
  await page.getByRole('button',{name:/^Werkstatt/}).click();
  await page.waitForFunction(()=>!!window.RP_WORKSHOP&&rpPractice.mode==='werkstatt');
}
async function selectTask(page,index){
  await page.evaluate(i=>{rpPractice.index=i;rpPractice.feedback='';renderContent();},index);
}
const editor=page=>page.locator('#rpCodeEditor');
async function check(page){
  // Ein Aufstieg (XP) öffnet einen modalen Dialog über der Seite; er gehört nicht zum Test.
  await page.evaluate(()=>document.querySelectorAll('.levelup').forEach(el=>el.remove()));
  await page.getByRole('button',{name:/^Code (ausführen & prüfen|prüfen)$/}).click();
}

// Codemodule, die mindestens eine Werkstattaufgabe haben müssen (Module ohne Code, z. B. Netzwerk, UML, Kalkulation, Hardware, KI-Recht, sind ausgenommen).
const CODE_MODULES=[
  'm1','m3','m4','m5','m6','m7','m34',
  ...Array.from({length:24},(_,i)=>'m'+(42+i)),
  'abap-m1','abap-m3',...Array.from({length:15},(_,i)=>'abap-m'+(6+i)),
  'java-m1','java-m3','java-m6',...Array.from({length:20},(_,i)=>'java-m'+(7+i)),
  'js-m1','js-m2','js-m3','js-m4','pp-m1','css-m1','css-m2','html-m1','html-m2','ts-m1','ts-m2','mariadb-m1','mariadb-m2',
  'api-m1','api-m2','mcp-m1','agents-m1','node-m1','node-m2','lx-m1','lx-m2','py-m1','dk-m1','ci-m1','ws-m1','ws-m2'
];
async function loadAllTracks(page){
  await page.goto('/');await page.waitForFunction(()=>window.RP_APP_READY);
  await page.evaluate(async()=>{rpChoosePath('all');rpPracticeStart('javascript');await rpPracticeSetMode('werkstatt');
    await Promise.all(rpPracticeTracks().map(t=>rpPracticeLoadWorkshop(t.id)));});
}

test('Werkstattdaten werden je Spur erst beim Umschalten geladen',async({page})=>{
  const requests=[];page.on('request',r=>{const m=/assets\/workshop\/([\w-]+)\.js/.exec(r.url());if(m)requests.push(m[1]);});
  await page.goto('/');await page.waitForFunction(()=>window.RP_APP_READY);
  await page.evaluate(()=>{rpChoosePath('all');rpPracticeStart('php');});
  expect(requests).toHaveLength(0);
  await page.getByRole('button',{name:/^Werkstatt/}).click();
  await expect(page.getByRole('heading',{level:2,name:'Typisierte Funktionen schreiben'})).toBeVisible();
  expect(requests.sort()).toEqual(['core','php']);
});

test('Spuren ohne geführte Aufgaben öffnen direkt die Werkstatt',async({page})=>{
  await page.goto('/');await page.waitForFunction(()=>window.RP_APP_READY);
  await page.evaluate(()=>{rpChoosePath('all');rpPracticeStart('docker');});
  await expect(page.getByRole('heading',{level:2,name:'Gehärtetes Multi-Stage-Dockerfile'})).toBeVisible();
  await expect(page.getByRole('heading',{level:1,name:'Geführte Codewerkstatt'})).toBeVisible();
  await expect(page.locator('.gp-module')).toContainText('Docker');
});

test('Jede Musterlösung der Werkstatt besteht und zeigt keine rote Markierung',async({page})=>{
  test.setTimeout(420000);
  await loadAllTracks(page);
  const tracks=await page.evaluate(()=>Object.entries(window.RP_WORKSHOP).map(([id,tasks])=>[id,tasks.map(t=>t.type)]));
  expect(tracks).toHaveLength(21);
  let total=0;
  for(const [id,types] of tracks){
    expect(types.length,id).toBeGreaterThanOrEqual(1);
    await page.evaluate(async id=>{rpPractice.track=id;rpPractice.index=0;rpPractice.feedback='';rpPractice.mode='werkstatt';renderContent();},id);
    for(let i=0;i<types.length;i++){
      total++;
      await selectTask(page,i);
      const solution=await page.evaluate(()=>rpPracticeTask().solution);
      await editor(page).fill(solution);
      await check(page);
      const expected=types[i]==='run'?'Die sichtbaren Tests':'Alle Anforderungen sind erfüllt';
      await expect(page.locator('.gp-feedback'),id+'#'+i).toContainText(expected,{timeout:8000});
      await expect(page.locator('mark.gp-err'),id+'#'+i).toHaveCount(0);
      await expect(page.locator('.gp-req-bad'),id+'#'+i).toHaveCount(0);
      await expect(page.locator('#gpWin'),id+'#'+i).toContainText('Aufgabe gelöst');
    }
  }
  expect(total).toBeGreaterThanOrEqual(107);
});

test('Falscher Starttext besteht nie, Pflichtfelder und Lektionsbezug stimmen, jedes Codemodul hat eine Aufgabe',async({page})=>{
  await loadAllTracks(page);
  const result=await page.evaluate(()=>{
    const bad=[],modules=new Set(),ids=new Set();
    for(const [id,tasks] of Object.entries(window.RP_WORKSHOP))for(const t of tasks){
      if(ids.has(t.id))bad.push('doppelte ID '+t.id);ids.add(t.id);
      if(t.type==='write'&&rpEvaluate(t,t.starter).ok)bad.push('Starter besteht: '+t.id);
      for(const f of ['title','text','hint','why','solution','details','modules','lesson','language'])if(!t[f]||(Array.isArray(t[f])&&!t[f].length))bad.push('Feld '+f+' fehlt: '+t.id);
      if(!(t.rules||[]).some(r=>r.kind==='forbidden'))bad.push('keine Verbotsregel: '+t.id);
      if(t.lesson&&!lessonById(t.lesson))bad.push('Lektion '+t.lesson+' für '+t.id);
      (t.modules||[]).forEach(m=>{modules.add(m);if(!rpCatalog.modules.some(x=>x.id===m))bad.push('Modul '+m+' unbekannt: '+t.id);});
    }
    return {bad,modules:[...modules]};
  });
  expect(result.bad).toEqual([]);
  expect(CODE_MODULES.filter(m=>!result.modules.includes(m))).toEqual([]);
});

test('Syntaxfehler in JavaScript wird in der richtigen Zeile rot markiert',async({page})=>{
  await openWorkshop(page,'javascript');
  await editor(page).fill('function summarize(entries) {\n  const = 5;\n  return [];\n}');
  await check(page);
  await expect(page.locator('.gp-feedback')).toContainText('Syntaxfehler in Zeile 2');
  await expect(page.locator('#gpDiag')).toContainText('Zeile 2');
  const marked=await page.locator('.gp-ln-err').allTextContents();
  expect(marked.join('|')).toContain('const = 5;');
});

test('Laufzeitfehler zeigt die Zeile im Lernercode, nicht im Wrapper',async({page})=>{
  await openWorkshop(page,'javascript');
  await editor(page).fill('function summarize(entries) {\n  const a = 1;\n  return nichtDa(entries, a);\n}');
  await check(page);
  await expect(page.locator('.gp-feedback')).toContainText('nichtDa is not defined');
  await expect(page.locator('.gp-feedback')).toContainText('Zeile 3');
  expect(await page.locator('.gp-ln-err').allTextContents()).toEqual([expect.stringContaining('nichtDa')]);
});

test('Typische Fehler werden an der Fundstelle markiert und verschwinden beim Korrigieren',async({page})=>{
  await openWorkshop(page,'php');
  await selectTask(page,1);
  const bad='<?php\ndeclare(strict_types=1);\n\nfunction findTasksByOwner(PDO $pdo, int $ownerId): array\n{\n    $rows = $pdo->query("SELECT * FROM learning_tasks WHERE owner_id = $ownerId");\n    return $rows->fetchAll(PDO::FETCH_ASSOC);\n}';
  await editor(page).fill(bad);
  await check(page);
  await expect(page.locator('mark.gp-err').first()).toBeVisible();
  await expect(page.locator('#gpDiag')).toContainText('Zeile 6');
  await expect(page.locator('#gpDiag')).toContainText('SQL-Injection');
  await expect(page.locator('.gp-req-bad').first()).toBeVisible();
  // Live-Markierung: nach der Korrektur verschwindet die Markierung ohne neue Prüfung
  const solution=await page.evaluate(()=>rpPracticeTask().solution);
  await editor(page).fill(solution);
  await expect(page.locator('mark.gp-err')).toHaveCount(0);
  await expect(page.locator('.gp-req-bad')).toHaveCount(0);
});

test('Strukturfehler (Klammern, Anführungszeichen, Tags) werden markiert',async({page})=>{
  await openWorkshop(page,'html');
  await editor(page).fill('<form method="post" action="/anmelden">\n  <label for="email">E-Mail\n  <input type="email" id="email>\n</form>');
  await check(page);
  expect(await page.locator('mark.gp-err').count()).toBeGreaterThan(0);
  await openWorkshop(page,'java');
  await editor(page).fill('public record LearningTask(String title, int minutes) {\n  public LearningTask {\n    if (title.isBlank() { }\n  }\n}');
  await check(page);
  expect(await page.locator('mark.gp-err').count()).toBeGreaterThan(0);
  await expect(page.locator('#gpDiag')).toContainText('Zeile');
});

test('Rote Markierung liegt exakt auf der Textzeile des Editors',async({page})=>{
  await openWorkshop(page,'git');
  await editor(page).fill('git switch -c feature/lernplan\ngit status\ngit add .\ngit commit -m "x"');
  await check(page);
  const geometry=await page.evaluate(()=>{
    const area=document.getElementById('rpCodeEditor'),mark=document.querySelector('mark.gp-err');
    const style=getComputedStyle(area),lineHeight=parseFloat(style.lineHeight),a=area.getBoundingClientRect(),m=mark.getBoundingClientRect();
    const expectedTop=a.top+parseFloat(style.borderTopWidth)+parseFloat(style.paddingTop)+2*lineHeight-area.scrollTop;
    const expectedLeft=a.left+parseFloat(style.borderLeftWidth)+parseFloat(style.paddingLeft);
    return {dy:Math.abs(m.top-expectedTop),dx:Math.abs(m.left-expectedLeft-0),lineHeight,text:mark.textContent};
  });
  expect(geometry.text).toContain('git add .');
  expect(geometry.dy).toBeLessThan(geometry.lineHeight/2);
});

for(const width of [320,390]){
  test('Werkstatt läuft bei '+width+' px ohne seitliches Scrollen und mit lesbarer Schrift',async({page})=>{
    await page.setViewportSize({width,height:800});
    await openWorkshop(page,'css');
    await editor(page).fill('.card { width: 300px; outline: none; }\n.x { color: red !important; }');
    await check(page);
    await expect(page.locator('mark.gp-err').first()).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const small=await page.evaluate(()=>Array.from(document.querySelectorAll('.gp-workbench *,.gp-modes *')).filter(el=>el.childNodes.length&&Array.from(el.childNodes).some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(el).fontSize)<11.95).map(el=>el.className||el.tagName));
    expect(small).toEqual([]);
  });
}
