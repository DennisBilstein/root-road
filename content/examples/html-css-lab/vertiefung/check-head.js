// Prüft den Kopfbereich einer Seite (im Browser oder in einem Test). Gibt eine Liste verständlicher Befunde zurück.
function checkHead(doc = document) {
  const issues = [];
  const meta = (name) => doc.querySelector(`meta[name="${name}"]`)?.getAttribute('content')?.trim() ?? '';
  const title = doc.title.trim();
  if (!doc.documentElement.lang) issues.push('lang am html-Element fehlt');
  if (!title) issues.push('title fehlt');
  else if (title.length > 65) issues.push(`title ist mit ${title.length} Zeichen sehr lang (Richtwert: bis etwa 60)`);
  else if (title.length < 10) issues.push('title ist zu kurz, um die Seite zu beschreiben');
  const description = meta('description');
  if (!description) issues.push('meta description fehlt');
  else if (description.length < 50 || description.length > 170) issues.push(`meta description hat ${description.length} Zeichen (Richtwert: 50 bis 170)`);
  if (!doc.querySelector('link[rel="canonical"][href]')) issues.push('canonical-Link fehlt');
  const viewport = meta('viewport');
  if (!viewport) issues.push('meta viewport fehlt');
  else if (/user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?(\b|,|$)/i.test(viewport)) issues.push('viewport verhindert das Zoomen (user-scalable/maximum-scale)');
  const h1s = doc.querySelectorAll('h1').length;
  if (h1s !== 1) issues.push(`erwartet genau eine h1, gefunden: ${h1s}`);
  doc.querySelectorAll('script[type="application/ld+json"]').forEach((script, index) => {
    try { JSON.parse(script.textContent); } catch { issues.push(`JSON-LD Nr. ${index + 1} ist kein gültiges JSON`); }
  });
  return issues;
}
if (typeof module !== 'undefined') module.exports = { checkHead };
