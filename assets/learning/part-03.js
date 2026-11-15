CHEATSHEET_HTML += "<section class=\"sheet-section\" id=\"spickzettel-abap\"><h2>ABAP Expertenpfad</h2><div class=\"sheet-section\"><h2>Pseudocode-Konventionen (AP1)</h2><table class=\"lesson-table\"><tr><th>Konzept</th><th>Notation</th></tr><tr><td>Zuweisung</td><td>&lt;- oder :=</td></tr><tr><td>Verzweigung</td><td>IF ... THEN ... ELSE ... ENDIF</td></tr><tr><td>Zählschleife</td><td>FOR i &lt;- 1 TO n DO ... ENDFOR</td></tr><tr><td>Kopfgesteuerte Schleife</td><td>WHILE ... DO ... ENDWHILE</td></tr><tr><td>Fußgesteuerte Schleife</td><td>REPEAT ... UNTIL</td></tr><tr><td>Funktion</td><td>FUNCTION name(param) ... RETURN wert ENDFUNCTION</td></tr><tr><td>Ein-/Ausgabe</td><td>READ/INPUT, WRITE/OUTPUT</td></tr></table><p style=\"font-size:.8rem;color:var(--text-dim);\">Kein einheitlicher Standard — das Syntax-Beiblatt der jeweiligen Prüfung ist maßgeblich. Logik zählt mehr als exakte Syntax.</p></div><div class=\"sheet-section\"><h2>ER-Modell & Normalisierung</h2><table class=\"lesson-table\"><tr><th>Begriff</th><th>Bedeutung</th></tr><tr><td>1NF</td><td>Nur atomare Werte, keine Wiederholungsgruppen</td></tr><tr><td>2NF</td><td>1NF + volle funktionale Abhängigkeit vom gesamten Schlüssel</td></tr><tr><td>3NF</td><td>2NF + keine transitiven Abhängigkeiten</td></tr><tr><td>n:m-Beziehung</td><td>Wird immer über eine Verknüpfungstabelle aufgelöst</td></tr></table></div><div class=\"sheet-section\"><h2>SQL: JOINs & DDL/DML/DCL</h2><table class=\"lesson-table\"><tr><th>JOIN</th><th>Ergebnis</th></tr><tr><td>INNER JOIN</td><td>Nur Zeilen mit Treffer auf beiden Seiten</td></tr><tr><td>LEFT OUTER JOIN</td><td>Alle Zeilen links, rechts NULL falls kein Treffer</td></tr><tr><td>CROSS JOIN</td><td>Kartesisches Produkt (jede Zeile mit jeder)</td></tr></table><table class=\"lesson-table\"><tr><th>Kategorie</th><th>Befehle</th></tr><tr><td>DDL</td><td>CREATE, ALTER, DROP</td></tr><tr><td>DML</td><td>SELECT, INSERT, UPDATE, DELETE</td></tr><tr><td>DCL</td><td>GRANT, REVOKE</td></tr></table></div><div class=\"sheet-section\"><h2>UML-Beziehungen</h2><table class=\"lesson-table\"><tr><th>Beziehung</th><th>ABAP-Äquivalent</th></tr><tr><td>Vererbung (Generalisierung)</td><td>INHERITING FROM</td></tr><tr><td>Realisierung</td><td>INTERFACES</td></tr><tr><td>Komposition</td><td>Existenzabhängiges \"hat-ein\"</td></tr><tr><td>Aggregation</td><td>Unabhängiges \"hat-ein\"</td></tr></table></div><div class=\"sheet-section\"><h2>Moderne ABAP-Ausdrücke</h2><div class=\"code-block\"><div class=\"code-head\"><span class=\"code-lang\">ABAP</span><button class=\"copy-btn\" data-onclick=\"copyCode(this)\">Kopieren</button></div><pre><code>DATA(x)      = 5.                          \" Inline Declaration\nDATA(text)   = |Wert: { x }|.               \" String-Template\nDATA(status) = COND string( WHEN x &gt; 0 THEN 'pos' ELSE 'neg' ).\nDATA(subset) = FILTER #( itab WHERE feld = 'X' ).\nDATA(sum)    = REDUCE i( INIT s = 0 FOR row IN itab NEXT s = s + row-betrag ).\nDATA(row)    = VALUE #( itab[ id = 1 ] OPTIONAL ).</code></pre></div></div><div class=\"sheet-section\"><h2>Interne Tabellentypen</h2><table class=\"lesson-table\"><tr><th>Typ</th><th>Zugriff</th><th>Einsatz</th></tr><tr><td>STANDARD TABLE</td><td>Index O(1), Schlüssel O(n)</td><td>Sequentielle Verarbeitung</td></tr><tr><td>SORTED TABLE</td><td>Index O(1), Schlüssel O(log n)</td><td>Bereichsabfragen</td></tr><tr><td>HASHED TABLE</td><td>Nur Schlüssel, O(1)</td><td>Große Nachschlagetabellen</td></tr></table></div><div class=\"sheet-section\"><h2>CDS & RAP Grundgerüst</h2><div class=\"code-block\"><div class=\"code-head\"><span class=\"code-lang\">CDS</span><button class=\"copy-btn\" data-onclick=\"copyCode(this)\">Kopieren</button></div><pre><code>@AccessControl.authorizationCheck: #CHECK\ndefine view entity ZI_Beispiel as select from db_tabelle\n{ key id, name, betrag }</code></pre></div><div class=\"code-block\"><div class=\"code-head\"><span class=\"code-lang\">RAP Behavior Definition</span><button class=\"copy-btn\" data-onclick=\"copyCode(this)\">Kopieren</button></div><pre><code>managed implementation in class zbp_i_beispiel unique;\nstrict ( 2 );\n\ndefine behavior for ZI_Beispiel alias Beispiel\npersistent table db_tabelle\nlock master\netag master LastChangedAt\nauthorization master ( instance )\n{\n  create; update; delete;\n  mapping for db_tabelle { id = id; name = name; betrag = betrag; }\n}</code></pre></div></div><div class=\"sheet-section\"><h2>Fiori-Elements-Annotationen</h2><table class=\"lesson-table\"><tr><th>Annotation</th><th>Wirkung</th></tr><tr><td>@UI.lineItem</td><td>Spalte in der Listenansicht</td></tr><tr><td>@UI.selectionField</td><td>Filterfeld in der Filterleiste</td></tr><tr><td>@UI.facet</td><td>Abschnitt auf der Object Page</td></tr><tr><td>@Consumption.valueHelpDefinition</td><td>Value Help über eine Assoziation</td></tr></table></div><div class=\"sheet-section\"><h2>Werkzeuge & Betrieb</h2><table class=\"lesson-table\"><tr><th>Werkzeug</th><th>Zweck</th></tr><tr><td>ADT (Eclipse)</td><td>Moderne Entwicklungsumgebung</td></tr><tr><td>ATC</td><td>Statische Codequalitäts-/Sicherheitsprüfung</td></tr><tr><td>ABAP Unit</td><td>Automatisierte funktionale Tests</td></tr><tr><td>SAT</td><td>Laufzeitanalyse eines Programmlaufs</td></tr><tr><td>ST05</td><td>SQL-Trace für Datenbankzugriffe</td></tr><tr><td>ST22 / STAD</td><td>Dump-Analyse / systemweite Workload-Analyse</td></tr><tr><td>abapGit / gCTS</td><td>Versionskontrolle für ABAP-Entwicklungsobjekte</td></tr></table></div></section>\n<section class=\"sheet-section\" id=\"spickzettel-java\"><h2>Java Expertenpfad</h2><div class=\"sheet-section\"><h2>Pseudocode-Konventionen (AP1)</h2><table class=\"lesson-table\"><tr><th>Konzept</th><th>Notation</th></tr><tr><td>Zuweisung</td><td>&lt;- oder :=</td></tr><tr><td>Verzweigung</td><td>IF ... THEN ... ELSE ... ENDIF</td></tr><tr><td>Zählschleife</td><td>FOR i &lt;- 1 TO n DO ... ENDFOR</td></tr><tr><td>Kopfgesteuert</td><td>WHILE ... DO ... ENDWHILE</td></tr><tr><td>Fußgesteuert</td><td>REPEAT ... UNTIL</td></tr><tr><td>Funktion</td><td>FUNCTION name(p) ... RETURN wert ENDFUNCTION</td></tr></table><p style=\"font-size:.8rem;color:var(--text-dim);\">Kein einheitlicher Standard — das Syntax-Beiblatt der Prüfung ist maßgeblich. Die Logik zählt mehr als die Schreibweise.</p></div><div class=\"sheet-section\"><h2>Komplexität & Collections</h2><table class=\"lesson-table\"><tr><th>Struktur</th><th>Zugriff</th><th>Suche</th><th>Einfügen</th></tr><tr><td>ArrayList</td><td>O(1)</td><td>O(n)</td><td>O(1) am Ende</td></tr><tr><td>LinkedList</td><td>O(n)</td><td>O(n)</td><td>O(1) am Anfang</td></tr><tr><td>HashSet / HashMap</td><td>—</td><td>O(1)</td><td>O(1)</td></tr><tr><td>TreeSet / TreeMap</td><td>—</td><td>O(log n)</td><td>O(log n)</td></tr></table></div><div class=\"sheet-section\"><h2>Primitive Typen</h2><table class=\"lesson-table\"><tr><th>Typ</th><th>Größe</th><th>Hinweis</th></tr><tr><td>int</td><td>32 Bit</td><td>Standard für Ganzzahlen</td></tr><tr><td>long</td><td>64 Bit</td><td>Literal mit L: 10_000L</td></tr><tr><td>double</td><td>64 Bit</td><td>NICHT für Geld — BigDecimal nutzen</td></tr><tr><td>char</td><td>16 Bit</td><td>Ein Unicode-Zeichen</td></tr><tr><td>boolean</td><td>—</td><td>true / false</td></tr></table></div><div class=\"sheet-section\"><h2>Klasse, Record, Enum</h2><div class=\"code-block\"><div class=\"code-head\"><span class=\"code-lang\">Java</span><button class=\"copy-btn\" data-onclick=\"copyCode(this)\">Kopieren</button></div><pre><code>public class Konto {\n    private final String iban;\n    public Konto(String iban) { this.iban = iban; }\n    public String getIban() { return iban; }\n}\n\npublic record Adresse(String strasse, String plz, String ort) { }\n\npublic enum Status { OFFEN, BEZAHLT, STORNIERT }</code></pre></div></div><div class=\"sheet-section\"><h2>Collections im Alltag</h2><div class=\"code-block\"><div class=\"code-head\"><span class=\"code-lang\">Java</span><button class=\"copy-btn\" data-onclick=\"copyCode(this)\">Kopieren</button></div><pre><code>List&lt;String&gt; liste = new ArrayList&lt;&gt;();\nMap&lt;String,Integer&gt; map = new HashMap&lt;&gt;();\nSet&lt;String&gt; menge = new HashSet&lt;&gt;();\n\nList&lt;String&gt; fest = List.of(\"a\", \"b\");        // unveränderlich\n\nmap.merge(\"key\", 1, Integer::sum);               // zählen\nmap.computeIfAbsent(k, x -&gt; new ArrayList&lt;&gt;()).add(v);   // gruppieren\nmap.getOrDefault(k, 0);\n\nliste.removeIf(String::isBlank);                 // sicher entfernen</code></pre></div></div><div class=\"sheet-section\"><h2>Stream-Pipeline</h2><div class=\"code-block\"><div class=\"code-head\"><span class=\"code-lang\">Java</span><button class=\"copy-btn\" data-onclick=\"copyCode(this)\">Kopieren</button></div><pre><code>List&lt;String&gt; namen = kunden.stream()\n    .filter(k -&gt; k.umsatz() &gt; 1000)\n    .map(Kunde::name)\n    .sorted()\n    .toList();\n\nMap&lt;String,List&lt;Kunde&gt;&gt; nachOrt =\n    kunden.stream().collect(Collectors.groupingBy(Kunde::ort));\n\nMap&lt;String,Long&gt; anzahl =\n    kunden.stream().collect(groupingBy(Kunde::ort, counting()));\n\nint summe = liste.stream().mapToInt(Integer::intValue).sum();\nString text = liste.stream().collect(joining(\", \", \"[\", \"]\"));</code></pre></div></div><div class=\"sheet-section\"><h2>Optional</h2><div class=\"code-block\"><div class=\"code-head\"><span class=\"code-lang\">Java</span><button class=\"copy-btn\" data-onclick=\"copyCode(this)\">Kopieren</button></div><pre><code>return repo.finde(id)\n    .map(Kunde::name)\n    .orElse(\"unbekannt\");\n\nopt.orElseGet(() -&gt; teuerBerechnen());   // lazy\nopt.orElseThrow(() -&gt; new NichtGefunden(id));\nopt.ifPresentOrElse(this::nutze, this::melde);</code></pre></div></div><div class=\"sheet-section\"><h2>Exceptions & Ressourcen</h2><div class=\"code-block\"><div class=\"code-head\"><span class=\"code-lang\">Java</span><button class=\"copy-btn\" data-onclick=\"copyCode(this)\">Kopieren</button></div><pre><code>try (var reader = Files.newBufferedReader(pfad)) {\n    return reader.readLine();\n} catch (IOException e) {\n    throw new LeseException(\"Datei nicht lesbar: \" + pfad, e);  // cause mitgeben!\n}</code></pre></div></div><div class=\"sheet-section\"><h2>equals & hashCode</h2><div class=\"code-block\"><div class=\"code-head\"><span class=\"code-lang\">Java</span><button class=\"copy-btn\" data-onclick=\"copyCode(this)\">Kopieren</button></div><pre><code>@Override\npublic boolean equals(Object o) {\n    if (this == o) return true;\n    if (!(o instanceof Artikel a)) return false;\n    return nummer.equals(a.nummer);\n}\n@Override\npublic int hashCode() { return Objects.hash(nummer); }</code></pre></div></div><div class=\"sheet-section\"><h2>JUnit 5</h2><div class=\"code-block\"><div class=\"code-head\"><span class=\"code-lang\">Java</span><button class=\"copy-btn\" data-onclick=\"copyCode(this)\">Kopieren</button></div><pre><code>@Test\nvoid einzahlungErhoehtSaldo() {\n    konto.einzahlen(new BigDecimal(\"50\"));\n    assertEquals(new BigDecimal(\"150\"), konto.getSaldo());\n}\n\nassertThrows(IllegalArgumentException.class, () -&gt; konto.einzahlen(minus));\n\n@ParameterizedTest\n@ValueSource(ints = {17, 18, 65, 66})\nvoid grenzwerte(int alter) { ... }</code></pre></div></div><div class=\"sheet-section\"><h2>SQL kompakt</h2><table class=\"lesson-table\"><tr><th>JOIN</th><th>Ergebnis</th></tr><tr><td>INNER JOIN</td><td>Nur Treffer auf beiden Seiten</td></tr><tr><td>LEFT OUTER JOIN</td><td>Alle links, rechts ggf. NULL</td></tr><tr><td>CROSS JOIN</td><td>Kartesisches Produkt</td></tr></table><table class=\"lesson-table\"><tr><th>Kategorie</th><th>Befehle</th></tr><tr><td>DDL</td><td>CREATE, ALTER, DROP</td></tr><tr><td>DML</td><td>SELECT, INSERT, UPDATE, DELETE</td></tr><tr><td>DCL</td><td>GRANT, REVOKE</td></tr><tr><td>TCL</td><td>COMMIT, ROLLBACK</td></tr></table><p style=\"font-size:.82rem;color:var(--text-dim);\">WHERE filtert Zeilen vor der Gruppierung, HAVING Gruppen danach. Auf fehlende Werte prüft man mit IS NULL.</p></div><div class=\"sheet-section\"><h2>Normalisierung & UML</h2><table class=\"lesson-table\"><tr><th>Begriff</th><th>Bedeutung</th></tr><tr><td>1NF</td><td>Nur atomare Werte</td></tr><tr><td>2NF</td><td>Keine Teilabhängigkeit vom zusammengesetzten Schlüssel</td></tr><tr><td>3NF</td><td>Keine transitiven Abhängigkeiten</td></tr><tr><td>Generalisierung</td><td>extends</td></tr><tr><td>Realisierung</td><td>implements</td></tr><tr><td>Komposition</td><td>Teil stirbt mit dem Ganzen</td></tr><tr><td>Aggregation</td><td>Teil existiert unabhängig</td></tr></table></div><div class=\"sheet-section\"><h2>Spring Boot: Annotationen</h2><table class=\"lesson-table\"><tr><th>Annotation</th><th>Zweck</th></tr><tr><td>@SpringBootApplication</td><td>Einstiegspunkt: Konfiguration, Auto-Config, Component-Scan</td></tr><tr><td>@Service / @Repository / @Component</td><td>Bean im Container registrieren</td></tr><tr><td>@Bean in @Configuration</td><td>Bean aus Fremdklassen erzeugen</td></tr><tr><td>@ConfigurationProperties</td><td>Typsichere, gebündelte Konfiguration</td></tr><tr><td>@RestController</td><td>Controller mit JSON-Rückgabe</td></tr><tr><td>@GetMapping / @PostMapping …</td><td>HTTP-Methode auf Methode abbilden</td></tr><tr><td>@PathVariable / @RequestParam / @RequestBody</td><td>Eingaben binden</td></tr><tr><td>@Valid</td><td>Bean Validation auslösen</td></tr><tr><td>@RestControllerAdvice</td><td>Zentrale Fehlerbehandlung</td></tr><tr><td>@Transactional</td><td>Transaktionsgrenze (an der Serviceschicht)</td></tr><tr><td>@EntityGraph</td><td>Beziehungen mitladen, gegen N+1</td></tr></table></div><div class=\"sheet-section\"><h2>Spring Boot: Grundgerüst</h2><div class=\"code-block\"><div class=\"code-head\"><span class=\"code-lang\">Spring Boot</span><button class=\"copy-btn\" data-onclick=\"copyCode(this)\">Kopieren</button></div><pre><code>@RestController\n@RequestMapping(\"/api/artikel\")\npublic class ArtikelController {\n    private final ArtikelService service;\n    public ArtikelController(ArtikelService s) { this.service = s; }   // Konstruktorinjektion\n\n    @GetMapping(\"/{id}\")\n    public ArtikelDto lesen(@PathVariable long id) {\n        return service.finde(id).orElseThrow(() -&gt; new NichtGefundenException(\"\" + id));\n    }\n\n    @PostMapping\n    public ResponseEntity&lt;ArtikelDto&gt; anlegen(@Valid @RequestBody NeuerArtikel e) {\n        var neu = service.anlegen(e);\n        return ResponseEntity.created(URI.create(\"/api/artikel/\" + neu.id())).body(neu);\n    }\n}</code></pre></div></div><div class=\"sheet-section\"><h2>Spring: Testarten & Statuscodes</h2><table class=\"lesson-table\"><tr><th>Testart</th><th>Lädt</th></tr><tr><td>Plain JUnit</td><td>Nichts von Spring — für Geschäftslogik</td></tr><tr><td>@WebMvcTest</td><td>Nur die Web-Schicht</td></tr><tr><td>@DataJpaTest</td><td>Nur JPA mit Testdatenbank</td></tr><tr><td>@SpringBootTest</td><td>Gesamten Kontext — sparsam einsetzen</td></tr></table><table class=\"lesson-table\"><tr><th>Status</th><th>Bedeutung</th></tr><tr><td>200 / 201 / 204</td><td>OK / Angelegt (mit Location) / Kein Inhalt</td></tr><tr><td>400 / 401 / 403 / 404</td><td>Ungültig / Nicht angemeldet / Verboten / Nicht gefunden</td></tr><tr><td>409 / 500</td><td>Konflikt / Interner Fehler</td></tr></table></div><div class=\"sheet-section\"><h2>Werkzeuge</h2><table class=\"lesson-table\"><tr><th>Werkzeug</th><th>Zweck</th></tr><tr><td>javac / java</td><td>Kompilieren und Ausführen</td></tr><tr><td>Maven / Gradle</td><td>Build und Abhängigkeiten</td></tr><tr><td>JUnit 5 + Mockito</td><td>Tests und Test Doubles</td></tr><tr><td>SLF4J + Logback</td><td>Logging</td></tr><tr><td>JaCoCo</td><td>Testabdeckung</td></tr><tr><td>VisualVM / JMH</td><td>Profiling und Mikrobenchmarks</td></tr><tr><td>mvn dependency:tree</td><td>Versionskonflikte finden</td></tr></table></div></section>";
var RP_APPLICATION_SUPPLEMENTS=[{"id":"api-m1-l6","title":"SSRF: Wenn der Server fremde URLs abruft","source":"https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html","html":"<p>Ein Bildimport oder Webhook-Tester ruft eine vom Benutzer gelieferte URL vom Server aus ab. Bei <strong>Server-Side Request Forgery (SSRF)</strong> missbraucht ein Angreifer dessen Netzwerkzugang, etwa zu internen Admin-Endpunkten oder Cloud-Metadaten. Ein erfolgreicher Login und CORS schützen diesen ausgehenden Zugriff nicht.</p><p>Wo möglich feste Zielsysteme erlauben statt beliebiger URLs. URL mit einem bewährten Parser zerlegen; Protokoll, Host und Port erlaubnislistenbasiert prüfen, Credentials ablehnen. Sämtliche aufgelösten IPv4-/IPv6-Ziele gegen die Netzwerkpolicy prüfen; ein öffentlicher Hostname allein genügt wegen DNS-Rebinding nicht. Der tatsächlich verbundene Zielhost muss zur geprüften Adresse passen, während TLS den ursprünglichen Host weiterhin korrekt verifiziert. Keine selbst geschriebene Teilprüfung als vollständigen Schutz ausgeben.</p><p>Redirects abschalten oder jedes neue Ziel gleichwertig validieren. Zusätzlich Egress-Firewall/Proxy, begrenzte Antwortgröße, Timeout und restriktive Zielports einsetzen. Keine Cookies oder Authorization-Header an fremde Ziele weiterreichen. Diese Lektion führt absichtlich keinen echten Request gegen interne Dienste aus.</p><h4>Praxisauftrag und Abnahme</h4><ol><li>Normalfall: Erlaubter HTTPS-Bildanbieter liefert eine begrenzte Bildantwort. Dokumentiere Policy, Timeout und Größenlimit.</li><li>Grenzfall: Der erlaubte Name löst zu mehreren Adressen auf, darunter eine interne IPv6-Adresse. Erwartung: keine Verbindung zu einem nicht erlaubten Ziel.</li><li>Fehlerfall: Ein erlaubter Anbieter antwortet mit Redirect auf einen internen Dienst. Teste mit lokalen HTTP-/DNS-Fixtures, nicht mit realen Metadatendiensten: Redirect verweigern oder neu prüfen.</li></ol><p><strong>Selbsttest:</strong> „Der Hostname enthält unseren Anbieternamen“ ist keine Hostprüfung: <code>trusted.example.attacker.invalid</code> gehört nicht zu <code>trusted.example</code>. Auch korrektes Parsen allein verhindert kein DNS-Rebinding. Abnahme verlangt überprüfte Verbindung und unabhängige Netzgrenzen.</p>"},{"id":"api-m1-l2","title":"HTTP Caching: Frische, Validierung und private Daten","source":"https://www.rfc-editor.org/rfc/rfc9111","html":"<p>Browsercache und gemeinsamer Proxy-/CDN-Cache haben unterschiedliche Vertrauensgrenzen. <code>Cache-Control: private</code> untersagt Speicherung in Shared Caches, erlaubt aber grundsätzlich private Speicherung. <code>no-store</code> untersagt das Speichern dieser Antwort; es entfernt nicht rückwirkend sämtliche früheren Kopien. <code>no-cache</code> bedeutet dagegen: vor Wiederverwendung erfolgreich validieren, nicht „niemals speichern“.</p><pre><code>GET /catalog HTTP/1.1\nIf-None-Match: \"catalog-r7\"\n\nHTTP/1.1 304 Not Modified\nETag: \"catalog-r7\"\nCache-Control: public, max-age=60\nVary: Accept-Encoding</code></pre><p>304 hat keinen Nachrichteninhalt; der Client verwendet seine gespeicherte Repräsentation. <code>If-None-Match</code> dient hier der Cachevalidierung; <code>If-Match</code> beim Schreiben schützt dagegen bei atomarer Prüfung vor Lost Updates. <code>Vary</code> benennt Requestfelder, die zur Auswahl einer Repräsentation beitragen. Es ist kein Ersatz für Autorisierung. Ein CDN darf personalisierte Antworten nicht versehentlich unter einem gemeinsamen öffentlichen Schlüssel speichern; Set-Cookie allein ist keine universelle Cache-Sperre.</p><h4>Praxisauftrag und Abnahme</h4><ol><li>Normalfall: Öffentlichen Katalog mit ETag lesen, dann bedingt erneut anfordern. Gleiche Revision ergibt 304 ohne Body, neue Revision 200 mit neuem ETag.</li><li>Grenzfall: Zwei Kompressionsvarianten abrufen und Vary prüfen. Fingerprint-Dateinamen können lange gecacht werden; überschreibbare Dateinamen brauchen Revalidierung oder kurze Frische.</li><li>Fehlerfall: Zwei Benutzer rufen <code>/api/me</code> durch einen Testproxy ab. Nutze <code>Cache-Control: no-store</code>; kein Benutzer darf Daten des anderen erhalten. Zusätzlich Logout/Zurück-Navigation prüfen, ohne Cacheheader für eine vollständige Browser-Datenlöschung zu halten.</li></ol><p><strong>Selbsttest:</strong> Eine sensible Antwort soll nicht gespeichert werden: no-store ist passend, no-cache allein nicht. Ein Cachetreffer beweist keine aktuelle Berechtigung. Tests brauchen deshalb getrennte Benutzer und einen tatsächlich eingeschalteten Testcache.</p>"},{"id":"m49-l3","title":"Transactional Outbox: Commit und Nachricht zuverlässig verbinden","source":"https://microservices.io/patterns/data/transactional-outbox.html","html":"<p>Eine Bestellung wird gespeichert und danach ein Event gesendet. Stirbt der Prozess zwischen Commit und Send, fehlt das Event; Send vor Commit kann dagegen eine später zurückgerollte Bestellung melden. Eine lokale DB-Transaktion kann eine bereits zugestellte Nachricht nicht zurücknehmen.</p><pre><code>BEGIN;\nINSERT INTO orders (id, status) VALUES (42, 'confirmed');\nINSERT INTO outbox (event_id, aggregate_id, event_type, payload)\nVALUES ('evt-42-1', 42, 'order.confirmed', '{\"orderId\":42}');\nCOMMIT;\n-- Separater Relay liest committed Outbox-Zeilen,\n-- publiziert und markiert bestätigte Zustellung.</code></pre><p>Fachdaten und Outbox werden in <strong>derselben</strong> lokalen Transaktion geschrieben. Der Relay kann nach bestätigtem Publish, aber vor seiner eigenen Markierung abstürzen. Deshalb muss mit erneuter Zustellung gerechnet werden. Beim Consumer werden eine eindeutige Event-ID und die lokale Fachwirkung gemeinsam in einer Transaktion gespeichert; ein UNIQUE-Constraint schützt vor doppelter Anwendung. Für externe Effekte wie Zahlungen ist zusätzlich die Idempotenzfunktion des Zielsystems oder ein belastbarer Abgleich nötig.</p><p>Retry mit Backoff und begrenztem Budget, Quarantäne fehlerhafter Nachrichten, kontrolliertes Replay und Monitoring des ältesten offenen Events gehören zum Betrieb. Reihenfolge pro Aggregat gegebenenfalls durch Sequenznummern/Partitionierung absichern; mehrere Worker garantieren sie nicht automatisch. Outbox ist kein globaler Exactly-once-Beweis.</p><h4>Praxisauftrag und Abnahme</h4><ol><li>Normalfall: Bestellung und Outbox committen gemeinsam; ein Test-Relay veröffentlicht das Event.</li><li>Grenzfall: Dasselbe Event zweimal liefern. Die lokale Lagerwirkung erfolgt genau einmal; Deduplizierungsmarker und Wirkung werden gemeinsam committed.</li><li>Fehlerfall: Crash nach Publish, aber vor Markierung simulieren. Wiederanlauf liefert erneut, ohne doppelte Wirkung. Bei Rollback der Bestellung darf keine committed Outbox-Zeile übrig bleiben.</li></ol><p><strong>Selbsttest:</strong> Eine Zeile vor Publish als erledigt markieren verhindert Duplikate nicht zuverlässig, sondern riskiert Nachrichtenverlust. Erst nach bestätigtem Publish markieren und Duplikate auf Empfängerseite absichern. Protokolliere ausgeführte Crash-Fixtures getrennt von nur geplanten Tests.</p>"}];
var RP_ABAP_SENIOR_LESSONS=[{"id":"abap-m15-senior-authorization","moduleId":"abap-m15","title":"RAP-Berechtigungen durchgängig: DCL, Operationen und negative Tests","minutes":30,"prerequisites":"CDS-Projektionen, RAP-Verhalten und Rollen-Grundlagen; zwei getrennte Testbenutzer in einer freigegebenen Lernumgebung.","objectives":["Lese-, Änderungs- und Serviceberechtigungen getrennt modellieren.","Unbeabsichtigte Rechteausweitung über Projektionen und interne Aufrufe erkennen.","Negative Berechtigungstests mit beobachtbarem Soll-Ergebnis entwerfen."],"paragraphs":["Ein Sachbearbeiter darf Belege seines Buchungskreises lesen, aber nur offene Belege ändern. Dafür reichen weder ein ausgeblendeter Fiori-Button noch ein erfolgreicher OData-Serviceaufruf. Trenne Servicezugang, datensatzbezogenes Lesen und erlaubte Änderungen/Aktionen. Die konkrete Rollenpflege unterscheidet sich zwischen klassischen PFCG-Landschaften, S/4HANA Cloud und SAP BTP ABAP environment.","CDS Access Controls in DCL begrenzen den Zugriff auf die jeweilige CDS-Entität. Eine Projektion erbt diese Bedingungen nicht automatisch nur deshalb, weil sie auf einer geschützten View aufbaut. Definiere für den tatsächlich exponierten Zugriff eine passende Access Control, gegebenenfalls mit expliziter Vererbung. Die Annotation authorizationCheck allein formuliert noch keine fachliche Filterbedingung. Direkter Tabellenzugriff ist nicht automatisch durch die DCL einer anderen View geschützt.","RAP Global Authorization prüft instanzunabhängige Rechte, etwa ob ein Benutzer grundsätzlich anlegen darf. Instance Authorization berücksichtigt den Zustand einer Instanz. Eine Prüfung des bestehenden Buchungskreises ist nicht automatisch eine Prüfung eines neu übergebenen Buchungskreises: ein unerlaubter Wechsel muss zusätzlich passend zum Zielzustand abgewehrt werden. Feature Control verbessert die Bedienung, ersetzt aber keine Autorisierung.","IN LOCAL MODE ist ein bewusster interner Zugriff im eigenen Behavior-Kontext und kann Autorisierungs- und Featureprüfungen umgehen. Nutze es nicht als Reparatur für einen 403-Fehler. Prüfe privilegierte Lesepfade, technische Benutzer, Hintergrundjobs und Exporte separat. Ein Test mit dem Entwickler-Admin kann eine fehlende DCL verdecken."],"codeLang":"text","cases":["Benutzer A liest einen eigenen offenen Beleg und ändert einen erlaubten Text; nur dieser Beleg ändert sich.","Ein eigener bereits gebuchter Beleg bleibt lesbar, eine verbotene Änderungsaktion wird verweigert.","A sendet fremden Schlüssel oder unzulässigen Buchungskreis direkt an den Service; kein fremder Inhalt und keine persistierte Änderung."],"quiz":[{"q":"Eine CDS-Projektion exponiert Belege über OData. Nur die darunterliegende Modell-View hat DCL. Welcher Review-Schritt ist erforderlich?","options":["Den Filter der Modell-View als automatisch geerbt dokumentieren.","Die exponierte Entität und deren Access Control explizit prüfen.","Nur das Entfernen der Fiori-Suchfunktion im Client testen."],"correct":1,"rationales":["DCL der unteren View schützt die darauf aufgebaute Projektion nicht pauschal.","Die Lesegrenze muss am tatsächlichen Zugriff wirken; explizite Vererbung kann dafür eingesetzt werden.","Die Suche zu verstecken verhindert direkte Servicezugriffe nicht."],"explain":"Nicht passend: DCL der unteren View schützt die darauf aufgebaute Projektion nicht pauschal. Richtig: Die Lesegrenze muss am tatsächlichen Zugriff wirken; explizite Vererbung kann dafür eingesetzt werden. Nicht passend: Die Suche zu verstecken verhindert direkte Servicezugriffe nicht.","sources":["https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Eine RAP-Action ist in Fiori deaktiviert. Ein direkter Request kann sie dennoch unberechtigt ausführen. Was ist die richtige Korrektur?","options":["Die serverseitige Autorisierung der Operation ergänzen und negativ testen.","Den Button zusätzlich aus der Toolbar-Konfiguration entfernen.","Den Service mit einem gemeinsamen Admin-Benutzer aufrufen."],"correct":0,"rationales":["Bedienhinweise sind keine harte Grenze; der Backendpfad muss unberechtigte Operationen verweigern.","Ein zweites UI-Versteck schließt den direkten Request nicht.","Ein Admin-Benutzer verschärft die Rechteausweitung und verdeckt fehlende Prüfungen."],"explain":"Richtig: Bedienhinweise sind keine harte Grenze; der Backendpfad muss unberechtigte Operationen verweigern. Nicht passend: Ein zweites UI-Versteck schließt den direkten Request nicht. Nicht passend: Ein Admin-Benutzer verschärft die Rechteausweitung und verdeckt fehlende Prüfungen.","sources":["https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Ein Benutzer darf einen Beleg aus Kreis 1000 ändern und übergibt als neuen Kreis 2000. Die Instanzprüfung prüft nur den alten Zustand. Was fehlt?","options":["Eine UI-Sortierung nach dem bisherigen Buchungskreis.","Ein Retry mit demselben Request nach der Instanzprüfung.","Eine passende Prüfung der Berechtigung für den Zielzustand."],"correct":2,"rationales":["Sortierung begrenzt weder Zielwerte noch Zugriffe.","Wiederholung ergänzt keine Prüfung des neu übergebenen Zustands.","Das Recht auf den bestehenden Beleg erlaubt nicht automatisch einen Wechsel in jeden anderen Berechtigungsbereich."],"explain":"Nicht passend: Sortierung begrenzt weder Zielwerte noch Zugriffe. Nicht passend: Wiederholung ergänzt keine Prüfung des neu übergebenen Zustands. Richtig: Das Recht auf den bestehenden Beleg erlaubt nicht automatisch einen Wechsel in jeden anderen Berechtigungsbereich.","sources":["https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks"],"revision":"2026-11-08-abap-senior-v1"}],"sourceKeys":["auth"],"order":["body","code","body2"],"sources":[{"title":"SAP-Originalquelle: auth","url":"https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks","access":"Öffentliche Fachreferenz; praktische Ausführung benötigt passendes SAP-System, Release, Zugang und Berechtigungen. Kein kostenloser Systemzugang zugesagt."}],"researchedAt":"2026-11-08","seniorRevision":"2026-11-08-abap-senior-v1","exercises":[{"level":"Normalfall","task":"Benutzer A liest einen eigenen offenen Beleg und ändert einen erlaubten Text; nur dieser Beleg ändert sich.","acceptance":"Soll-Ergebnis aus dem Fall begründen; bei Systemzugang tatsächliches Ergebnis und Release protokollieren. Ohne Systemzugang nur Entwurfsnachweis, kein ausgeführter SAP-Test."},{"level":"Grenzfall","task":"Ein eigener bereits gebuchter Beleg bleibt lesbar, eine verbotene Änderungsaktion wird verweigert.","acceptance":"Soll-Ergebnis aus dem Fall begründen; bei Systemzugang tatsächliches Ergebnis und Release protokollieren. Ohne Systemzugang nur Entwurfsnachweis, kein ausgeführter SAP-Test."},{"level":"Fehlerfall","task":"A sendet fremden Schlüssel oder unzulässigen Buchungskreis direkt an den Service; kein fremder Inhalt und keine persistierte Änderung.","acceptance":"Soll-Ergebnis aus dem Fall begründen; bei Systemzugang tatsächliches Ergebnis und Release protokollieren. Ohne Systemzugang nur Entwurfsnachweis, kein ausgeführter SAP-Test."}]},{"id":"abap-m12-senior-eml-tests","moduleId":"abap-m12","title":"RAP mit EML testen: Puffer, Save Sequence und echte Fehlernachweise","minutes":35,"prerequisites":"Managed RAP BO, EML-Grundlagen und ABAP Unit; CDS-/SQL-Test-Doubles im Zielrelease verfügbar.","objectives":["Puffererfolg von erfolgreicher Persistierung unterscheiden.","FAILED, REPORTED und MAPPED fachlich auswerten.","BO-Szenariotests von Autorisierungs- und HTTP-Integrationstests abgrenzen."],"paragraphs":["Ein Test, der nur prüft, dass MODIFY ENTITIES keinen Dump erzeugt, belegt wenig. EML bearbeitet zunächst den transaktionalen Puffer. Validierungen und späte Fehler können erst in der Save Sequence sichtbar werden. Definiere deshalb vorher den fachlichen Vertrag: Ein gültiger Auftrag wird mit korrekten Werten gespeichert; ein ungültiger Auftrag hinterlässt keine persistierte Instanz.","FAILED benennt fehlgeschlagene Instanzen, REPORTED transportiert Meldungen und MAPPED ordnet temporäre Anlege-IDs den Schlüsseln zu. Eine Meldung kann auch eine Warnung sein; REPORTED ungleich initial ist nicht pauschal ein fehlgeschlagener Save. Prüfe erwartete Meldungsschwere, betroffene Instanz und bei feldbezogenen Meldungen den Feldbezug. Die Responses des Änderungsaufrufs und des Commits sind getrennte Prüfpunkte.","Ein äußerer EML-Consumer oder Szenariotest steuert COMMIT ENTITIES beziehungsweise ROLLBACK ENTITIES. Innerhalb der Behavior-Implementierung gehört diese Transaktionssteuerung dem RAP-Framework; dort nicht eigenmächtig COMMIT WORK oder COMMIT ENTITIES einbauen. Teste fachlichen Zustand nach erfolgreichem Save, nicht nur die Anzahl gemappter Schlüssel.","Das SAP-RAP100-Beispiel isoliert CDS-Lesezugriffe und zusätzliche SQL-Abhängigkeiten mit passenden Test-Doubles. setup leert Testzustand, class_teardown zerstört die Testumgebungen. ROLLBACK ENTITIES verwirft noch nicht gespeicherte Pufferdaten, ist aber kein universelles Undo eines früheren echten Datenbankcommits. Verwende keine produktiven Tabellen als Testfixture. Ein isolierter EML-Test mit internem Zugriff beweist weder Benutzerautorisierung noch HTTP-ETag-Verhalten."],"codeLang":"abap","cases":["Gültige Instanz erzeugen, Action ausführen und nach Save den erwarteten Status und Betrag prüfen.","Eine gültige Warnung zulassen und anhand der Schwere zeigen, dass nicht jede Meldung einen Fehler bedeutet.","Datum verletzt Save-Validierung: späte Fehlerresponse prüfen und nachweisen, dass keine neue fachliche Instanz gespeichert wurde."],"quiz":[{"q":"Ein EML-Test erhält nach CREATE einen gemappten Schlüssel. Die Save-Validierung schlägt später fehl. Welche Aussage trägt der erste Prüfschritt allein?","options":["Der vollständige Auftrag wurde bereits dauerhaft gespeichert.","Der Benutzer besitzt alle benötigten OData-Schreibrechte.","Die frühe Anlegephase lieferte ein Mapping, nicht den Save-Erfolg."],"correct":2,"rationales":["Ein Mapping belegt nicht den Erfolg der späteren Save Sequence.","Ein internes EML-Mapping prüft nicht sämtliche Service- und Benutzergrenzen.","Commitresponses und persistierter Fachzustand sind eigene Nachweise."],"explain":"Nicht passend: Ein Mapping belegt nicht den Erfolg der späteren Save Sequence. Nicht passend: Ein internes EML-Mapping prüft nicht sämtliche Service- und Benutzergrenzen. Richtig: Commitresponses und persistierter Fachzustand sind eigene Nachweise.","sources":["https://developers.sap.com/tutorials/abap-environment-rap100-unit-testing.html"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Nach dem COMMIT ENTITIES eines äußeren Szenariotests ist REPORTED gefüllt, FAILED aber leer. Wie bewertet man den Lauf?","options":["Jede vorhandene Meldung als fehlgeschlagenen Commit behandeln.","Meldungsschwere, Sollvertrag und gespeicherten Zustand prüfen.","Alle Meldungen löschen und nur auf den gemappten Schlüssel schauen."],"correct":1,"rationales":["REPORTED kann auch Informationen oder Warnungen enthalten.","Die fachliche Erwartung und Fehlerresponse entscheiden, nicht bloß die Existenz einer Meldung.","Damit würden relevante Warnungen und fachliche Abweichungen verdeckt."],"explain":"Nicht passend: REPORTED kann auch Informationen oder Warnungen enthalten. Richtig: Die fachliche Erwartung und Fehlerresponse entscheiden, nicht bloß die Existenz einer Meldung. Nicht passend: Damit würden relevante Warnungen und fachliche Abweichungen verdeckt.","sources":["https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/using-the-entity-manipulation-language-eml-to-access-business-objects"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Ein Behavior-Handler soll nach jeder Änderung selbst COMMIT WORK ausführen, damit der Test grün wird. Was ist angemessen?","options":["Transaktionshoheit beim Framework lassen und den äußeren Test korrigieren.","COMMIT WORK im Handler durch COMMIT ENTITIES im Handler ersetzen.","Den Commit nur bei aktivem Debugger im Handler ausführen."],"correct":0,"rationales":["Eigenmächtiges Commit im Handler verletzt das RAP-Transaktionsmodell.","Auch diese Transaktionssteuerung gehört hier nicht in die Behavior-Implementierung.","Das erzeugt abweichendes Laufzeitverhalten statt eines belastbaren Tests."],"explain":"Richtig: Eigenmächtiges Commit im Handler verletzt das RAP-Transaktionsmodell. Nicht passend: Auch diese Transaktionssteuerung gehört hier nicht in die Behavior-Implementierung. Nicht passend: Das erzeugt abweichendes Laufzeitverhalten statt eines belastbaren Tests.","sources":["https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/using-the-entity-manipulation-language-eml-to-access-business-objects"],"revision":"2026-11-08-abap-senior-v1"}],"sourceKeys":["tests","eml"],"order":["body","code","body2"],"sources":[{"title":"SAP-Originalquelle: tests","url":"https://developers.sap.com/tutorials/abap-environment-rap100-unit-testing.html","access":"Öffentliche Fachreferenz; praktische Ausführung benötigt passendes SAP-System, Release, Zugang und Berechtigungen. Kein kostenloser Systemzugang zugesagt."},{"title":"SAP-Originalquelle: eml","url":"https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/using-the-entity-manipulation-language-eml-to-access-business-objects","access":"Öffentliche Fachreferenz; praktische Ausführung benötigt passendes SAP-System, Release, Zugang und Berechtigungen. Kein kostenloser Systemzugang zugesagt."}],"researchedAt":"2026-11-08","seniorRevision":"2026-11-08-abap-senior-v1","exercises":[{"level":"Normalfall","task":"Gültige Instanz erzeugen, Action ausführen und nach Save den erwarteten Status und Betrag prüfen.","acceptance":"Soll-Ergebnis aus dem Fall begründen; bei Systemzugang tatsächliches Ergebnis und Release protokollieren. Ohne Systemzugang nur Entwurfsnachweis, kein ausgeführter SAP-Test."},{"level":"Grenzfall","task":"Eine gültige Warnung zulassen und anhand der Schwere zeigen, dass nicht jede Meldung einen Fehler bedeutet.","acceptance":"Soll-Ergebnis aus dem Fall begründen; bei Systemzugang tatsächliches Ergebnis und Release protokollieren. Ohne Systemzugang nur Entwurfsnachweis, kein ausgeführter SAP-Test."},{"level":"Fehlerfall","task":"Datum verletzt Save-Validierung: späte Fehlerresponse prüfen und nachweisen, dass keine neue fachliche Instanz gespeichert wurde.","acceptance":"Soll-Ergebnis aus dem Fall begründen; bei Systemzugang tatsächliches Ergebnis und Release protokollieren. Ohne Systemzugang nur Entwurfsnachweis, kein ausgeführter SAP-Test."}]},{"id":"abap-m13-senior-side-effects","moduleId":"abap-m13","title":"Fiori Elements V4: Side Effects, Meldungen und sichere Erweiterungen","minutes":30,"prerequisites":"Fiori Elements List Report/Object Page, OData V4 und RAP-Determinations; SAPUI5-Version und Service-Metadaten bekannt.","objectives":["Backend-Neuberechnung und UI-Neuladen unterscheiden.","Side-Effect-Quellen und Ziele aus dem Datenvertrag herleiten.","Unterstützte Extension APIs statt generierter Control-Interna wählen."],"paragraphs":["Ein Benutzer ändert Menge von 2 auf 3 bei Einzelpreis 10. Das Backend berechnet den Betrag von 20 auf 30, die Object Page zeigt aber weiter 20. Ursache kann eine fehlende Aktualisierung des betroffenen Feldes sein, nicht eine fehlende Multiplikation. Ein Side Effect beschreibt, welche Repräsentationen nach einer Änderung neu gelesen werden sollen; die Annotation ist nicht selbst die fachliche Berechnung.","Für OData V4 verbinden Side-Effect-Metadaten etwa Quantity als Quelle mit NetAmount als Ziel. Prüfe die tatsächlich ausgelieferten Metadaten und die Unterstützung deiner SAPUI5-/Backendversion. RAP-Side-Effect-Definitionen und lokale XML-Annotationen sind unterschiedliche Wege mit releaseabhängigen Möglichkeiten. CAP-CDS-Syntax aus einem Fiori-Tutorial ist nicht unverändert ABAP CDS. Standard-Side-Effects existieren bereits, zusätzliche Regeln müssen nicht jeden Refresh duplizieren.","Ein ungültiger Wert kann schon an der Clientvalidierung scheitern. Dann wird die Änderung noch nicht an das Backend geschickt und die Neuberechnung wird nicht ausgelöst. Analysiere zuerst den Browser-Network-Tab: PATCH, Batch-Teilantworten, nachfolgende Reads und fachliche Meldungen. HTTP 200 für den äußeren Batch beweist nicht den Erfolg jedes inneren Requests. Backendfehler gehören als verständliche, möglichst feldbezogene Meldungen in den regulären Message Flow.","Erweitere zuerst über Annotationen und Konfiguration, dann über dokumentierte Extension Points, Building Blocks und Controller Extensions. Greife nicht auf private generierte Controller oder zufällige DOM-IDs zu. Die SAP-Learning-Quelle zeigt clientseitige Extensions an einem CAP-Backend; ihre Backendbeispiele werden hier nicht als RAP-Code ausgegeben. Prüfe asynchrone Antworten nach Navigation auf den aktuellen Binding-Kontext, damit Daten von Objekt A nicht auf Objekt B erscheinen."],"codeLang":"text","cases":["Menge 2 → 3: Backendbetrag und sichtbarer Betrag werden 30; gezielter Ziel-Read nachvollziehbar.","Ungültiger Zahlenwert: sichtbare Validierung, kein unbeabsichtigter Serverwrite und keine erfundene Neuberechnung.","Während einer langsamen Erweiterungsabfrage von A nach B navigieren: verspätetes Ergebnis von A überschreibt B nicht."],"quiz":[{"q":"Nach einer Mengenänderung berechnet RAP den Betrag korrekt, Fiori zeigt noch den alten Wert. Was prüfst du zuerst?","options":["Side-Effect-Ziel, Metadaten und den nachfolgenden Read des Betrags.","Eine zweite unabhängige Preisberechnung im Controller einführen.","Die ETag-Prüfung für alle Schreibrequests der App entfernen."],"correct":0,"rationales":["Die Backendberechnung ist bereits korrekt; die aktualisierte Repräsentation muss den Client erreichen.","Doppelte Fachlogik kann abweichende Ergebnisse und Rundungsfehler erzeugen.","Nebenläufigkeitsschutz zu entfernen aktualisiert keine Anzeige und riskiert Lost Updates."],"explain":"Richtig: Die Backendberechnung ist bereits korrekt; die aktualisierte Repräsentation muss den Client erreichen. Nicht passend: Doppelte Fachlogik kann abweichende Ergebnisse und Rundungsfehler erzeugen. Nicht passend: Nebenläufigkeitsschutz zu entfernen aktualisiert keine Anzeige und riskiert Lost Updates.","sources":["https://github.com/SAP-docs/sapui5/blob/main/docs/06_SAP_Fiori_Elements/side-effects-18b17bd.md"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Im Fiori-V4-Formular verletzt eine Eingabe MaxLength. Es gibt keinen PATCH und kein Side-Effect-Read. Was passt zum Ablauf?","options":["Der Side Effect sollte die ungültige Eingabe ohne Server korrigieren.","Der Server hat die Eingabe bereits erfolgreich gespeichert.","Die Clientvalidierung hält den Write bis zur Korrektur zurück."],"correct":2,"rationales":["Side Effects sind keine allgemeine clientseitige Reparaturregel für ungültige Werte.","Ohne gesendeten Schreibrequest folgt aus der UI-Eingabe kein Serverwrite.","Solange die betroffenen Werte ungültig sind, wird der Backendablauf nicht regulär ausgelöst."],"explain":"Nicht passend: Side Effects sind keine allgemeine clientseitige Reparaturregel für ungültige Werte. Nicht passend: Ohne gesendeten Schreibrequest folgt aus der UI-Eingabe kein Serverwrite. Richtig: Solange die betroffenen Werte ungültig sind, wird der Backendablauf nicht regulär ausgelöst.","sources":["https://github.com/SAP-docs/sapui5/blob/main/docs/06_SAP_Fiori_Elements/side-effects-18b17bd.md"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Eine Fiori-Erweiterung benötigt einen dokumentierten Edit-Hook. Welche Abhängigkeit ist am tragfähigsten?","options":["Die interne generierte Controller-Methode aus dem Debugger kopieren.","Die passende öffentliche Controller Extension der Zielversion verwenden.","Eine zufällig beobachtete DOM-ID der Speichern-Schaltfläche fest verdrahten."],"correct":1,"rationales":["Private Implementierungsdetails haben keinen stabilen Erweiterungsvertrag.","Ein dokumentierter Hook ist der vorgesehene Vertrag; Verfügbarkeit und Lifecycle werden dennoch geprüft.","Generierte DOM-Struktur ist kein Ersatz für eine unterstützte API."],"explain":"Nicht passend: Private Implementierungsdetails haben keinen stabilen Erweiterungsvertrag. Richtig: Ein dokumentierter Hook ist der vorgesehene Vertrag; Verfügbarkeit und Lifecycle werden dennoch geprüft. Nicht passend: Generierte DOM-Struktur ist kein Ersatz für eine unterstützte API.","sources":["https://learning.sap.com/courses/developing-an-sap-fiori-elements-app-based-on-a-cap-odata-v4-service/using-controller-extensions_f47e841f-2dd8-4b88-ba5e-39c0eedd983e"],"revision":"2026-11-08-abap-senior-v1"}],"sourceKeys":["sideEffects","extensions"],"order":["body","code","body2"],"sources":[{"title":"SAP-Originalquelle: sideEffects","url":"https://github.com/SAP-docs/sapui5/blob/main/docs/06_SAP_Fiori_Elements/side-effects-18b17bd.md","access":"Öffentliche Fachreferenz; praktische Ausführung benötigt passendes SAP-System, Release, Zugang und Berechtigungen. Kein kostenloser Systemzugang zugesagt."},{"title":"SAP-Originalquelle: extensions","url":"https://learning.sap.com/courses/developing-an-sap-fiori-elements-app-based-on-a-cap-odata-v4-service/using-controller-extensions_f47e841f-2dd8-4b88-ba5e-39c0eedd983e","access":"Öffentliche Fachreferenz; praktische Ausführung benötigt passendes SAP-System, Release, Zugang und Berechtigungen. Kein kostenloser Systemzugang zugesagt."}],"researchedAt":"2026-11-08","seniorRevision":"2026-11-08-abap-senior-v1","exercises":[{"level":"Normalfall","task":"Menge 2 → 3: Backendbetrag und sichtbarer Betrag werden 30; gezielter Ziel-Read nachvollziehbar.","acceptance":"Soll-Ergebnis aus dem Fall begründen; bei Systemzugang tatsächliches Ergebnis und Release protokollieren. Ohne Systemzugang nur Entwurfsnachweis, kein ausgeführter SAP-Test."},{"level":"Grenzfall","task":"Ungültiger Zahlenwert: sichtbare Validierung, kein unbeabsichtigter Serverwrite und keine erfundene Neuberechnung.","acceptance":"Soll-Ergebnis aus dem Fall begründen; bei Systemzugang tatsächliches Ergebnis und Release protokollieren. Ohne Systemzugang nur Entwurfsnachweis, kein ausgeführter SAP-Test."},{"level":"Fehlerfall","task":"Während einer langsamen Erweiterungsabfrage von A nach B navigieren: verspätetes Ergebnis von A überschreibt B nicht.","acceptance":"Soll-Ergebnis aus dem Fall begründen; bei Systemzugang tatsächliches Ergebnis und Release protokollieren. Ohne Systemzugang nur Entwurfsnachweis, kein ausgeführter SAP-Test."}]},{"id":"abap-m14-senior-btp-identity","moduleId":"abap-m14","title":"BTP Connectivity: Destination, Cloud Connector und Benutzeridentität","minutes":30,"prerequisites":"HTTP, Authentifizierung/Autorisierung und BTP-Subaccount; Architekturübung ohne echte Zugangsdaten möglich.","objectives":["Netzweg, Trust und Fachberechtigung getrennt diagnostizieren.","Benutzerweitergabe von technischen Integrationsidentitäten abgrenzen.","BTP Cloud Foundry und ABAP-Communication-Konfiguration nicht vermischen."],"paragraphs":["Eine Side-by-Side-App auf BTP erreicht einen internen S/4HANA-Service. Die Destination beschreibt Ziel und Authentifizierungsart; Connectivity und Cloud Connector ermöglichen den kontrollierten Weg ins On-Premise-Netz. Eine grüne Destination-Verbindungsprüfung beweist weder korrekte Endbenutzerzuordnung noch fachliche Rechte. Entitlements, Subaccount, Runtime und Servicebindungen müssen für die konkrete App passen.","Bei Principal Propagation wird die angemeldete Identität entlang einer eingerichteten Vertrauenskette an das Backend weitergegeben. Cloud Connector muss nur notwendige Systeme und Ressourcen freigeben; virtuelle Hosts und Location ID gehören zum Routingvertrag. Das Backend muss die übermittelte Identität korrekt einem Benutzer zuordnen und dessen Rechte prüfen. Eine unkontrollierte Weitergabe des Browser-Bearer-Tokens an irgendeine URL ist keine Principal Propagation.","Interaktive Aktionen können eine Benutzeridentität benötigen; ein nächtlicher Job braucht häufig eine eigens begrenzte technische Identität. OAuth Client Credentials ist nicht automatisch ein Endbenutzerkontext. Wähle Authentifizierungsverfahren anhand des unterstützten API-/Kommunikationsszenarios. SAP BTP ABAP environment verwendet für viele Verbindungen Communication Scenarios, Systems und Arrangements; Destination-Einstellungen einer Cloud-Foundry-App nicht blind auf jede ABAP-Laufzeit übertragen.","Fehlersuche folgt den Grenzen: DNS/Route/Cloud-Connector-Ressource, TLS und Trust, Token/Zertifikat und User-Mapping, Servicezugang, dann Fachrechte. 401/403 sind Hinweise, aber kein eindeutiger Ursachenbeweis; Proxy und Backend können beide antworten. Erfasse zuständiges System, Zeitfenster und bereinigte Korrelations-ID. Tokens, Cookies, private Schlüssel und personenbezogene Payloads gehören nicht in Tickets oder Screenshots."],"codeLang":"text","cases":["Zwei interaktive Testbenutzer werden im Backend unterschiedlich erkannt und erhalten nur ihre erlaubten Belege.","Ein technischer Jobzugang erreicht nur den vorgesehenen Service und besitzt keine allgemeinen Administratorrechte.","Mapping oder Ressourcenfreigabe fehlt: kontrollierter Fehler, lokalisierte Grenze und bereinigtes Diagnoseprotokoll ohne Secrets."],"quiz":[{"q":"Der BTP-Destination-Check ist grün, im Backend erscheinen alle Aufrufe als derselbe technische Benutzer. Was ist noch nicht belegt?","options":["Dass irgendeine technische Verbindung zum Ziel aufgebaut werden kann.","Dass individuelle Benutzeridentität und Fachrechte korrekt wirken.","Dass die App überhaupt einen Zielnamen konfigurieren durfte."],"correct":1,"rationales":["Ein erfolgreicher Check liefert gerade einen begrenzten Nachweis technischer Erreichbarkeit.","Connectivity-Erfolg und authentischer Endbenutzerkontext sind verschiedene Nachweise.","Der beobachtete Check beantwortet nicht die fachlich entscheidende Identitätsfrage durch diese Alternative."],"explain":"Nicht passend: Ein erfolgreicher Check liefert gerade einen begrenzten Nachweis technischer Erreichbarkeit. Richtig: Connectivity-Erfolg und authentischer Endbenutzerkontext sind verschiedene Nachweise. Nicht passend: Der beobachtete Check beantwortet nicht die fachlich entscheidende Identitätsfrage durch diese Alternative.","sources":["https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/configuring-principal-propagation"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Ein nächtlicher BTP-Job verwendet OAuth Client Credentials. Darf die Anwendung daraus die Identität des zuletzt angemeldeten Sachbearbeiters ableiten?","options":["Ja, der letzte Browserlogin bestimmt automatisch jeden Hintergrundjob.","Ja, wenn der Job denselben Destination-Namen wie die UI benutzt.","Nein, technische Identität und Endbenutzerkontext sind getrennt."],"correct":2,"rationales":["Ein technischer Token übernimmt keinen beliebigen früheren Browserkontext.","Der Name eines Ziels verleiht keine Endbenutzeridentität.","Das unterstützte Authverfahren und der Jobvertrag bestimmen, unter welcher Identität die Operation läuft."],"explain":"Nicht passend: Ein technischer Token übernimmt keinen beliebigen früheren Browserkontext. Nicht passend: Der Name eines Ziels verleiht keine Endbenutzeridentität. Richtig: Das unterstützte Authverfahren und der Jobvertrag bestimmen, unter welcher Identität die Operation läuft.","sources":["https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/configuring-principal-propagation"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Cloud-Foundry-Beispielwerte für eine Destination sollen in SAP BTP ABAP environment übernommen werden. Was ist der erste Schritt?","options":["Das passende Communication Scenario und die Laufzeitunterstützung prüfen.","Das technische Passwort als Konstante in die ABAP-Klasse schreiben.","Alle Backendpfade für den Cloud Connector pauschal freigeben."],"correct":0,"rationales":["ABAP-Kommunikationsartefakte und unterstützte Verfahren richten sich nach dem konkreten Szenario.","Hardcodierte Secrets sind kein Ersatz für passende Kommunikationskonfiguration.","Eine breite Netzfreigabe löst weder Laufzeitkompatibilität noch Identitätsvertrag."],"explain":"Richtig: ABAP-Kommunikationsartefakte und unterstützte Verfahren richten sich nach dem konkreten Szenario. Nicht passend: Hardcodierte Secrets sind kein Ersatz für passende Kommunikationskonfiguration. Nicht passend: Eine breite Netzfreigabe löst weder Laufzeitkompatibilität noch Identitätsvertrag.","sources":["https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/configuring-principal-propagation"],"revision":"2026-11-08-abap-senior-v1"}],"sourceKeys":["connectivity"],"order":["body","code","body2"],"sources":[{"title":"SAP-Originalquelle: connectivity","url":"https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/configuring-principal-propagation","access":"Öffentliche Fachreferenz; praktische Ausführung benötigt passendes SAP-System, Release, Zugang und Berechtigungen. Kein kostenloser Systemzugang zugesagt."}],"researchedAt":"2026-11-08","seniorRevision":"2026-11-08-abap-senior-v1","exercises":[{"level":"Normalfall","task":"Zwei interaktive Testbenutzer werden im Backend unterschiedlich erkannt und erhalten nur ihre erlaubten Belege.","acceptance":"Soll-Ergebnis aus dem Fall begründen; bei Systemzugang tatsächliches Ergebnis und Release protokollieren. Ohne Systemzugang nur Entwurfsnachweis, kein ausgeführter SAP-Test."},{"level":"Grenzfall","task":"Ein technischer Jobzugang erreicht nur den vorgesehenen Service und besitzt keine allgemeinen Administratorrechte.","acceptance":"Soll-Ergebnis aus dem Fall begründen; bei Systemzugang tatsächliches Ergebnis und Release protokollieren. Ohne Systemzugang nur Entwurfsnachweis, kein ausgeführter SAP-Test."},{"level":"Fehlerfall","task":"Mapping oder Ressourcenfreigabe fehlt: kontrollierter Fehler, lokalisierte Grenze und bereinigtes Diagnoseprotokoll ohne Secrets.","acceptance":"Soll-Ergebnis aus dem Fall begründen; bei Systemzugang tatsächliches Ergebnis und Release protokollieren. Ohne Systemzugang nur Entwurfsnachweis, kein ausgeführter SAP-Test."}]},{"id":"abap-m14-senior-s4-migration","moduleId":"abap-m14","title":"S/4HANA Custom Code: Migration, Clean Core und messbare Modernisierung","minutes":30,"prerequisites":"ABAP SQL, ATC und Erweiterungsstrategie; Schwerpunkt ERP → S/4HANA On-Premise/Private Edition, nicht pauschal Public Edition.","objectives":["Fachliche Migration und optionale Optimierung getrennt planen.","Nutzungsdaten und ATC-Funde begründet priorisieren.","Wrapper, Released APIs und Upgradeverantwortung unterscheiden."],"paragraphs":["SAP HANA ist die Datenbank, SAP S/4HANA das darauf aufbauende ERP-Produkt. Eine Datenbankumstellung allein macht alten Custom Code nicht fachlich kompatibel mit veränderten S/4HANA-Datenmodellen. Ein SELECT kann syntaktisch aktiv sein und dennoch falsche Semantik oder ein ungeeignetes Zugriffsmuster haben. Prüfe Zielrelease und Edition; verfügbare Werkzeuge und erlaubte Erweiterungen sind nicht überall gleich.","Beginne mit einem Inventar und einem aussagekräftigen Nutzungszeitraum, der auch Monats-/Jahresabschluss und seltene Pflichtprozesse berücksichtigt. Kein Aufruf im kurzen Messfenster bedeutet nicht automatisch entbehrlich. Ordne Eigentümer, Abhängigkeiten und geplante Ablösung zu. Nicht mehr benötigter Code wird nur nach freigegebenem Stilllegungsplan entfernt, nicht aufgrund einer einzelnen Statistik.","ATC mit passenden S/4HANA-Prüfungen und Simplification-Inhalten identifiziert Anpassungsbedarf. Behebe Syntaxfehler, wiederhole die Analyse und prüfe Quick Fixes fachlich. Ein grüner ATC-Lauf ist weder ein vollständiger Prozesstest noch ein Performancebeweis. Vergleiche Belegzahlen, Beträge und fachliche Zustände mit einer geprüften Referenz. Modifikationsabgleich und eigentliche Systemkonvertierung gehören in den dafür geregelten Projektablauf.","Nach fachlicher Korrektheit priorisierst du gemessene Hotspots, etwa mit SQL Monitor und der SQL Performance Tuning Worklist in unterstützten klassischen Landschaften. Nicht jeden LOOP reflexartig in AMDP übersetzen. Für neue ABAP-Cloud-Erweiterungen freigegebene APIs verwenden und Release Contract prüfen. Ein kundeneigener Wrapper um eine nicht freigegebene API macht die SAP-API selbst nicht released; in zulässigen klassischen Landschaften bleibt dies eine bewusst verwaltete Ausnahme mit eigener Upgradepflicht."],"codeLang":"text","cases":["Genutzten Z-Report mit einem releasebezogenen ATC-Fund anpassen und Belegzahlen/Beträge gegen Referenz prüfen.","Report nur am Jahresende genutzt: Eigentümer bestätigt Bedarf trotz leerem Wochenmessfenster.","Wrapper ruft nicht freigegebene API auf: keine falsche Cloud-Freigabe; Ausnahme und zulässige Alternative dokumentieren."],"quiz":[{"q":"Ein Z-Report wurde sieben Tage nicht aufgerufen, ist aber für den Jahresabschluss vorgesehen. Was folgt daraus?","options":["Report erst nach Prozess-/Ownerprüfung und längerer Nutzungsbewertung stilllegen.","Report automatisch löschen, weil Nutzungsdaten immer vollständig sind.","Report sofort durch AMDP ersetzen, weil die Nutzung selten ist."],"correct":0,"rationales":["Ein kurzes Messfenster deckt seltene verpflichtende Geschäftsprozesse nicht ab.","Die Beobachtungsdauer kann den relevanten Prozess schlicht verfehlen.","Seltene Nutzung begründet weder Löschung noch eine bestimmte Optimierungstechnik."],"explain":"Richtig: Ein kurzes Messfenster deckt seltene verpflichtende Geschäftsprozesse nicht ab. Nicht passend: Die Beobachtungsdauer kann den relevanten Prozess schlicht verfehlen. Nicht passend: Seltene Nutzung begründet weder Löschung noch eine bestimmte Optimierungstechnik.","sources":["https://learning.sap.com/courses/implementing-sap-s-4hana-cloud-private-edition/analyzing-customizations-after-system-conversion_b9083e6d-e207-4578-8aa6-6c85cb42974a"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Nach S/4HANA-Anpassung ist ATC grün. Welcher zusätzliche Nachweis fehlt für die fachliche Abnahme?","options":["Dass alle lokalen Variablennamen maximal kurz geschrieben sind.","Dass jede SELECT-Anweisung durch eine HANA-Prozedur ersetzt wurde.","Dass relevante Prozesse und Ergebnisse auf dem Zielrelease stimmen."],"correct":2,"rationales":["Namenslänge ist kein Nachweis korrekter Belegverarbeitung.","Eine pauschale technische Umschreibung beweist keine fachliche Gleichheit.","Statische Prüfungen ersetzen keine Regression der Geschäftsfunktionen."],"explain":"Nicht passend: Namenslänge ist kein Nachweis korrekter Belegverarbeitung. Nicht passend: Eine pauschale technische Umschreibung beweist keine fachliche Gleichheit. Richtig: Statische Prüfungen ersetzen keine Regression der Geschäftsfunktionen.","sources":["https://learning.sap.com/courses/implementing-sap-s-4hana-cloud-private-edition/analyzing-customizations-after-system-conversion_b9083e6d-e207-4578-8aa6-6c85cb42974a"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Ein eigener Wrapper kapselt eine nicht freigegebene SAP-API. Was ist die korrekte Bewertung?","options":["Die SAP-API ist dadurch automatisch für ABAP Cloud freigegeben.","Die Kapselung braucht zulässige Laufzeit und eigene Upgradeverantwortung.","Der Wrapper beseitigt jeden zukünftigen Regressionstest."],"correct":1,"rationales":["Eine Kundenkapselung ändert den Release Contract des SAP-Objekts nicht.","Eine erlaubte Ausnahme ist gesondert zu verwalten und nicht mit einem offiziellen Release gleichzusetzen.","Auch gekapselte Abhängigkeiten können bei einem Upgrade ihr Verhalten ändern."],"explain":"Nicht passend: Eine Kundenkapselung ändert den Release Contract des SAP-Objekts nicht. Richtig: Eine erlaubte Ausnahme ist gesondert zu verwalten und nicht mit einem offiziellen Release gleichzusetzen. Nicht passend: Auch gekapselte Abhängigkeiten können bei einem Upgrade ihr Verhalten ändern.","sources":["https://learning.sap.com/courses/implementing-sap-s-4hana-cloud-private-edition/analyzing-customizations-after-system-conversion_b9083e6d-e207-4578-8aa6-6c85cb42974a"],"revision":"2026-11-08-abap-senior-v1"}],"sourceKeys":["migration"],"order":["body","code","body2"],"sources":[{"title":"SAP-Originalquelle: migration","url":"https://learning.sap.com/courses/implementing-sap-s-4hana-cloud-private-edition/analyzing-customizations-after-system-conversion_b9083e6d-e207-4578-8aa6-6c85cb42974a","access":"Öffentliche Fachreferenz; praktische Ausführung benötigt passendes SAP-System, Release, Zugang und Berechtigungen. Kein kostenloser Systemzugang zugesagt."}],"researchedAt":"2026-11-08","seniorRevision":"2026-11-08-abap-senior-v1","exercises":[{"level":"Normalfall","task":"Genutzten Z-Report mit einem releasebezogenen ATC-Fund anpassen und Belegzahlen/Beträge gegen Referenz prüfen.","acceptance":"Soll-Ergebnis aus dem Fall begründen; bei Systemzugang tatsächliches Ergebnis und Release protokollieren. Ohne Systemzugang nur Entwurfsnachweis, kein ausgeführter SAP-Test."},{"level":"Grenzfall","task":"Report nur am Jahresende genutzt: Eigentümer bestätigt Bedarf trotz leerem Wochenmessfenster.","acceptance":"Soll-Ergebnis aus dem Fall begründen; bei Systemzugang tatsächliches Ergebnis und Release protokollieren. Ohne Systemzugang nur Entwurfsnachweis, kein ausgeführter SAP-Test."},{"level":"Fehlerfall","task":"Wrapper ruft nicht freigegebene API auf: keine falsche Cloud-Freigabe; Ausnahme und zulässige Alternative dokumentieren.","acceptance":"Soll-Ergebnis aus dem Fall begründen; bei Systemzugang tatsächliches Ergebnis und Release protokollieren. Ohne Systemzugang nur Entwurfsnachweis, kein ausgeführter SAP-Test."}]},{"id":"abap-m19-senior-restartable-jobs","moduleId":"abap-m19","title":"Application Jobs betreiben: Wiederanlauf, Idempotenz und Application Log","minutes":30,"prerequisites":"ABAP-Transaktionen, Hintergrundverarbeitung und Fehlerkategorien; freigegebene Job-/Log-APIs des Zielsystems prüfen.","objectives":["Jobstatus und fachliches Ergebnis getrennt prüfen.","Persistierten Wiederanlaufpunkt mit atomarer Fachwirkung planen.","Diagnosefähige, datensparsame Logs und einen sicheren Replay-Prozess entwerfen."],"paragraphs":["Ein Job verarbeitet 1000 Belege und bricht nach 400 ab. „Noch einmal starten“ ist nur sicher, wenn der Vertrag festlegt, welche Belege bereits wirksam verarbeitet wurden. Ein Job kann technisch beendet sein und fachlich abgewiesene Datensätze enthalten. Umgekehrt kann nach einem Timeout eine externe Buchung bereits erfolgreich sein. Statusfarbe und End-to-End-Fachwirkung sind verschiedene Größen.","Arbeite mit begrenzten Paketen und einem stabilen fachlichen Schlüssel oder einer Versionsmarke. Für rein lokale Verarbeitung müssen Wirkung und Verarbeitungsmarker in derselben geeigneten Transaktion gesichert werden. Ein Marker vor der Wirkung riskiert Verlust, ein ungekoppelter Marker danach Duplikate. Ein Neustart muss bereits verarbeitete Belege erkennen, konkurrierende Läufe dürfen dieselbe Wirkung nicht doppelt ausführen.","Für externe Seiteneffekte brauchst du einen Idempotenzvertrag oder belastbaren Abgleich mit dem Ziel. Ein lokales ROLLBACK nimmt eine fremde Buchung nicht zurück. Transiente Fehler können begrenzt mit Backoff wiederholt werden; fachlich ungültige Belege brauchen Korrektur statt Endlos-Retry. Eine Wiederaufnahme „nach Fehlerstep“ darf keine noch notwendigen fachlichen Voraussetzungen überspringen.","Application Log und Jobmonitoring sollen Lauf-ID, Paket/Objektbezug, Fehlerkategorie, Bearbeitungszahlen und erlaubte nächste Aktion zeigen. Keine kompletten Geschäftspayloads, Tokens oder Passwörter protokollieren; auch Log-Leserechte sind zu begrenzen. Die SAP-Samplequelle zeigt konkrete ältere Interfaces und Scheduling-APIs, deren Unterstützung und zulässige RAP-Phase im Zielrelease geprüft werden müssen. Sie ist kein Beweis, dass jeder gezeigte API-Aufruf in jeder RAP-Phase sicher ist."],"codeLang":"text","cases":["Zwei lokale Pakete verarbeiten; Zähler und gesicherte Belegzustände stimmen überein.","Letztes Paket enthält nur einen Beleg; weder Auslassung noch doppelte Verarbeitung durch Pagination.","Crash nach Zielbuchung vor lokaler Quittierung: Abgleich/Idempotenz verhindert zweite Buchung, unsicherer Zustand wird sichtbar."],"quiz":[{"q":"Ein Job-Log meldet „Finished“, enthält aber 12 fachlich abgewiesene Belege. Wie meldest du das Ergebnis?","options":["Vollständig fachlich erfolgreich, weil der Scheduler grün ist.","Unbekannt, da Logs grundsätzlich keinen Ergebnisbezug haben.","Technisch beendet, mit separat ausgewiesenen fachlichen Ablehnungen."],"correct":2,"rationales":["Technischer Abschluss löscht keine im Log enthaltenen fachlichen Fehler.","Das bereinigte Log und die gesicherten Zustände liefern durchaus relevante Evidenz.","Betriebsstatus und Fachresultat müssen getrennt nachvollziehbar sein."],"explain":"Nicht passend: Technischer Abschluss löscht keine im Log enthaltenen fachlichen Fehler. Nicht passend: Das bereinigte Log und die gesicherten Zustände liefern durchaus relevante Evidenz. Richtig: Betriebsstatus und Fachresultat müssen getrennt nachvollziehbar sein.","sources":["https://learning.sap.com/courses/administrating-sap-s-4hana-cloud-public-edition/monitoring-application-jobs_f18a1e3b-b367-46f0-828a-99fea42cd3b4"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Ein rein lokaler Paketjob speichert einen Erledigt-Marker vor der eigentlichen Belegänderung und stürzt danach ab. Welche Korrektur schützt den Wiederanlauf?","options":["Marker und Fachwirkung in derselben geeigneten Transaktion sichern.","Die Marker früher schreiben und nur den Scheduler häufiger starten.","Alle Protokolle entfernen und jeden Beleg immer erneut buchen."],"correct":0,"rationales":["Der Neustart darf eine nicht ausgeführte Wirkung nicht irrtümlich als erledigt überspringen.","Das vergrößert das Verlustfenster statt es atomar zu schließen.","Ohne Deduplizierung drohen doppelte Wirkungen und fehlende Diagnose."],"explain":"Richtig: Der Neustart darf eine nicht ausgeführte Wirkung nicht irrtümlich als erledigt überspringen. Nicht passend: Das vergrößert das Verlustfenster statt es atomar zu schließen. Nicht passend: Ohne Deduplizierung drohen doppelte Wirkungen und fehlende Diagnose.","sources":["https://github.com/SAP-samples/abap-platform-application-jobs"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Ein externer Buchungsaufruf endet im Timeout; das Ziel könnte bereits gebucht haben. Was ist vor einem blinden Retry nötig?","options":["Ein lokales ROLLBACK, das auch die fremde Buchung sicher entfernt.","Idempotenzschlüssel oder verbindlicher Statusabgleich beim Ziel.","Ein neues zufälliges Belegkennzeichen für jede Wiederholung."],"correct":1,"rationales":["Die lokale Transaktion kontrolliert keine bereits wirksame Buchung des fremden Systems.","Der unsichere Ausgang muss so geklärt werden, dass keine doppelte Fachwirkung entsteht.","Ein neuer Schlüssel kann die Deduplizierung umgehen und eine zweite Buchung ermöglichen."],"explain":"Nicht passend: Die lokale Transaktion kontrolliert keine bereits wirksame Buchung des fremden Systems. Richtig: Der unsichere Ausgang muss so geklärt werden, dass keine doppelte Fachwirkung entsteht. Nicht passend: Ein neuer Schlüssel kann die Deduplizierung umgehen und eine zweite Buchung ermöglichen.","sources":["https://github.com/SAP-samples/abap-platform-application-jobs"],"revision":"2026-11-08-abap-senior-v1"}],"sourceKeys":["jobs","monitoring"],"order":["body","code","body2"],"sources":[{"title":"SAP-Originalquelle: jobs","url":"https://github.com/SAP-samples/abap-platform-application-jobs","access":"Öffentliche Fachreferenz; praktische Ausführung benötigt passendes SAP-System, Release, Zugang und Berechtigungen. Kein kostenloser Systemzugang zugesagt."},{"title":"SAP-Originalquelle: monitoring","url":"https://learning.sap.com/courses/administrating-sap-s-4hana-cloud-public-edition/monitoring-application-jobs_f18a1e3b-b367-46f0-828a-99fea42cd3b4","access":"Öffentliche Fachreferenz; praktische Ausführung benötigt passendes SAP-System, Release, Zugang und Berechtigungen. Kein kostenloser Systemzugang zugesagt."}],"researchedAt":"2026-11-08","seniorRevision":"2026-11-08-abap-senior-v1","exercises":[{"level":"Normalfall","task":"Zwei lokale Pakete verarbeiten; Zähler und gesicherte Belegzustände stimmen überein.","acceptance":"Soll-Ergebnis aus dem Fall begründen; bei Systemzugang tatsächliches Ergebnis und Release protokollieren. Ohne Systemzugang nur Entwurfsnachweis, kein ausgeführter SAP-Test."},{"level":"Grenzfall","task":"Letztes Paket enthält nur einen Beleg; weder Auslassung noch doppelte Verarbeitung durch Pagination.","acceptance":"Soll-Ergebnis aus dem Fall begründen; bei Systemzugang tatsächliches Ergebnis und Release protokollieren. Ohne Systemzugang nur Entwurfsnachweis, kein ausgeführter SAP-Test."},{"level":"Fehlerfall","task":"Crash nach Zielbuchung vor lokaler Quittierung: Abgleich/Idempotenz verhindert zweite Buchung, unsicherer Zustand wird sichtbar.","acceptance":"Soll-Ergebnis aus dem Fall begründen; bei Systemzugang tatsächliches Ergebnis und Release protokollieren. Ohne Systemzugang nur Entwurfsnachweis, kein ausgeführter SAP-Test."}]},{"id":"abap-m13-senior-launchpad","moduleId":"abap-m13","title":"Fiori Launchpad: Intents, Kataloge und Fehlersuche nach dem Transport","minutes":25,"prerequisites":"Fiori-App und Service; Schwerpunkt ABAP Launchpad in S/4HANA, Tools in Public Edition/BTP separat prüfen.","objectives":["App-Sichtbarkeit, Navigation und Backendberechtigung auseinanderhalten.","Semantic Object/Action und Target Mapping nachvollziehen.","Transportabhängigkeiten und Upgrade-Nachfolger kontrolliert prüfen."],"paragraphs":["Die App funktioniert in der lokalen Vorschau, nach Transport erscheint jedoch keine Kachel oder „Navigation target could not be resolved“. Vorschau und produktiver Launchpad-Einstieg sind unterschiedliche Wege. Das Launchpad löst einen Intent aus Semantic Object und Action mit passenden Parametern zu einem Navigationsziel auf. Eine vorhandene UI5-Anwendung allein liefert noch kein korrekt zugeordnetes Target Mapping.","Business-Kataloge stellen rollenbezogenen App-/Navigationsinhalt bereit. Spaces und Pages organisieren die Oberfläche. Diese Struktur ist nicht identisch mit der fachlichen Backendautorisierung. Eine sichtbare Kachel kann an fehlenden Service- oder Datenrechten scheitern; eine ausgeblendete Kachel verhindert keinen direkten API-Aufruf. Der konkrete Rollen- und Content-Lifecycle hängt von Edition und Launchpad-Variante ab.","Vergleiche nach einem Transport mit einem echten Fachbenutzer: Intent/Parameter, Katalog-/Rollenzuordnung, Page, Target Mapping, App-ID/Version, Zielsystemalias und Service. Prüfe UI-Deployment, OData-Service sowie erforderliche Konfiguration als getrennte Abhängigkeiten. Ein Entwickler mit breiten Rechten ist kein repräsentativer Abnahmetest. Cacheinvalidierung erst nach Befund einsetzen, nicht als Universalantwort.","Nach Upgrades können Referenzen gebrochen oder Apps deprecated/obsolete sein. Im unterstützten ABAP Launchpad hilft der Content Manager, Referenzen und Nachfolger zu analysieren. Änderungen in verschiedenen Konfigurations-/Customizing-Scopes können sich entkoppeln. Übernimm Nachfolger samt Page, Services und Rollen kontrolliert; vorhandene kundeneigene Anpassungen nicht unbesehen durch einen Reset überschreiben."],"codeLang":"text","cases":["Fachbenutzer startet den freigegebenen Intent und landet auf dem richtigen Objekt im richtigen Zielsystem.","Zwei Mappings mit unterschiedlichen Pflichtparametern: reproduzierbare, passende Zielauflösung nachweisen.","Nach Transport fehlt eine Mappingreferenz: Konfiguration lokalisieren, ohne pauschale Adminrechte zu vergeben."],"quiz":[{"q":"Eine UI5-App läuft in der Vorschau, ihr Launchpad-Intent wird nach Transport nicht aufgelöst. Wo setzt die erste Diagnose an?","options":["Bei der Ersetzung aller ABAP-SELECTs durch neue CDS-Views.","Bei Intent, Parametern, Target Mapping und zugeordnetem Inhalt.","Bei der Entfernung aller Backend-Berechtigungsprüfungen."],"correct":1,"rationales":["Der Fehler liegt bereits vor dem fachlichen Datenzugriff in der Zielauflösung.","Die Vorschau beweist die produktive Intentauflösung und Rollenverteilung nicht.","Fehlendes Target Mapping wird dadurch nicht angelegt; zusätzlich entsteht eine Sicherheitslücke."],"explain":"Nicht passend: Der Fehler liegt bereits vor dem fachlichen Datenzugriff in der Zielauflösung. Richtig: Die Vorschau beweist die produktive Intentauflösung und Rollenverteilung nicht. Nicht passend: Fehlendes Target Mapping wird dadurch nicht angelegt; zusätzlich entsteht eine Sicherheitslücke.","sources":["https://learning.sap.com/courses/exploring-the-authorization-concept-for-sap-fiori-on-sap-s-4hana/checking-and-adjusting-launchpad-content"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Eine Kachel ist sichtbar, der Service verweigert einen fremden Beleg. Welche Schlussfolgerung passt?","options":["Kachel und Fachrechte sind verschiedene Grenzen; Ablehnung kann korrekt sein.","Sichtbarkeit garantiert Vollzugriff auf alle Daten dieser Anwendung.","Der Benutzer muss vorsorglich ein dauerhaftes Adminprofil bekommen."],"correct":0,"rationales":["Sichtbarkeit einer Anwendung verleiht kein Recht auf jeden Datensatz.","Katalog-/Oberflächeninhalt ist kein universeller Datensatzberechtigungsnachweis.","Breite Zusatzrechte umgehen den Fachvertrag und sind keine Fehlerdiagnose."],"explain":"Richtig: Sichtbarkeit einer Anwendung verleiht kein Recht auf jeden Datensatz. Nicht passend: Katalog-/Oberflächeninhalt ist kein universeller Datensatzberechtigungsnachweis. Nicht passend: Breite Zusatzrechte umgehen den Fachvertrag und sind keine Fehlerdiagnose.","sources":["https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Nach einem Upgrade meldet der Content Manager eine veraltete App und einen Nachfolger. Was gehört zur Umstellung?","options":["Nur die Kachel beschriften; der technische Verweis kann unverändert bleiben.","Alle Kundenscopes ohne Prüfung auf SAP-Standard zurücksetzen.","Mapping, Page, Services und Rollen des Nachfolgers gemeinsam prüfen."],"correct":2,"rationales":["Ein neuer Text migriert weder Navigation noch Serviceabhängigkeiten.","Das kann berechtigte kundeneigene Anpassungen verwerfen.","Der neue Einstieg muss mit seinen technischen und fachlichen Abhängigkeiten konsistent sein."],"explain":"Nicht passend: Ein neuer Text migriert weder Navigation noch Serviceabhängigkeiten. Nicht passend: Das kann berechtigte kundeneigene Anpassungen verwerfen. Richtig: Der neue Einstieg muss mit seinen technischen und fachlichen Abhängigkeiten konsistent sein.","sources":["https://learning.sap.com/courses/exploring-the-authorization-concept-for-sap-fiori-on-sap-s-4hana/checking-and-adjusting-launchpad-content"],"revision":"2026-11-08-abap-senior-v1"}],"sourceKeys":["launchpad","auth"],"order":["body","code","body2"],"sources":[{"title":"SAP-Originalquelle: launchpad","url":"https://learning.sap.com/courses/exploring-the-authorization-concept-for-sap-fiori-on-sap-s-4hana/checking-and-adjusting-launchpad-content","access":"Öffentliche Fachreferenz; praktische Ausführung benötigt passendes SAP-System, Release, Zugang und Berechtigungen. Kein kostenloser Systemzugang zugesagt."},{"title":"SAP-Originalquelle: auth","url":"https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks","access":"Öffentliche Fachreferenz; praktische Ausführung benötigt passendes SAP-System, Release, Zugang und Berechtigungen. Kein kostenloser Systemzugang zugesagt."}],"researchedAt":"2026-11-08","seniorRevision":"2026-11-08-abap-senior-v1","exercises":[{"level":"Normalfall","task":"Fachbenutzer startet den freigegebenen Intent und landet auf dem richtigen Objekt im richtigen Zielsystem.","acceptance":"Soll-Ergebnis aus dem Fall begründen; bei Systemzugang tatsächliches Ergebnis und Release protokollieren. Ohne Systemzugang nur Entwurfsnachweis, kein ausgeführter SAP-Test."},{"level":"Grenzfall","task":"Zwei Mappings mit unterschiedlichen Pflichtparametern: reproduzierbare, passende Zielauflösung nachweisen.","acceptance":"Soll-Ergebnis aus dem Fall begründen; bei Systemzugang tatsächliches Ergebnis und Release protokollieren. Ohne Systemzugang nur Entwurfsnachweis, kein ausgeführter SAP-Test."},{"level":"Fehlerfall","task":"Nach Transport fehlt eine Mappingreferenz: Konfiguration lokalisieren, ohne pauschale Adminrechte zu vergeben.","acceptance":"Soll-Ergebnis aus dem Fall begründen; bei Systemzugang tatsächliches Ergebnis und Release protokollieren. Ohne Systemzugang nur Entwurfsnachweis, kein ausgeführter SAP-Test."}]},{"id":"abap-m11-senior-semantics","moduleId":"abap-m11","title":"CDS-Fachsemantik: Währungen, Einheiten und belastbare Summen","minutes":25,"prerequisites":"CDS View Entities, Aggregationen und DDIC-Typen; Zielfunktionen für Umrechnung sind releaseabhängig.","objectives":["Beträge und Mengen zusammen mit ihrer Referenz modellieren.","Annotation und tatsächliche Umrechnung unterscheiden.","Aggregation und Rundung mit Gegenbeispielen testen."],"paragraphs":["Eine Zahl 100 ist ohne Einheit oder Währung fachlich unvollständig. Ein Betrag braucht seine Währungsreferenz, eine Menge ihre Maßeinheit. Für entsprechend typisierte Elemente in CDS View Entities werden diese Referenzen durch Semantics-Annotationen verbunden. Wähle die tatsächlichen projizierten Feldnamen; ein umbenanntes CurrencyCode muss auch in der Referenz korrekt erscheinen.","Die Annotation amount.currencyCode erklärt, zu welchem Währungsfeld der Betrag gehört. Sie rechnet 100 USD nicht in 100 EUR um. Mengen von 10 KG und 5 ST dürfen nicht blind als 15 summiert werden. Entweder nach kompatibler Einheit/Währung gruppieren oder eine definierte Umrechnung mit fachlich passender Dimension und Referenz vornehmen.","Bei Währungsumrechnung sind Zielwährung, Kursdatum, Kurstyp, verfügbare Kurse und Fehlerbehandlung Teil des Vertrags. Datenbanktyp, Währungsdezimalstellen, Berechnungspräzision und Anzeigeformat sind unterschiedliche Ebenen. Vermeide binäre Gleitkommaarithmetik als pauschale Geldstrategie; auch DECIMAL allein entscheidet nicht, wann fachlich gerundet wird. Fehlende Kurse nicht still als 1 behandeln.","Prüfe Zeilengranularität vor der Aggregation: ein Join auf mehrere Texte oder Positionen kann denselben Betrag vervielfachen. DISTINCT ist keine allgemeine Reparatur, weil zwei fachlich verschiedene Positionen denselben Wert haben können. Vergleiche Schlüssel, Anzahl und Summen vor und nach der Erweiterung. Technisch schnelle falsche Summen bleiben fachlich falsch."],"codeLang":"cds","cases":["Zwei EUR-Positionen derselben Granularität ergeben die erwartete EUR-Summe mit korrekter Referenz.","EUR und USD bleiben getrennt oder werden mit festgelegtem Datum/Kurstyp nachvollziehbar konvertiert.","Fehlender Kurs oder vervielfachender Textjoin: kontrollierter Fehler beziehungsweise korrigierte Ergebnismenge statt erfundener Summe."],"quiz":[{"q":"Eine View annotiert NetAmount mit CurrencyCode. Eine Zeile enthält USD, die andere EUR. Was bewirkt die Annotation allein?","options":["Sie rechnet alle Beträge automatisch in die Anmeldesprache um.","Sie ersetzt die Werte implizit durch Beträge in der Hauswährung.","Sie verknüpft Betrag und Währungsreferenz, ohne Werte umzurechnen."],"correct":2,"rationales":["Sprache ist keine Zielwährung und die Annotation führt keine Kursumrechnung aus.","Eine semantische Referenz bestimmt weder Kurs noch Umrechnungsdatum.","Für eine gemeinsame Summe ist zusätzlich ein fachlich definierter Umrechnungs- oder Gruppierungsvertrag nötig."],"explain":"Nicht passend: Sprache ist keine Zielwährung und die Annotation führt keine Kursumrechnung aus. Nicht passend: Eine semantische Referenz bestimmt weder Kurs noch Umrechnungsdatum. Richtig: Für eine gemeinsame Summe ist zusätzlich ein fachlich definierter Umrechnungs- oder Gruppierungsvertrag nötig.","sources":["https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/using-abap-annotations-in-cds-views_fcda7ade-1bb7-4c79-8b1f-0f20c7f45a70"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Nach einem Join auf zwei sprachabhängige Texte verdoppelt sich die Belegsumme. Was prüfst du zuerst?","options":["Die Join-Kardinalität und Zeilengranularität vor der Aggregation.","Ob die Betragsanzeige von zwei auf null Nachkommastellen wechselt.","Ob man DISTINCT nur auf dem Betrag als universellen Fix setzen kann."],"correct":0,"rationales":["Mehrere Texttreffer können die gleichen fachlichen Beträge mehrfach in die Summe aufnehmen.","Darstellungspräzision erklärt nicht die systematische Verdopplung der Zeilen.","Gleiche Beträge können zu verschiedenen echten Positionen gehören; DISTINCT kann dann Daten verlieren."],"explain":"Richtig: Mehrere Texttreffer können die gleichen fachlichen Beträge mehrfach in die Summe aufnehmen. Nicht passend: Darstellungspräzision erklärt nicht die systematische Verdopplung der Zeilen. Nicht passend: Gleiche Beträge können zu verschiedenen echten Positionen gehören; DISTINCT kann dann Daten verlieren.","sources":["https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/using-abap-annotations-in-cds-views_fcda7ade-1bb7-4c79-8b1f-0f20c7f45a70"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Für eine EUR-Umrechnung fehlt am geforderten Kursdatum der USD-Kurs. Welche Behandlung ist fachlich belastbar?","options":["Den fehlenden Kurs still durch 1 ersetzen und die Summe freigeben.","Den fehlenden Kurs nach festgelegtem Fehlervertrag sichtbar behandeln.","Die Währungsannotation entfernen und die Beträge als Stückzahlen summieren."],"correct":1,"rationales":["Das erzeugt ohne fachliche Grundlage einen falschen Gegenwert.","Fallback, Ablehnung oder Nachpflege müssen ausdrücklich vereinbart sein; keine erfundene Umrechnung.","Die Semantik zu entfernen löst den fehlenden Kurs nicht."],"explain":"Nicht passend: Das erzeugt ohne fachliche Grundlage einen falschen Gegenwert. Richtig: Fallback, Ablehnung oder Nachpflege müssen ausdrücklich vereinbart sein; keine erfundene Umrechnung. Nicht passend: Die Semantik zu entfernen löst den fehlenden Kurs nicht.","sources":["https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/using-abap-annotations-in-cds-views_fcda7ade-1bb7-4c79-8b1f-0f20c7f45a70"],"revision":"2026-11-08-abap-senior-v1"}],"sourceKeys":["semantics"],"order":["body","code","body2"],"sources":[{"title":"SAP-Originalquelle: semantics","url":"https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/using-abap-annotations-in-cds-views_fcda7ade-1bb7-4c79-8b1f-0f20c7f45a70","access":"Öffentliche Fachreferenz; praktische Ausführung benötigt passendes SAP-System, Release, Zugang und Berechtigungen. Kein kostenloser Systemzugang zugesagt."}],"researchedAt":"2026-11-08","seniorRevision":"2026-11-08-abap-senior-v1","exercises":[{"level":"Normalfall","task":"Zwei EUR-Positionen derselben Granularität ergeben die erwartete EUR-Summe mit korrekter Referenz.","acceptance":"Soll-Ergebnis aus dem Fall begründen; bei Systemzugang tatsächliches Ergebnis und Release protokollieren. Ohne Systemzugang nur Entwurfsnachweis, kein ausgeführter SAP-Test."},{"level":"Grenzfall","task":"EUR und USD bleiben getrennt oder werden mit festgelegtem Datum/Kurstyp nachvollziehbar konvertiert.","acceptance":"Soll-Ergebnis aus dem Fall begründen; bei Systemzugang tatsächliches Ergebnis und Release protokollieren. Ohne Systemzugang nur Entwurfsnachweis, kein ausgeführter SAP-Test."},{"level":"Fehlerfall","task":"Fehlender Kurs oder vervielfachender Textjoin: kontrollierter Fehler beziehungsweise korrigierte Ergebnismenge statt erfundener Summe.","acceptance":"Soll-Ergebnis aus dem Fall begründen; bei Systemzugang tatsächliches Ergebnis und Release protokollieren. Ohne Systemzugang nur Entwurfsnachweis, kein ausgeführter SAP-Test."}]}];
var TOTAL_MIN = 0;
var FLAT = [];
MODULES.forEach(function(m){
  m.lessons.forEach(function(l){ FLAT.push(l); TOTAL_MIN += l.minutes; });
});
var TOTAL = FLAT.length;
var TRACES = [
{
  id:'tr1', level:1, title:'Zählen mit Bedingung', input:'werte = [4, 9, 2, 11, 6]',
  intro:'Der Einstieg: ein Zähler mit Filterbedingung. Achte darauf, wann sich <code>anzahl</code> ändert — und wann der Rumpf übersprungen wird.',
  code:[
    'FUNKTION zaehleGrosse(werte, grenze)',
    '  anzahl <- 0',
    '  FUER i VON 0 BIS LAENGE(werte)-1 TUE',
    '    WENN werte[i] > grenze DANN',
    '      anzahl <- anzahl + 1',
    '    ENDEWENN',
    '  ENDEFUER',
    '  GIB anzahl ZURUECK',
    'ENDEFUNKTION'
  ],
  vars:['i','werte[i]','anzahl'],
  steps:[
    {line:1, values:{i:'—', 'werte[i]':'—', anzahl:'0'}, note:'Zähler initialisieren. grenze = 5.'},
    {line:2, values:{i:'0', 'werte[i]':'4', anzahl:'0'}, note:'1. Durchlauf: Index 0, Wert 4.'},
    {line:3, values:{i:'0', 'werte[i]':'4', anzahl:'0'}, note:'4 > 5 ist falsch → Rumpf übersprungen.'},
    {line:2, values:{i:'1', 'werte[i]':'9', anzahl:'0'}, note:'2. Durchlauf: Index 1, Wert 9.'},
    {line:3, values:{i:'1', 'werte[i]':'9', anzahl:'0'}, note:'9 > 5 ist wahr.'},
    {line:4, values:{i:'1', 'werte[i]':'9', anzahl:'1'}, ask:'anzahl', note:'anzahl wird um 1 erhöht.'},
    {line:2, values:{i:'2', 'werte[i]':'2', anzahl:'1'}, note:'3. Durchlauf: Wert 2.'},
    {line:3, values:{i:'2', 'werte[i]':'2', anzahl:'1'}, note:'2 > 5 ist falsch.'},
    {line:2, values:{i:'3', 'werte[i]':'11', anzahl:'1'}, note:'4. Durchlauf: Wert 11.'},
    {line:4, values:{i:'3', 'werte[i]':'11', anzahl:'2'}, ask:'anzahl', note:'11 > 5 → anzahl = 2.'},
    {line:2, values:{i:'4', 'werte[i]':'6', anzahl:'2'}, note:'5. Durchlauf: Wert 6.'},
    {line:4, values:{i:'4', 'werte[i]':'6', anzahl:'3'}, ask:'anzahl', note:'6 > 5 → anzahl = 3.'},
    {line:7, values:{i:'5', 'werte[i]':'—', anzahl:'3'}, note:'i erreicht 5, die Bedingung ist verletzt → Rückgabe.'}
  ],
  result:'3',
  lesson:'Zähle nicht die Schleifendurchläufe, sondern die tatsächlichen Erhöhungen: Fünf Durchläufe, aber nur drei Treffer. Die Prüfung fragt gern „Wie oft wird Zeile 5 ausgeführt?" — die Antwort ist hier 3, nicht 5. Beachte auch die Obergrenze LAENGE − 1: Bei fünf Elementen läuft i von 0 bis 4.'
},
{
  id:'tr2', level:1, title:'MOD und DIV auseinanderhalten', input:'zahl = 4711',
  intro:'Quersumme über MOD und DIV. Diese beiden Operatoren werden in der AP1 regelmäßig verwechselt — hier siehst du beide im Wechselspiel.',
  code:[
    'FUNKTION quersumme(zahl)',
    '  summe <- 0',
    '  SOLANGE zahl > 0 TUE',
    '    ziffer <- zahl MOD 10',
    '    summe  <- summe + ziffer',
    '    zahl   <- zahl DIV 10',
    '  ENDESOLANGE',
    '  GIB summe ZURUECK',
    'ENDEFUNKTION'
  ],
  vars:['zahl','ziffer','summe'],
  steps:[
    {line:1, values:{zahl:'4711', ziffer:'—', summe:'0'}, note:'Start: summe auf 0.'},
    {line:3, values:{zahl:'4711', ziffer:'1', summe:'0'}, ask:'ziffer', note:'4711 MOD 10 = 1 — MOD liefert die letzte Ziffer.'},
    {line:4, values:{zahl:'4711', ziffer:'1', summe:'1'}, note:'summe = 0 + 1.'},
    {line:5, values:{zahl:'471', ziffer:'1', summe:'1'}, ask:'zahl', note:'4711 DIV 10 = 471 — DIV schneidet die letzte Ziffer ab.'},
    {line:3, values:{zahl:'471', ziffer:'1', summe:'1'}, note:'471 MOD 10 = 1.'},
    {line:4, values:{zahl:'471', ziffer:'1', summe:'2'}, note:'summe = 1 + 1 = 2.'},
    {line:5, values:{zahl:'47', ziffer:'1', summe:'2'}, note:'471 DIV 10 = 47.'},
    {line:3, values:{zahl:'47', ziffer:'7', summe:'2'}, note:'47 MOD 10 = 7.'},
    {line:4, values:{zahl:'47', ziffer:'7', summe:'9'}, ask:'summe', note:'summe = 2 + 7 = 9.'},
    {line:5, values:{zahl:'4', ziffer:'7', summe:'9'}, note:'47 DIV 10 = 4.'},
    {line:3, values:{zahl:'4', ziffer:'4', summe:'9'}, note:'4 MOD 10 = 4.'},
    {line:4, values:{zahl:'4', ziffer:'4', summe:'13'}, note:'summe = 9 + 4 = 13.'},
    {line:5, values:{zahl:'0', ziffer:'4', summe:'13'}, note:'4 DIV 10 = 0 — Abbruchbedingung erreicht.'},
    {line:7, values:{zahl:'0', ziffer:'4', summe:'13'}, note:'zahl > 0 ist falsch → Schleife endet.'}
  ],
  result:'13',
  lesson:'Merke dir das Paar: MOD 10 holt die letzte Ziffer heraus, DIV 10 entfernt sie. Zusammen zerlegen sie jede Zahl von hinten. Der Abbruch erfolgt automatisch, weil DIV irgendwann 0 liefert — vergisst man Zeile 5, entsteht eine Endlosschleife. Das ist eine der häufigsten Fangfragen zu Schleifen.'
},
{
  id:'tr3', level:2, title:'Die UND-Falle bei der Berechtigungsprüfung', input:'id = 3, raumNr = 236',
  intro:'Dieses Muster stammt aus einer echten AP1-Aufgabe. Der Kern ist die UND-Verknüpfung: Beide Teilbedingungen müssen wahr sein — ein Treffer in nur einer Spalte genügt nicht.',
  code:[
    'FUNKTION pruefeBerechtigung(id, raumNr)',
    '  FUER i VON 0 BIS zeilen-1 TUE',
    '    WENN tabelle[i][0] = id UND tabelle[i][1] = raumNr DANN',
    '      GIB WAHR ZURUECK',
    '    ENDEWENN',
    '  ENDEFUER',
    '  GIB FALSCH ZURUECK',
    'ENDEFUNKTION'
  ],
  vars:['i','tabelle[i][0]','tabelle[i][1]','Treffer'],
  steps:[
    {line:1, values:{i:'0', 'tabelle[i][0]':'1', 'tabelle[i][1]':'236', Treffer:'—'}, note:'Tabelle: (1,236) (3,101) (3,236) (5,236). Gesucht: id=3, raum=236.'},
    {line:2, values:{i:'0', 'tabelle[i][0]':'1', 'tabelle[i][1]':'236', Treffer:'nein'}, ask:'Treffer', note:'Raum stimmt, aber id 1 ≠ 3 → UND ist falsch.'},
    {line:1, values:{i:'1', 'tabelle[i][0]':'3', 'tabelle[i][1]':'101', Treffer:'nein'}, note:'2. Zeile.'},
    {line:2, values:{i:'1', 'tabelle[i][0]':'3', 'tabelle[i][1]':'101', Treffer:'nein'}, ask:'Treffer', note:'id stimmt, aber Raum 101 ≠ 236 → UND ist wieder falsch.'},
    {line:1, values:{i:'2', 'tabelle[i][0]':'3', 'tabelle[i][1]':'236', Treffer:'—'}, note:'3. Zeile.'},
    {line:2, values:{i:'2', 'tabelle[i][0]':'3', 'tabelle[i][1]':'236', Treffer:'ja'}, ask:'Treffer', note:'Beide Teilbedingungen wahr → UND ist wahr.'},
    {line:3, values:{i:'2', 'tabelle[i][0]':'3', 'tabelle[i][1]':'236', Treffer:'ja'}, note:'GIB WAHR ZURUECK — die Funktion endet sofort.'}
  ],
  result:'WAHR (nach 3 von 4 Zeilen)',
  lesson:'Zwei Erkenntnisse für die Prüfung. Erstens: Bei UND reicht ein falscher Teil, um die ganze Bedingung falsch zu machen — Zeile 0 und 1 sehen wie Treffer aus, sind aber keine. Zweitens: Das RETURN in der Schleife beendet die Funktion sofort, die vierte Zeile wird gar nicht mehr geprüft. Auf die Frage „Wie viele Zeilen werden durchlaufen?" lautet die Antwort 3, nicht 4.'
},
{
  id:'tr4', level:2, title:'Binäre Suche Schritt für Schritt', input:'feld = [2,5,8,12,16,23,38,56,72,91], gesucht = 23',
  intro:'Die binäre Suche halbiert den Bereich in jedem Schritt. Verfolge <code>links</code>, <code>rechts</code> und <code>mitte</code> — und zähle mit, wie wenige Schritte nötig sind.',
  code:[
    'FUNKTION binaereSuche(feld, gesucht)',
    '  links  <- 0',
    '  rechts <- LAENGE(feld) - 1',
    '  SOLANGE links <= rechts TUE',
    '    mitte <- (links + rechts) DIV 2',
    '    WENN feld[mitte] = gesucht DANN GIB mitte ZURUECK',
    '    WENN feld[mitte] < gesucht DANN links <- mitte + 1',
    '    SONST rechts <- mitte - 1',
    '  ENDESOLANGE',
    '  GIB -1 ZURUECK',
    'ENDEFUNKTION'
  ],
  vars:['links','rechts','mitte','feld[mitte]'],
  steps:[
    {line:1, values:{links:'0', rechts:'9', mitte:'—', 'feld[mitte]':'—'}, note:'10 Elemente → Indizes 0 bis 9.'},
    {line:4, values:{links:'0', rechts:'9', mitte:'4', 'feld[mitte]':'16'}, ask:'mitte', note:'(0+9) DIV 2 = 4 — ganzzahlige Division rundet ab.'},
    {line:5, values:{links:'0', rechts:'9', mitte:'4', 'feld[mitte]':'16'}, note:'16 ≠ 23, kein Treffer.'},
    {line:6, values:{links:'5', rechts:'9', mitte:'4', 'feld[mitte]':'16'}, ask:'links', note:'16 < 23 → rechte Hälfte, links = mitte + 1 = 5.'},
    {line:4, values:{links:'5', rechts:'9', mitte:'7', 'feld[mitte]':'56'}, ask:'mitte', note:'(5+9) DIV 2 = 7.'},
    {line:7, values:{links:'5', rechts:'6', mitte:'7', 'feld[mitte]':'56'}, ask:'rechts', note:'56 > 23 → linke Hälfte, rechts = mitte − 1 = 6.'},
    {line:4, values:{links:'5', rechts:'6', mitte:'5', 'feld[mitte]':'23'}, note:'(5+6) DIV 2 = 5 (abgerundet).'},
    {line:5, values:{links:'5', rechts:'6', mitte:'5', 'feld[mitte]':'23'}, ask:'feld[mitte]', note:'Treffer! feld[5] = 23 → Rückgabe des Index 5.'}
  ],
  result:'5 (Index), gefunden in 3 Schritten',
  lesson:'Drei Schritte für zehn Elemente — die lineare Suche hätte sechs Vergleiche gebraucht. Die Obergrenze ist log₂(10), aufgerundet 4. Zwei Punkte zum Merken: Die ganzzahlige Division rundet immer ab, und die Voraussetzung ist ein sortiertes Feld. Auf einem unsortierten Array liefert das Verfahren falsche Ergebnisse, ohne einen Fehler zu melden.'
},
{
  id:'tr5', level:2, title:'Netzplan-Vorwärtsrechnung', input:'A(4) → B(6), C(3); B → D(5); C → E(2); D,E → F(4)',
  intro:'Auch ein Netzplan lässt sich als Trockenlauf verfolgen. Die entscheidende Stelle ist der Vorgang mit zwei Vorgängern — dort gilt das Maximum.',
  code:[
    'FUER jeden Vorgang in topologischer Reihenfolge TUE',
    '  WENN keine Vorgaenger DANN FAZ <- 0',
    '  SONST FAZ <- MAX(FEZ aller Vorgaenger)',
    '  FEZ <- FAZ + D',
    'ENDEFUER',
    'Projektdauer <- FEZ des letzten Vorgangs'
  ],
  vars:['Vorgang','FAZ','D','FEZ'],
  steps:[
    {line:1, values:{Vorgang:'A', FAZ:'0', D:'4', FEZ:'4'}, note:'A hat keine Vorgänger → FAZ = 0, FEZ = 0 + 4.'},
    {line:2, values:{Vorgang:'B', FAZ:'4', D:'6', FEZ:'10'}, ask:'FEZ', note:'Vorgänger A mit FEZ 4 → FAZ = 4, FEZ = 4 + 6.'},
    {line:2, values:{Vorgang:'C', FAZ:'4', D:'3', FEZ:'7'}, note:'Ebenfalls Vorgänger A → FAZ = 4, FEZ = 7.'},
    {line:2, values:{Vorgang:'D', FAZ:'10', D:'5', FEZ:'15'}, note:'Vorgänger B mit FEZ 10 → FEZ = 15.'},
    {line:2, values:{Vorgang:'E', FAZ:'7', D:'2', FEZ:'9'}, note:'Vorgänger C mit FEZ 7 → FEZ = 9.'},
    {line:2, values:{Vorgang:'F', FAZ:'15', D:'4', FEZ:'19'}, ask:'FAZ', note:'Zwei Vorgänger: D mit 15 und E mit 9 → MAX = 15.'},
    {line:5, values:{Vorgang:'Ende', FAZ:'—', D:'—', FEZ:'19'}, note:'Projektdauer = FEZ des letzten Vorgangs.'}
  ],
  result:'Projektdauer 19 Zeiteinheiten',
  lesson:'Der Vorgang F ist die Stelle, an der die meisten Punkte verloren gehen: Die beiden Vorgänger liefern 15 und 9, und es gilt das Maximum. Wer hier addiert oder das Minimum nimmt, hat den ganzen Netzplan verrechnet. Denk an die Baustelle — wenn zwei Gewerke fertig sein müssen, wartest du auf das langsamere. Der Zweig C–E hat entsprechend Puffer, weil er früher fertig ist als nötig.'
},
{
  id:'tr6', level:3, title:'Rekursive Fakultät und der Aufrufstapel', input:'n = 4',
  intro:'Rekursion baut den Stapel erst auf und rechnet dann beim Zurückspringen. Verfolge zuerst den Abstieg, dann den Aufstieg.',
  code:[
    'FUNKTION fakultaet(n)',
    '  WENN n <= 1 DANN',
    '    GIB 1 ZURUECK',
    '  SONST',
    '    GIB n * fakultaet(n-1) ZURUECK',
    '  ENDEWENN',
    'ENDEFUNKTION'
  ],
  vars:['Ebene','n','Aktion','Rückgabe'],
  steps:[
    {line:0, values:{Ebene:'1', n:'4', Aktion:'Aufruf fakultaet(4)', 'Rückgabe':'offen'}, note:'Abstieg beginnt.'},
    {line:4, values:{Ebene:'1', n:'4', Aktion:'4 > 1 → ruft fakultaet(3)', 'Rückgabe':'offen'}, note:'Ergebnis wird zurückgestellt.'},
    {line:4, values:{Ebene:'2', n:'3', Aktion:'3 > 1 → ruft fakultaet(2)', 'Rückgabe':'offen'}, note:'Zweiter Stapelrahmen.'},
    {line:4, values:{Ebene:'3', n:'2', Aktion:'2 > 1 → ruft fakultaet(1)', 'Rückgabe':'offen'}, note:'Dritter Stapelrahmen.'},
    {line:1, values:{Ebene:'4', n:'1', Aktion:'Abbruchbedingung erreicht', 'Rückgabe':'1'}, ask:'Rückgabe', note:'n ≤ 1 → die Rekursion endet hier.'},
    {line:4, values:{Ebene:'3', n:'2', Aktion:'2 * 1', 'Rückgabe':'2'}, ask:'Rückgabe', note:'Aufstieg: Ebene 3 rechnet nun weiter.'},
    {line:4, values:{Ebene:'2', n:'3', Aktion:'3 * 2', 'Rückgabe':'6'}, ask:'Rückgabe', note:'Ebene 2 setzt das Ergebnis ein.'},
    {line:4, values:{Ebene:'1', n:'4', Aktion:'4 * 6', 'Rückgabe':'24'}, ask:'Rückgabe', note:'Ebene 1 liefert das Endergebnis.'}
  ],
  result:'24',
  lesson:'Der entscheidende Denkfehler bei Rekursion ist die Annahme, es werde beim Abstieg gerechnet. Tatsächlich werden vier Stapelrahmen aufgebaut, und erst die Abbruchbedingung löst die Rechnung aus — von innen nach außen. Zwei typische Prüfungsfragen dazu: Wie viele Aufrufe finden statt? Hier fünf, nämlich fakultaet(4) bis fakultaet(0) ausgenommen, also 4, 3, 2 und 1. Und was passiert ohne Abbruchbedingung? Der Stapel läuft über — Stack Overflow.'
}
,
{
  id:'tr7', level:2, title:'Netzplan-Rückwärtsrechnung und Puffer', input:'Projektende = 19, Vorgänge A(4) B(6) C(3) D(5) E(2) F(4)',
  intro:'Die Vorwärtsrechnung hast du in Durchlauf 5 geübt. Jetzt der Teil, an dem die meisten Punkte verloren gehen: rückwärts mit <strong>MIN</strong> statt MAX, dann die Puffer und der kritische Pfad.',
  code:[
    'Rueckwaerts, vom letzten Vorgang aus:',
    '  letzter Vorgang:  SEZ = FEZ',
    '  SAZ = SEZ - D',
    '  SEZ = MIN(SAZ aller Nachfolger)',
    'Puffer:',
    '  GP  = SAZ - FAZ   (= SEZ - FEZ)',
    '  FP  = MIN(FAZ Nachfolger) - eigener FEZ',
    'Kritischer Pfad: alle Vorgaenge mit GP = 0'
  ],
  vars:['Vorgang','SEZ','D','SAZ','GP'],
  steps:[
    {line:1, values:{Vorgang:'F (letzter)', SEZ:'19', D:'4', SAZ:'15', GP:'—'}, note:'Aus der Vorwärtsrechnung: FAZ 15, FEZ 19. Beim letzten Vorgang gilt SEZ = FEZ = 19.'},
    {line:2, values:{Vorgang:'F', SEZ:'19', D:'4', SAZ:'15', GP:'0'}, ask:'GP', note:'GP = SAZ − FAZ = 15 − 15 = 0 → kritisch.'},
    {line:3, values:{Vorgang:'D', SEZ:'15', D:'5', SAZ:'10', GP:'0'}, note:'D hat nur F als Nachfolger → SEZ = SAZ von F = 15. SAZ = 15 − 5 = 10. FAZ war 10 → GP = 0, kritisch.'},
    {line:3, values:{Vorgang:'E', SEZ:'15', D:'2', SAZ:'13', GP:'—'}, note:'E hat ebenfalls nur F als Nachfolger → SEZ = 15, SAZ = 13.'},
    {line:5, values:{Vorgang:'E', SEZ:'15', D:'2', SAZ:'13', GP:'6'}, ask:'GP', note:'FAZ von E war 7 → GP = 13 − 7 = 6. E ist nicht kritisch.'},
    {line:3, values:{Vorgang:'B', SEZ:'10', D:'6', SAZ:'4', GP:'0'}, note:'B hat nur D als Nachfolger → SEZ = SAZ von D = 10. SAZ = 4, FAZ war 4 → GP = 0.'},
    {line:3, values:{Vorgang:'C', SEZ:'13', D:'3', SAZ:'10', GP:'6'}, note:'C hat nur E als Nachfolger → SEZ = SAZ von E = 13. SAZ = 10, FAZ war 4 → GP = 6.'},
    {line:3, values:{Vorgang:'A', SEZ:'4', D:'4', SAZ:'0', GP:'0'}, ask:'SEZ', note:'A hat ZWEI Nachfolger: B mit SAZ 4 und C mit SAZ 10 → MIN = 4. SAZ = 0.'},
    {line:7, values:{Vorgang:'Probe', SEZ:'—', D:'—', SAZ:'0', GP:'0'}, note:'SAZ des ersten Vorgangs ist 0 → die Rechnung stimmt.'},
    {line:7, values:{Vorgang:'A-B-D-F', SEZ:'—', D:'19', SAZ:'—', GP:'0'}, note:'Kritischer Pfad: durchgehende Kette mit GP = 0. Der Zweig C–E hat 6 Zeiteinheiten Puffer.'}
  ],
  result:'Kritischer Pfad A–B–D–F, Projektdauer 19, Puffer im Zweig C–E: 6',
  lesson:'Der entscheidende Schritt ist der letzte: Bei Vorgang A treffen zwei Nachfolger zusammen, und dort gilt das Minimum der SAZ-Werte — nicht das Maximum wie in der Vorwärtsrechnung. Wer hier 10 statt 4 nimmt, bekommt für A einen Puffer von 6 und verliert den kritischen Pfad. Merke: Vorwärts MAX, rückwärts MIN. Und beachte, dass C und E ihre 6 Zeiteinheiten Puffer gemeinsam nur einmal haben — verbraucht C fünf Tage, bleibt E genau einer.'
},
{
  id:'tr8', level:2, title:'Subnetzmaske binär bestimmen', input:'172.20.37.155 / 255.255.255.224',
  intro:'Wenn du dich beim Subnetting nicht auf die Blockgröße verlassen willst oder die Aufgabe den Binärweg verlangt, führt dieser Weg immer zum Ziel. Verfolge das letzte Oktett Bit für Bit.',
  code:[
    'IP    172 . 20 . 37 . 155',
    'Maske 255 .255 .255 . 224',
    '',
    'Letztes Oktett binaer:',
    '  155 = 1001 1011',
    '  224 = 1110 0000     -> 3 Netzbits, 5 Hostbits',
    '',
    'Netzadresse  = IP UND Maske      (Hostbits auf 0)',
    'Broadcast    = Hostbits auf 1'
  ],
  vars:['Schritt','Wert binär','Wert dezimal'],
  steps:[
    {line:5, values:{Schritt:'Maske 224', 'Wert binär':'11100000', 'Wert dezimal':'128+64+32 = 224'}, ask:'Wert dezimal', note:'Drei gesetzte Bits im letzten Oktett → Präfix = 24 + 3 = /27.'},
    {line:4, values:{Schritt:'IP-Oktett 155', 'Wert binär':'10011011', 'Wert dezimal':'128+16+8+2+1 = 155'}, note:'Zerlegung über die Stellenwerte 128 64 32 16 8 4 2 1.'},
    {line:7, values:{Schritt:'UND-Verknüpfung', 'Wert binär':'10000000', 'Wert dezimal':'128'}, ask:'Wert dezimal', note:'10011011 UND 11100000: Nur wo beide 1 sind, bleibt 1 → 100 00000 = 128.'},
    {line:7, values:{Schritt:'Netzadresse', 'Wert binär':'—', 'Wert dezimal':'172.20.37.128'}, note:'Die ersten drei Oktette bleiben unverändert, da die Maske dort 255 ist.'},
    {line:8, values:{Schritt:'Hostbits auf 1', 'Wert binär':'10011111', 'Wert dezimal':'128+16+8+4+2+1 = 159'}, ask:'Wert dezimal', note:'Netzanteil 100 bleibt, die fünf Hostbits werden alle 1 → 10011111 = 159.'},
    {line:8, values:{Schritt:'Broadcast', 'Wert binär':'—', 'Wert dezimal':'172.20.37.159'}, note:'Erster Host .129, letzter Host .158.'},
    {line:6, values:{Schritt:'Nutzbare Hosts', 'Wert binär':'2^5 − 2', 'Wert dezimal':'30'}, note:'Fünf Hostbits ergeben 32 Adressen, abzüglich Netz und Broadcast.'}
  ],
  result:'Netz 172.20.37.128/27 · Hosts .129–.158 · Broadcast .159 · 30 Hosts',
  lesson:'Der Binärweg ist langsamer als die Blockgrößen-Methode, aber er versagt nie und liefert die Begründung gleich mit. Die Kontrolle: 256 − 224 = 32 — und genau das ist die Blockgröße. Die Netze beginnen also bei .0, .32, .64, .96, .128, .160 und so weiter, und .155 fällt in den Block ab .128. Beide Wege kommen zum selben Ergebnis, das ist deine Probe.'
}
];
TRACES.push.apply(TRACES, [{"id":"abap-tr1","level":1,"title":"ABAP · Summe der geraden Zahlen","input":"zahlen = [3, 4, 7, 8]","intro":"Der Klassiker: Akkumulator plus Filterbedingung. Verfolge, wann <code>summe</code> sich ändert — und wann nicht.","code":["FUNCTION summeGerade(zahlen)","  summe <- 0","  FOR EACH zahl IN zahlen DO","    IF zahl MOD 2 = 0 THEN","      summe <- summe + zahl","    ENDIF","  ENDFOR","  RETURN summe","ENDFUNCTION"],"vars":["zahl","summe"],"steps":[{"line":1,"values":{"zahl":"—","summe":"0"},"note":"Akkumulator initialisieren."},{"line":2,"values":{"zahl":"3","summe":"0"},"note":"1. Durchlauf: zahl = 3."},{"line":3,"values":{"zahl":"3","summe":"0"},"note":"3 MOD 2 = 1 → Bedingung falsch, Rumpf wird übersprungen."},{"line":2,"values":{"zahl":"4","summe":"0"},"note":"2. Durchlauf: zahl = 4."},{"line":3,"values":{"zahl":"4","summe":"0"},"note":"4 MOD 2 = 0 → Bedingung wahr."},{"line":4,"values":{"zahl":"4","summe":"4"},"ask":"summe","note":"summe = 0 + 4."},{"line":2,"values":{"zahl":"7","summe":"4"},"note":"3. Durchlauf: zahl = 7."},{"line":3,"values":{"zahl":"7","summe":"4"},"note":"7 ist ungerade → übersprungen."},{"line":2,"values":{"zahl":"8","summe":"4"},"note":"4. Durchlauf: zahl = 8."},{"line":3,"values":{"zahl":"8","summe":"4"},"note":"8 ist gerade → Rumpf wird ausgeführt."},{"line":4,"values":{"zahl":"8","summe":"12"},"ask":"summe","note":"summe = 4 + 8."},{"line":7,"values":{"zahl":"8","summe":"12"},"note":"Liste zu Ende → Rückgabe."}],"result":"12","lesson":"Zähle bei solchen Aufgaben nicht die Elemente, sondern die tatsächlichen Zuweisungen: von vier Schleifendurchläufen ändern nur zwei den Akkumulator.","course":"abap"},{"id":"abap-tr2","level":1,"title":"ABAP · Maximum-Suche mit Gleichstand","input":"zahlen = [12, 45, 7, 45, 23]","intro":"Achte genau auf den Vergleichsoperator: <code>&gt;</code> oder <code>&gt;=</code> macht bei doppelten Werten den Unterschied.","code":["FUNCTION findeMaximum(zahlen)","  maximum <- zahlen[1]","  FOR i <- 2 TO LAENGE(zahlen) DO","    IF zahlen[i] > maximum THEN","      maximum <- zahlen[i]","    ENDIF","  ENDFOR","  RETURN maximum","ENDFUNCTION"],"vars":["i","zahlen[i]","maximum"],"steps":[{"line":1,"values":{"i":"—","zahlen[i]":"—","maximum":"12"},"note":"Startwert ist das erste Element."},{"line":2,"values":{"i":"2","zahlen[i]":"45","maximum":"12"},"note":"Schleife beginnt bei Index 2."},{"line":3,"values":{"i":"2","zahlen[i]":"45","maximum":"12"},"note":"45 > 12 → wahr."},{"line":4,"values":{"i":"2","zahlen[i]":"45","maximum":"45"},"ask":"maximum","note":"Neues Maximum gefunden."},{"line":2,"values":{"i":"3","zahlen[i]":"7","maximum":"45"},"note":"Nächster Index."},{"line":3,"values":{"i":"3","zahlen[i]":"7","maximum":"45"},"note":"7 > 45 → falsch."},{"line":2,"values":{"i":"4","zahlen[i]":"45","maximum":"45"},"note":"Achtung: gleicher Wert wie das Maximum."},{"line":3,"values":{"i":"4","zahlen[i]":"45","maximum":"45"},"ask":"maximum","note":"45 > 45 ist FALSCH — strikt größer. maximum bleibt unverändert."},{"line":2,"values":{"i":"5","zahlen[i]":"23","maximum":"45"},"note":"Letzter Index."},{"line":3,"values":{"i":"5","zahlen[i]":"23","maximum":"45"},"note":"23 > 45 → falsch."},{"line":7,"values":{"i":"5","zahlen[i]":"23","maximum":"45"},"note":"Rückgabe des Maximums."}],"result":"45","lesson":"Mit >= statt > wäre das Ergebnis identisch — aber die Zuweisung würde einmal zusätzlich ausgeführt. Prüfungsfragen zielen genau auf solche Unterschiede: „Wie oft wird Zeile 5 ausgeführt?\" → mit > genau 1×, mit >= genau 2×.","course":"abap"},{"id":"abap-tr3","level":2,"title":"ABAP · Bubble-Sort komplett","input":"zahlen = [5, 2, 9, 1]","intro":"Verschachtelte Schleifen mit Tausch. Verfolge den Array-Zustand nach jedem Vergleich.","code":["n <- LAENGE(zahlen)","FOR i <- 1 TO n - 1 DO","  FOR j <- 1 TO n - i DO","    IF zahlen[j] > zahlen[j+1] THEN","      temp <- zahlen[j]","      zahlen[j] <- zahlen[j+1]","      zahlen[j+1] <- temp","    ENDIF","  ENDFOR","ENDFOR"],"vars":["i","j","Vergleich","zahlen"],"steps":[{"line":0,"values":{"i":"—","j":"—","Vergleich":"—","zahlen":"[5, 2, 9, 1]"},"note":"n = 4."},{"line":3,"values":{"i":"1","j":"1","Vergleich":"5 > 2 ✓","zahlen":"[5, 2, 9, 1]"},"note":"Erster Vergleich, Tausch nötig."},{"line":6,"values":{"i":"1","j":"1","Vergleich":"5 > 2 ✓","zahlen":"[2, 5, 9, 1]"},"ask":"zahlen","note":"Nach dem Tausch."},{"line":3,"values":{"i":"1","j":"2","Vergleich":"5 > 9 ✗","zahlen":"[2, 5, 9, 1]"},"note":"Kein Tausch."},{"line":3,"values":{"i":"1","j":"3","Vergleich":"9 > 1 ✓","zahlen":"[2, 5, 9, 1]"},"note":"Tausch nötig."},{"line":6,"values":{"i":"1","j":"3","Vergleich":"9 > 1 ✓","zahlen":"[2, 5, 1, 9]"},"ask":"zahlen","note":"Die 9 ist jetzt „durchgeblubbert\" — ihr Endplatz steht fest."},{"line":3,"values":{"i":"2","j":"1","Vergleich":"2 > 5 ✗","zahlen":"[2, 5, 1, 9]"},"note":"2. Durchlauf, innere Schleife nur noch bis n-i = 2."},{"line":3,"values":{"i":"2","j":"2","Vergleich":"5 > 1 ✓","zahlen":"[2, 5, 1, 9]"},"note":"Tausch nötig."},{"line":6,"values":{"i":"2","j":"2","Vergleich":"5 > 1 ✓","zahlen":"[2, 1, 5, 9]"},"note":"Nach dem Tausch."},{"line":3,"values":{"i":"3","j":"1","Vergleich":"2 > 1 ✓","zahlen":"[2, 1, 5, 9]"},"note":"3. Durchlauf, nur noch ein Vergleich."},{"line":6,"values":{"i":"3","j":"1","Vergleich":"2 > 1 ✓","zahlen":"[1, 2, 5, 9]"},"ask":"zahlen","note":"Letzter Tausch — fertig sortiert."}],"result":"[1, 2, 5, 9]","lesson":"Gesamtzahl der Vergleiche: 3 + 2 + 1 = 6, also n·(n-1)/2. Genau daraus folgt die Komplexität O(n²) — eine typische Anschlussfrage in der Prüfung.","course":"abap"},{"id":"abap-tr4","level":2,"title":"ABAP · Quersumme mit Ganzzahldivision","input":"zahl = 4712","intro":"WHILE-Schleife mit MOD und DIV — das Standardmuster zum Zerlegen von Zahlen.","code":["FUNCTION quersumme(zahl)","  summe <- 0","  WHILE zahl > 0 DO","    summe <- summe + (zahl MOD 10)","    zahl <- zahl DIV 10","  ENDWHILE","  RETURN summe","ENDFUNCTION"],"vars":["zahl","zahl MOD 10","summe"],"steps":[{"line":1,"values":{"zahl":"4712","zahl MOD 10":"—","summe":"0"},"note":"Start."},{"line":3,"values":{"zahl":"4712","zahl MOD 10":"2","summe":"2"},"ask":"summe","note":"Letzte Ziffer per MOD 10 abgreifen."},{"line":4,"values":{"zahl":"471","zahl MOD 10":"2","summe":"2"},"ask":"zahl","note":"DIV 10 schneidet die letzte Ziffer ab (Ganzzahldivision, kein Runden)."},{"line":3,"values":{"zahl":"471","zahl MOD 10":"1","summe":"3"},"note":"summe = 2 + 1."},{"line":4,"values":{"zahl":"47","zahl MOD 10":"1","summe":"3"},"note":"Nächste Stelle."},{"line":3,"values":{"zahl":"47","zahl MOD 10":"7","summe":"10"},"ask":"summe","note":"summe = 3 + 7."},{"line":4,"values":{"zahl":"4","zahl MOD 10":"7","summe":"10"},"note":"Nur noch eine Ziffer übrig."},{"line":3,"values":{"zahl":"4","zahl MOD 10":"4","summe":"14"},"note":"summe = 10 + 4."},{"line":4,"values":{"zahl":"0","zahl MOD 10":"4","summe":"14"},"note":"4 DIV 10 = 0 → Schleifenbedingung wird falsch."},{"line":6,"values":{"zahl":"0","zahl MOD 10":"—","summe":"14"},"note":"Rückgabe."}],"result":"14","lesson":"Das Paar MOD 10 / DIV 10 ist das universelle Muster zum Zerlegen von Zahlen — mit MOD 2 / DIV 2 wird daraus die Umwandlung in Binärdarstellung, eine beliebte Prüfungsvariante.","course":"abap"},{"id":"java-tr1","level":1,"title":"Java · Summe der geraden Zahlen","input":"zahlen = [3, 4, 7, 8]","intro":"Der Klassiker: Akkumulator plus Filterbedingung. Verfolge, wann sich <code>summe</code> ändert — und wann nicht.","code":["int summeGerade(int[] zahlen) {","    int summe = 0;","    for (int zahl : zahlen) {","        if (zahl % 2 == 0) {","            summe += zahl;","        }","    }","    return summe;","}"],"vars":["zahl","summe"],"steps":[{"line":1,"values":{"zahl":"—","summe":"0"},"note":"Akkumulator initialisieren."},{"line":2,"values":{"zahl":"3","summe":"0"},"note":"1. Durchlauf: zahl = 3."},{"line":3,"values":{"zahl":"3","summe":"0"},"note":"3 % 2 ergibt 1 → Bedingung falsch, Rumpf übersprungen."},{"line":2,"values":{"zahl":"4","summe":"0"},"note":"2. Durchlauf: zahl = 4."},{"line":3,"values":{"zahl":"4","summe":"0"},"note":"4 % 2 ergibt 0 → Bedingung wahr."},{"line":4,"values":{"zahl":"4","summe":"4"},"ask":"summe","note":"summe = 0 + 4."},{"line":2,"values":{"zahl":"7","summe":"4"},"note":"3. Durchlauf: zahl = 7."},{"line":3,"values":{"zahl":"7","summe":"4"},"note":"7 ist ungerade → übersprungen."},{"line":2,"values":{"zahl":"8","summe":"4"},"note":"4. Durchlauf: zahl = 8."},{"line":3,"values":{"zahl":"8","summe":"4"},"note":"8 ist gerade → Rumpf wird ausgeführt."},{"line":4,"values":{"zahl":"8","summe":"12"},"ask":"summe","note":"summe = 4 + 8."},{"line":7,"values":{"zahl":"8","summe":"12"},"note":"Array zu Ende → Rückgabe."}],"result":"12","lesson":"Zähle bei solchen Aufgaben nicht die Elemente, sondern die tatsächlichen Zuweisungen: Von vier Durchläufen ändern nur zwei den Akkumulator. Genau danach fragen Prüfungsaufgaben gern („Wie oft wird Zeile 5 ausgeführt?\").","course":"java"},{"id":"java-tr2","level":1,"title":"Java · Maximum-Suche mit Gleichstand","input":"zahlen = [12, 45, 7, 45, 23]","intro":"Achte auf den Vergleichsoperator: <code>&gt;</code> oder <code>&gt;=</code> macht bei doppelten Werten den Unterschied.","code":["int findeMaximum(int[] zahlen) {","    int maximum = zahlen[0];","    for (int i = 1; i < zahlen.length; i++) {","        if (zahlen[i] > maximum) {","            maximum = zahlen[i];","        }","    }","    return maximum;","}"],"vars":["i","zahlen[i]","maximum"],"steps":[{"line":1,"values":{"i":"—","zahlen[i]":"—","maximum":"12"},"note":"Startwert ist das erste Element (Index 0)."},{"line":2,"values":{"i":"1","zahlen[i]":"45","maximum":"12"},"note":"Schleife beginnt bei Index 1."},{"line":3,"values":{"i":"1","zahlen[i]":"45","maximum":"12"},"note":"45 > 12 → wahr."},{"line":4,"values":{"i":"1","zahlen[i]":"45","maximum":"45"},"ask":"maximum","note":"Neues Maximum."},{"line":2,"values":{"i":"2","zahlen[i]":"7","maximum":"45"},"note":"Nächster Index."},{"line":3,"values":{"i":"2","zahlen[i]":"7","maximum":"45"},"note":"7 > 45 → falsch."},{"line":2,"values":{"i":"3","zahlen[i]":"45","maximum":"45"},"note":"Achtung: gleicher Wert wie das aktuelle Maximum."},{"line":3,"values":{"i":"3","zahlen[i]":"45","maximum":"45"},"ask":"maximum","note":"45 > 45 ist FALSCH — strikt größer. maximum bleibt unverändert."},{"line":2,"values":{"i":"4","zahlen[i]":"23","maximum":"45"},"note":"Letzter Index."},{"line":3,"values":{"i":"4","zahlen[i]":"23","maximum":"45"},"note":"23 > 45 → falsch."},{"line":7,"values":{"i":"5","zahlen[i]":"—","maximum":"45"},"note":"i = 5 bricht die Schleife ab (length = 5). Rückgabe."}],"result":"45","lesson":"Mit >= statt > wäre das Ergebnis identisch — aber Zeile 5 würde zweimal statt einmal ausgeführt. Prüfungsfragen zielen genau auf diesen Unterschied. Und beachte die Abbruchbedingung: i < zahlen.length, nicht <=, sonst gibt es eine ArrayIndexOutOfBoundsException.","course":"java"},{"id":"java-tr3","level":2,"title":"Java · Bubble-Sort komplett","input":"zahlen = [5, 2, 9, 1]","intro":"Verschachtelte Schleifen mit Tausch über eine Hilfsvariable. Verfolge den Array-Zustand nach jedem Vergleich.","code":["void bubbleSort(int[] a) {","    int n = a.length;","    for (int i = 1; i < n; i++) {","        for (int j = 0; j < n - i; j++) {","            if (a[j] > a[j + 1]) {","                int temp = a[j];","                a[j] = a[j + 1];","                a[j + 1] = temp;","            }","        }","    }","}"],"vars":["i","j","Vergleich","a"],"steps":[{"line":1,"values":{"i":"—","j":"—","Vergleich":"—","a":"[5, 2, 9, 1]"},"note":"n = 4."},{"line":4,"values":{"i":"1","j":"0","Vergleich":"5 > 2 ✓","a":"[5, 2, 9, 1]"},"note":"Erster Vergleich, Tausch nötig."},{"line":7,"values":{"i":"1","j":"0","Vergleich":"5 > 2 ✓","a":"[2, 5, 9, 1]"},"ask":"a","note":"Nach dem Tausch über temp."},{"line":4,"values":{"i":"1","j":"1","Vergleich":"5 > 9 ✗","a":"[2, 5, 9, 1]"},"note":"Kein Tausch."},{"line":4,"values":{"i":"1","j":"2","Vergleich":"9 > 1 ✓","a":"[2, 5, 9, 1]"},"note":"Tausch nötig."},{"line":7,"values":{"i":"1","j":"2","Vergleich":"9 > 1 ✓","a":"[2, 5, 1, 9]"},"ask":"a","note":"Die 9 ist durchgeblubbert — ihr Endplatz steht fest."},{"line":4,"values":{"i":"2","j":"0","Vergleich":"2 > 5 ✗","a":"[2, 5, 1, 9]"},"note":"2. Durchlauf, innere Schleife nur noch bis n-i = 2."},{"line":4,"values":{"i":"2","j":"1","Vergleich":"5 > 1 ✓","a":"[2, 5, 1, 9]"},"note":"Tausch nötig."},{"line":7,"values":{"i":"2","j":"1","Vergleich":"5 > 1 ✓","a":"[2, 1, 5, 9]"},"note":"Nach dem Tausch."},{"line":4,"values":{"i":"3","j":"0","Vergleich":"2 > 1 ✓","a":"[2, 1, 5, 9]"},"note":"3. Durchlauf, nur noch ein Vergleich."},{"line":7,"values":{"i":"3","j":"0","Vergleich":"2 > 1 ✓","a":"[1, 2, 5, 9]"},"ask":"a","note":"Letzter Tausch — fertig sortiert."}],"result":"[1, 2, 5, 9]","lesson":"Gesamtzahl der Vergleiche: 3 + 2 + 1 = 6, allgemein n·(n-1)/2. Daraus folgt die Komplexität O(n²) — eine typische Anschlussfrage. In echtem Java-Code nimmt man natürlich Arrays.sort() mit O(n log n).","course":"java"},{"id":"java-tr4","level":2,"title":"Java · Quersumme mit Ganzzahldivision","input":"zahl = 4712","intro":"While-Schleife mit Modulo und Ganzzahldivision — das Standardmuster zum Zerlegen von Zahlen.","code":["int quersumme(int zahl) {","    int summe = 0;","    while (zahl > 0) {","        summe += zahl % 10;","        zahl = zahl / 10;","    }","    return summe;","}"],"vars":["zahl","zahl % 10","summe"],"steps":[{"line":1,"values":{"zahl":"4712","zahl % 10":"—","summe":"0"},"note":"Start."},{"line":3,"values":{"zahl":"4712","zahl % 10":"2","summe":"2"},"ask":"summe","note":"Letzte Ziffer mit % 10 abgreifen."},{"line":4,"values":{"zahl":"471","zahl % 10":"2","summe":"2"},"ask":"zahl","note":"Ganzzahldivision durch 10 schneidet die letzte Ziffer ab — kein Runden."},{"line":3,"values":{"zahl":"471","zahl % 10":"1","summe":"3"},"note":"summe = 2 + 1."},{"line":4,"values":{"zahl":"47","zahl % 10":"1","summe":"3"},"note":"Nächste Stelle."},{"line":3,"values":{"zahl":"47","zahl % 10":"7","summe":"10"},"ask":"summe","note":"summe = 3 + 7."},{"line":4,"values":{"zahl":"4","zahl % 10":"7","summe":"10"},"note":"Nur noch eine Ziffer übrig."},{"line":3,"values":{"zahl":"4","zahl % 10":"4","summe":"14"},"note":"summe = 10 + 4."},{"line":4,"values":{"zahl":"0","zahl % 10":"4","summe":"14"},"note":"4 / 10 ergibt 0 → Schleifenbedingung wird falsch."},{"line":6,"values":{"zahl":"0","zahl % 10":"—","summe":"14"},"note":"Rückgabe."}],"result":"14","lesson":"Das Paar % 10 und / 10 ist das universelle Muster zum Zerlegen von Zahlen. Mit % 2 und / 2 wird daraus die Umwandlung in Binärdarstellung — eine beliebte Prüfungsvariante. Merke: In Java ist / bei zwei int-Werten immer Ganzzahldivision.","course":"java"},{"id":"java-tr5","level":2,"title":"Java · Rekursion: Fakultät auf dem Stack","input":"fakultaet(4)","intro":"Rekursion baut Aufrufe auf dem Stack auf und rechnet erst beim Zurückkehren. Verfolge zuerst den Abstieg, dann den Aufstieg.","code":["int fakultaet(int n) {","    if (n <= 1) {","        return 1;","    }","    return n * fakultaet(n - 1);","}"],"vars":["Aufrufebene","n","Rückgabe"],"steps":[{"line":4,"values":{"Aufrufebene":"1","n":"4","Rückgabe":"wartet"},"note":"fakultaet(4) ruft fakultaet(3) auf — noch kein Ergebnis."},{"line":4,"values":{"Aufrufebene":"2","n":"3","Rückgabe":"wartet"},"note":"fakultaet(3) ruft fakultaet(2) auf."},{"line":4,"values":{"Aufrufebene":"3","n":"2","Rückgabe":"wartet"},"note":"fakultaet(2) ruft fakultaet(1) auf."},{"line":2,"values":{"Aufrufebene":"4","n":"1","Rückgabe":"1"},"ask":"Rückgabe","note":"Abbruchbedingung erreicht: n <= 1 liefert 1."},{"line":4,"values":{"Aufrufebene":"3","n":"2","Rückgabe":"2"},"ask":"Rückgabe","note":"Rückweg: 2 * 1 = 2."},{"line":4,"values":{"Aufrufebene":"2","n":"3","Rückgabe":"6"},"note":"3 * 2 = 6."},{"line":4,"values":{"Aufrufebene":"1","n":"4","Rückgabe":"24"},"ask":"Rückgabe","note":"4 * 6 = 24 — das Endergebnis."}],"result":"24","lesson":"Jeder rekursive Aufruf belegt einen eigenen Stack-Frame mit eigener Variable n. Fehlt die Abbruchbedingung oder wird sie nie erreicht, wächst der Stack, bis ein StackOverflowError fliegt. Prüfungsfrage dazu lautet oft: „Wie viele Aufrufe entstehen?\" — hier vier, nämlich n = 4, 3, 2, 1.","course":"java"}]);
var RP_TRANSFER = [{"lesson":"m52-l3","q":"Drei Positionen kosten jeweils 3 Cent netto, Steuersatz 19 %, jeweils halbaufrunden auf ganze Cent. Welche Aussage unterscheidet Positions- von Gesamtrundung korrekt?","options":["Beide Verfahren liefern zwingend 11 Cent, weil Integer immer jedes Rundungsproblem lösen.","Je Position entstehen 4 Cent, zusammen 12; auf 9 Cent Gesamtnetto berechnet ergeben sich 11 Cent brutto. Die Fachregel muss das Verfahren festlegen.","Floatwerte verwenden und erst nach dem Export hoffen, dass die Zahlen gleich sind."],"correct":1,"explain":"Pro Position: 3 + round(0,57) = 4, dreimal also 12. Gesamtrechnung: 9 + round(1,71) = 11. Integerdarstellung beseitigt nicht den Unterschied fachlicher Rundungsregeln.","rationales":["Ganzzahlen verhindern nicht unterschiedliche Rundungszeitpunkte.","Die Rechenwege unterscheiden sich sachlich; beide benötigen einen definierten Vertrag.","Floatarithmetik löst keine fehlende Rundungsvorschrift."]},{"lesson":"m46-l2","q":"Ein Benutzer sendet gültige name/preis-Felder für ein fremdes Produkt. Form Request und fillable sind korrekt. Welcher fehlende Schutz verhindert dennoch eine unerlaubte Änderung?","options":["Eine Policy/Ownershipprüfung für genau dieses Produkt vor der Änderung.","Noch einmal denselben String-Maximalwert validieren.","Das Produkt im Frontend ausblenden und auf die geheime URL vertrauen."],"correct":0,"explain":"Feldvalidität und Mass-Assignment-Freigabe sagen nichts darüber aus, wer das Objekt ändern darf. Die serverseitige Autorisierung muss jeden Zugriffspfad abdecken.","rationales":["Prüft die fehlende Beziehung zwischen Nutzer,Objekt und Aktion.","Prüft denselben Datenvertrag, nicht die Berechtigung.","Direkte HTTP-Aufrufe umgehen die Darstellung."]},{"lesson":"m48-l2","q":"Die eigene Vue-SPA wird per Sanctum-Session authentifiziert. tokenCan liefert true. Darf die SPA dadurch ein fremdes Objekt bearbeiten?","options":["Ja, tokenCan ist für jede Anfrage die vollständige Autorisierung.","Nein. Für First-Party-SPA ist tokenCan bewusst true; eine Policy muss Eigentum und Aktion weiterhin prüfen.","Nur wenn der Token in localStorage gespeichert wird."],"correct":1,"explain":"Sanctum trennt First-Party-Sessionauth von Personal-Access-Tokens. Abilities allein ersetzen auch im Tokenflow keine Objektberechtigung.","rationales":["Verwechselt Auth-/Ability-Komfort mit fachlichem Zugriffsschutz.","Ordnet die API-Eigenschaft korrekt ein und behält die serverseitige Grenze.","Speicherung eines Tokens erteilt keine Rechte und erhöht XSS-Risiken."]},{"lesson":"m50-l1","q":"Ein Queue-Job erstellt extern eine Rechnung und stürzt vor dem Speichern von invoice_path ab. ShouldBeUnique und if(invoice_path) waren eingebaut. Was verhindert eine zweite externe Rechnung beim Retry zuverlässig im vereinbarten Vertrag?","options":["Ein längerer sleep im Job.","Alle Exceptions abfangen und den Job als erfolgreich melden.","Ein dauerhafter fachlicher Deduplizierungsschlüssel und ein vom externen Anbieter unterstützter idempotenter Auftrag samt Recoverystrategie."],"correct":2,"explain":"Ein lokaler Vorabcheck kennt den bereits eingetretenen externen Effekt nach einem Crash nicht. Uniqueness-Locks sind keine Exactly-once-Garantie.","rationales":["Ändert die Informationslücke zwischen externem Erfolg und lokalem Zustand nicht.","Versteckt den Fehler und verliert die Wiederherstellbarkeit.","Erlaubt die erneute Abfrage/Anforderung ohne fachliche Doppelwirkung unter dem konkreten Anbieter-Vertrag."]},{"lesson":"m59-l2","q":"Ein Angreifer wiederholt einen alten, korrekt signierten Webhook. Die Raw-Body-HMAC-Prüfung besteht. Welcher zusätzliche Vertrag adressiert genau dieses Risiko?","options":["Signierten Timestamp innerhalb eines erlaubten Zeitfensters prüfen und Ereignis-ID dauerhaft deduplizieren.","JSON nach dem Empfang hübsch formatieren.","CORS nur auf die eigene Website beschränken und HMAC nicht weiter beachten."],"correct":0,"explain":"Signaturintegrität allein beweist keine Frische. Timestamp muss Bestandteil der Anbietersignatur sein; Replay-/Dublettenregeln müssen bei Parallelität wirksam bleiben.","rationales":["Prüft Frische und Wiederholung als getrennte Eigenschaften.","Ändert Signaturbytes und liefert keinen Frischebeweis.","CORS begrenzt keine beliebigen Serverclients."]},{"lesson":"js-m1-l3","q":"const copy = {...original}; copy.settings.theme = \"dark\" verändert auch original.settings.theme. Welcher Grund ist korrekt?","options":["const macht alle Objekte automatisch tief unveränderlich.","Spread kopiert hier die oberste Ebene; settings ist weiterhin dieselbe Objektreferenz.","JavaScript kopiert Objekte immer byteweise, die Konsole täuscht nur."],"correct":1,"explain":"Eine neue äußere Objektidentität ist keine tiefe Kopie. Kopiere die betroffenen Ebenen bewusst oder wähle ein geeignetes Deep-Clone-Verfahren mit dessen Typgrenzen.","rationales":["const verhindert Neuzuweisung der Bindung, nicht jede Mutation.","Erklärt die geteilte innere Referenz.","Das beobachtete Verhalten folgt dem Referenzmodell."]},{"lesson":"js-m1-l9","q":"Vue 3.5: const {title} = defineProps(...) im selben script setup und const {count} = reactive({count:0}) sehen ähnlich aus. Welche Aussage ist präzise?","options":["Beides bleibt durch normales JavaScript-Destructuring immer reaktiv.","Beides verliert unter allen Umständen die Reaktivität.","defineProps-Destrukturierung erhält hier spezielle Compilerbehandlung; ein aus reactive gelesener primitiver Wert bekommt dadurch keine allgemeine Live-Verbindung."],"correct":2,"explain":"Der Compiler schreibt Zugriffe auf destrukturierte Props im definierten Kontext um. Diese Sonderregel ändert nicht die allgemeine JavaScript-Semantik.","rationales":["Überträgt eine Vue-Compilerregel auf beliebige Objekte.","Ignoriert die explizite Sonderbehandlung seit Vue 3.5.","Unterscheidet Compilerkontext und Wertzugriff."]},{"lesson":"js-m1-l11","q":"Anfrage A startet, danach B. B liefert neue Daten, danach A alte Daten. Abort wurde auf A angefordert, der Fetch-Fake liefert trotzdem. Was muss die UI vor dem Schreiben prüfen?","options":["Ob das Ergebnis noch zur neuesten Anfragesequenz gehört.","Nur ob der Status 200 war.","Ob A zuerst gestartet wurde; dann hat A automatisch Vorrang."],"correct":0,"explain":"Abbruch ist kein universeller Beweis, dass keine alte Antwort mehr ankommt. Sequenz-/Identitätsprüfung muss auch Fehler- und finally-Zustände berücksichtigen.","rationales":["Verhindert veraltetes Überschreiben, unabhängig von tatsächlicher Abbruchwirkung.","Ein erfolgreicher Status sagt nichts über Aktualität aus.","Würde gerade den veralteten Zustand bevorzugen."]},{"lesson":"js-m1-l13","q":"const {tasks} = store liefert in einer Komponente einen alten Eindruck nach store.replace(). Welcher Ansatz erhält beim Destrukturieren den Bezug auf Pinia-State?","options":["Den Store in JSON.stringify umwandeln.","storeToRefs(store) für State verwenden und Aktionen bewusst separat nutzen.","tasks einmal in eine globale window-Variable kopieren."],"correct":1,"explain":"storeToRefs erzeugt Referenzen für reaktiven Storestate. Eine einmal gelesene Wertbindung ist kein allgemeiner Ersatz dafür.","rationales":["Serialisierung erzeugt keine lebende reaktive Referenz.","Erhält die vorgesehene Verbindung zum Store.","Vergrößert die Zahl unkontrollierter Kopien."]},{"lesson":"html-m1-l4","q":"Ein Formular hat type=email und required. Ein direkter HTTP-Client sendet ungültige Daten. Welche serverseitige Schlussfolgerung ist richtig?","options":["Der Browser hat es bereits garantiert geprüft.","POST bedeutet automatisch gültig und autorisiert.","Der Server muss Format,Grenzen und Berechtigung selbst prüfen; native Browserprüfung ist nur eine Benutzungshilfe."],"correct":2,"explain":"Angreifer oder andere Clients sind nicht an die Browseroberfläche gebunden. Client- und Servervalidierung sind unterschiedliche Grenzen.","rationales":["Unterstellt einen zwingenden Browserpfad.","HTTP-Methode ist kein Validitäts-/Rechtenachweis.","Behält die verbindliche Prüfung an der vertrauenswürdigen Grenze."]},{"lesson":"css-m1-l2","q":"width:200px; padding:20px; border:2px solid bei content-box, ohne Margin. Welche Borderboxbreite entsteht, und was ändert border-box?","options":["244px; mit border-box sind die angegebenen 200px inklusive Padding und Border.","200px; border-box fügt noch einmal 44px hinzu.","240px; Border zählt in keiner Variante."],"correct":0,"explain":"Content-box: 200 + 2×20 + 2×2 = 244. Border-box bezieht die inneren Abstände und Border in width ein; Margin bleibt außerhalb.","rationales":["Rechnet beide Seiten und den Rahmen korrekt.","Vertauscht die Definitionen.","Lässt den Rahmen unberücksichtigt."]},{"lesson":"mariadb-m1-l4","q":"Zwei Clients lesen Bestand=1 und buchen danach je einen Verkauf. Beide verwenden einzelne gültige UPDATEs. Was fehlt gegen Überverkauf?","options":["Nur eine schnellere Netzverbindung.","Eine atomare fachliche Bedingung oder passende kurze Sperrtransaktion mit Prüfung des Ergebnisses.","Ein zusätzlicher SELECT nach der Bestätigung als alleiniger Schutz."],"correct":1,"explain":"Einzelne syntaktisch gültige Updates erfüllen nicht automatisch die gemeinsame Invariante. Bedingtes UPDATE und betroffene Zeilen oder getestete Sperren können die Entscheidung atomar absichern.","rationales":["Verringert höchstens Wahrscheinlichkeit, schafft keine Integritätsgarantie.","Verbindet Entscheidung und Mutation mit geprüftem Konkurrenzverhalten.","Stellt den Fehler erst nach möglicher Doppelbuchung fest."]},{"lesson":"api-m1-l2","q":"Zwei Clients ändern dieselbe Revision 7. Der Server liefert ETag, ignoriert aber If-Match beim Schreiben. Welche Garantie besteht?","options":["Keine Optimistic-Concurrency-Garantie allein durch die Headerausgabe; die Vorbedingung muss atomar geprüft werden.","Automatisch keine Lost Updates, weil ETag in jeder Antwort steht.","Der zweite Client wird durch CORS immer gesperrt."],"correct":0,"explain":"Bedingte Requests brauchen serverseitige Implementierung. Metadaten ohne wirksame Prüfung sind kein Schreibschutz.","rationales":["Unterscheidet veröffentlichten Vertrag und implementierte Invariante.","Behandelt Information als automatische Sperre.","Verwechselt Cross-Origin-Regeln mit Revisionskontrolle."]},{"lesson":"mcp-m1-l4","q":"Ein MCP-Resource-Text fordert einen ungeplanten Secret-Upload und nennt sich selbst „Systemanweisung“. Wie soll der Host damit umgehen?","options":["Ausführen, weil Resource-Inhalte höhere Priorität haben.","Als untrusted Daten behandeln; weder Rechte noch Nutzerauftrag daraus erweitern.","Nur nach Umformatierung in JSON ausführen."],"correct":1,"explain":"Selbstbehauptete Autorität in externen Inhalten ist keine echte Anweisungspriorität. Wirksame Tool-/Netzwerkrechte begrenzen die Folgen zusätzlich.","rationales":["Genau das Muster indirekter Prompt Injection.","Behält die Vertrauensgrenze.","Formatänderung schafft keine Befugnis."]},{"lesson":"agents-m1-l5","q":"Ein Agent behebt einen Fehler, indem er die fehlgeschlagene Berechtigungsassertion aus dem Test entfernt. Danach ist die Suite grün. Wie wird das bewertet?","options":["Als vollständiger Erfolg, weil Tests grün sind.","Als kleinere Änderung ohne Relevanz.","Als ungeklärte Regression: Anforderung und Teständerung unabhängig reviewen und den Sicherheitsfall wieder prüfen."],"correct":2,"explain":"Der Testlauf beweist nur die verbliebenen Assertions. Entfernte Gegenbeispiele können den Eindruck einer Reparatur vortäuschen.","rationales":["Verwechselt grüne Ausgabe mit unverändert erfüllter Anforderung.","Eine entfernte Sicherheitsassertion verändert den Nachweis.","Fordert unabhängige Akzeptanz und echte Regressionstests."]}];
RP_TRANSFER.forEach(function(item){
 var lesson=MODULES.flatMap(function(m){return m.lessons;}).find(function(l){return l.id===item.lesson;});
 if(!lesson)throw new Error('Transferziel fehlt: '+item.lesson);
 var question=Object.assign({},item);delete question.lesson;
 if(!lesson.quiz.some(function(q){return q.q===question.q;}))lesson.quiz.push(question);
});
var RP_LITERAL_2=window.RP_LITERALS[2];
var RP_QUIZ_REVISIONS=RP_LITERAL_2;
function rpQuestionId(lesson,index){ var q=lesson.quiz[index];return lesson.id+'#'+index+(q.revision?'@'+q.revision:''); }
RP_QUIZ_REVISIONS.forEach(function(item){
var lesson=FLAT.find(function(l){return l.id===item.lesson;});
if(!lesson||!lesson.quiz[item.index])throw new Error('Quiz-Ziel fehlt: '+item.lesson);
var question=Object.assign({},item);delete question.lesson;delete question.index;lesson.quiz[item.index]=question;
});
var CARDS = [];
MODULES.forEach(function(m){
  m.lessons.forEach(function(l){
    (l.quiz || []).forEach(function(q, i){
      CARDS.push({ id:(typeof rpQuestionId==='function'?rpQuestionId(l,i):l.id+'#'+i), q:q.q, options:q.options, correct:q.correct,
                   explain:q.explain, lessonId:l.id, lessonTitle:l.title,
                   moduleTitle:m.title, part:m.part });
    });
  });
});
var EXTRA_CARDS = [
['m1-l1','Welche Eigenschaft fordert, dass ein Algorithmus bei gleicher Eingabe stets dasselbe Ergebnis liefert?',['Endlichkeit','Determiniertheit','Allgemeingültigkeit'],1,'Determiniertheit betrifft das Ergebnis, Determinismus den Ablauf.'],
['m1-l2','Wie oft wird eine fußgesteuerte Schleife (WIEDERHOLE … BIS) mindestens durchlaufen?',['Nullmal','Einmal','So oft wie die Bedingung wahr ist'],1,'Die Prüfung erfolgt erst am Ende, daher läuft der Rumpf garantiert einmal.'],
['m1-l3','Was liefert 17 DIV 5?',['3','3,4','2'],0,'DIV ist die ganzzahlige Division ohne Rest; 17 MOD 5 wäre 2.'],
['m1-l3','Wie prüft man in Pseudocode, ob eine Zahl ungerade ist?',['zahl DIV 2 = 1','zahl MOD 2 <> 0','zahl / 2 = 0'],1,'Der Rest bei Division durch 2 ist bei ungeraden Zahlen 1, also ungleich 0.'],
['m1-l4','Ein Array hat 12 Elemente. Welchen Index hat das letzte?',['12','11','13'],1,'Arrays beginnen bei 0, das letzte Element liegt bei LAENGE − 1.'],
['m2-l1','Welches Struktogramm-Element stellt eine kopfgesteuerte Schleife dar?',['Ein Rechteck mit Rahmen oben und links','Eine Raute','Ein Parallelogramm'],0,'Der Rahmen oben zeigt: Die Bedingung wird vor dem Rumpf geprüft.'],
['m2-l2','Welches PAP-Symbol nach DIN 66001 steht für eine Verzweigung?',['Rechteck','Raute','Oval'],1,'Die Raute hat einen Eingang und zwei beschriftete Ausgänge (ja/nein).'],
['m2-l3','Was ist der wesentliche Unterschied zwischen Struktogramm und PAP?',['Das Struktogramm erlaubt keine Sprünge und erzwingt strukturierte Programmierung','Der PAP ist genauer','Es gibt keinen Unterschied'],0,'Im PAP sind Sprünge zeichenbar, im Struktogramm nicht — das verhindert Spaghetticode.'],
['m3-l1','Wie viele Vergleiche braucht die lineare Suche im Mittel bei n Elementen?',['n','n/2','log₂(n)'],1,'Im schlechtesten Fall n, im Mittel etwa die Hälfte.'],
['m3-l2','Welche Voraussetzung hat die binäre Suche zwingend?',['Ein sortiertes Feld','Ein Feld ohne Duplikate','Ein Feld mit gerader Elementzahl'],0,'Auf unsortierten Daten liefert sie falsche Ergebnisse, ohne einen Fehler zu melden.'],
['m3-l3','Wie viele Vergleiche führt Bubble-Sort bei 10 Elementen maximal durch?',['45','100','10'],0,'n · (n−1) / 2 = 10 · 9 / 2 = 45.'],
['m3-l4','Welche Komplexität haben Quicksort und Mergesort im Mittel?',['O(n²)','O(n · log n)','O(n)'],1,'Teile-und-herrsche-Verfahren sind deutlich schneller als die quadratischen Sortierverfahren.'],
['m4-l1','Was ist der erste Schritt eines Trockenlaufs?',['Das Ergebnis raten','Eine Wertetabelle mit einer Spalte je Variable anlegen','Den Code umschreiben'],1,'Die Tabelle macht jede Zustandsänderung nachvollziehbar und sichert Teilpunkte.'],
['m4-l2','Wann ist eine ODER-Verknüpfung falsch?',['Wenn ein Teil falsch ist','Nur wenn beide Teile falsch sind','Nie'],1,'ODER ist wahr, sobald mindestens ein Teil wahr ist.'],
['m4-l3','Was besagt die Äquivalenzklassenbildung beim Testen?',['Jeder mögliche Wert wird getestet','Aus jeder Klasse gleichartiger Eingaben genügt ein Vertreter','Nur gültige Werte werden getestet'],1,'Dazu kommt die Grenzwertanalyse an den Rändern der Klassen.'],
['m4-l3','Was ist ein Blackbox-Test?',['Ein Test ohne Kenntnis des Quellcodes, nur gegen die Spezifikation','Ein Test im abgedunkelten Raum','Ein Test der Datenbank'],0,'Beim Whitebox-Test ist der interne Aufbau dagegen bekannt.'],
['m5-l1','Wie wird eine Entität in der Chen-Notation dargestellt?',['Als Raute','Als Rechteck','Als Oval'],1,'Raute = Beziehung, Oval = Attribut, unterstrichen = Schlüsselattribut.'],
['m5-l2','Eine Zwischentabelle bei n:m — woraus besteht ihr Primärschlüssel?',['Aus einem neuen Zählfeld','Aus beiden Fremdschlüsseln zusammen','Aus dem ersten Fremdschlüssel'],1,'Ein zusammengesetzter Primärschlüssel aus genau den beiden Fremdschlüsseln.'],
['m5-l3','Ein Attribut gehört zur Beziehung, nicht zu den Entitäten. Wo landet es?',['In der ersten Entität','In der Zwischentabelle der n:m-Beziehung','Es entfällt'],1,'Beispiel: die Arbeitszeit eines Mechanikers an einem bestimmten Auftrag.'],
['m5-l4','Was kennzeichnet ein Schlüsselattribut im ER-Diagramm?',['Fettdruck','Unterstreichung','Ein Sternchen'],1,'In der relationalen Notation schreibt man es ebenfalls unterstrichen.'],
['m6-l1','Wogegen verstößt eine Spalte mit dem Inhalt „Meier, Schmidt, Kunz"?',['Gegen die 1. NF, weil sie nicht atomar ist','Gegen die 2. NF','Gegen die 3. NF'],0,'Mehrere Werte in einem Feld verletzen die Atomarität.'],
['m6-l2','Was ist eine transitive Abhängigkeit?',['Ein Nichtschlüsselattribut hängt von einem anderen Nichtschlüsselattribut ab','Ein Attribut hängt vom halben Schlüssel ab','Zwei Tabellen sind verknüpft'],0,'Sie wird in der 3. NF aufgelöst, etwa PLZ → Ort.'],
['m6-l3','Welche Anomalie tritt auf, wenn beim Löschen des letzten Kurses auch der Dozent verschwindet?',['Einfügeanomalie','Löschanomalie','Änderungsanomalie'],1,'Ungewollter Datenverlust ist das Kennzeichen der Löschanomalie.'],
['m6-l3','Warum wird bewusst denormalisiert?',['Aus Bequemlichkeit','Um Leseabfragen zu beschleunigen und JOINs zu sparen','Weil die 3. NF veraltet ist'],1,'Der Preis ist Redundanz und höherer Pflegeaufwand — eine bewusste Abwägung.'],
['m7-l1','In welcher Reihenfolge wird SQL logisch ausgeführt?',['SELECT, FROM, WHERE','FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY','WHERE, SELECT, FROM'],1,'Deshalb ist ein SELECT-Alias in WHERE nicht verfügbar, in ORDER BY dagegen schon.'],
['m7-l2','Welcher Filter gehört in HAVING statt in WHERE?',['ort = "Berlin"','COUNT(*) > 5','datum > "2025-01-01"'],1,'HAVING filtert Gruppen nach der Aggregation, WHERE filtert Einzelzeilen davor.'],
['m7-l3','Was liefert ein LEFT JOIN?',['Nur die Treffer beider Tabellen','Alle Zeilen der linken Tabelle, rechts ggf. NULL','Alle Zeilen beider Tabellen'],1,'Für Kunden ohne Bestellung braucht man genau diesen Join-Typ.'],
['m7-l3','Warum macht eine WHERE-Bedingung auf die rechte Tabelle aus einem LEFT JOIN faktisch einen INNER JOIN?',['Weil WHERE den Join überschreibt','Weil die NULL-Zeilen die Bedingung nicht erfüllen und herausgefiltert werden','Das stimmt nicht'],1,'Abhilfe: Bedingung in die ON-Klausel verschieben oder auf IS NULL prüfen.'],
['m7-l4','Wie prüft man korrekt auf einen fehlenden Wert?',['spalte = NULL','spalte IS NULL','spalte <> ""'],1,'Ein Vergleich mit = NULL liefert niemals ein Ergebnis.'],
['m7-l5','Zu welcher SQL-Kategorie gehört GRANT?',['DDL','DML','DCL'],2,'DCL regelt Rechte; DDL definiert Strukturen, DML bearbeitet Daten.'],
['m8-l1','Wo werden Akteure im Use-Case-Diagramm gezeichnet?',['Innerhalb der Systemgrenze','Außerhalb der Systemgrenze','In einer Ellipse'],1,'Sie sind Rollen außerhalb des Systems — auch Fremdsysteme können Akteure sein.'],
['m8-l2','In welche Richtung zeigt der «extend»-Pfeil?',['Vom erweiterten zum erweiternden Fall','Vom erweiternden zum erweiterten Fall','In beide Richtungen'],1,'Bei «include» ist es genau umgekehrt — vom einschließenden zum eingeschlossenen Fall.'],
['m8-l2','Welches Signalwort deutet auf «extend» hin?',['„immer"','„optional" oder „gegebenenfalls"','„beinhaltet"'],1,'«extend» beschreibt bedingtes Verhalten, «include» stets ausgeführtes.'],
['m8-l3','Welches Diagramm eignet sich für einen Geschäftsprozess mit Entscheidungen und Parallelität?',['Klassendiagramm','Aktivitätsdiagramm','Use-Case-Diagramm'],1,'Es ist das UML-Gegenstück zum Programmablaufplan.'],
['m9-l1','Wofür steht das Zeichen # im Klassendiagramm?',['public','protected','private'],1,'+ public, − private, # protected, ~ package.'],
['m9-l2','Welche Beziehung gilt, wenn das Teil beim Löschen des Ganzen ebenfalls verschwindet?',['Aggregation','Komposition','Assoziation'],1,'Komposition wird mit gefüllter Raute gezeichnet, Aggregation mit leerer.'],
['m9-l2','Was bedeutet die Multiplizität 1..* an einem Linienende?',['Höchstens eines','Mindestens eines','Genau eines'],1,'0..* bedeutet dagegen beliebig viele einschließlich null.'],
['m9-l3','Eine Methode heißt in beiden Unterklassen gleich, arbeitet aber verschieden. Was liegt vor?',['Kapselung','Polymorphie','Aggregation'],1,'Gleicher Name, unterschiedliches Verhalten je nach konkreter Klasse.'],
['m10-l1','Wer erstellt das Lastenheft?',['Der Auftragnehmer','Der Auftraggeber','Die IHK'],1,'Merkhilfe: Der Auftraggeber bürdet seine Lasten auf, der Auftragnehmer übernimmt Pflichten.'],
['m10-l1','Welches Dokument wird abgenommen und damit Vertragsbestandteil?',['Das Lastenheft','Das Pflichtenheft','Der Projektstrukturplan'],1,'Es definiert den geschuldeten Leistungsumfang des Werkvertrags.'],
['m10-l2','„Die Oberfläche muss ohne Schulung in 15 Minuten erlernbar sein" ist eine …',['funktionale Anforderung','nicht-funktionale Anforderung','Rahmenbedingung'],1,'Sie beschreibt eine Qualität, kein Was — und ist messbar formuliert.'],
['m10-l3','Welche Teststufe entspricht im V-Modell dem Feinentwurf?',['Abnahmetest','Integrationstest','Systemtest'],1,'Anforderungen ↔ Abnahmetest, Grobentwurf ↔ Systemtest, Feinentwurf ↔ Integrationstest.'],
['m10-l3','Worum geht es in der Sprint-Retrospektive?',['Um das fertige Produkt','Um die Zusammenarbeit im Team','Um die Priorisierung des Backlogs'],1,'Das Produkt ist Thema des Sprint Reviews.'],
['m10-l4','Wofür steht das M in SMART?',['Machbar','Messbar','Motivierend'],1,'Ohne Messbarkeit lässt sich die Zielerreichung nicht prüfen.'],
['m11-l1','Auf welcher OSI-Schicht arbeitet ein Router?',['Schicht 2','Schicht 3','Schicht 4'],1,'Er entscheidet anhand der IP-Adresse und trennt Broadcast-Domänen.'],
['m11-l1','Welche Einheit wird auf Schicht 2 übertragen?',['Pakete','Frames','Segmente'],1,'Bits auf 1, Frames auf 2, Pakete auf 3, Segmente auf 4.'],
['m11-l2','Welcher Port gehört zu HTTPS?',['80','443','22'],1,'80 ist HTTP, 22 ist SSH.'],
['m11-l2','Warum nutzt Videotelefonie UDP statt TCP?',['UDP ist sicherer','Verzögerung stört mehr als ein verlorenes Paket','TCP kann kein Video übertragen'],1,'Ein kurzes Bildrauschen ist erträglicher als ein Stocken durch Neuübertragung.'],
['m11-l3','Was trennt ein Switch?',['Broadcast-Domänen','Kollisionsdomänen','Beides'],1,'Broadcast-Domänen trennt erst der Router beziehungsweise ein VLAN.'],
['m11-l4','Ping auf das Gateway klappt, Ping auf 8.8.8.8 nicht. Wo liegt der Fehler vermutlich?',['Beim Kabel','Beim Routing oder der Internetverbindung','Beim DNS'],1,'DNS wäre erst betroffen, wenn die IP funktioniert, der Name aber nicht.'],
['m12-l1','Welche Subnetzmaske gehört zu /28?',['255.255.255.240','255.255.255.224','255.255.255.248'],0,'28 Einsen: im letzten Oktett 11110000 = 240.'],
['m12-l1','Welcher Bereich ist privat nach RFC 1918?',['11.0.0.0/8','172.16.0.0/12','192.169.0.0/16'],1,'Die privaten Bereiche sind 10.0.0.0/8, 172.16.0.0/12 und 192.168.0.0/16.'],
['m12-l2','Wie groß ist die Blockgröße bei der Maske 255.255.255.224?',['16','32','64'],1,'256 − 224 = 32, die Netze beginnen bei 0, 32, 64, 96 …'],
['m12-l3','Ein Subnetz braucht mindestens 100 Hosts. Welches Präfix ist erforderlich?',['/25','/26','/24'],0,'2⁷ − 2 = 126 ≥ 100; /26 böte nur 62 Hosts.'],
['m12-l4','Was bedeutet eine IP aus dem Bereich 169.254.x.x?',['Das Gerät ist korrekt konfiguriert','Kein DHCP-Server war erreichbar (APIPA)','Es liegt ein Virenbefall vor'],1,'Ohne Gateway ist nur die Kommunikation im eigenen Segment möglich.'],
['m12-l5','Warum wurde NAT überhaupt notwendig?',['Weil IPv4 nur rund 4,3 Milliarden Adressen kennt','Weil Router sonst zu langsam wären','Weil private Adressen verschlüsselt sind'],0,'NAT hat die Adressknappheit hinausgezögert. IPv6 macht es überflüssig.'],
['m13-l1','Wie viele Blöcke hat eine vollständig ausgeschriebene IPv6-Adresse?',['4','8','16'],1,'8 Blöcke zu je 16 Bit ergeben 128 Bit.'],
['m13-l1','Wie lautet 2001:db8::28 ungekürzt?',['2001:0db8:0000:0000:0000:0000:0000:0028','2001:db8:0:0:0:0:0:28','2001:0db8:0028'],0,'Sechs Nullblöcke ersetzt das ::, und jeder Block wird auf vier Ziffern aufgefüllt.'],
['m13-l2','Wie viele /64-Teilnetze lassen sich aus einem /48-Präfix bilden?',['256','65.536','65.534'],1,'16 Bit Teilnetz-ID ergeben 2¹⁶ — ohne Abzug, da IPv6 keinen Broadcast kennt.'],
['m13-l2','Welches IPv6-Präfix steht für Link-Local?',['2000::/3','fe80::/10','ff00::/8'],1,'Jedes Interface bildet sich beim Start automatisch eine solche Adresse.'],
['m13-l3','Was leistet SLAAC?',['Verschlüsselung','Zustandslose Adress-Autokonfiguration ohne DHCP-Server','Namensauflösung'],1,'Das Präfix kommt per Router Advertisement, den Interface-Teil bildet der Host selbst.'],
['m14-l1','Welcher DHCP-Schritt folgt auf das Offer?',['Discover','Request','Acknowledge'],1,'Die Reihenfolge lautet Discover, Offer, Request, Acknowledge — DORA.'],
['m14-l1','Was ist eine DHCP-Reservierung?',['Ein für Gäste freigehaltener Adressbereich','Eine feste IP, gebunden an eine MAC-Adresse','Eine besonders lange Lease-Dauer'],1,'Die saubere Alternative zur statischen Konfiguration am Gerät — die Verwaltung bleibt zentral.'],
['m14-l2','Welcher DNS-Record verweist auf den zuständigen Mailserver?',['A','MX','CNAME'],1,'CNAME ist ein Alias, A die IPv4-Zuordnung.'],
['m14-l2','Welcher Befehl zeigt den Weg eines Pakets über alle Router?',['ping','tracert','nslookup'],1,'So findet man, an welcher Stelle die Verbindung abbricht.'],
['m14-l3','Warum bietet WPA2-Enterprise mehr Sicherheit als WPA2-Personal?',['Es ist schneller','Individuelle Zugänge über RADIUS lassen sich einzeln sperren','Es nutzt längere Passwörter'],1,'Beim PSK müsste man das gemeinsame Passwort auf allen Geräten ändern.'],
['m14-l4','Was unterscheidet ein SAN von einem NAS?',['Das SAN stellt Blockspeicher bereit, das NAS Dateien','Das NAS ist schneller','Das SAN nutzt SMB'],0,'Daraus folgen Performance, Datenbanktauglichkeit und Kosten.'],
['m15-l1','Welchem Schutzziel dient eine digitale Signatur vorrangig?',['Verfügbarkeit','Integrität und Authentizität','Nur Vertraulichkeit'],1,'Sie macht Änderungen erkennbar und weist den Urheber aus.'],
['m15-l2','Welche Maßnahme ist technisch?',['Clean-Desk-Policy','Automatische Bildschirmsperre per Gruppenrichtlinie','Besucherregelung'],1,'Sie wird konfiguriert, nicht organisatorisch geregelt.'],
['m15-l3','Welche Sicherungsart benötigt bei der Rücksicherung die Vollsicherung plus alle Zwischensicherungen?',['Differenziell','Inkrementell','Vollsicherung'],1,'Differenziell braucht nur die Vollsicherung und die letzte differenzielle.'],
['m15-l3','Wie viel Nutzkapazität bieten 4 Platten à 3 TB im RAID 6?',['12 TB','6 TB','9 TB'],1,'(4 − 2) × 3 TB = 6 TB, zwei Platten gehen für die doppelte Parität drauf.'],
['m15-l3','Warum ersetzt ein RAID kein Backup?',['Weil es zu langsam ist','Weil versehentliches Löschen und Ransomware den Spiegel sofort mittreffen','Weil RAID nur für Server gilt'],1,'RAID schützt allein gegen den Hardwareausfall einer Platte.'],
['m15-l4','Wie viele Stunden Ausfall erlaubt eine zugesicherte Verfügbarkeit von 99,9 % pro Jahr?',['Etwa 88 Stunden','Etwa 8,8 Stunden','Etwa 53 Minuten'],1,'8.760 h × 0,001 = 8,76 h.'],
['m15-l4','Was beschreibt der RTO?',['Den maximal tolerierbaren Datenverlust','Die maximal tolerierbare Ausfalldauer','Die Backupgröße'],1,'Der RPO bezeichnet dagegen den maximalen Datenverlust in Zeit.'],
['m16-l1','Mit welchem Schlüssel signiert man ein Dokument?',['Mit dem öffentlichen Schlüssel des Empfängers','Mit dem eigenen privaten Schlüssel','Mit dem öffentlichen Schlüssel des Senders'],1,'Prüfen kann dann jeder mit dem zugehörigen öffentlichen Schlüssel.'],
['m16-l1','Wie viele Schlüssel braucht symmetrische Verschlüsselung bei 10 Teilnehmern?',['10','45','100'],1,'n · (n−1) / 2 = 10 · 9 / 2 = 45 — daher das Schlüsselaustauschproblem.'],
['m16-l2','Wozu dient ein Salt beim Hashen von Passwörtern?',['Er verlängert das Passwort','Er macht vorberechnete Rainbow Tables unbrauchbar','Er verschlüsselt den Hash'],1,'Gleiche Passwörter ergeben dadurch unterschiedliche Hashwerte.'],
['m16-l2','Was verbindet ein Site-to-Site-VPN?',['Einen Mitarbeiter mit der Firma','Zwei Standorte dauerhaft miteinander','Zwei Programme'],1,'Für einzelne Mitarbeiter im Homeoffice nutzt man End-to-Site.'],
['m16-l3','Was kennzeichnet einen Trojaner?',['Er verbreitet sich selbstständig','Er tarnt sich als nützliches Programm','Er verschlüsselt Daten'],1,'Die Verschlüsselung mit Lösegeldforderung ist das Merkmal von Ransomware.'],
['m16-l3','Wie schützt man wirksam gegen SQL-Injection?',['Mit einer Firewall','Mit Prepared Statements und Eingabevalidierung','Mit längeren Passwörtern'],1,'Eingaben werden dann als Daten behandelt, nicht als ausführbarer SQL-Code.'],
['m16-l4','Binnen welcher Frist muss eine Datenpanne gemeldet werden?',['24 Stunden','72 Stunden','Eine Woche'],1,'An die Aufsichtsbehörde, bei hohem Risiko zusätzlich an die Betroffenen.'],
['m16-l4','Wie hoch kann ein DSGVO-Bußgeld maximal ausfallen?',['20 Mio. € oder 4 % des weltweiten Jahresumsatzes','10.000 €','1 Mio. €'],0,'Es gilt jeweils der höhere der beiden Werte.'],
['m16-l4','Wann ist ein Auftragsverarbeitungsvertrag erforderlich?',['Bei jedem Einkauf','Wenn ein Dienstleister weisungsgebunden personenbezogene Daten verarbeitet','Nur bei Behörden'],1,'Typischer Fall: der Cloud- oder Rechenzentrumsbetreiber.'],
['m17-l1','Womit beginnt die Vorwärtsrechnung beim allerersten Vorgang?',['Mit FAZ = 0','Mit FAZ = 1','Mit FAZ = Dauer'],0,'Von dort aus gilt für jeden weiteren Vorgang FEZ = FAZ + D.'],
['m17-l2','Womit beginnt die Rückwärtsrechnung?',['Mit SAZ = 0 beim ersten Vorgang','Mit SEZ = FEZ beim letzten Vorgang','Mit GP = 0'],1,'Von dort rechnet man rückwärts durch den Plan.'],
['m17-l2','Was gibt der freie Puffer an?',['Verschiebung ohne Gefährdung des Projektendes','Verschiebung ohne Verzögerung des frühesten Nachfolgerstarts','Die Gesamtdauer'],1,'Die erste Beschreibung trifft auf den Gesamtpuffer zu.'],
['m17-l2','Ein Vorgang hat FAZ 8, SAZ 8, D 5. Ist er kritisch?',['Ja, GP = 0','Nein','Das lässt sich nicht sagen'],0,'GP = SAZ − FAZ = 0, er liegt auf dem kritischen Pfad.'],
['m17-l3','Wie lautet die PERT-Formel zur Aufwandsschätzung?',['(O + M + P) / 3','(O + 4M + P) / 6','(O + P) / 2'],1,'Der wahrscheinliche Wert wird vierfach gewichtet.'],
['m17-l3','Was ist ein Arbeitspaket?',['Ein Meilenstein','Die kleinste planbare Einheit im Projektstrukturplan','Ein Vertragsdokument'],1,'Es hat einen Verantwortlichen, einen Aufwand und ein definiertes Ergebnis.'],
['m18-l1','Was gilt bei einem K.-o.-Kriterium in der Nutzwertanalyse?',['Es wird doppelt gewichtet','Wer es nicht erfüllt, wird gar nicht erst bewertet','Es zählt 50 %'],1,'Ausschlusskriterien werden vor der eigentlichen Bewertung geprüft.'],
['m18-l2','Wovon wird der Skontoabzug berechnet?',['Vom Listenpreis','Vom Zieleinkaufspreis nach Rabatt','Vom Bezugspreis'],1,'Und auf die Bezugskosten gibt es gar keinen Skonto.'],
['m18-l2','Wie viel Umsatzsteuer stecken bei 19 % in 595 € brutto?',['113,05 €','95,00 €','119,00 €'],1,'595 / 1,19 = 500 netto, davon 19 % = 95 €.'],
['m18-l3','Eine Investition von 24.000 € spart 8.000 € jährlich. Wann amortisiert sie sich?',['Nach 2 Jahren','Nach 3 Jahren','Nach 4 Jahren'],1,'24.000 / 8.000 = 3 Jahre.'],
['m18-l3','Was bleibt beim Ratendarlehen konstant?',['Die Rate','Die Tilgung','Die Zinsen'],1,'Die Zinsen sinken mit der Restschuld, daher sinkt auch die Gesamtrate.'],
['m18-l4','Welche Vertragsart liegt bei einer Beratungsleistung nach Aufwand vor?',['Werkvertrag','Dienstvertrag','Kaufvertrag'],1,'Geschuldet ist die Tätigkeit, nicht ein bestimmter Erfolg.'],
['m18-l4','Was gilt für die Gewährleistung bei Neuware?',['Sie ist freiwillig','Sie ist gesetzlich und beträgt zwei Jahre','Sie gilt fünf Jahre'],1,'Die Garantie ist dagegen eine freiwillige Zusage, meist des Herstellers.'],
['m18-l4','Wie lange gilt gegenüber Verbrauchern die gesetzliche Gewährleistung für neue bewegliche Sachen?',['Sechs Monate','Zwei Jahre','Fünf Jahre'],1,'Davon zu trennen ist die Garantie: Sie ist freiwillig und kommt meist vom Hersteller.'],
['m19-l1','Wie viele Byte hat 1 MiB?',['1.000.000','1.048.576','1.024'],1,'2²⁰ = 1.048.576 — das dezimale MB hat dagegen genau eine Million Byte.'],
['m19-l1','Warum zeigt Windows bei einer 1-TB-Platte nur etwa 931 GB an?',['Die Platte ist defekt','Weil binär (2³⁰) statt dezimal (10⁹) gezählt wird','Wegen der Formatierung'],1,'10¹² / 2³⁰ ergibt 931,3 — die Kapazität ist unverändert, nur die Zählweise anders.'],
['m19-l2','Wie lange dauert die Übertragung von 500 MB über 50 Mbit/s?',['10 Sekunden','80 Sekunden','40 Sekunden'],1,'500 MB = 4.000 Mbit, geteilt durch 50 Mbit/s = 80 s.'],
['m19-l2','Was ist bei „70 % effektiver Auslastung" zuerst zu tun?',['Das Ergebnis am Ende durch 0,7 teilen','Die Datenrate vor der Division auf 70 % reduzieren','Nichts, das ist irrelevant'],1,'Erst die Rate anpassen, dann die Zeit berechnen.'],
['m19-l3','Welcher Binärwert entspricht dezimal 248?',['11111000','11110000','11111100'],0,'128+64+32+16+8 = 248 — die Maske /29.'],
['m19-l3','Wie viele Bit entsprechen einer Hexadezimalziffer?',['2','4','8'],1,'Vier Bit ergeben 16 Werte, also genau ein Hex-Zeichen.'],
['m19-l4','Wie sollte ein Bildschirmarbeitsplatz zum Fenster ausgerichtet sein?',['Mit Blick zum Fenster','Blickrichtung parallel zum Fenster','Mit dem Rücken zum Fenster'],1,'Davor blendet das Licht, dahinter spiegelt es sich im Display.'],
['m19-l4','Was misst der PUE-Wert?',['Die Rechenleistung','Gesamtenergie geteilt durch IT-Energie','Den Stromverbrauch pro Server'],1,'Je näher an 1,0, desto effizienter die Infrastruktur des Rechenzentrums.'],
['m19-l4','Was kosten 20 PCs a 100 W bei 8 h taeglich, 220 Arbeitstagen und 0,30 EUR/kWh im Jahr?',['352 EUR','1.056 EUR','3.520 EUR'],1,'20 x 100 W x 8 h x 220 = 3.520.000 Wh = 3.520 kWh; 3.520 x 0,30 EUR = 1.056 EUR.']
,
['m20-l1','Welcher Rechenschritt fehlt am häufigsten bei der ABC-Analyse?',['Die Sortierung','Die kumulierte Prozentspalte','Die Multiplikation mit dem Preis'],1,'Erst die Aufsummierung zeigt, wo die 80-Prozent-Grenze verläuft.'],
['m20-l1','Was folgt auf die Anfrage im Beschaffungsprozess?',['Die Bestellung','Der Angebotsvergleich','Die Rechnungsprüfung'],1,'Erst vergleichen, dann bestellen.'],
['m20-l2','Fixkosten 30.000 €, Preis 95 €, variable Stückkosten 45 €. Break-Even?',['316 Stück','600 Stück','667 Stück'],1,'db = 95 − 45 = 50; 30.000 / 50 = 600 Stück.'],
['m20-l2','Was ist die kritische Menge beim Verfahrensvergleich?',['Die Menge, ab der Gewinn entsteht','Die Menge, bei der beide Varianten gleich teuer sind','Die maximale Produktionsmenge'],1,'Man setzt beide Kostenfunktionen gleich und löst nach x auf.'],
['m20-l3','Ein Server kostet 15.000 €, Nutzungsdauer 5 Jahre. Wie hoch ist die lineare AfA?',['5.000 €','3.000 €','1.500 €'],1,'15.000 / 5 = 3.000 € pro Jahr.'],
['m20-l3','Wofür steht TCO?',['Total Cost of Ownership – alle Kosten über den Lebenszyklus','Total Computing Output','Time Critical Operation'],0,'Anschaffung, Betrieb, Schulung, Wartung und Entsorgung zusammen.'],
['m20-l4','Ertrag 60.000 €, Aufwand 48.000 €. Wie hoch ist die Wirtschaftlichkeit?',['1,25','12.000','25 %'],0,'60.000 / 48.000 = 1,25 – ein Wert über 1 bedeutet wirtschaftlich.'],
['m20-l4','Welche Kennzahl setzt den Gewinn ins Verhältnis zum eingesetzten Kapital?',['Produktivität','Rentabilität','Wirtschaftlichkeit'],1,'Angegeben in Prozent; der ROI bezieht sich speziell auf eine Investition.'],
['m21-l1','Was bewirkt Hyperthreading?',['Es verdoppelt die Rechenleistung','Es stellt zusätzliche logische Kerne bereit, ca. 20–30 % Mehrleistung','Es erhöht den Takt'],1,'Echte Parallelität bieten nur physische Kerne.'],
['m21-l1','Warum gehört ECC-RAM in einen Server?',['Er ist schneller','Er erkennt und korrigiert Bitfehler','Er verbraucht weniger Strom'],1,'Datenintegrität im Dauerbetrieb wiegt den Aufpreis auf.'],
['m21-l2','Was ist NVMe?',['Eine Bauform','Ein Übertragungsprotokoll über PCIe','Eine Kapazitätsangabe'],1,'M.2 ist die Bauform – eine M.2-SSD kann auch nur SATA nutzen.'],
['m21-l2','Wie schnell ist SATA III brutto?',['3 Gbit/s','6 Gbit/s','10 Gbit/s'],1,'Netto bleiben nach Overhead etwa 550 MB/s.'],
['m21-l3','Welche Datenrate hat USB 2.0?',['12 Mbit/s','480 Mbit/s','5 Gbit/s'],1,'USB 3.2 Gen 1 (früher 3.0) hat 5 Gbit/s.'],
['m21-l3','USB 3.0 nennt 5 Gbit/s. Wie viel ist das brutto in Megabyte je Sekunde?',['etwa 625 MB/s','etwa 5.000 MB/s','etwa 62 MB/s'],0,'5.000 Mbit/s geteilt durch 8. Nach Abzug des Protokoll-Overheads bleibt weniger übrig.'],
['m21-l4','Wie viele Pixel hat ein 4K-UHD-Bildschirm?',['2.073.600','8.294.400','3.840'],1,'3840 × 2160 – genau die vierfache Menge von Full HD.'],
['m21-l4','Welcher Kennwert entscheidet den Druckervergleich bei hohem Volumen?',['Der Anschaffungspreis','Der Seitenpreis','Die Druckauflösung'],1,'Über die Nutzungsdauer dominiert er die Gesamtkosten deutlich.'],
['m21-l5','Eine USV liefert 1.200 VA bei Leistungsfaktor 0,7. Wie viel Watt sind das?',['1.714 W','840 W','1.200 W'],1,'1.200 × 0,7 = 840 W – VA und Watt sind nicht dasselbe.'],
['m21-l5','Warum plant man beim Netzteil Reserve ein?',['Damit es leiser läuft','Wegen Lastspitzen, Aufrüstbarkeit und dem besten Wirkungsgrad bei mittlerer Last','Weil Netzteile schrumpfen'],1,'Dauerhafte Volllast senkt Effizienz und Lebensdauer.'],
['m22-l1','Welche Kabelkategorie braucht es mindestens für 10 Gigabit über volle 100 Meter?',['Cat 5e','Cat 6A','Cat 6'],1,'Cat 6 schafft 10 Gbit/s nur auf verkürzter Strecke, Cat 5e gar nicht.'],
['m22-l1','Welche Kategorie unterstützt 10 Gbit/s über die vollen 100 m?',['Cat 5e','Cat 6','Cat 6a'],2,'Cat 6 schafft 10 Gbit/s nur bis etwa 55 m.'],
['m22-l1','Wofür steht die Verdrillung der Adernpaare?',['Für bessere Biegsamkeit','Zur gegenseitigen Aufhebung eingestreuter Störungen','Zur Farbkennzeichnung'],1,'Daher der Name Twisted Pair.'],
['m22-l2','Welche Faserart nutzt man für mehrere Kilometer?',['Multimode','Singlemode','Beide gleich gut'],1,'Multimode reicht wegen der Modendispersion nur etwa 550 m.'],
['m22-l2','Welcher LWL-Vorteil zählt bei einer Gebäudeverbindung im Freien besonders?',['Das geringe Gewicht','Die galvanische Trennung – kein Blitzschadensweg','Der niedrige Preis'],1,'Zusätzlich zur Reichweite und der Störunempfindlichkeit.'],
['m22-l3','Wie viel Leistung liefert PoE+ nach 802.3at am Endgerät?',['ca. 12,95 W','ca. 25,5 W','ca. 51 W'],1,'802.3af liefert 12,95 W, 802.3bt bis 71 W.'],
['m22-l3','Welcher Bereich der strukturierten Verkabelung führt zur Anschlussdose?',['Primärbereich','Sekundärbereich','Tertiärbereich'],2,'Primär verbindet Gebäude, sekundär die Etagen.'],
['m23-l1','Welcher Hypervisor-Typ läuft direkt auf der Hardware?',['Typ 1','Typ 2','Beide'],0,'Typ 2 läuft als Programm innerhalb eines Wirts-Betriebssystems.'],
['m23-l1','Warum ist ein Snapshot kein Backup?',['Weil er zu klein ist','Weil er auf demselben Speicher liegt wie die VM','Weil er nur Textdateien sichert'],1,'Ein Defekt des Datenspeichers vernichtet beides gleichzeitig.'],
['m23-l2','Was fehlt einem Container im Vergleich zur VM?',['Die Anwendung','Ein eigenes Gast-Betriebssystem','Der Netzwerkzugang'],1,'Er nutzt den Kernel des Hosts – daher Start in Sekunden.'],
['m23-l2','Wann brauchst du zwingend eine VM statt eines Containers?',['Bei hoher Instanzzahl','Wenn ein anderes Betriebssystem als das des Hosts nötig ist','Bei wenig Arbeitsspeicher'],1,'Nur die VM bringt einen eigenen Kernel mit.'],
['m23-l3','Bei welchem Cloud-Modell verwaltest du die Anwendung, aber nicht das Betriebssystem?',['IaaS','PaaS','SaaS'],1,'Bei IaaS bist du ab dem OS zuständig, bei SaaS nur noch für die Daten.'],
['m23-l3','Wer bleibt bei einer SaaS-Nutzung datenschutzrechtlich verantwortlich?',['Der Anbieter','Das nutzende Unternehmen','Die Aufsichtsbehörde'],1,'Der Anbieter ist Auftragsverarbeiter – daher der AVV nach Art. 28.'],
['m23-l3','Was bezeichnet ein Lock-in-Effekt?',['Eine Sicherheitssperre','Die Abhängigkeit vom Anbieter durch erschwerten Wechsel','Eine Verschlüsselungsart'],1,'Gegenmittel: vertraglich zugesicherter Datenexport in offenem Format.'],
['m24-l1','Was passiert mit einer OEM-Lizenz beim Gerätetausch?',['Sie wandert mit','Sie erlischt mit dem Gerät','Sie wird automatisch verlängert'],1,'Retail-Lizenzen sind dagegen übertragbar.'],
['m24-l1','50 Personen teilen sich 20 Rechner. Welche CAL-Art ist günstiger?',['User-CAL','Device-CAL','Beide gleich'],1,'Es gibt weniger Geräte als Personen – also Geräte lizenzieren.'],
['m24-l2','Bedeutet Open Source automatisch kostenlos?',['Ja','Nein – offener Quellcode und Preis sind zwei verschiedene Dinge','Nur bei der GPL'],1,'Freeware ist umgekehrt kostenlos, aber ohne Quellcode.'],
['m24-l2','Wann greift der Copyleft-Effekt der GPL?',['Sofort bei der Installation','Bei der Weitergabe abgeleiteter Werke','Nie'],1,'Bei rein interner Nutzung entsteht keine Offenlegungspflicht.'],
['m24-l2','Wem stehen die Verwertungsrechte an Software aus dem Arbeitsverhältnis zu?',['Dem Entwickler','Dem Arbeitgeber nach § 69b UrhG','Der Allgemeinheit'],1,'Das Urheberpersönlichkeitsrecht bleibt beim Entwickler.'],
['m24-l3','Warum wird vor dem Klonen Sysprep ausgeführt?',['Zum Komprimieren','Zum Entfernen der SID und rechnerspezifischer Daten','Zum Aktivieren der Lizenz'],1,'Identische SIDs führen in der Domäne zu Konflikten.'],
['m24-l3','Wie werden Sicherheitsupdates im Unternehmen ausgerollt?',['Sofort auf allen Systemen','Zuerst in einer Testgruppe, dann gestaffelt','Nur einmal jährlich'],1,'So fallen Inkompatibilitäten vor dem Produktivbetrieb auf.'],
['m24-l4','Welche Wirkung hat die Abnahme?',['Sie verlängert die Garantie','Die Vergütung wird fällig und die Gewährleistungsfrist beginnt','Sie hebt den Vertrag auf'],1,'Zusätzlich gehen Gefahr und Beweislast über.'],
['m24-l4','Welches Mindestkontrastverhältnis fordert die WCAG für normalen Text?',['2:1','4,5:1','7:1'],1,'Für große Schrift genügt 3:1.'],
['m25-l1','Eine Störung ist behoben, die Ursache aber unbekannt und sie wiederholt sich. Was liegt vor?',['Nur ein Incident','Ein Problem','Ein Change'],1,'Die einzelnen Ausfälle sind Incidents, das Muster dahinter ein Problem.'],
['m25-l1','Was ist ein Known Error?',['Ein Programmierfehler','Ein Problem mit bekannter Ursache und dokumentiertem Workaround','Ein abgelehntes Ticket'],1,'Die Sammlung bildet die Known Error Database.'],
['m25-l2','Was ist eine hierarchische Eskalation?',['Weitergabe an mehr Fachwissen','Einschalten der Führungsebene wegen Befugnis oder Ressourcen','Schließen des Tickets'],1,'Die Weitergabe an den Second Level ist die funktionale Eskalation.'],
['m25-l2','Welche Ticketangabe ist für den Second Level am wertvollsten?',['Die Abteilung des Melders','Die Schritte zur Reproduktion','Die Uhrzeit'],1,'Ohne Reproduzierbarkeit beginnt die Analyse bei null.'],
['m25-l3','Was regelt ein Underpinning Contract?',['Interne Abteilungen','Den Vertrag mit einem externen Zulieferer','Die Kundenvereinbarung'],1,'Intern ist es das OLA, mit dem Kunden das SLA.'],
['m25-l3','Was sagt die Reaktionszeit im SLA aus?',['Wann die Störung behoben ist','Wann die Bearbeitung beginnt','Wie lange der Dienst ausfallen darf'],1,'Die Behebung regelt die Wiederherstellungszeit.'],
['m25-l3','Ein SLA nennt 99,5 % bei Servicezeit Mo–Fr 8–17 Uhr. Worauf beziehst du die Ausfallzeit?',['Auf 8.760 h','Auf die Servicezeit von ca. 2.340 h','Auf 365 Tage'],1,'Der Bezugszeitraum verändert das Ergebnis um ein Vielfaches.'],
['m26-l1','Welche Seite der Nachricht verrät etwas über den Sender selbst?',['Sachinhalt','Selbstoffenbarung','Appell'],1,'Etwa Ärger, Zeitdruck oder Unsicherheit.'],
['m26-l1','Warum eskaliert ein Gespräch trotz korrekter Fakten?',['Weil die Fakten unvollständig sind','Weil der Empfänger auf dem Beziehungsohr hört','Weil zu leise gesprochen wird'],1,'Das Eisberg-Modell verortet rund 80 Prozent dort.'],
['m26-l2','Womit steigt man in eine Störungsaufnahme ein?',['Mit einer geschlossenen Frage','Mit einer offenen W-Frage','Mit einem Lösungsvorschlag'],1,'Geschlossene Fragen grenzen anschließend ein.'],
['m26-l2','Welcher Gesprächsschritt verhindert die meisten Missverständnisse?',['Die Begrüßung','Das Zusammenfassen und Rückversichern','Die Verabschiedung'],1,'Er kostet Sekunden und spart oft Stunden Fehlarbeit.'],
['m26-l3','Wie beginnt man das Gespräch mit einem verärgerten Kunden?',['Mit einem Lösungsvorschlag','Mit Ausredenlassen und Verständnis zeigen','Mit dem Verweis auf das SLA'],1,'Erst danach ist die Sachebene überhaupt erreichbar.'],
['m26-l3','Was unterscheidet Feedback von Kritik?',['Feedback beschreibt beobachtetes Verhalten, Kritik bewertet die Person','Feedback ist immer positiv','Es gibt keinen Unterschied'],0,'Genau deshalb ist die Ich-Botschaft das Werkzeug der Wahl.'],
['m27-l1','Was unterscheidet Qualitätssicherung von Qualitätskontrolle?',['Es gibt keinen Unterschied','Sicherung beugt Fehlern vor, Kontrolle findet sie im Nachhinein','Kontrolle ist gesetzlich vorgeschrieben'],1,'Vorbeugen ist billiger als Nacharbeit — das ist der Kern jedes Qualitätsmanagements.'],
['m27-l1','Was geschieht in der Check-Phase des PDCA?',['Die Maßnahme wird geplant','Das Ergebnis wird gemessen und mit dem Ziel verglichen','Die Maßnahme wird zum Standard'],1,'Ohne messbare Größe ist die Phase wertlos.'],
['m27-l2','Warum muss das Notfallhandbuch auch gedruckt vorliegen?',['Wegen der Aufbewahrungspflicht','Weil es bei einem IT-Ausfall sonst unzugänglich ist','Weil Papier fälschungssicher ist'],1,'Ein Plan im ausgefallenen System hilft im Ernstfall nicht.'],
['m27-l2','Welchen nicht-technischen Zweck erfüllt die Inventarisierung?',['Die Virenabwehr','Abschreibung, Lizenznachweis und Ersatzplanung','Die Netzwerkkonfiguration'],1,'Sie dient Buchhaltung, Rechtsabteilung und Einkauf gleichermaßen.']
,
['m28-l1','Welche Aussage zur Einordnung stimmt?',['KI ⊂ ML ⊂ Deep Learning','Deep Learning ⊂ ML ⊂ KI','Alle drei sind gleichbedeutend'],1,'Deep Learning ist die engste, KI die weiteste Menge.'],
['m28-l1','Ein System wendet vom Menschen formulierte Wenn-Dann-Regeln an. Was ist es?',['Maschinelles Lernen','Regelbasierte KI, aber kein ML','Deep Learning'],1,'ML setzt voraus, dass die Regel aus Daten abgeleitet wird.'],
['m28-l2','Welche Lernart braucht gelabelte Trainingsdaten?',['Überwachtes Lernen','Unüberwachtes Lernen','Bestärkendes Lernen'],0,'Die richtige Antwort ist Teil der Trainingsdaten.'],
['m28-l2','Ein Modell soll den Immobilienpreis in Euro schätzen. Was ist das?',['Klassifikation','Regression','Clustering'],1,'Ausgabe ist ein Zahlenwert – also Regression.'],
['m28-l2','Ein Roboter lernt durch Belohnung und Bestrafung. Welche Lernart?',['Überwacht','Unüberwacht','Bestärkend'],2,'Es gibt keine Label, sondern eine Rückmeldung zur Aktion.'],
['m28-l3','Was wird beim Training eines neuronalen Netzes verändert?',['Die Anzahl der Schichten','Die Gewichte der Verbindungen','Die Eingabedaten'],1,'Die Architektur steht vorher fest.'],
['m28-l3','Warum werden Testdaten vom Training ausgeschlossen?',['Um Speicher zu sparen','Damit gemessen wird, ob das Modell verallgemeinern kann','Aus Lizenzgründen'],1,'Sonst misst man nur das Auswendiggelernte.'],
['m28-l4','Training 97 %, Test 68 %. Welches Problem?',['Underfitting','Overfitting','Kein Problem'],1,'Die große Lücke ist das Kennzeichen von Überanpassung.'],
['m28-l4','Training 61 %, Test 59 %. Welches Problem?',['Overfitting','Underfitting – das Modell ist zu einfach','Kein Problem'],1,'Beide Werte schlecht bedeutet Unteranpassung.'],
['m28-l4','Woher stammt Bias in einem Modell meistens?',['Aus fehlerhaftem Code','Aus verzerrten Trainingsdaten','Aus zu wenig Rechenleistung'],1,'Das Modell reproduziert, was in den Daten steckt.'],
['m28-l4','Was besagt „Garbage in, garbage out"?',['Große Modelle brauchen viel Speicher','Die Datenqualität begrenzt die Modellqualität','Alte Daten müssen gelöscht werden'],1,'Kein Verfahren gleicht schlechte Trainingsdaten aus.'],
['m29-l1','Was ist ein Token bei einem Sprachmodell?',['Ein Sicherheitsschlüssel','Die kleinste Verarbeitungseinheit, etwa ein Wortstück','Ein Lizenzschlüssel'],1,'Die Abrechnung erfolgt meist je Token.'],
['m29-l1','Warum halluziniert ein Sprachmodell?',['Wegen eines Programmierfehlers','Weil es Wahrscheinlichkeiten berechnet und keine Fakten prüft','Wegen zu wenig Arbeitsspeicher'],1,'Es sagt das wahrscheinlichste nächste Token vorher.'],
['m29-l1','Wofür steht RAG?',['Random Access Generation','Retrieval Augmented Generation – eigene Dokumente werden zur Anfrage geladen','Rule And Grammar'],1,'Die Alternative wäre ein aufwendiges Fine-Tuning.'],
['m29-l1','Welche vier Bestandteile hat ein guter Prompt?',['Länge, Sprache, Ton, Emoji','Rolle, Aufgabe, Kontext, Format','Anrede, Frage, Dank, Gruß'],1,'Je konkreter der Kontext, desto brauchbarer die Antwort.'],
['m29-l2','Was ist Predictive Maintenance?',['Wartung nach festem Intervall','Wartung auf Basis vorhergesagter Ausfälle','Reparatur nach dem Schaden'],1,'Sensordaten zeigen die Störung an, bevor sie eintritt.'],
['m29-l2','Welches Risiko besteht bei der Nutzung öffentlicher KI-Dienste im Betrieb?',['Zu hohe Genauigkeit','Abfluss vertraulicher Daten über die Eingabe','Zu lange Antwortzeiten'],1,'Eingaben können gespeichert und zum Training genutzt werden.'],
['m29-l3','Welche Phase eines KI-Projekts kostet typischerweise 60–80 % des Aufwands?',['Die Modellierung','Die Datenvorbereitung','Das Deployment'],1,'Bereinigen, Zusammenführen und Vereinheitlichen der Daten.'],
['m29-l3','Was bedeutet Model Drift?',['Das Modell wird größer','Die Trefferquote sinkt, weil sich die Realität ändert','Die Datei wird beschädigt'],1,'Gegenmittel sind Überwachung und regelmäßiges Nachtraining.'],
['m30-l1','In welche Risikoklasse fällt ein System zur Kreditwürdigkeitsprüfung?',['Minimales Risiko','Hohes Risiko','Verboten'],1,'Zugang zu wesentlichen Leistungen ist Hochrisikobereich.'],
['m30-l1','Welche Pflicht gilt für Chatbots nach dem AI Act?',['Konformitätsbewertung','Transparenzpflicht','Gar keine'],1,'Nutzer müssen erkennen können, dass eine KI antwortet.'],
['m30-l1','Emotionserkennung von Beschäftigten am Arbeitsplatz ist nach AI Act …',['erlaubt mit Betriebsvereinbarung','hohes Risiko','verboten'],2,'Sie fällt unter die Praktiken mit unannehmbarem Risiko.'],
['m30-l1','Welche Pflicht wird bei Hochrisiko-KI am häufigsten erwartet?',['Verschlüsselung','Wirksame menschliche Aufsicht','Open-Source-Veröffentlichung'],1,'Dazu Dokumentation, Datenqualität und Protokollierung.'],
['m30-l2','Wie viele Risikoklassen unterscheidet der EU AI Act?',['Zwei: erlaubt und verboten','Vier: inakzeptabel, hoch, begrenzt, minimal','Drei: privat, gewerblich, staatlich'],1,'Inakzeptable Anwendungen wie Social Scoring sind vollständig verboten.'],
['m30-l2','Welcher DSGVO-Grundsatz steht im Konflikt mit dem Datenhunger des Trainings?',['Datenminimierung','Verfügbarkeit','Portabilität'],0,'Ebenso die Zweckbindung, wenn Bestandsdaten umgewidmet werden.'],
['m30-l2','Wann greift § 87 BetrVG bei KI?',['Nie','Wenn das System Verhalten oder Leistung von Beschäftigten überwachen kann','Nur bei über 500 Mitarbeitern'],1,'Dann besteht ein Mitbestimmungsrecht des Betriebsrats.'],
['m30-l3','Ist ein rein KI-erzeugter Text in Deutschland urheberrechtlich geschützt?',['Ja, der Nutzer ist Urheber','Nein, es fehlt die persönliche geistige Schöpfung','Ja, der Anbieter ist Urheber'],1,'Erst eine eigene schöpferische Bearbeitung begründet Schutz.'],
['m30-l3','Wer haftet, wenn ein KI-System eine folgenreiche Fehlentscheidung trifft?',['Das Modell selbst','Der Betreiber, der es einsetzt','Niemand'],1,'Deshalb gehören Freigabeprozess, Protokollierung und eine menschliche Letztentscheidung dazu.'],
['m30-l3','Wer haftet für einen Schaden durch ein KI-Ergebnis?',['Die KI selbst','Je nach Fall Anbieter, Betreiber oder Anwender','Niemand'],1,'Wer ein KI-Ergebnis ungeprüft verwendet, verantwortet es.'],
['m31-l1','Ab wie vielen Arbeitsplätzen wird Client-Server üblicherweise empfohlen?',['Ab 2','Etwa ab 10','Erst ab 100'],1,'Darunter überwiegt der Aufwand für Serverhardware, Lizenzen und Administration.'],
['m31-l2','Woran erkennt man in einer Diagnose den Hersteller eines unbekannten Geräts?',['An der IP-Adresse','An den ersten drei Byte der MAC-Adresse (OUI)','Am Hostnamen'],1,'Die OUI ist die weltweit vergebene Herstellerkennung.'],
['m31-l3','Wie viel Nutzlast bleibt bei 1.500 Byte MTU nach IP- und TCP-Header?',['1.500 Byte','1.460 Byte','1.480 Byte'],1,'Je 20 Byte für IP und TCP — deshalb erreicht keine Leitung ihre Bruttorate.'],
['m31-l4','Ein Switch mit 24 Ports — wie viele Kollisionsdomänen entstehen?',['Eine','24','Keine'],1,'Jeder Port bildet eine eigene. Ein Hub hätte dagegen eine einzige große.'],
['m31-l5','Warum kann ein Browser mehrere Verbindungen zum selben Server öffnen?',['Er nutzt mehrere IP-Adressen','Die Quellports unterscheiden sich, das Socket-Paar bleibt eindeutig','Das geht nicht'],1,'Eine Verbindung wird durch Quell-IP, Quell-Port, Ziel-IP und Ziel-Port beschrieben.'],
['m32-l1','Ein Unternehmen verschlüsselt Maschinendaten ohne Personenbezug. Was ist das?',['Datenschutz','Datensicherheit','Beides'],1,'Ohne Personenbezug ist die DSGVO gar nicht einschlägig.'],
['m32-l2','Was kostet eine Auskunft nach Art. 15 DSGVO den Betroffenen?',['Eine Bearbeitungsgebühr','Nichts, sie ist grundsätzlich kostenlos','Nur die Portokosten'],1,'Erst bei offenkundig exzessiven Wiederholungen ist ein Entgelt möglich.'],
['m32-l3','Wer trägt die datenschutzrechtliche Verantwortung im Unternehmen?',['Der Datenschutzbeauftragte','Die Geschäftsleitung — der DSB berät und überwacht nur','Die IT-Abteilung'],1,'Deshalb ist der DSB weisungsfrei und darf nicht selbst entscheiden.'],
['m32-l4','Welche Regelung ist für den Arbeitgeber am ungünstigsten?',['Private Nutzung ausdrücklich verboten','Gar keine Regelung, also stillschweigende Duldung','Private Nutzung ausdrücklich erlaubt'],1,'Die Duldung wirkt wie eine Erlaubnis, ohne dass Grenzen vereinbart wurden.'],
['m33-l1','Warum sind biometrische Merkmale besonders schützenswert?',['Sie sind ungenau','Sie lassen sich nach einem Leck nicht ändern','Sie sind teuer zu erfassen'],1,'Deshalb fallen sie unter Art. 9 DSGVO und werden nur als Template gespeichert.'],
['m33-l2','Was ist ein Berechtigungsstau?',['Zu viele Benutzer','Über Jahre angesammelte Rechte aus früheren Positionen','Ein überlasteter Server'],1,'Gegenmittel ist die regelmäßige Rezertifizierung der Berechtigungen.'],
['m33-l3','Was beschreibt ein CVE-Eintrag?',['Die Schwere einer Lücke','Eine weltweit eindeutige Kennung einer bekannten Schwachstelle','Ein Patch'],1,'Die Schwere bewertet der CVSS-Wert von 0,0 bis 10,0.'],
['m33-l4','Was unterscheidet einen Notfall von einer Störung?',['Die Uhrzeit','Der Normalbetrieb ist erheblich unterbrochen und die Standardprozesse reichen nicht mehr','Die Anzahl der Tickets'],1,'Bei einer Krise steht zusätzlich Existenz oder Ruf des Unternehmens auf dem Spiel.'],
['m34-l1','Wo liegen Objekte zur Laufzeit im Speicher?',['Auf dem Stack','Auf dem Heap — der Stack hält nur Variablen und Referenzen','In der Quelldatei'],1,'Deshalb kostet das Erzeugen vieler Objekte Speicher, das Kopieren einer Referenz dagegen kaum.'],
['m34-l2','Warum ist ein Setter für jedes Attribut kein guter Entwurf?',['Er kostet Rechenzeit','Er ist nur ein umständlich verpacktes öffentliches Attribut ohne fachliche Regel','Setter sind verboten'],1,'Besser sind fachliche Methoden wie abheben() statt setKontostand().'],
['m34-l3','Was bedeutet das Diamantproblem?',['Zu viele Attribute','Bei Mehrfachvererbung ist unklar, welche geerbte Methode gilt','Ein Speicherleck'],1,'Deshalb erlauben die meisten Sprachen nur eine Oberklasse, aber beliebig viele Interfaces.'],
['m34-l4','Wann wählt man ein Interface statt einer abstrakten Klasse?',['Wenn gemeinsamer Zustand vorhanden ist','Wenn nur eine gemeinsame Fähigkeit beschrieben wird, die auch fachfremde Klassen haben','Immer'],1,'Rechnung, Kontoauszug und Etikett sind alle druckbar, haben aber keine sinnvolle gemeinsame Oberklasse.'],
['m34-l5','Wann gibt der Garbage Collector ein Objekt frei?',['Nach einer festen Zeit','Sobald keine Referenz mehr darauf zeigt','Beim Programmstart'],1,'Deshalb entsteht ein Speicherleck durch vergessene Referenzen, nicht durch vergessenes Freigeben.'],
['m35-l1','Wie erkennt man im Text ein Attribut statt einer eigenen Klasse?',['Es steht am Satzende','Es hat weder eigene Eigenschaften noch eigenes Verhalten','Es ist ein kurzes Wort'],1,'Bekommt „Farbe" später einen Preis und einen Lieferanten, wird sie doch zur Klasse — es entscheidet die Fachlichkeit.'],
['m35-l2','Ein Zähler soll alle erzeugten Objekte mitzählen. Wie wird er deklariert?',['Als Instanzattribut','Als statisches Attribut','Als Konstante'],1,'Er existiert genau einmal für die gesamte Klasse, nicht je Objekt.'],
['m35-l3','Was kennzeichnet eine Gottklasse?',['Sie hat sehr viele Attribute','Sie übernimmt fast die gesamte Logik, während andere Klassen nur Daten halten','Sie ist abstrakt'],1,'Das Gegenmittel ist das Single-Responsibility-Prinzip: ein Änderungsgrund je Klasse.']
];
EXTRA_CARDS.push.apply(EXTRA_CARDS, [["abap-m1-l1","Ein Algorithmus muss laut Definition unter anderem endlich sein. Was bedeutet das?",["Er darf höchstens 100 Zeilen haben","Er muss nach endlich vielen Schritten terminieren","Er darf keine Schleifen enthalten"],1,"Endlichkeit meint die Terminierung: Der Algorithmus kommt nach endlich vielen Schritten zu einem Ende."],["abap-m1-l2","Welches PAP-Symbol steht für Ein- und Ausgabe?",["Rechteck","Parallelogramm","Oval"],1,"Das Parallelogramm markiert Ein-/Ausgabe; das Rechteck steht für Verarbeitung, das Oval für Start und Ende."],["abap-m1-l4","Eine Schleife läuft von 1 bis n, darin eine zweite von 1 bis n. Welche Komplexität?",["O(n)","O(n²)","O(log n)"],1,"Zwei ineinander verschachtelte Schleifen über dieselbe Menge ergeben quadratische Laufzeit."],["abap-m1-l4","Wie viele Schritte braucht die binäre Suche bei 1024 sortierten Elementen maximal?",["1024","Etwa 10","Etwa 32"],1,"log₂(1024) = 10 — jede Halbierung entfernt die Hälfte des Suchraums."],["abap-m2-l1","Was ist ein Fremdschlüssel?",["Ein Attribut, das auf den Primärschlüssel einer anderen Tabelle verweist","Ein verschlüsseltes Feld","Der Primärschlüssel einer temporären Tabelle"],0,"Der Fremdschlüssel setzt die referenzielle Integrität einer ER-Beziehung technisch um."],["abap-m2-l2","Eine Tabelle enthält die Spalten Bestellnr, Position, Produktname, Produktgewicht. Wogegen verstößt sie?",["Gegen die 1NF","Gegen die 2NF, da Produktdaten nur von der Position abhängen","Gegen gar keine Normalform"],1,"Produktname und -gewicht hängen nicht vom vollständigen Schlüssel (Bestellnr + Position) ab — klassische Teilabhängigkeit."],["abap-m3-l2","Was liefert ein INNER JOIN, wenn die rechte Tabelle leer ist?",["Alle Zeilen der linken Tabelle","Eine leere Ergebnismenge","Einen Fehler"],1,"Ohne Treffer auf beiden Seiten bleibt beim INNER JOIN nichts übrig."],["abap-m3-l3","Wie prüft man in SQL korrekt auf einen fehlenden Wert?",["feld = NULL","feld IS NULL","feld = ''"],1,"NULL ist kein Wert, sondern das Fehlen eines Werts — Vergleiche mit = liefern immer unbekannt."],["abap-m4-l1","Was begrenzt ein WIP-Limit in Kanban?",["Die Anzahl gleichzeitig in Arbeit befindlicher Aufgaben","Die Länge eines Sprints","Die Teamgröße"],0,"Work-in-Progress-Limits erzwingen Fokus und decken Engpässe im Fluss auf."],["abap-m5-l2","Was bedeutet die Multiplizität 1..* an einem Assoziationsende?",["Genau ein Objekt","Mindestens eines, nach oben offen","Höchstens eines"],1,"1..* heißt: eins oder mehr, ohne Obergrenze."],["abap-m6-l1","Ein Feld akzeptiert Werte von 18 bis 65. Welche Grenzwerte testest du?",["Nur 18 und 65","17, 18, 65, 66","Nur 0 und 100"],1,"Die Grenzwertanalyse prüft jeweils direkt innerhalb und außerhalb der Bereichsgrenzen."],["abap-m7-l0","Welche Ausgabe erzeugt eine ausführbare Klasse in ADT?",["WRITE auf die Liste","out->write( ) in die Konsolen-View","MESSAGE im Statusbereich"],1,"IF_OO_ADT_CLASSRUN stellt über den Parameter out die Konsolenausgabe bereit."],["abap-m7-l1","Was bewirkt CLEAR bei einer Objektreferenz?",["Das Objekt wird sofort gelöscht","Die Referenz wird zurückgesetzt; das Objekt wird aufgeräumt, wenn keine Referenz mehr darauf zeigt","Alle Attribute werden auf Initialwert gesetzt"],1,"ABAP nutzt Garbage Collection: Erst wenn keine Referenz mehr existiert, wird der Speicher freigegeben."],["abap-m7-l2","Was liefert der Ausdruck VALUE #( ) für eine interne Tabelle?",["Eine Tabelle mit einer leeren Zeile","Eine leere Tabelle","Einen Laufzeitfehler"],1,"VALUE #( ) ohne Inhalt erzeugt den Initialwert des Zieltyps — bei Tabellen also eine leere Tabelle."],["abap-m8-l1","Wann lohnt sich ein HASHED-Sekundärschlüssel besonders?",["Bei vielen Einzelzugriffen über einen eindeutigen Schlüssel","Bei sortierter Ausgabe","Bei sehr kleinen Tabellen mit 5 Zeilen"],0,"Bei kleinen Tabellen überwiegt der Verwaltungsaufwand den Nutzen; der Gewinn entsteht bei vielen Zugriffen auf große Mengen."],["abap-m8-l3","Was bedeutet COMMIT WORK AND WAIT gegenüber COMMIT WORK?",["Es wartet, bis die Verbuchung abgeschlossen ist","Es verzögert den Commit um eine Sekunde","Es verwirft die Änderungen"],0,"Ohne AND WAIT läuft das Programm weiter, bevor die Verbuchung durch ist — ein direkt folgender SELECT kann dann alte Daten lesen."],["abap-m9-l1","Welche Klausel filtert in Open SQL bereits auf der Datenbank statt im Anwendungsserver?",["WHERE","Eine LOOP-Prüfung mit CHECK","Eine IF-Abfrage nach dem SELECT"],0,"Jede Filterung, die erst nach dem SELECT in ABAP passiert, hat die Daten unnötig über das Netz transportiert."],["abap-m9-l2","Was ist ein „toter\" Index?",["Ein Index, den der Optimizer nie verwendet, der aber bei jedem Schreibvorgang gepflegt werden muss","Ein Index auf einer leeren Tabelle","Ein Index, der zweimal angelegt wurde"],0,"Ungenutzte Indizes kosten Schreibperformance und Speicher, ohne Lesevorteile zu bringen."],["abap-m10-l1","Welches SOLID-Prinzip verletzt eine Klasse, die Daten liest, Preise rechnet und E-Mails versendet?",["Single Responsibility","Liskov Substitution","Interface Segregation"],0,"Drei Gründe zur Änderung in einer Klasse — das ist genau die Verletzung des Single-Responsibility-Prinzips."],["abap-m10-l4","Wann verwendet man sinnvollerweise RAISE EXCEPTION ... INTO statt eines reinen TRY/CATCH?",["Wenn man die Ausnahme protokollieren und anschließend weiterreichen will","Nie, das ist gleichbedeutend","Nur in Testklassen"],0,"Fehler zu protokollieren und trotzdem weiterzureichen ist ein verbreitetes und sinnvolles Muster."],["abap-m11-l1","Warum lassen sich virtuelle Elemente nicht auf Datenbankebene filtern?",["Weil sie erst zur Laufzeit in ABAP berechnet werden","Weil sie verschlüsselt sind","Weil sie immer NULL sind"],0,"Die Datenbank kennt den Wert nicht — er entsteht erst in der ABAP-Exit-Klasse."],["abap-m12-l1","Wozu dient das Feld %tky in RAP?",["Es ist der technische Schlüssel einer Instanz inklusive Draft-Kennzeichen","Es speichert den Benutzernamen","Es ist ein Zeitstempel"],0,"%tky (transactional key) identifiziert eine Instanz eindeutig, inklusive der Unterscheidung zwischen Draft und aktiver Instanz."],["abap-m12-l2","Was passiert bei einem ETag-Konflikt?",["Der Datensatz wird stillschweigend überschrieben","Der Update wird abgelehnt, weil zwischenzeitlich jemand anders geändert hat","Der Datensatz wird gesperrt"],1,"Genau das verhindert das Lost Update, ohne eine dauerhafte Sperre zu benötigen."],["abap-m13-l2","Warum sollte ein Value Help immer gefiltert sein?",["Aus Designgründen","Weil unbegrenzte Ergebnismengen die App spürbar langsam machen","Weil sonst keine Auswahl möglich ist"],1,"Value Helps ohne Filter laden schnell zehntausende Sätze — einer der häufigsten Gründe für gefühlte Langsamkeit."],["abap-m14-l1","Was bedeutet es, wenn eine SAP-API den Status „nicht freigegeben\" hat?",["Sie ist fehlerhaft","Sie kann sich jederzeit ohne Ankündigung ändern und darf in ABAP Cloud nicht genutzt werden","Sie ist kostenpflichtig"],1,"Nur released APIs sind Teil des stabilen Vertrags und damit upgradesicher."],["abap-m15-l1","Welche Eingabe könnte eine ungesicherte dynamische WHERE-Bedingung ausnutzen?",["Ein sehr langer Name","Eine Eingabe, die Anführungszeichen und eine zusätzliche Bedingung enthält","Ein Name mit Umlauten"],1,"Die Injection schließt das Stringliteral und hängt eigene Logik an — deshalb gehören Werte in Host-Variablen."],["abap-m16-l1","Warum ist ein kleiner, fokussierter Transport besser als ein großer Sammeltransport?",["Er transportiert schneller","Er reduziert Konfliktrisiko und macht Rückbau einzelner Änderungen möglich","Er ist im System vorgeschrieben"],1,"Kleine Einheiten lassen sich gezielt prüfen, freigeben und im Zweifel zurücknehmen."],["abap-m17-l1","Was ist ein impliziter Commit?",["Ein COMMIT WORK im Quelltext","Ein Commit, der durch einen Dialogschritt oder eine RFC-Grenze ausgelöst wird","Ein Commit durch den Datenbankadministrator"],1,"Genau hier entstehen halb geschriebene Belege, wenn man die LUW-Grenzen nicht kennt."],["abap-m17-l2","Womit übergibt man Werte über die gesamte Benutzersitzung hinweg?",["EXPORT TO MEMORY ID","SET PARAMETER ID (SAP Memory)","Eine lokale Variable"],1,"ABAP Memory gilt nur innerhalb einer Aufrufkette, SAP Memory sitzungsweit."],["abap-m18-l1","Wie findest du heraus, an welcher Stelle eine Variable überschrieben wird?",["Mit einem Watchpoint","Mit dem Pretty Printer","Mit dem Verwendungsnachweis auf die Tabelle"],0,"Der Watchpoint hält genau dann an, wenn sich der Wert ändert."],["abap-m19-l1","Warum ist ein synchroner RFC in kritischen Prozessen riskant?",["Er ist grundsätzlich unsicher","Er blockiert, bis das Zielsystem antwortet — fällt der Partner aus, hängt der Prozess","Er überträgt keine Fehler"],1,"Für entkoppelte Szenarien nutzt man qRFC/bgRFC oder ereignisbasierte Kommunikation."],["abap-m20-l3","Warum ist eine Modifikation am SAP-Standard teurer als eine Erweiterung?",["Sie ist technisch langsamer","Sie muss bei jedem Upgrade erneut manuell abgeglichen werden","Sie ist lizenzpflichtig"],1,"Erweiterungspunkte wie BAdIs existieren genau deshalb — sie überstehen Upgrades ohne Abgleich."],["java-m1-l1","Was bedeutet die Forderung, ein Algorithmus müsse endlich sein?",["Er darf höchstens 100 Zeilen haben","Er muss nach endlich vielen Schritten terminieren","Er darf keine Schleifen enthalten"],1,"Endlichkeit meint Terminierung — der Algorithmus kommt nach endlich vielen Schritten zum Ende."],["java-m1-l2","Welches PAP-Symbol steht für Ein- und Ausgabe?",["Rechteck","Parallelogramm","Oval"],1,"Das Parallelogramm markiert Ein-/Ausgabe, das Rechteck Verarbeitung, das Oval Start und Ende."],["java-m1-l4","Wie viele Schritte braucht die binäre Suche bei 1024 sortierten Elementen maximal?",["1024","Etwa 10","Etwa 32"],1,"log₂(1024) = 10 — jede Halbierung entfernt die Hälfte des Suchraums."],["java-m1-l4","Zwei verschachtelte Schleifen laufen je von 1 bis n. Wie viele Durchläufe insgesamt?",["2n","n²","n log n"],1,"Für jeden der n äußeren Durchläufe laufen n innere — quadratische Komplexität."],["java-m2-l2","Eine Tabelle enthält BestellNr, Position, Produktname und Produktgewicht. Wogegen verstößt sie?",["Gegen die 1NF","Gegen die 2NF, da die Produktdaten nur von der Position abhängen","Gegen gar keine Normalform"],1,"Klassische Teilabhängigkeit vom zusammengesetzten Schlüssel."],["java-m3-l3","Wie prüft man in SQL korrekt auf einen fehlenden Wert?",["feld = NULL","feld IS NULL","feld == NULL"],1,"NULL ist kein Wert, sondern dessen Abwesenheit — Vergleiche mit = ergeben „unbekannt\"."],["java-m4-l1","Was begrenzt ein WIP-Limit in Kanban?",["Die Anzahl gleichzeitig in Arbeit befindlicher Aufgaben","Die Länge eines Sprints","Die Teamgröße"],0,"WIP-Limits erzwingen Fokus und machen Engpässe im Arbeitsfluss sichtbar."],["java-m5-l2","Was bedeutet die Multiplizität 0..1 an einem Assoziationsende?",["Genau eines","Höchstens eines, auch keines möglich","Mindestens eines"],1,"0..1 erlaubt das Fehlen der Beziehung — in Java oft ein Optional oder ein nullbares Feld."],["java-m6-l1","Ein Feld akzeptiert Werte von 1 bis 100. Welche Grenzwerte testest du?",["Nur 1 und 100","0, 1, 100, 101","Nur 50"],1,"Die Grenzwertanalyse prüft jeweils direkt innerhalb und außerhalb der Bereichsgrenzen."],["java-m7-l1","Was ist der Unterschied zwischen JDK und JRE?",["Kein Unterschied","Das JDK enthält zusätzlich Compiler und Entwicklerwerkzeuge","Das JRE ist neuer"],1,"Zum Entwickeln brauchst du das JDK; das JRE genügt nur zum Ausführen."],["java-m7-l2","Was ergibt in Java 7 / 2 bei zwei int-Werten?",["3.5","3","Einen Kompilierfehler"],1,"Bei zwei Ganzzahlen wird ganzzahlig dividiert und der Rest abgeschnitten."],["java-m7-l2","Welcher Wert steht in a nach int[] x={1,2}; int[] y=x; y[0]=9;",["x[0] ist 1","x[0] ist 9","Es entsteht ein Fehler"],1,"Arrays sind Referenztypen — beide Variablen zeigen auf dasselbe Objekt."],["java-m7-l3","Warum liefert \"abc\" == new String(\"abc\") den Wert false?",["Weil der Inhalt unterschiedlich ist","Weil == bei Objekten die Referenz vergleicht und new ein neues Objekt erzeugt","Weil Strings nicht vergleichbar sind"],1,"Inhaltlich vergleicht man mit equals()."],["java-m7-l4","Was bewirkt das Schlüsselwort final bei einer lokalen Variablen?",["Sie kann nach der ersten Zuweisung nicht neu zugewiesen werden","Das Objekt wird unveränderlich","Sie wird statisch"],0,"final schützt die Referenz, nicht den Inhalt des referenzierten Objekts."],["java-m8-l1","Was passiert, wenn ein Konstruktor eine Exception wirft?",["Das Objekt existiert halbfertig","Es entsteht kein gültiges Objekt, die Referenz wird nicht zugewiesen","Der Konstruktor wird wiederholt"],1,"Deshalb ist der Konstruktor der richtige Ort für Validierung."],["java-m8-l2","Was bedeutet der Modifier protected?",["Zugriff nur in derselben Klasse","Zugriff im selben Paket und in Unterklassen","Zugriff von überall"],1,"private ist enger, public weiter; ohne Angabe gilt package-private."],["java-m8-l3","Kann ein Interface Felder mit veränderlichem Zustand enthalten?",["Ja, beliebig","Nein, nur Konstanten (public static final)","Nur private Felder"],1,"Zustand ist genau der Unterschied zur abstrakten Klasse."],["java-m8-l4","Was ist bei einem record automatisch unveränderlich?",["Nur der Konstruktor","Alle Komponenten, sie erhalten final-Felder","Nichts"],1,"Records sind als unveränderliche Datenträger konzipiert."],["java-m9-l1","Welche Collection eignet sich, wenn Reihenfolge UND Eindeutigkeit gefordert sind?",["HashSet","LinkedHashSet","ArrayList"],1,"LinkedHashSet verhindert Duplikate und bewahrt die Einfügereihenfolge."],["java-m9-l2","Was passiert, wenn equals überschrieben wird, hashCode aber nicht?",["Nichts","Das Objekt wird in HashSet und HashMap nicht wiedergefunden","Der Code kompiliert nicht"],1,"Die Hash-basierten Sammlungen suchen dann im falschen Bucket."],["java-m9-l3","Warum lässt sich verarbeite(List<String>) und verarbeite(List<Integer>) nicht überladen?",["Wegen Type Erasure haben beide zur Laufzeit dieselbe Signatur","Weil Java keine Überladung kennt","Weil List nicht generisch ist"],0,"Nach dem Löschen der Typinformation sind die Methoden nicht mehr unterscheidbar."],["java-m9-l4","Was löst eine ConcurrentModificationException typischerweise aus?",["Zwei Threads","Das Entfernen eines Elements während einer for-each-Schleife","Ein zu großes Array"],1,"Der Iterator erkennt die strukturelle Änderung und bricht bewusst ab (Fail-Fast)."],["java-m10-l1","Welche Exception-Art muss der Compiler behandelt sehen?",["RuntimeException","Checked Exception","Error"],1,"Checked Exceptions erzwingen catch oder throws."],["java-m10-l2","Was passiert bei try-with-resources, wenn close() ebenfalls eine Exception wirft?",["Sie überschreibt die ursprüngliche","Sie wird als suppressed exception angehängt","Sie wird ignoriert"],1,"So bleibt der ursprüngliche Fehler erhalten und sichtbar."],["java-m11-l1","Wofür steht die Methodenreferenz String::isBlank?",["Für ein Lambda s -> s.isBlank()","Für einen Konstruktoraufruf","Für eine statische Variable"],0,"Methodenreferenzen sind die Kurzform für Lambdas, die nur eine Methode aufrufen."],["java-m11-l2","Was passiert bei einer Stream-Pipeline ohne terminale Operation?",["Sie läuft sofort","Es passiert gar nichts, da intermediäre Operationen lazy sind","Es gibt einen Kompilierfehler"],1,"Erst die terminale Operation stößt die Verarbeitung an."],["java-m11-l4","Was ist der Unterschied zwischen orElse und orElseGet?",["Kein Unterschied","orElse wertet sein Argument immer aus, orElseGet nur bei leerem Optional","orElseGet wirft eine Exception"],1,"Bei teuren Fallbacks ist das ein echter Performanceunterschied."],["java-m12-l1","Wodurch entsteht in Java typischerweise ein Memory Leak?",["Durch vergessenes free()","Durch Referenzen, die unnötig gehalten werden, etwa in statischen Sammlungen","Durch zu viele Klassen"],1,"Die Garbage Collection räumt nur auf, was nicht mehr erreichbar ist."],["java-m12-l3","Warum ist Long summe = 0L in einer Millionenschleife problematisch?",["Es kompiliert nicht","Jede Addition erzeugt durch Autoboxing ein neues Objekt","Long kann nicht addieren"],1,"Der Wrapper-Typ erzwingt Boxing und Unboxing bei jedem Schritt."],["java-m13-l2","Was garantiert volatile?",["Atomare Operationen","Nur die Sichtbarkeit von Änderungen zwischen Threads","Gegenseitigen Ausschluss"],1,"Für atomares Hochzählen braucht es AtomicInteger oder synchronized."],["java-m13-l3","Wie viele Threads sind für rein rechenintensive Aufgaben sinnvoll?",["So viele wie möglich","Etwa so viele wie Prozessorkerne","Immer genau einer"],1,"Mehr Threads bringen bei reiner Rechenlast nur Kontextwechsel."],["java-m14-l1","Welcher Typ eignet sich für einen gespeicherten Zeitstempel?",["LocalDateTime","Instant (UTC)","LocalTime"],1,"Instant ist zeitzonenunabhängig und damit eindeutig — lokale Zeiten brechen bei der Zeitumstellung."],["java-m14-l2","Warum sollte beim Dateizugriff das Encoding explizit angegeben werden?",["Um Speicher zu sparen","Weil sonst plattformabhängig kodiert wird und Umlaute brechen","Weil UTF-8 langsamer ist"],1,"Der Klassiker: lokal korrekt, auf dem Server zerschossen."],["java-m15-l1","Was prüft assertThrows?",["Dass kein Fehler auftritt","Dass eine bestimmte Exception geworfen wird","Die Ausführungszeit"],1,"Der geworfene Fehler lässt sich zusätzlich auf seine Meldung prüfen."],["java-m15-l3","Was sagt eine hohe Code Coverage NICHT aus?",["Welche Zeilen ausgeführt wurden","Dass das Verhalten tatsächlich geprüft wurde","Welcher Code erreichbar ist"],1,"Ein Test ohne Assertion erzeugt Abdeckung, aber keine Sicherheit."],["java-m16-l1","Was bedeutet der Scope provided in Maven?",["Die Abhängigkeit wird zur Laufzeit von der Umgebung bereitgestellt","Sie wird nie gebraucht","Sie gilt nur für Tests"],0,"Typisch für Bibliotheken, die der Applikationsserver mitbringt."],["java-m16-l2","Warum Platzhalter {} statt String-Konkatenation im Logaufruf?",["Aus Stilgründen","Weil die Auswertung nur bei aktivem Level erfolgt","Weil + nicht erlaubt ist"],1,"Das spart bei deaktiviertem DEBUG-Level messbar Rechenzeit."],["java-m17-l1","Warum schützt PreparedStatement vor SQL-Injection?",["Es entfernt Sonderzeichen","Es trennt SQL-Struktur von Daten, Parameter ändern die Abfragelogik nicht","Es verschlüsselt die Abfrage"],1,"Die Abfrage wird geparst, bevor die Parameter eingesetzt werden."],["java-m17-l2","Was bedeutet Autocommit in JDBC?",["Nichts wird gespeichert","Jede einzelne Anweisung wird sofort festgeschrieben","Alles wird beim Schließen geschrieben"],1,"Für mehrteilige fachliche Einheiten muss Autocommit abgeschaltet werden."],["java-m18-l1","Welcher Teil eines Stacktrace nennt die eigentliche Ursache?",["Die erste at-Zeile","Das unterste \"Caused by\"","Die letzte Zeile der Datei"],1,"Verschachtelte Ursachen stehen von außen nach innen — ganz unten die Wurzel."],["java-m19-l1","Welches SOLID-Prinzip verletzt eine Klasse, die Daten lädt, rechnet und E-Mails verschickt?",["Single Responsibility","Liskov Substitution","Interface Segregation"],0,"Drei Gründe zur Änderung in einer Klasse."],["java-m19-l3","Was ist die Voraussetzung für sicheres Refactoring?",["Eine gute IDE","Tests, die das bestehende Verhalten absichern","Ein Code-Review"],1,"Ohne Tests kann niemand belegen, dass sich das Verhalten nicht geändert hat."],["java-m20-l1","Warum liefert Integer a=127,b=127; a==b true, bei 128 aber false?",["Wegen eines Compilerfehlers","Java cacht Integer von -128 bis 127, darüber entstehen neue Objekte","Weil 128 zu groß für int ist"],1,"Genau deshalb dürfen Wrapper-Typen nie mit == verglichen werden."],["java-m20-l2","Womit speichert man Passwörter korrekt?",["MD5","SHA-256 ohne Salt","bcrypt, scrypt oder Argon2 mit Salt"],2,"Bewusst langsame Verfahren mit Salt machen massenhaftes Durchprobieren unwirtschaftlich."],["java-m20-l3","Was muss beim Fangen einer InterruptedException geschehen?",["Nichts weiter","Den Interrupt-Status mit Thread.currentThread().interrupt() wiederherstellen","Den Thread sofort beenden"],1,"Sonst geht das Abbruchsignal verloren und übergeordnete Schichten können nicht sauber herunterfahren."],["java-m21-l1","Was macht die Annotation @SpringBootApplication?",["Sie startet einen Webserver","Sie bündelt @Configuration, @EnableAutoConfiguration und @ComponentScan","Sie erzeugt die Datenbank"],1,"Eine Annotation für die drei Bausteine, die jede Spring-Boot-Anwendung braucht."],["java-m21-l2","Welche Stereotyp-Annotation kennzeichnet eine Geschäftslogik-Bean?",["@Entity","@Service","@Configuration"],1,"@Service ist eine Spezialisierung von @Component für die Serviceschicht."],["java-m21-l2","Welchen Scope hat eine Spring-Bean standardmäßig?",["prototype","singleton","request"],1,"Eine Instanz pro Container — deshalb müssen Beans zustandslos sein."],["java-m21-l3","Wie aktiviert man ein Spring-Profil von außen?",["Durch Neukompilieren","Über die Umgebungsvariable SPRING_PROFILES_ACTIVE","Gar nicht"],1,"So wandert dasselbe Artefakt unverändert durch alle Umgebungen."],["java-m22-l1","Welcher Statuscode gehört zu einem erfolgreichen DELETE ohne Rückgabeinhalt?",["200","204","404"],1,"204 No Content signalisiert Erfolg ohne Antwortkörper."],["java-m22-l1","Wie benennt man REST-Ressourcen sinnvoll?",["Als Verben wie /getBestellung","Als Substantive im Plural wie /bestellungen/42","Als Abkürzungen"],1,"Die Aktion steckt bereits in der HTTP-Methode."],["java-m22-l2","Was löst eine fehlgeschlagene Bean Validation im Controller aus?",["Eine MethodArgumentNotValidException","Einen Kompilierfehler","Ein stilles Ignorieren"],0,"Sie wird üblicherweise zentral im @RestControllerAdvice auf 400 abgebildet."],["java-m22-l3","Welche Schicht darf HTTP-Typen wie ResponseEntity kennen?",["Der Service","Nur der Controller","Das Repository"],1,"Ein sauberer Service ist auch aus einem Batchlauf heraus aufrufbar."],["java-m23-l1","Woraus leitet Spring Data die Abfrage einer Repository-Methode ab?",["Aus dem Methodennamen oder einer @Query-Annotation","Aus dem Rückgabetyp","Aus dem Klassennamen"],0,"findByStatusOrderByDatumDesc wird direkt in eine Abfrage übersetzt."],["java-m23-l2","Wo gehört @Transactional üblicherweise hin?",["An das Repository","An die Serviceschicht","An den Controller"],1,"Erst die Geschäftsoperation bildet die fachliche Einheit."],["java-m23-l2","Warum hat @Transactional an einer privaten Methode keine Wirkung?",["Weil private Methoden zu schnell sind","Weil der Proxy-Mechanismus nur öffentliche Methoden abfangen kann","Weil Spring das verbietet"],1,"Beim Standard-Proxy greift der Transaktionsinterzeptor nur bei öffentlichen Aufrufen von außen."],["java-m23-l3","Wodurch unterscheidet sich eine Projektion von einer Entity-Abfrage?",["Sie lädt nur die benötigten Felder statt ganzer Entities","Sie ist immer sortiert","Sie umgeht die Datenbank"],0,"Weniger Daten, keine Lazy-Beziehungen — oft die sauberste Lösung gegen N+1."],["java-m24-l1","Welche Testart eignet sich zum Prüfen eines Repositorys?",["@WebMvcTest","@DataJpaTest","Plain JUnit ohne Spring"],1,"@DataJpaTest lädt nur die Persistenzschicht samt Testdatenbank."],["java-m24-l2","Wann ist das Abschalten von CSRF vertretbar?",["Immer","Bei zustandslosen Token-APIs ohne Cookie-Sitzungen","Nie"],1,"Bei formularbasierten Sitzungen mit Cookies ist CSRF-Schutz dagegen zwingend."],["java-m24-l3","Was unterscheidet Liveness von Readiness?",["Kein Unterschied","Liveness fragt, ob der Prozess läuft; Readiness, ob er gerade Anfragen bedienen kann","Readiness startet den Container neu"],1,"Externe Abhängigkeiten gehören in Readiness, nie in Liveness."]]);
var RP_LITERAL_3=window.RP_LITERALS[3];
var RP_EXTRA_REVISIONS=RP_LITERAL_3;
RP_EXTRA_REVISIONS.forEach(function(item){
 var index=Number(item.extraId.slice(2));
 var old=EXTRA_CARDS[index];
 if(!old||old[0]!==item.lesson)throw new Error('Zusatzkarte falsch zugeordnet: '+item.extraId);
 EXTRA_CARDS[index]=[item.lesson,item.q,item.options,item.correct,item.explain];
});
EXTRA_CARDS.forEach(function(row, idx){
  var lid = row[0];
  var mod = MODULES.find(function(m){ return m.lessons.some(function(l){ return l.id === lid; }); });
  if(!mod) return;
  var les = mod.lessons.find(function(l){ return l.id === lid; });
  CARDS.push({ id:'x#'+idx+(typeof RP_EXTRA_REVISIONS!=='undefined'&&RP_EXTRA_REVISIONS.some(function(q){return q.extraId==='x#'+idx;})?'@2026-11-07-full-v3':''), q:row[1], options:row[2], correct:row[3], explain:row[4],
               lessonId:lid, lessonTitle:les.title, moduleTitle:mod.title, part:mod.part });
});
var PARTS = [];
MODULES.forEach(function(m){ if(PARTS.indexOf(m.part) === -1) PARTS.push(m.part); });
var CARD_BY_ID = {};
CARDS.forEach(function(c){ CARD_BY_ID[c.id] = c; });
var RP_QUIZ_CONTRACTS=[];
var RP_QUIZ_CONTRACT_BY_ID={};
var VERSION = '2.4';
var VERSION_DATUM = '2026-10-09';
var DAY = 86400000;
var DIAGRAMME = (function(){
  /* Aufgeteilte Auslieferung: Die Texte laden erst beim Öffnen, die Zahl kommt aus dem Build (learning-manifest.json, stats.figures). */
  if(window.RP_BODY_STATS && typeof window.RP_BODY_STATS.figures === 'number') return window.RP_BODY_STATS.figures;
  var n = 0;
  MODULES.forEach(function(m){ m.lessons.forEach(function(l){
    n += (String(l.body || "").match(/<figure class="fig">/g) || []).length;
  }); });
  return n;
})();
function today0(){ var d = new Date(); d.setHours(0,0,0,0); return d.getTime(); }
var state = {
  currentId:'heute',
  /* Felder der spaeteren Ausbaustufen - vollstaendig initialisiert,
     damit kein Zugriff auf undefined laufen kann. */
  notizen:{}, merkzettel:{}, klausuren:[], ueTexte:{},
  kalib:{},        /* 'sicher'|'unsicher'|'geraten' -> {n, r} */
  erklaerungen:{}, /* lessonId -> {text, punkte, treffer, fehlt, tipp, ts} */
  tutorFragen:0, subnetSolved:0, tagesziel:3, pruefungsdatum:'',
  dayCount:null,
  completed:new Set(),
  srs:{},          /* cardId -> {ease, iv, due, reps, lapses} */
  stats:{},        /* cardId -> {right, wrong} */
  exams:[],        /* [{ts, score, total, byPart}] */
  xp:0,
  xpLog:{},        /* einmalige XP-Vergaben */
  badges:{},       /* badgeId -> Zeitstempel */
  streak:{ last:null, count:0, best:0 },
  solved:{},       /* exerciseId -> Zeitstempel */
  tracesDone:[],   /* abgeschlossene Trockendurchläufe */
  cardsToday:{ day:null, n:0 }
};
var db = null;
var STORAGE_KEY = window.RP_BOOT_USER ? 'rootpfad-user-'+window.RP_BOOT_USER.id+'-progress' : 'ap1-expertenpfad-progress-v1';
function srsOf(id){ return state.srs[id] || null; }
function dueCards(){
  var t = today0() + DAY - 1;
  return CARDS.filter(function(c){
    var s = state.srs[c.id];
    return s && s.due <= t;
  });
}
function newCards(){ return CARDS.filter(function(c){ return !state.srs[c.id]; }); }
function rateCard(id, rating){
  var s = state.srs[id] || { ease:2.5, iv:0, due:today0(), reps:0, lapses:0 };
  if(rating === 0){
    s.ease = Math.max(1.3, s.ease - 0.20);
    s.iv = 0; s.lapses++; s.reps = 0;
    s.due = today0();
  } else {
    s.reps++;
    if(rating === 1){ s.ease = Math.max(1.3, s.ease - 0.15); s.iv = s.iv ? Math.max(1, Math.round(s.iv * 1.2)) : 1; }
    else if(rating === 2){ s.iv = s.reps === 1 ? 1 : (s.reps === 2 ? 3 : Math.round(s.iv * s.ease)); }
    else { s.ease = Math.min(3.2, s.ease + 0.15); s.iv = s.reps === 1 ? 3 : Math.round(s.iv * s.ease * 1.3); }
    s.iv = Math.min(s.iv, 365);
    s.due = today0() + s.iv * DAY;
  }
  s.ts = Date.now();
  state.srs[id] = s;
  saveProgress();
}
function recordAnswer(id, correct){
  var st = state.stats[id] || { right:0, wrong:0 };
  if(correct){ st.right++; } else { st.wrong++; }
  state.stats[id] = st;
}
function weakModules(){
  var agg = {};
  CARDS.forEach(function(c){
    var st = state.stats[c.id];
    if(!st) return;
    var a = agg[c.moduleTitle] || (agg[c.moduleTitle] = { right:0, wrong:0, lessonId:c.lessonId });
    a.right += st.right; a.wrong += st.wrong;
  });
  return Object.keys(agg).map(function(k){
    var a = agg[k], tot = a.right + a.wrong;
    return { title:k, rate: tot ? a.right / tot : 1, total:tot, lessonId:a.lessonId };
  }).filter(function(x){ return x.total >= 2 && x.rate < 0.8; })
    .sort(function(a,b){ return a.rate - b.rate; });
}
var RANKS = [
  { lvl:1,  name:'Kabelträger',                  xp:0,     icon:'🔌' },
  { lvl:2,  name:'Strg-C-Virtuose',              xp:150,   icon:'📋' },
  { lvl:3,  name:'Ticket-Bändiger',              xp:400,   icon:'🎟️' },
  { lvl:4,  name:'Der mit dem Subnetz tanzt',    xp:850,   icon:'🕺' },
  { lvl:5,  name:'Netzplan-Flüsterer',           xp:1500,  icon:'🧭' },
  { lvl:6,  name:'Normalform-Fanatiker',         xp:2400,  icon:'📐' },
  { lvl:7,  name:'Wandelnder Prüfungskatalog',   xp:3600,  icon:'📚' },
  { lvl:8,  name:'Schrecken aller Prüfer',       xp:5200,  icon:'👑' },
  { lvl:9,  name:'Halbgott in Ethernet',         xp:7200,  icon:'⚡' },
  { lvl:10, name:'Legende der Berufsschule',     xp:9800,  icon:'💎' },
  { lvl:11, name:'Flüsterer der Fremdschlüssel',xp:12800, icon:'🗝️' },
  { lvl:12, name:'Herr der Ringpuffer',          xp:16400, icon:'🌀' },
  { lvl:13, name:'Pate der Patchfelder',         xp:20600, icon:'🧶' },
  { lvl:14, name:'Kanzler der Kapselung',        xp:25500, icon:'🏛️' },
  { lvl:15, name:'Sensei der Struktogramme',     xp:31200, icon:'🥋' },
  { lvl:16, name:'Doktor der Datenschutzgrundverordnung', xp:37800, icon:'⚖️' },
  { lvl:17, name:'Magier des magischen Dreiecks',xp:45400, icon:'🔮' },
  { lvl:18, name:'Baron von Bit und Byte',       xp:54100, icon:'🧩' },
  { lvl:19, name:'Großmeister der Grauzone',     xp:64000, icon:'🧙' },
  { lvl:20, name:'Ehrenfachinformatiker',        xp:75000, icon:'🌟' }
];
function rankFor(xp){
  var r = RANKS[0];
  for(var i = 0; i < RANKS.length; i++){ if(xp >= RANKS[i].xp) r = RANKS[i]; }
  return r;
}
function nextRank(xp){
  for(var i = 0; i < RANKS.length; i++){ if(xp < RANKS[i].xp) return RANKS[i]; }
  return null;
}
function levelProgress(){
  var xp = state.xp || 0, cur = rankFor(xp), nxt = nextRank(xp);
  if(!nxt) return { cur:cur, nxt:null, pct:100, need:0 };
  var span = nxt.xp - cur.xp;
  return { cur:cur, nxt:nxt, pct: Math.round(((xp - cur.xp) / span) * 100), need: nxt.xp - xp };
}
var BADGES = [
  { id:'klausur_bestanden', icon:'✍️', name:'Mitgeschrieben',      desc:'Eine Mitschreib-Prüfung mit mindestens 50 Prozent bestanden.' },
  { id:'klausur_glanz',     icon:'🏵️', name:'Korrektor sprachlos', desc:'Eine Mitschreib-Prüfung mit mindestens 90 Prozent.' },
  { id:'netzwerker',  icon:'🌐', name:'Netzwerker',           desc:'Netzwerkgrundlagen komplett. Du weißt jetzt, warum es zwei Adressen braucht.' },
  { id:'objektifiziert',icon:'🧱', name:'Objektifiziert',       desc:'Objektorientierung komplett. Klasse ist nicht gleich Objekt — und du weißt es.' },
  { id:'datenschuetzer',icon:'🛡️', name:'Datenschützer',        desc:'Datenschutz und Datensicherheit komplett. Art. 22 sitzt.' },
  { id:'kapselkoenig',icon:'🧬', name:'König der Kapselung',  desc:'Alle Fragen zur Objektorientierung fehlerfrei beantwortet.' },
  { id:'quizmeister', icon:'🎯', name:'Quizmeister',          desc:'100 Quizfragen richtig beantwortet.' },
  { id:'quizlegende', icon:'🎖️', name:'Quizlegende',          desc:'250 Quizfragen richtig beantwortet. Respekt.' },
  { id:'tutor_fan',   icon:'💬', name:'Fragensteller',        desc:'Den AP1-Tutor zum ersten Mal befragt.' },
  { id:'tutor_profi', icon:'🧠', name:'Dauergast beim Tutor', desc:'25 Fragen an den AP1-Tutor gestellt.' },
  { id:'marathon',    icon:'🏅', name:'Marathonläufer',       desc:'25 Lektionen an einem einzigen Tag. Das war viel.' },
  { id:'allrounder',  icon:'🧿', name:'Allrounder',           desc:'In allen neun Kursteilen mindestens ein Modul abgeschlossen.' },
  { id:'night_owl',   icon:'🦉', name:'Nachteule',            desc:'Zwischen 0 und 5 Uhr eine Lektion abgeschlossen. Schlaf wird überschätzt.' },
  { id:'early_bird',  icon:'🐓', name:'Der frühe Vogel',      desc:'Vor 6 Uhr gelernt. Respekt.' },
  { id:'weekend',     icon:'🏖️', name:'Wochenendkrieger',     desc:'Am Samstag oder Sonntag gelernt, statt zu leben.' },
  { id:'sitzfleisch', icon:'🪑', name:'Sitzfleisch',          desc:'10 Lektionen an einem einzigen Tag. Steh mal auf.' },
  { id:'subnet50',    icon:'🎪', name:'Subnetz-Dompteur',     desc:'50 Subnetting-Aufgaben richtig. /26 hat jetzt Angst vor dir.' },
  { id:'subnet_serie',icon:'🔥', name:'Auf der Rolle',        desc:'10 Subnetting-Aufgaben am Stück ohne Fehler.' },
  { id:'kabelsalat',  icon:'🧶', name:'Kabelsalat entwirrt',  desc:'Die komplette Netzwerktechnik durchgearbeitet.' },
  { id:'paragraph',   icon:'⚖️', name:'Paragraphenreiter',    desc:'IT-Sicherheit und Datenschutz komplett. Die DSGVO ist stolz.' },
  { id:'erbsenzaehler',icon:'🪙', name:'Erbsenzähler',        desc:'Projektmanagement und Wirtschaft komplett. Skonto vom Zieleinkaufspreis, immer.' },
  { id:'maschinist',  icon:'🤖', name:'Maschinenversteher',   desc:'Den kompletten KI-Teil geschafft. Ganz ohne Halluzination.' },
  { id:'schrauber',   icon:'🔧', name:'Schrauber',            desc:'Hardware und Arbeitsplatz komplett. Du weißt jetzt, was VA sind.' },
  { id:'dickkopf',    icon:'🪨', name:'Dickkopf',             desc:'Eine Karte dreimal verhauen und trotzdem nicht aufgegeben.' },
  { id:'phoenix',     icon:'🦩', name:'Phönix',              desc:'Nach einer verhauenen Prüfung direkt eine bestanden.' },
  { id:'nervenstark', icon:'🧊', name:'Nervenstark',          desc:'Eine Prüfung in der letzten Minute noch bestanden.' },
  { id:'streber',     icon:'👓', name:'Streber',              desc:'30 Tage in Folge gelernt. Deine Freunde vermissen dich.' },
  { id:'komplettist', icon:'🧹', name:'Komplettist',          desc:'Jede einzelne Auszeichnung vor dieser hier geholt.' },
  { id:'first_lesson', icon:'📗', name:'Erster Schritt',      desc:'Eine Lektion abgeschlossen.' },
  { id:'first_trace',  icon:'⚡', name:'Trockenschwimmer',    desc:'Einen Algorithmus komplett durchgespielt.' },
  { id:'all_traces',   icon:'🔬', name:'Spurenleser',         desc:'Alle Trockendurchläufe gemeistert.' },
  { id:'exam_pass',    icon:'🎯', name:'Bestanden',           desc:'Eine Prüfung mit mindestens 70 %.' },
  { id:'exam_ace',     icon:'🏆', name:'Glanzleistung',       desc:'Eine Prüfung mit mindestens 90 %.' },
  { id:'exam_perfect', icon:'💯', name:'Fehlerfrei',          desc:'Eine Prüfung ohne einen einzigen Fehler.' },
  { id:'streak3',      icon:'🔥', name:'Dranbleiber',         desc:'3 Tage in Folge gelernt.' },
  { id:'streak7',      icon:'🌟', name:'Gewohnheitstier',     desc:'7 Tage in Folge gelernt.' },
  { id:'cards25',      icon:'🧠', name:'Gedächtnistraining',  desc:'25 Karten an einem Tag wiederholt.' },
  { id:'module_done',  icon:'📦', name:'Modul im Kasten',     desc:'Ein komplettes Modul abgeschlossen.' },
  { id:'part1_done',   icon:'🎓', name:'AP1-bereit',          desc:'Alle Module aus Teil I abgeschlossen.' },
  { id:'subnet10',     icon:'🧮', name:'Subnetz-Rechner',     desc:'10 Subnetting-Aufgaben richtig geloest.' },
  { id:'solver5',      icon:'🧪', name:'Praktiker',           desc:'5 Übungsaufgaben als gelöst markiert.' },
  { id:'half_way',     icon:'⛰️', name:'Halbzeit',            desc:'Die Hälfte aller Lektionen geschafft.' },
  { id:'all_lessons',  icon:'💎', name:'Durchgearbeitet',     desc:'Alle Lektionen abgeschlossen.' },
  { id:'explorer',     icon:'🧭', name:'Kundschafter',        desc:'In jedem Kursteil mindestens eine Lektion begonnen.' },
  { id:'deep_work',    icon:'📚', name:'Zehnerpack',          desc:'10 Lektionen abgeschlossen.' },
  { id:'xp1000',       icon:'⭐', name:'Tausender',           desc:'1.000 XP gesammelt.' },
  { id:'xp3000',       icon:'✨', name:'Dreitausender',       desc:'3.000 XP gesammelt.' },
  { id:'streak14',     icon:'📅', name:'Zwei Wochen am Stück',desc:'14 Tage in Folge gelernt.' },
  { id:'cards50',      icon:'🏃', name:'Karten-Marathon',     desc:'50 Karten an einem Tag wiederholt.' },
  { id:'comeback',     icon:'🔁', name:'Ausgebügelt',         desc:'Eine zuvor falsch beantwortete Karte sicher gewusst.' },
  { id:'speedster',    icon:'⚡', name:'Souverän',            desc:'Prüfung bestanden mit mehr als der Hälfte der Zeit übrig.' },
  { id:'all_exercises',icon:'🛠️', name:'Alles gelöst',        desc:'Alle Übungsaufgaben als gelöst markiert.' },
  { id:'expert_solver',icon:'🧠', name:'Expertenstufe',       desc:'Alle Aufgaben der Stufe „Experte" gelöst.' },
  { id:'all_parts',    icon:'🏅', name:'Vollständig',         desc:'Alle Kursteile vollständig abgeschlossen.' }
];
var BADGE_BY_ID = {};
BADGES.forEach(function(b){ BADGE_BY_ID[b.id] = b; });
function todayKey(){
  var d = new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function bumpStreak(){
  var t = todayKey();
  var s = state.streak;
  if(s.last === t) return;
  var y = new Date(); y.setDate(y.getDate() - 1);
  var yKey = y.getFullYear()+'-'+String(y.getMonth()+1).padStart(2,'0')+'-'+String(y.getDate()).padStart(2,'0');
  s.count = (s.last === yKey) ? s.count + 1 : 1;
  s.last = t;
  s.best = Math.max(s.best || 0, s.count);
  if(s.count >= 3) grantBadge('streak3');
  if(s.count >= 7) grantBadge('streak7');
  if(s.count >= 14) grantBadge('streak14');
  if(s.count >= 30) grantBadge('streber');
}
var toastQueue = [];
function showToast(html, cls){
  var host = document.getElementById('toastHost');
  if(!host) return;
  var el = document.createElement('div');
  el.className = 'toast' + (cls ? ' ' + cls : '');
  el.innerHTML = html;
  host.appendChild(el);
  setTimeout(function(){ el.classList.add('out'); }, 2600);
  setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 3100);
}
var XP_FAKTOR = 2;
function xpAnzeige(basis){ return basis * XP_FAKTOR; }
function awardXp(amount, reason, once){
  if(once){
    if(state.xpLog[once]) return 0;
    state.xpLog[once] = 1;
  }
  amount = xpAnzeige(amount);
  var before = rankFor(state.xp || 0).lvl;
  state.xp = (state.xp || 0) + amount;
  bumpStreak();
  var after = rankFor(state.xp).lvl;
  showToast('<span class="t-xp">+'+amount+' XP</span><span class="t-reason">'+esc(reason)+'</span>');
  if(state.xp >= 1000) grantBadge('xp1000');
  if(state.xp >= 3000) grantBadge('xp3000');
  if(after > before) celebrateLevel(rankFor(state.xp));
  updateXpBar();
  saveProgress();
  return amount;
}
function grantBadge(id){
  if(state.badges[id]) return;
  var b = BADGE_BY_ID[id];
  if(!b) return;
  state.badges[id] = Date.now();
  showToast('<span class="t-xp">'+b.icon+' Abzeichen</span><span class="t-reason">'+esc(b.name)+'</span>', 'badge');
  state.xp = (state.xp || 0) + xpAnzeige(25);
  updateXpBar();
  saveProgress();
}
function fokusElemente(wurzel){
  var sel = 'a[href], button:not([disabled]), input:not([disabled]), '+
            'textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.prototype.slice.call(wurzel.querySelectorAll(sel)).filter(function(el){
    return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
  });
}
function fokusFalle(wurzel, ev){
  if(ev.key !== 'Tab') return false;
  var f = fokusElemente(wurzel);
  if(!f.length) return false;
  var erst = f[0], letzt = f[f.length - 1];
  if(ev.shiftKey && document.activeElement === erst){ ev.preventDefault(); letzt.focus(); return true; }
  if(!ev.shiftKey && document.activeElement === letzt){ ev.preventDefault(); erst.focus(); return true; }
  return false;
}
function celebrateLevel(rank){
  var host = document.getElementById('toastHost');
  if(!host) return;
  var vorher = document.activeElement;
  var el = document.createElement('div');
  el.className = 'levelup';
  el.innerHTML = '<div class="lu-card" role="dialog" aria-modal="true" aria-label="Aufgestiegen">'+
    '<div class="lu-icon" aria-hidden="true">'+rank.icon+'</div>'+
    '<div class="lu-lbl">Aufgestiegen</div>'+
    '<div class="lu-name">'+esc(rank.name)+'</div>'+
    '<div class="lu-stufe">Level '+rank.lvl+' von '+RANKS.length+'</div>'+
    '<button class="check-btn" id="luWeiter" type="button">Weiter</button></div>';
  function luSchliessen(){
    el.remove();
    try{ if(vorher && vorher.focus) vorher.focus(); }catch(e){}
  }
  el.addEventListener('keydown', function(ev){
    if(ev.key === 'Escape'){ ev.preventDefault(); luSchliessen(); return; }
    fokusFalle(el, ev);
  });
  host.appendChild(el);
  var weiter = el.querySelector('#luWeiter');
  if(weiter){ weiter.onclick = luSchliessen; weiter.focus(); }
}
function countLessonToday(){
  var heute = todayKey();
  if(!state.dayCount || state.dayCount.day !== heute) state.dayCount = { day:heute, n:0 };
  state.dayCount.n++;
}
function checkMilestones(){
  if(state.completed.size >= 1) grantBadge('first_lesson');
  if(state.completed.size >= Math.ceil(TOTAL / 2)) grantBadge('half_way');
  if(state.completed.size >= TOTAL) grantBadge('all_lessons');
  var anyModule = MODULES.some(function(m){
    return m.lessons.every(function(l){ return state.completed.has(l.id); });
  });
  if(anyModule) grantBadge('module_done');
  var part1 = MODULES.filter(function(m){ return m.part === 1; });
  if(part1.every(function(m){ return m.lessons.every(function(l){ return state.completed.has(l.id); }); })) grantBadge('part1_done');
  var nSolved = Object.keys(state.solved || {}).length;
  if(nSolved >= 5) grantBadge('solver5');
  if(nSolved >= EXERCISES.length) grantBadge('all_exercises');
  var experts = EXERCISES.filter(function(e){ return e.level === 3; });
  if(experts.length && experts.every(function(e){ return state.solved[e.id]; })) grantBadge('expert_solver');
  if((state.tracesDone || []).length >= 1) grantBadge('first_trace');
  if((state.tracesDone || []).length >= TRACES.length) grantBadge('all_traces');
  if(state.completed.size >= 10) grantBadge('deep_work');
  /* In jedem Kursteil mindestens eine Lektion begonnen */
  var touchedAll = PARTS.every(function(p){
    return MODULES.filter(function(m){ return m.part === p; })
      .some(function(m){ return m.lessons.some(function(l){ return state.completed.has(l.id); }); });
  });
  if(touchedAll) grantBadge('explorer');
  var allParts = PARTS.every(function(p){
    return MODULES.filter(function(m){ return m.part === p; })
      .every(function(m){ return m.lessons.every(function(l){ return state.completed.has(l.id); }); });
  });
  if(allParts) grantBadge('all_parts');

  /* Teilbezogene Auszeichnungen */
  var teilFertig = function(p){
    var mods = MODULES.filter(function(m){ return m.part === p; });
    return mods.length > 0 && mods.every(function(m){
      return m.lessons.every(function(l){ return state.completed.has(l.id); }); });
  };
  if(teilFertig(4)) grantBadge('kabelsalat');
  if(teilFertig(5)) grantBadge('paragraph');
  if(teilFertig(6)) grantBadge('erbsenzaehler');
  if(teilFertig(7)) grantBadge('schrauber');
  if(teilFertig(9)) grantBadge('maschinist');

  /* Auszeichnungen fuer die neuen Themenmodule */
  var modFertig = function(id){
    var mm = MODULES.filter(function(x){ return x.id === id; })[0];
    return !!mm && mm.lessons.every(function(l){ return state.completed.has(l.id); });
  };
  if(modFertig('m31')) grantBadge('netzwerker');
  if(modFertig('m34') && modFertig('m35')) grantBadge('objektifiziert');
  if(modFertig('m32') && modFertig('m33')) grantBadge('datenschuetzer');

  /* In jedem Kursteil mindestens ein Modul vollstaendig */
  var rund = PARTS.every(function(pt){
    return MODULES.filter(function(mm){ return mm.part === pt; })
      .some(function(mm){ return mm.lessons.every(function(l){ return state.completed.has(l.id); }); });
  });
  if(rund) grantBadge('allrounder');

  /* Richtig beantwortete Fragen zaehlen */
  var richtig = 0;
  Object.keys(state.stats || {}).forEach(function(k){ richtig += (state.stats[k].right || 0); });
  if(richtig >= 100) grantBadge('quizmeister');
  if(richtig >= 250) grantBadge('quizlegende');

  /* Alle Fragen der OOP-Module fehlerfrei */
  var oopIds = [];
  MODULES.filter(function(mm){ return mm.id === 'm34' || mm.id === 'm35'; })
    .forEach(function(mm){ mm.lessons.forEach(function(l){
      (l.quiz || []).forEach(function(q, qi){ oopIds.push(l.id + '#' + qi); }); }); });
  if(oopIds.length && oopIds.every(function(id){
       var st = state.stats[id]; return st && st.right > 0 && !st.wrong; })) grantBadge('kapselkoenig');

  if(state.dayCount && state.dayCount.n >= 25) grantBadge('marathon');

  /* Tageszeit und Wochentag - kleine Belohnung fuer ungewoehnliche Lernzeiten */
  var jetzt = new Date(), std = jetzt.getHours(), tag = jetzt.getDay();
  if(std < 5) grantBadge('night_owl');
  else if(std < 6) grantBadge('early_bird');
  if(tag === 0 || tag === 6) grantBadge('weekend');

  /* Tagespensum */
  var heute = todayKey();
  if(!state.dayCount || state.dayCount.day !== heute) state.dayCount = { day:heute, n:0 };
  if(state.dayCount.n >= 10) grantBadge('sitzfleisch');

  /* Komplettist zum Schluss: alle anderen Auszeichnungen vorhanden */
  var offen = BADGES.filter(function(b){ return b.id !== 'komplettist' && !state.badges[b.id]; });
  if(offen.length === 0) grantBadge('komplettist');
}
function updateXpBar(){
  var lp = levelProgress();
  var chip = document.getElementById('lvlChip');
  if(chip){
    chip.innerHTML = '<span class="lc-icon">'+lp.cur.icon+'</span><span class="lc-lvl">Lv '+lp.cur.lvl+'</span>'+
                     '<span class="lc-name">'+esc(lp.cur.name)+'</span>';
    chip.setAttribute('aria-label', 'Lv '+lp.cur.lvl+' '+lp.cur.name+', Profil und Abzeichen öffnen');
    chip.title = lp.nxt ? ('Noch ' + lp.need + ' XP bis „' + lp.nxt.name + '"') : 'Höchster Rang erreicht';
  }
  var bar = document.getElementById('xpFill');
  if(bar) bar.style.width = lp.pct + '%';
  var lab = document.getElementById('xpLabel');
  if(lab) lab.textContent = (state.xp || 0) + ' XP';
  var st = document.getElementById('streakChip');
  if(st){
    var c = state.streak.count || 0;
    st.hidden = c < 1;
    st.textContent = '🔥 ' + c;
    st.title = c + ' Tag(e) in Folge · Bestwert: ' + (state.streak.best || c);
  }
}
function lessonById(id){ return FLAT.find(function(l){ return l.id===id; }); }
function moduleOfLesson(id){ return MODULES.find(function(m){ return m.lessons.some(function(l){ return l.id===id; }); }); }
function serialize(){
  return {
    completed: Array.from(state.completed),
    srs: state.srs,
    stats: state.stats,
    exams: state.exams.slice(-20),
    xp: state.xp || 0,
    xpLog: state.xpLog,
    badges: state.badges,
    streak: state.streak,
    solved: state.solved,
    tracesDone: state.tracesDone,
    cardsToday: state.cardsToday,
    subnetSolved: state.subnetSolved || 0,
    dayCount: state.dayCount || null,
    tutorFragen: state.tutorFragen || 0,
    pruefungsdatum: state.pruefungsdatum || '',
    tagesziel: state.tagesziel || 3,
    notizen: state.notizen || {},
    ueTexte: state.ueTexte || {},
    merkzettel: state.merkzettel || {},
    klausuren: (state.klausuren || []).slice(-20),
    kalib: state.kalib || {},
    erklaerungen: state.erklaerungen || {},
    learning: state.learning || { events:{}, missions:{} },
    competencies: state.competencies || {submissions:{},variants:{},feedback:{}},
    updatedAt: Date.now()
  };
}
function mergeIn(data){
  if(!data) return;
  if(data.competencies&&typeof data.competencies==='object'){
    state.competencies=state.competencies||{submissions:{},variants:{},feedback:{}};
    ['submissions','variants','feedback'].forEach(function(kind){Object.keys(data.competencies[kind]||{}).forEach(function(key){var incoming=data.competencies[kind][key],mine=state.competencies[kind][key];if(incoming&&(!mine||(incoming.ts||0)>=(mine.ts||0)))state.competencies[kind][key]=incoming;});});
  }
  if(data.learning && typeof data.learning === 'object'){
    state.learning = state.learning || {events:{},missions:{}};
    Object.assign(state.learning.events, data.learning.events || {});
    Object.keys(data.learning.missions || {}).forEach(function(key){
      var incoming = data.learning.missions[key], mine = state.learning.missions[key];
      if(incoming && (!mine || incoming.ts > mine.ts)) state.learning.missions[key] = incoming;
    });
  }
  if(Array.isArray(data.completed)) data.completed.forEach(function(id){ state.completed.add(id); });
  if(data.srs && typeof data.srs === 'object'){
    Object.keys(data.srs).forEach(function(k){
      var incoming = data.srs[k], mine = state.srs[k];
      if(!mine || (incoming.ts || 0) > (mine.ts || 0)) state.srs[k] = incoming;
    });
  }
  if(data.stats && typeof data.stats === 'object'){
    Object.keys(data.stats).forEach(function(k){
      var inc = data.stats[k], mine = state.stats[k];
      if(!mine){ state.stats[k] = inc; }
      else { state.stats[k] = { right: Math.max(mine.right, inc.right||0), wrong: Math.max(mine.wrong, inc.wrong||0) }; }
    });
  }
  if(Array.isArray(data.exams)){
    var seen = {};
    state.exams.concat(data.exams).forEach(function(e){ if(e && e.ts) seen[e.ts] = e; });
    state.exams = Object.keys(seen).map(function(k){ return seen[k]; })
                    .sort(function(a,b){ return a.ts - b.ts; }).slice(-20);
  }
  /* Spielstand: immer der höhere/vollständigere Wert gewinnt */
  if(typeof data.xp === 'number') state.xp = Math.max(state.xp || 0, data.xp);
  if(typeof data.subnetSolved === 'number') state.subnetSolved = Math.max(state.subnetSolved || 0, data.subnetSolved);
  if(typeof data.tutorFragen === 'number') state.tutorFragen = Math.max(state.tutorFragen || 0, data.tutorFragen);
  if(data.pruefungsdatum && !state.pruefungsdatum) state.pruefungsdatum = data.pruefungsdatum;
  if(typeof data.tagesziel === 'number') state.tagesziel = data.tagesziel;
  if(data.notizen && typeof data.notizen === 'object'){
    state.notizen = state.notizen || {};
    Object.keys(data.notizen).forEach(function(k){ if(!state.notizen[k]) state.notizen[k] = data.notizen[k]; });
  }
  if(data.ueTexte && typeof data.ueTexte === 'object'){
    state.ueTexte = state.ueTexte || {};
    Object.keys(data.ueTexte).forEach(function(k){ if(!state.ueTexte[k]) state.ueTexte[k] = data.ueTexte[k]; });
  }
  if(Array.isArray(data.klausuren)){
    var bekannt = {};
    (state.klausuren || []).forEach(function(k){ bekannt[k.ts] = 1; });
    state.klausuren = (state.klausuren || []).concat(
      data.klausuren.filter(function(k){ return !bekannt[k.ts]; })
    ).sort(function(a,b){ return a.ts - b.ts; }).slice(-20);
  }
  /* Kalibrierung: je Stufe gewinnt der vollstaendigere Zaehler. Addieren
     wuerde beim Abgleich zweier Geraete doppelt zaehlen. */
  if(data.kalib && typeof data.kalib === 'object'){
    state.kalib = state.kalib || {};
    Object.keys(data.kalib).forEach(function(k){
      var inc = data.kalib[k] || {}, mine = state.kalib[k];
      if(!mine || (inc.n || 0) > (mine.n || 0)) state.kalib[k] = { n:inc.n||0, r:inc.r||0 };
    });
  }
  if(data.erklaerungen && typeof data.erklaerungen === 'object'){
    state.erklaerungen = state.erklaerungen || {};
    Object.keys(data.erklaerungen).forEach(function(k){
      var inc = data.erklaerungen[k], mine = state.erklaerungen[k];
      if(!mine || (inc.ts || 0) > (mine.ts || 0)) state.erklaerungen[k] = inc;
    });
  }
  if(data.merkzettel && typeof data.merkzettel === 'object'){
    state.merkzettel = state.merkzettel || {};
    Object.keys(data.merkzettel).forEach(function(k){ if(!state.merkzettel[k]) state.merkzettel[k] = data.merkzettel[k]; });
  }
  if(data.dayCount && data.dayCount.day === todayKey()){
    if(!state.dayCount || state.dayCount.day !== todayKey()) state.dayCount = { day:todayKey(), n:0 };
    state.dayCount.n = Math.max(state.dayCount.n, data.dayCount.n || 0);
  }
  if(data.xpLog) Object.keys(data.xpLog).forEach(function(k){ state.xpLog[k] = 1; });
  if(data.badges) Object.keys(data.badges).forEach(function(k){
    if(!state.badges[k]) state.badges[k] = data.badges[k];
  });
  if(data.solved) Object.keys(data.solved).forEach(function(k){
    if(!state.solved[k]) state.solved[k] = data.solved[k];
  });
  if(Array.isArray(data.tracesDone)) data.tracesDone.forEach(function(t){
    if(state.tracesDone.indexOf(t) === -1) state.tracesDone.push(t);
  });
  if(data.streak && (data.streak.count || 0) >= 0){
    var mine = state.streak || { count:0, best:0, last:null };
    state.streak = ((data.streak.last || '') > (mine.last || '')) ? data.streak : mine;
    state.streak.best = Math.max(mine.best || 0, data.streak.best || 0);
  }
  if(data.cardsToday && data.cardsToday.day === todayKey()){
    if(!state.cardsToday || state.cardsToday.day !== todayKey()) state.cardsToday = data.cardsToday;
    else state.cardsToday.n = Math.max(state.cardsToday.n, data.cardsToday.n);
  }
}
function loadLocal(){
  try{
    var raw = localStorage.getItem(STORAGE_KEY);
    if(raw) mergeIn(JSON.parse(raw));
  }catch(e){}
}
var speicherGewarnt = false;
function saveLocal(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize()));
    speicherGewarnt = false;
  }catch(e){
    if(speicherGewarnt) return;
    speicherGewarnt = true;
    var voll = e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014);
    zeigeBanner('Dein Fortschritt wird nicht gespeichert.',
      voll
        ? 'Der Speicher dieses Browsers ist voll. Sichere deinen Stand im Profil ueber die '+
          'Zwischenablage und gib dort Platz frei, sonst geht die heutige Arbeit verloren.'
        : 'Dieser Browser erlaubt kein Speichern, etwa im privaten Fenster. Alles bleibt nur, '+
          'solange der Tab offen ist. Sichere deinen Stand im Profil ueber die Zwischenablage.',
      'localStorage: ' + ((e && e.name) || 'nicht verfuegbar'));
  }
}
async function initDb(){
  try{
    if(window.claude && window.claude.use){ db = await window.claude.use('db'); }
  }catch(e){ db = null; }
}
async function loadProgress(){
  loadLocal();
  render();
  await initDb();
  if(db){
    try{
      var snap = await db.doc('progress/state').get();
      if(snap.exists) mergeIn(snap.data());
    }catch(e){}
    render();
    subscribeProgress();
  }
  updateSyncHint();
  saveProgress();
}
var savePending = false;
var dbWriteChain = Promise.resolve();
var dbSyncOff = false;
async function saveProgress(){
  saveLocal();
  updateDueBadge();
  if(!db || dbSyncOff || savePending) return;
  savePending = true;
  setTimeout(function(){
    savePending = false;
    /* Die Kette stellt sicher, dass nie zwei Schreibvorgaenge auf dasselbe
       Dokument ueberlappen - das verlangt der db-Vertrag ausdruecklich. */
    dbWriteChain = dbWriteChain.then(function(){
      return db.doc('progress/state').set(serialize());
    }).catch(function(err){
      if(err && (err.code === 'revoked' || err.code === 'not_granted')) dbSyncOff = true;
    });
  }, 600);
}
var dbUnsub = null;
function subscribeProgress(){
  if(!db || dbUnsub) return;
  try{
    dbUnsub = db.doc('progress/state').onSnapshot(function(snap){
      if(!snap.exists || snap.metadata.hasPendingWrites) return;
      mergeIn(snap.data());
      saveLocal();
      updateXpBar();
      updateDueBadge();
    }, function(err){
      dbUnsub = null;
      if(err && err.code === 'revoked'){ dbSyncOff = true; updateSyncHint(); }
    });
  }catch(e){ dbUnsub = null; }
}
function updateSyncHint(){
  var el = document.getElementById('syncHint');
  if(!el) return;
  var an = db && !dbSyncOff;
  el.textContent = an ? 'Geraeteabgleich aktiv' : 'nur auf diesem Geraet';
  el.className = 'sync-hint' + (an ? ' on' : '');
}
function exportProgress(){
  var payload = { kurs:'ap1-expertenpfad', version:1, exportiert:new Date().toISOString(), daten:serialize() };
  var text = JSON.stringify(payload);
  var ta = document.getElementById('ioArea');
  if(ta){ ta.value = text; ta.hidden = false; ta.select(); }
  try{
    navigator.clipboard.writeText(text).then(function(){
      showToast('<span class="t-xp">Kopiert</span><span class="t-reason">Fortschritt in der Zwischenablage</span>');
    }).catch(function(){
      showToast('<span class="t-xp">Bereit</span><span class="t-reason">Text unten markieren und kopieren</span>');
    });
  }catch(e){}
}
function showImport(){
  var ta = document.getElementById('ioArea');
  if(!ta) return;
  ta.value = ''; ta.hidden = false; ta.placeholder = 'Hier den exportierten Text einfuegen und dann auf Uebernehmen klicken.';
  ta.focus();
  var b = document.getElementById('ioApply'); if(b) b.hidden = false;
}
function applyImport(){
  var ta = document.getElementById('ioArea');
  if(!ta || !ta.value.trim()){ showToast('<span class="t-xp">Leer</span><span class="t-reason">Kein Text eingefuegt</span>'); return; }
  var obj;
  try{ obj = JSON.parse(ta.value); }
  catch(e){ showToast('<span class="t-xp">Fehler</span><span class="t-reason">Das ist kein gueltiger Export</span>'); return; }
  var daten = obj && obj.daten ? obj.daten : obj;
  if(!daten || typeof daten !== 'object' || !('completed' in daten || 'srs' in daten)){
    showToast('<span class="t-xp">Fehler</span><span class="t-reason">Unbekanntes Format</span>'); return;
  }
  mergeIn(daten);            /* additiv: der bisherige Stand bleibt erhalten */
  saveProgress();
  render();
  showToast('<span class="t-xp">Übernommen</span><span class="t-reason">Fortschritt zusammengeführt</span>');
}
function updateDueBadge(){
  var b = document.getElementById('dueBadge');
  if(!b) return;
  var n = dueCards().length;
  b.hidden = n === 0;
  b.textContent = n;
  b.className = 'mastery-pill' + (n > 0 ? ' bad' : '');
}
function toggleComplete(id, checked){
  if(checked){
    state.completed.add(id);
    awardXp(50, 'Lektion abgeschlossen', 'lesson:' + id);
    countLessonToday();
    checkMilestones();
  } else { state.completed.delete(id); }
  saveProgress();
  renderSidebar();
  renderProgressPill();
  renderContent();
}
function selectLesson(id){
  /* Laufende Prüfung nicht stillschweigend verwerfen. */
  if(exam.active && !exam.finished && id !== 'exam'){
    if(!window.confirm('Die laufende Prüfung wird abgebrochen. Fortfahren?')) return;
    stopExamTimer();
    exam.active = false;
  }
  if(klausur.phase === 'laufend' && id !== 'klausur'){
    if(!window.confirm('Die laufende Klausur wird verworfen. Fortfahren?')) return;
    klUhrStoppen(); klausur.phase = 'start';
  }
  if(id !== 'exam') stopExamTimer();
  state.currentId = id;
  weichRendern(render);
  closeDrawer();
  window.scrollTo(0,0);
  updateReadBar();
}
function render(){
  renderSidebar();
  renderMobilbar();
  renderProgressPill();
  updateXpBar();
  renderContent();
}
function renderProgressPill(){
  var completed = typeof rpCompleted === 'function' ? rpCompleted() : state.completed.size;
  var pct = TOTAL ? Math.round((completed/TOTAL)*100) : 0;
  document.getElementById('progressLabel').textContent = completed + '/' + TOTAL;
  document.getElementById('progressFill').style.width = pct + '%';
}
function renderSidebar(){
  var nav = document.getElementById('moduleNav');
  nav.innerHTML = '';
  var currentModule = moduleOfLesson(state.currentId);
  var lastPart = null;
  MODULES.forEach(function(m){
    if(m.part !== lastPart){
      var label = document.createElement('div');
      label.className = 'part-label';
      label.textContent = 'Teil ' + m.part + ' · ' + m.partTitle;
      nav.appendChild(label);
      lastPart = m.part;
    }
    var det = document.createElement('details');
    det.className = 'module';
    if(currentModule && currentModule.id === m.id) det.open = true;
    var doneInModule = m.lessons.filter(function(l){ return state.completed.has(l.id); }).length;
    var sum = document.createElement('summary');
    sum.innerHTML = '<span class="chev">▸</span><span>'+esc(m.title)+'</span><span class="mod-count">'+doneInModule+'/'+m.lessons.length+'</span>';
    det.appendChild(sum);
    m.lessons.forEach(function(l){
      var btn = document.createElement('button');
      var aktiv = state.currentId === l.id;
      btn.className = 'lesson-btn' + (aktiv ? ' active' : '');
      /* Die aktive Lektion nicht nur einfaerben, sondern auch ansagen. */
      if(aktiv) btn.setAttribute('aria-current', 'true'); else btn.removeAttribute('aria-current');
      var done = state.completed.has(l.id);
      btn.innerHTML = '<span class="check'+(done?' done':'')+'">'+(done?'✓':'')+'</span><span>'+esc(l.title)+'</span>';
      btn.onclick = function(){ selectLesson(l.id); };
      det.appendChild(btn);
    });
    nav.appendChild(det);
  });

  [['navHeute','heute'],['navIntro','intro'],['navProfile','profile'],['navReview','review'],['navExam','exam'],['navTracer','tracer'],['navKlausur','klausur'],['navSubnet','subnet'],['navTutor','tutor'],
   ['navExercises','exercises'],['navFehler','fehler'],['navMerk','merk'],['navSheet','cheatsheet'],['navGlossar','glossar']].forEach(function(p){
    var b = document.getElementById(p[0]);
    if(!b) return;
    var aktiv = state.currentId === p[1];
    b.className = 'nav-link' + (aktiv ? ' active' : '');
    if(aktiv) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  updateDueBadge();
}
function renderQuiz(lesson){
  if(!lesson.quiz || !lesson.quiz.length) return '';
  var html = '<div class="quiz"><h3>Kurz-Check</h3>';
  lesson.quiz.forEach(function(q, qi){
    html += '<fieldset class="qcard" id="q_'+lesson.id+'_'+qi+'"><legend>'+esc(q.q)+'</legend>';
    q.options.forEach(function(opt, oi){
      html += '<label class="opt"><input type="radio" name="rq_'+lesson.id+'_'+qi+'" value="'+oi+'"> <span>'+esc(opt)+'</span></label>';
    });
    html += '<div class="qfeedback" id="fb_'+lesson.id+'_'+qi+'"></div></fieldset>';
  });
  html += '<button class="check-btn" data-onclick="checkQuiz(\''+lesson.id+'\')">Antworten prüfen</button>';
  html += '<div class="ex-meta" id="quizNote_'+lesson.id+'" hidden></div></div>';
  return html;
}
function checkQuiz(lessonId){
  var lesson = lessonById(lessonId);
  var answeredAll = true;
  var gain = 0;
  lesson.quiz.forEach(function(q, qi){
    var sel = document.querySelector('input[name="rq_'+lessonId+'_'+qi+'"]:checked');
    var fb = document.getElementById('fb_'+lessonId+'_'+qi);
    if(!sel){
      answeredAll = false;
      fb.className = 'qfeedback show wrong';
      fb.textContent = 'Bitte wähle eine Antwort aus.';
      return;
    }
    var val = parseInt(sel.value, 10);
    var ok = val === q.correct;
    var cardId = rpQuestionId(lesson,qi);
    recordAnswer(cardId, ok);
    /* Antwort aus der Lektion heraus plant die Karte ins Wiederholungssystem ein. */
    if(ok){ if(!state.srs[cardId]) rateCard(cardId, 2); }
    else { rateCard(cardId, 0); }
    if(ok && !state.xpLog['quiz:' + cardId]){ state.xpLog['quiz:' + cardId] = 1; gain += 10; }

    if(ok){
      fb.className = 'qfeedback show correct';
      fb.textContent = '✓ Richtig. ' + q.explain;
    } else {
      fb.className = 'qfeedback show wrong';
      fb.textContent = '✗ Nicht ganz. Richtig ist: „' + q.options[q.correct] + '". ' + q.explain;
    }
  });
  if(gain) awardXp(gain, 'Quizfragen richtig');
  if(answeredAll){
    var note = document.getElementById('quizNote_'+lessonId);
    if(note){
      note.hidden = false;
      note.textContent = 'Diese Fragen sind jetzt im Wiederholungs-Trainer eingeplant — falsch beantwortete kommen heute noch einmal.';
    }
  }
  saveProgress();
  /* Der Lernbegleiter zaehlt die Karten dieser Lektion mit. */
  try{ renderRail(); }catch(e){}
}
function renderLessonBlocks(lesson){
  /* Reihenfolge der Text-/Codeblöcke: pro Lektion überschreibbar. */
  var order = lesson.order || ['body','code','code2','body2','code3','code4'];
  var html = '';
  order.forEach(function(key){
    var val = lesson[key];
    if(!val) return;
    if(key.indexOf('code') === 0){ html += codeBlock(val, lesson[key + 'Lang']); }
    else { html += '<div class="lesson-body">' + val + '</div>'; }
  });
  return html;
}
var exFilter = 0;
var LEVEL_NAMES = { 1:'Einsteiger', 2:'Fortgeschritten', 3:'Experte' };
function setExFilter(lvl){ exFilter = lvl; renderContent(); }
function toggleHint(exId, idx){
  var el = document.getElementById('hint_'+exId+'_'+idx);
  if(el) el.hidden = !el.hidden;
}
function toggleSolution(exId){
  var el = document.getElementById('sol_'+exId);
  if(el) el.hidden = !el.hidden;
}
function togglePrompt(exId){
  var el = document.getElementById('prompt_'+exId);
  if(el) el.hidden = !el.hidden;
}
function toggleSolved(id){
  if(state.solved[id]){ delete state.solved[id]; }
  else {
    state.solved[id] = Date.now();
    awardXp(30, 'Übungsaufgabe gelöst', 'solved:' + id);
    checkMilestones();
  }
  saveProgress();
  renderContent();
}
function copyPrompt(exId){
  var ex = EXERCISES.find(function(e){ return e.id===exId; });
  if(!ex) return;
  var text =
    'Ich bereite mich auf die IHK-Abschlussprüfung Teil 1 als Fachinformatiker Anwendungsentwicklung vor (Level: '+LEVEL_NAMES[ex.level]+', Thema: '+ex.topic+') und habe folgende Prüfungsaufgabe bearbeitet.\n\n'+
    'AUFGABE:\n'+ex.title+' — '+ex.task.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()+'\n\n'+
    'MEINE LÖSUNG:\n[HIER DEINE LÖSUNG EINFÜGEN]\n\n'+
    'Bitte prüfe meine Lösung so, wie ein IHK-Prüfer sie bewerten würde:\n'+
    '1. Ist die Lösung fachlich korrekt? Falls nein: welcher konkrete Fall bricht?\n'+
    '2. Bekäme sie die volle Punktzahl? Fehlt ein Rechenweg, eine Begründung oder eine Einheit?\n'+
    '3. Steckt ein typischer Prüfungsfehler darin (Off-by-one, Faktor 8 zwischen Bit und Byte, MAX statt MIN im Netzplan, Skonto vom Listenpreis)?\n'+
    '4. Ist die Antwort zum Operator der Aufgabe passend formuliert — nennen, beschreiben, begründen oder berechnen?\n'+
    '5. Zeige eine Musterlösung und erkläre jede Abweichung kurz.\n\n'+
    'Sei konkret und ehrlich, keine Gefälligkeitsbewertung. Wenn meine Lösung gut ist, sag das auch.';
  var btn = document.getElementById('cp_'+exId);
  try{
    navigator.clipboard.writeText(text).then(function(){
      if(btn){ var old = btn.textContent; btn.textContent = '✓ Kopiert'; setTimeout(function(){ btn.textContent = old; }, 1600); }
    }).catch(function(){});
  }catch(e){}
}
function renderExercises(){
  var html = '<div class="breadcrumb">Praxis</div><h1>Übungsaufgaben</h1>'+
    '<p class="intro-sub">'+EXERCISES.length+' Prüfungsaufgaben in drei Schwierigkeitsstufen — mit gestaffelten Tipps und vollständiger Musterlösung samt Rechenweg. Unter jeder Aufgabe steht ein Schreibfeld: Trag deine eigene Lösung ein, und Claude korrigiert sie direkt hier — mit Punkten, Teilpunkten auf den Rechenweg und dem, was gefehlt hätte.</p>';

  html += '<div class="filter-row">';
  html += '<button class="filter-btn'+(exFilter===0?' active':'')+'" data-onclick="setExFilter(0)">Alle ('+EXERCISES.length+')</button>';
  [1,2,3].forEach(function(l){
    var count = EXERCISES.filter(function(e){ return e.level===l; }).length;
    html += '<button class="filter-btn'+(exFilter===l?' active':'')+'" data-onclick="setExFilter('+l+')">'+LEVEL_NAMES[l]+' ('+count+')</button>';
  });
  html += '</div>';

  var list = exFilter===0 ? EXERCISES : EXERCISES.filter(function(e){ return e.level===exFilter; });

  list.forEach(function(ex){
    html += '<div class="ex-card">';
    var solved = !!state.solved[ex.id];
    html += '<div class="ex-head"><h3 id="exh_'+ex.id+'" data-ok="'+(solved?'1':'0')+'">'+(solved?'<span style="color:var(--success);">✓ </span>':'')+esc(ex.title)+'</h3>'+
      '<span class="badge lvl'+ex.level+'">'+LEVEL_NAMES[ex.level]+'</span>'+
      '<span class="badge topic">'+esc(ex.topic)+'</span></div>';
    html += '<div class="ex-task">'+ex.task+'</div>';

    html += '<div class="ex-actions">';
    html += '<button class="ex-btn'+(solved?'':' primary')+'" id="sv_'+ex.id+'" data-onclick="toggleSolved(\''+ex.id+'\')">'+
            (solved ? '✓ Gelöst' : 'Als gelöst markieren +'+xpAnzeige(30)+' XP')+'</button>';
    ex.hints.forEach(function(h, i){
      html += '<button class="ex-btn" data-onclick="toggleHint(\''+ex.id+'\','+i+')">💡 Tipp '+(i+1)+'</button>';
    });
    html += '<button class="ex-btn" data-onclick="toggleSolution(\''+ex.id+'\')">✅ Lösung anzeigen</button>';
    html += '<button class="ex-btn primary" data-onclick="ueUmschalten(\''+ex.id+'\')">✍ Lösung schreiben &amp; prüfen lassen</button>';
    html += '</div>';

    ex.hints.forEach(function(h, i){
      html += '<div class="ex-panel hint" id="hint_'+ex.id+'_'+i+'" hidden><div class="hint-label">Tipp '+(i+1)+'</div><p>'+h+'</p></div>';
    });

    html += '<div id="sol_'+ex.id+'" hidden>'+codeBlock(ex.solution, ex.solutionLang)+
      '<div class="ex-panel"><strong>Hinweis zur Lösung:</strong> '+ex.solutionNote+'</div></div>';

    var ueTxt = (state.ueTexte || {})[ex.id] || '';
    var ueOffen = !!ue.offen[ex.id] || !!ueTxt || !!ue.erg[ex.id];
    var ueMax = KL_PUNKTE[ex.level] || 8;
    var ueHtml = ueErgHtml(ex.id);
    html += '<div class="ue" id="ue_'+ex.id+'"'+(ueOffen ? '' : ' hidden')+'>'+
      '<label class="ue-label" for="ueFeld_'+ex.id+'">Deine Lösung — Rechenweg mit Einheiten, Begründungen ausformuliert.</label>'+
      '<textarea class="ue-feld" id="ueFeld_'+ex.id+'" rows="4" spellcheck="false" '+
        'placeholder="Schreib so, wie du es in der Prüfung auf Papier tätest." '+
        'data-oninput="ueSchreiben(\''+ex.id+'\', this.value)" '+
        'data-onkeydown="ueTaste(event, \''+ex.id+'\')">'+esc(ueTxt)+'</textarea>'+
      '<div class="ue-leiste">'+
        '<button class="ex-btn primary" id="ueBtn_'+ex.id+'" data-onclick="uePruefen(\''+ex.id+'\')">Lösung prüfen lassen</button>'+
        '<button class="ex-btn" data-onclick="ueLeeren(\''+ex.id+'\')">Leeren</button>'+
        '<button class="ex-btn" data-onclick="togglePrompt(\''+ex.id+'\')">Prüfauftrag für den Chat</button>'+
        '<span class="ue-note" id="ueNote_'+ex.id+'">Strg + Enter prüft · '+ueMax+' Punkte möglich · +'+xpAnzeige(10)+' XP</span>'+
      '</div>'+
      '<div class="ue-erg" id="ueErg_'+ex.id+'"'+(ueHtml ? '' : ' hidden')+'>'+ueHtml+'</div>'+
      '</div>';

    html += '<div class="ex-panel" id="prompt_'+ex.id+'" hidden>'+
      '<p style="margin-bottom:8px;"><strong>So lässt du deine eigene Lösung prüfen:</strong> Kopiere den Prüfauftrag, füge ihn in VS Code in den Claude-Chat ein, ersetze den Platzhalter durch deinen Code — und du bekommst ein ehrliches Review statt nur „richtig/falsch".</p>'+
      '<button class="ex-btn primary" id="cp_'+ex.id+'" data-onclick="copyPrompt(\''+ex.id+'\')">Prüfauftrag kopieren</button>'+
      '<div class="ex-meta">Enthält: Aufgabenstellung, Platzhalter für deine Lösung und fünf konkrete Prüfkriterien (fachliche Korrektheit, Punktwürdigkeit, typische Prüfungsfehler, Operatorbezug, Musterlösung).</div>'+
      '</div>';

    html += '</div>';
  });

  return html;
}
var ue = { offen:{}, busy:{}, erg:{}, fehler:{}, speichern:null };
