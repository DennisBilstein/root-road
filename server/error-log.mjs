// Datensparsames Fehlerprotokoll: Fehler werden nach Fingerabdruck zusammengefasst (Anzahl, erstes und letztes Auftreten).
// Gespeichert werden weder Konto, IP-Adresse, Browserkennung noch Seitenadresse mit Parametern; Texte werden von URL-Parametern,
// E-Mail-Adressen und langen Token-artigen Zeichenfolgen bereinigt. Einträge verfallen nach 30 Tagen, höchstens 500 Zeilen.
import {createHash} from 'node:crypto';
import rateLimit from 'express-rate-limit';

const retentionMs = 30 * 86400000;
const maxRows = 500;
const cleanupIntervalMs = 60000;

export function sanitize(value, max = 200) {
  return String(value ?? '')
    .replace(/https?:\/\/[^\s"'<>)]+/gi, (raw) => { try { return new URL(raw).pathname; } catch { return '[URL]'; } })
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[E-Mail]')
    .replace(/[A-Za-z0-9_-]{32,}/g, '[Token]')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, max);
}

export function installErrorLog({app, db, auth, admin}) {
  db.exec(`CREATE TABLE IF NOT EXISTS error_log(fingerprint TEXT PRIMARY KEY,kind TEXT NOT NULL,message TEXT NOT NULL,source TEXT NOT NULL,count INTEGER NOT NULL,first_seen INTEGER NOT NULL,last_seen INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS error_log_last_seen ON error_log(last_seen)`);
  const upsert = db.prepare(`INSERT INTO error_log(fingerprint,kind,message,source,count,first_seen,last_seen) VALUES(?,?,?,?,1,?,?)
    ON CONFLICT(fingerprint) DO UPDATE SET count=count+1,last_seen=excluded.last_seen`);
  const expire = db.prepare('DELETE FROM error_log WHERE last_seen < ?');
  const cap = db.prepare('DELETE FROM error_log WHERE fingerprint NOT IN (SELECT fingerprint FROM error_log ORDER BY last_seen DESC LIMIT ?)');
  let lastCleanup = 0;

  function record(kind, message, source) {
    const now = Date.now();
    const cleanMessage = sanitize(message) || '(ohne Text)';
    const cleanSource = sanitize(source, 120) || '(unbekannt)';
    const fingerprint = createHash('sha256').update(`${kind}\n${cleanMessage}\n${cleanSource}`).digest('hex').slice(0, 16);
    upsert.run(fingerprint, kind, cleanMessage, cleanSource, now, now);
    if (now - lastCleanup > cleanupIntervalMs) {
      lastCleanup = now;
      expire.run(now - retentionMs);
      cap.run(maxRows);
    }
  }

  // Ohne Anmeldung nutzbar (auch Gäste), deshalb streng begrenzt: kleine Felder, Ratenlimit je Verbindung (ohne die IP zu speichern).
  const clientLimit = rateLimit({windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: 'draft-8', legacyHeaders: false});
  app.post('/api/client-errors', clientLimit, (req, res) => {
    const {message, source, line} = req.body;
    if (typeof message !== 'string' || !message.trim()) return res.status(400).json({error: 'Fehlertext erforderlich.'});
    const where = typeof source === 'string' && source ? `${sanitize(source, 100)}${Number.isInteger(line) && line > 0 ? `:${line}` : ''}` : '';
    record('client', message, where);
    res.status(204).end();
  });

  app.get('/api/admin/errors', auth, admin, (req, res) => {
    res.json({
      retentionDays: retentionMs / 86400000,
      errors: db.prepare('SELECT kind,message,source,count,first_seen AS firstSeen,last_seen AS lastSeen FROM error_log ORDER BY last_seen DESC LIMIT 200').all(),
    });
  });
  app.delete('/api/admin/errors', auth, admin, (req, res) => {
    db.prepare('DELETE FROM error_log').run();
    res.json({ok: true});
  });

  return {recordServerError: (error, route) => record('server', error?.message, route)};
}
