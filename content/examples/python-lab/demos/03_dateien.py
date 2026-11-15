"""Lektion 3: Pfade, Kodierung, CSV und JSON mit Umlauten."""
import csv
import json
import tempfile
from pathlib import Path, PurePosixPath

p = PurePosixPath("/daten/2026/ausgaben.final.csv")
print("Pfadteile      :", p.name, "|", p.stem, "|", p.suffix, "|", p.parent.name, "|", p.with_suffix(".json").name)
print("Pfade verbinden:", PurePosixPath("daten") / "2026" / "a.csv")

with tempfile.TemporaryDirectory() as tmp:
    path = Path(tmp) / "kaese.csv"
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, delimiter=";")
        writer.writerow(["Artikel", "Preis", "Notiz"])
        writer.writerow(["Käse", "3,50", 'enthält "Anführungszeichen"; und Semikolon'])
    raw = path.read_bytes()
    print("Bytes (UTF-8)  :", len(raw), "| 'ä' belegt", len("ä".encode("utf-8")), "Bytes, in Latin-1", len("ä".encode("latin-1")))
    with path.open(encoding="utf-8", newline="") as handle:
        print("zurückgelesen  :", list(csv.reader(handle, delimiter=";"))[1])
    try:
        path.read_text(encoding="ascii")
    except UnicodeDecodeError as error:
        print("falsche Kodierung:", type(error).__name__, "->", error.reason)
    print("falsch, aber still:", repr(raw.decode("latin-1").splitlines()[1][:6]))

data = {"name": "Müller", "betrag": "12.50"}
print("JSON ASCII     :", json.dumps(data))
print("JSON mit Umlaut:", json.dumps(data, ensure_ascii=False))
print("zurück         :", json.loads(json.dumps(data)) == data)
try:
    json.loads("{'a': 1}")
except json.JSONDecodeError as error:
    print("ungültiges JSON:", error.msg, "(Zeile", error.lineno, "Spalte", error.colno, ")")
