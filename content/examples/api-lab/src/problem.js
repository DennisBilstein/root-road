// Fehlerantworten nach RFC 9457 (Problem Details for HTTP APIs): application/problem+json mit type, title, status, detail.
export class HttpError extends Error {
  constructor(status, title, { detail, type = 'about:blank', errors, headers = {} } = {}) {
    super(title);
    this.status = status;
    this.title = title;
    this.detail = detail;
    this.type = type;
    this.errors = errors;
    this.headers = headers;
  }
}

export function toProblemBody(error, instance) {
  const body = { type: error.type, title: error.title, status: error.status };
  if (error.detail) body.detail = error.detail;
  if (instance) body.instance = instance;
  // Erweiterungsmitglied: maschinenlesbare Feldfehler, damit Clients sie neben das richtige Eingabefeld setzen können.
  if (error.errors) body.errors = error.errors;
  return body;
}
