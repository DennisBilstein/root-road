// Erzeugt die Vue-Grundlagenlektionen js-m1-l8 bis js-m1-l16 aus content/java-vue/vue-basics.mjs und hängt sie an js-m1 an.
// Läuft nach scripts/revise-javascript-curriculum.mjs (das js-m1-l1 bis l7 erzeugt). Code-Ausschnitte werden aus den
// getesteten Lab-Dateien gelesen, damit Lektionstext und lauffähiger Code nicht auseinanderlaufen.
import fs from 'node:fs';
import { createLessonBuilder } from './lib/lesson-builder.mjs';
import { lessons as basics } from '../content/java-vue/vue-basics.mjs';

const target = 'content/learning-refinements.json';
const revision = '2026-11-23-vue-basics-v1';
const knowledgeAsOf = '2026-11-23';
const { buildLesson, validate } = createLessonBuilder({ revision, knowledgeAsOf, standDe: '23.11.2026' });

const data = JSON.parse(fs.readFileSync(target, 'utf8'));
const module = data.modules.find((item) => item.id === 'js-m1');
if (!module) throw new Error('Modul js-m1 fehlt: zuerst scripts/revise-javascript-curriculum.mjs ausführen.');
const lessons = basics.map(buildLesson);
lessons.forEach(validate);
for (const lesson of lessons) {
  const index = module.lessons.findIndex((item) => item.id === lesson.id);
  if (index < 0) module.lessons.push(lesson); else module.lessons[index] = lesson;
}
fs.writeFileSync(target, JSON.stringify(data, null, 2) + '\n');
console.log(`${lessons.length} Vue-Grundlagenlektionen in js-m1 geschrieben (Revision ${revision}).`);
