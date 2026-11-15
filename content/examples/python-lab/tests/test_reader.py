import tempfile
import unittest
from pathlib import Path

from expenses.reader import read_expenses


class ReadExpenses(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.dir = Path(self.tmp.name)

    def write(self, text: str, *, encoding: str = "utf-8") -> Path:
        path = self.dir / "in.csv"
        path.write_bytes(text.encode(encoding))
        return path

    def test_skips_header_and_blank_lines(self):
        path = self.write("Datum;Kategorie;Betrag;Notiz\n\n2026-03-02;Miete;850,00;\n;;;\n")
        expenses, errors = read_expenses(path)
        self.assertEqual(len(expenses), 1)
        self.assertEqual(errors, [])

    def test_collects_all_errors_with_their_line_numbers(self):
        path = self.write("Datum;Kategorie;Betrag\n2026-03-02;Miete;850,00\nkaputt\n2026-03-03;Kultur;x\n")
        expenses, errors = read_expenses(path)
        self.assertEqual(len(expenses), 1)
        self.assertEqual([error.line for error in errors], [3, 4])

    def test_reads_utf8_with_and_without_bom(self):
        for encoding in ("utf-8", "utf-8-sig"):
            with self.subTest(encoding=encoding):
                expenses, errors = read_expenses(self.write("Datum;Kategorie;Betrag\n2026-03-02;Café;3,50\n", encoding=encoding))
                self.assertEqual((len(expenses), len(errors)), (1, 0))
                self.assertEqual(expenses[0].category, "Café")

    def test_wrong_encoding_is_not_hidden(self):
        path = self.write("Datum;Kategorie;Betrag\n2026-03-02;Café;3,50\n", encoding="latin-1")
        with self.assertRaises(UnicodeDecodeError):
            read_expenses(path)

    def test_missing_file_raises_oserror(self):
        with self.assertRaises(FileNotFoundError):
            read_expenses(self.dir / "fehlt.csv")

    def test_quoted_field_with_semicolon(self):
        expenses, errors = read_expenses(self.write('2026-03-02;Miete;850,00;"März; Nachzahlung"\n'))
        self.assertEqual((len(expenses), len(errors)), (1, 0))
        self.assertEqual(expenses[0].note, "März; Nachzahlung")
