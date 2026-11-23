import fs from 'node:fs';

// Schreibt einen Bericht mit Zeitstempel als erstem Feld, aber nur, wenn sich der Inhalt geändert hat.
// Sonst würde jeder Build die Dateien nur wegen des neuen Zeitstempels ändern (Rauschen in git status und im Review).
export function writeReport(file, stampKey, data) {
  const body = JSON.stringify(data, null, 2);
  try {
    const { [stampKey]: _stamp, ...previous } = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (JSON.stringify(previous, null, 2) === body) return false;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  fs.writeFileSync(file, JSON.stringify({ [stampKey]: new Date().toISOString(), ...data }, null, 2) + '\n');
  return true;
}
