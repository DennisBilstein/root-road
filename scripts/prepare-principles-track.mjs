// Erzeugt das Modul „Programmierprinzipien“ (pp-m1) aus content/tech-tracks/programmierprinzipien.mjs
// und schreibt es in content/learning-refinements.json (danach: npm run build).
// Eigenes Skript mit eigenem Stichtag, damit die Revisionen der übrigen Pakete (14.11.2026) unverändert bleiben.
// Code-Ausschnitte stammen aus dem getesteten Lab content/examples/node-lab/src/principles/.
import fs from 'node:fs';
import { createLessonBuilder } from './lib/lesson-builder.mjs';
import * as principles from '../content/tech-tracks/programmierprinzipien.mjs';

const target = 'content/learning-refinements.json';
const revision = '2026-11-16-principles-v1';
const knowledgeAsOf = '2026-11-16';
const { buildLesson, validate } = createLessonBuilder({ revision, knowledgeAsOf, standDe: '16.11.2026' });

const data = JSON.parse(fs.readFileSync(target, 'utf8'));
const lessons = principles.lessons.map(buildLesson);
lessons.forEach(validate);
const module = { ...principles.module, lessons };
const index = data.modules.findIndex((item) => item.id === module.id);
if (index < 0) data.modules.push(module); else data.modules[index] = module;
fs.writeFileSync(target, JSON.stringify(data, null, 2) + '\n');
console.log(`${lessons.length} Lektion in Modul ${module.id} vorbereitet (Revision ${revision}).`);
