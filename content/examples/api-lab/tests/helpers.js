import { once } from 'node:events';
import { createApp } from '../src/app.js';

/** Startet die API auf einem freien Port; Zeit ist über clock.advance(ms) steuerbar. */
export async function startApi(options = {}) {
  const clock = { now: Date.UTC(2026, 10, 14, 12, 0, 0) };
  const app = createApp({ clock: () => clock.now, ...options });
  app.server.listen(0, '127.0.0.1');
  await once(app.server, 'listening');
  const base = `http://127.0.0.1:${app.server.address().port}`;
  const issue = (subject = 'ada', scopes = ['notes:read', 'notes:write'], ttlMs = 3_600_000) => app.tokens.issue(subject, scopes, ttlMs);
  return {
    app, base, issue,
    advance: (ms) => { clock.now += ms; },
    close: () => new Promise((resolve) => { app.server.close(resolve); app.server.closeAllConnections(); }),
  };
}

/** Kleiner Client: sendet JSON und gibt Status, Header und den gelesenen Rumpf zurück. */
export async function call(api, method, path, { token, json, headers = {}, raw } = {}) {
  const response = await fetch(`${api.base}${path}`, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(json !== undefined || raw !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: raw ?? (json === undefined ? undefined : JSON.stringify(json)),
  });
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : undefined; } catch { body = text; }
  return { status: response.status, headers: response.headers, body };
}
