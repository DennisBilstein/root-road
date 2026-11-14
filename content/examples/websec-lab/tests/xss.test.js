import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, safeUrl, jsonForScript, renderComment, renderCommentUnsafe, newNonce, contentSecurityPolicy } from '../src/xss/encode.js';

test('escapeHtml: fünf Zeichen, auch Zahlen und null', () => {
  assert.equal(escapeHtml(`<b>"x" & 'y'</b>`), '&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;');
  assert.equal(escapeHtml(42), '42');
  assert.equal(escapeHtml(null), 'null');
  assert.equal(escapeHtml(''), '');
  assert.equal(escapeHtml('&amp;'), '&amp;amp;', 'kein doppeltes Ersetzen vermeiden: Kodierung gilt für Rohtext');
});

test('safeUrl: javascript: und data: werden abgelehnt', () => {
  assert.equal(safeUrl('https://example.org/a?b=1'), 'https://example.org/a?b=1');
  assert.equal(safeUrl('mailto:a@example.org'), 'mailto:a@example.org');
  assert.equal(safeUrl('javascript:alert(1)'), '#');
  assert.equal(safeUrl('  JaVaScRiPt:alert(1)'), '#');
  assert.equal(safeUrl('data:text/html,<script>1</script>'), '#');
  assert.equal(safeUrl('java\tscript:alert(1)'), '#', 'Tabulator im Schema wird vom URL-Parser entfernt und trotzdem erkannt');
  assert.equal(safeUrl('/relativ'), 'https://example.invalid/relativ');
  assert.equal(safeUrl('http://['), '#');
});

test('Kommentar: der Text kommt kodiert an, der Link ist geprüft', () => {
  const evil = { author: '<img src=x onerror=alert(1)>', text: '</p><script>alert(1)</script>', website: 'javascript:alert(1)' };
  const safe = renderComment(evil);
  assert.ok(!safe.includes('<script>'));
  assert.ok(!safe.includes('<img'));
  assert.ok(safe.includes('href="#"'));
  assert.ok(safe.includes('&lt;img src=x onerror=alert(1)&gt;'));
  const unsafe = renderCommentUnsafe(evil);
  assert.ok(unsafe.includes('<script>alert(1)</script>'), 'unsicher: das Skript steht im HTML');
});

test('Attribut: ohne Kodierung bricht ein Anführungszeichen aus dem Wert aus', () => {
  const website = 'https://example.org/" onmouseover="alert(1)';
  assert.ok(renderCommentUnsafe({ author: 'a', text: 't', website }).includes('onmouseover="alert(1)'));
  const safe = renderComment({ author: 'a', text: 't', website });
  assert.ok(!safe.includes('onmouseover="alert(1)'), 'sicher: das Anführungszeichen ist kodiert');
});

test('JSON im Skriptblock: </script> und Zeilentrenner werden entschärft', () => {
  const text = jsonForScript({ note: '</script><script>alert(1)</script>', sep: 'a\u2028b' });
  assert.ok(!text.includes('</script>'));
  assert.ok(!text.includes('<'));
  assert.ok(!text.includes('\u2028'));
  assert.deepEqual(JSON.parse(text), { note: '</script><script>alert(1)</script>', sep: 'a\u2028b' }, 'die Daten bleiben unverändert lesbar');
});

test('CSP: Nonce pro Antwort, strikte Grundregeln', () => {
  const nonces = new Set(Array.from({ length: 1000 }, () => newNonce()));
  assert.equal(nonces.size, 1000, 'keine Wiederholung');
  const nonce = newNonce();
  assert.equal(Buffer.from(nonce, 'base64').length, 16, '128 Bit Zufall');
  const csp = contentSecurityPolicy(nonce);
  assert.ok(csp.includes(`script-src 'nonce-${nonce}' 'strict-dynamic'`));
  assert.ok(csp.includes("object-src 'none'") && csp.includes("base-uri 'none'") && csp.includes("frame-ancestors 'none'"));
  assert.ok(!csp.includes('unsafe-inline') && !csp.includes('unsafe-eval'));
});
