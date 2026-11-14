import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Prüft die Lab-Dateien unter content/examples/html-css-lab/vertiefung/, auf die sich die Lektionen html-m2-* und css-m2-* beziehen.
const lab = path.resolve('content/examples/html-css-lab/vertiefung');
const url = (file) => pathToFileURL(path.join(lab, file)).href;
const read = (file) => fs.readFileSync(path.join(lab, file), 'utf8');

const luminance = ([r, g, b]) => {
  const c = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const rgb = (value) => value.match(/[\d.]+/g).slice(0, 3).map(Number);

test.describe('CSS · Tokens und Dunkelmodus', () => {
  for (const scheme of ['light', 'dark']) {
    test(`Kontrast der Rollen im ${scheme}-Modus erfüllt WCAG 2.2 AA`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(url('tokens.html'));
      const colors = await page.evaluate(() => {
        const style = (selector, property) => getComputedStyle(document.querySelector(selector))[property];
        return {
          text: style('p', 'color'), page: style('body', 'backgroundColor'), surface: style('.card', 'backgroundColor'),
          link: style('a', 'color'), border: style('.card', 'borderTopColor'),
          buttonText: style('.button', 'color'), buttonBackground: style('.button', 'backgroundColor'),
        };
      });
      expect(contrast(rgb(colors.text), rgb(colors.surface))).toBeGreaterThanOrEqual(4.5);
      expect(contrast(rgb(colors.link), rgb(colors.surface))).toBeGreaterThanOrEqual(4.5);
      expect(contrast(rgb(colors.buttonText), rgb(colors.buttonBackground))).toBeGreaterThanOrEqual(4.5);
      // Nicht-Text-Kontrast (1.4.11): Kartenrand gegen Seitenhintergrund mindestens 3:1.
      expect(contrast(rgb(colors.border), rgb(colors.page))).toBeGreaterThanOrEqual(3);
    });
  }

  test('data-theme überschreibt die Systemeinstellung', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(url('tokens.html'));
    const light = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });
    const dark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(light).toBe('rgb(244, 246, 250)');
    expect(dark).toBe('rgb(15, 24, 38)');
    await page.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
    await page.emulateMedia({ colorScheme: 'dark' });
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(244, 246, 250)');
  });

  test('Farbcodes stehen nur im Rohwert-Block von tokens.css', () => {
    const css = read('tokens.css');
    const afterRoles = css.slice(css.indexOf('/* 2. Rollen'));
    expect(afterRoles).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});

test.describe('CSS · Ebenen und moderne Selektoren', () => {
  test('Eine spätere Ebene schlägt höhere Spezifität, unlayerter Code schlägt jede Ebene', async ({ page }) => {
    await page.goto(url('cascade.html'));
    const colors = await page.evaluate(() => ({
      ebene: getComputedStyle(document.getElementById('ebene')).backgroundColor,
      ohneEbene: getComputedStyle(document.getElementById('ohne-ebene')).backgroundColor,
    }));
    expect(colors.ebene).toBe('rgb(23, 77, 158)');
    expect(colors.ohneEbene).toBe('rgb(138, 28, 20)');
  });

  test(':has() ordnet nur die Karte mit Bild zweispaltig an; :where() hat Spezifität 0', async ({ page }) => {
    await page.goto(url('cascade.html'));
    const result = await page.evaluate(() => ({
      mitBild: getComputedStyle(document.getElementById('mit-bild')).display,
      ohneBild: getComputedStyle(document.getElementById('ohne-bild')).display,
      columns: getComputedStyle(document.getElementById('mit-bild')).gridTemplateColumns.split(' ').length,
    }));
    expect(result).toEqual({ mitBild: 'grid', ohneBild: 'block', columns: 2 });
    // Ein einfacher Elementselektor überschreibt :where(h1,h2,h3) ohne Spezifitätstricks.
    await page.addStyleTag({ content: 'h1 { margin-block-end: 3rem; }' });
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('h1')).marginBottom)).toBe('48px');
  });

  test('Bei !important dreht sich die Ebenenreihenfolge um: die frühere Ebene gewinnt', async ({ page }) => {
    await page.goto(url('cascade.html'));
    await page.addStyleTag({ content: '@layer base { #ohne-bild h2 { color: rgb(255, 0, 0) !important; } } @layer utilities { #ohne-bild h2 { color: rgb(0, 0, 255) !important; } }' });
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('#ohne-bild h2')).color)).toBe('rgb(255, 0, 0)');
    // Ohne !important gewinnt dagegen die spätere Ebene.
    await page.addStyleTag({ content: '@layer base { #ohne-bild p { color: rgb(255, 0, 0); } } @layer utilities { #ohne-bild p { color: rgb(0, 0, 255); } }' });
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('#ohne-bild p')).color)).toBe('rgb(0, 0, 255)');
  });

  test(':has(:user-invalid) markiert die Karte erst nach der Eingabe', async ({ page }) => {
    await page.goto(url('cascade.html'));
    const outline = () => page.evaluate(() => getComputedStyle(document.getElementById('formular')).outlineStyle);
    expect(await outline()).toBe('none');
    await page.getByLabel('E-Mail').fill('keine-mail');
    await page.getByLabel('E-Mail').blur();
    expect(await outline()).toBe('solid');
  });
});

