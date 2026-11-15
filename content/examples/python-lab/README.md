# python-lab: Ausgabenauswertung

Geprüfter Code für das Modul „Python“ (`py-m1`). Nur Standardbibliothek, keine Installation nötig.

```bash
cd content/examples/python-lab
python3 -m unittest            # 27 Tests
python3 -m unittest -v tests.test_cli
python3 -m expenses data/ausgaben.csv       # Exit-Code 0
python3 -m expenses data/fehlerhaft.csv     # Exit-Code 1, Fehler auf stderr
python3 demos/01_grundlagen.py              # Demo-Skripte der Lektionen 1–5
```

## Aufbau

| Datei | Inhalt |
| --- | --- |
| `expenses/model.py` | `Expense` (unveränderliche `dataclass`), `RowError`, Beträge als `Decimal`, Zeilen prüfen |
| `expenses/reader.py` | CSV (UTF-8, Semikolon) einlesen, alle Fehler mit Zeilennummer sammeln |
| `expenses/report.py` | Summe je Kategorie, Darstellung als „1.234,50 €“ |
| `expenses/cli.py` | `argparse`-Kommandozeile mit Exit-Codes 0 (gültig), 1 (ungültige Zeilen), 2 (Datei nicht lesbar) |
| `demos/0N_*.py` | Je ein Skript für die Lektionen 1–5; die Ausgaben stehen in den Lektionen |
| `tests/` | `unittest`-Tests, auch ein Rauchtest für alle Demo-Skripte (`-W error`) |
| `data/` | erfundene Beispieldaten (`ausgaben.csv`, `fehlerhaft.csv`) |

Das Format der Beträge: „12,50“ oder „1.249,90“ (Dezimalkomma, optional Tausenderpunkt). Ohne Komma gilt der Punkt als Dezimaltrenner, „1.249“ wird deshalb als drei Nachkommastellen abgelehnt.

## Getestet mit

Python 3.12.15, 3.13.16 und 3.14.6 (macOS). Die Ausgaben der Lektionen stammen aus Läufen mit 3.14.6. Nicht getestet: Python 3.15 (am 15.11.2026 die aktuelle Version laut python.org), Windows und Linux.
