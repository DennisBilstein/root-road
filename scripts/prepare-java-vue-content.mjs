// Erzeugt die 30 Java-/Vue-Lektionen (java-m25, java-m26, js-m2, js-m3, js-m4) aus content/java-vue/*.mjs
// und schreibt sie als Module in content/learning-refinements.json. Code-Ausschnitte werden aus den
// getesteten Lab-Dateien gelesen, damit Lektionstext und lauffähiger Code nicht auseinanderlaufen.
import fs from 'node:fs';
import { createLessonBuilder } from './lib/lesson-builder.mjs';
import { module as javaModernModule, lessons as javaModernLessons } from '../content/java-vue/java-modern.mjs';
import { module as javaSpringModule, lessons as javaSpringLessons } from '../content/java-vue/java-spring.mjs';
import { module as vueComponentsModule, lessons as vueComponentsLessons } from '../content/java-vue/vue-components.mjs';
import { module as vueDataModule, lessons as vueDataLessons } from '../content/java-vue/vue-data.mjs';
import { module as vueAdvancedModule, lessons as vueAdvancedLessons } from '../content/java-vue/vue-advanced.mjs';

const target = 'content/learning-refinements.json';
const revision = '2026-11-12-java-vue-v1';
const knowledgeAsOf = '2026-11-12';
const { buildLesson, validate } = createLessonBuilder({ revision, knowledgeAsOf, standDe: '12.11.2026' });

const groups = [
  [javaModernModule, javaModernLessons], [javaSpringModule, javaSpringLessons],
  [vueComponentsModule, vueComponentsLessons], [vueDataModule, vueDataLessons],
  [vueAdvancedModule, vueAdvancedLessons],
];
const data = JSON.parse(fs.readFileSync(target, 'utf8'));
let total = 0;
for (const [meta, sources] of groups) {
  const lessons = sources.map(buildLesson);
  lessons.forEach(validate);
  const module = { ...meta, lessons };
  const index = data.modules.findIndex((item) => item.id === module.id);
  if (index < 0) data.modules.push(module); else data.modules[index] = module;
  total += lessons.length;
}
fs.writeFileSync(target, JSON.stringify(data, null, 2) + '\n');
console.log(`${total} Java-/Vue-Lektionen in ${groups.length} Modulen vorbereitet (Revision ${revision}).`);
