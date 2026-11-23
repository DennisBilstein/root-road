// Bündelt die Stylesheets der Startseite zu assets/app.css: eine Anfrage statt elf, damit das erste Zeichnen nicht auf mehrere
// Netzwerk-Runden wartet. Die Reihenfolge entspricht der bisherigen Reihenfolge der <link>-Elemente in index.html (Kaskade unverändert).
// admin.html lädt weiter einzelne Dateien; die Quelldateien bleiben bestehen. Nach Änderungen an einer Quelldatei: npm run build.
import fs from 'node:fs';

const sources = ['style-01', 'style-02', 'fonts', 'learning-paths', 'weak-spots', 'practice-puzzles', 'syntax-glossary', 'lesson-videos', 'admin', 'guided-practice', 'code-theme', 'celebrate', 'device'];
const known = new Set([...sources, 'app']);
const unknown = fs.readdirSync('assets').filter((name) => name.endsWith('.css') && !known.has(name.slice(0, -4)));
if (unknown.length) throw new Error(`Neue Stylesheets müssen in scripts/build-css-bundle.mjs eingeordnet werden: ${unknown.join(', ')}`);

const parts = sources.map((name) => `/* ${name}.css */\n${fs.readFileSync(`assets/${name}.css`, 'utf8').trimEnd()}\n`);
fs.writeFileSync('assets/app.css', `/* Erzeugt von scripts/build-css-bundle.mjs; nicht von Hand ändern. */\n${parts.join('\n')}`);
console.log(`assets/app.css aus ${sources.length} Stylesheets erzeugt.`);
