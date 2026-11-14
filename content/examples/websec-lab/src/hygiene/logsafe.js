// Log-Einträge sicher schreiben: Zeilenumbrüche und Steuerzeichen aus Eingaben entfernen (Log Forging), Länge begrenzen.
const CONTROL = new RegExp('[\\u0000-\\u001f\\u007f\\u2028\\u2029]', 'g'); // Steuerzeichen und die Zeilentrenner U+2028/U+2029

export function sanitizeLogValue(value, maxLength = 200) {
  const text = String(value).replace(CONTROL, (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`);
  return text.length > maxLength ? `${text.slice(0, maxLength)}…[${text.length - maxLength} Zeichen gekürzt]` : text;
}

/** UNSICHER, nur zur Vorführung: Ein Zeilenumbruch in name erzeugt eine zweite, erfundene Zeile. */
export const formatUnsafe = (name) => `Anmeldung fehlgeschlagen für ${name}`;
export const formatSafe = (name) => `Anmeldung fehlgeschlagen für ${sanitizeLogValue(name)}`;
