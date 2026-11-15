import fs from 'node:fs';
import {parse} from 'acorn';
import vm from 'node:vm';
const source=fs.readFileSync('assets/script-01.js','utf8');
const ast=parse(source,{ecmaVersion:'latest',sourceType:'script'});
const dir='assets/learning',dataDir='assets/learning-data';fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});fs.rmSync(dataDir,{recursive:true,force:true});fs.mkdirSync(dataDir,{recursive:true});
/* Lektionstexte werden nicht mit dem Start geladen: Der Bereich von "var MODULES" bis "MODULES.sort(" (Grundbestand, Experten, Verfeinerungen,
   Faktenkorrekturen, Ergänzungen) wird hier einmal in einer VM ausgewertet. Der Start bekommt nur die schlanke Struktur (ohne die Textfelder in HEAVY),
   die Texte liegen je Modul in assets/lesson-bodies/<Modul>.json und werden beim Öffnen der Lektion nachgeladen (bootstrap.js: rpLoadBodies).
   Ebenso die Quizfragen: Der Start bekommt je Lektion nur Platzhalter ({revision} je Frage, damit Anzahl und IDs stimmen) und Karten ohne Fragetext;
   Fragen, Optionen und Erklärungen stehen in assets/quiz-data.json und kommen beim ersten Bedarf (bootstrap.js: rpLoadQuizzes).
   Das Quellaggregat assets/script-01.js bleibt vollständig und ist die Grundlage für Build und Prüfungen. */
