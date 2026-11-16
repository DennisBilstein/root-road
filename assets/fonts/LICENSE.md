# Schriften

Diese Dateien werden vom eigenen Server ausgeliefert (kein Abruf bei Google). Sie sind Teilmengen (latin, latin-ext) im
WOFF2-Format der folgenden Open-Source-Schriften, bezogen über Google Fonts:

| Schrift | Dateien | Quelle |
|---|---|---|
| Root Road Serif (umbenannte, beschnittene Fassung von Source Serif 4; variabel, Achsen opsz und wght) | `root-road-serif-variable-*.woff2` | Original: https://fonts.google.com/specimen/Source+Serif+4 |
| IBM Plex Sans (variabel, Achse wght) | `ibm-plex-sans-variable-*.woff2` | https://fonts.google.com/specimen/IBM+Plex+Sans |
| IBM Plex Mono (Schnitte 400, 500, 600) | `ibm-plex-mono-*.woff2` | https://fonts.google.com/specimen/IBM+Plex+Mono |

Alle drei stehen unter der **SIL Open Font License 1.1** (https://openfontlicense.org/). Die Lizenz erlaubt Nutzung, Einbettung und
Weitergabe, auch kommerziell, solange die Schriften nicht für sich allein verkauft werden und der Lizenztext erhalten bleibt.
Urheber laut Google Fonts: Source Serif 4 (Grundlage von Root Road Serif) – Adobe, IBM Plex – IBM Corp. Den vollständigen Lizenztext und die genauen
Copyright-Zeilen findest du auf den verlinkten Seiten; sie sind hier nicht abgeschrieben.

## Änderungen an Source Serif 4 (Root Road Serif)

Die Schrift „Root Road Serif“ ist eine veränderte Fassung von Source Serif 4 (Adobe, SIL OFL 1.1). Der Hersteller hat den Namen „Source“ als Reserved Font Name
reserviert; veränderte Fassungen dürfen ihn nicht führen. Deshalb heißt die Fassung hier anders (15./16.11.2026, mit fontTools):

- Achsen beschnitten: `wght` auf 400–700 und `opsz` auf 14–36, also auf die in der App genutzten Bereiche. Glyphen und Zeichnung sind unverändert.
- Umbenannt: Familienname, vollständiger Name, PostScript-Name und eindeutige Kennung in der Namenstabelle lauten „Root Road Serif …“; die Dateien heißen `root-road-serif-variable-*.woff2`.
- Erhalten: die Copyright-Zeile („© 2014 - 2021 Adobe Systems Incorporated …, with Reserved Font Name ‘Source’“), die Versionsangabe und der Lizenzverweis.
  Entfallen sind nur Bezeichnungen von Schriftschnitten, die es in den beschnittenen Achsen nicht mehr gibt.

Die Umbenennung folgt der Regel der OFL zum Reserved Font Name; ob sie in jeder Hinsicht ausreicht, bleibt eine Rechtsfrage (Vorlage, keine Rechtsberatung).