test.describe('CSS · Container Queries und fließende Größen', () => {
  test('Dieselbe Karte ordnet sich nach der Breite ihres Containers, nicht des Fensters', async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 800 });
    await page.goto(url('container.html'));
    const columns = (id) => page.evaluate((slot) => getComputedStyle(document.querySelector(`#${slot} .karte`)).gridTemplateColumns.split(' ').length, id);
    expect(await columns('schmal')).toBe(1);
    expect(await columns('breit')).toBe(2);
    await page.setViewportSize({ width: 400, height: 800 });
    // Der breite Slot ist jetzt durch das Fenster begrenzt (< 32 rem): wieder einspaltig.
    expect(await columns('breit')).toBe(1);
  });

  test('clamp() hält die Überschrift zwischen Mindest- und Höchstgröße', async ({ page }) => {
    const size = async (width) => { await page.setViewportSize({ width, height: 800 }); return page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('h1')).fontSize)); };
    await page.goto(url('container.html'));
    expect(await size(320)).toBeCloseTo(28, 0);
    expect(await size(1920)).toBe(48);
    const middle = await size(800);
    expect(middle).toBeGreaterThan(28);
    expect(middle).toBeLessThan(48);
  });
});

test.describe('CSS · Bewegung', () => {
  test('Übergänge und Animationen gibt es nur ohne Reduktionswunsch', async ({ page }) => {
    const durations = () => page.evaluate(() => ({ transition: getComputedStyle(document.getElementById('panel')).transitionDuration, animation: getComputedStyle(document.querySelector('.lade')).animationName }));
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(url('motion.html'));
    expect(await durations()).toEqual({ transition: '0.2s, 0.2s', animation: 'drehen' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await durations()).toEqual({ transition: '0s', animation: 'none' });
  });

  test('Nur transform und opacity werden animiert', () => {
    const css = read('motion.css');
    expect(css).toContain('transition: transform 200ms ease-out, opacity 200ms ease-out');
    expect(css).not.toMatch(/transition:\s*(all|width|height|margin|top|left)/);
  });
});

test.describe('HTML · Bilder', () => {
  const chosen = async (page, width, deviceScaleFactor) => {
    const context = await page.context().browser().newContext({ viewport: { width, height: 800 }, deviceScaleFactor });
    const p = await context.newPage();
    await p.goto(url('bilder.html'));
    const src = await p.evaluate(() => document.getElementById('held').currentSrc);
    await context.close();
    return path.basename(src);
  };

  test('srcset und sizes: Der Browser wählt nach Breite und Pixeldichte', async ({ page }) => {
    expect(await chosen(page, 400, 1)).toBe('lernkarte-480.svg');
    expect(await chosen(page, 400, 2)).toBe('lernkarte-960.svg');
    expect(await chosen(page, 1280, 1)).toBe('lernkarte-480.svg');
    expect(await chosen(page, 1280, 2)).toBe('lernkarte-960.svg');
  });

  test('picture liefert auf schmalen Anzeigen einen anderen Ausschnitt', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto(url('bilder.html'));
    await page.locator('#ausschnitt').scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => document.getElementById('ausschnitt').currentSrc.split('/').pop())).toBe('lernkarte-quadrat.svg');
    await page.setViewportSize({ width: 900, height: 800 });
    await expect.poll(() => page.evaluate(() => document.getElementById('ausschnitt').currentSrc.split('/').pop())).toBe('lernkarte-960.svg');
  });

  test('width/height reservieren Platz: das Seitenverhältnis stimmt schon vor dem Laden', async ({ page }) => {
    await page.route('**/*.svg', (route) => route.abort());
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto(url('bilder.html'));
    const box = await page.locator('#held').boundingBox();
    expect(box.width / box.height).toBeCloseTo(960 / 640, 2);
    expect(box.width).toBeLessThanOrEqual(400);
  });

  test('Attribute: erstes Bild hoch priorisiert, spätere lazy, dekoratives Bild mit leerem alt', async ({ page }) => {
    await page.goto(url('bilder.html'));
    const attributes = await page.evaluate(() => ({
      held: [document.getElementById('held').getAttribute('fetchpriority'), document.getElementById('held').getAttribute('loading')],
      ausschnitt: document.getElementById('ausschnitt').getAttribute('loading'),
      deko: [document.getElementById('deko').getAttribute('alt'), document.getElementById('deko').getAttribute('loading')],
    }));
    expect(attributes).toEqual({ held: ['high', null], ausschnitt: 'lazy', deko: ['', 'lazy'] });
  });
});

