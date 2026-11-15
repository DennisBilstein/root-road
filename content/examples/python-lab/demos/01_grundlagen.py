"""Lektion 1: Werte, Wahrheitswerte, Zahlen und die Falle mit veränderlichen Standardwerten."""
from decimal import Decimal


def collect_bad(item, bag=[]):  # der Standardwert wird einmal beim Definieren erzeugt und dann geteilt
    bag.append(item)
    return bag


def collect_ok(item, bag=None):
    if bag is None:
        bag = []
    bag.append(item)
    return bag


print("Standardwert [] :", collect_bad("a"), collect_bad("b"))
print("Standardwert None:", collect_ok("a"), collect_ok("b"))

print("0.1 + 0.2        :", 0.1 + 0.2, "| gleich 0.3?", 0.1 + 0.2 == 0.3)
print("Decimal          :", Decimal("0.1") + Decimal("0.2"), "| gleich 0.3?", Decimal("0.1") + Decimal("0.2") == Decimal("0.3"))
print("round(2.5), round(3.5):", round(2.5), round(3.5), "(rundet zur geraden Zahl)")
print("7 // 2, -7 // 2, 7 % 3, -7 % 3:", 7 // 2, -7 // 2, 7 % 3, -7 % 3)
print("bool('')/bool('0')/bool([])/bool([0]):", bool(""), bool("0"), bool([]), bool([0]))
text = "Käse"
print("len('Käse'), len(text.encode('utf-8')):", len(text), len(text.encode("utf-8")))
first, second = [1, 2], [1, 2]
print("== vs is :", first == second, first is second, "(gleicher Inhalt, aber zwei Objekte)")
