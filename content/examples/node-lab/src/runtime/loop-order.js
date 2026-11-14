// Event Loop in der Praxis: I/O-Callback-Reihenfolge und blockierte Schleife. Die Reihenfolge der Warteschlangen zeigen order.mjs und order.cjs.
import { readFile } from 'node:fs';

// Innerhalb eines I/O-Callbacks läuft setImmediate immer vor einem 0-ms-Timer.
export function orderInsideIo(file) {
  return new Promise((resolve) => {
    readFile(file, () => {
      const log = [];
      setTimeout(() => log.push('timeout'), 0);
      setImmediate(() => log.push('immediate'));
      setTimeout(() => resolve(log), 20);
    });
  });
}

// Blockiert die Schleife absichtlich: Während der Schleife läuft kein einziger Timer.
export function blockFor(ms) {
  const end = performance.now() + ms;
  while (performance.now() < end) { /* aktives Warten */ }
}

export async function lateTimer(delay, block) {
  const start = performance.now();
  return new Promise((resolve) => {
    setTimeout(() => resolve(Math.round(performance.now() - start)), delay);
    blockFor(block);
  });
}
