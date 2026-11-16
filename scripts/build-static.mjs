// Erzeugt eine statische Kopie der App (ohne Express-Server, Konten und Admin) für Hosts wie Netlify: node scripts/build-static.mjs [Zielordner]
// Ohne Server antwortet /api/me mit 404; die App erkennt das und läuft im Offline-Modus (Fortschritt nur im Browser).
// Hashes (?v=) und Sicherheitsheader kommen aus denselben Modulen wie beim Server (server/asset-versions.mjs, server/web-policy.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAssetVersions } from '../server/asset-versions.mjs';
import { mainPolicy, sandboxPolicy, sandboxPath, permissionsPolicy } from '../server/web-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.resolve(root, process.argv[2] || 'dist-static');
if (out === root || !out.startsWith(root + path.sep)) throw new Error(`Zielordner muss ein Unterordner des Projekts sein: ${out}`);

// Nur für den Server oder Entwicklung gedacht: Admin-Oberfläche und die Quell-Stylesheets (die App lädt das Bündel app.css).
const serverOnly = /^assets\/(?:admin[^/]*|style-\d+\.css)$/;

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(path.join(root, 'assets'), path.join(out, 'assets'), {
  recursive: true,
  filter: (src) => !serverOnly.test(path.relative(root, src).split(path.sep).join('/')),
});

const versions = createAssetVersions(root);
fs.writeFileSync(path.join(out, 'index.html'), versions.versionedHtml('index.html'));
fs.writeFileSync(path.join(out, 'assets', 'learning-manifest.json'), JSON.stringify(versions.versionedManifest()));

// Netlify führt passende Regeln zusammen und würde zwei CSP-Header kombinieren. Deshalb sind die Pfade der Regeln überschneidungsfrei:
// die Haupt-CSP nur auf / und /index.html, die Sandbox-CSP nur auf der Sandbox-Seite.
// noindex: Impressum und Datenschutzerklärung sind Vorlagen (juristisch ungeprüft, Anschrift fehlt); so lange sollen Suchmaschinen die Seite nicht listen.
const rule = (route, headers) => `${route}\n${Object.entries(headers).map(([name, value]) => `  ${name}: ${value}`).join('\n')}\n`;
const document = { 'X-Frame-Options': 'DENY', 'Content-Security-Policy': mainPolicy };
const headers = [
  rule('/*', {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'same-origin',
    'Permissions-Policy': permissionsPolicy,
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'X-Robots-Tag': 'noindex',
  }),
  rule('/', document),
  rule('/index.html', document),
  rule(sandboxPath, { 'X-Frame-Options': 'SAMEORIGIN', 'Content-Security-Policy': sandboxPolicy }),
  rule('/assets/fonts/*', { 'Cache-Control': 'public, max-age=2592000' }),
  // Netlify kennt .webmanifest nicht und würde application/octet-stream senden.
  rule('/assets/manifest.webmanifest', { 'Content-Type': 'application/manifest+json' }),
].join('\n');
fs.writeFileSync(path.join(out, '_headers'), headers);

const count = (dir) => fs.readdirSync(dir, { withFileTypes: true }).reduce((sum, entry) => sum + (entry.isDirectory() ? count(path.join(dir, entry.name)) : 1), 0);
console.log(`Static-Build: ${path.relative(root, out)}/ mit ${count(out)} Dateien.`);
