# Web-Sicherheit-Lab

Geprüfter Code für die Lektionen `ws-m1` und `ws-m2`. Keine Abhängigkeiten, nur eingebaute Node-Module. **Nur zu Lernzwecken**: Die Beispiele zeigen jeweils die unsichere und die sichere Variante nebeneinander; die unsicheren Varianten tragen den Zusatz `Unsafe` und gehören nie in ein echtes System.

```bash
npm test            # node --test "tests/*.test.js"
npm run test:node24 # dasselbe im Container mit Node 24 (Docker nötig)
node src/headers/audit-url.js http://127.0.0.1:5173/   # Header einer eigenen Seite prüfen
```

Geprüft mit Node 22.23 (lokal, 37 Tests grün, 1 übersprungen) und Node 24.22 (Container, 38 Tests grün; dort läuft auch Argon2id).

| Ordner | Inhalt |
| --- | --- |
| `src/threat` | Risikobewertung (Wahrscheinlichkeit × Schaden) |
| `src/injection` | SQL-Injection, Command-Injection, Argument-Injection |
| `src/xss` | HTML-Kodierung, URL-Prüfung, JSON im Skriptblock, CSP mit Nonce |
| `src/csrf`, `src/common` | CSRF-Token, `Sec-Fetch-Site`/`Origin`, CORS, Cookies, Mini-Anwendung |
| `src/access` | IDOR, Rollenprüfung, Mass Assignment, Path Traversal, SSRF |
| `src/auth` | Passwort-Hashing (scrypt, Argon2id), serverseitige Sitzungen |
| `src/tokens` | JWT-Prüfung (HS256) mit typischen Angriffen, PKCE und OAuth-Prüfungen |
| `src/headers` | Prüfung von Sicherheits-Headern, auch per URL |
| `src/hygiene` | Geheimnis-Suche, sichere Log-Einträge |

Nicht geprüft: Verhalten im Browser (CSP, SameSite, CORS), TLS, echte Netzwerk-Angriffe, produktive Frameworks. Ein Angriff wird nur gegen die eigenen Beispiel-Funktionen und lokale Test-Server gezeigt.
