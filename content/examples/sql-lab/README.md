# SQL-Lab (MariaDB)

Gehört zu den Lektionen `mariadb-m2-*`. Jede Fallstudie in `cases/` läuft gegen eine frische Datenbank (Schema aus `schema.sql`, Daten aus
`seed.sql`, außer die Datei beginnt mit `-- @no-seed`). Die Ausgabe wird mit der `.expected`-Datei daneben verglichen.

```bash
node content/examples/sql-lab/run.mjs            # alle Fälle prüfen
node content/examples/sql-lab/run.mjs 05         # nur Fall 5
node content/examples/sql-lab/run.mjs --update   # erwartete Ausgaben neu schreiben, danach `git diff` lesen
```

Voraussetzungen: laufendes Docker und ein lokal vorhandenes Image `mariadb:11` (kein Download, `--pull=never`; anderes Image per
`SQL_LAB_IMAGE`). Der Container hat kein veröffentlichtes Netzwerk, ein zufälliges Wegwerf-Passwort und wird am Ende immer entfernt.
Alle Namen und Adressen in den Daten sind erfunden (`example.test`). Nicht Teil von `npm test` oder der CI, weil Docker gebraucht wird.
Fall 4 (Sperren) ist zeitabhängig (Pausen von 1 bis 3 Sekunden); bei sehr langsamen Maschinen die Pausen in `04-sperren.mjs` erhöhen.
`cases/_version.txt` hält den Serverstand des letzten `--update` fest.
