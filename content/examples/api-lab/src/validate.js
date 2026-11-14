// Eingabeprüfung an der Grenze: unbekannte Felder werden abgelehnt, jeder Fehler nennt Feld und Grund.
const tagPattern = /^[a-z0-9-]{1,20}$/;

export function validateNoteInput(input) {
  const errors = [];
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { errors: [{ field: '', message: 'Erwartet wird ein JSON-Objekt.' }] };
  }
  const allowed = new Set(['title', 'body', 'tags']);
  for (const key of Object.keys(input)) if (!allowed.has(key)) errors.push({ field: key, message: 'Unbekanntes Feld.' });

  const title = typeof input.title === 'string' ? input.title.trim() : input.title;
  if (typeof title !== 'string' || title.length < 1 || title.length > 80) errors.push({ field: 'title', message: 'Text mit 1 bis 80 Zeichen erforderlich.' });

  const body = input.body ?? '';
  if (typeof body !== 'string' || body.length > 2000) errors.push({ field: 'body', message: 'Text mit höchstens 2000 Zeichen erwartet.' });

  const tags = input.tags ?? [];
  if (!Array.isArray(tags) || tags.length > 5 || tags.some((tag) => typeof tag !== 'string' || !tagPattern.test(tag))) {
    errors.push({ field: 'tags', message: 'Höchstens 5 Schlagwörter aus a-z, 0-9 und Bindestrich (1 bis 20 Zeichen).' });
  }
  return errors.length ? { errors } : { value: { title, body, tags: [...new Set(tags)] }, errors };
}
