"""Lektion 4: Ausnahmen, else/finally, Verkettung und Kontextmanager."""
import contextlib


class ConfigError(Exception):
    """Eigene Ausnahme: sagt, was fachlich schiefging."""


def parse_port(text):
    try:
        port = int(text)
    except ValueError as error:
        raise ConfigError(f"Port '{text}' ist keine Zahl") from error
    if not 1 <= port <= 65535:
        raise ConfigError(f"Port {port} liegt außerhalb von 1 bis 65535")
    return port


def attempt(text):
    log = []
    try:
        log.append("try")
        port = parse_port(text)
    except ConfigError as error:
        log.append(f"except({error})")
        cause = type(error.__cause__).__name__ if error.__cause__ else "keine"
        log.append(f"Ursache={cause}")
    else:
        log.append(f"else({port})")
    finally:
        log.append("finally")
    return " -> ".join(log)


for value in ["8080", "abc", "70000"]:
    print(f"{value!r:8}", attempt(value))


@contextlib.contextmanager
def step(name, log):
    log.append(f"{name}: öffnen")
    try:
        yield
    finally:
        log.append(f"{name}: schließen")  # läuft auch bei Fehlern


log = []
try:
    with step("A", log), step("B", log):
        log.append("Arbeit")
        1 / 0
except ZeroDivisionError as error:
    log.append(f"gefangen: {error}")
print("Reihenfolge     :", " | ".join(log))

with contextlib.suppress(FileNotFoundError):
    open("/diese/datei/gibt/es/nicht")
print("suppress        : FileNotFoundError bewusst ignoriert")

try:
    try:
        {}["fehlt"]
    except KeyError:
        pass  # Anti-Muster: der Fehler verschwindet, niemand erfährt davon
    print("still verschluckt: das Programm läuft weiter, ohne Spur")
    raise ConfigError("sichtbar")
except ConfigError as error:
    print("sichtbar        :", error)
print("Hierarchie      :", [cls.__name__ for cls in KeyError.__mro__])
