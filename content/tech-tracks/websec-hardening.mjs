// Web-Sicherheit · Anwendungen härten. Stichtag 14.11.2026.
// Eigene Texte; Code und Tests liegen unter content/examples/websec-lab/ (Node.js 22.23 lokal, 24.22 im Container, node:test).
// Alle Beispiele sind defensiv und laufen nur gegen eigene Lehrfunktionen; Geheimnisse und Token in den Tests sind erfunden.
const lab = 'content/examples/websec-lab/';
const docs = (title, url, note = 'Offizielle Dokumentation; Inhalt hier eigenständig zusammengefasst.') => ({ title, url, note });
const cheat = (title, page) => docs(`OWASP Cheat Sheet: ${title}`, `https://cheatsheetseries.owasp.org/cheatsheets/${page}.html`, 'Praxisempfehlungen von OWASP; Inhalt hier eigenständig zusammengefasst.');
const top10 = (title, page) => docs(`OWASP Top 10:2025 – ${title}`, `https://top10.owasp.org/2025/${page}/`, 'Kategorieseite mit der CWE-Zuordnung (am 14.11.2026 abgerufen).');
const rfc = (number, title) => docs(`RFC ${number}: ${title}`, `https://www.rfc-editor.org/rfc/rfc${number}`, 'Standard-Text; Inhalt hier eigenständig zusammengefasst.');
const mdn = (title, path, note) => docs(`MDN: ${title}`, `https://developer.mozilla.org/en-US/docs/${path}`, note ?? 'Referenz; Inhalt hier eigenständig zusammengefasst.');

export const module = {
  id: 'ws-m2', course: 'websec', part: 31, partTitle: 'Web-Sicherheit · Angriffe verstehen, Anwendungen härten',
  title: 'Web-Sicherheit Härtung · Passwörter, Sitzungen, Token, Header und Betrieb',
};

