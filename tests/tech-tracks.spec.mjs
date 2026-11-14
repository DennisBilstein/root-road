import { test, expect } from '@playwright/test';

// Die Kurse TypeScript, Node.js, Linux & Shell, Web-Sicherheit, HTML & CSS und MariaDB (Vertiefung): Umfang, Darstellung und Überlauf bei 375 px.
const tracks = [
  { path: 'typescript', modules: ['ts-m1', 'ts-m2'], lessons: 8 },
  { path: 'node', modules: ['node-m1', 'node-m2'], lessons: 8 },
  { path: 'linux', modules: ['lx-m1', 'lx-m2'], lessons: 8 },
  { path: 'websec', modules: ['ws-m1', 'ws-m2'], lessons: 9 },
  // HTML & CSS: die älteren Kompaktlektionen (html-m1, css-m1) haben weniger Code- und Quellenblöcke; geprüft werden die Vertiefungsmodule.
  { path: 'htmlcss', modules: ['html-m1', 'css-m1', 'html-m2', 'css-m2'], lessons: 21, only: ['html-m2', 'css-m2'] },
  // MariaDB: mariadb-m1 ist die ältere Kompaktfassung; geprüft wird das Vertiefungsmodul.
  { path: 'mariadb', modules: ['mariadb-m1', 'mariadb-m2'], lessons: 14, only: ['mariadb-m2'] },
];

for (const track of tracks) {
  test(`Lernpfad ${track.path}: ${track.lessons} Lektionen mit Code, Quiz und Quellen, ohne Überlauf bei 375 px`, async ({ page }) => {
    const errors = [];
    // Schnelles Weiterschalten bricht laufende View-Transitions ab; diese Meldung ist erwartbar und kein Inhaltsfehler.
    page.on('pageerror', (e) => { if (!/Transition was skipped/.test(e.message)) errors.push(e.message); });
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/');
    await page.waitForFunction(() => window.RP_APP_READY);
    await page.evaluate((path) => rpChoosePath(path), track.path);

    const info = await page.evaluate((modules) => {
      const d = rpData();
      return {
      moduleIds: d.modules.map((m) => m.id),
      lessonIds: d.lessons.map((l) => l.id),
      empty: d.lessons.filter((l) => !l.body || !l.body2 || !(l.quiz || []).length || (l.quiz || []).some((q) => !q.rationales || q.rationales.length !== q.options.length)).map((l) => l.id),
      expected: modules,
      };
    }, track.modules);
    expect(info.moduleIds).toEqual(track.modules);
    expect(info.lessonIds).toHaveLength(track.lessons);
    expect(info.empty).toEqual([]);

    for (const id of info.lessonIds.filter((lessonId) => !track.only || track.only.some((prefix) => lessonId.startsWith(prefix)))) {
      await page.evaluate((lessonId) => selectLesson(lessonId), id);
      await expect(page.locator('fieldset.qcard').first()).toBeAttached();
      // Während einer View-Transition kann scrollWidth kurz abweichen: erst nach dem Beruhigen messen.
      await expect.poll(() => page.evaluate(() => document.scrollingElement.scrollWidth - innerWidth), { message: `${id}: horizontaler Überlauf`, timeout: 2000 }).toBeLessThanOrEqual(0);
      const check = await page.evaluate(() => ({
        overflow: document.scrollingElement.scrollWidth - innerWidth,
        pre: document.querySelectorAll('#content pre').length,
        sources: document.querySelectorAll('#content a[href^="https://"]').length,
      }));
      expect(check.overflow, `${id}: horizontaler Überlauf`).toBeLessThanOrEqual(0);
      expect(check.pre, `${id}: Code-/Ausgabeblock`).toBeGreaterThanOrEqual(2);
      expect(check.sources, `${id}: Quellenlinks`).toBeGreaterThanOrEqual(2);
    }
    expect(errors).toEqual([]);
  });
}
