import fs from 'node:fs';
import vm from 'node:vm';
import {writeReport} from './lib/write-report.mjs';
const script=fs.readFileSync('assets/script-01.js','utf8'),catalog={};vm.createContext(catalog);vm.runInContext(script.slice(0,script.indexOf('var VERSION =')),catalog);
// Die Quizverträge werden im Browser erst bei Bedarf geladen (assets/quiz-contracts-data.js); für die Prüfung gehören sie dazu.
catalog.window=catalog;
vm.runInContext(fs.readFileSync('assets/quiz-contracts-data.js','utf8'),catalog);
const failures=[];
for(const card of catalog.CARDS){
 const contract=catalog.RP_QUIZ_CONTRACT_BY_ID[card.id];
 if(!card.id.includes('@')||!contract||contract.rationales.length!==card.options.length||!contract.sources.length)failures.push(card.id);
}
const batch=JSON.parse(fs.readFileSync('content/quality/quiz-batch-status.json','utf8'));
if(batch.some(b=>b.integrated!==b.expected))failures.push('incomplete-batch');
if(new Set(catalog.CARDS.map(c=>c.id)).size!==catalog.CARDS.length)failures.push('duplicate-card');
const assessment=JSON.parse(fs.readFileSync('content/quality/module-assessment-coverage.json','utf8'));
const style=JSON.parse(fs.readFileSync('content/quality/quiz-style-audit.json','utf8'));
const links=JSON.parse(fs.readFileSync('content/quality/quiz-source-link-checks.json','utf8'));
const sourceCount=JSON.parse(fs.readFileSync('content/quality/quiz-source-register.json','utf8')).sources.length;
const labs=JSON.parse(fs.readFileSync('content/quality/lab-checks.json','utf8'));
const status={modules:catalog.MODULES.length,lessons:catalog.FLAT.length,lessonQuestions:catalog.FLAT.reduce((n,l)=>n+l.quiz.length,0),extraCards:catalog.EXTRA_CARDS.length,totalCards:catalog.CARDS.length,allQuestionContentRevised:failures.length===0,independentHumanFactualReview:false,questionSources:links.total,technicallyReachableSources:links.results.filter(r=>r.reachable).length,unresolvedAutomaticSourceFetches:links.results.filter(r=>!r.reachable).length,styleWarnings:style.findings.length,manualModuleAssignments:assessment.modules,draftModuleRubrics:assessment.drafts,parallelTaskFamilies:3,parallelTaskVariants:6,labChecks:labs.results.map(r=>({name:r.name,passed:r.exitCode===0})),failures};
status.questionSources=sourceCount;status.pendingSourceFetches=sourceCount-links.checked;
status.individuallyAuthoredModuleAssignments=assessment.individuallyAuthored||0;
writeReport('content/quality/release-status.json','generatedAt',status);console.log(status);if(failures.length)process.exitCode=1;
