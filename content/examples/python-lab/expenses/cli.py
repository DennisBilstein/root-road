"""Kommandozeile: python -m expenses DATEI. Exit-Code 0 = alles gültig, 1 = ungültige Zeilen, 2 = Datei nicht lesbar."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from .reader import read_expenses
from .report import format_report


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="expenses", description="Summiert Ausgaben je Kategorie aus einer CSV-Datei (Spalten: Datum;Kategorie;Betrag;Notiz).")
    parser.add_argument("datei", type=Path, help="Pfad der CSV-Datei (UTF-8, Trennzeichen Semikolon)")
    args = parser.parse_args(argv)
    try:
        expenses, errors = read_expenses(args.datei)
    except (OSError, UnicodeDecodeError) as error:
        print(f"Datei nicht lesbar: {error}", file=sys.stderr)
        return 2
    print(format_report(expenses))
    for error in errors:
        print(f"Fehler: {error}", file=sys.stderr)
    return 1 if errors else 0
