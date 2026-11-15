"""Lektion 5: dataclass, Typhinweise (nicht erzwungen), slots und Vergleich."""
from dataclasses import FrozenInstanceError, dataclass, field, replace
from decimal import Decimal


@dataclass(frozen=True, order=True, slots=True)
class Money:
    amount: Decimal
    currency: str = "EUR"

    def __add__(self, other):
        if not isinstance(other, Money) or other.currency != self.currency:
            return NotImplemented
        return Money(self.amount + other.amount, self.currency)


a, b = Money(Decimal("1.10")), Money(Decimal("2.20"))
print("Darstellung     :", a)
print("Addition        :", a + b)
print("Vergleich       :", a == Money(Decimal("1.10")), a < b)
print("Menge/Schlüssel :", len({a, Money(Decimal("1.10"))}), "(hashbar, weil frozen)")
print("kopieren/ändern :", replace(a, currency="USD"))
try:
    a.amount = Decimal("9")
except FrozenInstanceError as error:
    print("unveränderlich  :", type(error).__name__)
try:
    a + Money(Decimal("1"), "USD")
except TypeError as error:
    print("Währungsmix     :", type(error).__name__, "->", error)


@dataclass
class Basket:
    items: list[str] = field(default_factory=list)  # eigene Liste je Objekt, kein geteilter Standardwert


x, y = Basket(), Basket()
x.items.append("Brot")
print("default_factory :", x.items, y.items)


@dataclass
class Port:
    value: int  # Typhinweis: gilt für Leser und Werkzeuge, nicht zur Laufzeit


print("Typhinweis      :", Port("kein int"), "(keine Prüfung durch Python)")
@dataclass(slots=True)
class Point:
    x: int


point = Point(1)
try:
    point.z = 2  # Tippfehler im Attributnamen fällt sofort auf, statt still ein neues Attribut anzulegen
except AttributeError as error:
    print("slots           :", type(error).__name__, "bei neuem Attribut")
