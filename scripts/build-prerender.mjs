// Erzeugt content/prerender/start.html: den oberen Teil der Startseite (Lernmission und Lernpfad-Auswahl) für einen neuen Besucher, so wie die App ihn rendert.
// server/asset-versions.mjs setzt das Fragment in index.html ein. Die Datei wird aus dem echten Rendering gewonnen (frischer Browser,
// leerer Speicher, eigener Server mit leerem Datenverzeichnis), damit sie nicht von Hand mit den Lektionszahlen auseinanderläuft.
// Aufruf: node scripts/build-prerender.mjs [--verify]  (--verify schreibt nichts und endet mit Fehler, wenn die Datei veraltet ist)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'content', 'prerender', 'start.html');
const verify = process.argv.includes('--verify');

const port = await new Promise((resolve, reject) => {
  const probe = net.createServer().once('error', reject).listen(0, '127.0.0.1', () => { const { port } = probe.address(); probe.close(() => resolve(port)); });
});
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rp-prerender-'));
const server = spawn(process.execPath, ['server.mjs'], { cwd: root, env: { ...process.env, PORT: String(port), ROOTPFAD_DATA_DIR: dataDir }, stdio: 'ignore' });
let browser;
try {
  const url = `http://127.0.0.1:${port}/`;
  for (let i = 0; ; i++) {
    try { if ((await fetch(url)).ok) break; } catch { /* Server startet noch */ }
    if (i > 100) throw new Error('Server nicht erreichbar');
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  await page.goto(url);
  await page.waitForFunction(() => window.RP_APP_READY === true || window.RP_APP_ERROR);
  if (await page.evaluate(() => window.RP_APP_ERROR)) throw new Error('App-Start fehlgeschlagen: ' + await page.evaluate(() => window.RP_APP_ERROR));
  await page.waitForTimeout(500);
  // Nur bis einschließlich der Lernpfad-Auswahl: Alles danach hängt von Datum und Uhrzeit ab (Gruß, Tagesziel, tägliches Dojo) und würde
  // im statischen HTML veralten. Dieser Teil enthält das LCP-Element und liegt am Seitenanfang; was die App darunter ergänzt, verschiebt ihn nicht.
  const html = await page.evaluate(() => {
    const parts = [];
    for (const element of document.getElementById('content').children) {
      parts.push(element.outerHTML);
      if (element.matches('.rp-path-picker')) return parts.join('');
    }
    return '';
  });
  if (!html.includes('rp-path-picker')) throw new Error('Startseite ohne Lernpfad-Auswahl gerendert');
  const next = html + '\n';
  if (verify) {
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== next) { console.error('content/prerender/start.html ist veraltet: node scripts/build-prerender.mjs'); process.exitCode = 1; }
    else console.log('Vorrenderung aktuell.');
  } else {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, next);
    console.log(`content/prerender/start.html geschrieben (${html.length} Zeichen).`);
  }
} finally {
  await browser?.close();
  server.kill();
  fs.rmSync(dataDir, { recursive: true, force: true });
}
