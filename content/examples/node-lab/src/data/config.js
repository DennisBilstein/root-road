// Konfiguration aus Umgebungsvariablen: einlesen, prüfen, mit klaren Fehlern beenden.
import { parseEnv } from 'node:util';

const ENVIRONMENTS = ['development', 'test', 'production'];

/** Gibt { config } oder { errors } zurück. Fehler sind Texte ohne Geheimnisse (nie Werte von Passwörtern/Schlüsseln). */
export function loadConfig(env) {
  const errors = [];

  const port = Number(env.PORT ?? '8080');
  if (!Number.isInteger(port) || port < 1 || port > 65535) errors.push('PORT muss eine ganze Zahl von 1 bis 65535 sein');

  const nodeEnv = env.NODE_ENV ?? 'development';
  if (!ENVIRONMENTS.includes(nodeEnv)) errors.push(`NODE_ENV muss eines von ${ENVIRONMENTS.join(', ')} sein`);

  const dbPath = env.DB_PATH ?? ':memory:';
  if (nodeEnv === 'production' && dbPath === ':memory:') errors.push('DB_PATH ist in production Pflicht (eine Speicher-Datenbank verliert alles beim Neustart)');

  const secret = env.SESSION_SECRET ?? '';
  if (nodeEnv === 'production' && secret.length < 32) errors.push('SESSION_SECRET braucht in production mindestens 32 Zeichen'); // der Wert selbst steht nie in der Meldung

  return errors.length > 0 ? { errors } : { config: { port, nodeEnv, dbPath, hasSecret: secret.length > 0 } };
}

/** Liest den Inhalt einer .env-Datei (Text) in ein Objekt. Echte Umgebungsvariablen haben Vorrang. */
export function envFrom(fileText, realEnv = {}) {
  return { ...parseEnv(fileText), ...realEnv };
}
