// Ein kleiner HTTP-Server nur mit eingebauten Modulen: Routing, JSON, Statuscodes, Größenlimit.
import { createServer } from 'node:http';

const MAX_BODY = 1024; // Bytes
const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'x-content-type-options': 'nosniff', 'cache-control': 'no-store' };

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { ...JSON_HEADERS, ...headers });
  res.end(body === undefined ? undefined : JSON.stringify(body));
}

/** Liest den Body als Text und bricht ab, sobald mehr als MAX_BODY Bytes kommen (kein Speicherfresser). */
async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new HttpError(413, `Body größer als ${MAX_BODY} Bytes`);
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function readJsonBody(req) {
  const type = (req.headers['content-type'] ?? '').split(';')[0]?.trim();
  if (type !== 'application/json') throw new HttpError(415, 'Content-Type muss application/json sein');
  const text = await readBody(req);
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, 'Body ist kein gültiges JSON');
  }
}

function validateNewTask(input) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) throw new HttpError(422, 'Objekt erwartet');
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  if (title.length < 1 || title.length > 120) throw new HttpError(422, 'title braucht 1 bis 120 Zeichen');
  return { title };
}

export function createApp({ tasks = new Map() } = {}) {
  let nextId = 1;
  const routes = [
    { method: 'GET', pattern: /^\/health$/, handler: () => ({ status: 200, body: { ok: true } }) },
    { method: 'GET', pattern: /^\/tasks$/, handler: () => ({ status: 200, body: [...tasks.values()] }) },
    {
      method: 'POST', pattern: /^\/tasks$/,
      handler: async (req) => {
        const task = { id: nextId++, ...validateNewTask(await readJsonBody(req)), done: false };
        tasks.set(task.id, task);
        return { status: 201, body: task, headers: { location: `/tasks/${task.id}` } };
      },
    },
    {
      method: 'GET', pattern: /^\/tasks\/(\d+)$/,
      handler: (_req, [id]) => {
        const task = tasks.get(Number(id));
        if (!task) throw new HttpError(404, 'Aufgabe nicht gefunden');
        return { status: 200, body: task };
      },
    },
    {
      method: 'DELETE', pattern: /^\/tasks\/(\d+)$/,
      handler: (_req, [id]) => {
        if (!tasks.delete(Number(id))) throw new HttpError(404, 'Aufgabe nicht gefunden');
        return { status: 204 };
      },
    },
  ];

  return createServer(async (req, res) => {
    try {
      const { pathname } = new URL(req.url ?? '/', 'http://localhost'); // Basis nur zum Zerlegen, kein Netzwerkzugriff
      const matching = routes.filter((route) => route.pattern.test(pathname));
      if (matching.length === 0) throw new HttpError(404, 'Pfad unbekannt');
      const route = matching.find((candidate) => candidate.method === req.method);
      if (!route) {
        res.setHeader('allow', matching.map((r) => r.method).join(', '));
        throw new HttpError(405, 'Methode nicht erlaubt');
      }
      const match = route.pattern.exec(pathname);
      const result = await route.handler(req, match?.slice(1) ?? []);
      send(res, result.status, result.body, result.headers);
    } catch (error) {
      if (error instanceof HttpError) {
        send(res, error.status, { error: error.message });
      } else {
        console.error('Unerwarteter Fehler:', error.message); // keine Details an den Client
        send(res, 500, { error: 'Interner Fehler' });
      }
    }
  });
}
