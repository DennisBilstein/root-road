import os
import subprocess
import sys
import unittest
from pathlib import Path

LAB = Path(__file__).resolve().parent.parent


class Demos(unittest.TestCase):
    """Die Demo-Skripte der Lektionen müssen laufen und Ausgaben erzeugen; ihre Ausgaben stehen in den Lektionen."""

    def test_every_demo_runs_cleanly(self):
        demos = sorted((LAB / "demos").glob("0*.py"))
        self.assertEqual(len(demos), 5)
        env = {**os.environ, "PYTHONDONTWRITEBYTECODE": "1", "PYTHONUTF8": "1"}
        for demo in demos:
            with self.subTest(demo=demo.name):
                result = subprocess.run([sys.executable, "-W", "error", str(demo)], capture_output=True, text=True, encoding="utf-8", cwd=LAB, env=env, check=False)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(result.stderr, "")
                self.assertGreater(len(result.stdout.splitlines()), 5)