test.describe('HTML · Kopfbereich', () => {
  const checkHead = read('check-head.js');
  const run = async (page, file) => {
    await page.goto(url(file));
    await page.addScriptTag({ content: checkHead });
    return page.evaluate(() => checkHead());
  };

  test('Vollständige Seite besteht, Fehlerseite wird mit konkreten Befunden gemeldet', async ({ page }) => {
    expect(await run(page, 'head.html')).toEqual([]);
    const issues = await run(page, 'head-fehler.html');
    expect(issues).toEqual(expect.arrayContaining([
      'lang am html-Element fehlt',
      expect.stringContaining('title ist zu kurz'),
      expect.stringContaining('meta description hat 5 Zeichen'),
      'canonical-Link fehlt',
      expect.stringContaining('verhindert das Zoomen'),
      'erwartet genau eine h1, gefunden: 2',
    ]));
  });

  test('JSON-LD ist gültig und passt zu sichtbarem Inhalt', async ({ page }) => {
    await page.goto(url('head.html'));
    const data = await page.evaluate(() => JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent));
    expect(data['@type']).toBe('Article');
    expect(data.headline).toBe(await page.evaluate(() => document.title.split(' | ')[0]));
    expect(await page.locator('h1').textContent()).toContain('Flexbox lernen');
  });
});

