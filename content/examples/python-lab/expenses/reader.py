"""CSV einlesen: sammelt alle Fehler, statt beim ersten abzubrechen."""
from __future__ import annotations

import csv
from pathlib import Path

from .model import Expense, RowError, parse_row


def read_expenses(path: Path) -> tuple[list[Expense], list[RowError]]:
    expenses: list[Expense] = []
    errors: list[RowError] = []
    # Kodierung ausdrücklich angeben: Der Standard hängt vom System ab. utf-8-sig liest UTF-8 mit und ohne BOM (Excel schreibt oft eins).
    # newline="" verlangt das csv-Modul.
    with path.open(encoding="utf-8-sig", newline="") as handle:
        for line, fields in enumerate(csv.reader(handle, delimiter=";"), start=1):
            if line == 1 and [field.strip().lower() for field in fields[:3]] == ["datum", "kategorie", "betrag"]:
                continue  # Kopfzeile
            if not fields or all(not field.strip() for field in fields):
                continue  # Leerzeile
            try:
                expenses.append(parse_row(fields, line))
            except RowError as error:
                errors.append(error)
    return expenses, errors
