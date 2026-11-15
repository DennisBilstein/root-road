import fs from 'node:fs';
import vm from 'node:vm';

// Die Quellkette der Quizfragen (RP_QUIZ_REVISIONS, RP_EXTRA_REVISIONS) liegt nur noch im Quellaggregat assets/script-01.js;
// der Browser bekommt die fertigen Fragen aus assets/quiz-data.json. Diese Hilfe liest eine einzeilige Variablendeklaration daraus.
export function readSourceVariable(name) {
  const line = fs.readFileSync('assets/script-01.js', 'utf8').split('\n').find((text) => text.startsWith(`var ${name}=`));
  if (!line) throw new Error(`Variable ${name} fehlt in assets/script-01.js`);
  const context = {};
  vm.runInNewContext(line, context);
  return context[name];
}