test.describe('HTML · Native Interaktion', () => {
  test('Dialog: Fokus wandert hinein, Escape schließt, Fokus kehrt zurück, Hintergrund ist inert', async ({ page }) => {
    await page.goto(url('interaktion.html'));
    const opener = page.locator('#dialog-auf');
    await opener.click();
    await expect(page.locator('#bestaetigung')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Abbrechen' })).toBeFocused();
    // Tab bleibt im Dialog: mehrere Tabs führen nie zurück auf die Seite dahinter.
    for (let i = 0; i < 4; i += 1) { await page.keyboard.press('Tab'); expect(await page.evaluate(() => document.activeElement.closest('dialog') !== null || document.activeElement === document.body || document.activeElement === document.documentElement)).toBe(true); }
    await page.keyboard.press('Escape');
    await expect(page.locator('#bestaetigung')).toBeHidden();
    await expect(opener).toBeFocused();
    await expect(page.locator('#ergebnis')).toHaveText('Abgebrochen.');
  });

  test('Dialog: returnValue unterscheidet Bestätigen von Abbrechen', async ({ page }) => {
    await page.goto(url('interaktion.html'));
    await page.locator('#dialog-auf').click();
    await page.locator('#bestaetigung').getByRole('button', { name: 'Zurücksetzen' }).click();
    await expect(page.locator('#ergebnis')).toHaveText('Zurückgesetzt (Demo).');
  });

  test('Popover öffnet per Button, Escape und Klick daneben schließen ihn ohne JavaScript', async ({ page }) => {
    await page.goto(url('interaktion.html'));
    const popover = page.locator('#hinweis');
    await page.locator('#hinweis-auf').click();
    await expect(popover).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(popover).toBeHidden();
    await page.locator('#hinweis-auf').click();
    await expect(popover).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(popover).toBeHidden();
  });

  test('details mit gleichem name sind exklusiv', async ({ page }) => {
    await page.goto(url('interaktion.html'));
    const open = () => page.evaluate(() => [...document.querySelectorAll('details')].map((d) => d.open));
    expect(await open()).toEqual([true, false]);
    await page.getByText('Wofür ist alt da?').click();
    expect(await open()).toEqual([false, true]);
  });
});

test.describe('HTML · Barrierefreiheit prüfen', () => {
  const checkA11y = read('check-a11y.js');
  const run = async (page, file) => {
    await page.goto(url(file));
    await page.addScriptTag({ content: checkA11y });
    return page.evaluate(() => checkA11y());
  };

  test('Gute Seite hat keine Befunde, die Fehlerseite wird in jeder Kategorie erkannt', async ({ page }) => {
    expect(await run(page, 'a11y-gut.html')).toEqual([]);
    const issues = await run(page, 'a11y-fehler.html');
    for (const expected of ['Bild ohne alt-Attribut', 'Formularfeld ohne Beschriftung', 'button ohne zugänglichen Namen', 'Überschriftenebene springt von h1 auf h3', 'erwartet genau ein main-Element', 'id mehrfach vergeben: doppelt', 'Zielgröße unter 24 px', 'Kontrast']) {
      expect(issues.some((issue) => issue.startsWith(expected)), `Befund fehlt: ${expected}`).toBe(true);
    }
  });

  test('Tastaturdurchlauf der guten Seite erreicht Feld und Button in sinnvoller Reihenfolge mit sichtbarem Fokus', async ({ page }) => {
    await page.goto(url('a11y-gut.html'));
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Suchbegriff')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Suchen' })).toBeFocused();
    const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineWidth);
    expect(parseFloat(outline)).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Abschlussprojekt: Lernkarten-Galerie', () => {
  const checkHead = read('check-head.js');
  const checkA11y = read('check-a11y.js');

  for (const scheme of ['light', 'dark']) {
    test(`Keine Befunde bei Kopf- und Barrierefreiheitsprüfung (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(url('projekt/index.html'));
      await page.addScriptTag({ content: checkHead });
      await page.addScriptTag({ content: checkA11y });
      expect(await page.evaluate(() => ({ head: checkHead(), a11y: checkA11y() }))).toEqual({ head: [], a11y: [] });
    });
  }

  for (const width of [320, 768, 1280]) {
    test(`Kein horizontales Scrollen bei ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(url('projekt/index.html'));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }

  test('Kartenlayout folgt dem Container, Dialog und Themenwechsel funktionieren per Tastatur', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(url('projekt/index.html'));
    const first = page.locator('.karte').first();
    // Bei 1280 px ist jede der zwei Karten rund 34 rem breit (>= 28 rem): Bild und Text stehen nebeneinander.
    const columns = () => first.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(await columns()).toBe(2);
    // Bei 768 px sind es rund 22 rem pro Karte: einspaltig, obwohl das Fenster breiter als ein Smartphone ist.
    await page.setViewportSize({ width: 768, height: 900 });
    expect(await columns()).toBe(1);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.getByRole('button', { name: 'Details' }).first().focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Details' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Schließen' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Details' }).first()).toBeFocused();
    await page.getByRole('button', { name: 'Dunkles Design' }).press('Enter');
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(15, 24, 38)');
    await expect(page.getByRole('button', { name: 'Dunkles Design' })).toHaveAttribute('aria-pressed', 'true');
  });
});
