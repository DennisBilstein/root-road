// Ausgabe-Kodierung, URL-Prüfung, JSON in Skriptblöcken und Content-Security-Policy mit Nonce.
import { randomBytes } from 'node:crypto';

const HTML_ESCAPES = new Map([['&', '&amp;'], ['<', '&lt;'], ['>', '&gt;'], ['"', '&quot;'], ["'", '&#39;']]);

/** Für Text im HTML-Körper und für Attributwerte in Anführungszeichen. */
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES.get(char) ?? char);
}

/** Erlaubt nur ausdrücklich genannte Schemata; alles andere (javascript:, data:) wird zu "#". */
export function safeUrl(input, allowedSchemes = ['http:', 'https:', 'mailto:']) {
  try {
    const url = new URL(String(input).trim(), 'https://example.invalid/');
    return allowedSchemes.includes(url.protocol) ? url.href : '#';
  } catch {
    return '#';
  }
}

/** JSON für <script type="application/json">: verhindert </script>, <!-- und die Zeilentrenner U+2028/U+2029. */
export function jsonForScript(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

/** Ein Kommentar als HTML: Text kodiert, Link geprüft und kodiert. */
export function renderComment({ author, text, website }) {
  return `<article class="comment"><h3>${escapeHtml(author)}</h3><p>${escapeHtml(text)}</p><a href="${escapeHtml(safeUrl(website))}" rel="nofollow noopener">Website</a></article>`;
}

/** UNSICHER, nur zur Vorführung. */
export function renderCommentUnsafe({ author, text, website }) {
  return `<article class="comment"><h3>${author}</h3><p>${text}</p><a href="${website}">Website</a></article>`;
}

/** Neue Zufallszahl für jede Antwort (nie wiederverwenden, sonst nützt sie einem Angreifer). */
export function newNonce() {
  return randomBytes(16).toString('base64');
}

/** Strikte CSP: Skripte nur mit Nonce, keine Plugins, keine fremde Basis-URL, keine Einbettung in fremden Seiten. */
export function contentSecurityPolicy(nonce) {
  return [
    "default-src 'self'",
    `script-src 'nonce-${nonce}' 'strict-dynamic'`,
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ].join('; ');
}
