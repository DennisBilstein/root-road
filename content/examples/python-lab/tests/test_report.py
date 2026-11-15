import unittest
from datetime import date
from decimal import Decimal

from expenses.model import Expense
from expenses.report import format_eur, format_report, totals_by_category


def make(category: str, amount: str) -> Expense:
    return Expense(date(2026, 3, 1), category, Decimal(amount))


class Totals(unittest.TestCase):
    def test_sums_per_category_largest_first(self):
        totals = totals_by_category([make("A", "10.00"), make("B", "30.00"), make("A", "5.50")])
        self.assertEqual(list(totals.items()), [("B", Decimal("30.00")), ("A", Decimal("15.50"))])

    def test_ties_are_sorted_by_name(self):
        totals = totals_by_category([make("Zeta", "5.00"), make("Alpha", "5.00")])
        self.assertEqual(list(totals), ["Alpha", "Zeta"])

    def test_sum_is_exact(self):
        totals = totals_by_category([make("A", "0.10"), make("A", "0.20")])
        self.assertEqual(totals["A"], Decimal("0.30"))

    def test_empty_input(self):
        self.assertEqual(totals_by_category([]), {})
        self.assertEqual(format_report([]), "Keine gültigen Ausgaben.")


class FormatEur(unittest.TestCase):
    def test_examples(self):
        cases = {"0.5": "0,50 €", "12": "12,00 €", "1234.5": "1.234,50 €", "1000000": "1.000.000,00 €", "0": "0,00 €"}
        for value, expected in cases.items():
            with self.subTest(value=value):
                self.assertEqual(format_eur(Decimal(value)), expected)

    def test_report_has_total_line(self):
        report = format_report([make("A", "10.00"), make("B", "2.50")])
        self.assertTrue(report.splitlines()[-1].startswith("Gesamt"))
        self.assertTrue(report.endswith("12,50 €"))
