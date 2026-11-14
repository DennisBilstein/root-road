// Prüft die Sicherheits-Header einer Antwort gegen eine Mindest-Checkliste und nennt für jeden Punkt eine Einordnung.
const get = (headers, name) => {
  const value = headers instanceof Headers ? headers.get(name) : headers[name];
  return typeof value === 'string' ? value : undefined;
};

const directive = (csp, name) => csp.split(';').map((part) => part.trim()).find((part) => part === name || part.startsWith(`${name} `));

/** Liefert Befunde: { header, status: 'ok' | 'fehlt' | 'schwach', hinweis }. https: true, wenn die Antwort über HTTPS kam. */
export function auditHeaders(headers, { https = false } = {}) {
  const findings = [];
  const add = (header, status, hinweis) => findings.push({ header, status, hinweis });

  const csp = get(headers, 'content-security-policy');
  if (!csp) add('content-security-policy', 'fehlt', 'Schränkt ein, woher Skripte, Bilder und Frames geladen werden dürfen.');
  else {
    const script = directive(csp, 'script-src') ?? directive(csp, 'default-src');
    if (script === undefined) add('content-security-policy', 'schwach', 'Weder script-src noch default-src: Skripte sind nicht eingeschränkt (die CSP schützt dann nicht vor XSS).');
    else if (/'unsafe-inline'/.test(script) && !/'nonce-|'sha(256|384|512)-/.test(script)) add('content-security-policy', 'schwach', "script-src erlaubt 'unsafe-inline' ohne Nonce oder Hash.");
    else if (/'unsafe-eval'/.test(script)) add('content-security-policy', 'schwach', "script-src erlaubt 'unsafe-eval'.");
    else if (!directive(csp, 'object-src') && !directive(csp, 'default-src')) add('content-security-policy', 'schwach', 'object-src fehlt.');
    else add('content-security-policy', 'ok', 'Skriptquellen sind eingeschränkt.');
  }

  const hsts = get(headers, 'strict-transport-security');
  if (!https) add('strict-transport-security', hsts ? 'ok' : 'fehlt', hsts ? 'Vorhanden.' : 'Nur über HTTPS sinnvoll; über HTTP wird er vom Browser ignoriert.');
  else if (!hsts) add('strict-transport-security', 'fehlt', 'Zwingt den Browser, künftig nur HTTPS zu verwenden.');
  else {
    const age = Number(/max-age=(\d+)/i.exec(hsts)?.[1] ?? 0);
    add('strict-transport-security', age >= 31_536_000 ? 'ok' : 'schwach', age >= 31_536_000 ? 'max-age mindestens ein Jahr.' : 'max-age unter einem Jahr.');
  }

  if (get(headers, 'x-content-type-options')?.toLowerCase() === 'nosniff') add('x-content-type-options', 'ok', 'Browser raten den Inhaltstyp nicht.');
  else add('x-content-type-options', 'fehlt', 'nosniff verhindert, dass Browser den Inhaltstyp raten.');

  const referrer = get(headers, 'referrer-policy');
  add('referrer-policy', referrer ? (referrer === 'unsafe-url' ? 'schwach' : 'ok') : 'fehlt', referrer ? 'Vorhanden.' : 'Legt fest, wie viel von der Adresse an andere Seiten gesendet wird.');

  const framing = (csp && directive(csp, 'frame-ancestors')) || get(headers, 'x-frame-options');
  add('frame-ancestors', framing ? 'ok' : 'fehlt', framing ? 'Einbettung in fremde Seiten ist geregelt.' : 'Schützt vor Clickjacking: Einbettung in fremde Seiten regeln.');

  add('permissions-policy', get(headers, 'permissions-policy') ? 'ok' : 'fehlt', 'Schaltet Browser-Funktionen (Kamera, Standort …) ab, die die Seite nicht braucht.');
  add('cross-origin-opener-policy', get(headers, 'cross-origin-opener-policy') ? 'ok' : 'fehlt', 'Trennt das Fenster von fremden Seiten, die es öffnen.');

  const disclosure = get(headers, 'x-powered-by') ?? (/\d/.test(get(headers, 'server') ?? '') ? get(headers, 'server') : undefined);
  if (disclosure) add('x-powered-by/server', 'schwach', `Verrät Technik oder Version: ${disclosure}`);
  return findings;
}
