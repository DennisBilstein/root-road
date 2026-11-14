// Mini-Anwendung zum Ausprobieren: Überweisungen nur mit Sitzung und CSRF-Prüfung (Lehrbeispiel).
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { buildCookie, parseCookies } from '../common/cookies.js';
import { createCsrfToken, verifyCsrfToken, isSameOriginRequest, corsHeaders } from './csrf.js';

const SECRET = randomBytes(32); // pro Start neu; in echt aus der Konfiguration (nie im Code)

export function createBank({ origin, allowedCorsOrigins = [], checkCsrf = true } = {}) {
  const sessions = new Map(); // sessionId -> { balance }
  const transfers = [];

  const server = createServer((req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const sessionId = cookies.get('__Host-sid');
    const session = sessionId ? sessions.get(sessionId) : undefined;
    const send = (status, body, extra = {}) => {
      res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', ...corsHeaders(req.headers.origin, allowedCorsOrigins), ...extra });
      res.end(JSON.stringify(body));
    };

    if (req.method === 'POST' && req.url === '/login') {
      const id = randomBytes(32).toString('base64url');
      sessions.set(id, { balance: 100 });
      return send(204, undefined, { 'set-cookie': buildCookie('__Host-sid', id, { maxAgeSeconds: 3600 }) });
    }
    if (!session || !sessionId) return send(401, { error: 'Nicht angemeldet' });

    if (req.method === 'GET' && req.url === '/csrf') return send(200, { token: createCsrfToken(sessionId, SECRET) });

    if (req.method === 'POST' && req.url === '/transfer') {
      if (checkCsrf) {
        if (!isSameOriginRequest(req.method, req.headers, origin)) return send(403, { error: 'Anfrage nicht von der eigenen Seite' });
        if (!verifyCsrfToken(req.headers['x-csrf-token'], sessionId, SECRET)) return send(403, { error: 'CSRF-Token fehlt oder ist ungültig' });
      }
      session.balance -= 10;
      transfers.push({ sessionId, amount: 10 });
      return send(200, { balance: session.balance });
    }
    return send(404, { error: 'Unbekannt' });
  });
  return { server, transfers, sessions };
}
