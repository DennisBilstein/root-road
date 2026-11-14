import { test } from 'node:test';
import assert from 'node:assert/strict';
import { auditHeaders } from '../src/headers/audit.js';
import { scanText } from '../src/hygiene/secrets.js';
import { sanitizeLogValue, formatUnsafe, formatSafe } from '../src/hygiene/logsafe.js';

const good = {
  'content-security-policy': "default-src 'self'; script-src 'nonce-abc' 'strict-dynamic'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'cross-origin-opener-policy': 'same-origin',
};
const statusOf = (findings, header) => findings.find((f) => f.header === header)?.status;

test('Header-Prüfung: vollständige Antwort über HTTPS', () => {
  const findings = auditHeaders(good, { https: true });
  assert.deepEqual(findings.filter((f) => f.status !== 'ok'), []);
});

test('Header-Prüfung: fehlende und schwache Werte', () => {
  const none = auditHeaders({}, { https: true });
  for (const header of ['content-security-policy', 'strict-transport-security', 'x-content-type-options', 'referrer-policy', 'frame-ancestors', 'permissions-policy', 'cross-origin-opener-policy']) assert.equal(statusOf(none, header), 'fehlt', header);
  assert.equal(statusOf(auditHeaders({ ...good, 'content-security-policy': "script-src 'unsafe-inline'" }), 'content-security-policy'), 'schwach');
  assert.equal(statusOf(auditHeaders({ ...good, 'content-security-policy': "script-src 'self' 'unsafe-eval'; object-src 'none'" }), 'content-security-policy'), 'schwach');
  assert.equal(statusOf(auditHeaders({ ...good, 'content-security-policy': "script-src 'nonce-a' 'unsafe-inline'; object-src 'none'" }), 'content-security-policy'), 'ok', 'unsafe-inline mit Nonce wird von neueren Browsern ignoriert');
  const noScript = auditHeaders({ ...good, 'content-security-policy': "frame-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'" });
  assert.equal(statusOf(noScript, 'content-security-policy'), 'schwach', 'ohne script-src/default-src sind Skripte nicht eingeschränkt');
  assert.match(noScript.find((f) => f.header === 'content-security-policy')?.hinweis ?? '', /nicht eingeschränkt/);
  assert.equal(statusOf(auditHeaders({ ...good, 'strict-transport-security': 'max-age=3600' }, { https: true }), 'strict-transport-security'), 'schwach');
  assert.equal(statusOf(auditHeaders({ ...good, 'referrer-policy': 'unsafe-url' }), 'referrer-policy'), 'schwach');
  const leaky = auditHeaders({ ...good, 'x-powered-by': 'Express', server: 'nginx/1.27.0' });
  assert.equal(statusOf(leaky, 'x-powered-by/server'), 'schwach');
  assert.equal(statusOf(auditHeaders({ ...good, server: 'nginx' }), 'x-powered-by/server'), undefined, 'Name ohne Version ist unkritisch');
});

test('Header-Prüfung: HSTS über HTTP wird nicht als Fehler gewertet, Headers-Objekt wird gelesen', () => {
  const http = { ...good };
  delete http['strict-transport-security'];
  assert.equal(statusOf(auditHeaders(http, { https: false }), 'strict-transport-security'), 'fehlt');
  assert.match(auditHeaders(http, { https: false }).find((f) => f.header === 'strict-transport-security')?.hinweis ?? '', /Nur über HTTPS/);
  assert.equal(statusOf(auditHeaders(new Headers(good), { https: true }), 'x-content-type-options'), 'ok');
});

test('Geheimnis-Suche: findet Muster, ignoriert Platzhalter, gibt nichts vollständig aus', () => {
  // Erfundene Werte, zur Laufzeit zusammengesetzt: So schlägt der Geheimnis-Scan des Repositorys nicht auf den Testtext an.
  const fakeToken = `ghp_${'a1B2'.repeat(9)}`;
  const fakeAwsId = `AKIA${'IOSFODNN7EXAMPLE'}`;
  const fakeKeyHeader = `-----BEGIN OPENSSH ${'PRIVATE KEY'}-----`;
  const fakePassword = ['hunter2', 'hunter2', 'hunter2'].join('-');
  const text = [
    `const key = "${fakeAwsId}";`,
    `const t = '${fakeToken}';`,
    `password = "${fakePassword}"`,
    fakeKeyHeader,
    'API_KEY="${API_KEY}"',
    'token: "change-me"',
    'const title = "Hallo Welt";',
  ].join('\n');
  const findings = scanText(text, 'beispiel.js');
  assert.deepEqual(findings.map((f) => `${f.line}:${f.rule}`), ['1:AWS-Zugangsschlüssel-ID', '2:GitHub-Token', '3:Allgemeine Zuweisung', '4:Privater Schlüssel']);
  assert.ok(findings.every((f) => f.preview.length <= 5 && !JSON.stringify(f).includes(fakeToken)), 'nur die ersten vier Zeichen');
  assert.deepEqual(scanText('nichts Besonderes\nhier auch nicht', 'x'), []);
});

test('Log-Einträge: Zeilenumbrüche erzeugen keine erfundenen Zeilen', () => {
  const evil = 'ada\n2026-11-14T10:00:00Z INFO Anmeldung erfolgreich für root';
  assert.equal(formatUnsafe(evil).split('\n').length, 2, 'unsicher: zwei Zeilen');
  assert.equal(formatSafe(evil).split('\n').length, 1, 'sicher: eine Zeile');
  assert.ok(formatSafe(evil).includes('\\u000a'));
  assert.equal(sanitizeLogValue('a\r\nb\tc\u0000'), 'a\\u000d\\u000ab\\u0009c\\u0000');
  assert.equal(sanitizeLogValue('x'.repeat(10), 5), 'xxxxx…[5 Zeichen gekürzt]');
  assert.equal(sanitizeLogValue(undefined), 'undefined');
});
