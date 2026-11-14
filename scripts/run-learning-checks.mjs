import fs from 'node:fs';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
const checks=[
  {name:'laravel-tests',command:'php',args:['artisan','test','--compact'],cwd:'content/examples/laravel-lab'},
  {name:'vue-tests',command:'npm',args:['test'],cwd:'content/examples/vue-lab'},
  {name:'vue-build',command:'npm',args:['run','build'],cwd:'content/examples/vue-lab'},
  {name:'vue-audit',command:'npm',args:['audit','--json'],cwd:'content/examples/vue-lab'},
  {name:'ts-tests',command:'npm',args:['test'],cwd:'content/examples/ts-lab'},
  {name:'node-tests',command:'npm',args:['test'],cwd:'content/examples/node-lab'},
  {name:'websec-tests',command:'npm',args:['test'],cwd:'content/examples/websec-lab'},
  {name:'api-tests',command:'npm',args:['test'],cwd:'content/examples/api-lab'},
  // content/examples/shell-lab braucht Docker (run-in-container.sh) und läuft deshalb nicht in dieser Liste.
  // content/examples/sql-lab braucht Docker und ein lokales mariadb-Image (node run.mjs) und läuft deshalb ebenfalls nicht in dieser Liste.
  // Mit laufendem Docker startet der Testcontainers-Test einen PostgreSQL-Container (Image-Download beim ersten Mal): mehr Zeit.
  {name:'spring-tests',command:'./mvnw',args:['-B','-q','test'],cwd:'content/examples/spring-lab',timeout:600000},
];
const results=[];
for(const check of checks){const result=spawnSync(check.command,check.args,{cwd:check.cwd,encoding:'utf8',timeout:check.timeout??120000});results.push({...check,exitCode:result.status,stdout:result.stdout,stderr:result.stderr});console.log(check.name,result.status===0?'PASS':'FAIL');}
// Lokale Pfade (Projekt, Home-Verzeichnis) nicht ins öffentliche Repository schreiben.
fs.writeFileSync('content/quality/lab-checks.json',JSON.stringify({checkedAt:new Date().toISOString(),results},null,2).replaceAll(process.cwd(),'<repo>').replaceAll(os.homedir(),'~')+'\n');
if(results.some(r=>r.exitCode!==0))process.exitCode=1;
