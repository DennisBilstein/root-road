# ci-lab: Workflow-Linter für GitHub Actions

Geprüfter Code für das Modul „CI/CD mit GitHub Actions“ (`ci-m1`). Keine Abhängigkeiten, nur Node.js (getestet mit 22).

```bash
cd content/examples/ci-lab
npm test                                  # 15 Tests mit node:test
node src/cli.js workflows                 # alle Beispiel-Workflows prüfen
node src/cli.js ../../../.github/workflows # die echten Workflows dieses Repositories prüfen
```

## Was der Linter prüft

`src/lint-workflow.js` liest den Workflow-Text zeilenweise (kein vollständiger YAML-Parser) und meldet sechs Regeln:

| Regel | Stufe | Bedeutung |
| --- | --- | --- |
| `script-injection` | Fehler | Von außen steuerbarer Wert (Ticket-Titel, Branchname, Commit-Nachricht …) steht direkt in einem `run`-Skript |
| `write-all` | Fehler | `permissions: write-all` |
| `unpinned-action` | Fehler | Fremde Action ohne 40-stellige Commit-SHA (Actions von `actions/` und `github/` sind ausgenommen, lokale `./`-Actions auch) |
| `pull-request-target-checkout` | Fehler | `pull_request_target` mit Checkout des Pull-Request-Codes |
| `missing-permissions` | Warnung | Weder `permissions` auf oberster Ebene noch in jedem Job |
| `missing-timeout` | Warnung | Job ohne `timeout-minutes` (Aufrufe wiederverwendbarer Workflows ausgenommen) |

Das ist eine Heuristik für typische Muster. Sie ersetzt keinen YAML-Parser und keine ausgereiften Werkzeuge wie actionlint oder zizmor; sie findet zum Beispiel keine Ausdrücke, die über mehrere Zeilen verteilt sind, und keine Einschleusung über `github-script`.

## Beispiele

- `workflows/good-ci.yml`, `workflows/release.yml`: ohne Befunde
- `workflows/bad-*.yml`: je ein Beispiel pro Regel; sie sind absichtlich fehlerhaft und werden nie ausgeführt (sie liegen nicht unter `.github/workflows`)

Die Ausgaben in den Lektionen stammen aus echten Läufen dieser CLI.
