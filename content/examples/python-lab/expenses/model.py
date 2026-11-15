"""Datenmodell: eine Ausgabe und die Fehler beim Einlesen einer Zeile."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from decimal import Decimal, InvalidOperation


class RowError(ValueError):
    """Eine Zeile der Eingabedatei ist ungültig. Trägt die Zeilennummer, damit Meldungen auffindbar sind."""

    def __init__(self, line: int, message: str) -> None:
        super().__init__(f"Zeile {line}: {message}")
        self.line = line
        self.message = message


@dataclass(frozen=True, slots=True)
class Expense:
    day: date
    category: str
    amount: Decimal  # Geld nie als float: 0.1 + 0.2 ist in Binärdarstellung nicht 0.3
    note: str = ""


def parse_amount(text: str, line: int) -> Decimal:
    """Wandelt „12,50“ in Decimal('12.50') um. Verlangt einen positiven Betrag mit höchstens zwei Nachkommastellen."""
    cleaned = text.strip().replace(".", "").replace(",", ".") if "," in text else text.strip()
    try:
        value = Decimal(cleaned)
    except InvalidOperation:
        raise RowError(line, f"Betrag „{text}“ ist keine Zahl") from None
    if not value.is_finite():
        raise RowError(line, f"Betrag „{text}“ ist keine endliche Zahl")
    if value <= 0:
        raise RowError(line, f"Betrag „{text}“ muss größer als 0 sein")
    if value.as_tuple().exponent < -2:
        raise RowError(line, f"Betrag „{text}“ hat mehr als zwei Nachkommastellen")
    return value


def parse_row(fields: list[str], line: int) -> Expense:
    if len(fields) < 3:
        raise RowError(line, f"{len(fields)} Spalten statt mindestens 3 (Datum;Kategorie;Betrag)")
    raw_day, raw_category, raw_amount, *rest = fields
    try:
        day = date.fromisoformat(raw_day.strip())
    except ValueError:
        raise RowError(line, f"Datum „{raw_day}“ ist nicht im Format JJJJ-MM-TT") from None
    category = raw_category.strip()
    if not category:
        raise RowError(line, "Kategorie fehlt")
    return Expense(day, category, parse_amount(raw_amount, line), rest[0].strip() if rest else "")
