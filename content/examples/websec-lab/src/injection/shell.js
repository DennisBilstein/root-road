// Command Injection: exec mit Text gegen execFile mit Argumentliste. Als harmloser Befehl dient echo.
import { exec, execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(exec);
const runFile = promisify(execFile);

/** UNSICHER, nur zur Vorführung: Die Shell liest die Eingabe als Befehlszeile. */
export async function greetUnsafe(name) {
  const { stdout } = await run(`echo Hallo ${name}`);
  return stdout;
}

/** Sicher: Kein Shell-Aufruf, jedes Argument bleibt ein Argument. */
export async function greetSafe(name) {
  const { stdout } = await runFile('echo', ['Hallo', name]);
  return stdout;
}

/**
 * Argument-Injection: Ein Wert, der mit - beginnt, wird von vielen Programmen als Option gelesen.
 * "--" beendet die Optionen; zusätzlich wird die Form des Musters geprüft.
 */
export async function countMatches(pattern, file) {
  if (typeof pattern !== 'string' || pattern.length === 0 || pattern.length > 100) throw new RangeError('Muster muss 1 bis 100 Zeichen lang sein');
  try {
    const { stdout } = await runFile('grep', ['-c', '-F', '--', pattern, file]);
    return Number(stdout.trim());
  } catch (error) {
    if (error.code === 1) return 0; // grep: keine Treffer
    throw error;
  }
}
