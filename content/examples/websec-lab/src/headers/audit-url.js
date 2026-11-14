// Aufruf: node src/headers/audit-url.js URL   (prüft Header einer Seite; nur eigene Systeme prüfen)
import { auditHeaders } from './audit.js';

const target = process.argv[2];
if (!target) {
  process.stderr.write('Aufruf: node src/headers/audit-url.js URL\n');
  process.exitCode = 64;
} else {
  const url = new URL(target);
  const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(5000) });
  const findings = auditHeaders(response.headers, { https: url.protocol === 'https:' });
  console.log(`${url.origin}  Status ${response.status}`);
  for (const f of findings) console.log(`${f.status.padEnd(7)} ${f.header}${f.status === 'ok' ? '' : ' – ' + f.hinweis}`);
  process.exitCode = findings.some((f) => f.status !== 'ok') ? 1 : 0;
}
