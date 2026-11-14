// Einfache Risikobewertung: Eintrittswahrscheinlichkeit × Schaden, beide von 1 (gering) bis 5 (sehr hoch).
const LEVELS = [[20, 'kritisch'], [12, 'hoch'], [6, 'mittel'], [1, 'niedrig']];

function checkScale(name, value) {
  if (!Number.isInteger(value) || value < 1 || value > 5) throw new RangeError(`${name} muss eine ganze Zahl von 1 bis 5 sein`);
}

export function score({ likelihood, impact }) {
  checkScale('likelihood', likelihood);
  checkScale('impact', impact);
  return likelihood * impact;
}

export function level(value) {
  const found = LEVELS.find(([minimum]) => value >= minimum);
  if (!found) throw new RangeError('Wert muss mindestens 1 sein');
  return found[1];
}

/** Sortiert absteigend nach Risikowert, bei Gleichstand nach Schaden, dann nach Name (stabile, nachvollziehbare Reihenfolge). */
export function rank(risks) {
  return risks
    .map((risk) => ({ ...risk, score: score(risk), level: level(score(risk)) }))
    .sort((a, b) => b.score - a.score || b.impact - a.impact || a.name.localeCompare(b.name, 'de'));
}
