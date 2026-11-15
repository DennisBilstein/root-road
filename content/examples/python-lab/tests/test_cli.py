import contextlib
import io
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from expenses.cli import main

DATA = Path(__file__).resolve().parent.parent / "data"


def run(*argv: str) -> tuple[int, str, str]:
    out, err = io.StringIO(), io.StringIO()
    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
        try:
            code = main(list(argv))
        except SystemExit as exit_:  # argparse beendet das Programm selbst
            code = int(exit_.code)
    return code, out.getvalue(), err.getvalue()


class Cli(unittest.TestCase):
    def test_valid_file_exits_zero(self):
        code, out, err = run(str(DATA / "ausgaben.csv"))
        self.assertEqual((code, err), (0, ""))
        self.assertIn("2.263,50 €", out)

    def test_invalid_rows_exit_one_but_valid_rows_are_reported(self):
        code, out, err = run(str(DATA / "fehlerhaft.csv"))
        self.assertEqual(code, 1)
        self.assertIn("859,99 €", out)
        self.assertEqual(len(err.strip().splitlines()), 6)
        self.assertIn("Zeile 3:", err)

    def test_missing_file_exits_two(self):
        code, out, err = run(str(DATA / "fehlt.csv"))
        self.assertEqual((code, out), (2, ""))
        self.assertIn("Datei nicht lesbar", err)

    def test_wrong_encoding_exits_two(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "latin1.csv"
            path.write_bytes("2026-03-02;Café;3,50\n".encode("latin-1"))
            code, _, err = run(str(path))
        self.assertEqual(code, 2)
        self.assertIn("Datei nicht lesbar", err)

    def test_no_argument_is_an_argparse_error(self):
        code, _, err = run()
        self.assertEqual(code, 2)
        self.assertIn("datei", err)

    def test_module_entry_point_in_a_subprocess(self):
        result = subprocess.run([sys.executable, "-m", "expenses", str(DATA / "ausgaben.csv")], capture_output=True, text=True, encoding="utf-8", cwd=DATA.parent, check=False)
        self.assertEqual(result.returncode, 0)
        self.assertIn("Gesamt", result.stdout)
