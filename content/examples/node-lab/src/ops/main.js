// Startpunkt: Konfiguration laden, Server starten, sauber beenden. Wird in den Tests als Kindprozess gestartet.
import { createApp } from '../server/app.js';
import { loadConfig } from '../data/config.js';
import { createLogger } from './logger.js';
import { installShutdown } from './shutdown.js';

const logger = createLogger({ level: process.env.LOG_LEVEL ?? 'info' });
const loaded = loadConfig(process.env);
if (loaded.errors) {
  logger.error('Ungültige Konfiguration', { problems: loaded.errors });
  process.exit(78); // EX_CONFIG
}
const { port } = loaded.config;
const server = createApp();
installShutdown(server, { logger, timeoutMs: 3000 });
server.listen(port, process.env.HOST ?? '127.0.0.1', () => {
  logger.info('Server läuft', { port: server.address().port });
});
