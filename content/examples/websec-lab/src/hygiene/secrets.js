// Sucht nach Mustern, die wie Geheimnisse aussehen. Ein Hilfsmittel, kein Ersatz für Zugriffsregeln und Rotation.
const RULES = [
  { name: 'Privater Schlüssel', pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY(?: BLOCK)?-----/ },
  { name: 'AWS-Zugangsschlüssel-ID', pattern: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { name: 'GitHub-Token', pattern: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/ },
  { name: 'Allgemeine Zuweisung', pattern: /\b(?:api[_-]?key|secret|token|passw(?:or)?d|pwd)\b\s*[:=]\s*["']([^"'\s]{12,})["']/i },
];

const PLACEHOLDER = /^(?:x{6,}|\*+|<[^>]+>|\$\{[^}]+\}|change[-_ ]?me|your[-_ ].*|example.*|dummy.*)$/i;

/** Gibt Fundstellen zurück; der Fund selbst wird nie vollständig ausgegeben (nur die ersten 4 Zeichen). */
export function scanText(text, fileName = 'text') {
  const findings = [];
  text.split('\n').forEach((line, index) => {
    for (const rule of RULES) {
      const match = rule.pattern.exec(line);
      if (!match) continue;
      const value = match[1] ?? match[0];
      if (PLACEHOLDER.test(value)) continue;
      findings.push({ file: fileName, line: index + 1, rule: rule.name, preview: `${value.slice(0, 4)}…` });
    }
  });
  return findings;
}