const HEAVY=['body','body2','body3','tip','code','code2','code3','code4'];
const isVar=(statement,name)=>statement.type==='VariableDeclaration'&&statement.declarations.length===1&&statement.declarations[0].id.name===name;
const modulesAt=ast.body.findIndex(statement=>isVar(statement,'MODULES'));
const sortAt=ast.body.findIndex((statement,i)=>i>modulesAt&&statement.type==='ExpressionStatement'&&source.slice(statement.start,statement.end).startsWith('MODULES.sort('));
if(modulesAt<0||sortAt<0)throw new Error('Datenbereich von MODULES nicht gefunden.');
function regionAction(text){
 if(/^var MODULES\b/.test(text))return 'slim';
 if(/^(var CHEATSHEET_HTML\b|var EXERCISES\b|EXERCISES\.push\.apply|CHEATSHEET_HTML \+=|var RP_APPLICATION_SUPPLEMENTS\b)/.test(text))return 'keep';
 if(/^var RP_ABAP_SENIOR_LESSONS\b/.test(text))return 'slimLessons';
 if(/^(MODULES\.push\.apply|var RP_REFINEMENTS\b|RP_REFINEMENTS\.|var RP_FACT_CORRECTIONS\b|RP_FACT_CORRECTIONS\.|RP_APPLICATION_SUPPLEMENTS\.forEach|var RP_ABAP_SENIOR_UPDATES\b|RP_ABAP_SENIOR_LESSONS\.forEach|RP_ABAP_SENIOR_UPDATES\.forEach|MODULES\.sort\()/.test(text))return 'drop';
 /* Eine neue Anweisung im Datenbereich muss bewusst eingeordnet werden, sonst würde die Struktur still von der Laufzeit abweichen. */
 throw new Error('Unbekannte Anweisung im Datenbereich von MODULES: '+text.slice(0,80));
}
const context=vm.createContext({});context.window=context;
for(let i=modulesAt;i<=sortAt;i++){
 const text=source.slice(ast.body[i].start,ast.body[i].end);
 /* Spickzettel und Übungen brauchen Funktionen der App und haben keinen Einfluss auf MODULES; alles andere im Bereich wird ausgewertet. */
 if(regionAction(text)==='keep'&&!text.startsWith('var RP_APPLICATION_SUPPLEMENTS'))continue;
 vm.runInContext(text,context,{timeout:30000});
}
/* Quiz-Kette nach MODULES.sort: Querschnitt, Überarbeitungen, Karten. Sie wird hier einmal ausgewertet; auch hier muss jede neue Anweisung eingeordnet werden. */
const textOf=statement=>source.slice(statement.start,statement.end);
const cardsEnd=ast.body.findIndex((statement,i)=>i>sortAt&&textOf(statement).startsWith('CARDS.forEach(function(c){ CARD_BY_ID'));
if(cardsEnd<0)throw new Error('Ende der Kartenkette nicht gefunden.');
const quizSkip=/^(var TRACES\b|TRACES\.push)/;
const quizEval=/^(var (TOTAL_MIN|FLAT|TOTAL|RP_TRANSFER|RP_QUIZ_REVISIONS|CARDS|EXTRA_CARDS|RP_EXTRA_REVISIONS|PARTS|CARD_BY_ID)\b|MODULES\.forEach\(|RP_TRANSFER\.forEach|RP_QUIZ_REVISIONS\.forEach|EXTRA_CARDS\.(push\.apply|forEach)|RP_EXTRA_REVISIONS\.forEach|CARDS\.forEach|function rpQuestionId)/;
for(let i=sortAt+1;i<=cardsEnd;i++){
 const text=textOf(ast.body[i]);
 if(quizSkip.test(text))continue;
 if(!quizEval.test(text))throw new Error('Unbekannte Anweisung in der Quiz-Kette: '+text.slice(0,80));
 vm.runInContext(text,context,{timeout:30000});
}
const finalModules=JSON.parse(vm.runInContext('JSON.stringify(MODULES)',context));
const finalCards=JSON.parse(vm.runInContext('JSON.stringify(CARDS)',context));
const withoutHeavy=lesson=>Object.fromEntries(Object.entries(lesson).filter(([key])=>!HEAVY.includes(key)));
const bodiesDir='assets/lesson-bodies';fs.rmSync(bodiesDir,{recursive:true,force:true});fs.mkdirSync(bodiesDir,{recursive:true});
const bodyFiles={};let figures=0;const quizData={lessons:{},extras:[]};
const slimModules=finalModules.map(module=>{
 if(!/^[a-z0-9-]+$/.test(module.id))throw new Error('Ungültige Modul-ID für Dateinamen: '+module.id);
 const texts={};
 const lessons=module.lessons.map(lesson=>{
  const heavy=Object.fromEntries(HEAVY.filter(key=>lesson[key]!==undefined).map(key=>[key,lesson[key]]));
  figures+=(String(heavy.body||'').match(/<figure class="fig">/g)||[]).length;
  const slim=withoutHeavy(lesson);
  if(Object.keys(heavy).length){texts[lesson.id]=heavy;slim.lazy=true;}
  if((lesson.quiz||[]).length){
   quizData.lessons[lesson.id]=lesson.quiz;
   slim.quiz=lesson.quiz.map(question=>question.revision?{revision:question.revision}:{});slim.lazyQuiz=true;
  }
  return slim;
 });
 if(Object.keys(texts).length){fs.writeFileSync(bodiesDir+'/'+module.id+'.json',JSON.stringify(texts));bodyFiles[module.id]=bodiesDir+'/'+module.id+'.json';}
 return {...module,lessons};
});
/* Zusatzkarten: Index (ID, Lektion) im Start, Fragetexte in quiz-data.json. Die Rekonstruktion unten spiegelt bootstrap.js (rpLoadQuizzes) und
   muss exakt die Karten der Quellkette ergeben; sonst bricht der Build ab. */
const extraCards=finalCards.filter(card=>card.id.startsWith('x#'));
quizData.extras=extraCards.map(({id,lessonId,q,options,correct,explain})=>({id,lessonId,q,options,correct,explain}));
const extraIndex=extraCards.map(card=>[card.id,card.lessonId]);
const rebuilt=[];
const detail=new Map();
for(const module of slimModules)for(const lesson of module.lessons)(lesson.quiz||[]).forEach((stub,i)=>{
 const question=lesson.lazyQuiz?quizData.lessons[lesson.id][i]:stub;
 rebuilt.push({id:lesson.id+'#'+i+(stub.revision?'@'+stub.revision:''),q:question.q,options:question.options,correct:question.correct,explain:question.explain,lessonId:lesson.id,lessonTitle:lesson.title,moduleTitle:module.title,part:module.part});
});
for(const [id,lessonId] of extraIndex){
 const module=slimModules.find(m=>m.lessons.some(l=>l.id===lessonId)),lesson=module.lessons.find(l=>l.id===lessonId),extra=quizData.extras.find(e=>e.id===id);
 rebuilt.push({id,q:extra.q,options:extra.options,correct:extra.correct,explain:extra.explain,lessonId,lessonTitle:lesson.title,moduleTitle:module.title,part:module.part});
}
if(JSON.stringify(rebuilt)!==JSON.stringify(finalCards))throw new Error('Die aus Platzhaltern und quiz-data.json rekonstruierten Karten weichen von der Quellkette ab.');
fs.writeFileSync('assets/quiz-data.json',JSON.stringify(quizData));
const extraCardsCode='var RP_EXTRA_INDEX='+JSON.stringify(extraIndex)+';\nRP_EXTRA_INDEX.forEach(function(row){\n  var mod=MODULES.find(function(m){ return m.lessons.some(function(l){ return l.id === row[1]; }); });\n  var les=mod.lessons.find(function(l){ return l.id === row[1]; });\n  CARDS.push({ id:row[0], lessonId:row[1], lessonTitle:les.title, moduleTitle:mod.title, part:mod.part });\n});\n';
const files=[],dataFiles=[];let chunk='',index=0;
function flush(){if(!chunk)return;const name='part-'+String(++index).padStart(2,'0')+'.js';fs.writeFileSync(dir+'/'+name,chunk);files.push('assets/learning/'+name);chunk='';}
let literalNumber=0;
const modulesLiteral=++literalNumber;
fs.writeFileSync(dataDir+'/literal-'+modulesLiteral+'.json',JSON.stringify(slimModules));dataFiles.push(dataDir+'/literal-'+modulesLiteral+'.json');
function safe(node){if(!node)return true;if(node.type==='Literal')return !node.regex;if(node.type==='ArrayExpression')return node.elements.every(safe);if(node.type==='ObjectExpression')return node.properties.every(p=>p.type==='Property'&&!p.computed&&p.kind==='init'&&safe(p.value));if(node.type==='UnaryExpression')return node.operator==='-'&&node.argument.type==='Literal'&&typeof node.argument.value==='number';return false;}
function add(text){if(Buffer.byteLength(chunk+text)>250000)flush();chunk+=text;}
for(const [position,statement] of ast.body.entries()){
 if(position>=modulesAt&&position<=sortAt){
  const action=regionAction(source.slice(statement.start,statement.end));
  if(action==='slim'){add('var MODULES=window.RP_LITERALS['+modulesLiteral+'];\n');continue;}
  if(action==='drop')continue;
  if(action==='slimLessons'){add('var RP_ABAP_SENIOR_LESSONS='+JSON.stringify(vm.runInContext('RP_ABAP_SENIOR_LESSONS',context).map(withoutHeavy))+';\n');continue;}
 }
 if(position>sortAt&&position<=cardsEnd){
  const text=textOf(statement);
  if(/^(var RP_TRANSFER\b|RP_TRANSFER\.forEach|var RP_QUIZ_REVISIONS\b|RP_QUIZ_REVISIONS\.forEach|var EXTRA_CARDS\b|EXTRA_CARDS\.push\.apply|var RP_EXTRA_REVISIONS\b|RP_EXTRA_REVISIONS\.forEach)/.test(text))continue;
  if(text.startsWith('EXTRA_CARDS.forEach(')){add(extraCardsCode);continue;}
 }
 const replacements=[];
 function visit(node){
  if(!node||typeof node!=='object')return;
  if((node.type==='ArrayExpression'||node.type==='ObjectExpression')&&node.end-node.start>80000&&safe(node)){
   /* Große Literale liegen als rohes JSON in eigenen Dateien (ohne doppeltes Escaping im Skript); bootstrap.js holt sie vor den Skripten. */
   const name='RP_LITERAL_'+(++literalNumber),json=JSON.stringify(vm.runInNewContext('('+source.slice(node.start,node.end)+')',{}, {timeout:2000})),dataFile=dataDir+'/literal-'+literalNumber+'.json';
   fs.writeFileSync(dataFile,json);dataFiles.push(dataFile);
   add('var '+name+'=window.RP_LITERALS['+literalNumber+'];\n');replacements.push({start:node.start,end:node.end,text:name});return;
  }
   for(const value of Object.values(node)){
    if(Array.isArray(value)){value.forEach(visit);}
    else if(value&&typeof value==='object'){visit(value);}
   }
 }
 visit(statement);let text=source.slice(statement.start,statement.end);for(const r of replacements.sort((a,b)=>b.start-a.start))text=text.slice(0,r.start-statement.start)+r.text+text.slice(r.end-statement.start);add(text+'\n');
}flush();
const hoist=ast.body.filter(node=>node.type==='FunctionDeclaration').map(node=>source.slice(node.start,node.end)).join('\n');
fs.writeFileSync(dir+'/declarations.js',hoist+'\n');
fs.writeFileSync('assets/learning-manifest.json',JSON.stringify({format:2,source:'assets/script-01.js',files:['assets/learning/declarations.js',...files],data:dataFiles,bodies:bodyFiles,quiz:'assets/quiz-data.json',stats:{figures}},null,2)+'\n');
console.log(`${files.length+1} geordnete Lernskripte, ${dataFiles.length} JSON-Datensätze und ${Object.keys(bodyFiles).length} Textdateien je Modul statt monolithischem Browserabruf; Quellaggregat bleibt für Build/Prüfungen.`);
