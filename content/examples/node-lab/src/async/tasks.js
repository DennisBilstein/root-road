// Asynchrone Bausteine: Pause mit Abbruch, Zeitlimit, Wiederholung, begrenzte Parallelität.
import { setTimeout as sleepDefault } from 'node:timers/promises';

/** Pausiert ms Millisekunden und liefert value. Mit signal abbrechbar (wirft dann AbortError). */
export function delay(ms, value, { signal } = {}) {
  return sleepDefault(ms, value, { signal });
}

/** Führt work(signal) aus und bricht nach ms ab. work muss das Signal an abbrechbare Funktionen weitergeben. */
export async function withTimeout(work, ms) {
  const signal = AbortSignal.timeout(ms);
  try {
    return await work(signal);
  } catch (error) {
    if (signal.aborted) throw new Error(`Zeitlimit von ${ms} ms überschritten`, { cause: error });
    throw error;
  }
}

/** Wiederholt fn bis zu retries-mal mit wachsender Wartezeit (base, 2*base, 4*base ...). */
export async function retry(fn, { retries = 3, base = 10, sleep = delay, shouldRetry = () => true } = {}) {
  let attempt = 0;
  for (;;) {
    try {
      return await fn(attempt);
    } catch (error) {
      if (attempt >= retries || !shouldRetry(error)) throw error;
      await sleep(base * 2 ** attempt);
      attempt += 1;
    }
  }
}

/** Wie Promise.all über items, aber höchstens limit Aufrufe gleichzeitig; die Reihenfolge der Ergebnisse bleibt erhalten. */
export async function mapLimit(items, limit, fn) {
  if (!Number.isInteger(limit) || limit < 1) throw new RangeError('limit muss eine ganze Zahl >= 1 sein');
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

/** Fasst allSettled zusammen: wie viele Aufrufe gelangen, welche Gründe gab es. */
export async function summarize(promises) {
  const settled = await Promise.allSettled(promises);
  return {
    fulfilled: settled.filter((s) => s.status === 'fulfilled').length,
    reasons: settled.filter((s) => s.status === 'rejected').map((s) => s.reason.message),
  };
}
