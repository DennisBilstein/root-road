// Notizen-API für die Lektionen api-m2: Ressourcen, Fehlerformat, Cursor-Paginierung, Idempotenz, ETag, Token, Ratenbegrenzung, Versionen.
import http from 'node:http';
import { HttpError, toProblemBody } from './problem.js';
import { validateNoteInput } from './validate.js';
import { createStore, etagOf } from './store.js';
import { createTokens } from './auth.js';
import { createLimiter } from './ratelimit.js';
import { createIdempotency, fingerprint } from './idempotency.js';
import { page, parseLimit } from './pagination.js';

const maxBodyBytes = 16 * 1024;
const idempotencyKeyPattern = /^[A-Za-z0-9_-]{8,64}$/;
// Die Version /v0 ist veraltet: Sie läuft weiter, kündigt aber ihr Ende an (Deprecation nach RFC 9745, Sunset nach RFC 8594).
export const v0Lifecycle = { deprecatedAt: Date.UTC(2026, 0, 1), sunsetAt: Date.UTC(2026, 11, 31, 23, 59, 59) };

const publicNote = ({ owner, ...note }) => note;
const problemType = (name) => `https://example.test/probleme/${name}`;

export function createApp({ clock = Date.now, limits = { capacity: 30, refillPerSecond: 10 } } = {}) {
  const store = createStore(clock);
  const tokens = createTokens(clock);
  const limiter = createLimiter({ ...limits, clock });
  const idempotency = createIdempotency();

  async function readBody(req) {
    if (!/^application\/json\s*(;|$)/i.test(req.headers['content-type'] ?? '')) {
      throw new HttpError(415, 'Nicht unterstützter Medientyp', { detail: 'Erwartet wird Content-Type: application/json.', headers: { Accept: 'application/json' } });
    }
    const tooLarge = new HttpError(413, 'Anfrage zu groß', { detail: `Der Rumpf darf höchstens ${maxBodyBytes} Bytes groß sein.` });
    if (Number(req.headers['content-length']) > maxBodyBytes) throw tooLarge;
    const chunks = [];
    let size = 0;
    for await (const chunk of req) { size += chunk.length; if (size <= maxBodyBytes) chunks.push(chunk); }
    if (size > maxBodyBytes) throw tooLarge;
    return Buffer.concat(chunks).toString('utf8');
  }

  function parseJson(raw) {
    try { return JSON.parse(raw); } catch { throw new HttpError(400, 'Ungültiges JSON', { detail: 'Der Rumpf ist kein gültiges JSON-Dokument.', type: problemType('json') }); }
  }

  function authenticate(req) {
    const match = /^Bearer ([A-Za-z0-9_-]+)$/.exec(req.headers.authorization ?? '');
    const identity = match ? tokens.verify(match[1]) : null;
    if (!identity) throw new HttpError(401, 'Nicht angemeldet', { detail: 'Ein gültiges Bearer-Token fehlt oder ist abgelaufen.', headers: { 'WWW-Authenticate': 'Bearer realm="notes"' } });
    return identity;
  }

  function requireScope(identity, scope) {
    if (!identity.scopes.has(scope)) {
      throw new HttpError(403, 'Berechtigung fehlt', { detail: `Benötigt wird der Scope ${scope}.`, headers: { 'WWW-Authenticate': `Bearer error="insufficient_scope", scope="${scope}"` } });
    }
  }

  // Fremde Notizen verhalten sich wie nicht vorhandene (404 statt 403): So verrät die API nicht, welche IDs existieren.
  function ownedNote(identity, id) {
    const note = /^\d{4,}$/.test(id) ? store.get(id) : undefined;
    if (!note || note.owner !== identity.subject) throw new HttpError(404, 'Notiz nicht gefunden', { detail: `Es gibt keine Notiz mit der ID ${id}.` });
    return note;
  }

  const etagMatches = (header, etag) => header.trim() === '*' || header.split(',').some((candidate) => candidate.trim().replace(/^W\//, '') === etag);

  async function createNote(req, identity, prefix) {
    requireScope(identity, 'notes:write');
    const key = req.headers['idempotency-key'];
    if (key !== undefined && !idempotencyKeyPattern.test(key)) {
      throw new HttpError(400, 'Ungültiger Idempotency-Key', { detail: 'Erlaubt sind 8 bis 64 Zeichen aus A-Z, a-z, 0-9, Unterstrich und Bindestrich.' });
    }
    const raw = await readBody(req);
    const print = fingerprint(raw);
    if (key) {
      const saved = idempotency.lookup(identity.subject, key);
      if (saved && saved.print !== print) throw new HttpError(422, 'Idempotency-Key wiederverwendet', { detail: 'Derselbe Schlüssel wurde mit anderem Inhalt benutzt.', type: problemType('idempotency-key') });
      if (saved) return { ...saved.response, headers: { ...saved.response.headers, 'Idempotent-Replayed': 'true' } };
    }
    const { value, errors } = validateNoteInput(parseJson(raw));
    if (errors.length) throw new HttpError(422, 'Eingabe ungültig', { detail: `${errors.length} Feld(er) sind ungültig.`, type: problemType('validierung'), errors });
    const note = store.create(identity.subject, value);
    const response = { status: 201, body: publicNote(note), headers: { Location: `${prefix}/notes/${note.id}`, ETag: etagOf(note) } };
    if (key) idempotency.save(identity.subject, key, { print, response });
    return response;
  }

  async function replaceNote(req, identity, id) {
    requireScope(identity, 'notes:write');
    const note = ownedNote(identity, id);
    const condition = req.headers['if-match'];
    if (condition === undefined) throw new HttpError(428, 'Bedingung erforderlich', { detail: 'Senden Sie If-Match mit dem ETag der Notiz, um verlorene Änderungen zu vermeiden.' });
    if (!etagMatches(condition, etagOf(note))) throw new HttpError(412, 'Notiz wurde inzwischen geändert', { detail: 'Laden Sie die Notiz neu und wiederholen Sie die Änderung.', type: problemType('veraltet') });
    const { value, errors } = validateNoteInput(parseJson(await readBody(req)));
    if (errors.length) throw new HttpError(422, 'Eingabe ungültig', { detail: `${errors.length} Feld(er) sind ungültig.`, type: problemType('validierung'), errors });
    const updated = store.update(id, value);
    return { status: 200, body: publicNote(updated), headers: { ETag: etagOf(updated) } };
  }

  function listNotes(url, identity, prefix) {
    requireScope(identity, 'notes:read');
    const limit = parseLimit(url.searchParams.get('limit'));
    const { items, nextCursor } = page(store.listFor(identity.subject), { limit, cursor: url.searchParams.get('cursor') });
    const headers = nextCursor ? { Link: `<${prefix}/notes?limit=${limit}&cursor=${nextCursor}>; rel="next"` } : {};
    return { status: 200, body: { items: items.map(publicNote), nextCursor }, headers };
  }

  function getNote(req, identity, id) {
    requireScope(identity, 'notes:read');
    const note = ownedNote(identity, id);
    const etag = etagOf(note);
    const condition = req.headers['if-none-match'];
    const headers = { ETag: etag, 'Cache-Control': 'private, no-cache' };
    return condition !== undefined && etagMatches(condition, etag) ? { status: 304, headers } : { status: 200, body: publicNote(note), headers };
  }

  function deleteNote(identity, id) {
    requireScope(identity, 'notes:write');
    ownedNote(identity, id);
    store.remove(id);
    return { status: 204 };
  }

  async function route(req) {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/healthz') return { status: 200, body: { status: 'ok' } };
    const match = /^\/(v0|v1)(\/notes(?:\/([^/]+))?)?$/.exec(url.pathname);
    const identity = authenticate(req);
    const decision = limiter.take(identity.subject);
    if (!decision.allowed) throw new HttpError(429, 'Zu viele Anfragen', { detail: `Bitte in ${decision.retryAfterSeconds} Sekunde(n) erneut versuchen.`, headers: { 'Retry-After': String(decision.retryAfterSeconds) } });
    if (!match || !match[2]) throw new HttpError(404, 'Pfad nicht gefunden');
    const prefix = `/${match[1]}`;
    const id = match[3];
    const lifecycle = match[1] === 'v0'
      ? { Deprecation: `@${Math.floor(v0Lifecycle.deprecatedAt / 1000)}`, Sunset: new Date(v0Lifecycle.sunsetAt).toUTCString(), Link: '</v1/notes>; rel="successor-version"' }
      : {};
    const allowed = id ? ['GET', 'PUT', 'DELETE'] : ['GET', 'POST'];
    if (!allowed.includes(req.method)) throw new HttpError(405, 'Methode nicht erlaubt', { headers: { Allow: allowed.join(', ') } });
    let result;
    if (!id) result = req.method === 'GET' ? listNotes(url, identity, prefix) : await createNote(req, identity, prefix);
    else if (req.method === 'GET') result = getNote(req, identity, id);
    else if (req.method === 'PUT') result = await replaceNote(req, identity, id);
    else result = deleteNote(identity, id);
    return { ...result, headers: { ...lifecycle, ...result.headers, ...(lifecycle.Link && result.headers?.Link ? { Link: `${lifecycle.Link}, ${result.headers.Link}` } : {}) } };
  }

  function send(res, { status, body, headers = {} }) {
    const isProblem = status >= 400;
    const text = body === undefined ? '' : JSON.stringify(body);
    res.writeHead(status, {
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
      ...(text ? { 'Content-Type': isProblem ? 'application/problem+json; charset=utf-8' : 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(text) } : {}),
      ...headers,
    });
    res.end(text);
  }

  const server = http.createServer(async (req, res) => {
    try {
      send(res, await route(req));
    } catch (error) {
      if (error instanceof HttpError) return send(res, { status: error.status, body: toProblemBody(error, req.url), headers: error.headers });
      // Unerwartete Fehler: Details gehören ins Protokoll, nicht in die Antwort.
      server.emit('appError', error);
      send(res, { status: 500, body: toProblemBody(new HttpError(500, 'Interner Fehler')) });
    }
  });

  return { server, tokens, store };
}
