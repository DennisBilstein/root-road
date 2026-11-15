"""Auswertung: Summe je Kategorie und deutsche Darstellung von Beträgen."""
from __future__ import annotations

from collections import defaultdict
from decimal import Decimal

from .model import Expense


def totals_by_category(expenses: list[Expense]) -> dict[str, Decimal]:
    sums: defaultdict[str, Decimal] = defaultdict(Decimal)
    for expense in expenses:
        sums[expense.category] += expense.amount
    # größte Summe zuerst; bei Gleichstand alphabetisch, damit die Ausgabe stabil ist
    return dict(sorted(sums.items(), key=lambda item: (-item[1], item[0])))


def format_eur(value: Decimal) -> str:
    """1234.5 -> „1.234,50 €“ (Tausenderpunkt, Dezimalkomma)."""
    text = f"{value:,.2f}"  # 1,234.50
    return text.replace(",", "X").replace(".", ",").replace("X", ".") + " €"


def format_report(expenses: list[Expense]) -> str:
    if not expenses:
        return "Keine gültigen Ausgaben."
    totals = totals_by_category(expenses)
    width = max(len(name) for name in totals)
    lines = [f"{name:<{width}}  {format_eur(total):>12}" for name, total in totals.items()]
    lines.append(f"{'Gesamt':<{width}}  {format_eur(sum(totals.values(), Decimal(0))):>12}")
    return "\n".join(lines)
