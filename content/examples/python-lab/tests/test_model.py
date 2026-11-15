import unittest
from dataclasses import FrozenInstanceError
from datetime import date
from decimal import Decimal

from expenses.model import Expense, RowError, parse_amount, parse_row


class ParseAmount(unittest.TestCase):
    def test_valid_formats(self):
        cases = {"12,50": "12.50", "1.249,90": "1249.90", "5": "5", " 7,5 ": "7.5", "0,01": "0.01", "1.5": "1.5"}
        for text, expected in cases.items():
            with self.subTest(text=text):
                self.assertEqual(parse_amount(text, 1), Decimal(expected))

    def test_decimal_keeps_exact_cents(self):
        self.assertEqual(parse_amount("0,10", 1) + parse_amount("0,20", 1), Decimal("0.30"))

    def test_invalid_values_raise_row_error_with_line(self):
        for text in ["abc", "", "0", "0,00", "-5,00", "3,141", "nan", "inf", "1,2,3"]:
            with self.subTest(text=text):
                with self.assertRaises(RowError) as caught:
                    parse_amount(text, 7)
                self.assertEqual(caught.exception.line, 7)
                self.assertTrue(str(caught.exception).startswith("Zeile 7: "))

    def test_thousands_point_without_comma_is_read_as_decimal_point(self):
        # Grenzfall, bewusst dokumentiert: „1.249“ ohne Komma ist hier 1,249 und hat damit drei Nachkommastellen.
        with self.assertRaises(RowError):
            parse_amount("1.249", 1)

    def test_error_hides_internal_exception_chain(self):
        with self.assertRaises(RowError) as caught:
            parse_amount("abc", 1)
        self.assertIsNone(caught.exception.__cause__)
        self.assertTrue(caught.exception.__suppress_context__)


class ParseRow(unittest.TestCase):
    def test_valid_row_with_and_without_note(self):
        self.assertEqual(parse_row(["2026-03-02", " Miete ", "850,00", "März"], 2), Expense(date(2026, 3, 2), "Miete", Decimal("850.00"), "März"))
        self.assertEqual(parse_row(["2026-03-02", "Miete", "850,00"], 2).note, "")

    def test_errors(self):
        cases = {
            "Datum": (["2026-13-01", "Kultur", "1,00"], "JJJJ-MM-TT"),
            "Kategorie": (["2026-03-05", " ", "1,00"], "Kategorie fehlt"),
            "Spalten": (["2026-03-05", "Kultur"], "2 Spalten"),
        }
        for name, (fields, fragment) in cases.items():
            with self.subTest(name):
                with self.assertRaisesRegex(RowError, fragment):
                    parse_row(fields, 3)

    def test_expense_is_immutable_and_comparable(self):
        expense = parse_row(["2026-03-02", "Miete", "850,00"], 2)
        with self.assertRaises(FrozenInstanceError):
            expense.category = "Andere"  # type: ignore[misc]
        self.assertEqual(expense, parse_row(["2026-03-02", "Miete", "850,00"], 9))
