import {test,expect} from '@playwright/test';

// Ohne bootstrap.js bleibt der Zustand „vor dem App-Start“ stehen: so sieht man, was ein Besucher vor dem ersten Skript bekommt.
async function beforeStart(page){await page.route('**/assets/bootstrap.js*',route=>route.abort());}
const visible=(page)=>page.locator('#content').evaluate(el=>getComputedStyle(el).visibility);

test('Neue Besucher sehen die Startseite schon vor dem App-Start, aber nicht bedienbar',async({page})=>{
  await beforeStart(page);
  await page.goto('/');
  await expect(page.getByRole('heading',{level:2,name:'Was möchtest du lernen?'})).toBeAttached();
  expect(await visible(page)).toBe('visible');
  await expect(page.locator('#content')).toHaveAttribute('aria-busy','true');
  await expect(page.locator('#content')).toHaveAttribute('inert','');
});

test('Das vorgerenderte Fragment entspricht genau dem Rendering der App; danach entfallen die Vorschau-Marken',async({page})=>{
  const served=await (await page.request.get('/')).text();
  const fragment=/<main class="content" id="content"[^>]*data-rp-vorschau>([\s\S]*?)<\/main>/.exec(served);
  expect(fragment,'Fragment im ausgelieferten HTML').not.toBeNull();
  await page.goto('/');
  await page.waitForFunction(()=>window.RP_APP_READY);
  const live=await page.evaluate(()=>document.getElementById('content').innerHTML);
  // Das Fragment ist der Anfang der gerenderten Seite; darunter folgt Datums- und Tageszeitabhängiges (Gruß, Tagesziel), das nicht vorgerendert wird.
  const expected=fragment[1].replace(/\n$/,'');
  expect(expected).toContain('rp-path-picker');
  expect(live.startsWith(expected)).toBe(true);
  expect(expected).not.toContain('heute-gruss');
  for(const attr of ['aria-busy','inert','data-rp-vorschau'])await expect(page.locator('#content')).not.toHaveAttribute(attr,/.*/);
  await page.getByRole('button',{name:'Java',exact:false}).first().click();
  await expect(page.locator('.rp-path-card[aria-pressed="true"]')).toContainText('Java');
});

test('Besucher mit gewähltem Lernpfad, Lernstand oder Adress-Einstieg bekommen keine falsche Vorschau',async({page,context})=>{
  await beforeStart(page);
  const cases={
    Lernpfad:()=>localStorage.setItem('rootpfad-learning-path','java'),
    Lernstand:()=>localStorage.setItem('ap1-expertenpfad-progress-v1',JSON.stringify({completed:['m1-l1'],xp:30})),
    Konto:()=>localStorage.setItem('rootpfad-user-7-progress',JSON.stringify({completed:[],xp:10})),
    Defekt:()=>localStorage.setItem('ap1-expertenpfad-progress-v1','{kaputt'),
  };
  for(const [name,seed] of Object.entries(cases)){
    await page.goto('/');await page.evaluate(seed);await page.reload();
    expect(await visible(page),name).toBe('hidden');
  }
  await page.evaluate(()=>localStorage.clear());
  await page.goto('/#/recht');
  expect(await visible(page),'Adress-Einstieg').toBe('hidden');
  await page.goto('/');await page.evaluate(()=>localStorage.clear());await page.reload();
  expect(await visible(page),'frisch').toBe('visible');
  // Leerer Lernstand (App hat ihn beim ersten Besuch angelegt) zählt nicht als Lernstand.
  await page.evaluate(()=>localStorage.setItem('ap1-expertenpfad-progress-v1',JSON.stringify({completed:[],xp:0})));
  await page.reload();
  expect(await visible(page),'leerer Stand').toBe('visible');
});

for(const [name,size] of [['mobil',{width:390,height:844}],['Desktop',{width:1280,height:800}]]){
  test('Beim Wechsel von der Vorschau zur App verschiebt sich nichts ('+name+')',async({page})=>{
    await page.setViewportSize(size);
    await page.addInitScript(()=>{window.__shifts=[];new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__shifts.push({value:e.value,sources:e.sources.map(s=>s.node&&(s.node.id||s.node.className||s.node.nodeName))});}).observe({type:'layout-shift',buffered:true});});
    await page.goto('/');
    await page.waitForFunction(()=>window.RP_APP_READY);
    await page.waitForTimeout(800);
    const shifts=await page.evaluate(()=>window.__shifts);
    expect(shifts).toEqual([]);
  });
}
