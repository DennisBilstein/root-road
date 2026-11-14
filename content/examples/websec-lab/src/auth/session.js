// Serverseitige Sitzungen: zufällige Kennung, nur der Hash wird gespeichert, neue Kennung nach der Anmeldung, zwei Zeitlimits.
import { createHash, randomBytes } from 'node:crypto';

const hashId = (id) => createHash('sha256').update(id).digest('hex');

export function createSessionStore({ idleMs = 30 * 60_000, absoluteMs = 8 * 3_600_000, now = () => Date.now() } = {}) {
  const sessions = new Map(); // Hash der Kennung -> Daten

  function create(userId) {
    const id = randomBytes(32).toString('base64url'); // 256 Bit Zufall
    const time = now();
    sessions.set(hashId(id), { userId, createdAt: time, lastSeen: time });
    return id;
  }

  function get(id) {
    if (typeof id !== 'string') return undefined;
    const key = hashId(id);
    const session = sessions.get(key);
    if (!session) return undefined;
    const time = now();
    if (time - session.lastSeen > idleMs || time - session.createdAt > absoluteMs) {
      sessions.delete(key);
      return undefined;
    }
    session.lastSeen = time;
    return { userId: session.userId };
  }

  /** Nach Anmeldung oder Rechteänderung: alte Kennung ungültig, neue ausgeben (gegen Session Fixation). */
  function rotate(oldId, userId) {
    if (typeof oldId === 'string') sessions.delete(hashId(oldId));
    return create(userId);
  }

  function destroy(id) {
    if (typeof id === 'string') sessions.delete(hashId(id));
  }

  /** Beim Passwortwechsel alle Sitzungen der Person beenden. */
  function destroyAllFor(userId) {
    for (const [key, session] of sessions) if (session.userId === userId) sessions.delete(key);
  }

  return { create, get, rotate, destroy, destroyAllFor, size: () => sessions.size, hasPlainId: (id) => sessions.has(id) };
}
