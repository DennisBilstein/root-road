// Inhalts-Hash als Abfrageparameter (?v=…) für Skripte, Styles und Lerndaten. Der Express-Server setzt ihn beim Ausliefern ein,
// der Static-Build (scripts/build-static.mjs) einmalig beim Erzeugen. Weil der Hash aus dem Dateiinhalt entsteht, kann nach einer
// Änderung nie eine alte, „unveränderliche“ Datei hängen bleiben.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

export function createAssetVersions(root) {
  const hashCache = new Map();
  const htmlCache = new Map();

  function assetVersion(rel) {
    if (!/^assets\/[A-Za-z0-9._\/-]+$/.test(rel) || rel.includes('..')) throw new Error('Ungültiger Asset-Pfad');
    const file = path.join(root, rel), st = fs.statSync(file), hit = hashCache.get(file);
    if (hit && hit.mtimeMs === st.mtimeMs && hit.size === st.size) return hit.hash;
    const hash = createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 10);
    hashCache.set(file, { mtimeMs: st.mtimeMs, size: st.size, hash });
    return hash;
  }

  function versionedHtml(name) {
    const file = path.join(root, name), st = fs.statSync(file);
    let entry = htmlCache.get(file);
    if (!entry || entry.mtimeMs !== st.mtimeMs) { entry = { mtimeMs: st.mtimeMs, text: fs.readFileSync(file, 'utf8') }; htmlCache.set(file, entry); }
    const html = withPrerender(entry.text).replace(/(data-rp-src|href|src)="(assets\/[A-Za-z0-9._\/-]+\.(?:js|css))"/g, (match, attr, rel) => {
      try { return `${attr}="${rel}?v=${assetVersion(rel)}"`; } catch { return match; }
    });
    return html.replace('</head>', () => `${preloadLinks(html)}</head>`);
  }

  // Die Startseite eines neuen Besuchers steht vorgerendert im HTML (erzeugt von scripts/build-prerender.mjs), damit der größte sichtbare Inhalt
  // nicht erst nach allen Skripten entsteht. Bis zum App-Start ist sie nicht bedienbar (inert) und für Hilfstechnik als „beschäftigt“ markiert;
  // assets/bootstrap.js entfernt beides, assets/prerender-guard.js blendet sie für Besucher mit Lernstand aus.
  function withPrerender(html) {
    const file = path.join(root, 'content', 'prerender', 'start.html');
    if (!fs.existsSync(file)) return html;
    const empty = '<main class="content" id="content" tabindex="-1"></main>';
    if (!html.includes(empty)) throw new Error('index.html: leeres <main id="content"> für die Vorrenderung nicht gefunden');
    return html.replace(empty, () => `<main class="content" id="content" tabindex="-1" aria-busy="true" inert data-rp-vorschau>${fs.readFileSync(file, 'utf8')}</main>`);
  }

  // Die Skripte stehen als data-rp-src im HTML und werden erst von bootstrap.js geladen; die Lernskripte und Datensätze kennt erst das Manifest.
  // Preload-Links im HTML starten alle Downloads sofort und parallel zu bootstrap.js (sonst: HTML → bootstrap.js → Manifest → Lerndaten).
  // Die URLs tragen denselben ?v-Hash wie die späteren Abrufe, damit der Browser die vorgeladenen Dateien wiederverwendet.
  function preloadLinks(html) {
    const manifest = versionedManifest();
    const scripts = [...html.matchAll(/data-rp-src="(assets\/[A-Za-z0-9._\/-]+\.js\?v=[0-9a-f]{10})"/g)].map((m) => m[1]).filter((src) => !src.startsWith('assets/script-01.js?'));
    const learning = manifest.files.map((file) => `${file}?v=${manifest.versions[file]}`);
    const data = (manifest.data || []).map((file) => `${file}?v=${manifest.versions[file]}`);
    return [
      '<link rel="preload" href="assets/learning-manifest.json" as="fetch" crossorigin>',
      ...[...scripts, ...learning].map((src) => `<link rel="preload" href="${src}" as="script">`),
      ...data.map((src) => `<link rel="preload" href="${src}" as="fetch" crossorigin>`),
    ].join('\n');
  }

  function versionedManifest() {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets', 'learning-manifest.json'), 'utf8'));
    manifest.versions = Object.fromEntries([...manifest.files, ...(manifest.data || []), ...Object.values(manifest.bodies || {}), ...(manifest.quiz ? [manifest.quiz] : []), ...(manifest.exercises ? [manifest.exercises] : [])].map((file) => [file, assetVersion(file)]));
    return manifest;
  }

  return { assetVersion, versionedHtml, versionedManifest };
}
