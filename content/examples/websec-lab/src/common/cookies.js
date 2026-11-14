// Cookie-Attribute an einer Stelle: sichere Standardwerte, Namen und Werte werden geprüft.
const TOKEN = /^[A-Za-z0-9!#$%&'*+\-.^_`|~]+$/;
const VALUE = /^[A-Za-z0-9\-._~+/=]*$/;

/**
 * Baut den Set-Cookie-Wert. Standard: HttpOnly (kein Zugriff per JavaScript), Secure (nur über HTTPS),
 * SameSite=Lax (nicht bei fremden POST-Anfragen) und Path=/. Der Präfix __Host- erzwingt Secure, Path=/ und kein Domain-Attribut.
 */
export function buildCookie(name, value, { maxAgeSeconds, sameSite = 'Lax', secure = true, httpOnly = true } = {}) {
  if (!TOKEN.test(name)) throw new TypeError('Ungültiger Cookie-Name');
  if (!VALUE.test(value)) throw new TypeError('Ungültiger Cookie-Wert');
  if (!['Strict', 'Lax', 'None'].includes(sameSite)) throw new TypeError('SameSite muss Strict, Lax oder None sein');
  if (sameSite === 'None' && !secure) throw new TypeError('SameSite=None braucht Secure');
  if (name.startsWith('__Host-') && !secure) throw new TypeError('__Host- braucht Secure');
  const parts = [`${name}=${value}`, 'Path=/', `SameSite=${sameSite}`];
  if (secure) parts.push('Secure');
  if (httpOnly) parts.push('HttpOnly');
  if (maxAgeSeconds !== undefined) {
    if (!Number.isInteger(maxAgeSeconds) || maxAgeSeconds < 0) throw new RangeError('maxAgeSeconds muss eine ganze Zahl >= 0 sein');
    parts.push(`Max-Age=${maxAgeSeconds}`);
  }
  return parts.join('; ');
}

export function parseCookies(header) {
  const result = new Map();
  for (const piece of (header ?? '').split(';')) {
    const index = piece.indexOf('=');
    if (index < 1) continue;
    const name = piece.slice(0, index).trim();
    if (!result.has(name)) result.set(name, piece.slice(index + 1).trim()); // erster Wert gewinnt
  }
  return result;
}
