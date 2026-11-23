import {test,expect} from '@playwright/test';
import fs from 'node:fs';
test('Browser lädt geordnete kleine Skripte statt das Quellaggregat',async({page})=>{
 const requests=[];page.on('request',r=>requests.push(r.url()));await page.goto('/');await page.waitForFunction(()=>window.RP_APP_READY);
 expect(requests.some(url=>url.endsWith('/assets/script-01.js'))).toBe(false);
 const manifest=JSON.parse(fs.readFileSync('assets/learning-manifest.json','utf8'));
 expect(manifest.files.length).toBeGreaterThan(3);
 for(const file of manifest.files)expect(fs.statSync(file).size).toBeLessThan(300000);
 expect(manifest.data.length).toBeGreaterThan(0);
 for(const file of manifest.data)expect(JSON.parse(fs.readFileSync(file,'utf8'))).toBeTruthy();
 expect(await page.evaluate(()=>FLAT.length)).toBe(577);
 /* Lektionstexte liegen je Modul in eigenen Dateien und sind beim Start nicht geladen (Lighthouse). */
 expect(requests.some(url=>url.includes('/assets/lesson-bodies/'))).toBe(false);
 const start=await page.evaluate(()=>({lazy:FLAT.filter(l=>l.lazy).length,withBody:FLAT.filter(l=>l.body).length}));
 expect(start).toEqual({lazy:577,withBody:0});
 const bodyIds=Object.keys(manifest.bodies);
 expect(bodyIds.length).toBe(await page.evaluate(()=>MODULES.length));
 let lessonsWithText=0;
 for(const id of bodyIds){
  expect(manifest.bodies[id]).toBe('assets/lesson-bodies/'+id+'.json');
  const texts=JSON.parse(fs.readFileSync(manifest.bodies[id],'utf8'));
  for(const lesson of Object.values(texts)){expect(Object.keys(lesson).every(key=>['body','body2','body3','tip','code','code2','code3','code4','objectives','sources','exercises','quality'].includes(key))).toBe(true);lessonsWithText++;}
 }
 expect(lessonsWithText).toBe(577);
 /* Öffnen einer Lektion lädt genau die Textdatei ihres Moduls nach und ersetzt den Platzhalter. */
 const before=requests.length;
 await page.evaluate(()=>selectLesson('m2-l2'));
 await page.waitForFunction(()=>document.querySelector('.lesson-body'));
 expect(requests.slice(before).filter(url=>url.includes('/assets/lesson-bodies/')).map(url=>url.split('?')[0].split('/').pop())).toEqual(['m2.json']);
 expect(await page.evaluate(()=>({lazy:FLAT.find(l=>l.id==='m2-l2').lazy??false,text:document.querySelector('.lesson-body').innerText.length>200}))).toEqual({lazy:false,text:true});
 /* Fehler beim Nachladen werden angezeigt und lassen sich wiederholen. */
 await page.route('**/assets/lesson-bodies/m3.json*',route=>route.abort());
 await page.evaluate(()=>selectLesson('m3-l1'));
 await expect(page.getByRole('alert')).toContainText('konnte nicht geladen werden');
 await page.unroute('**/assets/lesson-bodies/m3.json*');
 await page.getByRole('button',{name:'Erneut versuchen'}).click();
 await page.waitForFunction(()=>document.querySelector('.lesson-body'));
});
