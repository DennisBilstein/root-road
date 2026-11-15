function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function relBadge(r){
  if(!r) return '';
  var c = r === 'sehr hoch' ? 'r-hoch2' : (r === 'hoch' ? 'r-hoch' : 'r-mittel');
  return '<span class="relevanz '+c+'" title="Wie oft dieses Thema in AP1-Prüfungen vorkam">Prüfungsrelevanz: '+esc(r)+'</span>';
}
function codeBlock(code, lang){
  lang = lang || 'Pseudocode';
  return '<div class="code-block"><div class="code-head"><span class="code-lang">'+esc(lang)+'</span><button class="copy-btn" data-onclick="copyCode(this)">Kopieren</button></div><pre><code>'+esc(code)+'</code></pre></div>';
}
function copyCode(btn){
  var code = btn.closest('.code-block').querySelector('code').textContent;
  try{
    navigator.clipboard.writeText(code).then(function(){
      var old = btn.textContent; btn.textContent = 'Kopiert!';
      setTimeout(function(){ btn.textContent = old; }, 1400);
    }).catch(function(){});
  }catch(e){}
}
var MODULES=window.RP_LITERALS[1];
var CHEATSHEET_HTML = (function(){
  var s = '';

  s += '<div class="sheet-section"><h2>Netzplantechnik &ndash; alle Formeln</h2><table class="lesson-table"><tr><th>Gesucht</th><th>Formel</th><th>Merkhilfe</th></tr>'+
    '<tr><td>FEZ</td><td>FAZ + D</td><td>Vorwärts</td></tr>'+
    '<tr><td>FAZ</td><td><strong>MAX</strong>(FEZ aller Vorgänger)</td><td>Auf den Langsamsten warten</td></tr>'+
    '<tr><td>SAZ</td><td>SEZ &minus; D</td><td>Rückwärts</td></tr>'+
    '<tr><td>SEZ</td><td><strong>MIN</strong>(SAZ aller Nachfolger)</td><td>Frühesten Termin halten</td></tr>'+
    '<tr><td>GP (Gesamtpuffer)</td><td>SAZ &minus; FAZ = SEZ &minus; FEZ</td><td>Ohne Projektende zu gefährden</td></tr>'+
    '<tr><td>FP (freier Puffer)</td><td>MIN(FAZ Nachfolger) &minus; eigener FEZ</td><td>Ohne Nachfolger zu stören</td></tr>'+
    '<tr><td>Kritischer Pfad</td><td>alle Vorgänge mit GP = 0</td><td>Durchgehende Kette Start &rarr; Ende</td></tr></table>'+
    '<p style="font-size:.8rem;color:var(--text-dim);">Letzter Vorgang: SEZ = FEZ. Probe: Beim ersten Vorgang muss SAZ = 0 herauskommen.</p></div>';

  s += '<div class="sheet-section"><h2>Subnetzmasken &ndash; auswendig können</h2><table class="lesson-table"><tr><th>CIDR</th><th>Maske</th><th>Blockgröße</th><th>Nutzbare Hosts</th></tr>'+
    '<tr><td>/24</td><td>255.255.255.0</td><td>256</td><td>254</td></tr>'+
    '<tr><td>/25</td><td>255.255.255.128</td><td>128</td><td>126</td></tr>'+
    '<tr><td>/26</td><td>255.255.255.192</td><td>64</td><td>62</td></tr>'+
    '<tr><td>/27</td><td>255.255.255.224</td><td>32</td><td>30</td></tr>'+
    '<tr><td>/28</td><td>255.255.255.240</td><td>16</td><td>14</td></tr>'+
    '<tr><td>/29</td><td>255.255.255.248</td><td>8</td><td>6</td></tr>'+
    '<tr><td>/30</td><td>255.255.255.252</td><td>4</td><td>2</td></tr></table>'+
    '<p style="font-size:.8rem;color:var(--text-dim);">Oktettwerte von links: <strong>128 &middot; 192 &middot; 224 &middot; 240 &middot; 248 &middot; 252 &middot; 254 &middot; 255</strong> &nbsp;|&nbsp; Blockgröße = 256 &minus; Maskenwert &nbsp;|&nbsp; Hosts = 2^(Hostbits) &minus; 2 &nbsp;|&nbsp; Subnetze = 2^(zusätzliche Netzbits)</p></div>';

  s += '<div class="sheet-section"><h2>IP-Adressen kompakt</h2><table class="lesson-table"><tr><th>Adresse / Präfix</th><th>Bedeutung</th></tr>'+
    '<tr><td>10.0.0.0/8 &middot; 172.16.0.0/12 &middot; 192.168.0.0/16</td><td>private IPv4-Bereiche (RFC 1918), nicht routbar</td></tr>'+
    '<tr><td>127.0.0.1 / ::1</td><td>Loopback</td></tr>'+
    '<tr><td>169.254.x.x</td><td>APIPA &ndash; kein DHCP-Server erreichbar</td></tr>'+
    '<tr><td>fe80::/10</td><td>IPv6 Link-Local, selbst erzeugt, nicht routbar</td></tr>'+
    '<tr><td>2000::/3</td><td>IPv6 Global Unicast</td></tr>'+
    '<tr><td>fc00::/7</td><td>IPv6 Unique Local (privat)</td></tr>'+
    '<tr><td>ff00::/8</td><td>IPv6 Multicast &ndash; IPv6 kennt keinen Broadcast</td></tr></table>'+
    '<p style="font-size:.8rem;color:var(--text-dim);">IPv6: 128 Bit = 8 Blöcke à 4 Hex-Ziffern. Erste 64 Bit Präfix, letzte 64 Bit Interface-ID. <code>::</code> nur einmal. Teilnetze = 2^n <strong>ohne</strong> Abzug.</p></div>';

  s += '<div class="sheet-section"><h2>OSI-Modell</h2><table class="lesson-table"><tr><th>Nr</th><th>Schicht</th><th>Einheit</th><th>Adresse</th><th>Geräte / Protokolle</th></tr>'+
    '<tr><td>7</td><td>Anwendung</td><td>Daten</td><td>&mdash;</td><td>HTTP(S), FTP, SMTP, DNS, DHCP, SSH</td></tr>'+
    '<tr><td>6</td><td>Darstellung</td><td>&mdash;</td><td>&mdash;</td><td>Kodierung, Kompression, TLS</td></tr>'+
    '<tr><td>5</td><td>Sitzung</td><td>&mdash;</td><td>&mdash;</td><td>Verbindungsauf-/-abbau</td></tr>'+
    '<tr><td>4</td><td>Transport</td><td>Segmente</td><td>Port</td><td>TCP, UDP</td></tr>'+
    '<tr><td>3</td><td>Vermittlung</td><td>Pakete</td><td>IP</td><td>Router, IPv4/IPv6, ICMP</td></tr>'+
    '<tr><td>2</td><td>Sicherung</td><td>Frames</td><td>MAC</td><td>Switch, Ethernet, ARP, WLAN</td></tr>'+
    '<tr><td>1</td><td>Bitübertragung</td><td>Bits</td><td>&mdash;</td><td>Kabel, Stecker, Hub, Repeater</td></tr></table>'+
    '<p style="font-size:.8rem;color:var(--text-dim);">Von unten: <em>Bitte Schicke Verpackung Trotzdem Sofort Dorthin Ab.</em> &nbsp;|&nbsp; Ports: 21 FTP &middot; 22 SSH &middot; 25 SMTP &middot; 53 DNS &middot; 67/68 DHCP &middot; 80 HTTP &middot; 110 POP3 &middot; 143 IMAP &middot; 443 HTTPS &middot; 3389 RDP</p></div>';

  s += '<div class="sheet-section"><h2>UML &ndash; Pfeile und Zeichen</h2><table class="lesson-table"><tr><th>Element</th><th>Darstellung</th><th>Richtung / Lesart</th></tr>'+
    '<tr><td>&laquo;include&raquo;</td><td>gestrichelter Pfeil</td><td>vom einschließenden zum eingeschlossenen Fall &ndash; läuft <strong>immer</strong> mit</td></tr>'+
    '<tr><td>&laquo;extend&raquo;</td><td>gestrichelter Pfeil</td><td>vom erweiternden zum erweiterten Fall &ndash; nur <strong>bedingt</strong></td></tr>'+
    '<tr><td>Generalisierung</td><td>Linie, geschlossene leere Dreieckspitze</td><td>vom Speziellen zum Allgemeinen</td></tr>'+
    '<tr><td>Realisierung</td><td>gestrichelt, Dreieckspitze</td><td>implementiert</td></tr>'+
    '<tr><td>Aggregation</td><td><strong>leere</strong> Raute</td><td>&bdquo;hat ein&ldquo; &ndash; Teil überlebt das Ganze</td></tr>'+
    '<tr><td>Komposition</td><td><strong>gefüllte</strong> Raute</td><td>&bdquo;besteht aus&ldquo; &ndash; Teil stirbt mit dem Ganzen</td></tr>'+
    '<tr><td>Sichtbarkeit</td><td>+ public &nbsp; &minus; private &nbsp; # protected &nbsp; ~ package</td><td>Attribut: <code>name: Typ</code>, Methode: <code>name(p): Typ</code></td></tr>'+
    '<tr><td>Multiplizität</td><td>1 &middot; 0..1 &middot; * &middot; 1..*</td><td>am Linienende</td></tr></table>'+
    '<p style="font-size:.8rem;color:var(--text-dim);">Strukturdiagramme: Klassen-, Komponentendiagramm. Verhaltensdiagramme: Use-Case, Aktivität, Sequenz, Zustand.</p></div>';

  s += '<div class="sheet-section"><h2>ER-Modell &amp; Normalisierung</h2><table class="lesson-table"><tr><th>Begriff</th><th>Kurzfassung</th></tr>'+
    '<tr><td>Chen-Notation</td><td>Rechteck = Entität &middot; Raute = Beziehung &middot; Oval = Attribut &middot; unterstrichen = Schlüssel</td></tr>'+
    '<tr><td>1:1</td><td>beide Seiten genau eine &ndash; Fremdschlüssel auf einer Seite</td></tr>'+
    '<tr><td>1:n</td><td>Fremdschlüssel auf der <strong>n</strong>-Seite</td></tr>'+
    '<tr><td>n:m</td><td>eigene <strong>Zwischentabelle</strong> mit beiden Fremdschlüsseln</td></tr>'+
    '<tr><td>1. NF</td><td>alle Attribute atomar, keine Wiederholgruppen</td></tr>'+
    '<tr><td>2. NF</td><td>1. NF + volle funktionale Abhängigkeit vom <em>gesamten</em> Schlüssel</td></tr>'+
    '<tr><td>3. NF</td><td>2. NF + keine transitiven Abhängigkeiten (Nichtschlüssel &rarr; Nichtschlüssel)</td></tr></table>'+
    '<p style="font-size:.8rem;color:var(--text-dim);">Anomalien: Einfüge-, Änderungs-, Löschanomalie. Notation relational: <code>Tabelle(<u>PK</u>, Attribut, #FK)</code></p></div>';

  s += '<div class="sheet-section"><h2>SQL &ndash; Reihenfolge und Muster</h2>'+codeBlock(
    "-- Schreibreihenfolge:\n"+
    "SELECT spalten          -- 5.\n"+
    "FROM   tabelle          -- 1.\n"+
    "JOIN   andere ON ...    -- 2.\n"+
    "WHERE  bedingung        -- 3.  filtert EINZELZEILEN (vor Gruppierung)\n"+
    "GROUP BY spalte         -- 4.\n"+
    "HAVING aggregat > x     -- 6.  filtert GRUPPEN (nach Gruppierung)\n"+
    "ORDER BY spalte DESC    -- 7.\n"+
    "LIMIT  n;               -- 8.\n\n"+
    "-- Aggregatfunktionen: COUNT() SUM() AVG() MIN() MAX()\n"+
    "SELECT abteilung, COUNT(*) AS anzahl, AVG(gehalt) AS schnitt\n"+
    "FROM   mitarbeiter\n"+
    "GROUP BY abteilung\n"+
    "HAVING COUNT(*) > 3;\n\n"+
    "-- JOIN-Arten\n"+
    "INNER JOIN  -- nur Treffer in beiden Tabellen\n"+
    "LEFT  JOIN  -- alle links, rechts ggf. NULL\n"+
    "RIGHT JOIN  -- alle rechts\n"+
    "FULL  JOIN  -- alle beider Seiten\n\n"+
    "-- Falle: WHERE auf die rechte Tabelle macht aus LEFT JOIN ein INNER JOIN.\n"+
    "-- Richtig: Bedingung in die ON-Klausel, oder IS NULL pruefen.\n\n"+
    "-- NULL niemals mit = vergleichen:\n"+
    "WHERE spalte IS NULL        -- richtig\n"+
    "WHERE spalte = NULL         -- liefert nie ein Ergebnis"
  )+'<p style="font-size:.8rem;color:var(--text-dim);">DDL: CREATE, ALTER, DROP &middot; DML: SELECT, INSERT, UPDATE, DELETE &middot; DCL: GRANT, REVOKE &middot; TCL: COMMIT, ROLLBACK</p></div>';

  s += '<div class="sheet-section"><h2>Pseudocode &amp; Kontrollstrukturen</h2>'+codeBlock(
    "Zuweisung        x <- 5        bzw.  x := 5\n"+
    "Verzweigung      WENN bed DANN ... SONST ... ENDEWENN\n"+
    "Zaehlschleife    FUER i VON 1 BIS n TUE ... ENDEFUER\n"+
    "Kopfgesteuert    SOLANGE bed TUE ... ENDESOLANGE     (0 x moeglich)\n"+
    "Fussgesteuert    WIEDERHOLE ... BIS bed              (mind. 1 x)\n"+
    "Funktion         FUNKTION name(p) ... GIB wert ZURUECK ENDEFUNKTION\n\n"+
    "Operatoren       =  <>  <  >  <=  >=     UND  ODER  NICHT\n"+
    "MOD = Rest der Division      7 MOD 3 = 1   (gerade: x MOD 2 = 0)\n"+
    "DIV = ganzzahlige Division   7 DIV 3 = 2\n\n"+
    "Array            feld[0] ist das ERSTE Element,\n"+
    "                 feld[laenge-1] das letzte  ->  Off-by-one-Falle"
  )+'<p style="font-size:.8rem;color:var(--text-dim);">Wahrheitstabelle: UND nur wahr, wenn <em>beide</em> wahr. ODER falsch nur, wenn <em>beide</em> falsch. De Morgan: NICHT(A UND B) = NICHT A ODER NICHT B.</p></div>';

  s += '<div class="sheet-section"><h2>Komplexität &amp; Verfahren</h2><table class="lesson-table"><tr><th>Verfahren</th><th>Komplexität</th><th>Vergleiche / Hinweis</th></tr>'+
    '<tr><td>Lineare Suche</td><td>O(n)</td><td>n/2 im Schnitt, unsortiert möglich</td></tr>'+
    '<tr><td>Binäre Suche</td><td>O(log n)</td><td>log&#8322;(n) Schritte &ndash; setzt <strong>sortiert</strong> voraus</td></tr>'+
    '<tr><td>Bubble-/Selection-/Insertion-Sort</td><td>O(n&sup2;)</td><td>max. n&middot;(n&minus;1)/2 Vergleiche</td></tr>'+
    '<tr><td>Quick-/Merge-Sort</td><td>O(n&middot;log n)</td><td>Teile und herrsche</td></tr>'+
    '<tr><td>Hash-Zugriff</td><td>O(1)</td><td>konstant</td></tr></table>'+
    '<p style="font-size:.8rem;color:var(--text-dim);">log&#8322;: 8&rarr;3 &middot; 16&rarr;4 &middot; 32&rarr;5 &middot; 64&rarr;6 &middot; 128&rarr;7 &middot; 256&rarr;8 &middot; 1024&rarr;10 &middot; 1.000.000&rarr;ca. 20</p></div>';

  s += '<div class="sheet-section"><h2>Kaufmännische Formeln</h2>'+codeBlock(
    "BEZUGSKALKULATION\n"+
    "    Listeneinkaufspreis\n"+
    "  - Liefererrabatt\n"+
    "  = Zieleinkaufspreis\n"+
    "  - Liefererskonto      (vom Zieleinkaufspreis!)\n"+
    "  = Bareinkaufspreis\n"+
    "  + Bezugskosten        (kein Skonto darauf)\n"+
    "  = BEZUGSPREIS / Einstandspreis\n\n"+
    "UMSATZSTEUER\n"+
    "  netto -> brutto :  netto x 1,19\n"+
    "  brutto -> netto :  brutto / 1,19\n"+
    "  enthaltene USt  :  brutto x 19 / 119     (NICHT brutto x 0,19)\n\n"+
    "AMORTISATION\n"+
    "  Dauer = Investitionssumme / jaehrlicher Rueckfluss\n"+
    "  0,5 Jahre = 6 Monate   |   0,25 = 3 Monate\n\n"+
    "RATENDARLEHEN (Tilgung konstant, Zinsen sinken)\n"+
    "  Tilgung = Darlehen / Laufzeit\n"+
    "  Zinsen  = RESTSCHULD x Zinssatz x Monate/12\n"+
    "  Rate    = Tilgung + Zinsen\n\n"+
    "NUTZWERTANALYSE\n"+
    "  Teilnutzwert  = Punkte x Gewichtung\n"+
    "  Gesamtnutzwert = Summe der Teilnutzwerte\n"+
    "  Probe: Summe der Gewichtungen = 100 %\n\n"+
    "PERT-SCHAETZUNG\n"+
    "  tE = (optimistisch + 4 x wahrscheinlich + pessimistisch) / 6\n\n"+
    "DREISATZ / PROZENT\n"+
    "  Prozentwert = Grundwert x Prozentsatz / 100\n"+
    "  Grundwert   = Prozentwert x 100 / Prozentsatz"
  )+'</div>';

  s += '<div class="sheet-section"><h2>Einheiten &amp; Übertragung</h2>'+codeBlock(
    "1 Byte = 8 Bit          Datenmenge in BYTE (B), Datenrate in BIT/s (b)\n\n"+
    "Dezimal (SI)            Binaer (IEC)\n"+
    "  1 kB = 10^3 = 1.000     1 KiB = 2^10 = 1.024\n"+
    "  1 MB = 10^6             1 MiB = 2^20 = 1.048.576\n"+
    "  1 GB = 10^9             1 GiB = 2^30\n"+
    "  1 TB = 10^12            1 TiB = 2^40\n\n"+
    "UEBERTRAGUNGSDAUER\n"+
    "  t = Datenmenge / Datenrate\n"+
    "  1. Menge in Bit (x 8)   2. Rate in Bit/s   3. teilen   4. umrechnen\n"+
    "  Bei \"x % effektiver Auslastung\": erst Rate reduzieren, dann teilen.\n\n"+
    "VERFUEGBARKEIT\n"+
    "  V = (Gesamtzeit - Ausfallzeit) / Gesamtzeit x 100 %\n"+
    "  1 Jahr = 8.760 h = 525.600 min\n"+
    "  99,9 % -> max. 8,76 h Ausfall/Jahr   99,99 % -> 52,6 min\n\n"+
    "ENERGIE\n"+
    "  kWh = Watt x Stunden / 1.000\n"+
    "  Wirkungsgrad  = abgegeben / zugefuehrt x 100 %\n"+
    "  PUE (Rechenzentrum) = Gesamtenergie / IT-Energie   (ideal 1,0)\n\n"+
    "RAID-Nutzkapazitaet\n"+
    "  RAID 0 : n x Groesse       RAID 1 : 50 %\n"+
    "  RAID 5 : (n-1) x Groesse   RAID 6 : (n-2) x Groesse   RAID 10 : 50 %"
  )+'</div>';

  s += '<div class="sheet-section"><h2>IT-Sicherheit &amp; Datenschutz</h2><table class="lesson-table"><tr><th>Stichwort</th><th>Merksatz</th></tr>'+
    '<tr><td>Schutzziele</td><td><strong>V</strong>ertraulichkeit &middot; <strong>I</strong>ntegrität &middot; <strong>V</strong>erfügbarkeit (+ Authentizität, Verbindlichkeit)</td></tr>'+
    '<tr><td>Verschlüsseln</td><td>mit dem <strong>öffentlichen</strong> Schlüssel des <strong>Empfängers</strong> &rarr; Vertraulichkeit</td></tr>'+
    '<tr><td>Signieren</td><td>mit dem <strong>privaten</strong> Schlüssel des <strong>Senders</strong> &rarr; Authentizität + Integrität</td></tr>'+
    '<tr><td>Hybrid (TLS)</td><td>asymmetrisch den Sitzungsschlüssel tauschen, dann symmetrisch (AES) übertragen</td></tr>'+
    '<tr><td>Backup 3-2-1</td><td>3 Kopien &middot; 2 Medientypen &middot; 1 außer Haus bzw. offline</td></tr>'+
    '<tr><td>Sicherungsarten</td><td>voll &middot; differenziell (seit letzter <em>Voll</em>) &middot; inkrementell (seit letzter <em>beliebiger</em>)</td></tr>'+
    '<tr><td>Virus vs. Wurm</td><td>Virus braucht Wirt + Benutzeraktion, Wurm verbreitet sich selbstständig</td></tr>'+
    '<tr><td>SQL-Injection</td><td>Gegenmittel: Prepared Statements mit Parametern + Eingabevalidierung</td></tr>'+
    '<tr><td>DSGVO-Fristen</td><td>Datenpanne binnen <strong>72 h</strong> melden &middot; Bußgeld bis 20 Mio. &euro; oder 4 % Jahresumsatz</td></tr>'+
    '<tr><td>DSGVO-Grundsätze</td><td>Zweckbindung &middot; Datenminimierung &middot; Speicherbegrenzung &middot; Richtigkeit &middot; Transparenz</td></tr>'+
    '<tr><td>RTO / RPO</td><td>RTO = maximale Ausfall<em>dauer</em> &middot; RPO = maximaler Daten<em>verlust</em> in Zeit</td></tr></table></div>';

  s += '<div class="sheet-section"><h2>Zahlensysteme</h2>'+codeBlock(
    "Stellenwerte binaer:  128  64  32  16   8   4   2   1\n\n"+
    "Hex-Tabelle (4 Bit = 1 Hex-Ziffer):\n"+
    "  0=0000  1=0001  2=0010  3=0011   4=0100  5=0101  6=0110  7=0111\n"+
    "  8=1000  9=1001  A=1010  B=1011   C=1100  D=1101  E=1110  F=1111\n\n"+
    "Subnetzmasken binaer:\n"+
    "  128=10000000  192=11000000  224=11100000  240=11110000\n"+
    "  248=11111000  252=11111100  254=11111110  255=11111111\n\n"+
    "ASCII 7 Bit = 128 Zeichen | UTF-8 variabel 1-4 Byte, Umlaut = 2 Byte"
  )+'</div>';

  s += '<div class="sheet-section"><h2>Projekt, Vertrag &amp; Vorgehen</h2><table class="lesson-table"><tr><th>Begriff</th><th>Kurzfassung</th></tr>'+
    '<tr><td>Lastenheft</td><td><strong>Auftraggeber</strong> &ndash; WAS und WOFÜR, lösungsneutral</td></tr>'+
    '<tr><td>Pflichtenheft</td><td><strong>Auftragnehmer</strong> &ndash; WIE und WOMIT, wird Vertragsbestandteil</td></tr>'+
    '<tr><td>Projektmerkmale</td><td>Ziel &middot; Zeit &middot; Ressourcen &middot; Organisation &middot; Einmaligkeit &middot; Komplexität</td></tr>'+
    '<tr><td>SMART</td><td>Spezifisch &middot; Messbar &middot; Akzeptiert &middot; Realistisch &middot; Terminiert</td></tr>'+
    '<tr><td>Magisches Dreieck</td><td>Zeit &ndash; Kosten &ndash; Qualität</td></tr>'+
    '<tr><td>Scrum</td><td>Product Owner (Was) &middot; Scrum Master (Prozess) &middot; Team (Wie)</td></tr>'+
    '<tr><td>Review vs. Retro</td><td>Review = Produkt &middot; Retrospektive = Zusammenarbeit</td></tr>'+
    '<tr><td>V-Modell</td><td>Anforderung&harr;Abnahmetest &middot; Grobentwurf&harr;Systemtest &middot; Feinentwurf&harr;Integrationstest &middot; Code&harr;Unit-Test</td></tr>'+
    '<tr><td>Werkvertrag</td><td>Erfolg geschuldet (Individualsoftware, Abnahme)</td></tr>'+
    '<tr><td>Dienstvertrag</td><td>Tätigkeit geschuldet (Beratung, Support)</td></tr>'+
    '<tr><td>Gewährleistung</td><td>gesetzlich, 2 Jahre, gegen den <strong>Verkäufer</strong></td></tr>'+
    '<tr><td>Garantie</td><td>freiwillig, meist vom <strong>Hersteller</strong></td></tr>'+
    '<tr><td>Mangel: Reihenfolge</td><td>1. Nacherfüllung &rarr; 2. Rücktritt / Minderung / Schadenersatz</td></tr></table></div>';

  s += '<div class="sheet-section"><h2>Künstliche Intelligenz</h2><table class="lesson-table"><tr><th>Stichwort</th><th>Merksatz</th></tr>'+
    '<tr><td>Einordnung</td><td>Deep Learning &sub; maschinelles Lernen &sub; Künstliche Intelligenz</td></tr>'+
    '<tr><td>Überwacht</td><td>Trainingsdaten <strong>mit Label</strong> &rarr; Klassifikation (Kategorie) oder Regression (Zahl)</td></tr>'+
    '<tr><td>Unüberwacht</td><td><strong>ohne Label</strong> &rarr; Clustering, Anomalieerkennung</td></tr>'+
    '<tr><td>Bestärkend</td><td>Belohnung und Bestrafung &rarr; Handlungsstrategie</td></tr>'+
    '<tr><td>Overfitting</td><td>Training gut, Test schlecht &ndash; auswendig gelernt</td></tr>'+
    '<tr><td>Underfitting</td><td>beides schlecht &ndash; Modell zu einfach</td></tr>'+
    '<tr><td>Bias</td><td>Verzerrung aus den Trainingsdaten, wird vom Modell verstärkt</td></tr>'+
    '<tr><td>Datenaufteilung</td><td>ca. 70 % Training &middot; 15 % Validierung &middot; 15 % Test</td></tr>'+
    '<tr><td>Halluzination</td><td>erfundene, aber plausibel formulierte Aussage eines Sprachmodells</td></tr>'+
    '<tr><td>RAG vs. Fine-Tuning</td><td>RAG ändert <em>worüber</em>, Fine-Tuning ändert <em>wie</em> das Modell antwortet</td></tr>'+
    '<tr><td>Datenvorbereitung</td><td>60&ndash;80 % des Aufwands eines KI-Projekts</td></tr>'+
    '<tr><td>Model Drift</td><td>Trefferquote sinkt, weil sich die Realität ändert &rarr; nachtrainieren</td></tr></table>'+
    '<p style="font-size:.8rem;color:var(--text-dim);"><strong>AI Act &ndash; vier Risikoklassen:</strong> unannehmbar = <em>verboten</em> (Social Scoring, Emotionserkennung am Arbeitsplatz) &middot; hoch = <em>Auflagen</em> inkl. menschlicher Aufsicht (Bewerberauswahl, Kredit, Medizin) &middot; begrenzt = <em>Transparenzpflicht</em> (Chatbot, Deepfake) &middot; minimal = <em>keine Auflagen</em> (Spamfilter).<br><strong>Recht:</strong> Art. 22 DSGVO &ndash; keine rein automatisierte Entscheidung mit erheblicher Wirkung &middot; Art. 28 AVV bei externen Diensten &middot; &sect; 87 BetrVG bei Leistungs- und Verhaltenskontrolle &middot; KI-Ergebnis ohne menschliche Schöpfung = <strong>kein</strong> Urheberrechtsschutz.</p></div>';

  s += '<div class="sheet-section"><h2>Objektorientierung kompakt</h2><table class="lesson-table"><tr><th>Begriff</th><th>Kurzfassung</th></tr>'+
    '<tr><td>Klasse</td><td>Bauplan, existiert <strong>einmal</strong> im Quelltext</td></tr>'+
    '<tr><td>Objekt / Instanz</td><td>konkrete Ausprägung zur Laufzeit, beliebig oft, eigene Attributwerte</td></tr>'+
    '<tr><td>Attribut</td><td>Eigenschaft, h&auml;lt den <em>Zustand</em></td></tr>'+
    '<tr><td>Methode</td><td><em>Verhalten</em>, geh&ouml;rt zur Klasse, existiert einmal im Speicher</td></tr>'+
    '<tr><td><strong>Kapselung</strong></td><td>Attribute <code>private</code>, Zugriff nur &uuml;ber Methoden &ndash; erlaubt Validierung</td></tr>'+
    '<tr><td><strong>Vererbung</strong></td><td>&bdquo;ist ein&ldquo; &ndash; Gemeinsames einmal in der Oberklasse</td></tr>'+
    '<tr><td><strong>Polymorphie</strong></td><td>gleicher Aufruf, unterschiedliches Verhalten je nach Objekttyp</td></tr>'+
    '<tr><td>Abstraktion</td><td>nur die relevanten Eigenschaften modellieren</td></tr>'+
    '<tr><td>&Uuml;berschreiben</td><td>Unterklasse ersetzt geerbte Methode, <strong>gleiche</strong> Signatur</td></tr>'+
    '<tr><td>&Uuml;berladen</td><td>gleicher Name, <strong>andere</strong> Parameterliste, selbe Klasse</td></tr>'+
    '<tr><td>abstrakte Klasse</td><td>nicht instanziierbar, gibt Struktur und Pflichtmethoden vor</td></tr>'+
    '<tr><td>Interface</td><td>reiner Vertrag, kein Zustand, <strong>beliebig viele</strong> pro Klasse</td></tr>'+
    '<tr><td>Konstruktor</td><td>Klassenname, <strong>kein</strong> R&uuml;ckgabetyp, stellt g&uuml;ltigen Startzustand her</td></tr>'+
    '<tr><td>statisch</td><td>geh&ouml;rt zur Klasse, nicht zum Objekt, in UML <u>unterstrichen</u></td></tr></table>'+
    '<p style="font-size:.8rem;color:var(--text-dim);"><strong>Entscheidungstests:</strong> <em>Ist ein</em> &rarr; Vererbung &middot; <em>hat ein</em> &rarr; Aggregation. Objekt in eine zweite Variable zuweisen kopiert die <strong>Referenz</strong>, nicht das Objekt. Statische Methode kann <strong>nicht</strong> auf Instanzattribute zugreifen. Ziel: <strong>hohe Koh&auml;sion, lose Kopplung</strong>.</p></div>';

  s += '<div class="sheet-section"><h2>Netzwerkgrundlagen</h2><table class="lesson-table"><tr><th></th><th>MAC-Adresse</th><th>IP-Adresse</th></tr>'+
    '<tr><td>Schicht / L&auml;nge</td><td>2 &middot; 48 Bit hexadezimal</td><td>3 &middot; 32 Bit (v4) bzw. 128 Bit (v6)</td></tr>'+
    '<tr><td>Vergabe</td><td>Hersteller (erste 3 Byte = OUI)</td><td>Netzbetreiber, ortsabh&auml;ngig</td></tr>'+
    '<tr><td>Reichweite</td><td>nur lokales Segment</td><td>netz&uuml;bergreifend routbar</td></tr>'+
    '<tr><td>Beim Hop</td><td><strong>wechselt</strong> bei jedem Router</td><td><strong>bleibt</strong> bis zum Ziel</td></tr></table>'+
    '<p style="font-size:.8rem;color:var(--text-dim);">F&uuml;r Ziele au&szlig;erhalb des eigenen Netzes l&ouml;st der Rechner per ARP die MAC des <strong>Gateways</strong> auf, nie die des Zielservers.</p>'+
    codeBlock(
    "KAPSELUNG - die Einheit je Schicht (PDU)\n"+
    "  7-5 Daten   |  4 Segment (TCP) / Datagramm (UDP)\n"+
    "  3   Paket   |  2 Frame  |  1 Bits\n\n"+
    "  Jede Schicht legt ihren Header davor, Schicht 2 zusaetzlich\n"+
    "  eine Pruefsumme dahinter. Empfaenger packt rueckwaerts aus.\n\n"+
    "OVERHEAD im Ethernet\n"+
    "  MTU 1.500 Byte  -  20 IP  -  20 TCP  =  1.460 Byte Nutzdaten\n"+
    "  Mit Rahmen, Praeambel und Paketabstand: 1.538 Byte je Frame\n"+
    "  -> rund 5 % Overhead. Deshalb nie die volle Nennrate.\n\n"+
    "DOMAENEN\n"+
    "  Switch trennt KOLLISIONSdomaenen  (jeder Port eine eigene)\n"+
    "  Router trennt BROADCASTdomaenen   (logisch auch ein VLAN)\n"+
    "  Hub    trennt gar nichts\n\n"+
    "UEBERTRAGUNGSARTEN\n"+
    "  Unicast   einer      | Broadcast  alle im Segment (ff:ff:...)\n"+
    "  Multicast Gruppe     | Anycast    der naechstgelegene\n"+
    "  IPv6 kennt KEINEN Broadcast.\n\n"+
    "PORTBEREICHE\n"+
    "  0 - 1023      Well Known   (Standarddienste)\n"+
    "  1024 - 49151  Registered\n"+
    "  49152 - 65535 Dynamic      (Quellports der Clients)\n"+
    "  Socket = IP + Port. Verbindung = Quell-IP/Port + Ziel-IP/Port.\n\n"+
    "NETZARTEN   PAN < LAN/WLAN < MAN < WAN\n"+
    "PEER-TO-PEER braucht n x (n-1) / 2 Beziehungen -> ab ca. 10\n"+
    "Arbeitsplaetzen Client-Server (zentrale Konten und Sicherung)."
  )+'</div>';

  s += '<div class="sheet-section"><h2>Verkabelung &amp; &Uuml;bertragungsmedien</h2><table class="lesson-table"><tr><th>Kategorie</th><th>Frequenz</th><th>Datenrate</th><th>L&auml;nge</th></tr>'+
    '<tr><td>Cat 5e</td><td>100 MHz</td><td>1 Gbit/s</td><td>100 m</td></tr>'+
    '<tr><td>Cat 6</td><td>250 MHz</td><td>1 Gbit/s (10 nur bis 55 m)</td><td>100 m</td></tr>'+
    '<tr><td><strong>Cat 6a</strong></td><td>500 MHz</td><td><strong>10 Gbit/s</strong></td><td>100 m</td></tr>'+
    '<tr><td>Cat 7</td><td>600 MHz</td><td>10 Gbit/s</td><td>100 m</td></tr>'+
    '<tr><td>Cat 8</td><td>2.000 MHz</td><td>25&ndash;40 Gbit/s</td><td>30 m</td></tr></table>'+
    '<p style="font-size:.8rem;color:var(--text-dim);"><strong>Die 100-m-Regel:</strong> 90 m Verlegekabel + 2 &times; 5 m Patchkabel. Schirmung: U/UTP ungeschirmt &middot; F/UTP Folie &middot; <strong>S/FTP</strong> Geflecht + Folie je Paar (bei Maschinen, Motoren, Leuchtstofflampen).</p>'+
    codeBlock(
    "GLASFASER\n"+
    "  Multimode   Kern 50/62,5 um, LED     bis ca.  550 m  im Gebaeude\n"+
    "  Singlemode  Kern 9 um,      Laser    viele Kilometer  zwischen Standorten\n"+
    "  Vorteile: keine EMV-Stoerung, galvanische Trennung (Blitz!),\n"+
    "            abhoersicher, grosse Reichweite\n\n"+
    "POE - Leistung AM ENDGERAET\n"+
    "  802.3af  PoE     12,95 W   | 802.3at  PoE+    25,5 W\n"+
    "  802.3bt  Typ 3   51 W      | 802.3bt  Typ 4   71 W\n"+
    "  ACHTUNG: Das PoE-BUDGET des Switches begrenzt die Summe.\n"+
    "  24 Ports heisst nicht 24 x PoE+.\n\n"+
    "STRUKTURIERTE VERKABELUNG (EN 50173)\n"+
    "  Primaer    zwischen Gebaeuden        Singlemode-LWL\n"+
    "  Sekundaer  Steigbereich im Gebaeude  meist Multimode-LWL\n"+
    "  Tertiaer   Etage bis Anschlussdose   Kupfer, max. 90 m\n\n"+
    "MEDIENWAHL - die drei Signalwoerter\n"+
    "  ueber 100 m          -> Glasfaser\n"+
    "  Stoerquellen         -> Schirmung oder Glasfaser\n"+
    "  keine Steckdose      -> PoE"
  )+'</div>';

  s += '<div class="sheet-section"><h2>Hardware &amp; Dimensionierung</h2><table class="lesson-table"><tr><th>Schnittstelle</th><th>Datenrate</th></tr>'+
    '<tr><td>USB 2.0</td><td>480 Mbit/s</td></tr>'+
    '<tr><td>USB 3.2 Gen 1 (fr&uuml;her 3.0)</td><td>5 Gbit/s</td></tr>'+
    '<tr><td>USB 3.2 Gen 2</td><td>10 Gbit/s</td></tr>'+
    '<tr><td>USB4 / Thunderbolt 4</td><td>40 Gbit/s</td></tr>'+
    '<tr><td>SATA III</td><td>6 Gbit/s (ca. 550 MB/s netto)</td></tr>'+
    '<tr><td>NVMe / PCIe 3.0 &times;4</td><td>ca. 3.500 MB/s</td></tr>'+
    '<tr><td>NVMe / PCIe 4.0 &times;4</td><td>ca. 7.000 MB/s</td></tr>'+
    '<tr><td>HDMI 2.1 / DisplayPort 1.4</td><td>48 / 32,4 Gbit/s</td></tr>'+
    '<tr><td>Gigabit- / 10-Gigabit-Ethernet</td><td>1 / 10 Gbit/s</td></tr></table>'+
    codeBlock(
    "NETZTEIL DIMENSIONIEREN\n"+
    "  Alle Leistungsaufnahmen addieren + 20 bis 30 % Reserve.\n"+
    "  Grund: Lastspitzen, Aufruestung, bester Wirkungsgrad\n"+
    "  bei etwa halber Auslastung. 80 PLUS Gold ~ 90 %.\n\n"+
    "USV - die Einheitenfalle\n"+
    "  W = VA x Leistungsfaktor   (haeufig 0,6 bis 0,9)\n"+
    "  1.000-VA-USV liefert bei 0,7 nur 700 W!\n"+
    "  Offline (Standby) | Line-interactive | Online (unterbrechungsfrei)\n\n"+
    "RAID - Nutzkapazitaet und Ausfallsicherheit\n"+
    "  RAID 0   n x Groesse    0 Ausfaelle   nur Tempo\n"+
    "  RAID 1   50 %           1 Ausfall     Spiegel\n"+
    "  RAID 5   (n-1) x Gr.    1 Ausfall     min. 3 Platten\n"+
    "  RAID 6   (n-2) x Gr.    2 Ausfaelle   min. 4 Platten\n"+
    "  RAID 10  50 %           je Spiegel 1  min. 4 Platten\n"+
    "  RAID ist KEIN Backup.\n\n"+
    "ANZEIGE\n"+
    "  Full HD 1920x1080 = 2.073.600 Pixel\n"+
    "  4K UHD  3840x2160 = 8.294.400 Pixel (vierfach)\n"+
    "  24 Bit True Color = 3 Byte je Pixel | 32 Bit = 4 (Alphakanal)\n"+
    "  Speicher je Vollbild = Pixel x Byte je Pixel\n\n"+
    "SPEICHER\n"+
    "  M.2 ist die BAUFORM, NVMe das PROTOKOLL.\n"+
    "  TBW = Schreiblebensdauer der SSD, RPM nur bei der HDD.\n"+
    "  Es begrenzt immer das langsamste Glied der Kette."
  )+'</div>';

  s += '<div class="sheet-section"><h2>Virtualisierung &amp; Cloud</h2><table class="lesson-table"><tr><th>Modell</th><th>Anbieter stellt</th><th>Du verwaltest</th></tr>'+
    '<tr><td><strong>IaaS</strong></td><td>Hardware, Virtualisierung, Netz</td><td>Betriebssystem, Laufzeit, Anwendung, Daten</td></tr>'+
    '<tr><td><strong>PaaS</strong></td><td>zus&auml;tzlich OS und Laufzeit</td><td>Anwendung und Daten</td></tr>'+
    '<tr><td><strong>SaaS</strong></td><td>alles bis zur fertigen Anwendung</td><td>nur Daten und Nutzerkonten</td></tr></table>'+
    '<p style="font-size:.8rem;color:var(--text-dim);"><strong>Die Daten bleiben in jedem Modell in deiner Verantwortung</strong> &ndash; auch bei SaaS. Der Anbieter ist Auftragsverarbeiter, AVV nach Art. 28 ist Pflicht. Bereitstellung: Public &middot; Private &middot; Hybrid &middot; Community.</p>'+
    codeBlock(
    "HYPERVISOR\n"+
    "  Typ 1 (Bare Metal)  direkt auf der Hardware  Rechenzentrum\n"+
    "  Typ 2 (Hosted)      als Programm im Wirts-OS Entwicklung, Test\n\n"+
    "VM GEGEN CONTAINER\n"+
    "               VM                      Container\n"+
    "  enthaelt     komplettes Gast-OS      nur App + Bibliotheken\n"+
    "  Groesse      mehrere GB              wenige bis hundert MB\n"+
    "  Start        Minuten                 Sekunden\n"+
    "  Isolation    sehr stark              gemeinsamer Kernel\n"+
    "  Merksatz: Die VM virtualisiert die HARDWARE,\n"+
    "            der Container das BETRIEBSSYSTEM.\n\n"+
    "VORTEILE DER VIRTUALISIERUNG\n"+
    "  Konsolidierung, bessere Auslastung, Isolation, Snapshots,\n"+
    "  Live-Migration, schnelle Bereitstellung\n"+
    "RISIKO: Der Host wird zum Single Point of Failure -> Cluster.\n"+
    "Ein SNAPSHOT ist KEIN Backup (liegt auf demselben Speicher).\n\n"+
    "CLOUD-NACHTEILE fuer die Begruendung\n"+
    "  Anbieterabhaengigkeit (Lock-in), Internetzwang, laufende\n"+
    "  Kosten statt einmaliger, weniger Kontrolle, Drittlandtransfer"
  )+'</div>';

  s += '<div class="sheet-section"><h2>Datenschutz in der Praxis</h2><table class="lesson-table"><tr><th></th><th>Datenschutz</th><th>Datensicherheit</th></tr>'+
    '<tr><td>Sch&uuml;tzt</td><td>die <strong>Person</strong></td><td>die <strong>Daten</strong></td></tr>'+
    '<tr><td>Frage</td><td><em>Darf</em> ich verarbeiten?</td><td><em>Wie</em> sch&uuml;tze ich technisch?</td></tr>'+
    '<tr><td>Gilt f&uuml;r</td><td>nur personenbezogene Daten</td><td>alle Daten</td></tr>'+
    '<tr><td>Grundlage</td><td>DSGVO, BDSG</td><td>BSI-Grundschutz, ISO 27001</td></tr></table>'+
    codeBlock(
    "BETROFFENENRECHTE - Artikel und Frist\n"+
    "  15 Auskunft        16 Berichtigung    17 Loeschung\n"+
    "  18 Einschraenkung  20 Uebertragbarkeit 21 Widerspruch\n"+
    "  FRIST: 1 Monat ab Eingang (+2 Monate moeglich, aber die\n"+
    "  Information darueber muss im ersten Monat raus). Kostenlos.\n"+
    "  Vor der Auskunft IDENTITAET PRUEFEN.\n\n"+
    "LOESCHRECHT hat Grenzen\n"+
    "  Rechnungen    10 Jahre (HGB, AO)\n"+
    "  Handelsbriefe  6 Jahre\n"+
    "  Bewerbungen    6 Monate (Klagefrist AGG)\n"+
    "  -> Bei Aufbewahrungspflicht SPERREN statt loeschen.\n\n"+
    "PFLICHTEN und SCHWELLEN\n"+
    "  Art. 30  Verarbeitungsverzeichnis   ab 250 MA, praktisch immer\n"+
    "  Art. 35  Folgenabschaetzung (DSFA)  bei hohem Risiko\n"+
    "  Art. 28  AVV mit Dienstleistern     immer bei Auftragsverarbeitung\n"+
    "  Art. 32  TOM                        immer\n"+
    "  Art. 33  Datenpanne melden          72 STUNDEN\n"+
    "  Art. 22  keine rein automatisierte Entscheidung\n"+
    "  DSB ab 20 Personen mit staendiger automatisierter Verarbeitung\n"+
    "  Bussgeld bis 20 Mio. EUR oder 4 % Jahresumsatz\n"+
    "  § 87 BetrVG: Mitbestimmung bei Leistungs-/Verhaltenskontrolle\n\n"+
    "ANONYM oder PSEUDONYM?\n"+
    "  anonymisiert   Bezug unwiderruflich weg  -> DSGVO gilt NICHT\n"+
    "  pseudonymisiert Bezug ueber Schluessel   -> DSGVO gilt WEITER\n\n"+
    "PRIVATE NUTZUNG VON MAIL UND INTERNET\n"+
    "  verboten und geregelt -> Kontrolle im erforderlichen Umfang\n"+
    "  erlaubt ODER GEDULDET -> Zugriff praktisch ausgeschlossen\n"+
    "  Stillschweigende Duldung wirkt wie eine Erlaubnis!"
  )+'</div>';

  s += '<div class="sheet-section"><h2>Datensicherheit im Betrieb</h2>'+codeBlock(
    "AAA - die vier Schritte\n"+
    "  Identifikation   Wer behauptest du zu sein?   Benutzername\n"+
    "  Authentifizierung Kannst du es beweisen?      Passwort, Token\n"+
    "  Autorisierung    Was darfst du?               Rechte\n"+
    "  Accounting       Was hast du getan?           Protokoll\n\n"+
    "DIE DREI FAKTOREN\n"+
    "  Wissen  (Passwort, PIN)\n"+
    "  Besitz  (Chipkarte, Token, Authenticator-App)\n"+
    "  Sein    (Fingerabdruck, Gesicht, Iris)\n"+
    "  MFA nur bei Faktoren aus VERSCHIEDENEN Kategorien.\n"+
    "  Passwort + Sicherheitsfrage ist KEINE MFA.\n\n"+
    "PASSWOERTER - Stand der Technik (BSI)\n"+
    "  Laenge schlaegt Komplexitaet, min. 12 Zeichen\n"+
    "  KEIN erzwungener Turnuswechsel mehr, nur bei Verdacht\n"+
    "  Speicherung: Hash + Salt mit bcrypt, scrypt oder Argon2\n\n"+
    "BERECHTIGUNGEN\n"+
    "  Need-to-know    nur die noetigen Daten\n"+
    "  Least Privilege nur die geringste noetige Stufe\n"+
    "  RBAC            Rechte an Rollen, Personen an Rollen\n"+
    "  Funktionstrennung: erfassen und freigeben nicht in einer Hand\n"+
    "  Rezertifizierung jaehrlich gegen den Berechtigungsstau\n"+
    "  Offboarding: Konto DEAKTIVIEREN, nicht loeschen\n\n"+
    "HAERTUNG - Angriffsflaeche verkleinern\n"+
    "  Dienste abschalten, Software deinstallieren, Ports schliessen,\n"+
    "  Standardpasswoerter aendern, Rechte minimieren, Protokollierung\n"+
    "  einschalten, unsichere Protokolle aus (Telnet, FTP, SMBv1)\n\n"+
    "SCHWACHSTELLEN\n"+
    "  Schwachstelle  kann ausgenutzt werden\n"+
    "  Exploit        der Code, der es tut\n"+
    "  CVE            weltweit eindeutige Kennung\n"+
    "  CVSS           Schwere 0,0 bis 10,0\n"+
    "  Zero-Day       noch kein Patch verfuegbar\n\n"+
    "  RISIKO = Eintrittswahrscheinlichkeit x Schadenshoehe\n"+
    "  Umgang: vermeiden | vermindern | ueberwaelzen | akzeptieren\n\n"+
    "NOTFALL\n"+
    "  Stoerung < Notfall < Krise < Katastrophe\n"+
    "  RTO  maximale Ausfall DAUER   -> Wiederanlaufverfahren\n"+
    "  RPO  maximaler DATENverlust   -> Sicherungsintervall\n"+
    "  Notfallhandbuch auch AUSGEDRUCKT bereithalten.\n"+
    "  Eine Sicherung ohne getesteten Restore ist keine Sicherung."
  )+'</div>';

  s += '<div class="sheet-section"><h2>Service, Qualit&auml;t &amp; Kommunikation</h2><table class="lesson-table"><tr><th>Begriff</th><th>Ziel</th></tr>'+
    '<tr><td><strong>Incident</strong></td><td>Betrieb schnellstm&ouml;glich wiederherstellen, notfalls Workaround</td></tr>'+
    '<tr><td><strong>Problem</strong></td><td>unbekannte Ursache finden und dauerhaft beseitigen</td></tr>'+
    '<tr><td><strong>Change</strong></td><td>geplante &Auml;nderung kontrolliert durchf&uuml;hren</td></tr>'+
    '<tr><td>Service Request</td><td>Standardanfrage ohne St&ouml;rung erf&uuml;llen</td></tr>'+
    '<tr><td>Known Error</td><td>Problem mit bekannter Ursache und Workaround</td></tr></table>'+
    codeBlock(
    "PRIORITAET = Auswirkung x Dringlichkeit (Matrix)\n\n"+
    "ESKALATION\n"+
    "  funktional (horizontal) -> mehr FACHWISSEN, Second Level\n"+
    "  hierarchisch (vertikal) -> mehr BEFUGNIS, Fuehrungsebene\n\n"+
    "VEREINBARUNGEN\n"+
    "  SLA  mit dem KUNDEN       OLA  INTERN zwischen Abteilungen\n"+
    "  UC   mit dem ZULIEFERER\n"+
    "  Reaktionszeit = Bearbeitung BEGINNT (nicht geloest!)\n"+
    "  Wiederherstellungszeit = Dienst laeuft wieder\n"+
    "  Verfuegbarkeit immer auf die SERVICEZEIT beziehen, wenn genannt\n\n"+
    "KENNZAHLEN\n"+
    "  MTTR  mittlere Reparaturdauer\n"+
    "  MTBF  mittlere Zeit zwischen Ausfaellen\n"+
    "  Verfuegbarkeit = MTBF / (MTBF + MTTR) x 100 %\n"+
    "  Erstloesungsquote First Level: Ziel 60 bis 80 %\n\n"+
    "QUALITAET\n"+
    "  ISO 9000: Qualitaet = Grad der ERFUELLUNG VON ANFORDERUNGEN\n"+
    "  PDCA: Plan - Do - Check - Act, danach von vorn (KVP)\n"+
    "  Check braucht eine MESSBARE Groesse.\n\n"+
    "VIER-OHREN-MODELL (Schulz von Thun)\n"+
    "  Sachinhalt        worueber informiere ich?\n"+
    "  Selbstoffenbarung was gebe ich von mir preis?\n"+
    "  Beziehung         wie stehe ich zu dir?\n"+
    "  Appell            wozu will ich bewegen?\n"+
    "  Im Support bewusst auf dem SACHOHR antworten.\n\n"+
    "FRAGEARTEN\n"+
    "  offen (W-Frage)  oeffnet, bringt Information -> Einstieg\n"+
    "  geschlossen      grenzt ein, bestaetigt\n"+
    "  Alternativfrage  lenkt zur Entscheidung\n"+
    "  Suggestivfrage   vermeiden\n"+
    "  Wichtigster Schritt: ZUSAMMENFASSEN und rueckversichern.\n\n"+
    "ICH-BOTSCHAFT: Wahrnehmung - Wirkung - Wunsch"
  )+'</div>';

  s += '<div class="sheet-section"><h2>Lizenzen &amp; Recht</h2><table class="lesson-table"><tr><th>Modell</th><th>Merkmal</th></tr>'+
    '<tr><td>OEM</td><td>fest an <strong>ein Ger&auml;t</strong> gebunden, erlischt mit ihm</td></tr>'+
    '<tr><td>Retail / Box</td><td>&uuml;bertragbar auf ein anderes Ger&auml;t</td></tr>'+
    '<tr><td>Volumenlizenz</td><td>ab Mindestmenge, zentral verwaltbar</td></tr>'+
    '<tr><td>Subscription</td><td>Miete, endet mit der Zahlung, Updates inklusive</td></tr>'+
    '<tr><td>User-CAL</td><td>je <strong>Person</strong> &ndash; g&uuml;nstiger bei vielen Ger&auml;ten je Person</td></tr>'+
    '<tr><td>Device-CAL</td><td>je <strong>Ger&auml;t</strong> &ndash; g&uuml;nstiger im Schichtbetrieb</td></tr>'+
    '<tr><td>Concurrent</td><td>nur <strong>gleichzeitige</strong> Nutzer</td></tr></table>'+
    '<p style="font-size:.8rem;color:var(--text-dim);"><strong>Z&auml;hlregel:</strong> Nimm das, wovon es weniger gibt. Mehr Personen als Ger&auml;te &rarr; Device-CAL. Mehr Ger&auml;te als Personen &rarr; User-CAL.</p>'+
    codeBlock(
    "OPEN SOURCE ist NICHT gleich KOSTENLOS\n"+
    "  Open Source  Quellcode offen, aenderbar, weitergebbar\n"+
    "  Freeware     kostenlos, ABER kein Quellcode\n"+
    "  Shareware    Test frei, danach kostenpflichtig\n"+
    "  proprietaer  geschlossen, nur nach Lizenzbedingungen\n\n"+
    "LIZENZFAMILIEN\n"+
    "  Copyleft (GPL, AGPL)   Weitergabe -> eigener Code muss offen\n"+
    "  permissiv (MIT, BSD, Apache 2.0)  auch in geschlossenen Produkten\n"+
    "  Copyleft greift bei WEITERGABE, nicht bei interner Nutzung.\n"+
    "  AGPL: schon die Bereitstellung im Netz gilt als Weitergabe.\n\n"+
    "URHEBERRECHT\n"+
    "  § 69a UrhG  Software ist geschuetzt\n"+
    "  § 69b UrhG  Verwertungsrechte aus dem Arbeitsverhaeltnis\n"+
    "              gehoeren dem ARBEITGEBER\n"+
    "  § 2 Abs. 2  Schutz braucht persoenliche geistige Schoepfung\n"+
    "              -> rein KI-erzeugtes Werk ist NICHT geschuetzt\n\n"+
    "VERTRAGSARTEN\n"+
    "  Werkvertrag   ERFOLG geschuldet   Individualsoftware, Abnahme\n"+
    "  Dienstvertrag TAETIGKEIT          Beratung, Support nach Aufwand\n"+
    "  Kaufvertrag   Standardsoftware, Hardware\n"+
    "  Mietvertrag   SaaS, Cloud\n\n"+
    "ABNAHME - vier Rechtsfolgen\n"+
    "  Verguetung faellig | Gewaehrleistung beginnt\n"+
    "  Gefahruebergang    | Beweislast kehrt sich um\n\n"+
    "Gewaehrleistung 2 Jahre, gesetzlich, gegen den VERKAEUFER.\n"+
    "Garantie freiwillig, meist vom HERSTELLER.\n"+
    "Mangel: erst NACHERFUELLUNG, dann Ruecktritt/Minderung/Schadenersatz."
  )+'</div>';

  s += '<div class="sheet-section"><h2>Struktogramm- und PAP-Symbole</h2>'+codeBlock(
    "STRUKTOGRAMM (Nassi-Shneiderman) - keine Pfeile, keine Spruenge\n\n"+
    "  +--------------------------+\n"+
    "  | Anweisung                |   Sequenz: Bloecke untereinander\n"+
    "  +--------------------------+\n"+
    "  | SOLANGE bedingung        |   kopfgesteuert: Rahmen OBEN\n"+
    "  |  +----------------------+|\n"+
    "  |  | Rumpf                ||\n"+
    "  |  +----------------------+|\n"+
    "  +--------------------------+\n"+
    "  |  +----------------------+|\n"+
    "  |  | Rumpf                ||   fussgesteuert: Rahmen UNTEN\n"+
    "  |  +----------------------+|\n"+
    "  | BIS bedingung            |\n"+
    "  +--------------------------+\n"+
    "  |        bedingung ?       |   Verzweigung: diagonal geteilt\n"+
    "  |   JA     /\\      NEIN    |\n"+
    "  +----------+---------------+\n"+
    "  | Zweig A  | Zweig B       |\n"+
    "  +----------+---------------+\n\n"+
    "PAP nach DIN 66001 - mit Pfeilen\n"+
    "  Oval             Start und Ende\n"+
    "  Parallelogramm   Ein- und Ausgabe\n"+
    "  Rechteck         Verarbeitung\n"+
    "  Raute            Verzweigung (ein Eingang, zwei Ausgaenge)\n"+
    "  Rechteck mit     Unterprogramm\n"+
    "   Doppelstrich\n"+
    "  Kreis            Konnektor\n\n"+
    "Unterschied: Im PAP sind Spruenge zeichenbar, im Struktogramm\n"+
    "nicht - das erzwingt strukturierte Programmierung."
  )+'</div>';

  s += '<div class="sheet-section"><h2>Abk&uuml;rzungen, die in der AP1 vorkommen</h2><table class="lesson-table"><tr><th>K&uuml;rzel</th><th>Bedeutung</th><th>K&uuml;rzel</th><th>Bedeutung</th></tr>'+
    '<tr><td>AVV</td><td>Auftragsverarbeitungsvertrag</td><td>MTU</td><td>Maximum Transmission Unit</td></tr>'+
    '<tr><td>APIPA</td><td>Selbstvergebene 169.254er-Adresse</td><td>MFA</td><td>Mehrfaktor-Authentifizierung</td></tr>'+
    '<tr><td>ARP</td><td>Address Resolution Protocol</td><td>NAS</td><td>Network Attached Storage (Dateien)</td></tr>'+
    '<tr><td>BCM</td><td>Business Continuity Management</td><td>NAT</td><td>Network Address Translation</td></tr>'+
    '<tr><td>BITV</td><td>Barrierefreie-Informationstechnik-Verordnung</td><td>OLA</td><td>Operational Level Agreement</td></tr>'+
    '<tr><td>CAL</td><td>Client Access License</td><td>OUI</td><td>Herstellerkennung der MAC</td></tr>'+
    '<tr><td>CIDR</td><td>Classless Inter-Domain Routing (/24)</td><td>PDU</td><td>Protocol Data Unit</td></tr>'+
    '<tr><td>CVE / CVSS</td><td>Schwachstellenkennung / -bewertung</td><td>PoE</td><td>Power over Ethernet</td></tr>'+
    '<tr><td>DHCP</td><td>Dynamische Adressvergabe (DORA)</td><td>PSP</td><td>Projektstrukturplan</td></tr>'+
    '<tr><td>DSFA</td><td>Datenschutz-Folgenabsch&auml;tzung</td><td>PUE</td><td>Power Usage Effectiveness</td></tr>'+
    '<tr><td>EUI-64</td><td>Interface-ID aus der MAC</td><td>RAG</td><td>Retrieval Augmented Generation</td></tr>'+
    '<tr><td>FAZ / FEZ</td><td>fr&uuml;hester Anfang / Ende</td><td>RBAC</td><td>Role Based Access Control</td></tr>'+
    '<tr><td>SAZ / SEZ</td><td>sp&auml;tester Anfang / Ende</td><td>RTO / RPO</td><td>Ausfalldauer / Datenverlust</td></tr>'+
    '<tr><td>GP / FP</td><td>Gesamt- / freier Puffer</td><td>SAN</td><td>Storage Area Network (Bl&ouml;cke)</td></tr>'+
    '<tr><td>ICMP</td><td>Protokoll hinter ping</td><td>SLAAC</td><td>IPv6-Autokonfiguration</td></tr>'+
    '<tr><td>KVP</td><td>Kontinuierlicher Verbesserungsprozess</td><td>TBW</td><td>Terabytes Written (SSD)</td></tr>'+
    '<tr><td>LWL</td><td>Lichtwellenleiter</td><td>TCO</td><td>Total Cost of Ownership</td></tr>'+
    '<tr><td>MTTR / MTBF</td><td>Reparaturdauer / Zeit zwischen Ausf&auml;llen</td><td>TOM</td><td>technisch-organisatorische Ma&szlig;nahmen</td></tr></table></div>';

  s += '<div class="sheet-section"><h2>Trockenlauf &amp; Fehlersuche</h2>'+codeBlock(
    "TROCKENLAUF - das Verfahren, das immer funktioniert\n"+
    "  1. Tabelle anlegen: eine Spalte je Variable, eine fuer die Zeile\n"+
    "  2. Startwerte eintragen (auch die vor der Schleife!)\n"+
    "  3. Zeile fuer Zeile abarbeiten, NUR geaenderte Werte neu schreiben\n"+
    "  4. Bei jeder Bedingung laut mitsprechen: wahr oder falsch?\n"+
    "  5. Ergebnis unten hinschreiben und gegen die Frage pruefen\n\n"+
    "  Zeile | i | summe | Bedingung | Bemerkung\n"+
    "  ------+---+-------+-----------+------------------\n"+
    "    2   | - |   0   |     -     | Start\n"+
    "    3   | 0 |   0   | 4>5 falsch| Rumpf uebersprungen\n\n"+
    "  Teilpunkte gibt es auf die TABELLE, nicht nur aufs Ergebnis.\n\n"+
    "WAHRHEITSTABELLEN\n"+
    "  A UND B  nur wahr, wenn BEIDE wahr sind\n"+
    "  A ODER B nur falsch, wenn BEIDE falsch sind\n"+
    "  NICHT A  dreht um\n"+
    "  De Morgan:  NICHT(A UND B) = NICHT A ODER NICHT B\n"+
    "              NICHT(A ODER B) = NICHT A UND NICHT B\n\n"+
    "DIE FUENF HAEUFIGSTEN LOGIKFEHLER\n"+
    "  1. Off-by-one      Grenze LAENGE statt LAENGE - 1\n"+
    "  2. Startwert       Maximum auf 0 statt auf feld[0]\n"+
    "  3. Laufvariable    wird im Rumpf nie veraendert -> Endlosschleife\n"+
    "  4. UND / ODER      vertauscht\n"+
    "  5. Zuweisung       = statt Vergleich, oder Tausch ohne Hilfsvariable\n\n"+
    "FEHLERARTEN\n"+
    "  Syntaxfehler  findet der Compiler\n"+
    "  Laufzeitfehler tritt beim Ausfuehren auf (Division durch 0)\n"+
    "  LOGIKFEHLER   Programm laeuft und rechnet falsch -> nur Test\n"+
    "                und Trockenlauf finden ihn"
  )+'</div>';

  s += '<div class="sheet-section"><h2>Testverfahren</h2><table class="lesson-table"><tr><th>Verfahren</th><th>Kenntnis des Codes</th><th>Grundlage</th></tr>'+
    '<tr><td><strong>Black Box</strong></td><td>nein</td><td>Spezifikation, Anforderungen</td></tr>'+
    '<tr><td><strong>White Box</strong></td><td>ja</td><td>innerer Aufbau, Pfade, Verzweigungen</td></tr>'+
    '<tr><td>Grey Box</td><td>teilweise</td><td>Mischform</td></tr></table>'+
    codeBlock(
    "AEQUIVALENZKLASSEN\n"+
    "  Eingaben in Gruppen einteilen, die sich gleich verhalten.\n"+
    "  Je Klasse genuegt EIN Vertreter.\n"+
    "  Beispiel Alter 18 bis 65:\n"+
    "     ungueltig zu klein   ... 17\n"+
    "     gueltig              18 ... 65\n"+
    "     ungueltig zu gross   66 ...\n"+
    "  -> drei Testfaelle, etwa 10, 40, 80\n\n"+
    "GRENZWERTANALYSE - an den Raendern wird es gefaehrlich\n"+
    "  Je Grenze drei Werte: darunter, auf der Grenze, darueber\n"+
    "  Bei 18 bis 65:  17, 18, 19   und   64, 65, 66\n"+
    "  Die meisten Fehler sitzen genau dort (< statt <=).\n\n"+
    "TESTSTUFEN - das V-Modell von unten nach oben\n"+
    "  Unit-Test        einzelne Methode      <-> Implementierung\n"+
    "  Integrationstest Zusammenspiel Module  <-> Feinentwurf\n"+
    "  Systemtest       Gesamtsystem          <-> Grobentwurf\n"+
    "  Abnahmetest      beim Kunden           <-> Anforderungen\n\n"+
    "WEITERE TESTARTEN fuer Nennaufgaben\n"+
    "  Regressionstest  Laeuft das Alte nach der Aenderung noch?\n"+
    "  Lasttest         Verhalten unter erwarteter Last\n"+
    "  Stresstest       Verhalten jenseits der Grenze\n"+
    "  Usability-Test   Bedienbarkeit mit echten Nutzern\n"+
    "  Penetrationstest Angriff auf die eigene Anwendung\n"+
    "  Smoke-Test       laeuft es ueberhaupt an?\n\n"+
    "TESTFALL - was hineingehoert\n"+
    "  Nummer | Vorbedingung | Eingabe | ERWARTETES Ergebnis |\n"+
    "  tatsaechliches Ergebnis | bestanden ja/nein\n"+
    "  Das erwartete Ergebnis steht VOR dem Test fest, nie danach."
  )+'</div>';

  s += '<div class="sheet-section"><h2>Netzdienste &amp; Diagnose</h2>'+codeBlock(
    "DHCP - der Ablauf heisst DORA\n"+
    "  Discover (Broadcast) - Offer - Request - Acknowledge\n"+
    "  Verteilt: IP, Subnetzmaske, Gateway, DNS-Server, Lease-Dauer\n"+
    "  Reservierung bindet eine feste IP an eine MAC-Adresse.\n"+
    "  Ports 67 (Server) und 68 (Client), ueber UDP, Schicht 7.\n\n"+
    "ARP - loest IP zu MAC im lokalen Netz auf\n"+
    "  Request per Broadcast, Reply per Unicast, Cache mit Ablauf.\n"+
    "  Fuer Ziele ausserhalb: MAC des GATEWAYS.\n"+
    "  Unauthentifiziert -> ARP-Spoofing moeglich.\n\n"+
    "DNS - Ressource Records\n"+
    "  A      Name -> IPv4        AAAA  Name -> IPv6\n"+
    "  CNAME  Alias               MX    Mailserver\n"+
    "  PTR    Reverse-Lookup      NS    zustaendiger Nameserver\n"+
    "  TXT    freier Text (SPF)   SOA   Zonenkopf\n"+
    "  Aufloesung: Root -> TLD (.de) -> autoritativer Server\n\n"+
    "WLAN\n"+
    "  WEP gebrochen | WPA veraltet | WPA2 (AES) Mindeststandard | WPA3\n"+
    "  Personal (PSK)    ein Passwort fuer alle\n"+
    "  Enterprise        802.1X mit RADIUS, Konten einzeln sperrbar\n"+
    "  Rollen: Supplicant - Authenticator - Authentication Server\n"+
    "  SSID verstecken und MAC-Filter sind KEINE Sicherheitsmassnahmen.\n\n"+
    "SPEICHER IM NETZ\n"+
    "  DAS  direkt am Server        nur dieser eine Server\n"+
    "  NAS  DATEIEN ueber SMB/NFS   guenstig, viele Clients\n"+
    "  SAN  BLOECKE ueber FC/iSCSI  schnell, fuer Datenbanken und VMs\n\n"+
    "DIAGNOSE - der Werkzeugkasten\n"+
    "  ipconfig /all       eigene Konfiguration inkl. MAC\n"+
    "  ipconfig /release   und  /renew    DHCP neu holen\n"+
    "  ping                Erreichbarkeit (ICMP)\n"+
    "  tracert             jeder Router auf dem Weg\n"+
    "  nslookup            Namensaufloesung pruefen\n"+
    "  arp -a              ARP-Cache anzeigen\n"+
    "  netstat -an         offene Ports und Verbindungen\n"+
    "  getmac /v           MAC-Adressen\n\n"+
    "DIE PING-KASKADE - von innen nach aussen\n"+
    "  127.0.0.1 -> eigene IP -> Gateway -> 8.8.8.8 -> google.de\n"+
    "  Wo es bricht, liegt der Fehler:\n"+
    "  bei 8.8.8.8 ok, Name nicht  -> DNS\n"+
    "  bis eigene IP ok, Gateway nicht -> Kabel, Switch, Maske"
  )+'</div>';

  s += '<div class="sheet-section"><h2>Kostenrechnung &amp; Kennzahlen</h2>'+codeBlock(
    "KOSTENARTEN\n"+
    "  Fixkosten Kf      unabhaengig von der Menge (Miete, AfA, Gehalt)\n"+
    "  variable kv       je Stueck (Material, Lizenz je Nutzer, Toner)\n"+
    "  Gesamtkosten      K = Kf + kv * x\n"+
    "  Stueckkosten      k = K / x\n\n"+
    "DECKUNGSBEITRAG UND BREAK-EVEN\n"+
    "  db = Preis - kv                     je Stueck\n"+
    "  Break-Even  x = Kf / (Preis - kv)\n"+
    "  Ab dem naechsten Stueck entsteht Gewinn.\n\n"+
    "VERFAHRENSVERGLEICH - kritische Menge\n"+
    "  Beide Kostenfunktionen GLEICHSETZEN und nach x aufloesen.\n"+
    "  Kf1 + kv1*x = Kf2 + kv2*x\n"+
    "  Probe mit einer Menge oberhalb und unterhalb machen -\n"+
    "  sonst vertauscht man die Richtung der Empfehlung.\n\n"+
    "ABSCHREIBUNG (linear)\n"+
    "  jaehrliche AfA = (Anschaffung - Restwert) / Nutzungsdauer\n"+
    "  Buchwert sinkt jedes Jahr um diesen Betrag.\n"+
    "  PC und Notebook: betriebsgewoehnlich drei Jahre.\n\n"+
    "AMORTISATION\n"+
    "  Dauer = Investition / jaehrlicher Rueckfluss\n"+
    "  0,25 = 3 Monate | 0,5 = 6 Monate | 0,75 = 9 Monate\n\n"+
    "KENNZAHLEN - die drei, die verwechselt werden\n"+
    "  Produktivitaet     = Ausbringung / Einsatz      MENGENmaessig\n"+
    "  Wirtschaftlichkeit = Ertrag / Aufwand           WERTmaessig, >1 gut\n"+
    "  Rentabilitaet      = Gewinn / Kapital * 100     in PROZENT\n"+
    "  ROI                = Gewinn / Investition * 100\n"+
    "  Auslastungsgrad    = Ist / Soll * 100\n\n"+
    "ABC-ANALYSE - der Schritt, der vergessen wird\n"+
    "  1. Jahresverbrauch x Preis = Jahreswert\n"+
    "  2. absteigend sortieren\n"+
    "  3. Prozentanteil\n"+
    "  4. KUMULIEREN  <- ohne diese Spalte geht es nicht\n"+
    "  5. Grenzen: bis 80 % = A, bis 95 % = B, Rest = C\n"+
    "  A  ~80 % Wert, ~20 % Menge  -> verhandeln\n"+
    "  C  ~ 5 % Wert, ~60 % Menge  -> Sammelbestellung\n\n"+
    "BESCHAFFUNG - die Kette\n"+
    "  Bedarf - Bezugsquellen - Anfrage - Angebotsvergleich -\n"+
    "  Bestellung - Wareneingang - Rechnungspruefung - Zahlung\n\n"+
    "PERT-SCHAETZUNG   tE = (O + 4M + P) / 6\n"+
    "PERSONENTAGE      20 PT bei 2 Personen = 10 Kalendertage,\n"+
    "                  aber nur wenn die Aufgabe teilbar ist."
  )+'</div>';

  s += '<div class="sheet-section"><h2>Arbeitsplatz, Ergonomie &amp; Energie</h2><table class="lesson-table"><tr><th>Anforderung</th><th>Wert</th></tr>'+
    '<tr><td>Blickrichtung zum Fenster</td><td><strong>parallel</strong> &ndash; nicht davor, nicht mit dem R&uuml;cken dazu</td></tr>'+
    '<tr><td>Beleuchtungsst&auml;rke</td><td>mindestens <strong>500 Lux</strong>, blendfrei</td></tr>'+
    '<tr><td>Sehabstand</td><td>50&ndash;80 cm, oberste Zeile <strong>unter</strong> Augenh&ouml;he</td></tr>'+
    '<tr><td>K&ouml;rperhaltung</td><td>Ober-/Unterarm und Ober-/Unterschenkel je etwa 90&deg;</td></tr>'+
    '<tr><td>Tischh&ouml;he</td><td>ca. 72 cm oder h&ouml;henverstellbar</td></tr>'+
    '<tr><td>Fl&auml;che je Arbeitsplatz</td><td>mindestens 8&ndash;10 m&sup2;</td></tr>'+
    '<tr><td>L&auml;rm im B&uuml;ro</td><td>unter 55 dB(A)</td></tr>'+
    '<tr><td>Bildschirm</td><td>entspiegelt, dreh- und neigbar, h&ouml;henverstellbar</td></tr></table>'+
    codeBlock(
    "STROMKOSTEN - die Standardaufgabe\n"+
    "  kWh   = Watt x Stunden / 1.000\n"+
    "  Kosten = kWh x Preis je kWh\n"+
    "  Arbeitstage ca. 220 im Jahr | Kalendertage 365 | 24/7 = 8.760 h\n\n"+
    "  Beispiel: 20 PCs a 120 W, 9 h/Tag, 220 Tage, 0,32 EUR/kWh\n"+
    "     20 x 120 x 9 x 220 = 4.752.000 Wh = 4.752 kWh\n"+
    "     4.752 x 0,32 = 1.520,64 EUR pro Jahr\n"+
    "  Haeufigster Fehler: Division durch 1.000 vergessen.\n\n"+
    "WIRKUNGSGRAD UND EFFIZIENZ\n"+
    "  Wirkungsgrad = abgegeben / zugefuehrt x 100 %\n"+
    "  PUE (Rechenzentrum) = Gesamtenergie / IT-Energie  ideal 1,0\n"+
    "  80 PLUS: Bronze ~85 %, Gold ~90 %, Platinum ~92 %\n\n"+
    "GREEN IT - Massnahmen fuer Nennaufgaben\n"+
    "  Servervirtualisierung statt vieler physischer Maschinen\n"+
    "  Thin Clients | Standby abschalten | Abwaerme nutzen\n"+
    "  freie Kuehlung | laengere Nutzungsdauer | Druck reduzieren\n"+
    "  Guetezeichen: Energy Star, Blauer Engel, TCO\n"+
    "  Entsorgung nach ElektroG, Datentraeger vorher loeschen\n\n"+
    "BARRIEREFREIHEIT (BITV 2.0, WCAG)\n"+
    "  Vier Prinzipien: wahrnehmbar, bedienbar, verstaendlich, robust\n"+
    "  Kontrast mindestens 4,5:1 (grosse Schrift 3:1)\n"+
    "  vollstaendige Tastaturbedienung, Alternativtexte,\n"+
    "  keine reine Farbcodierung, Untertitel\n"+
    "  Software-Ergonomie: EN ISO 9241-110\n"+
    "  (Aufgabenangemessenheit, Selbstbeschreibungsfaehigkeit,\n"+
    "   Steuerbarkeit, Erwartungskonformitaet, Fehlertoleranz,\n"+
    "   Individualisierbarkeit, Lernfoerderlichkeit)"
  )+'</div>';

  s += '<div class="sheet-section"><h2>Rechnerarchitektur &amp; Speicher</h2>'+codeBlock(
    "EVA / EVAS\n"+
    "  Eingabe - Verarbeitung - Ausgabe (+ Speicherung)\n\n"+
    "VON NEUMANN - die fuenf Bausteine\n"+
    "  1 Steuerwerk      holt und dekodiert Befehle\n"+
    "  2 Rechenwerk ALU  rechnet und vergleicht\n"+
    "  3 Speicherwerk    Befehle UND Daten gemeinsam\n"+
    "  4 Ein-/Ausgabe    Verbindung nach aussen\n"+
    "  5 Bussystem       verbindet alles\n"+
    "  Steuerwerk + Rechenwerk = CPU\n"+
    "  Kern: Befehle und Daten im selben Speicher\n"+
    "        -> universell, aber Von-Neumann-Flaschenhals\n"+
    "  Harvard: getrennte Speicher/Busse -> Mikrocontroller, Caches\n\n"+
    "BEFEHLSZYKLUS\n"+
    "  FETCH -> DECODE -> EXECUTE -> WRITE BACK -> Befehlszaehler +1\n"+
    "  Ein Befehl braucht MEHRERE Takte.\n"+
    "  3 GHz = 3 Mrd Takte/s, sagt allein wenig ueber die Leistung.\n\n"+
    "DIE DREI BUSSE\n"+
    "  Datenbus    die Werte              beide Richtungen\n"+
    "  Adressbus   die Speicheradresse    nur von der CPU weg\n"+
    "  Steuerbus   Lesen/Schreiben/Takt   beide Richtungen\n\n"+
    "  Adressbusbreite n  ->  2^n adressierbare Zellen\n"+
    "     20 Leitungen = 1 MiB     30 Leitungen = 1 GiB\n"+
    "     32 Leitungen = 4 GiB  <- Grenze jedes 32-Bit-Systems\n\n"+
    "SPEICHERPYRAMIDE - oben schnell/klein/teuer\n"+
    "  Register     < 1 ns      fluechtig\n"+
    "  Cache L1-L3  1-20 ns     fluechtig\n"+
    "  RAM          ~ 80 ns     fluechtig\n"+
    "  ----------------------------- Trennlinie -----------------\n"+
    "  SSD/NVMe     ~ 50 us     nichtfluechtig\n"+
    "  HDD/Band     ms bis min  nichtfluechtig\n"+
    "  ROM/Flash (Firmware) ist ebenfalls nichtfluechtig.\n"+
    "  Cache wirkt wegen des LOKALITAETSPRINZIPS (zeitlich/raeumlich).\n\n"+
    "ZEICHEN KODIEREN\n"+
    "  ASCII        7 Bit, 128 Zeichen, keine Umlaute\n"+
    "  ISO 8859-1   8 Bit, 256 Zeichen, westeuropaeisch\n"+
    "  UTF-8        1 bis 4 Byte je Zeichen, alle Schriften\n"+
    "  -> Zeichenanzahl ist NICHT gleich Byteanzahl.\n"+
    "     Umlaut = 2 Byte, Emoji = 4 Byte\n\n"+
    "ZAHLEN DARSTELLEN\n"+
    "  Zweierkomplement: alle Bits kippen, dann +1\n"+
    "     -5 als Byte:  0000 0101 -> 1111 1010 -> 1111 1011\n"+
    "  Wertebereiche\n"+
    "      8 Bit ohne Vorzeichen        0 .. 255\n"+
    "      8 Bit mit  Vorzeichen     -128 .. +127\n"+
    "     16 Bit mit  Vorzeichen  -32.768 .. +32.767\n"+
    "     32 Bit mit  Vorzeichen   rund -2,1 .. +2,1 Mrd\n"+
    "  Gleitkomma (IEEE 754): Vorzeichen, Exponent, Mantisse\n"+
    "     0,1 + 0,2 ist nicht exakt 0,3 -> Geld NIE als Float,\n"+
    "     sondern in Cent als Ganzzahl oder als Dezimaltyp.\n\n"+
    "LOGISCHE GATTER\n"+
    "  A B | UND ODER XOR NAND NOR\n"+
    "  0 0 |  0    0    0    1   1\n"+
    "  0 1 |  0    1    1    1   0\n"+
    "  1 0 |  0    1    1    1   0\n"+
    "  1 1 |  1    1    0    0   0\n"+
    "  XOR = genau einer -> prueft auf Ungleichheit\n"+
    "  Halbaddierer: XOR = Summe, UND = Uebertrag\n"+
    "  n Eingaenge -> 2^n Zeilen in der Wahrheitstabelle\n\n"+
    "DE MORGAN - beim Verneinen BEIDES tun\n"+
    "  NICHT (A UND  B) = (NICHT A) ODER (NICHT B)\n"+
    "  NICHT (A ODER B) = (NICHT A) UND  (NICHT B)\n"+
    "  Also: jeden Vergleich umdrehen UND die Verknuepfung tauschen."
  )+'</div>';

  s += '<div class="sheet-section"><h2>Betriebssystem, Prozesse &amp; Systemstart</h2>'+codeBlock(
    "FUENF KERNAUFGABEN\n"+
    "  Prozess- | Speicher- | Datei- | Geraete- | Benutzerverwaltung\n"+
    "  Dazu: einheitliche Schnittstelle, die Hardware verbirgt.\n\n"+
    "KERNEL- GEGEN BENUTZERMODUS\n"+
    "  Kernel-Modus   voller Hardwarezugriff (Kernel, Treiber)\n"+
    "  Benutzermodus  nur ueber Systemaufrufe (Anwendungen)\n"+
    "  Anwendung stuerzt ab -> nur der Prozess endet\n"+
    "  Treiber stuerzt ab   -> Bluescreen / Kernel Panic\n\n"+
    "PROZESS, THREAD, MULTITASKING\n"+
    "  Programm = Datei | Prozess = Programm in Ausfuehrung\n"+
    "  Thread   = Strang IM Prozess, teilt dessen Speicher\n"+
    "             -> schnell, aber Race Conditions moeglich\n"+
    "  Praeemptiv: das BS entzieht die CPU notfalls\n\n"+
    "PROZESSZUSTAENDE - drei Zustaende, vier Uebergaenge\n"+
    "        Zuteilung\n"+
    "  bereit --------> rechnend\n"+
    "    ^   <--------     |\n"+
    "    |   Verdraengung  | wartet auf E/A\n"+
    "    |                 v\n"+
    "    +----------- blockiert\n"+
    "         E/A fertig\n"+
    "  FALLE: von blockiert geht es NIE direkt nach rechnend.\n\n"+
    "SCHEDULING\n"+
    "  FCFS          Reihenfolge des Eintreffens | langer Job blockiert\n"+
    "  SJF           kuerzester zuerst           | lange verhungern\n"+
    "  Round Robin   feste Zeitscheibe           | fuer interaktiv\n"+
    "  Prioritaet    hoechste zuerst             | niedrige verhungern\n"+
    "  Durchlaufzeit = Ende - Ankunft\n\n"+
    "VIRTUELLER SPEICHER\n"+
    "  Seiten (Pages, meist 4 KiB), Seitentabelle, MMU\n"+
    "  Nutzen: 1 mehr Speicher als physisch vorhanden\n"+
    "          2 Isolation der Prozesse (Sicherheit)\n"+
    "          3 keine Fragmentierung noetig\n"+
    "  Seitenfehler = Seite nachladen (normal)\n"+
    "  THRASHING    = staendiges Ein-/Auslagern\n"+
    "     Symptom: System zaeh, Platte dauernd aktiv, CPU NIEDRIG\n"+
    "     Abhilfe: mehr RAM. Groessere Auslagerungsdatei hilft NICHT.\n\n"+
    "SYMPTOM -> URSACHE\n"+
    "  CPU hoch,    Platte ruhig      rechenintensives Programm\n"+
    "  CPU niedrig, Platte dauernd    Thrashing, zu wenig RAM\n"+
    "  CPU niedrig, Platte ruhig      Netz oder externer Dienst\n\n"+
    "BOOTVORGANG\n"+
    "  Firmware -> POST -> Bootmedium -> Bootloader -> Kernel -> Dienste\n\n"+
    "  Kein Luefter, keine LED        Netzteil/Strom\n"+
    "  Signaltoene, kein Bild         POST: RAM oder Grafik\n"+
    "  No bootable device             Bootreihenfolge/Datentraeger\n"+
    "  Uhr steht nach jedem Aus       CMOS-Knopfzelle leer\n"+
    "  Stick startet nicht            Secure Boot aktiv\n"+
    "  Immer von unten nach oben pruefen - wie beim OSI-Modell.\n\n"+
    "BIOS GEGEN UEFI\n"+
    "                 BIOS          UEFI\n"+
    "  Partitionen    MBR           GPT\n"+
    "  Startplatte    max 2 TiB     praktisch unbegrenzt\n"+
    "  Primaere Part. 4             128 und mehr\n"+
    "  Sicherheit     keine         Secure Boot\n"+
    "  Bedienung      Text          grafisch, Maus, Netz"
  )+'</div>';

  s += '<div class="sheet-section"><h2>Systemarchitekturen &amp; Verf&uuml;gbarkeit</h2>'+codeBlock(
    "SERVERBAUFORMEN\n"+
    "  Tower  wie ein grosser PC     1-2 Server, kein Serverraum\n"+
    "  Rack   19 Zoll, in HE         Standardfall\n"+
    "  Blade  geteiltes Gehaeuse     hohe Dichte\n\n"+
    "  1 HE = 44,45 mm | uebliches Rack = 42 HE\n"+
    "  Rack-Rechnung: Server + Switches + Patchfelder + USV,\n"+
    "  dann Reserve fuer Erweiterung abziehen.\n\n"+
    "SERVERRAUM - je Ebene etwas nennen\n"+
    "  baulich        Brandschutz, Zutrittskontrolle, Klima\n"+
    "  technisch      Kuehlung, USV, Redundanz, Monitoring\n"+
    "  organisator.   Zutrittsprotokoll, Wartungsplan, Notfallplan\n"+
    "  Kalt-/Warmgang: Rackfronten stehen sich gegenueber.\n"+
    "  Kuehlleistung ~ elektrische Leistung der Server.\n"+
    "  N+1: eine Einheit mehr als noetig (Klima, Netzteil, Luefter).\n\n"+
    "SKALIERUNG\n"+
    "                 vertikal (Scale-up)  horizontal (Scale-out)\n"+
    "  Vorgehen       Maschine staerken    Maschinen dazustellen\n"+
    "  Grenze         technisch erschoepft praktisch unbegrenzt\n"+
    "  Ausfallschutz  keiner               ja\n"+
    "  Aufruesten     mit Ausfallzeit      im Betrieb\n"+
    "  Merksatz: vertikal ist einfacher, horizontal ist besser.\n\n"+
    "  Load Balancer: Round Robin, wenigste Verbindungen, gewichtet\n"+
    "  ACHTUNG Sitzungspersistenz - sonst ist der Benutzer\n"+
    "  nach dem naechsten Klick abgemeldet.\n\n"+
    "  Cluster  Aktiv-Passiv = Standby uebernimmt (Failover)\n"+
    "           Aktiv-Aktiv  = alle arbeiten, teilen die Last\n\n"+
    "VERFUEGBARKEIT RECHNEN\n"+
    "  V = (Gesamtzeit - Ausfallzeit) / Gesamtzeit x 100 %\n"+
    "  Jahr = 8.760 h = 525.600 min\n"+
    "     99     %  ->  3,65 Tage Ausfall\n"+
    "     99,9   %  ->  8,8 Stunden\n"+
    "     99,99  %  ->  52,6 Minuten\n"+
    "     99,999 %  ->  5,3 Minuten\n\n"+
    "  Redundanz: zwei UNABHAENGIGE Systeme, eines genuegt\n"+
    "     0,01 x 0,01 = 0,0001  ->  aus 99 % wird 99,99 %\n"+
    "     Gilt nur bei echter Unabhaengigkeit (Strom, Switch, Raum).\n\n"+
    "  RTO = maximale Ausfalldauer\n"+
    "  RPO = maximaler Datenverlust in Zeit -> Sicherungsintervall\n\n"+
    "ARBEITSPLATZMODELLE\n"+
    "                  Fat Client   Thin Client   VDI\n"+
    "  Rechenleistung  lokal        Server        eigene VM\n"+
    "  Wartung         je Geraet    zentral       zentral\n"+
    "  Offline         ja           nein          nein\n"+
    "  Daten lokal     ja (Risiko)  nein          nein\n"+
    "  Lebensdauer     3-5 Jahre    7-10 Jahre    7-10 Jahre\n"+
    "  Gegenargument: ohne Netz geht nichts, Server = SPOF,\n"+
    "  CAD/Video laufen auf geteiltem Server schlecht.\n\n"+
    "DREI-SCHICHTEN-ARCHITEKTUR\n"+
    "  Praesentation | Logik | Datenhaltung\n"+
    "  Zweck: Austauschbarkeit - neue Oberflaeche ohne neue Logik,\n"+
    "  andere Datenbank ohne neue Oberflaeche.\n\n"+
    "EMBEDDED UND IoT\n"+
    "  Mikroprozessor  nur CPU, Speicher extra\n"+
    "  Mikrocontroller CPU + Speicher + Schnittstellen auf einem Chip\n"+
    "  Echtzeit heisst GARANTIERT RECHTZEITIG, nicht schnell\n"+
    "     hart  = Fristverletzung ist ein Fehler (Airbag, Notaus)\n"+
    "     weich = mindert nur die Qualitaet (Videostream)\n"+
    "  Kette: Sensor -> Controller -> Aktor, dazu Gateway -> Cloud\n"+
    "  Edge Computing: 1 Latenz  2 Datenmenge  3 Ausfallsicherheit"
  )+'</div>';

  s += '<div class="sheet-section"><h2>Befehle f&uuml;r die Pr&uuml;fung &ndash; Windows und Linux</h2>'+codeBlock(
    "NETZWERK - die wichtigsten zuerst\n"+
    "  Windows                Linux                 zeigt / tut\n"+
    "  ipconfig               ip a  (ifconfig)      IP, Maske, Gateway\n"+
    "  ipconfig /all          ip a ; ip r           ZUSAETZLICH MAC,\n"+
    "                                               DNS, DHCP, Lease\n"+
    "  ipconfig /release      dhclient -r           DHCP-Lease abgeben\n"+
    "  ipconfig /renew        dhclient              DHCP neu anfordern\n"+
    "  ipconfig /flushdns     resolvectl flush-...  DNS-Cache leeren\n"+
    "  ping ziel              ping ziel             Erreichbarkeit ICMP\n"+
    "  tracert ziel           traceroute ziel       jeder Router im Weg\n"+
    "  pathping ziel          mtr ziel              Weg + Paketverlust\n"+
    "  nslookup name          dig name / host name  Namensaufloesung\n"+
    "  arp -a                 ip neigh              ARP-Cache\n"+
    "  getmac /v              ip link               MAC-Adressen\n"+
    "  netstat -an            ss -tuln              offene Ports\n"+
    "  netstat -rn            ip route              Routingtabelle\n"+
    "  route print            ip route              dasselbe\n"+
    "  telnet host port       nc -vz host port      Port erreichbar?\n\n"+
    "  MERKE: ohne /all zeigt ipconfig KEINE MAC-Adresse.\n"+
    "  Wird nach der physischen Adresse gefragt, ist /all Pflicht.\n\n"+
    "SYSTEM UND DIAGNOSE\n"+
    "  systeminfo             uname -a ; lscpu      Systemuebersicht\n"+
    "  tasklist               ps aux                laufende Prozesse\n"+
    "  taskkill /PID n /F     kill -9 PID           Prozess beenden\n"+
    "  taskmgr                top / htop            Auslastung live\n"+
    "  eventvwr               journalctl -xe        Ereignisprotokoll\n"+
    "  msinfo32               dmidecode             Hardwareinfo\n"+
    "  gpupdate /force        --                    Richtlinien neu\n"+
    "  gpresult /r            --                    wirksame Richtlinien\n"+
    "  shutdown /r /t 0       reboot                Neustart\n\n"+
    "DATENTRAEGER UND DATEIEN\n"+
    "  chkdsk C: /f           fsck /dev/sda1        Dateisystem pruefen\n"+
    "  sfc /scannow           --                    Systemdateien pruefen\n"+
    "  diskpart               fdisk / parted        Partitionen\n"+
    "  dir                    ls -l                 Verzeichnis\n"+
    "  --                     df -h                 freier Platz\n"+
    "  --                     du -sh ordner         Groesse eines Ordners\n"+
    "  xcopy / robocopy       rsync -av             kopieren, spiegeln\n"+
    "  icacls datei           chmod / chown         Rechte setzen\n\n"+
    "BENUTZER UND RECHTE\n"+
    "  net user               cat /etc/passwd       Konten anzeigen\n"+
    "  net user name *        passwd name           Passwort setzen\n"+
    "  net localgroup         groups name           Gruppen\n"+
    "  whoami /groups         id                    eigene Rechte\n\n"+
    "DIENSTE\n"+
    "  services.msc           systemctl status x    Dienst ansehen\n"+
    "  net start / net stop   systemctl start/stop  starten/anhalten\n"+
    "  sc query               systemctl list-units  alle Dienste\n\n"+
    "DIE PING-KASKADE - von innen nach aussen\n"+
    "  1 ping 127.0.0.1    TCP/IP-Stack des Betriebssystems\n"+
    "  2 ping <eigene IP>  eigene Netzwerkkarte\n"+
    "  3 ping <Gateway>    lokales Netz, Kabel, Switch, Maske\n"+
    "  4 ping 8.8.8.8      Routing nach aussen\n"+
    "  5 ping google.de    DNS\n"+
    "  Wo es bricht, liegt der Fehler. 4 ok und 5 nicht -> DNS.\n\n"+
    "AUSGABEN LESEN\n"+
    "  ping: Zeit=12ms TTL=118\n"+
    "     TTL sinkt je Hop. Start 64/128/255 je Betriebssystem.\n"+
    "     Zeitueberschreitung = keine Antwort, nicht zwingend offline\n"+
    "     (ICMP kann geblockt sein).\n"+
    "  netstat-Status\n"+
    "     LISTENING   Dienst wartet auf Verbindungen\n"+
    "     ESTABLISHED Verbindung steht\n"+
    "     TIME_WAIT   Verbindung wird gerade abgebaut"
  )+'</div>';

  s += '<div class="sheet-section"><h2>Adressen, Ports und Masken auf einen Blick</h2>'+codeBlock(
    "SONDERADRESSEN IPv4\n"+
    "  10.0.0.0/8        privat (RFC 1918)\n"+
    "  172.16.0.0/12     privat - also 172.16 bis 172.31\n"+
    "  192.168.0.0/16    privat\n"+
    "  127.0.0.1         Loopback, das bist du selbst\n"+
    "  169.254.0.0/16    APIPA - KEIN DHCP-Server erreichbar\n"+
    "  0.0.0.0           Standardroute bzw. unbestimmt\n"+
    "  255.255.255.255   Broadcast im lokalen Netz\n"+
    "  224.0.0.0/4       Multicast\n"+
    "  8.8.8.8 / 1.1.1.1 oeffentliche DNS-Server (zum Testen)\n\n"+
    "SONDERADRESSEN IPv6\n"+
    "  ::1/128           Loopback\n"+
    "  fe80::/10         Link-Local, selbst erzeugt, nicht routbar\n"+
    "  fc00::/7          Unique Local (privat)\n"+
    "  2000::/3          Global Unicast, weltweit routbar\n"+
    "  ff00::/8          Multicast - IPv6 kennt KEINEN Broadcast\n"+
    "  ::                unbestimmt\n\n"+
    "PORTS - die musst du kennen\n"+
    "   20/21  FTP            67/68  DHCP (Server/Client, UDP)\n"+
    "   22     SSH / SFTP     69     TFTP\n"+
    "   23     Telnet         80     HTTP\n"+
    "   25     SMTP          110     POP3\n"+
    "   53     DNS           143     IMAP\n"+
    "  389     LDAP          161     SNMP\n"+
    "  443     HTTPS         445     SMB / CIFS\n"+
    "  587     SMTP (Submission)    993  IMAPS\n"+
    "  636     LDAPS         995     POP3S\n"+
    " 1433     MS SQL       3306     MySQL / MariaDB\n"+
    " 3389     RDP          5432     PostgreSQL\n\n"+
    "  Bereiche\n"+
    "      0 - 1023   Well Known - Standarddienste\n"+
    "   1024 - 49151  Registered - registrierte Anwendungen\n"+
    "  49152 - 65535  Dynamic    - zufaellige Quellports der Clients\n"+
    "  Socket = IP + Port. Eine Verbindung = vier Werte\n"+
    "  (Quell-IP, Quell-Port, Ziel-IP, Ziel-Port).\n\n"+
    "SUBNETZMASKEN - die Zeile aufs Konzeptpapier\n"+
    "  Oktettwerte: 128 192 224 240 248 252 254 255\n\n"+
    "  /24  255.255.255.0     254 Hosts   Blockgroesse 256\n"+
    "  /25  255.255.255.128   126 Hosts   Blockgroesse 128\n"+
    "  /26  255.255.255.192    62 Hosts   Blockgroesse  64\n"+
    "  /27  255.255.255.224    30 Hosts   Blockgroesse  32\n"+
    "  /28  255.255.255.240    14 Hosts   Blockgroesse  16\n"+
    "  /29  255.255.255.248     6 Hosts   Blockgroesse   8\n"+
    "  /30  255.255.255.252     2 Hosts   Punkt-zu-Punkt\n\n"+
    "  Blockgroesse = 256 - Maskenwert des interessanten Oktetts.\n"+
    "  Netze beginnen bei Vielfachen davon.\n"+
    "  Hosts = 2^Hostbits - 2 (Netz- und Broadcastadresse).\n"+
    "  Broadcast = naechste Netzadresse minus 1.\n\n"+
    "ZWEIERPOTENZEN - im Kopf haben\n"+
    "  2^1=2      2^5=32     2^9=512     2^13=8.192\n"+
    "  2^2=4      2^6=64     2^10=1.024  2^14=16.384\n"+
    "  2^3=8      2^7=128    2^11=2.048  2^15=32.768\n"+
    "  2^4=16     2^8=256    2^12=4.096  2^16=65.536\n"+
    "  2^20 = 1 Mi   2^30 = 1 Gi   2^32 = rund 4,3 Mrd\n"+
    "  log2: 1.024 -> 10 | 1 Mio -> 20 | 1 Mrd -> 30"
  )+'</div>';

  s += '<div class="sheet-section"><h2>Dateisysteme &amp; Datentr&auml;ger</h2>'+codeBlock(
    "DATEISYSTEME IM VERGLEICH\n"+
    "  FAT32   max. Dateigroesse 4 GiB, max. Volume 2 TiB\n"+
    "          ueberall lesbar -> kleine USB-Sticks, Kameras\n"+
    "  exFAT   keine 4-GiB-Grenze, Windows/macOS/Linux\n"+
    "          -> grosse USB-Sticks und externe Platten\n"+
    "  NTFS    Rechte (ACL), Journal, Verschluesselung,\n"+
    "          Komprimierung, Schattenkopien -> Windows-Standard\n"+
    "  ext4    Journal, Rechte -> Linux-Standard\n"+
    "  ReFS    sehr grosse Volumes, Pruefsummen -> Windows Server\n\n"+
    "  Die klassische Pruefungsfalle: Eine 5-GiB-Datei laesst sich\n"+
    "  nicht auf einen FAT32-Stick kopieren. Loesung exFAT oder NTFS.\n\n"+
    "  Rechte gibt es nur mit NTFS oder ext4, nicht mit FAT32.\n"+
    "  Ein Berechtigungskonzept setzt also NTFS voraus.\n\n"+
    "PARTITIONSSCHEMA\n"+
    "  MBR   4 primaere Partitionen, max. 2 TiB, gehoert zu BIOS\n"+
    "  GPT   128+ Partitionen, praktisch unbegrenzt, gehoert zu UEFI\n"+
    "        Bei GPT liegt eine Kopie der Partitionstabelle am Ende.\n\n"+
    "FORMATIEREN UND LOESCHEN\n"+
    "  Schnellformatierung   loescht nur das Inhaltsverzeichnis,\n"+
    "                        Daten sind wiederherstellbar\n"+
    "  Vollformatierung      ueberschreibt und prueft Sektoren\n"+
    "  Sicheres Loeschen     mehrfaches Ueberschreiben oder,\n"+
    "                        bei SSD, Secure Erase des Herstellers\n"+
    "  Datentraegervernichtung nach DIN 66399 (Schutzklassen)\n"+
    "  -> Bei Altgeraeten aus Datenschutzgruenden Pflicht.\n\n"+
    "RAID - Kapazitaet und Ausfallschutz\n"+
    "  RAID 0   Striping        100 %        KEIN Schutz\n"+
    "  RAID 1   Mirroring        50 %        1 Platte darf ausfallen\n"+
    "  RAID 5   Parität     (n-1) x Groesse  1 Platte, min. 3\n"+
    "  RAID 6   dopp. Parität (n-2) x Gr.    2 Platten, min. 4\n"+
    "  RAID 10  gespiegelt+str.  50 %        schnell + sicher, min. 4\n"+
    "  RAID ersetzt KEIN Backup: kein Schutz vor Loeschen,\n"+
    "  Ransomware oder Feuer.\n\n"+
    "SICHERUNGSARTEN\n"+
    "  Voll           alles          Rueckspielen: 1 Medium\n"+
    "  Differenziell  seit der VOLLsicherung   Voll + letzte diff.\n"+
    "  Inkrementell   seit der LETZTEN Sicherung  Voll + ALLE ink.\n"+
    "  3-2-1-Regel: 3 Kopien, 2 Medientypen, 1 ausser Haus/offline."
  )+'</div>';

  s += '<div class="sheet-section"><h2>Die 15 h&auml;ufigsten Fehler &ndash; und wie du sie vermeidest</h2><table class="lesson-table"><tr><th>Falle</th><th>Gegenmittel</th></tr>'+
    '<tr><td>Faktor 8 vergessen (Bit &harr; Byte)</td><td>Datenmenge steht in <strong>Byte</strong>, Datenrate in <strong>Bit/s</strong>. Immer erst umrechnen.</td></tr>'+
    '<tr><td>Off-by-one beim Array</td><td>Das letzte Element hat den Index <strong>L&Auml;NGE &minus; 1</strong>.</td></tr>'+
    '<tr><td>MAX und MIN im Netzplan vertauscht</td><td>Vorw&auml;rts <strong>MAX</strong>, r&uuml;ckw&auml;rts <strong>MIN</strong>. Probe: SAZ des ersten Vorgangs = 0.</td></tr>'+
    '<tr><td>Skonto vom Listenpreis gerechnet</td><td>Skonto immer vom <strong>Zieleinkaufspreis</strong>, also nach Rabatt. Bezugskosten danach.</td></tr>'+
    '<tr><td>USt: 19 % vom Bruttobetrag</td><td>Enthaltene USt = <strong>brutto &times; 19 / 119</strong>, nicht brutto &times; 0,19.</td></tr>'+
    '<tr><td>&bdquo;&minus; 2&ldquo; bei IPv6 abgezogen</td><td>IPv6 kennt <strong>keinen Broadcast</strong>. Nur bei IPv4 abziehen.</td></tr>'+
    '<tr><td>IPv6 nur halb ausgeschrieben</td><td>Jeder Block bekommt <strong>vier</strong> Hex-Ziffern: db8 &rarr; 0db8.</td></tr>'+
    '<tr><td>DHCP oder DNS auf Schicht 3</td><td>Beides sind <strong>Anwendungsprotokolle, Schicht 7</strong>.</td></tr>'+
    '<tr><td>WHERE statt HAVING</td><td>Filter auf ein <strong>Aggregat</strong> geh&ouml;rt in HAVING, sonst Syntaxfehler.</td></tr>'+
    '<tr><td>WHERE zerst&ouml;rt den LEFT JOIN</td><td>Bedingung auf die rechte Tabelle in die <strong>ON-Klausel</strong> schreiben.</td></tr>'+
    '<tr><td>Akteur in die Systemgrenze gemalt</td><td>Akteure stehen <strong>au&szlig;erhalb</strong> des Rechtecks.</td></tr>'+
    '<tr><td>Anwendungsfall als Substantiv</td><td>Immer <strong>Verb + Objekt</strong>: nicht &bdquo;St&ouml;rungsmeldung&ldquo;, sondern &bdquo;St&ouml;rung melden&ldquo;.</td></tr>'+
    '<tr><td>Watt und Voltampere gleichgesetzt</td><td><strong>W = VA &times; Leistungsfaktor</strong>. Eine 1.000-VA-USV liefert keine 1.000 W.</td></tr>'+
    '<tr><td>Verf&uuml;gbarkeit auf 8.760 h bezogen</td><td>Steht im SLA eine <strong>Servicezeit</strong>, gilt die als Bezugsgr&ouml;&szlig;e.</td></tr>'+
    '<tr><td>Nur das Ergebnis hingeschrieben</td><td>Es gibt <strong>Teilpunkte auf den Rechenweg</strong>. Jeden Schritt mit Einheit notieren.</td></tr></table></div>';

  s += '<div class="sheet-section"><h2>Zeitplan f&uuml;r die 90 Minuten</h2>'+codeBlock(
    "0-5 min    ERST BLAETTERN, DANN RECHNEN\n"+
    "           Alle Aufgaben ueberfliegen, Punktzahlen notieren.\n"+
    "           Faustregel: rund 1 Minute pro Punkt.\n"+
    "           Sofort auf das Konzeptpapier schreiben:\n"+
    "             128 192 224 240 248 252 254 255\n"+
    "             FEZ=FAZ+D (MAX) | SAZ=SEZ-D (MIN) | GP=SAZ-FAZ\n"+
    "             1 Byte = 8 Bit | 1 Jahr = 8.760 h\n\n"+
    "5-15 min   DIE SICHEREN PUNKTE ZUERST\n"+
    "           Multiple Choice und Definitionsfragen abraeumen.\n"+
    "           Das bringt Punkte und beruhigt.\n\n"+
    "15-70 min  DIE RECHENAUFGABEN\n"+
    "           Subnetting, Netzplan, Kalkulation, Uebertragungsdauer.\n"+
    "           Pro Aufgabe ein Zeitlimit setzen und einhalten.\n"+
    "           Haengst du fest: Teilansatz hinschreiben, weiter,\n"+
    "           spaeter zurueckkommen.\n\n"+
    "70-85 min  DIE TEXTAUFGABEN\n"+
    "           Begruenden, erlaeutern, empfehlen. Hier zaehlt das\n"+
    "           \"weil\" mehr als die Laenge.\n\n"+
    "85-90 min  KONTROLLE\n"+
    "           Ist irgendwo ein Feld leer? Fehlt eine Einheit?\n"+
    "           Steht bei \"empfehlen\" eine echte Entscheidung?\n"+
    "           Wurde die geforderte Anzahl Punkte genannt?"
  )+'<p style="font-size:.8rem;color:var(--text-dim);"><strong>Nie eine Aufgabe leer lassen.</strong> Ein falscher Ansatz bringt Teilpunkte, ein leeres Feld null. Selbst &bdquo;Ich w&uuml;rde die Blockgr&ouml;&szlig;e mit 256 &minus; Maskenwert bestimmen&ldquo; ist mehr wert als nichts.</p></div>';

  s += '<div class="sheet-section"><h2>Formulierungen, die Punkte bringen</h2><table class="lesson-table"><tr><th>Statt&nbsp;&hellip;</th><th>&hellip;&nbsp;besser</th></tr>'+
    '<tr><td>&bdquo;32 GB RAM&ldquo;</td><td>&bdquo;32 GB RAM, <strong>weil</strong> drei virtuelle Maschinen mit je 8 GB parallel laufen sollen&ldquo;</td></tr>'+
    '<tr><td>&bdquo;Anbieter B ist besser&ldquo;</td><td>&bdquo;Anbieter B wird empfohlen, <strong>da</strong> er bei gleichem Nutzwert 309 &euro; g&uuml;nstiger ist&ldquo;</td></tr>'+
    '<tr><td>&bdquo;Das System soll schnell sein&ldquo;</td><td>&bdquo;Die Suche antwortet in unter zwei Sekunden&ldquo; &ndash; <strong>messbar</strong> formulieren</td></tr>'+
    '<tr><td>&bdquo;Mitarbeiter schulen&ldquo;</td><td>&bdquo;Schulung zu Phishing, <strong>weil</strong> technische Ma&szlig;nahmen nicht greifen, wenn Zugangsdaten freiwillig herausgegeben werden&ldquo;</td></tr>'+
    '<tr><td>&bdquo;Ergebnis: 2,5&ldquo;</td><td>&bdquo;Amortisationsdauer: 2,5 Jahre, <strong>also 2 Jahre und 6 Monate</strong>&ldquo;</td></tr>'+
    '<tr><td>&bdquo;Man nimmt Glasfaser&ldquo;</td><td>&bdquo;Singlemode-LWL, <strong>da</strong> die Strecke 250 m betr&auml;gt und Kupfer bei 100 m endet&ldquo;</td></tr></table>'+
    '<p style="font-size:.8rem;color:var(--text-dim);">Der Unterschied zwischen einer 3 und einer 1 ist selten mehr Wissen, sondern fast immer das ausgeschriebene <strong>weil</strong>.</p></div>';

  s += '<div class="sheet-section"><h2>Die Zahlen, die du auswendig brauchst</h2>'+codeBlock(
    "SUBNETZE     128 192 224 240 248 252 254 255\n"+
    "             /24=254  /25=126  /26=62  /27=30  /28=14  /29=6  /30=2\n\n"+
    "PORTS        21 FTP | 22 SSH | 25 SMTP | 53 DNS | 67/68 DHCP\n"+
    "             80 HTTP | 110 POP3 | 143 IMAP | 443 HTTPS | 3389 RDP\n\n"+
    "ZEIT         1 Jahr = 8.760 h = 525.600 min\n"+
    "             Arbeitsjahr ca. 220 Tage, ca. 250 bei 5-Tage-Woche\n"+
    "             99,9 % -> 8,76 h Ausfall | 99,99 % -> 52,6 min\n\n"+
    "EINHEITEN    1 Byte = 8 Bit | 1 KiB = 1.024 B | 1 kB = 1.000 B\n"+
    "             True Color 24 Bit = 3 Byte je Pixel\n\n"+
    "KABEL        Kupfer max. 100 m (90 m fest + 2 x 5 m Patch)\n"+
    "             Cat 6a = 10 Gbit/s auf 100 m | Multimode bis 550 m\n"+
    "             PoE 12,95 W | PoE+ 25,5 W | PoE++ bis 71 W\n\n"+
    "FRISTEN      Datenpanne melden: 72 Stunden\n"+
    "             Gewaehrleistung: 2 Jahre | Beweislastumkehr: 12 Monate\n"+
    "             DSGVO-Bussgeld: 20 Mio. EUR oder 4 % Jahresumsatz\n\n"+
    "LOG2         8->3  16->4  32->5  64->6  128->7  256->8\n"+
    "             1.024->10   1.000.000->ca. 20\n\n"+
    "RAID         0 = n | 1 = 50 % | 5 = (n-1) | 6 = (n-2) | 10 = 50 %\n\n"+
    "PERT         tE = (O + 4M + P) / 6\n"+
    "SORTIEREN    max. Vergleiche Bubble = n x (n-1) / 2"
  )+'</div>';

  s += '<div class="sheet-section"><h2>Am Abend vorher und am Pr&uuml;fungsmorgen</h2>'+
    '<p style="font-size:.86rem;"><strong>Am Abend vorher</strong> lernst du nichts Neues mehr. Geh dieses Formelblatt einmal durch, schreib die Zahlenblöcke zweimal von Hand ab und h&ouml;r dann auf. Schlaf schl&auml;gt jede zus&auml;tzliche Stunde Wiederholung &ndash; das ist keine Floskel, sondern der Grund, warum verteiltes Lernen funktioniert.</p>'+
    '<p style="font-size:.86rem;"><strong>Mitnehmen:</strong> Personalausweis und Pr&uuml;fungseinladung, zwei Kugelschreiber, einen <strong>nicht programmierbaren</strong> Taschenrechner (pr&uuml;fe die Vorgaben deiner IHK), Lineal und Bleistift f&uuml;r Struktogramme und Netzpl&auml;ne, Radiergummi, Getr&auml;nk, eine Uhr. Kein Handy am Platz.</p>'+
    '<p style="font-size:.86rem;"><strong>In den ersten f&uuml;nf Minuten</strong> schreibst du die Zahlenbl&ouml;cke aus dem Abschnitt oben auf das Konzeptpapier, bevor du die erste Aufgabe liest. Unter Zeitdruck ist Erinnern teurer als Ablesen.</p>'+
    '<p style="font-size:.86rem;"><strong>Wenn du h&auml;ngst:</strong> Markiere die Aufgabe, schreib den Ansatz hin, den du sicher wei&szlig;t, und geh weiter. Zur&uuml;ckkommen kostet zwanzig Sekunden, Feststecken kostet zehn Minuten. Die AP1 belohnt Vollst&auml;ndigkeit mehr als Perfektion an einer Stelle.</p></div>';

  s += '<div class="sheet-section"><h2>Prüfungstaktik AP1</h2><table class="lesson-table"><tr><th>Operator</th><th>Was erwartet wird</th></tr>'+
    '<tr><td>Nennen / Aufzählen</td><td>Stichworte, keine Sätze &ndash; Anzahl aus der Aufgabe übernehmen</td></tr>'+
    '<tr><td>Beschreiben</td><td>vollständige Sätze, sachlich, ohne Wertung</td></tr>'+
    '<tr><td>Erläutern / Begründen</td><td>Aussage <strong>plus</strong> Warum &ndash; das &bdquo;weil&ldquo; bringt den Punkt</td></tr>'+
    '<tr><td>Berechnen</td><td>Rechenweg <em>und</em> Ergebnis mit Einheit &ndash; Teilpunkte auf den Weg</td></tr>'+
    '<tr><td>Vergleichen</td><td>je Kriterium beide Seiten gegenüberstellen</td></tr>'+
    '<tr><td>Beurteilen / Empfehlen</td><td>Abwägung <strong>und</strong> eindeutige Entscheidung am Ende</td></tr></table>'+
    '<p style="font-size:.8rem;color:var(--text-dim);"><strong>Punktzahl = Anzahl der erwarteten Aussagen.</strong> 6 Punkte bei drei Teilaufgaben heißt: zwei Aussagen je Teil. Nie eine Aufgabe leer lassen &ndash; ein Teilansatz bringt Teilpunkte. Zeit pro Punkt kalkulieren und den Netzplan nicht zuletzt rechnen.</p></div>';

  return s;
})();
