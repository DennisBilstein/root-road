// Erzeugt Module der Plattform-Pakete (MariaDB, APIs, Docker, CI/CD, Python) aus content/tech-tracks/*.mjs
// und schreibt sie als Module in content/learning-refinements.json (danach: npm run build).
// Code-Ausschnitte und Ausgaben stammen aus den geprüften Labs unter content/examples/.
import fs from 'node:fs';
import { createLessonBuilder } from './lib/lesson-builder.mjs';
import * as mariadb from '../content/tech-tracks/mariadb-vertiefung.mjs';

const target = 'content/learning-refinements.json';
const revision = '2026-11-14-platform-tracks-v1';
const knowledgeAsOf = '2026-11-14';
const { buildLesson, validate } = createLessonBuilder({ revision, knowledgeAsOf, standDe: '14.11.2026' });

const data = JSON.parse(fs.readFileSync(target, 'utf8'));
let total = 0;
for (const { module: meta, lessons: sources } of [mariadb]) {
  const lessons = sources.map(buildLesson);
  lessons.forEach(validate);
  const module = { ...meta, lessons };
  const index = data.modules.findIndex((item) => item.id === module.id);
  if (index < 0) data.modules.push(module); else data.modules[index] = module;
  total += lessons.length;
}
fs.writeFileSync(target, JSON.stringify(data, null, 2) + '\n');
console.log(`${total} Lektionen vorbereitet (Revision ${revision}).`);
