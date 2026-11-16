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
    return entry.text.replace(/(data-rp-src|href)="(assets\/[A-Za-z0-9._\/-]+\.(?:js|css))"/g, (match, attr, rel) => {
      try { return `${attr}="${rel}?v=${assetVersion(rel)}"`; } catch { return match; }
    });
  }

  function versionedManifest() {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets', 'learning-manifest.json'), 'utf8'));
    manifest.versions = Object.fromEntries([...manifest.files, ...(manifest.data || []), ...Object.values(manifest.bodies || {}), ...(manifest.quiz ? [manifest.quiz] : [])].map((file) => [file, assetVersion(file)]));
    return manifest;
  }

  return { assetVersion, versionedHtml, versionedManifest };
}
