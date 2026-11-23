/* Werkstattaufgaben der Spur websec. Wird erst geladen, wenn die Spur in der Werkstatt geöffnet wird. */
(function(){
var W=window.RP_WS,L=W.L,need=W.need,bad=W.bad;
W.add('websec',[
{id:'websec-w1',modules:['ws-m1'],level:'schwer',type:'run',language:'javascript',functionName:'escapeHtml',functionNames:['escapeHtml','safeRedirect'],
  title:'Ausgabe kodieren und Weiterleitungen absichern',
  text:'Implementiere die zwei Schutzfunktionen, die XSS und Open Redirect verhindern.',
  details:['escapeHtml(value): wandelt & < > " \' in &amp; &lt; &gt; &quot; &#39; um (& zuerst!). null und undefined ergeben "", andere Werte werden zuerst mit String(value) in Text verwandelt.','safeRedirect(target, allowedHosts): gibt target zurück, wenn es ein relativer Pfad ist (beginnt mit genau einem "/", nicht mit "//" und nicht mit "/\\"), oder eine http/https-Adresse, deren hostname exakt in allowedHosts steht. In allen anderen Fällen (auch bei Nicht-Text, leerem Text, javascript:-Adressen oder ähnlich aussehenden Hosts) gib "/" zurück.','Nutze new URL(target) zum Zerlegen, nicht Teilstring-Suche oder includes.'],
  starter:L('function escapeHtml(value) {','  return value;','}','','function safeRedirect(target, allowedHosts) {','  return target;','}'),
  cases:[
    {name:'Skript-Tag',fn:'escapeHtml',args:['<script>alert("x")</script>'],expected:'&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'},
    {name:'Und-Zeichen zuerst',fn:'escapeHtml',args:['a & b <'],expected:'a &amp; b &lt;'},
    {name:'Apostroph',fn:'escapeHtml',args:["it's"],expected:'it&#39;s'},
    {name:'kein doppeltes Kodieren der eigenen Entitäten',fn:'escapeHtml',args:['&lt;'],expected:'&amp;lt;'},
    {name:'null und Zahl',fn:'escapeHtml',args:[null],expected:''},
    {name:'Zahl wird Text',fn:'escapeHtml',args:[42],expected:'42'},
    {name:'relativer Pfad',fn:'safeRedirect',args:['/home?tab=1',['app.example.com']],expected:'/home?tab=1'},
    {name:'protokollrelative Adresse',fn:'safeRedirect',args:['//evil.example',['app.example.com']],expected:'/'},
    {name:'Backslash-Trick',fn:'safeRedirect',args:['/\\evil.example',['app.example.com']],expected:'/'},
    {name:'erlaubter Host',fn:'safeRedirect',args:['https://app.example.com/x',['app.example.com']],expected:'https://app.example.com/x'},
    {name:'erlaubter Host mit Port',fn:'safeRedirect',args:['http://app.example.com:8080/x',['app.example.com']],expected:'http://app.example.com:8080/x'},
    {name:'fremder Host',fn:'safeRedirect',args:['https://evil.example/',['app.example.com']],expected:'/'},
    {name:'Host als Präfix',fn:'safeRedirect',args:['https://app.example.com.evil.example/',['app.example.com']],expected:'/'},
    {name:'Zugangsdaten-Trick',fn:'safeRedirect',args:['https://app.example.com@evil.example/',['app.example.com']],expected:'/'},
    {name:'javascript-Adresse',fn:'safeRedirect',args:['javascript:alert(1)',['app.example.com']],expected:'/'},
    {name:'leer und kein Text',fn:'safeRedirect',args:[null,['app.example.com']],expected:'/'},
    {name:'ohne Schrägstrich',fn:'safeRedirect',args:['home',['app.example.com']],expected:'/'}
  ],
  rules:[
    bad(/\bvar\b/,'var ist veraltet – nutze const oder let.'),
    bad(/\binnerHTML\b|\beval\s*\(|\bnew\s+Function\s*\(/,'Hier wird nichts als HTML oder Code ausgeführt.'),
    bad(/\.includes\s*\(\s*(?:host|target|hostname)|\.indexOf\s*\(|\.startsWith\s*\(\s*["']https?:/,'Teilstring-Prüfungen lassen sich mit ähnlich aussehenden Adressen austricksen. Zerlege mit new URL und vergleiche den hostname exakt.')
  ],
  solution:L('function escapeHtml(value) {','  if (value === null || value === undefined) return "";','  return String(value)','    .replace(/&/g, "&amp;")','    .replace(/</g, "&lt;")','    .replace(/>/g, "&gt;")','    .replace(/"/g, "&quot;")','    .replace(/\'/g, "&#39;");','}','','function safeRedirect(target, allowedHosts) {','  if (typeof target !== "string" || target === "") return "/";','  if (target.startsWith("/")) {','    return target.startsWith("//") || target.startsWith("/\\\\") ? "/" : target;','  }','  try {','    const url = new URL(target);','    const web = url.protocol === "https:" || url.protocol === "http:";','    return web && url.username === "" && allowedHosts.includes(url.hostname) ? target : "/";','  } catch {','    return "/";','  }','}'),
  hint:'Kodiere beim AUSGEBEN, passend zum Ziel (hier HTML). Bei Weiterleitungen gilt: Erlaube nur, was du ausdrücklich kennst (Allowlist), und zerlege Adressen mit einem echten Parser.',
  why:'XSS und Open Redirect entstehen, wenn Eingaben als Code oder als Ziel vertraut werden. Kodierung und Allowlist machen aus Fremddaten wieder harmlose Daten.'},
{id:'websec-w2',modules:['ws-m2'],level:'schwer',type:'write',language:'javascript',rows:40,
  title:'Header, Cookies und Passwort-Hashing',
  text:'Schreibe security.js (ES-Modul) mit einer Middleware für Sicherheits-Header, den Sitzungs-Cookie-Optionen und Funktionen zum Hashen und Prüfen von Passwörtern.',
  details:['import { randomBytes, scrypt, timingSafeEqual } from "node:crypto"; und import { promisify } from "node:util"; const scryptAsync = promisify(scrypt);','export function securityHeaders(req, res, next): erzeugt pro Antwort ein nonce (randomBytes(16).toString("base64")), legt es in res.locals.cspNonce ab und setzt mit res.setHeader: Content-Security-Policy (default-src \'self\'; script-src \'self\' \'nonce-${nonce}\'; object-src \'none\'; base-uri \'none\'; frame-ancestors \'none\'), Strict-Transport-Security (max-age=63072000; includeSubDomains), X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin. Danach next().','export const sessionCookie = Object.freeze({ name: "__Host-sid", options: { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 3_600_000 } }).','export async function hashPassword(password): salt = randomBytes(16), hash = await scryptAsync(password, salt, 64); Ergebnis "scrypt$" + salt.toString("hex") + "$" + hash.toString("hex").','export async function verifyPassword(password, stored): zerlegt stored mit split("$"), berechnet den Hash mit dem Salt neu und vergleicht mit timingSafeEqual (nie mit ===).','Kein unsafe-inline, kein md5/sha1 für Passwörter, kein Math.random für Zufall.'],
  starter:L('// Schreibe hier die Datei security.js','',''),
  rules:[
    need('Importe aus node:crypto und node:util',/\bimport\s*\{\s*randomBytes\s*,\s*scrypt\s*,\s*timingSafeEqual\s*\}\s*from\s*["']node:crypto["'][\s\S]*\bimport\s*\{\s*promisify\s*\}\s*from\s*["']node:util["']/),
    need('scryptAsync = promisify(scrypt)',/\bconst\s+scryptAsync\s*=\s*promisify\s*\(\s*scrypt\s*\)/),
    need('export function securityHeaders',/\bexport\s+function\s+securityHeaders\s*\(\s*req\s*,\s*res\s*,\s*next\s*\)/),
    need('nonce aus randomBytes(16)',/\bconst\s+nonce\s*=\s*randomBytes\s*\(\s*16\s*\)\s*\.\s*toString\s*\(\s*["']base64["']\s*\)/),
    need('res.locals.cspNonce',/\bres\s*\.\s*locals\s*\.\s*cspNonce\s*=\s*nonce\b/),
    need('Content-Security-Policy mit Nonce',/setHeader\s*\(\s*["']Content-Security-Policy["']\s*,\s*`[^`]*default-src 'self'[^`]*script-src 'self' 'nonce-\$\{nonce\}'[^`]*object-src 'none'[^`]*base-uri 'none'[^`]*frame-ancestors 'none'[^`]*`\s*\)/),
    need('Strict-Transport-Security',/setHeader\s*\(\s*["']Strict-Transport-Security["']\s*,\s*["']max-age=63072000;\s*includeSubDomains["']\s*\)/),
    need('X-Content-Type-Options nosniff',/setHeader\s*\(\s*["']X-Content-Type-Options["']\s*,\s*["']nosniff["']\s*\)/),
    need('Referrer-Policy',/setHeader\s*\(\s*["']Referrer-Policy["']\s*,\s*["']strict-origin-when-cross-origin["']\s*\)/),
    need('next() am Ende',/\bnext\s*\(\s*\)\s*;/),
    need('Cookie-Name mit __Host-',/\bname\s*:\s*["']__Host-sid["']/),
    need('Cookie-Optionen',/\bhttpOnly\s*:\s*true\b[\s\S]*\bsecure\s*:\s*true\b[\s\S]*\bsameSite\s*:\s*["']lax["'][\s\S]*\bpath\s*:\s*["']\/["']/),
    need('hashPassword mit scrypt und Salt',/\bexport\s+async\s+function\s+hashPassword\s*\(\s*password\s*\)[\s\S]*randomBytes\s*\(\s*16\s*\)[\s\S]*await\s+scryptAsync\s*\(\s*password\s*,\s*salt\s*,\s*64\s*\)/),
    need('Ausgabeformat scrypt$salt$hash',/["']scrypt\$["']\s*\+[\s\S]*toString\s*\(\s*["']hex["']\s*\)\s*\+\s*["']\$["']\s*\+[\s\S]*toString\s*\(\s*["']hex["']\s*\)/),
    need('verifyPassword mit timingSafeEqual',/\bexport\s+async\s+function\s+verifyPassword\s*\(\s*password\s*,\s*stored\s*\)[\s\S]*split\s*\(\s*["']\$["']\s*\)[\s\S]*timingSafeEqual\s*\(/),
    bad(/unsafe-inline|unsafe-eval/,'unsafe-inline hebelt den XSS-Schutz der CSP aus. Nutze ein Nonce.'),
    bad(/\bcreateHash\s*\(\s*["'](?:md5|sha1|sha256)["']\s*\)/,'Schnelle Hashes (MD5, SHA-1, SHA-256) sind für Passwörter ungeeignet: Nutze scrypt, argon2 oder bcrypt.'),
    bad(/Math\s*\.\s*random\s*\(/,'Math.random ist vorhersagbar. Nutze randomBytes aus node:crypto.'),
    bad(/\bstored[\s\S]{0,80}===|===[\s\S]{0,40}\bstored\b|\.equals\s*\(/,'Vergleiche Hashes mit timingSafeEqual: === verrät über die Laufzeit, wie viele Zeichen stimmen.'),
    bad(/sameSite\s*:\s*["']none["']|secure\s*:\s*false|httpOnly\s*:\s*false/i,'Diese Cookie-Werte schwächen die Sitzung. Nutze httpOnly, secure und SameSite lax oder strict.')
  ],
  solution:L('import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";','import { promisify } from "node:util";','','const scryptAsync = promisify(scrypt);','','export function securityHeaders(req, res, next) {','  const nonce = randomBytes(16).toString("base64");','  res.locals.cspNonce = nonce;','  res.setHeader(','    "Content-Security-Policy",','    `default-src \'self\'; script-src \'self\' \'nonce-${nonce}\'; object-src \'none\'; base-uri \'none\'; frame-ancestors \'none\'`','  );','  res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains");','  res.setHeader("X-Content-Type-Options", "nosniff");','  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");','  next();','}','','export const sessionCookie = Object.freeze({','  name: "__Host-sid",','  options: { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 3_600_000 },','});','','export async function hashPassword(password) {','  const salt = randomBytes(16);','  const hash = await scryptAsync(password, salt, 64);','  return "scrypt$" + salt.toString("hex") + "$" + hash.toString("hex");','}','','export async function verifyPassword(password, stored) {','  const [scheme, saltHex, hashHex] = stored.split("$");','  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;','  const expected = Buffer.from(hashHex, "hex");','  const actual = await scryptAsync(password, Buffer.from(saltHex, "hex"), expected.length);','  return timingSafeEqual(actual, expected);','}'),
  hint:'Das Nonce ist ein Einmalwert pro Antwort: Nur Skripte, die es tragen, laufen. Passwort-Hashes müssen absichtlich langsam sein und ein eigenes Salt haben.',
  why:'Header, Cookie-Flags und ein langsamer Passwort-Hash sind die drei Schichten, die einen Angriff nach dem anderen ausbremsen: XSS, Sitzungsklau und Auslesen der Datenbank.'}
]);
})();
