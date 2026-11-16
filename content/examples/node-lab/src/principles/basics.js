// KISS, DRY und YAGNI: je eine „vorher“- und eine „nachher“-Fassung mit gleichem Verhalten.

// ---- KISS: die einfachste Lösung, die das Problem löst ----
// Vorher: verschachtelte Zweige, ein Zwischenwert und mehrere Rückgabestellen sind schwer zu überblicken.
export function shippingCentsTangled(weightKg) {
  let cost;
  if (weightKg > 0) {
    if (weightKg <= 1) {
      cost = 499;
    } else {
      if (weightKg <= 5) {
        cost = 699;
      } else {
        if (weightKg <= 20) cost = 999;
        else cost = 999 + Math.ceil(weightKg - 20) * 50;
      }
    }
  } else {
    throw new RangeError('Gewicht muss größer als 0 sein');
  }
  return cost;
}

// Nachher: Fehlerfall zuerst, danach eine flache Liste der Stufen.
export function shippingCents(weightKg) {
  if (!(weightKg > 0)) throw new RangeError('Gewicht muss größer als 0 sein');
  if (weightKg <= 1) return 499;
  if (weightKg <= 5) return 699;
  if (weightKg <= 20) return 999;
  return 999 + Math.ceil(weightKg - 20) * 50;
}

// ---- DRY: jedes Stück Wissen genau einmal ----
// Vorher: dieselbe Regel steht zweimal. Wer sie nur an einer Stelle anpasst, erzeugt Widersprüche
// (hier: Kunden werden getrimmt, Lieferanten nicht).
export function validateCustomerName(name) {
  if (typeof name !== 'string' || name.trim().length === 0 || name.trim().length > 40) {
    throw new TypeError('Name: 1 bis 40 Zeichen');
  }
  return name.trim();
}
export function validateSupplierName(name) {
  if (typeof name !== 'string' || name.length === 0 || name.length > 40) {
    throw new TypeError('Name: 1 bis 40 Zeichen');
  }
  return name;
}

// Nachher: Die Regel „Pflichttext mit Höchstlänge“ steht an einer Stelle.
export function requireText(label, value, max = 40) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (text.length === 0 || text.length > max) throw new TypeError(`${label}: 1 bis ${max} Zeichen`);
  return text;
}

// ---- YAGNI: nichts bauen, was heute niemand braucht ----
// Vorher: Formate, Trennzeichen und Erweiterungspunkte „für später“, die kein Aufrufer nutzt.
export function exportRowsSpeculative(rows, { format = 'csv', delimiter = ',', plugins = [], encoding = 'utf8' } = {}) {
  if (format !== 'csv') throw new Error(`Format ${format} ist noch nicht umgesetzt`);
  let text = rows.map((row) => row.join(delimiter)).join('\n');
  for (const plugin of plugins) text = plugin(text);
  return { text, encoding };
}

// Nachher: nur das, was gebraucht wird. Kommt ein zweites Format wirklich, wird dann erweitert.
export function toCsv(rows) {
  return rows.map((row) => row.join(',')).join('\n');
}
