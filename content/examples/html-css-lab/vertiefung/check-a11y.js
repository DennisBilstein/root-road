// Einfache Prüfung typischer Barrierefreiheitsfehler (Konsole oder Test). Ersetzt weder axe/Lighthouse noch einen Test mit Tastatur und Screenreader.
function checkA11y(root = document) {
  const issues = [];
  const visible = (el) => { const box = el.getBoundingClientRect(); const style = getComputedStyle(el); return box.width > 0 && box.height > 0 && style.visibility !== 'hidden'; };
  const nameOf = (el) => (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') && [...el.getAttribute('aria-labelledby').split(/\s+/)].map((id) => root.getElementById(id)?.textContent ?? '').join(' ') || el.textContent || el.querySelector('img[alt]')?.getAttribute('alt') || '').trim();
  const luminance = ([r, g, b]) => { const c = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const parse = (value) => value.match(/[\d.]+/g).map(Number);
  const backgroundOf = (el) => { for (let node = el; node; node = node.parentElement) { const [r, g, b, a = 1] = parse(getComputedStyle(node).backgroundColor); if (a > 0.99) return [r, g, b]; } return [255, 255, 255]; };

  root.querySelectorAll('img:not([alt])').forEach((img) => issues.push(`Bild ohne alt-Attribut: ${img.getAttribute('src')}`));
  root.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]), select, textarea').forEach((field) => {
    const labelled = field.labels?.length || field.getAttribute('aria-label') || field.getAttribute('aria-labelledby');
    if (!labelled) issues.push(`Formularfeld ohne Beschriftung: ${field.name || field.id || field.tagName.toLowerCase()}`);
  });
  root.querySelectorAll('button, a[href], summary').forEach((el) => { if (!nameOf(el)) issues.push(`${el.tagName.toLowerCase()} ohne zugänglichen Namen`); });
  let previous = 0;
  root.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    const level = Number(heading.tagName[1]);
    if (previous && level > previous + 1) issues.push(`Überschriftenebene springt von h${previous} auf h${level}: ${heading.textContent.trim()}`);
    previous = level;
  });
  if (root.querySelectorAll('main, [role=main]').length !== 1) issues.push('erwartet genau ein main-Element');
  root.querySelectorAll('[tabindex]').forEach((el) => { if (Number(el.getAttribute('tabindex')) > 0) issues.push('positiver tabindex ändert die Tab-Reihenfolge'); });
  const ids = new Map();
  root.querySelectorAll('[id]').forEach((el) => ids.set(el.id, (ids.get(el.id) ?? 0) + 1));
  ids.forEach((count, id) => { if (count > 1) issues.push(`id mehrfach vergeben: ${id}`); });
  // WCAG 2.2, 2.5.8: Zielgröße mindestens 24 x 24 CSS-Pixel (Ausnahmen wie Links im Fließtext bleiben unberücksichtigt).
  root.querySelectorAll('button, input:not([type=hidden]), select, textarea, summary').forEach((el) => {
    if (!visible(el)) return;
    const box = el.getBoundingClientRect();
    if (box.width < 24 || box.height < 24) issues.push(`Zielgröße unter 24 px: ${nameOf(el) || el.tagName.toLowerCase()}`);
  });
  // Kontrast nur für Text mit einfarbigem Hintergrund (Verläufe und Bilder werden nicht erfasst).
  root.querySelectorAll('h1, h2, h3, h4, p, a, li, label, button, summary, td, th').forEach((el) => {
    if (!visible(el) || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
    const style = getComputedStyle(el);
    const size = parseFloat(style.fontSize), bold = Number(style.fontWeight) >= 700;
    const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
    const [fr, fg, fb] = parse(style.color);
    const a = luminance([fr, fg, fb]), b = luminance(backgroundOf(el));
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    if (ratio < need) issues.push(`Kontrast ${ratio.toFixed(2)}:1 statt ${need}:1: ${el.textContent.trim().slice(0, 30)}`);
  });
  return issues;
}
if (typeof module !== 'undefined') module.exports = { checkA11y };
