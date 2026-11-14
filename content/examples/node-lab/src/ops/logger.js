// Strukturiertes Logging: eine JSON-Zeile pro Ereignis, Geheimnisse werden geschwärzt.
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const SECRET_KEY = /pass(word)?|secret|token|authorization|cookie|api[-_]?key/i;

export function redact(value, depth = 0) {
  if (depth > 5 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, SECRET_KEY.test(key) ? '[geschwärzt]' : redact(item, depth + 1)]));
}

export function createLogger({ level = 'info', write = (line) => process.stdout.write(line + '\n'), now = () => new Date() } = {}) {
  const threshold = LEVELS[level] ?? LEVELS.info;
  const log = (name, message, fields = {}) => {
    if (LEVELS[name] < threshold) return;
    const error = fields.error instanceof Error ? { name: fields.error.name, message: fields.error.message } : fields.error;
    write(JSON.stringify({ time: now().toISOString(), level: name, message, ...redact({ ...fields, error }) }));
  };
  return { debug: (m, f) => log('debug', m, f), info: (m, f) => log('info', m, f), warn: (m, f) => log('warn', m, f), error: (m, f) => log('error', m, f) };
}
