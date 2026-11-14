// Sauberes Beenden: Neue Verbindungen ablehnen, laufende Anfragen zu Ende bringen, dann Exit-Code 0.
import { once } from 'node:events';

export function installShutdown(server, { logger, timeoutMs = 10_000, signals = ['SIGTERM', 'SIGINT'], exit = process.exit } = {}) {
  let closing = false;
  async function shutdown(signal) {
    if (closing) return; // zweites Signal ignorieren
    closing = true;
    logger?.info('Beenden angefordert', { signal });
    const timer = setTimeout(() => {
      logger?.error('Zeitlimit beim Beenden, harter Abbruch', { timeoutMs });
      exit(1);
    }, timeoutMs);
    timer.unref(); // das Warten auf den Timer hält den Prozess nicht am Leben
    server.close(); // keine neuen Verbindungen
    server.closeIdleConnections(); // Keep-Alive-Verbindungen ohne laufende Anfrage schließen
    await once(server, 'close');
    clearTimeout(timer);
    logger?.info('Beendet');
    exit(0);
  }
  for (const signal of signals) process.once(signal, () => void shutdown(signal));
  return shutdown;
}
