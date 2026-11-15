// Erzeugt assets/action-names.js: die Namen aller Funktionen, die Ereignis-Attribute (data-onclick …) aufrufen dürfen.
// Gelesen werden die App-Skripte und die Expertendaten; jedes Attribut muss der Grammatik aus assets/actions.js entsprechen,
// sonst bricht der Build ab (ein Attribut mit unbekannter Form würde sonst erst im Browser auffallen).
import fs from 'node:fs';

const sources = fs.readdirSync('assets')
  .filter((name) => name.endsWith('.js') && !name.endsWith('-data.js') && name !== 'action-names.js')
  .map((name) => `assets/${name}`)
  .concat(['content/expertenpfade/data.json']);
const attribute = /data-on(?:click|change|input|keydown|focus)=(\\?)"((?:[^"\\]|\\.)*?)\1"/g;
const statement = /^(?:if\(event\.key===\\?'[A-Za-z]+\\?'\)\{?)?([A-Za-z_]\w*)\(/;
const names = new Set();
const problems = [];
for (const file of sources) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(attribute)) {
    for (const part of match[2].split(';').map((piece) => piece.trim()).filter(Boolean)) {
      if (part === 'return false') continue;
      const found = statement.exec(part);
      if (found) names.add(found[1]); else problems.push(`${file}: ${part.slice(0, 80)}`);
    }
  }
}
if (problems.length) throw new Error(`Ereignis-Attribute ohne feste Aktion (siehe assets/actions.js):\n${problems.join('\n')}`);
const list = [...names].sort();
fs.writeFileSync('assets/action-names.js', `/* Erzeugt von scripts/build-action-names.mjs; nicht von Hand ändern. */\nwindow.RP_ACTION_NAMES=${JSON.stringify(list)};\n`);
console.log(`assets/action-names.js: ${list.length} freigegebene Aktionen.`);
