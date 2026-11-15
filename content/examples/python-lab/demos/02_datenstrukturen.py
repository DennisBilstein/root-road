"""Lektion 2: Listen, Wörterbücher, Mengen, Comprehensions, Generatoren und flache Kopien."""
import copy
from collections import Counter

words = ["Miete", "Kultur", "Lebensmittel", "Kultur", "Lebensmittel", "Lebensmittel"]
print("Counter            :", dict(Counter(words)))
print("häufigste zuerst   :", Counter(words).most_common(2))

prices = {"Brot": 3.2, "Käse": 2.5, "Apfel": 0.4}
print("sortiert nach Preis:", sorted(prices, key=prices.get))
print("sortiert, absteigend:", sorted(prices.items(), key=lambda item: item[1], reverse=True))
print("Comprehension      :", {name: round(price * 1.19, 2) for name, price in prices.items() if price > 1})

a, b = {"x", "y", "z"}, {"y", "z", "w"}
print("Mengen             :", sorted(a & b), sorted(a | b), sorted(a - b), sorted(a ^ b))

squares = (n * n for n in range(5))  # Generator: berechnet erst beim Durchlaufen
print("Generator, 1. Lauf :", sum(squares), "| 2. Lauf:", sum(squares), "(bereits verbraucht)")

grid_bad = [[0] * 2] * 2  # beide Zeilen sind dasselbe Objekt
grid_bad[0][0] = 1
grid_ok = [[0] * 2 for _ in range(2)]
grid_ok[0][0] = 1
print("[[0]*2]*2          :", grid_bad, "| korrekt:", grid_ok)

original = {"tags": ["a"]}
shallow, deep = original.copy(), copy.deepcopy(original)
original["tags"].append("b")
print("flache Kopie sieht :", shallow["tags"], "| tiefe Kopie:", deep["tags"])
print("Dict behält Einfügereihenfolge:", list({"z": 1, "a": 2, "m": 3}))
