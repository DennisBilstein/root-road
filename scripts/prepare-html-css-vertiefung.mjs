// Erzeugt die Module html-m2 und css-m2 (HTML & CSS Vertiefung) aus content/tech-tracks/*-vertiefung.mjs
// und schreibt sie als Module in content/learning-refinements.json (danach: npm run build).
// Code-Ausschnitte werden aus dem getesteten Lab unter content/examples/html-css-lab/vertiefung/ gelesen.
import fs from 'node:fs';
import { createLessonBuilder } from './lib/lesson-builder.mjs';
import * as html from '../content/tech-tracks/html-vertiefung.mjs';
import * as css from '../content/tech-tracks/css-vertiefung.mjs';

const target = 'content/learning-refinements.json';
const revision = '2026-11-14-html-css-vertiefung-v1';
const knowledgeAsOf = '2026-11-14';
const { buildLesson, validate } = createLessonBuilder({ revision, knowledgeAsOf, standDe: '14.11.2026' });

const data = JSON.parse(fs.readFileSync(target, 'utf8'));
let total = 0;
for (const { module: meta, lessons: sources } of [html, css]) {
  const lessons = sources.map(buildLesson);
  lessons.forEach(validate);
  const module = { ...meta, lessons };
  const index = data.modules.findIndex((item) => item.id === module.id);
  if (index < 0) data.modules.push(module); else data.modules[index] = module;
  total += lessons.length;
}
fs.writeFileSync(target, JSON.stringify(data, null, 2) + '\n');
console.log(`${total} Lektionen in 2 Modulen vorbereitet (Revision ${revision}).`);
