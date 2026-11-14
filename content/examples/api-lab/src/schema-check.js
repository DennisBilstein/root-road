// Mini-Prüfer für eine Teilmenge von JSON Schema (genug für diesen Vertrag): type, required, properties, additionalProperties: false,
// enum, minLength, maxLength, pattern, minimum, maximum, maxItems, items, format date-time und lokale $ref. Für echte Projekte einen vollständigen Validator (z. B. Ajv) verwenden.
export function resolveRef(doc, ref) {
  if (!ref.startsWith('#/')) throw new Error(`Nur lokale Verweise werden unterstützt: ${ref}`);
  return ref.slice(2).split('/').reduce((node, key) => node?.[key], doc);
}

const typeOf = (value) => (value === null ? 'null' : Array.isArray(value) ? 'array' : Number.isInteger(value) ? 'integer' : typeof value);
const matchesType = (type, value) => (type === 'number' ? typeof value === 'number' : typeOf(value) === type);

export function check(schema, value, doc, path = '$') {
  if (schema.$ref) return check(resolveRef(doc, schema.$ref), value, doc, path);
  const errors = [];
  const types = [].concat(schema.type ?? []);
  if (types.length && !types.some((type) => matchesType(type, value))) return [`${path}: erwartet ${types.join(' oder ')}, erhalten ${typeOf(value)}`];
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${path}: Wert nicht in enum`);
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(`${path}: kürzer als ${schema.minLength}`);
    if (schema.maxLength !== undefined && value.length > schema.maxLength) errors.push(`${path}: länger als ${schema.maxLength}`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${path}: passt nicht auf ${schema.pattern}`);
    if (schema.format === 'date-time' && (Number.isNaN(Date.parse(value)) || !/T.*(Z|[+-]\d\d:\d\d)$/.test(value))) errors.push(`${path}: kein date-time`);
  }
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${path}: kleiner als ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${path}: größer als ${schema.maximum}`);
  }
  if (Array.isArray(value)) {
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${path}: mehr als ${schema.maxItems} Einträge`);
    if (schema.items) value.forEach((item, index) => errors.push(...check(schema.items, item, doc, `${path}[${index}]`)));
  }
  if (typeOf(value) === 'object') {
    for (const key of schema.required ?? []) if (!(key in value)) errors.push(`${path}: Pflichtfeld ${key} fehlt`);
    for (const [key, sub] of Object.entries(schema.properties ?? {})) if (key in value) errors.push(...check(sub, value[key], doc, `${path}.${key}`));
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) if (!(key in (schema.properties ?? {}))) errors.push(`${path}: unbekanntes Feld ${key}`);
    }
  }
  return errors;
}