export const lessons = [
  {
    id: 'ws-m2-l1', title: 'Passwörter und Sitzungen: Hashing, Sitzungskennungen und Zeitlimits', minutes: 50,
    prerequisites: 'Modul „Web-Sicherheit Grundlagen“, besonders Lektion „CSRF, CORS und Cookies“; Kenntnisse zu Hash-Funktionen sind hilfreich.',
    objectives: [
      'Erklären, warum Passwörter nie im Klartext und nie mit schnellen Hash-Funktionen gespeichert werden',
      'Passwörter mit scrypt oder Argon2id, Salz und konstantem Vergleich speichern und bei schwächeren Kosten neu hashen',
      'Serverseitige Sitzungen mit zufälliger Kennung, gehashter Ablage, Rotation und zwei Zeitlimits aufbauen',
      'Anmelde-Schutz (Begrenzung von Versuchen, neutrale Fehlermeldungen) einordnen',
    ],
    simple: `Wer ein Passwort speichert, speichert es nicht, sondern einen Fingerabdruck davon (Hash). Beim Anmelden wird das eingegebene Passwort genauso verarbeitet und die Ergebnisse werden verglichen. Wird die Datenbank gestohlen, sollen die Angreifer daraus möglichst wenig machen können. Dafür braucht der Hash drei Eigenschaften: Er ist langsam und speicherhungrig (damit Ausprobieren von Milliarden Passwörtern teuer wird), er enthält ein zufälliges Salz pro Passwort (damit gleiche Passwörter verschiedene Hashes haben und fertige Tabellen nichts nützen) und er wird in konstanter Zeit verglichen.

Schnelle Hash-Funktionen wie SHA-256 sind dafür ungeeignet, weil Grafikkarten Milliarden davon pro Sekunde berechnen. Geeignet sind Argon2id (die Empfehlung von OWASP), scrypt, bcrypt oder PBKDF2 mit hoher Iterationszahl. Dieses Lab nutzt scrypt (in Node.js eingebaut) mit den OWASP-Mindestwerten N = 2^17, r = 8, p = 1 und Argon2id, sobald Node.js es mitbringt (ab Version 24.7). Im Hash steht auch das Verfahren mit seinen Kosten, damit sich die Kosten später erhöhen lassen: Nach einer erfolgreichen Anmeldung prüft die Anwendung, ob der gespeicherte Hash schwächer ist als die aktuelle Vorgabe, und speichert dann einen neuen.

Nach der Anmeldung braucht der Browser einen Beleg, dass die Person angemeldet ist: die Sitzung. Die serverseitige Variante gibt eine lange Zufallskennung (256 Bit) in ein Cookie und merkt sich auf dem Server, wem sie gehört. Wichtig sind: nur den Hash der Kennung speichern (ein Datenbank-Leck gibt dann keine nutzbaren Sitzungen preis), nach der Anmeldung eine neue Kennung ausgeben (gegen Session Fixation), zwei Zeitlimits (Leerlauf und absolute Höchstdauer) und beim Passwortwechsel alle Sitzungen beenden.`,
    steps: [
      'check() normalisiert das Passwort mit NFKC und begrenzt die Länge auf 1 bis 1024 Zeichen. Normalisierung sorgt dafür, dass ü als ein Zeichen und als u mit Trema gleich behandelt werden; die Längenbegrenzung verhindert, dass riesige Eingaben die Berechnung zum Überlasten nutzen.',
      'hashPassword erzeugt 16 Zufallsbytes als Salz, berechnet scrypt (Standard N = 2^17, r = 8, p = 1, 64 Byte) und liefert eine Zeichenkette der Form scrypt$N$r$p$Salz$Hash. Zwei Hashes desselben Passworts unterscheiden sich, weil das Salz anders ist.',
      'Der Speicherbedarf von scrypt beträgt etwa 128 · N · r Byte; bei N = 2^17 und r = 8 sind das 128 MiB pro Berechnung. maxmem wird entsprechend gesetzt. Rechne mit dieser Last pro gleichzeitiger Anmeldung und begrenze die Zahl paralleler Anmeldungen.',
      'Wenn crypto.argon2Sync vorhanden ist (Node.js ab 24.7), kann algorithm: "argon2id" gewählt werden (Standard: 19 456 KiB, 2 Durchläufe, Parallelität 1). Auf Node.js 22.23 bleibt der Test übersprungen; auf 24.22 lief er im Container grün.',
      'verifyPassword liest Verfahren und Kosten aus der gespeicherten Zeichenkette und prüft sie, bevor gerechnet wird: Eine manipulierte Datenbankzeile mit riesigem N würde sonst den Server lahmlegen. Ungültiges liefert false, nie eine Ausnahme.',
      'Der Vergleich nutzt timingSafeEqual, damit die Antwortzeit nicht verrät, wie viele Bytes übereinstimmen. Leeres, zu langes oder falsches Passwort und kaputte Hash-Zeichenketten ergeben false.',
      'needsRehash meldet true, wenn der gespeicherte Hash schwächer ist als die heutige Vorgabe (kleineres N oder r bzw. weniger Speicher oder Durchläufe). Nach erfolgreicher Anmeldung berechnest du dann mit dem eingegebenen Passwort einen neuen Hash.',
      'createSessionStore erzeugt Kennungen mit 32 Zufallsbytes (base64url) und speichert nur den SHA-256-Hash. rotate() löscht die alte Kennung und gibt eine neue aus, destroyAllFor() beendet alle Sitzungen einer Person. get() beendet Sitzungen nach 30 Minuten Leerlauf oder 8 Stunden Gesamtdauer (im Test mit kürzeren Zeiten).',
      'Ergänzende Maßnahmen, die das Lab nicht umsetzt: Begrenzung von Anmeldeversuchen pro Konto und Adresse (mit Verzögerung statt dauerhafter Sperre, damit Fremde niemanden aussperren können), eine neutrale Meldung („Benutzername oder Passwort falsch“) und Mehr-Faktor-Anmeldung. Sie sind in dieser Lektion nur beschrieben, nicht ausgeführt.',
    ],
    background: `Warum ein Salz und ein langsamer Hash? Ein Angreifer mit gestohlener Datenbank probiert Passwörter offline aus, unbegrenzt schnell und parallel. Das Salz macht jeden Hash einzigartig, sodass er jedes Passwort einzeln angreifen muss. Die Kosten (Rechenzeit und Speicher) bestimmen, wie viele Versuche pro Sekunde möglich sind. Speicherhungrige Verfahren wie scrypt und Argon2id verteuern vor allem Angriffe mit Grafikkarten und Spezialchips. Die konkreten Zahlen ändern sich mit der Hardware; OWASP nennt als Mindestwerte Argon2id mit 19 MiB, 2 Durchläufen und Parallelität 1 sowie scrypt mit N = 2^17, r = 8, p = 1 (Stand 14.11.2026 geprüft). Prüfe die aktuelle Empfehlung bei jeder Auffrischung der Anwendung.

Welche Passwort-Regeln sind sinnvoll? Eine Mindestlänge (etwa 8 bis 12 Zeichen, besser länger), Erlaubnis für lange Passphrasen und alle Zeichen, Abgleich mit Listen bekannter Passwörter und keine erzwungene Komplexität oder regelmäßige Änderung ohne Anlass. Das entspricht den aktuellen Empfehlungen der Richtlinie NIST SP 800-63B; sie wurde hier nicht erneut geprüft. Eine Passwort-Verwaltung der Nutzer und Passkeys (WebAuthn) sind die besseren Wege; Passkeys wurden im Lab nicht umgesetzt.

Warum nur den Hash der Sitzungskennung speichern? Die Kennung ist wie ein Passwort: Wer sie kennt, ist angemeldet. Liegt sie im Klartext in der Datenbank, genügt ein lesender Fehler (zum Beispiel eine SQL-Injection), um alle Sitzungen zu übernehmen. Da die Kennung 256 Bit Zufall enthält, reicht ein schneller Hash; ein langsamer wäre unnötig. Beachte auch: Kennungen gehören in ein Cookie mit HttpOnly, Secure und SameSite (siehe Lektion zu CSRF), nicht in die Adresse.

Zustandslose Sitzungen (ein signiertes Token im Cookie) sparen den Speicher, lassen sich aber schwer widerrufen: Das Token bleibt bis zum Ablauf gültig. Für klassische Webanwendungen sind serverseitige Sitzungen meist die einfachere und sicherere Wahl; mehr zu Token in der nächsten Lektion.`,
    terms: [
      { term: 'Hash', text: 'Fester Fingerabdruck eines Werts; aus ihm lässt sich der Wert nicht zurückrechnen.' },
      { term: 'Salz (Salt)', text: 'Zufallswert pro Passwort, der gleiche Passwörter unterscheidbar macht.' },
      { term: 'scrypt / Argon2id', text: 'Absichtlich langsame und speicherhungrige Verfahren zum Speichern von Passwörtern.' },
      { term: 'Session Fixation', text: 'Angreifer gibt dem Opfer eine bekannte Sitzungskennung vor, die nach der Anmeldung gültig wird.' },
      { term: 'Rotation', text: 'Nach Anmeldung oder Rechteänderung wird die Kennung durch eine neue ersetzt.' },
    ],
    code: { file: lab + 'src/auth/password.js', lang: 'JavaScript' },
    code2: { file: lab + 'src/auth/session.js', lang: 'JavaScript' },
    code3: { file: lab + 'tests/auth.test.js', lang: 'JavaScript', from: "test('Passwort: Salz, Verifikation", to: "await assert.rejects(hashPassword(12345, FAST), RangeError);", plus: 1 },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: `Tests Passwort und Sitzung (Node 22.23): 5 Tests, 4 grün, 1 übersprungen (Argon2id: crypto.argon2Sync fehlt vor Node.js 24.7).
Node 24.22 im Container: alle Tests grün, einschließlich Argon2id.
Gespeichertes Format: scrypt$131072$8$1$<Salz base64>$<Hash base64>   (zwei Hashes desselben Passworts sind verschieden)
verifyPassword mit manipulierten Kosten (N = 1, N = 3, N = 4294967296) -> false, ohne zu rechnen
Sitzung: 256-Bit-Kennung; im Speicher nur der Hash; alte Kennung nach rotate() ungültig; Leerlauf und absolute Höchstdauer beenden die Sitzung
Nicht ausgeführt: Begrenzung von Anmeldeversuchen, Mehr-Faktor-Anmeldung, Passkeys, Passwortlisten-Abgleich.`,
    mistakes: [
      { wrong: 'Passwörter mit SHA-256, MD5 oder einem eigenen Verfahren hashen.', why: 'Schnelle Hashes lassen sich mit Grafikkarten milliardenfach pro Sekunde ausprobieren.', fix: 'Argon2id oder scrypt (bcrypt, PBKDF2 mit hoher Iterationszahl als Alternative) mit Salz und aktuellen Kosten.' },
      { wrong: 'Hash-Parameter fest im Code zu verdrahten und nie zu erhöhen.', why: 'Hardware wird schneller; alte Hashes bleiben auf dem Stand von damals.', fix: 'Verfahren und Kosten im Hash speichern und nach erfolgreicher Anmeldung mit needsRehash neu hashen.' },
      { wrong: 'Sitzungskennungen im Klartext zu speichern oder aus vorhersagbaren Werten (Zähler, Uhrzeit) zu bilden.', why: 'Ein Datenbank-Leck oder Raten übernimmt Sitzungen.', fix: '256 Bit Zufall aus einem kryptografischen Zufallsgenerator, nur der Hash wird gespeichert.' },
      { wrong: 'Die Kennung nach der Anmeldung zu behalten.', why: 'Eine vorher untergeschobene Kennung (Session Fixation) wird zum Zugang des Angreifers.', fix: 'Nach Anmeldung und Rechteänderung rotieren; beim Passwortwechsel alle Sitzungen beenden.' },
    ],
    practice: 'Prüfe, wie deine Anwendung Passwörter speichert und Sitzungen verwaltet: Verfahren, Kosten, Salz, Länge der Kennung, Cookie-Attribute, Zeitlimits, Verhalten bei Passwortwechsel. Ergänze needsRehash nach der Anmeldung und eine Begrenzung von Anmeldeversuchen mit eigenem Test.',
    exercises: [
      { task: 'Schreibe eine Funktion login(users, store, name, password), die verifyPassword nutzt, bei Erfolg needsRehash auswertet und eine neue Sitzung ausgibt; teste sie mit schwächeren Kosten.', acceptance: 'Falsche Anmeldung liefert immer dieselbe Meldung; bei schwachem Hash wird nach Erfolg ein neuer gespeichert; die alte Sitzungskennung ist nach dem Login ungültig.' },
      { task: 'Grenzfall: Was passiert bei einem Passwort mit genau 1024 und mit 1025 Zeichen, bei einem leeren Passwort und bei Emoji-Zeichen?', acceptance: '1024 Zeichen werden gehasht, 1025 und leer lösen RangeError aus bzw. liefern bei verifyPassword false; Emoji funktionieren, weil NFKC sie unverändert lässt; du begründest die Obergrenze.' },
      { task: 'Fehlerfall: Setze in einer Testdatenbank den gespeicherten Hash auf scrypt$4294967296$8$1$AAAA$AAAA. Wie verhält sich verifyPassword, und warum ist das wichtig?', acceptance: 'false, ohne zu rechnen; du erklärst, dass sonst manipulierte Zeilen den Server überlasten könnten.' },
    ],
    quiz: [
      { q: 'Warum ist SHA-256 allein zum Speichern von Passwörtern ungeeignet?',
        options: ['Es ist so schnell, dass Angreifer Milliarden Kandidaten pro Sekunde ausprobieren können.', 'Es erzeugt zu lange Hashes, die sich nicht mehr speichern lassen.', 'Es ist nicht deterministisch, deshalb lässt sich nichts vergleichen.', 'Es verschlüsselt das Passwort, sodass es sich umkehren lässt.'],
        correct: 0,
        rationales: ['Passwort-Hashing soll absichtlich langsam und speicherhungrig sein.', 'Die Länge ist unkritisch.', 'Es ist deterministisch; deshalb braucht man ein Salz.', 'Hashes sind nicht umkehrbar.'],
        explain: 'Passwörter gehören in Argon2id, scrypt, bcrypt oder PBKDF2 mit passenden Kosten.' },
      { q: 'Wozu dient das Salz?',
        options: ['Es macht gleiche Passwörter zu verschiedenen Hashes und entwertet vorberechnete Tabellen.', 'Es verschlüsselt die gesamte Datenbank, in der die Hashes liegen.', 'Es verkürzt die Rechenzeit der Hash-Berechnung deutlich.', 'Es ersetzt das Passwort, sodass dieses nicht mehr gespeichert wird.'],
        correct: 0,
        rationales: ['Jedes Passwort muss einzeln angegriffen werden.', 'Es verschlüsselt nichts.', 'Es ändert die Rechenzeit nicht.', 'Es kommt zum Passwort hinzu.'],
        explain: 'Das Salz ist öffentlich-unkritisch, aber pro Passwort einzigartig.' },
      { q: 'Wozu wird die Sitzungskennung nach der Anmeldung rotiert?',
        options: ['Eine vorher untergeschobene Kennung (Session Fixation) wird damit wertlos.', 'Damit das Passwort geändert wird.', 'Damit Cookies kleiner werden.', 'Damit die Sitzung nie abläuft.'],
        correct: 0,
        rationales: ['Der Angreifer kennt nur die alte Kennung.', 'Das Passwort bleibt unberührt.', 'Die Größe ändert sich nicht.', 'Zeitlimits gelten weiterhin.'],
        explain: 'Rotation trennt die Zeit vor der Anmeldung von der Zeit danach.' },
    ],
    sources: [
      top10('A07 Authentication Failures', 'A07_2025-Authentication_Failures'),
      cheat('Password Storage', 'Password_Storage_Cheat_Sheet'),
      cheat('Session Management', 'Session_Management_Cheat_Sheet'),
      cheat('Authentication', 'Authentication_Cheat_Sheet'),
      docs('Node.js: crypto (scrypt, argon2, timingSafeEqual)', 'https://nodejs.org/api/crypto.html', 'Beschreibt scrypt, argon2Sync (ab Node.js 24.7) und timingSafeEqual.'),
    ],
    verification: 'Lab websec-lab: Hashing mit scrypt (auch mit den OWASP-Mindestkosten), Normalisierung, Kostenprüfung, Neu-Hashen und Sitzungen wurden auf Node.js 22.23 getestet; Argon2id lief auf Node.js 24.22 im Container. Die OWASP-Mindestwerte wurden am 14.11.2026 geprüft. NICHT geprüft: Messung der Rechenzeit auf Zielhardware, Begrenzung von Anmeldeversuchen, Mehr-Faktor-Anmeldung, Passkeys, NIST-Richtlinie, Sitzungen über mehrere Server.',
  },
  {
    id: 'ws-m2-l2', title: 'Token, JWT und OAuth: Prüfen statt Dekodieren', minutes: 50,
    prerequisites: 'Lektion „Passwörter und Sitzungen“; Grundwissen zu HMAC und Base64.',
    objectives: [
      'Aufbau eines JSON Web Token (JWT) erklären und Dekodieren von Prüfen unterscheiden',
      'Typische JWT-Fehler erkennen: alg=none, Algorithmus-Verwechslung, fehlende Ablaufzeit, falsche Zielgruppe',
      'Den Autorisierungscode-Ablauf mit PKCE, state und genauer Weiterleitungsadresse beschreiben',
      'Entscheiden, wann Token und wann serverseitige Sitzungen sinnvoll sind',
    ],
    simple: `Ein JSON Web Token (JWT) ist eine Textkette aus drei Teilen, getrennt durch Punkte: Kopf (Algorithmus), Inhalt (Aussagen wie Benutzer, Aussteller, Ablaufzeit) und Signatur. Kopf und Inhalt sind nur Base64-kodiert, nicht verschlüsselt: Jeder kann sie lesen. Die Signatur beweist, dass der Aussteller den Inhalt so erstellt hat und er nicht verändert wurde. Dekodieren ist deshalb nicht Prüfen: Ein Programm, das nur den Inhalt liest und glaubt, lässt jede Fälschung durch.

Eine korrekte Prüfung hat feste Schritte. Aufbau prüfen; den Algorithmus nie aus dem Token übernehmen, sondern aus der Konfiguration des Servers vorgeben (so scheitern „alg: none“, das keine Signatur verlangt, und Verwechslungen zwischen Verfahren); Signatur in konstanter Zeit vergleichen; erst danach die Aussagen prüfen: Ablaufzeit (exp, zwingend), frühester Zeitpunkt (nbf), Aussteller (iss) und Zielgruppe (aud) müssen zur eigenen Anwendung passen. Ein Token für eine andere Schnittstelle darf bei dir nicht gelten.

OAuth 2.0 und OpenID Connect lassen Nutzer sich bei einem Anbieter anmelden und geben der Anwendung ein Ergebnis (Code, dann Token). Der empfohlene Ablauf ist der Autorisierungscode mit PKCE (Proof Key for Code Exchange): Die Anwendung erzeugt einen Zufallswert (verifier), schickt dessen Hash (challenge) mit der Anmeldeanfrage und beweist beim Eintauschen des Codes, dass sie den Wert kennt. Ein abgefangener Code nützt dann nichts. Dazu kommen ein zufälliger state-Wert (gegen CSRF im Anmeldefluss) und die genaue Prüfung der Weiterleitungsadresse beim Anbieter.`,
    steps: [
      'signJwt baut Kopf { alg: HS256, typ: JWT } und Inhalt, signiert beides mit HMAC-SHA256 und verlangt ein Geheimnis von mindestens 32 Byte. Kürzere Geheimnisse lassen sich erraten und werden mit RangeError abgelehnt.',
      'verifyJwt lehnt Token über 4096 Zeichen und falschen Aufbau (nicht genau drei Teile, kein gültiges JSON) mit „Token ungültig“ ab. Die Fehlermeldungen verraten bewusst wenig; intern kannst du den genauen Grund protokollieren.',
      'Der Kopf muss alg: HS256 enthalten, sonst „Algorithmus nicht erlaubt“. Der Test deckt alg: none, RS256, HS512 und hs256 (Kleinschreibung) ab. Der Server entscheidet über den Algorithmus, nicht das Token.',
      'Die Signatur wird neu berechnet und mit timingSafeEqual verglichen, nachdem die Länge geprüft wurde. Fehlende, verkürzte oder fremde Signaturen und ein anderes Geheimnis scheitern mit „Signatur ungültig“; ein geänderter Inhalt mit der alten Signatur ebenso.',
      'Danach folgen die Aussagen: exp ist Pflicht und muss eine Zahl sein; abgelaufene Token scheitern (30 Sekunden Toleranz für leicht abweichende Uhren), nbf in der Zukunft ebenso, iss und aud müssen passen, wenn sie erwartet werden. Der Test deckt jeden dieser Fälle ab.',
      'decodeUnsafe liest nur den Inhalt, ohne etwas zu prüfen. Der Test zeigt: Das gefälschte Token mit sub „root“ lässt sich problemlos lesen, die Prüfung weist es aber ab. Nutze Dekodieren höchstens zur Fehlersuche, nie für Entscheidungen.',
      'createVerifier erzeugt 32 Zufallsbytes (43 Zeichen base64url); challengeS256 bildet den SHA-256-Hash. Der Test nutzt den Testvektor aus RFC 7636 (Anhang B) und erhält genau die dort angegebene challenge (der Wert steht im Beleg unten).',
      'buildAuthorizationUrl baut die Anmeldeadresse nur für https-Endpunkte und hängt response_type=code, client_id, redirect_uri, scope, state, code_challenge und code_challenge_method=S256 an. checkState vergleicht den zurückgegebenen state in konstanter Zeit mit dem gespeicherten.',
      'isRegisteredRedirect akzeptiert nur Adressen, die genau einer registrierten entsprechen: kein Präfix, kein Muster, keine Zusatzparameter. Der Test lehnt .../cb/../evil, .../cb?x=1 und app.example.evil.example/cb ab. Das Eintauschen des Codes gegen Token beim Anbieter wurde im Lab nicht gebaut.',
    ],
    background: `Wann Token, wann Sitzung? Token sind praktisch, wenn mehrere Dienste (Schnittstellen, Microservices) einem Anbieter vertrauen sollen, ohne gemeinsam eine Sitzungsablage zu nutzen. Der Preis: Sie lassen sich bis zum Ablauf kaum widerrufen. Deshalb sollten Zugriffs-Token kurz leben (Minuten), und ein Widerruf braucht eine Sperrliste oder kurze Laufzeiten mit Erneuerung. Für eine klassische Webanwendung mit eigener Anmeldung sind serverseitige Sitzungen mit Cookie meist einfacher und sicherer, weil man sie sofort beenden kann. Ein Token im Local Storage ist für Skripte lesbar (XSS), ein Cookie mit HttpOnly nicht.

Warum Algorithmus aus der Konfiguration? Frühere Bibliotheken haben dem Kopf des Tokens vertraut: alg: none hieß „keine Signatur nötig“, und bei RS256 (öffentlicher Schlüssel) konnte ein Angreifer HS256 behaupten und mit dem öffentlichen Schlüssel als Geheimnis signieren. Die Gegenmaßnahme ist immer dieselbe: Der Server legt fest, welches Verfahren und welcher Schlüssel gelten. RFC 8725 sammelt weitere Empfehlungen (Best Current Practices) für JWT.

Warum PKCE? Im Autorisierungscode-Ablauf wandert der Code über die Adresszeile des Browsers und kann abgefangen werden (andere App, Browser-Erweiterung, Protokolle). Ohne den verifier kann der Dieb den Code nicht eintauschen. Nach RFC 9700 (OAuth 2.0 Security Best Current Practice, am 14.11.2026 im Text nachgelesen) müssen öffentliche Clients (Browser-Anwendungen, mobile Apps) PKCE verwenden, und für vertrauliche Clients wird es empfohlen. Den impliziten Ablauf (Token direkt in der Antwort) sollen Clients nicht verwenden, außer die dort genannten Risiken sind ausgeschlossen; stattdessen gilt der Autorisierungscode-Ablauf. Für echte Projekte nimm eine geprüfte Bibliothek oder einen Anbieter; dieses Lab zeigt nur die Prüfschritte.

Grenzen dieser Lektion: Das Lab prüft nur HS256 mit gemeinsamem Geheimnis. Asymmetrische Verfahren (RS256, ES256, EdDSA) mit Schlüsselverwaltung (JWKS, Schlüsselwechsel „kid“), verschlüsselte Token (JWE) und der Tausch des Codes beim Anbieter wurden nicht gebaut und nicht geprüft.`,
    terms: [
      { term: 'JWT', text: 'Signierte Textkette mit Kopf, Aussagen und Signatur; lesbar, aber fälschungssicher, wenn richtig geprüft.' },
      { term: 'alg: none', text: 'Kopfwert „keine Signatur“; muss immer abgelehnt werden.' },
      { term: 'exp / nbf / iss / aud', text: 'Aussagen für Ablauf, frühesten Zeitpunkt, Aussteller und Zielgruppe.' },
      { term: 'PKCE', text: 'Zusatz im Autorisierungscode-Ablauf: Nur wer den geheimen verifier kennt, darf den Code eintauschen.' },
      { term: 'state', text: 'Zufallswert gegen CSRF im Anmeldefluss; muss beim Rücksprung übereinstimmen.' },
    ],
    code: { file: lab + 'src/tokens/jwt.js', lang: 'JavaScript' },
    code2: { file: lab + 'src/tokens/pkce.js', lang: 'JavaScript' },
    code3: { file: lab + 'tests/tokens.test.js', lang: 'JavaScript', from: "test('JWT: typische Angriffe", to: "assert.equal(decodeUnsafe(admin).sub, 'root');", plus: 1 },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: `Tests JWT und PKCE (Node 22.23 und 24.22): 4 Tests grün.
JWT-Angriffe im Test: alg=none, Inhalt geändert, RS256/HS512/hs256 im Kopf, kaputter Aufbau, fehlende/verkürzte Signatur, falsches Geheimnis -> alle abgelehnt
PKCE: challengeS256("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk") = E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM   (RFC 7636, Anhang B)
isRegisteredRedirect: nur exakt gleiche Adresse; Präfix, Zusatzparameter und fremde Domain mit ähnlichem Anfang werden abgelehnt
Nicht gebaut/geprüft: RS256/ES256, JWKS, Schlüsselwechsel, JWE, Code-Tausch beim Anbieter, Widerruf.`,
    mistakes: [
      { wrong: 'Dem Token-Inhalt zu vertrauen, weil er dekodiert werden kann.', why: 'Base64 ist keine Prüfung; jeder kann einen Inhalt schreiben.', fix: 'Immer Signatur und Aussagen (exp, iss, aud) prüfen, bevor etwas aus dem Token verwendet wird.' },
      { wrong: 'Den Algorithmus aus dem Token-Kopf zu übernehmen.', why: 'alg: none und Verwechslungen zwischen Verfahren umgehen die Prüfung.', fix: 'Algorithmus und Schlüssel serverseitig festlegen; alles andere ablehnen.' },
      { wrong: 'Token ohne Ablauf oder mit Laufzeiten von Wochen auszugeben.', why: 'Gestohlene Token gelten ewig und lassen sich schwer widerrufen.', fix: 'exp Pflicht, Zugriffs-Token kurz (Minuten), Erneuerung über getrennte, widerrufbare Token.' },
      { wrong: 'Weiterleitungsadressen mit Präfix oder Muster zu erlauben.', why: 'Der Angreifer registriert oder nutzt eine ähnliche Adresse und fängt den Code ab.', fix: 'Exakter Vergleich mit einer festen Liste; zusätzlich PKCE und state.' },
    ],
    practice: 'Prüfe jede Stelle, an der dein Code ein Token liest: Wird die Signatur geprüft? Kommt der Algorithmus aus der Konfiguration? Sind exp, iss und aud Pflicht? Schreibe pro Fall einen Test mit einem gefälschten Token, und nutze für Produktion eine geprüfte Bibliothek.',
    exercises: [
      { task: 'Schreibe einen Test, der ein Token mit abgelaufenem exp, eines mit falscher Zielgruppe und eines mit fremdem Geheimnis gegen verifyJwt prüft und die Meldungen vergleicht.', acceptance: 'Drei verschiedene Fehler („abgelaufen“, „Zielgruppe falsch“, „Signatur ungültig“); du entscheidest, welche Meldung ein Client sehen darf und welche nur ins Log gehört.' },
      { task: 'Grenzfall: Was passiert bei einem Token genau 30 Sekunden nach exp und eines mit 31 Sekunden? Wie würdest du die Toleranz wählen?', acceptance: '30 Sekunden sind erlaubt, 31 nicht; du begründest eine möglichst kleine Toleranz für Uhrenabweichung.' },
      { task: 'Fehlerfall: Ersetze isRegisteredRedirect durch einen Präfixvergleich (startsWith). Welche Eingabe aus dem Test schlägt dann an, und welchen Angriff verhindert der exakte Vergleich?', acceptance: 'https://app.example/cb/../evil und https://app.example/cb?x=1 würden akzeptiert; du erklärst, dass ein Angreifer sonst den Code an eine eigene Adresse leiten kann.' },
    ],
    quiz: [
      { q: 'Warum ist Dekodieren eines JWT nicht dasselbe wie Prüfen?',
        options: ['Kopf und Inhalt sind nur Base64-kodiert; ohne Signaturprüfung kann jeder sie fälschen.', 'Weil das Dekodieren bei jedem Token Rechenzeit und damit Geld kostet.', 'Weil der Inhalt eines normalen JWT immer verschlüsselt übertragen wird.', 'Weil Token grundsätzlich nie signiert werden und deshalb nicht prüfbar sind.'],
        correct: 0,
        rationales: ['Erst die Signaturprüfung belegt Echtheit und Unverändertheit.', 'Kosten spielen keine Rolle.', 'Ein normales JWT ist nur signiert, nicht verschlüsselt.', 'Die Signatur ist gerade der Schutz.'],
        explain: 'Entscheidungen dürfen nur auf geprüften Token beruhen.' },
      { q: 'Warum kommt der Algorithmus nicht aus dem Token-Kopf?',
        options: ['Sonst kann ein Angreifer alg: none oder ein anderes Verfahren behaupten und die Prüfung umgehen.', 'Weil der Token-Kopf zu kurz ist, um einen Algorithmus zu enthalten.', 'Weil der Server selbst keinen Algorithmus kennt und ihn erfragen muss.', 'Weil der Browser den Algorithmus für jede Anfrage selbst bestimmt.'],
        correct: 0,
        rationales: ['Der Server legt fest, was gilt.', 'Die Länge spielt keine Rolle.', 'Der Server kennt den Algorithmus aus seiner Konfiguration.', 'Der Browser ist nicht beteiligt.'],
        explain: 'Konfiguration schlägt Selbstauskunft.' },
      { q: 'Was verhindert PKCE?',
        options: ['Dass ein abgefangener Autorisierungscode ohne den geheimen verifier eingetauscht werden kann.', 'Dass Nutzer ihre Passwörter vergessen und sich nicht mehr anmelden können.', 'Dass Cookies von fremden Seiten gesetzt werden können.', 'Dass Seiten unverschlüsselt per HTTP ausgeliefert werden.'],
        correct: 0,
        rationales: ['Nur der Anfrager kennt den verifier; die challenge ist sein Hash.', 'PKCE hat nichts mit Passwörtern zu tun.', 'Cookies sind unabhängig.', 'Das ist Aufgabe von HTTPS und HSTS.'],
        explain: 'PKCE bindet den Code an den Client, der die Anmeldung gestartet hat.' },
    ],
    sources: [
      top10('A07 Authentication Failures', 'A07_2025-Authentication_Failures'),
      rfc(8725, 'JSON Web Token Best Current Practices'),
      rfc(7636, 'Proof Key for Code Exchange (PKCE)'),
      rfc(9700, 'Best Current Practice for OAuth 2.0 Security'),
      cheat('OAuth 2.0 Protocol', 'OAuth2_Cheat_Sheet'),
    ],
    verification: 'Lab websec-lab: JWT-Prüfung (HS256) mit den typischen Angriffen, PKCE inklusive RFC-7636-Testvektor, state-Vergleich und exakte Weiterleitungsprüfung wurden auf Node.js 22.23 und 24.22 getestet. RFC 9700 wurde am 14.11.2026 zu PKCE und zum impliziten Ablauf nachgelesen; RFC 7636 (Testvektor) ist im Test enthalten; bei RFC 8725 wurde nur die Erreichbarkeit geprüft, nicht der Wortlaut. NICHT geprüft: asymmetrische Verfahren, JWKS, JWE, Code-Tausch, Widerruf.',
  },
  {
    id: 'ws-m2-l3', title: 'Sicherheits-Header, HTTPS und Fehlkonfiguration: die eigene Seite prüfen', minutes: 50,
    prerequisites: 'Lektionen zu XSS (CSP) und CSRF (Cookies); HTTP-Header lesen können (Modul net-m1).',
    objectives: [
      'Die wichtigsten Sicherheits-Header nennen und ihren Zweck erklären',
      'HSTS und HTTPS richtig einordnen (auch warum HSTS über HTTP wirkungslos ist)',
      'Eine Antwort mit einer Checkliste prüfen und Befunde bewerten (ok, fehlt, schwach)',
      'Fehlkonfiguration (Versionsangaben, Debug-Ausgaben, offene Standard-Konten) erkennen und beheben',
    ],
    simple: `Viele Schutzmaßnahmen im Browser schaltet der Server mit Antwort-Headern ein. Die wichtigsten: Content-Security-Policy (woher Skripte und Inhalte stammen dürfen), Strict-Transport-Security (HSTS: künftig nur noch HTTPS), X-Content-Type-Options: nosniff (Browser raten den Inhaltstyp nicht), Referrer-Policy (wie viel der Adresse an andere Seiten geht), frame-ancestors (wer die Seite einbetten darf; Schutz vor Clickjacking), Permissions-Policy (Kamera, Standort und weitere Funktionen abschalten) und Cross-Origin-Opener-Policy (Fenster von fremden Seiten trennen).

HTTPS verschlüsselt die Verbindung und beweist, dass man mit dem richtigen Server spricht. HSTS sagt dem Browser: „Sprich mit mir nur noch per HTTPS, ein Jahr lang“. Das schützt vor dem Herunterstufen auf HTTP. Es wirkt nur, wenn es über HTTPS ausgeliefert wird; über HTTP ignoriert es der Browser, deshalb ist ein fehlender HSTS-Header bei lokaler Entwicklung kein Fehler. Vorsicht bei langen Laufzeiten und includeSubDomains: Läuft später eine Subdomain nur mit HTTP, ist sie nicht mehr erreichbar. Mit der Aufnahme in die Preload-Liste ist das kaum rückgängig zu machen; tu das nur bewusst.

Fehlkonfiguration (A02 der OWASP Top 10) ist alles, was „aus Versehen offen“ ist: Standard-Passwörter, Debug-Seiten und ausführliche Fehlermeldungen in Produktion, Verzeichnislisten, unnötige Dienste, Versionsangaben in Headern (X-Powered-By: Express), zu große Rechte. Die Gegenmaßnahme ist eine wiederholbare Härtung: eine Checkliste, ein automatischer Test und derselbe Stand in allen Umgebungen.`,
    steps: [
      'auditHeaders liest Header aus einem einfachen Objekt oder einem Headers-Objekt (fetch) und liefert Befunde mit header, status (ok, fehlt, schwach) und Hinweis. Mit https: true wird auch HSTS bewertet.',
      'Content-Security-Policy: fehlt der Header, ist das ein Befund. Ist er da, wird script-src (oder ersatzweise default-src) gesucht. Fehlt beides, gilt die CSP als schwach, weil Skripte nicht eingeschränkt sind, auch wenn andere Regeln wie object-src vorhanden sind. Das war ein echter Fehler im ersten Entwurf des Labs, der durch einen Test aufgefallen ist.',
      "'unsafe-inline' ohne Nonce oder Hash und 'unsafe-eval' im script-src gelten als schwach. 'unsafe-inline' zusammen mit einem Nonce wird von neueren Browsern ignoriert und deshalb als ok gewertet; fehlt object-src (und default-src), ist die CSP ebenfalls schwach.",
      'HSTS: über HTTP wird ein fehlender Header nur als Hinweis „nur über HTTPS sinnvoll“ gemeldet. Über HTTPS verlangt der Test max-age von mindestens einem Jahr (31 536 000 Sekunden); weniger gilt als schwach.',
      'nosniff, Referrer-Policy (unsafe-url ist schwach), frame-ancestors oder X-Frame-Options, Permissions-Policy und Cross-Origin-Opener-Policy werden auf Vorhandensein geprüft. Außerdem meldet die Prüfung Versionsangaben im Server- oder X-Powered-By-Header; der bloße Name ohne Version ist unkritisch.',
      'audit-url.js holt eine Seite per fetch (ohne Weiterleitungen, mit Zeitlimit) und gibt die Befunde aus; Exit-Code 1, wenn etwas nicht ok ist. Das Werkzeug ist nur für eigene Systeme gedacht; Prüfungen fremder Systeme ohne Erlaubnis sind nicht in Ordnung.',
      'Anwendung auf die lokale Entwicklungs-Instanz von Root Road (http://127.0.0.1:5173/, 14.11.2026): nosniff, Referrer-Policy, Permissions-Policy, Opener-Policy und frame-ancestors sind ok; HSTS fehlt über HTTP erwartungsgemäß (der Server setzt es nur in Produktion über HTTPS). Die CSP besteht aus frame-src, object-src, base-uri und frame-ancestors, aber ohne script-src und default-src. Die Prüfung stuft sie deshalb als schwach ein.',
      'Mögliche Verbesserung für Root Road (nicht umgesetzt): eine CSP mit script-src (Nonce oder Hash) und default-src. Weil die Seite Inline-Skripte und Ereignisattribute nutzt, ist das ein größerer Umbau und muss im Report-Only-Modus erprobt werden; es ist eine offene Entscheidung, keine Korrektur in dieser Lektion.',
    ],
    background: `Warum prüfen, statt nur setzen? Header gehen durch Proxys, Frameworks und Umgebungen verloren oder werden überschrieben. Ein automatischer Test gegen die laufende Anwendung (oder gegen die Konfiguration) bemerkt Rückschritte früh. Ähnliches gilt für Abhängigkeiten und Konfiguration: Wer die Prüfung in die Pipeline legt, entdeckt Fehler, bevor Besucher es tun.

Zu HTTPS und TLS: Zertifikate werden von der Zertifizierungsstelle ausgestellt (zum Beispiel automatisiert über das ACME-Protokoll), laufen ab und müssen erneuert werden. Aktuelle Empfehlungen sind TLS 1.2 oder 1.3 mit starken Verfahren und Weiterleitung von HTTP auf HTTPS. Das Lab prüft nur Header-Texte; TLS-Konfiguration, Zertifikate und Weiterleitungen wurden nicht geprüft. Für Betrieb und Tests dient die Empfehlung des BSI (TR-02102-2) oder der Mozilla-Konfigurationsgenerator als Ausgangspunkt; beide wurden hier nicht erneut ausgewertet.

Warum Versionsangaben verbergen? Eine Versionsnummer in Headern hilft Angreifern, gezielt nach bekannten Lücken zu suchen. Sie zu verbergen ist keine Absicherung (Sicherheit durch Geheimhaltung), spart aber Aufwand für Angreifer und kostet nichts. Wichtiger ist, die Software aktuell zu halten (nächste Lektion).

Fehlermeldungen: Nutzer sehen eine allgemeine Meldung mit einer Referenznummer; Stack-Traces, SQL-Fehler und Pfade gehören ins Log. Das ist auch Teil von A10:2025 („Mishandling of Exceptional Conditions“): Fehler müssen abgefangen werden, und die Anwendung muss in einem sicheren Zustand bleiben (im Zweifel „fail closed“, also ablehnen), statt halb ausgeführte Aktionen zu hinterlassen.

Einordnung der Header-Liste: Sie ist ein Mindeststand. Weitere Header (Cross-Origin-Resource-Policy, Cross-Origin-Embedder-Policy, Cache-Control für sensible Seiten) hängen vom Fall ab und wurden im Lab nicht geprüft. Der Header X-XSS-Protection ist veraltet und wird nicht mehr empfohlen; das ist hier nicht neu geprüft.`,
    terms: [
      { term: 'HSTS', text: 'Header, der den Browser anweist, die Domain künftig nur per HTTPS aufzurufen.' },
      { term: 'nosniff', text: 'Verbietet dem Browser, den Inhaltstyp zu raten.' },
      { term: 'Clickjacking', text: 'Fremde Seite blendet deine Seite unsichtbar ein und lockt zu Klicks; frame-ancestors verhindert das.' },
      { term: 'Fehlkonfiguration', text: 'Unsichere Voreinstellungen oder vergessene Einstellungen, zum Beispiel Debug-Ausgaben in Produktion.' },
      { term: 'fail closed', text: 'Im Fehlerfall ablehnen, statt etwas zu erlauben.' },
    ],
    code: { file: lab + 'src/headers/audit.js', lang: 'JavaScript' },
    code2: { file: lab + 'src/headers/audit-url.js', lang: 'JavaScript' },
    code3: { file: lab + 'tests/hygiene.test.js', lang: 'JavaScript', from: "test('Header-Prüfung: fehlende und schwache Werte'", to: "'Name ohne Version ist unkritisch');", plus: 1 },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: `node src/headers/audit-url.js http://127.0.0.1:5173/   (eigene Entwicklungs-Instanz, 14.11.2026, Node 22.23)
 schwach content-security-policy – Weder script-src noch default-src: Skripte sind nicht eingeschränkt (die CSP schützt dann nicht vor XSS).
 fehlt   strict-transport-security – Nur über HTTPS sinnvoll; über HTTP wird er vom Browser ignoriert.
 ok      (gekürzt: je eine Zeile für x-content-type-options, referrer-policy (same-origin), frame-ancestors, permissions-policy, cross-origin-opener-policy)
 (Exit-Code 1: mindestens ein Punkt nicht ok)
Tests Header-Prüfung (3 Tests) grün auf Node 22.23 und 24.22.
Nicht geprüft: Verhalten der Header im Browser, TLS-Konfiguration und Zertifikate, die Produktionsumgebung von Root Road.`,
    mistakes: [
      { wrong: 'Eine CSP zu setzen, die nur object-src oder frame-src enthält, und sie für „Schutz vor XSS“ zu halten.', why: 'Ohne script-src oder default-src sind Skripte nicht eingeschränkt.', fix: 'script-src mit Nonce oder Hash festlegen, zuerst im Report-Only-Modus erproben.' },
      { wrong: 'HSTS mit langer Laufzeit und includeSubDomains in Betrieb zu nehmen, ohne alle Subdomains zu kennen.', why: 'Subdomains ohne HTTPS werden unerreichbar; die Preload-Liste ist kaum rückgängig zu machen.', fix: 'Mit kurzer Laufzeit beginnen, schrittweise erhöhen und Preload nur bewusst wählen.' },
      { wrong: 'Debug-Modus, Stack-Traces und Standard-Konten in Produktion zu lassen.', why: 'Angreifer lesen Pfade, Versionen und SQL-Fehler und nutzen Standard-Zugänge.', fix: 'Konfiguration pro Umgebung, allgemeine Fehlermeldung mit Referenz, Standard-Konten entfernen oder ändern.' },
      { wrong: 'Header einmal zu prüfen und nie wieder.', why: 'Proxys, Updates und neue Routen ändern sie unbemerkt.', fix: 'Automatischen Header-Test in die Pipeline und nach jedem Deploy ausführen.' },
    ],
    practice: 'Prüfe mit audit-url.js (nur bei eigenen Systemen) deine Entwicklungs- und Produktionsseite, notiere jeden Befund mit Status und lege fest, welche du beheben willst. Baue den Aufruf als Test in die Pipeline, damit Rückschritte auffallen.',
    exercises: [
      { task: 'Schreibe einen Test, der eine Antwort mit allen Headern aus der Checkliste gegen auditHeaders prüft und danach jeden Header einzeln entfernt. Welcher Status entsteht jeweils?', acceptance: 'Ohne Entfernung nur ok; nach jedem Entfernen genau ein Befund „fehlt“ für diesen Header (bei HSTS nur mit https: true).' },
      { task: 'Grenzfall: Prüfe eine CSP "default-src \'self\'" ohne script-src und eine mit "script-src \'self\' \'unsafe-inline\'" ohne Nonce. Wie bewertet auditHeaders beide, und stimmst du zu?', acceptance: 'Die erste ist ok (default-src greift als Ersatz für script-src und object-src), die zweite schwach; du begründest, warum default-src \'self\' Inline-Skripte blockiert und trotzdem nicht „perfekt“ ist.' },
      { task: 'Fehlerfall: Lass audit-url.js auf eine nicht erreichbare Adresse laufen. Was passiert, und wie würdest du den Fehler für eine Pipeline besser behandeln?', acceptance: 'fetch wirft nach dem Zeitlimit einen Fehler; du fängst ihn ab, gibst eine klare Meldung aus und setzt einen eigenen Exit-Code, damit „nicht erreichbar“ nicht wie „alles ok“ wirkt.' },
    ],
    quiz: [
      { q: 'Warum ist ein fehlender HSTS-Header bei http://localhost kein Fehler?',
        options: ['Browser ignorieren HSTS über HTTP; es wirkt nur über HTTPS.', 'Weil localhost immer sicher ist.', 'Weil HSTS veraltet ist.', 'Weil HSTS Cookies löscht.'],
        correct: 0,
        rationales: ['Der Header zählt nur, wenn er über eine HTTPS-Verbindung kommt.', 'Mit „sicher“ hat das nichts zu tun.', 'HSTS ist aktuell.', 'Cookies sind nicht betroffen.'],
        explain: 'HSTS gehört auf die HTTPS-Produktionsseite, nicht auf die lokale HTTP-Entwicklung.' },
      { q: 'Was bedeutet es, wenn eine CSP kein script-src und kein default-src enthält?',
        options: ['Skripte sind nicht eingeschränkt; die CSP schützt dann nicht vor eingeschleusten Skripten.', 'Die Seite lädt dann überhaupt keine Skripte mehr und bleibt statisch.', 'Der Browser blockiert in diesem Fall automatisch alle Inhalte der Seite.', 'Die CSP ist dann ungültig und wird vom Browser komplett ignoriert.'],
        correct: 0,
        rationales: ['Direktiven gelten nur für die Typen, die sie nennen.', 'Die Seite lädt ihre Skripte normal.', 'Es wird nur eingeschränkt, was genannt ist.', 'Die CSP ist gültig, aber lückenhaft.'],
        explain: 'Eine CSP wirkt gegen XSS nur, wenn sie Skriptquellen regelt.' },
      { q: 'Was gehört zu einer guten Fehlerbehandlung für Nutzer?',
        options: ['Eine allgemeine Meldung mit Referenznummer; Details nur im Log.', 'Der vollständige Stack-Trace.', 'Der SQL-Text.', 'Die Pfade auf dem Server.'],
        correct: 0,
        rationales: ['So kann der Support die Meldung zuordnen, ohne Interna zu verraten.', 'Stack-Traces verraten Aufbau und Versionen.', 'SQL-Text hilft Angreifern bei Injection.', 'Pfade verraten Aufbau des Servers.'],
        explain: 'Nutzer brauchen Orientierung, Angreifer keine Informationen.' },
    ],
    sources: [
      top10('A02 Security Misconfiguration', 'A02_2025-Security_Misconfiguration'),
      cheat('HTTP Headers', 'HTTP_Headers_Cheat_Sheet'),
      cheat('Transport Layer Security', 'Transport_Layer_Security_Cheat_Sheet'),
      mdn('Strict-Transport-Security', 'Web/HTTP/Reference/Headers/Strict-Transport-Security'),
      mdn('Content Security Policy (CSP)', 'Web/HTTP/Guides/CSP'),
    ],
    verification: 'Lab websec-lab: Die Header-Prüfung (alle Fälle, auch ein Headers-Objekt) wurde auf Node.js 22.23 und 24.22 getestet. Die Prüfung der lokalen Entwicklungs-Instanz von Root Road erfolgte am 14.11.2026 gegen 127.0.0.1:5173 (nur lesende Anfrage an die eigene Seite). NICHT geprüft: Wirkung der Header im Browser, TLS und Zertifikate, die Produktionsumgebung, Cache-Header, Cross-Origin-Embedder-Policy.',
  },
  {
    id: 'ws-m2-l4', title: 'Abhängigkeiten, Geheimnisse und Protokolle: Betrieb und Vorfälle', minutes: 55,
    prerequisites: 'Lektionen dieses Moduls; Grundwissen zu npm (Modul node-m1) und Git (Modul git-m1).',
    objectives: [
      'Abhängigkeiten kontrollieren: Lockfile, npm ci, npm audit und Update-Rhythmus',
      'Geheimnisse außerhalb des Codes halten, nach Mustern suchen und nach einem Leck rotieren',
      'Sicherheitsrelevante Ereignisse protokollieren und Log-Forging verhindern',
      'Einen einfachen Ablauf für Sicherheitsvorfälle beschreiben und die Meldepflicht nach DSGVO einordnen (Hinweis, keine Rechtsberatung)',
    ],
    simple: `Moderne Anwendungen bestehen zum Großteil aus fremdem Code: Bibliotheken, deren Abhängigkeiten und Werkzeuge. Jede ist ein Vertrauensverhältnis. Die OWASP-Liste 2025 hat „Software Supply Chain Failures“ auf Platz 3 gesetzt: Schwachstellen, manipulierte Pakete oder Build-Skripte in dieser Kette. Praktische Regeln: Nur Pakete verwenden, die du brauchst; ein Lockfile (package-lock.json) einchecken, damit alle dieselben Versionen bekommen; in Pipelines npm ci statt npm install nutzen (installiert exakt nach Lockfile und bricht bei Abweichungen ab); regelmäßig npm audit ausführen und Updates prüfen; neue Pakete vor dem Einsatz ansehen (Pflege, Verbreitung, Besitzer, Skripte).

Geheimnisse (Passwörter, API-Schlüssel, Signaturschlüssel) gehören nicht in den Code oder in Git, sondern in die Umgebung oder einen Geheimnis-Speicher. Was einmal in der Git-Historie steht, gilt als veröffentlicht: Der Wert muss ersetzt (rotiert) werden, auch wenn die Datei später gelöscht wurde. Ein Suchwerkzeug findet Muster (private Schlüssel, bekannte Token-Formate, auffällige Zuweisungen) und gibt Fundstellen aus, ohne den Wert vollständig zu zeigen.

Protokolle (Logs) machen Angriffe sichtbar: fehlgeschlagene Anmeldungen, verweigerte Zugriffe, Änderungen an Rechten, Validierungsfehler. Sie dürfen keine Geheimnisse und möglichst keine personenbezogenen Daten enthalten. Und Eingaben, die in Logs landen, müssen von Zeilenumbrüchen und Steuerzeichen befreit werden, sonst erfindet ein Angreifer eigene Log-Zeilen (Log Forging). Ohne Alarmierung nützt ein Log wenig: A09:2025 heißt „Security Logging and Alerting Failures“.

Wenn doch etwas passiert, hilft ein Ablauf: erkennen, eindämmen (Zugänge sperren, Schlüssel rotieren), Ursache beseitigen, wiederherstellen, auswerten. Sind personenbezogene Daten betroffen, kann nach DSGVO eine Meldung an die Aufsichtsbehörde binnen 72 Stunden nötig sein; wer das bewertet und meldet, sollte vorab festgelegt sein.`,
    steps: [
      'Abhängigkeiten sichten: npm ls --all zeigt den Baum, npm audit meldet bekannte Schwachstellen. Im Lab-Verzeichnis content/examples/vue-lab ergab npm audit am 14.11.2026 keine Schwachstellen (mit und ohne Entwicklungs-Abhängigkeiten). Das ist eine Momentaufnahme.',
      'Lockfile und npm ci: package-lock.json wird eingecheckt, die Pipeline nutzt npm ci. Zusätzlich: Auf Updates mit Sicherheitsbezug zügig reagieren, größere Updates getrennt einspielen und Tests laufen lassen. npm install führt Skripte der Pakete aus (postinstall); für unbekannte Pakete kannst du das mit --ignore-scripts abschalten, was einige Pakete aber beeinträchtigt.',
      'scanText zerlegt Text zeilenweise und prüft vier Regeln: private Schlüssel (BEGIN … PRIVATE KEY), AWS-Zugangsschlüssel-IDs (AKIA/ASIA + 16 Zeichen), GitHub-Token (ghp_, gho_ … + 36 Zeichen) und allgemeine Zuweisungen (api_key, secret, token, password mit Wert von mindestens 12 Zeichen).',
      'Platzhalter werden ignoriert: xxxxxx, ***, <wert>, ${UMGEBUNGSVARIABLE}, change-me, your-…, example… und dummy…. So melden Beispiel-Dateien und Dokumentation keine Fehlalarme. Echte Treffer geben nur die ersten vier Zeichen aus (preview), nie den ganzen Wert.',
      'Der Test nutzt erfundene Werte (die AWS-Beispiel-ID aus der AWS-Dokumentation und ein aus Wiederholungen gebautes Token, beide zur Laufzeit zusammengesetzt, damit der Repository-Scan nicht anschlägt) und prüft Zeile und Regel der vier echten Fälle. Beachte: Ein Muster-Scan findet nur bekannte Formen; er ersetzt weder Zugriffsregeln noch Rotation. Das Projekt Root Road hat dafür das Skript npm run scan:secrets.',
      'Nach einem Leck: Wert sofort beim Anbieter widerrufen und ersetzen (rotieren), dann prüfen, wo er benutzt wurde, und die Historie nur zusätzlich bereinigen. Das Entfernen aus der Historie macht einen bereits veröffentlichten Wert nicht wieder geheim.',
      'sanitizeLogValue ersetzt Steuerzeichen (U+0000 bis U+001F, U+007F) sowie die Zeilentrenner U+2028 und U+2029 durch Schreibweisen wie \\u000a und kürzt lange Werte auf 200 Zeichen mit Hinweis. formatUnsafe zeigt den Fehler: Aus einem Namen mit Zeilenumbruch entstehen zwei Zeilen, die zweite sieht wie ein echter Eintrag aus; formatSafe hält es bei einer Zeile.',
      'Was gehört ins Log: Zeitpunkt, Ereignis (Anmeldung fehlgeschlagen, Zugriff verweigert, Rechte geändert), Kennung der Person oder Sitzung (ohne Geheimnisse), Quelle und Ergebnis. Was nicht: Passwörter, Token, Sitzungskennungen, vollständige Karten- oder Gesundheitsdaten. Lege Aufbewahrungsdauer und Zugriff fest und alarmiere bei Auffälligkeiten (viele Fehlversuche, Zugriff auf fremde Objekte).',
      'Ablauf für Vorfälle in fünf Zeilen: (1) Erkennen und Zeitpunkt notieren, (2) Eindämmen: Konten sperren, Schlüssel rotieren, Systeme isolieren, (3) Beweise sichern (Logs kopieren), (4) Beheben und wiederherstellen, (5) auswerten und Maßnahmen ableiten. Bei personenbezogenen Daten Datenschutzbeauftragte oder Rechtsberatung früh einbinden; die Frist nach Art. 33 DSGVO (72 Stunden ab Kenntnis, sofern ein Risiko für Betroffene besteht) ist rechtlich zu prüfen.',
    ],
    background: `Warum Lockfile und npm ci? Ohne Lockfile kann dieselbe package.json an verschiedenen Tagen verschiedene Versionen installieren, inklusive eines frisch manipulierten Pakets. Mit Lockfile ist der Stand nachvollziehbar, und Updates sind bewusste Änderungen, die man prüft. Das beseitigt nicht das Risiko eines schon manipulierten Pakets, macht Änderungen aber sichtbar (Diff im Lockfile).

Warum nicht alles automatisch aktualisieren? Automatische Updates schließen Lücken schneller, können aber selbst die Einfallstür sein (manipulierte neue Version). Ein Kompromiss: Werkzeuge schlagen Updates vor (zum Beispiel Dependabot oder Renovate), Tests laufen automatisch, und Menschen prüfen Änderungen mit Sicherheitsbezug zeitnah. Für Root Road sind die GitHub-Funktionen Dependabot, Secret Scanning und Push Protection im Konto derzeit ausgeschaltet; das kann nur der Kontoinhaber ändern.

Warum Muster-Suche allein nicht reicht? Sie findet nur bekannte Formen, produziert Fehlalarme und übersieht selbstgebaute Schlüssel. Sie ist eine Absicherung gegen Versehen, keine Strategie. Die Strategie heißt: Geheimnisse nie in den Code, kurze Lebensdauer, minimale Rechte pro Schlüssel, Rotation, getrennte Schlüssel je Umgebung und Zugriffsprotokolle. Das Projekt trennt Konfiguration über Umgebungsvariablen; die .env-Datei wird nicht eingecheckt.

Zur Meldepflicht: Art. 33 DSGVO verlangt von Verantwortlichen, eine Verletzung des Schutzes personenbezogener Daten unverzüglich und möglichst binnen 72 Stunden nach Kenntnis der zuständigen Aufsichtsbehörde zu melden, außer sie führt voraussichtlich nicht zu einem Risiko für die Betroffenen; Art. 34 regelt die Benachrichtigung der Betroffenen bei hohem Risiko. Das sind Hinweise zur Orientierung, keine Rechtsberatung; die Texte sind auf eur-lex.europa.eu abrufbar (Erreichbarkeit geprüft, Inhalt hier nicht Wort für Wort abgeglichen). Für die Praxis brauchst du einen internen Plan, Kontakte und eine fachkundige Bewertung.`,
    terms: [
      { term: 'Lockfile', text: 'Datei mit den exakt aufgelösten Versionen aller Abhängigkeiten.' },
      { term: 'npm ci', text: 'Installiert strikt nach Lockfile und bricht bei Abweichung ab; für Pipelines.' },
      { term: 'Rotation', text: 'Ein Geheimnis wird durch einen neuen Wert ersetzt und der alte widerrufen.' },
      { term: 'Log Forging', text: 'Eingaben mit Zeilenumbrüchen erzeugen erfundene Log-Zeilen.' },
      { term: 'Supply Chain', text: 'Alle fremden Teile, die in dein Produkt gelangen: Pakete, Werkzeuge, Build-Skripte.' },
    ],
    code: { file: lab + 'src/hygiene/secrets.js', lang: 'JavaScript' },
    code2: { file: lab + 'src/hygiene/logsafe.js', lang: 'JavaScript' },
    code3: { file: lab + 'tests/hygiene.test.js', lang: 'JavaScript', from: "test('Geheimnis-Suche", to: "assert.equal(sanitizeLogValue(undefined), 'undefined');", plus: 1 },
    order: ['body', 'code', 'code2', 'code3', 'body2'],
    output: `scanText auf dem Testtext (7 Zeilen, erfundene Werte):
 1:AWS-Zugangsschlüssel-ID   2:GitHub-Token   3:Allgemeine Zuweisung   4:Privater Schlüssel
 Platzhalter (\${API_KEY}, "change-me") und "Hallo Welt" werden nicht gemeldet; preview zeigt nur die ersten 4 Zeichen.
Log-Forging: formatUnsafe("ada\\n2026-11-14T10:00:00Z INFO Anmeldung erfolgreich für root") -> 2 Zeilen
             formatSafe(...)                                                           -> 1 Zeile ("ada\\u000a2026-...")
npm audit in content/examples/vue-lab (14.11.2026): found 0 vulnerabilities (Momentaufnahme)
Tests Hygiene (Geheimnis-Suche und Log-Bereinigung, 2 von 5 in tests/hygiene.test.js) grün auf Node 22.23 und 24.22; gesamtes Lab: 38 Tests, 37 grün, 1 übersprungen (Node 22.23) bzw. 38 grün (Node 24.22).
Nicht ausgeführt: Alarmierung, Log-Aufbewahrung, ein echter Vorfall, Meldung bei einer Aufsichtsbehörde.`,
    mistakes: [
      { wrong: 'Eine package.json ohne Lockfile zu veröffentlichen und in der Pipeline npm install zu nutzen.', why: 'Jeder Lauf kann andere Versionen holen; Änderungen bleiben unbemerkt.', fix: 'package-lock.json einchecken, in Pipelines npm ci, Updates als bewusste, geprüfte Änderungen.' },
      { wrong: 'Ein versehentlich eingechecktes Geheimnis zu löschen und weiterzumachen.', why: 'Die Historie, Forks und Kopien enthalten den Wert weiter; er gilt als veröffentlicht.', fix: 'Sofort widerrufen und rotieren, danach Ursache beheben und Suchwerkzeug vor dem Commit einsetzen.' },
      { wrong: 'Eingaben ungeprüft ins Log zu schreiben.', why: 'Zeilenumbrüche erzeugen falsche Einträge und verstecken Angriffe.', fix: 'Steuerzeichen ersetzen, Länge begrenzen, strukturierte Logs (JSON) mit Feldern statt Textketten.' },
      { wrong: 'Passwörter, Token oder vollständige personenbezogene Daten zu loggen.', why: 'Logs werden breit gelesen, kopiert und lange aufbewahrt.', fix: 'Nur das Nötige und möglichst Kennungen statt Inhalte protokollieren, Zugriff und Aufbewahrung regeln.' },
    ],
    practice: 'Führe für dein Projekt npm audit und das Geheimnis-Suchwerkzeug aus, prüfe das Lockfile und die Pipeline (npm ci), lege fest, was geloggt wird und wer alarmiert wird, und schreibe einen Vorfall-Ablauf mit Rollen und Kontakten auf eine Seite. Übe ihn einmal mit einem Rollenspiel.',
    exercises: [
      { task: 'Erweitere scanText um eine Regel für Slack-Token oder einen anderen Anbieter deiner Wahl und schreibe einen Test mit erfundenem Wert und einem Platzhalter.', acceptance: 'Der erfundene Wert wird gemeldet, der Platzhalter nicht; preview zeigt nur vier Zeichen; die Regel hat einen Namen im Ergebnis.' },
      { task: 'Grenzfall: Was liefert scanText für einen Wert mit genau 11 Zeichen in password = "abcdefghijk" und für einen in Anführungszeichen mit Leerzeichen? Ist das ein Fehler oder eine bewusste Grenze?', acceptance: 'Beide werden nicht gemeldet (Mindestlänge 12, keine Leerzeichen); du entscheidest, ob du die Grenze senken willst, und beschreibst die Abwägung zwischen Fehlalarmen und Lücken.' },
      { task: 'Fehlerfall: Schreibe einen Log-Eintrag mit einem Wert, der U+2028 enthält, und einem sehr langen Wert (1000 Zeichen). Was liefert sanitizeLogValue?', acceptance: 'U+2028 erscheint als \\u2028-Text; der lange Wert wird auf 200 Zeichen gekürzt und trägt den Hinweis mit der Zahl gekürzter Zeichen.' },
    ],
    quiz: [
      { q: 'Wozu dient npm ci in einer Pipeline?',
        options: ['Es installiert exakt nach Lockfile und bricht bei Abweichungen ab.', 'Es aktualisiert alle Pakete auf die neueste Version.', 'Es entfernt Sicherheitslücken automatisch.', 'Es verschlüsselt das Projekt.'],
        correct: 0,
        rationales: ['Dadurch sind Builds reproduzierbar.', 'Das macht npm update bzw. npm install mit Änderungen.', 'Dafür gibt es npm audit und Updates; ci repariert nichts.', 'Es verschlüsselt nichts.'],
        explain: 'Reproduzierbare Installationen machen Änderungen sichtbar.' },
      { q: 'Was ist nach einem versehentlich eingecheckten API-Schlüssel nötig?',
        options: ['Den Schlüssel widerrufen und ersetzen (rotieren); das Löschen der Datei genügt nicht.', 'Die Datei löschen und weitermachen, weil der Schlüssel damit verschwunden ist.', 'Nichts weiter, solange das Repository privat und nicht öffentlich ist.', 'Den Schlüssel in der README verstecken, damit ihn niemand findet.'],
        correct: 0,
        rationales: ['Der Wert steht in der Historie und gilt als veröffentlicht.', 'Die Historie enthält ihn weiter.', 'Auch private Repositories werden kopiert und geteilt.', 'Das macht es schlimmer.'],
        explain: 'Rotation ist die einzige verlässliche Antwort auf ein Leck.' },
      { q: 'Was bewirkt Log Forging?',
        options: ['Ein Angreifer erzeugt mit Zeilenumbrüchen in Eingaben erfundene Einträge im Log.', 'Das Log wird verschlüsselt.', 'Das Log wird kürzer.', 'Das Log wird automatisch gelöscht.'],
        correct: 0,
        rationales: ['Dadurch lassen sich Spuren verschleiern oder Einträge fälschen.', 'Verschlüsselung ist unabhängig.', 'Die Länge ist nicht das Problem.', 'Löschen ist ein anderes Risiko.'],
        explain: 'Steuerzeichen in Logwerten müssen ersetzt werden.' },
    ],
    sources: [
      top10('A03 Software Supply Chain Failures', 'A03_2025-Software_Supply_Chain_Failures'),
      top10('A09 Security Logging and Alerting Failures', 'A09_2025-Security_Logging_and_Alerting_Failures'),
      cheat('Logging', 'Logging_Cheat_Sheet'),
      cheat('Secrets Management', 'Secrets_Management_Cheat_Sheet'),
      cheat('NPM Security', 'NPM_Security_Cheat_Sheet'),
      docs('npm Docs: npm audit', 'https://docs.npmjs.com/cli/v11/commands/npm-audit', 'Beschreibt die Schwachstellenprüfung der Abhängigkeiten.'),
      docs('npm Docs: npm ci', 'https://docs.npmjs.com/cli/v11/commands/npm-ci', 'Beschreibt die Installation exakt nach Lockfile.'),
      docs('DSGVO (Verordnung (EU) 2016/679), Art. 33 und 34', 'https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679', 'Rechtstext zur Meldepflicht; Einordnung hier nur als Hinweis, juristisch prüfen lassen.'),
    ],
    verification: 'Lab websec-lab: Geheimnis-Suche (erfundene Werte) und Log-Bereinigung wurden auf Node.js 22.23 und 24.22 getestet. npm audit lief am 14.11.2026 in content/examples/vue-lab ohne Fund. Die rechtlichen Aussagen zu Art. 32 bis 34 DSGVO sind Orientierung und gehören juristisch geprüft; der Vorfall-Ablauf wurde nicht geübt. NICHT geprüft: Dependabot/Renovate, Alarmierung, Log-Aufbewahrung, Wirkung von --ignore-scripts auf konkrete Pakete.',
  },
];
