/* Werkstattaufgaben der Spur python. Wird erst geladen, wenn die Spur in der Werkstatt geöffnet wird. */
(function(){
var W=window.RP_WS,L=W.L,need=W.need,bad=W.bad;
W.add('python',[
{id:'python-w1',modules:['py-m1'],level:'schwer',type:'write',language:'python',rows:36,
  title:'Datei einlesen mit eigener Fehlerklasse',
  text:'Schreibe ein Python-Modul, das Zeilen der Form "Thema, Minuten" aus einer Datei in unveränderliche Objekte umwandelt und Fehler mit Zeilennummer meldet.',
  details:['from dataclasses import dataclass und from pathlib import Path.','class ParseError(ValueError): ein Fehlertyp ohne weiteren Inhalt.','@dataclass(frozen=True) class Entry mit topic: str und minutes: int.','def parse_line(line: str) -> Entry: teilt mit line.partition(","); fehlt das Komma, wirf ParseError. Das Thema wird mit strip() bereinigt und darf nicht leer sein. Minuten per int(…); bei ValueError wirf ParseError und verkette mit "from error". Minuten unter 1 sind ein ParseError.','def load_entries(path: Path) -> list[Entry]: öffnet die Datei mit with path.open(encoding="utf-8") as handle, liest mit for number, line in enumerate(handle, start=1), überspringt leere Zeilen und meldet Fehler als ParseError(f"Zeile {number}: {error}") from error.','Kein except: ohne Typ, kein pass im except, keine veränderlichen Standardargumente, kein open() ohne with.'],
  starter:L('# Schreibe hier dein Modul','',''),
  rules:[
    need('from dataclasses import dataclass',/^from\s+dataclasses\s+import\s+dataclass\s*$/m),
    need('from pathlib import Path',/^from\s+pathlib\s+import\s+Path\s*$/m),
    need('class ParseError(ValueError)',/^class\s+ParseError\s*\(\s*ValueError\s*\)\s*:/m),
    need('@dataclass(frozen=True) class Entry',/^@dataclass\s*\(\s*frozen\s*=\s*True\s*\)\s*\nclass\s+Entry\s*:/m),
    need('Felder topic und minutes mit Typen',/\btopic\s*:\s*str\b[\s\S]*\bminutes\s*:\s*int\b/),
    need('def parse_line(line: str) -> Entry',/^def\s+parse_line\s*\(\s*line\s*:\s*str\s*\)\s*->\s*Entry\s*:/m),
    need('partition(",")',/\.\s*partition\s*\(\s*["'],["']\s*\)/),
    need('int(…) mit Fehlerverkettung',/\bexcept\s+ValueError\s+as\s+(\w+)\s*:[\s\S]*raise\s+ParseError\s*\([^\n]*\)\s+from\s+\1\b/),
    need('def load_entries(path: Path) -> list[Entry]',/^def\s+load_entries\s*\(\s*path\s*:\s*Path\s*\)\s*->\s*list\s*\[\s*Entry\s*\]\s*:/m),
    need('with path.open(encoding="utf-8")',/\bwith\s+path\s*\.\s*open\s*\(\s*encoding\s*=\s*["']utf-8["']\s*\)\s+as\s+\w+\s*:/),
    need('enumerate(…, start=1)',/\benumerate\s*\(\s*\w+\s*,\s*start\s*=\s*1\s*\)/),
    need('Zeilennummer in der Meldung',/\braise\s+ParseError\s*\(\s*f["']Zeile\s*\{\s*number\s*\}:\s*\{\s*\w+\s*\}["']\s*\)\s+from\s+\w+/),
    bad(/\bexcept\s*:/,'Ein nacktes except fängt alles, auch Abbruch mit Strg+C. Nenne den Fehlertyp.'),
    bad(/\bexcept\b[^\n]*:\s*\n\s*pass\b/,'except mit pass verschluckt den Fehler.'),
    bad(/(?<!with\s)(?<!\.)\bopen\s*\([^)]*\)(?!\s+as\b)/,'Öffne Dateien mit with, damit sie auch bei Fehlern geschlossen werden.',/\bwith\s+path\s*\.\s*open/),
    bad(/\bdef\s+\w+\s*\([^)]*=\s*(?:\[\s*\]|\{\s*\})/,'Veränderliche Standardargumente werden zwischen Aufrufen geteilt.'),
    bad(/\bprint\s*\(/,'Fachfunktionen geben Werte zurück oder werfen Fehler, sie drucken nicht.')
  ],
  solution:L('from dataclasses import dataclass','from pathlib import Path','','','class ParseError(ValueError):','    """Eine Zeile hat nicht das erwartete Format."""','','','@dataclass(frozen=True)','class Entry:','    topic: str','    minutes: int','','','def parse_line(line: str) -> Entry:','    topic, separator, raw = line.partition(",")','    if not separator:','        raise ParseError(f"Komma fehlt: {line.strip()!r}")','    topic = topic.strip()','    if not topic:','        raise ParseError("Thema fehlt")','    try:','        minutes = int(raw.strip())','    except ValueError as error:','        raise ParseError(f"Minuten ungültig: {raw.strip()!r}") from error','    if minutes < 1:','        raise ParseError("Minuten müssen mindestens 1 sein")','    return Entry(topic, minutes)','','','def load_entries(path: Path) -> list[Entry]:','    entries: list[Entry] = []','    with path.open(encoding="utf-8") as handle:','        for number, line in enumerate(handle, start=1):','            if not line.strip():','                continue','            try:','                entries.append(parse_line(line))','            except ParseError as error:','                raise ParseError(f"Zeile {number}: {error}") from error','    return entries'),
  hint:'with schließt die Datei auch dann, wenn mitten im Lesen ein Fehler fliegt. raise … from error bewahrt die ursprüngliche Ursache im Traceback.',
  why:'Eigene Fehlertypen machen Fehler gezielt abfangbar, frozen-Dataclasses verhindern versehentliche Änderungen, und Zeilennummern in Meldungen sparen bei großen Dateien viel Suchzeit.'}
]);
})();
