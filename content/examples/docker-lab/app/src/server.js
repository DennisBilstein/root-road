// Kleiner HTTP-Dienst für das Docker-Lab: Gesundheitscheck, Besuchszähler auf einem Datenträger, Infos zur Laufzeitumgebung.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const port = Number(process.env.PORT ?? 3000);
const dataDir = process.env.DATA_DIR ?? '/data';
const counterFile = path.join(dataDir, 'visits.txt');
// Schalter nur für das Lab: zeigt, was ohne Signalbehandlung passiert (Docker wartet dann bis zum Zwangsende).
const handleSignals = process.env.APP_HANDLE_SIGNALS !== '0';

function log(event, fields = {}) {
  // Protokoll nach stdout, eine JSON-Zeile je Ereignis: So sammelt Docker (docker logs) es ohne eigene Dateien.
  process.stdout.write(`${JSON.stringify({ event, ...fields })}\n`);
}

export function readVisits() {
  try { return Number(fs.readFileSync(counterFile, 'utf8')) || 0; } catch { return 0; }
}

export function createServer() {
  return http.createServer((req, res) => {
    const json = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); };
    if (req.method === 'GET' && req.url === '/healthz') return json(200, { status: 'ok' });
    if (req.method === 'GET' && req.url === '/info') {
      return json(200, { uid: process.getuid?.(), mode: process.env.APP_MODE ?? 'unset', node: process.version, visits: readVisits() });
    }
    if (req.method === 'POST' && req.url === '/visit') {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
        fs.writeFileSync(counterFile, String(readVisits() + 1));
        return json(200, { visits: readVisits() });
      } catch (error) {
        log('write-failed', { code: error.code });
        return json(500, { error: 'Zähler nicht beschreibbar', code: error.code });
      }
    }
    return json(404, { error: 'Nicht gefunden' });
  });
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const server = createServer();
  server.listen(port, '0.0.0.0', () => log('listening', { port, mode: process.env.APP_MODE ?? 'unset' }));
  if (handleSignals) {
    for (const signal of ['SIGTERM', 'SIGINT']) {
      process.on(signal, () => { log('stopping', { signal }); server.close(() => process.exit(0)); server.closeAllConnections(); });
    }
  }
}
