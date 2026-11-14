// Erzeugt die Lektionen der Kurse TypeScript, Node.js, Linux & Shell und Web-Sicherheit aus content/tech-tracks/*.mjs
// und schreibt sie als Module in content/learning-refinements.json (danach: npm run build).
// Code-Ausschnitte werden aus den getesteten Labs unter content/examples/ gelesen.
import fs from 'node:fs';
import { createLessonBuilder } from './lib/lesson-builder.mjs';
import * as tsBasics from '../content/tech-tracks/typescript-basics.mjs';
import * as tsAdvanced from '../content/tech-tracks/typescript-advanced.mjs';
import * as nodeRuntime from '../content/tech-tracks/node-runtime.mjs';
import * as nodeServer from '../content/tech-tracks/node-server.mjs';
import * as linuxBasics from '../content/tech-tracks/linux-basics.mjs';
import * as linuxScripting from '../content/tech-tracks/linux-scripting.mjs';
import * as websecBasics from '../content/tech-tracks/websec-basics.mjs';
import * as websecHardening from '../content/tech-tracks/websec-hardening.mjs';

const target = 'content/learning-refinements.json';
const revision = '2026-11-14-tech-tracks-v1';
const knowledgeAsOf = '2026-11-14';
const { buildLesson, validate } = createLessonBuilder({ revision, knowledgeAsOf, standDe: '14.11.2026' });

const groups = [tsBasics, tsAdvanced, nodeRuntime, nodeServer, linuxBasics, linuxScripting, websecBasics, websecHardening];
const data = JSON.parse(fs.readFileSync(target, 'utf8'));
let total = 0;
for (const { module: meta, lessons: sources } of groups) {
  const lessons = sources.map(buildLesson);
  lessons.forEach(validate);
  const module = { ...meta, lessons };
  const index = data.modules.findIndex((item) => item.id === module.id);
  if (index < 0) data.modules.push(module); else data.modules[index] = module;
  total += lessons.length;
}
fs.writeFileSync(target, JSON.stringify(data, null, 2) + '\n');
console.log(`${total} Lektionen in ${groups.length} Modulen vorbereitet (Revision ${revision}).`);
