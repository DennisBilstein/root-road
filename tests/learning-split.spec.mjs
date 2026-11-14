import {test,expect} from '@playwright/test';
import fs from 'node:fs';
test('Browser lädt geordnete kleine Skripte statt das Quellaggregat',async({page})=>{
 const requests=[];page.on('request',r=>requests.push(r.url()));await page.goto('/');await page.waitForFunction(()=>window.RP_APP_READY);
 expect(requests.some(url=>url.endsWith('/assets/script-01.js'))).toBe(false);
 const manifest=JSON.parse(fs.readFileSync('assets/learning-manifest.json','utf8'));
 expect(manifest.files.length).toBeGreaterThan(5);
 for(const file of manifest.files)expect(fs.statSync(file).size).toBeLessThan(300000);
 expect(manifest.data.length).toBeGreaterThan(0);
 for(const file of manifest.data)expect(JSON.parse(fs.readFileSync(file,'utf8'))).toBeTruthy();
 expect(await page.evaluate(()=>FLAT.length)).toBe(550);
});
