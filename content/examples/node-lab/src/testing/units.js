// Code, der sich gut testen lässt: Abhängigkeiten (Zeit, Netzwerk) werden hereingereicht oder lassen sich ersetzen.

/** Cache mit Ablaufzeit. Nutzt Date.now(), das Tests mit mock.timers steuern können. */
export class TtlCache {
  #entries = new Map();
  constructor(ttlMs) {
    if (!(ttlMs > 0)) throw new RangeError('ttlMs muss größer als 0 sein');
    this.ttlMs = ttlMs;
  }
  set(key, value) {
    this.#entries.set(key, { value, expires: Date.now() + this.ttlMs });
  }
  get(key) {
    const entry = this.#entries.get(key);
    if (!entry) return undefined;
    if (Date.now() >= entry.expires) {
      this.#entries.delete(key);
      return undefined;
    }
    return entry.value;
  }
}

/** Führt fn erst aus, wenn ms lang kein neuer Aufruf kam (z. B. Suchfeld). */
export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/** Wechselkurs holen; fetchImpl ist austauschbar, damit der Test kein Netzwerk braucht. */
export async function getRate(currency, { fetchImpl = fetch, cache = new TtlCache(60_000) } = {}) {
  const cached = cache.get(currency);
  if (cached !== undefined) return cached;
  const response = await fetchImpl(`https://rates.example.test/v1/${encodeURIComponent(currency)}`);
  if (!response.ok) throw new Error(`Kurs nicht verfügbar (${response.status})`);
  const body = await response.json();
  if (typeof body?.rate !== 'number' || !Number.isFinite(body.rate)) throw new Error('Antwort ohne gültigen Kurs');
  cache.set(currency, body.rate);
  return body.rate;
}
