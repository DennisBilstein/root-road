# API-Lab (Notizen-API)

Gehört zu den Lektionen `api-m2-*`. Eine kleine HTTP-API ohne Abhängigkeiten (nur `node:http`, `node:crypto`, `node:test`), die die Muster der
Lektionen zeigt: Ressourcen und Statuscodes, Fehler als Problem Details (RFC 9457), Cursor-Paginierung, `Idempotency-Key`, `ETag` mit
`If-Match`/`If-None-Match`, Bearer-Token mit Scopes und Objektprüfung, Ratenbegrenzung, Versionen mit `Deprecation`/`Sunset` und ein
Vertragstest gegen `openapi.json`. Alle Daten sind erfunden; der Speicher liegt im Arbeitsspeicher.

```bash
cd content/examples/api-lab
npm test        # 25 Tests mit node:test (Node >= 22.18)
```

Aufbau: `src/app.js` (Routen), `src/problem.js`, `src/validate.js`, `src/pagination.js`, `src/idempotency.js`, `src/auth.js`, `src/ratelimit.js`,
`src/store.js`, `src/schema-check.js` (Mini-Prüfer für eine Teilmenge von JSON Schema), `openapi.json` (OpenAPI 3.1.0), `tests/*.test.js`.
Die Tests starten den Server auf einem freien Port, steuern die Zeit über eine übergebene Uhr und brauchen kein Netzwerk außer 127.0.0.1.

Grenzen: Der Speicher ist im Prozess (kein Neustart-Schutz, keine mehreren Instanzen), TLS fehlt, Token werden nur im Test ausgestellt (kein
Login, keine Widerrufsliste), der Mini-Prüfer ersetzt keinen vollständigen JSON-Schema-Validator, und `openapi.json` wurde mit keinem
OpenAPI-Validator geprüft, sondern nur durch den Vertragstest.
