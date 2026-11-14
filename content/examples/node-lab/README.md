# Node.js-Lab

Geprüfter Code für die Lektionen `node-m1` und `node-m2`. Keine Abhängigkeiten, nur eingebaute Node-Module.

```bash
npm test            # node --test "tests/*.test.js"
npm run test:node24 # dasselbe in einem Container mit Node 24 (Docker nötig)
```

Geprüft mit Node 22.23 (lokal) und Node 24.22 (Container `node:24-slim`). Auf anderen Versionen können Warnungen oder Meldungstexte abweichen.

| Ordner | Inhalt |
| --- | --- |
| `src/runtime` | Event-Loop-Reihenfolge, CLI mit `parseArgs`, Exit-Codes |
| `src/modules` | ESM, CommonJS, `exports`/`imports`, JSON-Import |
| `src/async` | Timeout, Wiederholung, begrenzte Parallelität, unbehandelte Rejections |
| `src/files` | Pfade sicher verbinden, JSON atomar schreiben, Streams, Buffer |
| `src/server` | HTTP-Server mit `node:http`, Statuscodes, Größenlimit |
| `src/data` | `node:sqlite`, Migrationen, Konfiguration aus der Umgebung |
| `src/ops` | strukturiertes Logging, sauberes Beenden, Worker Threads |
| `src/testing` | `node:test`, Mocks, gesteuerte Zeit |

`Dockerfile` baut ein Image mit dem Server (läuft als Benutzer `node`, Exec-Form für `SIGTERM`). Im Modus `production` bricht der Start ohne `DB_PATH` und `SESSION_SECRET` mit Exit-Code 78 ab.
