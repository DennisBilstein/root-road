var RP_ABAP_SENIOR_LESSONS=[{"id":"abap-m15-senior-authorization","moduleId":"abap-m15","title":"RAP-Berechtigungen durchgängig: DCL, Operationen und negative Tests","minutes":30,"prerequisites":"CDS-Projektionen, RAP-Verhalten und Rollen-Grundlagen; zwei getrennte Testbenutzer in einer freigegebenen Lernumgebung.","paragraphs":["Ein Sachbearbeiter darf Belege seines Buchungskreises lesen, aber nur offene Belege ändern. Dafür reichen weder ein ausgeblendeter Fiori-Button noch ein erfolgreicher OData-Serviceaufruf. Trenne Servicezugang, datensatzbezogenes Lesen und erlaubte Änderungen/Aktionen. Die konkrete Rollenpflege unterscheidet sich zwischen klassischen PFCG-Landschaften, S/4HANA Cloud und SAP BTP ABAP environment.","CDS Access Controls in DCL begrenzen den Zugriff auf die jeweilige CDS-Entität. Eine Projektion erbt diese Bedingungen nicht automatisch nur deshalb, weil sie auf einer geschützten View aufbaut. Definiere für den tatsächlich exponierten Zugriff eine passende Access Control, gegebenenfalls mit expliziter Vererbung. Die Annotation authorizationCheck allein formuliert noch keine fachliche Filterbedingung. Direkter Tabellenzugriff ist nicht automatisch durch die DCL einer anderen View geschützt.","RAP Global Authorization prüft instanzunabhängige Rechte, etwa ob ein Benutzer grundsätzlich anlegen darf. Instance Authorization berücksichtigt den Zustand einer Instanz. Eine Prüfung des bestehenden Buchungskreises ist nicht automatisch eine Prüfung eines neu übergebenen Buchungskreises: ein unerlaubter Wechsel muss zusätzlich passend zum Zielzustand abgewehrt werden. Feature Control verbessert die Bedienung, ersetzt aber keine Autorisierung.","IN LOCAL MODE ist ein bewusster interner Zugriff im eigenen Behavior-Kontext und kann Autorisierungs- und Featureprüfungen umgehen. Nutze es nicht als Reparatur für einen 403-Fehler. Prüfe privilegierte Lesepfade, technische Benutzer, Hintergrundjobs und Exporte separat. Ein Test mit dem Entwickler-Admin kann eine fehlende DCL verdecken."],"codeLang":"text","cases":["Benutzer A liest einen eigenen offenen Beleg und ändert einen erlaubten Text; nur dieser Beleg ändert sich.","Ein eigener bereits gebuchter Beleg bleibt lesbar, eine verbotene Änderungsaktion wird verweigert.","A sendet fremden Schlüssel oder unzulässigen Buchungskreis direkt an den Service; kein fremder Inhalt und keine persistierte Änderung."],"quiz":[{"q":"Eine CDS-Projektion exponiert Belege über OData. Nur die darunterliegende Modell-View hat DCL. Welcher Review-Schritt ist erforderlich?","options":["Den Filter der Modell-View als automatisch geerbt dokumentieren.","Die exponierte Entität und deren Access Control explizit prüfen.","Nur das Entfernen der Fiori-Suchfunktion im Client testen."],"correct":1,"rationales":["DCL der unteren View schützt die darauf aufgebaute Projektion nicht pauschal.","Die Lesegrenze muss am tatsächlichen Zugriff wirken; explizite Vererbung kann dafür eingesetzt werden.","Die Suche zu verstecken verhindert direkte Servicezugriffe nicht."],"explain":"Nicht passend: DCL der unteren View schützt die darauf aufgebaute Projektion nicht pauschal. Richtig: Die Lesegrenze muss am tatsächlichen Zugriff wirken; explizite Vererbung kann dafür eingesetzt werden. Nicht passend: Die Suche zu verstecken verhindert direkte Servicezugriffe nicht.","sources":["https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Eine RAP-Action ist in Fiori deaktiviert. Ein direkter Request kann sie dennoch unberechtigt ausführen. Was ist die richtige Korrektur?","options":["Die serverseitige Autorisierung der Operation ergänzen und negativ testen.","Den Button zusätzlich aus der Toolbar-Konfiguration entfernen.","Den Service mit einem gemeinsamen Admin-Benutzer aufrufen."],"correct":0,"rationales":["Bedienhinweise sind keine harte Grenze; der Backendpfad muss unberechtigte Operationen verweigern.","Ein zweites UI-Versteck schließt den direkten Request nicht.","Ein Admin-Benutzer verschärft die Rechteausweitung und verdeckt fehlende Prüfungen."],"explain":"Richtig: Bedienhinweise sind keine harte Grenze; der Backendpfad muss unberechtigte Operationen verweigern. Nicht passend: Ein zweites UI-Versteck schließt den direkten Request nicht. Nicht passend: Ein Admin-Benutzer verschärft die Rechteausweitung und verdeckt fehlende Prüfungen.","sources":["https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Ein Benutzer darf einen Beleg aus Kreis 1000 ändern und übergibt als neuen Kreis 2000. Die Instanzprüfung prüft nur den alten Zustand. Was fehlt?","options":["Eine UI-Sortierung nach dem bisherigen Buchungskreis.","Ein Retry mit demselben Request nach der Instanzprüfung.","Eine passende Prüfung der Berechtigung für den Zielzustand."],"correct":2,"rationales":["Sortierung begrenzt weder Zielwerte noch Zugriffe.","Wiederholung ergänzt keine Prüfung des neu übergebenen Zustands.","Das Recht auf den bestehenden Beleg erlaubt nicht automatisch einen Wechsel in jeden anderen Berechtigungsbereich."],"explain":"Nicht passend: Sortierung begrenzt weder Zielwerte noch Zugriffe. Nicht passend: Wiederholung ergänzt keine Prüfung des neu übergebenen Zustands. Richtig: Das Recht auf den bestehenden Beleg erlaubt nicht automatisch einen Wechsel in jeden anderen Berechtigungsbereich.","sources":["https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks"],"revision":"2026-11-08-abap-senior-v1"}],"sourceKeys":["auth"],"order":["body","code","body2"],"researchedAt":"2026-11-08","seniorRevision":"2026-11-08-abap-senior-v1"},{"id":"abap-m12-senior-eml-tests","moduleId":"abap-m12","title":"RAP mit EML testen: Puffer, Save Sequence und echte Fehlernachweise","minutes":35,"prerequisites":"Managed RAP BO, EML-Grundlagen und ABAP Unit; CDS-/SQL-Test-Doubles im Zielrelease verfügbar.","paragraphs":["Ein Test, der nur prüft, dass MODIFY ENTITIES keinen Dump erzeugt, belegt wenig. EML bearbeitet zunächst den transaktionalen Puffer. Validierungen und späte Fehler können erst in der Save Sequence sichtbar werden. Definiere deshalb vorher den fachlichen Vertrag: Ein gültiger Auftrag wird mit korrekten Werten gespeichert; ein ungültiger Auftrag hinterlässt keine persistierte Instanz.","FAILED benennt fehlgeschlagene Instanzen, REPORTED transportiert Meldungen und MAPPED ordnet temporäre Anlege-IDs den Schlüsseln zu. Eine Meldung kann auch eine Warnung sein; REPORTED ungleich initial ist nicht pauschal ein fehlgeschlagener Save. Prüfe erwartete Meldungsschwere, betroffene Instanz und bei feldbezogenen Meldungen den Feldbezug. Die Responses des Änderungsaufrufs und des Commits sind getrennte Prüfpunkte.","Ein äußerer EML-Consumer oder Szenariotest steuert COMMIT ENTITIES beziehungsweise ROLLBACK ENTITIES. Innerhalb der Behavior-Implementierung gehört diese Transaktionssteuerung dem RAP-Framework; dort nicht eigenmächtig COMMIT WORK oder COMMIT ENTITIES einbauen. Teste fachlichen Zustand nach erfolgreichem Save, nicht nur die Anzahl gemappter Schlüssel.","Das SAP-RAP100-Beispiel isoliert CDS-Lesezugriffe und zusätzliche SQL-Abhängigkeiten mit passenden Test-Doubles. setup leert Testzustand, class_teardown zerstört die Testumgebungen. ROLLBACK ENTITIES verwirft noch nicht gespeicherte Pufferdaten, ist aber kein universelles Undo eines früheren echten Datenbankcommits. Verwende keine produktiven Tabellen als Testfixture. Ein isolierter EML-Test mit internem Zugriff beweist weder Benutzerautorisierung noch HTTP-ETag-Verhalten."],"codeLang":"abap","cases":["Gültige Instanz erzeugen, Action ausführen und nach Save den erwarteten Status und Betrag prüfen.","Eine gültige Warnung zulassen und anhand der Schwere zeigen, dass nicht jede Meldung einen Fehler bedeutet.","Datum verletzt Save-Validierung: späte Fehlerresponse prüfen und nachweisen, dass keine neue fachliche Instanz gespeichert wurde."],"quiz":[{"q":"Ein EML-Test erhält nach CREATE einen gemappten Schlüssel. Die Save-Validierung schlägt später fehl. Welche Aussage trägt der erste Prüfschritt allein?","options":["Der vollständige Auftrag wurde bereits dauerhaft gespeichert.","Der Benutzer besitzt alle benötigten OData-Schreibrechte.","Die frühe Anlegephase lieferte ein Mapping, nicht den Save-Erfolg."],"correct":2,"rationales":["Ein Mapping belegt nicht den Erfolg der späteren Save Sequence.","Ein internes EML-Mapping prüft nicht sämtliche Service- und Benutzergrenzen.","Commitresponses und persistierter Fachzustand sind eigene Nachweise."],"explain":"Nicht passend: Ein Mapping belegt nicht den Erfolg der späteren Save Sequence. Nicht passend: Ein internes EML-Mapping prüft nicht sämtliche Service- und Benutzergrenzen. Richtig: Commitresponses und persistierter Fachzustand sind eigene Nachweise.","sources":["https://developers.sap.com/tutorials/abap-environment-rap100-unit-testing.html"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Nach dem COMMIT ENTITIES eines äußeren Szenariotests ist REPORTED gefüllt, FAILED aber leer. Wie bewertet man den Lauf?","options":["Jede vorhandene Meldung als fehlgeschlagenen Commit behandeln.","Meldungsschwere, Sollvertrag und gespeicherten Zustand prüfen.","Alle Meldungen löschen und nur auf den gemappten Schlüssel schauen."],"correct":1,"rationales":["REPORTED kann auch Informationen oder Warnungen enthalten.","Die fachliche Erwartung und Fehlerresponse entscheiden, nicht bloß die Existenz einer Meldung.","Damit würden relevante Warnungen und fachliche Abweichungen verdeckt."],"explain":"Nicht passend: REPORTED kann auch Informationen oder Warnungen enthalten. Richtig: Die fachliche Erwartung und Fehlerresponse entscheiden, nicht bloß die Existenz einer Meldung. Nicht passend: Damit würden relevante Warnungen und fachliche Abweichungen verdeckt.","sources":["https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/using-the-entity-manipulation-language-eml-to-access-business-objects"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Ein Behavior-Handler soll nach jeder Änderung selbst COMMIT WORK ausführen, damit der Test grün wird. Was ist angemessen?","options":["Transaktionshoheit beim Framework lassen und den äußeren Test korrigieren.","COMMIT WORK im Handler durch COMMIT ENTITIES im Handler ersetzen.","Den Commit nur bei aktivem Debugger im Handler ausführen."],"correct":0,"rationales":["Eigenmächtiges Commit im Handler verletzt das RAP-Transaktionsmodell.","Auch diese Transaktionssteuerung gehört hier nicht in die Behavior-Implementierung.","Das erzeugt abweichendes Laufzeitverhalten statt eines belastbaren Tests."],"explain":"Richtig: Eigenmächtiges Commit im Handler verletzt das RAP-Transaktionsmodell. Nicht passend: Auch diese Transaktionssteuerung gehört hier nicht in die Behavior-Implementierung. Nicht passend: Das erzeugt abweichendes Laufzeitverhalten statt eines belastbaren Tests.","sources":["https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/using-the-entity-manipulation-language-eml-to-access-business-objects"],"revision":"2026-11-08-abap-senior-v1"}],"sourceKeys":["tests","eml"],"order":["body","code","body2"],"researchedAt":"2026-11-08","seniorRevision":"2026-11-08-abap-senior-v1"},{"id":"abap-m13-senior-side-effects","moduleId":"abap-m13","title":"Fiori Elements V4: Side Effects, Meldungen und sichere Erweiterungen","minutes":30,"prerequisites":"Fiori Elements List Report/Object Page, OData V4 und RAP-Determinations; SAPUI5-Version und Service-Metadaten bekannt.","paragraphs":["Ein Benutzer ändert Menge von 2 auf 3 bei Einzelpreis 10. Das Backend berechnet den Betrag von 20 auf 30, die Object Page zeigt aber weiter 20. Ursache kann eine fehlende Aktualisierung des betroffenen Feldes sein, nicht eine fehlende Multiplikation. Ein Side Effect beschreibt, welche Repräsentationen nach einer Änderung neu gelesen werden sollen; die Annotation ist nicht selbst die fachliche Berechnung.","Für OData V4 verbinden Side-Effect-Metadaten etwa Quantity als Quelle mit NetAmount als Ziel. Prüfe die tatsächlich ausgelieferten Metadaten und die Unterstützung deiner SAPUI5-/Backendversion. RAP-Side-Effect-Definitionen und lokale XML-Annotationen sind unterschiedliche Wege mit releaseabhängigen Möglichkeiten. CAP-CDS-Syntax aus einem Fiori-Tutorial ist nicht unverändert ABAP CDS. Standard-Side-Effects existieren bereits, zusätzliche Regeln müssen nicht jeden Refresh duplizieren.","Ein ungültiger Wert kann schon an der Clientvalidierung scheitern. Dann wird die Änderung noch nicht an das Backend geschickt und die Neuberechnung wird nicht ausgelöst. Analysiere zuerst den Browser-Network-Tab: PATCH, Batch-Teilantworten, nachfolgende Reads und fachliche Meldungen. HTTP 200 für den äußeren Batch beweist nicht den Erfolg jedes inneren Requests. Backendfehler gehören als verständliche, möglichst feldbezogene Meldungen in den regulären Message Flow.","Erweitere zuerst über Annotationen und Konfiguration, dann über dokumentierte Extension Points, Building Blocks und Controller Extensions. Greife nicht auf private generierte Controller oder zufällige DOM-IDs zu. Die SAP-Learning-Quelle zeigt clientseitige Extensions an einem CAP-Backend; ihre Backendbeispiele werden hier nicht als RAP-Code ausgegeben. Prüfe asynchrone Antworten nach Navigation auf den aktuellen Binding-Kontext, damit Daten von Objekt A nicht auf Objekt B erscheinen."],"codeLang":"text","cases":["Menge 2 → 3: Backendbetrag und sichtbarer Betrag werden 30; gezielter Ziel-Read nachvollziehbar.","Ungültiger Zahlenwert: sichtbare Validierung, kein unbeabsichtigter Serverwrite und keine erfundene Neuberechnung.","Während einer langsamen Erweiterungsabfrage von A nach B navigieren: verspätetes Ergebnis von A überschreibt B nicht."],"quiz":[{"q":"Nach einer Mengenänderung berechnet RAP den Betrag korrekt, Fiori zeigt noch den alten Wert. Was prüfst du zuerst?","options":["Side-Effect-Ziel, Metadaten und den nachfolgenden Read des Betrags.","Eine zweite unabhängige Preisberechnung im Controller einführen.","Die ETag-Prüfung für alle Schreibrequests der App entfernen."],"correct":0,"rationales":["Die Backendberechnung ist bereits korrekt; die aktualisierte Repräsentation muss den Client erreichen.","Doppelte Fachlogik kann abweichende Ergebnisse und Rundungsfehler erzeugen.","Nebenläufigkeitsschutz zu entfernen aktualisiert keine Anzeige und riskiert Lost Updates."],"explain":"Richtig: Die Backendberechnung ist bereits korrekt; die aktualisierte Repräsentation muss den Client erreichen. Nicht passend: Doppelte Fachlogik kann abweichende Ergebnisse und Rundungsfehler erzeugen. Nicht passend: Nebenläufigkeitsschutz zu entfernen aktualisiert keine Anzeige und riskiert Lost Updates.","sources":["https://github.com/SAP-docs/sapui5/blob/main/docs/06_SAP_Fiori_Elements/side-effects-18b17bd.md"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Im Fiori-V4-Formular verletzt eine Eingabe MaxLength. Es gibt keinen PATCH und kein Side-Effect-Read. Was passt zum Ablauf?","options":["Der Side Effect sollte die ungültige Eingabe ohne Server korrigieren.","Der Server hat die Eingabe bereits erfolgreich gespeichert.","Die Clientvalidierung hält den Write bis zur Korrektur zurück."],"correct":2,"rationales":["Side Effects sind keine allgemeine clientseitige Reparaturregel für ungültige Werte.","Ohne gesendeten Schreibrequest folgt aus der UI-Eingabe kein Serverwrite.","Solange die betroffenen Werte ungültig sind, wird der Backendablauf nicht regulär ausgelöst."],"explain":"Nicht passend: Side Effects sind keine allgemeine clientseitige Reparaturregel für ungültige Werte. Nicht passend: Ohne gesendeten Schreibrequest folgt aus der UI-Eingabe kein Serverwrite. Richtig: Solange die betroffenen Werte ungültig sind, wird der Backendablauf nicht regulär ausgelöst.","sources":["https://github.com/SAP-docs/sapui5/blob/main/docs/06_SAP_Fiori_Elements/side-effects-18b17bd.md"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Eine Fiori-Erweiterung benötigt einen dokumentierten Edit-Hook. Welche Abhängigkeit ist am tragfähigsten?","options":["Die interne generierte Controller-Methode aus dem Debugger kopieren.","Die passende öffentliche Controller Extension der Zielversion verwenden.","Eine zufällig beobachtete DOM-ID der Speichern-Schaltfläche fest verdrahten."],"correct":1,"rationales":["Private Implementierungsdetails haben keinen stabilen Erweiterungsvertrag.","Ein dokumentierter Hook ist der vorgesehene Vertrag; Verfügbarkeit und Lifecycle werden dennoch geprüft.","Generierte DOM-Struktur ist kein Ersatz für eine unterstützte API."],"explain":"Nicht passend: Private Implementierungsdetails haben keinen stabilen Erweiterungsvertrag. Richtig: Ein dokumentierter Hook ist der vorgesehene Vertrag; Verfügbarkeit und Lifecycle werden dennoch geprüft. Nicht passend: Generierte DOM-Struktur ist kein Ersatz für eine unterstützte API.","sources":["https://learning.sap.com/courses/developing-an-sap-fiori-elements-app-based-on-a-cap-odata-v4-service/using-controller-extensions_f47e841f-2dd8-4b88-ba5e-39c0eedd983e"],"revision":"2026-11-08-abap-senior-v1"}],"sourceKeys":["sideEffects","extensions"],"order":["body","code","body2"],"researchedAt":"2026-11-08","seniorRevision":"2026-11-08-abap-senior-v1"},{"id":"abap-m14-senior-btp-identity","moduleId":"abap-m14","title":"BTP Connectivity: Destination, Cloud Connector und Benutzeridentität","minutes":30,"prerequisites":"HTTP, Authentifizierung/Autorisierung und BTP-Subaccount; Architekturübung ohne echte Zugangsdaten möglich.","paragraphs":["Eine Side-by-Side-App auf BTP erreicht einen internen S/4HANA-Service. Die Destination beschreibt Ziel und Authentifizierungsart; Connectivity und Cloud Connector ermöglichen den kontrollierten Weg ins On-Premise-Netz. Eine grüne Destination-Verbindungsprüfung beweist weder korrekte Endbenutzerzuordnung noch fachliche Rechte. Entitlements, Subaccount, Runtime und Servicebindungen müssen für die konkrete App passen.","Bei Principal Propagation wird die angemeldete Identität entlang einer eingerichteten Vertrauenskette an das Backend weitergegeben. Cloud Connector muss nur notwendige Systeme und Ressourcen freigeben; virtuelle Hosts und Location ID gehören zum Routingvertrag. Das Backend muss die übermittelte Identität korrekt einem Benutzer zuordnen und dessen Rechte prüfen. Eine unkontrollierte Weitergabe des Browser-Bearer-Tokens an irgendeine URL ist keine Principal Propagation.","Interaktive Aktionen können eine Benutzeridentität benötigen; ein nächtlicher Job braucht häufig eine eigens begrenzte technische Identität. OAuth Client Credentials ist nicht automatisch ein Endbenutzerkontext. Wähle Authentifizierungsverfahren anhand des unterstützten API-/Kommunikationsszenarios. SAP BTP ABAP environment verwendet für viele Verbindungen Communication Scenarios, Systems und Arrangements; Destination-Einstellungen einer Cloud-Foundry-App nicht blind auf jede ABAP-Laufzeit übertragen.","Fehlersuche folgt den Grenzen: DNS/Route/Cloud-Connector-Ressource, TLS und Trust, Token/Zertifikat und User-Mapping, Servicezugang, dann Fachrechte. 401/403 sind Hinweise, aber kein eindeutiger Ursachenbeweis; Proxy und Backend können beide antworten. Erfasse zuständiges System, Zeitfenster und bereinigte Korrelations-ID. Tokens, Cookies, private Schlüssel und personenbezogene Payloads gehören nicht in Tickets oder Screenshots."],"codeLang":"text","cases":["Zwei interaktive Testbenutzer werden im Backend unterschiedlich erkannt und erhalten nur ihre erlaubten Belege.","Ein technischer Jobzugang erreicht nur den vorgesehenen Service und besitzt keine allgemeinen Administratorrechte.","Mapping oder Ressourcenfreigabe fehlt: kontrollierter Fehler, lokalisierte Grenze und bereinigtes Diagnoseprotokoll ohne Secrets."],"quiz":[{"q":"Der BTP-Destination-Check ist grün, im Backend erscheinen alle Aufrufe als derselbe technische Benutzer. Was ist noch nicht belegt?","options":["Dass irgendeine technische Verbindung zum Ziel aufgebaut werden kann.","Dass individuelle Benutzeridentität und Fachrechte korrekt wirken.","Dass die App überhaupt einen Zielnamen konfigurieren durfte."],"correct":1,"rationales":["Ein erfolgreicher Check liefert gerade einen begrenzten Nachweis technischer Erreichbarkeit.","Connectivity-Erfolg und authentischer Endbenutzerkontext sind verschiedene Nachweise.","Der beobachtete Check beantwortet nicht die fachlich entscheidende Identitätsfrage durch diese Alternative."],"explain":"Nicht passend: Ein erfolgreicher Check liefert gerade einen begrenzten Nachweis technischer Erreichbarkeit. Richtig: Connectivity-Erfolg und authentischer Endbenutzerkontext sind verschiedene Nachweise. Nicht passend: Der beobachtete Check beantwortet nicht die fachlich entscheidende Identitätsfrage durch diese Alternative.","sources":["https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/configuring-principal-propagation"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Ein nächtlicher BTP-Job verwendet OAuth Client Credentials. Darf die Anwendung daraus die Identität des zuletzt angemeldeten Sachbearbeiters ableiten?","options":["Ja, der letzte Browserlogin bestimmt automatisch jeden Hintergrundjob.","Ja, wenn der Job denselben Destination-Namen wie die UI benutzt.","Nein, technische Identität und Endbenutzerkontext sind getrennt."],"correct":2,"rationales":["Ein technischer Token übernimmt keinen beliebigen früheren Browserkontext.","Der Name eines Ziels verleiht keine Endbenutzeridentität.","Das unterstützte Authverfahren und der Jobvertrag bestimmen, unter welcher Identität die Operation läuft."],"explain":"Nicht passend: Ein technischer Token übernimmt keinen beliebigen früheren Browserkontext. Nicht passend: Der Name eines Ziels verleiht keine Endbenutzeridentität. Richtig: Das unterstützte Authverfahren und der Jobvertrag bestimmen, unter welcher Identität die Operation läuft.","sources":["https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/configuring-principal-propagation"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Cloud-Foundry-Beispielwerte für eine Destination sollen in SAP BTP ABAP environment übernommen werden. Was ist der erste Schritt?","options":["Das passende Communication Scenario und die Laufzeitunterstützung prüfen.","Das technische Passwort als Konstante in die ABAP-Klasse schreiben.","Alle Backendpfade für den Cloud Connector pauschal freigeben."],"correct":0,"rationales":["ABAP-Kommunikationsartefakte und unterstützte Verfahren richten sich nach dem konkreten Szenario.","Hardcodierte Secrets sind kein Ersatz für passende Kommunikationskonfiguration.","Eine breite Netzfreigabe löst weder Laufzeitkompatibilität noch Identitätsvertrag."],"explain":"Richtig: ABAP-Kommunikationsartefakte und unterstützte Verfahren richten sich nach dem konkreten Szenario. Nicht passend: Hardcodierte Secrets sind kein Ersatz für passende Kommunikationskonfiguration. Nicht passend: Eine breite Netzfreigabe löst weder Laufzeitkompatibilität noch Identitätsvertrag.","sources":["https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/configuring-principal-propagation"],"revision":"2026-11-08-abap-senior-v1"}],"sourceKeys":["connectivity"],"order":["body","code","body2"],"researchedAt":"2026-11-08","seniorRevision":"2026-11-08-abap-senior-v1"},{"id":"abap-m14-senior-s4-migration","moduleId":"abap-m14","title":"S/4HANA Custom Code: Migration, Clean Core und messbare Modernisierung","minutes":30,"prerequisites":"ABAP SQL, ATC und Erweiterungsstrategie; Schwerpunkt ERP → S/4HANA On-Premise/Private Edition, nicht pauschal Public Edition.","paragraphs":["SAP HANA ist die Datenbank, SAP S/4HANA das darauf aufbauende ERP-Produkt. Eine Datenbankumstellung allein macht alten Custom Code nicht fachlich kompatibel mit veränderten S/4HANA-Datenmodellen. Ein SELECT kann syntaktisch aktiv sein und dennoch falsche Semantik oder ein ungeeignetes Zugriffsmuster haben. Prüfe Zielrelease und Edition; verfügbare Werkzeuge und erlaubte Erweiterungen sind nicht überall gleich.","Beginne mit einem Inventar und einem aussagekräftigen Nutzungszeitraum, der auch Monats-/Jahresabschluss und seltene Pflichtprozesse berücksichtigt. Kein Aufruf im kurzen Messfenster bedeutet nicht automatisch entbehrlich. Ordne Eigentümer, Abhängigkeiten und geplante Ablösung zu. Nicht mehr benötigter Code wird nur nach freigegebenem Stilllegungsplan entfernt, nicht aufgrund einer einzelnen Statistik.","ATC mit passenden S/4HANA-Prüfungen und Simplification-Inhalten identifiziert Anpassungsbedarf. Behebe Syntaxfehler, wiederhole die Analyse und prüfe Quick Fixes fachlich. Ein grüner ATC-Lauf ist weder ein vollständiger Prozesstest noch ein Performancebeweis. Vergleiche Belegzahlen, Beträge und fachliche Zustände mit einer geprüften Referenz. Modifikationsabgleich und eigentliche Systemkonvertierung gehören in den dafür geregelten Projektablauf.","Nach fachlicher Korrektheit priorisierst du gemessene Hotspots, etwa mit SQL Monitor und der SQL Performance Tuning Worklist in unterstützten klassischen Landschaften. Nicht jeden LOOP reflexartig in AMDP übersetzen. Für neue ABAP-Cloud-Erweiterungen freigegebene APIs verwenden und Release Contract prüfen. Ein kundeneigener Wrapper um eine nicht freigegebene API macht die SAP-API selbst nicht released; in zulässigen klassischen Landschaften bleibt dies eine bewusst verwaltete Ausnahme mit eigener Upgradepflicht."],"codeLang":"text","cases":["Genutzten Z-Report mit einem releasebezogenen ATC-Fund anpassen und Belegzahlen/Beträge gegen Referenz prüfen.","Report nur am Jahresende genutzt: Eigentümer bestätigt Bedarf trotz leerem Wochenmessfenster.","Wrapper ruft nicht freigegebene API auf: keine falsche Cloud-Freigabe; Ausnahme und zulässige Alternative dokumentieren."],"quiz":[{"q":"Ein Z-Report wurde sieben Tage nicht aufgerufen, ist aber für den Jahresabschluss vorgesehen. Was folgt daraus?","options":["Report erst nach Prozess-/Ownerprüfung und längerer Nutzungsbewertung stilllegen.","Report automatisch löschen, weil Nutzungsdaten immer vollständig sind.","Report sofort durch AMDP ersetzen, weil die Nutzung selten ist."],"correct":0,"rationales":["Ein kurzes Messfenster deckt seltene verpflichtende Geschäftsprozesse nicht ab.","Die Beobachtungsdauer kann den relevanten Prozess schlicht verfehlen.","Seltene Nutzung begründet weder Löschung noch eine bestimmte Optimierungstechnik."],"explain":"Richtig: Ein kurzes Messfenster deckt seltene verpflichtende Geschäftsprozesse nicht ab. Nicht passend: Die Beobachtungsdauer kann den relevanten Prozess schlicht verfehlen. Nicht passend: Seltene Nutzung begründet weder Löschung noch eine bestimmte Optimierungstechnik.","sources":["https://learning.sap.com/courses/implementing-sap-s-4hana-cloud-private-edition/analyzing-customizations-after-system-conversion_b9083e6d-e207-4578-8aa6-6c85cb42974a"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Nach S/4HANA-Anpassung ist ATC grün. Welcher zusätzliche Nachweis fehlt für die fachliche Abnahme?","options":["Dass alle lokalen Variablennamen maximal kurz geschrieben sind.","Dass jede SELECT-Anweisung durch eine HANA-Prozedur ersetzt wurde.","Dass relevante Prozesse und Ergebnisse auf dem Zielrelease stimmen."],"correct":2,"rationales":["Namenslänge ist kein Nachweis korrekter Belegverarbeitung.","Eine pauschale technische Umschreibung beweist keine fachliche Gleichheit.","Statische Prüfungen ersetzen keine Regression der Geschäftsfunktionen."],"explain":"Nicht passend: Namenslänge ist kein Nachweis korrekter Belegverarbeitung. Nicht passend: Eine pauschale technische Umschreibung beweist keine fachliche Gleichheit. Richtig: Statische Prüfungen ersetzen keine Regression der Geschäftsfunktionen.","sources":["https://learning.sap.com/courses/implementing-sap-s-4hana-cloud-private-edition/analyzing-customizations-after-system-conversion_b9083e6d-e207-4578-8aa6-6c85cb42974a"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Ein eigener Wrapper kapselt eine nicht freigegebene SAP-API. Was ist die korrekte Bewertung?","options":["Die SAP-API ist dadurch automatisch für ABAP Cloud freigegeben.","Die Kapselung braucht zulässige Laufzeit und eigene Upgradeverantwortung.","Der Wrapper beseitigt jeden zukünftigen Regressionstest."],"correct":1,"rationales":["Eine Kundenkapselung ändert den Release Contract des SAP-Objekts nicht.","Eine erlaubte Ausnahme ist gesondert zu verwalten und nicht mit einem offiziellen Release gleichzusetzen.","Auch gekapselte Abhängigkeiten können bei einem Upgrade ihr Verhalten ändern."],"explain":"Nicht passend: Eine Kundenkapselung ändert den Release Contract des SAP-Objekts nicht. Richtig: Eine erlaubte Ausnahme ist gesondert zu verwalten und nicht mit einem offiziellen Release gleichzusetzen. Nicht passend: Auch gekapselte Abhängigkeiten können bei einem Upgrade ihr Verhalten ändern.","sources":["https://learning.sap.com/courses/implementing-sap-s-4hana-cloud-private-edition/analyzing-customizations-after-system-conversion_b9083e6d-e207-4578-8aa6-6c85cb42974a"],"revision":"2026-11-08-abap-senior-v1"}],"sourceKeys":["migration"],"order":["body","code","body2"],"researchedAt":"2026-11-08","seniorRevision":"2026-11-08-abap-senior-v1"},{"id":"abap-m19-senior-restartable-jobs","moduleId":"abap-m19","title":"Application Jobs betreiben: Wiederanlauf, Idempotenz und Application Log","minutes":30,"prerequisites":"ABAP-Transaktionen, Hintergrundverarbeitung und Fehlerkategorien; freigegebene Job-/Log-APIs des Zielsystems prüfen.","paragraphs":["Ein Job verarbeitet 1000 Belege und bricht nach 400 ab. „Noch einmal starten“ ist nur sicher, wenn der Vertrag festlegt, welche Belege bereits wirksam verarbeitet wurden. Ein Job kann technisch beendet sein und fachlich abgewiesene Datensätze enthalten. Umgekehrt kann nach einem Timeout eine externe Buchung bereits erfolgreich sein. Statusfarbe und End-to-End-Fachwirkung sind verschiedene Größen.","Arbeite mit begrenzten Paketen und einem stabilen fachlichen Schlüssel oder einer Versionsmarke. Für rein lokale Verarbeitung müssen Wirkung und Verarbeitungsmarker in derselben geeigneten Transaktion gesichert werden. Ein Marker vor der Wirkung riskiert Verlust, ein ungekoppelter Marker danach Duplikate. Ein Neustart muss bereits verarbeitete Belege erkennen, konkurrierende Läufe dürfen dieselbe Wirkung nicht doppelt ausführen.","Für externe Seiteneffekte brauchst du einen Idempotenzvertrag oder belastbaren Abgleich mit dem Ziel. Ein lokales ROLLBACK nimmt eine fremde Buchung nicht zurück. Transiente Fehler können begrenzt mit Backoff wiederholt werden; fachlich ungültige Belege brauchen Korrektur statt Endlos-Retry. Eine Wiederaufnahme „nach Fehlerstep“ darf keine noch notwendigen fachlichen Voraussetzungen überspringen.","Application Log und Jobmonitoring sollen Lauf-ID, Paket/Objektbezug, Fehlerkategorie, Bearbeitungszahlen und erlaubte nächste Aktion zeigen. Keine kompletten Geschäftspayloads, Tokens oder Passwörter protokollieren; auch Log-Leserechte sind zu begrenzen. Die SAP-Samplequelle zeigt konkrete ältere Interfaces und Scheduling-APIs, deren Unterstützung und zulässige RAP-Phase im Zielrelease geprüft werden müssen. Sie ist kein Beweis, dass jeder gezeigte API-Aufruf in jeder RAP-Phase sicher ist."],"codeLang":"text","cases":["Zwei lokale Pakete verarbeiten; Zähler und gesicherte Belegzustände stimmen überein.","Letztes Paket enthält nur einen Beleg; weder Auslassung noch doppelte Verarbeitung durch Pagination.","Crash nach Zielbuchung vor lokaler Quittierung: Abgleich/Idempotenz verhindert zweite Buchung, unsicherer Zustand wird sichtbar."],"quiz":[{"q":"Ein Job-Log meldet „Finished“, enthält aber 12 fachlich abgewiesene Belege. Wie meldest du das Ergebnis?","options":["Vollständig fachlich erfolgreich, weil der Scheduler grün ist.","Unbekannt, da Logs grundsätzlich keinen Ergebnisbezug haben.","Technisch beendet, mit separat ausgewiesenen fachlichen Ablehnungen."],"correct":2,"rationales":["Technischer Abschluss löscht keine im Log enthaltenen fachlichen Fehler.","Das bereinigte Log und die gesicherten Zustände liefern durchaus relevante Evidenz.","Betriebsstatus und Fachresultat müssen getrennt nachvollziehbar sein."],"explain":"Nicht passend: Technischer Abschluss löscht keine im Log enthaltenen fachlichen Fehler. Nicht passend: Das bereinigte Log und die gesicherten Zustände liefern durchaus relevante Evidenz. Richtig: Betriebsstatus und Fachresultat müssen getrennt nachvollziehbar sein.","sources":["https://learning.sap.com/courses/administrating-sap-s-4hana-cloud-public-edition/monitoring-application-jobs_f18a1e3b-b367-46f0-828a-99fea42cd3b4"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Ein rein lokaler Paketjob speichert einen Erledigt-Marker vor der eigentlichen Belegänderung und stürzt danach ab. Welche Korrektur schützt den Wiederanlauf?","options":["Marker und Fachwirkung in derselben geeigneten Transaktion sichern.","Die Marker früher schreiben und nur den Scheduler häufiger starten.","Alle Protokolle entfernen und jeden Beleg immer erneut buchen."],"correct":0,"rationales":["Der Neustart darf eine nicht ausgeführte Wirkung nicht irrtümlich als erledigt überspringen.","Das vergrößert das Verlustfenster statt es atomar zu schließen.","Ohne Deduplizierung drohen doppelte Wirkungen und fehlende Diagnose."],"explain":"Richtig: Der Neustart darf eine nicht ausgeführte Wirkung nicht irrtümlich als erledigt überspringen. Nicht passend: Das vergrößert das Verlustfenster statt es atomar zu schließen. Nicht passend: Ohne Deduplizierung drohen doppelte Wirkungen und fehlende Diagnose.","sources":["https://github.com/SAP-samples/abap-platform-application-jobs"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Ein externer Buchungsaufruf endet im Timeout; das Ziel könnte bereits gebucht haben. Was ist vor einem blinden Retry nötig?","options":["Ein lokales ROLLBACK, das auch die fremde Buchung sicher entfernt.","Idempotenzschlüssel oder verbindlicher Statusabgleich beim Ziel.","Ein neues zufälliges Belegkennzeichen für jede Wiederholung."],"correct":1,"rationales":["Die lokale Transaktion kontrolliert keine bereits wirksame Buchung des fremden Systems.","Der unsichere Ausgang muss so geklärt werden, dass keine doppelte Fachwirkung entsteht.","Ein neuer Schlüssel kann die Deduplizierung umgehen und eine zweite Buchung ermöglichen."],"explain":"Nicht passend: Die lokale Transaktion kontrolliert keine bereits wirksame Buchung des fremden Systems. Richtig: Der unsichere Ausgang muss so geklärt werden, dass keine doppelte Fachwirkung entsteht. Nicht passend: Ein neuer Schlüssel kann die Deduplizierung umgehen und eine zweite Buchung ermöglichen.","sources":["https://github.com/SAP-samples/abap-platform-application-jobs"],"revision":"2026-11-08-abap-senior-v1"}],"sourceKeys":["jobs","monitoring"],"order":["body","code","body2"],"researchedAt":"2026-11-08","seniorRevision":"2026-11-08-abap-senior-v1"},{"id":"abap-m13-senior-launchpad","moduleId":"abap-m13","title":"Fiori Launchpad: Intents, Kataloge und Fehlersuche nach dem Transport","minutes":25,"prerequisites":"Fiori-App und Service; Schwerpunkt ABAP Launchpad in S/4HANA, Tools in Public Edition/BTP separat prüfen.","paragraphs":["Die App funktioniert in der lokalen Vorschau, nach Transport erscheint jedoch keine Kachel oder „Navigation target could not be resolved“. Vorschau und produktiver Launchpad-Einstieg sind unterschiedliche Wege. Das Launchpad löst einen Intent aus Semantic Object und Action mit passenden Parametern zu einem Navigationsziel auf. Eine vorhandene UI5-Anwendung allein liefert noch kein korrekt zugeordnetes Target Mapping.","Business-Kataloge stellen rollenbezogenen App-/Navigationsinhalt bereit. Spaces und Pages organisieren die Oberfläche. Diese Struktur ist nicht identisch mit der fachlichen Backendautorisierung. Eine sichtbare Kachel kann an fehlenden Service- oder Datenrechten scheitern; eine ausgeblendete Kachel verhindert keinen direkten API-Aufruf. Der konkrete Rollen- und Content-Lifecycle hängt von Edition und Launchpad-Variante ab.","Vergleiche nach einem Transport mit einem echten Fachbenutzer: Intent/Parameter, Katalog-/Rollenzuordnung, Page, Target Mapping, App-ID/Version, Zielsystemalias und Service. Prüfe UI-Deployment, OData-Service sowie erforderliche Konfiguration als getrennte Abhängigkeiten. Ein Entwickler mit breiten Rechten ist kein repräsentativer Abnahmetest. Cacheinvalidierung erst nach Befund einsetzen, nicht als Universalantwort.","Nach Upgrades können Referenzen gebrochen oder Apps deprecated/obsolete sein. Im unterstützten ABAP Launchpad hilft der Content Manager, Referenzen und Nachfolger zu analysieren. Änderungen in verschiedenen Konfigurations-/Customizing-Scopes können sich entkoppeln. Übernimm Nachfolger samt Page, Services und Rollen kontrolliert; vorhandene kundeneigene Anpassungen nicht unbesehen durch einen Reset überschreiben."],"codeLang":"text","cases":["Fachbenutzer startet den freigegebenen Intent und landet auf dem richtigen Objekt im richtigen Zielsystem.","Zwei Mappings mit unterschiedlichen Pflichtparametern: reproduzierbare, passende Zielauflösung nachweisen.","Nach Transport fehlt eine Mappingreferenz: Konfiguration lokalisieren, ohne pauschale Adminrechte zu vergeben."],"quiz":[{"q":"Eine UI5-App läuft in der Vorschau, ihr Launchpad-Intent wird nach Transport nicht aufgelöst. Wo setzt die erste Diagnose an?","options":["Bei der Ersetzung aller ABAP-SELECTs durch neue CDS-Views.","Bei Intent, Parametern, Target Mapping und zugeordnetem Inhalt.","Bei der Entfernung aller Backend-Berechtigungsprüfungen."],"correct":1,"rationales":["Der Fehler liegt bereits vor dem fachlichen Datenzugriff in der Zielauflösung.","Die Vorschau beweist die produktive Intentauflösung und Rollenverteilung nicht.","Fehlendes Target Mapping wird dadurch nicht angelegt; zusätzlich entsteht eine Sicherheitslücke."],"explain":"Nicht passend: Der Fehler liegt bereits vor dem fachlichen Datenzugriff in der Zielauflösung. Richtig: Die Vorschau beweist die produktive Intentauflösung und Rollenverteilung nicht. Nicht passend: Fehlendes Target Mapping wird dadurch nicht angelegt; zusätzlich entsteht eine Sicherheitslücke.","sources":["https://learning.sap.com/courses/exploring-the-authorization-concept-for-sap-fiori-on-sap-s-4hana/checking-and-adjusting-launchpad-content"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Eine Kachel ist sichtbar, der Service verweigert einen fremden Beleg. Welche Schlussfolgerung passt?","options":["Kachel und Fachrechte sind verschiedene Grenzen; Ablehnung kann korrekt sein.","Sichtbarkeit garantiert Vollzugriff auf alle Daten dieser Anwendung.","Der Benutzer muss vorsorglich ein dauerhaftes Adminprofil bekommen."],"correct":0,"rationales":["Sichtbarkeit einer Anwendung verleiht kein Recht auf jeden Datensatz.","Katalog-/Oberflächeninhalt ist kein universeller Datensatzberechtigungsnachweis.","Breite Zusatzrechte umgehen den Fachvertrag und sind keine Fehlerdiagnose."],"explain":"Richtig: Sichtbarkeit einer Anwendung verleiht kein Recht auf jeden Datensatz. Nicht passend: Katalog-/Oberflächeninhalt ist kein universeller Datensatzberechtigungsnachweis. Nicht passend: Breite Zusatzrechte umgehen den Fachvertrag und sind keine Fehlerdiagnose.","sources":["https://learning.sap.com/courses/building-transactional-apps-with-the-abap-restful-application-programming-model/implementing-authority-checks"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Nach einem Upgrade meldet der Content Manager eine veraltete App und einen Nachfolger. Was gehört zur Umstellung?","options":["Nur die Kachel beschriften; der technische Verweis kann unverändert bleiben.","Alle Kundenscopes ohne Prüfung auf SAP-Standard zurücksetzen.","Mapping, Page, Services und Rollen des Nachfolgers gemeinsam prüfen."],"correct":2,"rationales":["Ein neuer Text migriert weder Navigation noch Serviceabhängigkeiten.","Das kann berechtigte kundeneigene Anpassungen verwerfen.","Der neue Einstieg muss mit seinen technischen und fachlichen Abhängigkeiten konsistent sein."],"explain":"Nicht passend: Ein neuer Text migriert weder Navigation noch Serviceabhängigkeiten. Nicht passend: Das kann berechtigte kundeneigene Anpassungen verwerfen. Richtig: Der neue Einstieg muss mit seinen technischen und fachlichen Abhängigkeiten konsistent sein.","sources":["https://learning.sap.com/courses/exploring-the-authorization-concept-for-sap-fiori-on-sap-s-4hana/checking-and-adjusting-launchpad-content"],"revision":"2026-11-08-abap-senior-v1"}],"sourceKeys":["launchpad","auth"],"order":["body","code","body2"],"researchedAt":"2026-11-08","seniorRevision":"2026-11-08-abap-senior-v1"},{"id":"abap-m11-senior-semantics","moduleId":"abap-m11","title":"CDS-Fachsemantik: Währungen, Einheiten und belastbare Summen","minutes":25,"prerequisites":"CDS View Entities, Aggregationen und DDIC-Typen; Zielfunktionen für Umrechnung sind releaseabhängig.","paragraphs":["Eine Zahl 100 ist ohne Einheit oder Währung fachlich unvollständig. Ein Betrag braucht seine Währungsreferenz, eine Menge ihre Maßeinheit. Für entsprechend typisierte Elemente in CDS View Entities werden diese Referenzen durch Semantics-Annotationen verbunden. Wähle die tatsächlichen projizierten Feldnamen; ein umbenanntes CurrencyCode muss auch in der Referenz korrekt erscheinen.","Die Annotation amount.currencyCode erklärt, zu welchem Währungsfeld der Betrag gehört. Sie rechnet 100 USD nicht in 100 EUR um. Mengen von 10 KG und 5 ST dürfen nicht blind als 15 summiert werden. Entweder nach kompatibler Einheit/Währung gruppieren oder eine definierte Umrechnung mit fachlich passender Dimension und Referenz vornehmen.","Bei Währungsumrechnung sind Zielwährung, Kursdatum, Kurstyp, verfügbare Kurse und Fehlerbehandlung Teil des Vertrags. Datenbanktyp, Währungsdezimalstellen, Berechnungspräzision und Anzeigeformat sind unterschiedliche Ebenen. Vermeide binäre Gleitkommaarithmetik als pauschale Geldstrategie; auch DECIMAL allein entscheidet nicht, wann fachlich gerundet wird. Fehlende Kurse nicht still als 1 behandeln.","Prüfe Zeilengranularität vor der Aggregation: ein Join auf mehrere Texte oder Positionen kann denselben Betrag vervielfachen. DISTINCT ist keine allgemeine Reparatur, weil zwei fachlich verschiedene Positionen denselben Wert haben können. Vergleiche Schlüssel, Anzahl und Summen vor und nach der Erweiterung. Technisch schnelle falsche Summen bleiben fachlich falsch."],"codeLang":"cds","cases":["Zwei EUR-Positionen derselben Granularität ergeben die erwartete EUR-Summe mit korrekter Referenz.","EUR und USD bleiben getrennt oder werden mit festgelegtem Datum/Kurstyp nachvollziehbar konvertiert.","Fehlender Kurs oder vervielfachender Textjoin: kontrollierter Fehler beziehungsweise korrigierte Ergebnismenge statt erfundener Summe."],"quiz":[{"q":"Eine View annotiert NetAmount mit CurrencyCode. Eine Zeile enthält USD, die andere EUR. Was bewirkt die Annotation allein?","options":["Sie rechnet alle Beträge automatisch in die Anmeldesprache um.","Sie ersetzt die Werte implizit durch Beträge in der Hauswährung.","Sie verknüpft Betrag und Währungsreferenz, ohne Werte umzurechnen."],"correct":2,"rationales":["Sprache ist keine Zielwährung und die Annotation führt keine Kursumrechnung aus.","Eine semantische Referenz bestimmt weder Kurs noch Umrechnungsdatum.","Für eine gemeinsame Summe ist zusätzlich ein fachlich definierter Umrechnungs- oder Gruppierungsvertrag nötig."],"explain":"Nicht passend: Sprache ist keine Zielwährung und die Annotation führt keine Kursumrechnung aus. Nicht passend: Eine semantische Referenz bestimmt weder Kurs noch Umrechnungsdatum. Richtig: Für eine gemeinsame Summe ist zusätzlich ein fachlich definierter Umrechnungs- oder Gruppierungsvertrag nötig.","sources":["https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/using-abap-annotations-in-cds-views_fcda7ade-1bb7-4c79-8b1f-0f20c7f45a70"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Nach einem Join auf zwei sprachabhängige Texte verdoppelt sich die Belegsumme. Was prüfst du zuerst?","options":["Die Join-Kardinalität und Zeilengranularität vor der Aggregation.","Ob die Betragsanzeige von zwei auf null Nachkommastellen wechselt.","Ob man DISTINCT nur auf dem Betrag als universellen Fix setzen kann."],"correct":0,"rationales":["Mehrere Texttreffer können die gleichen fachlichen Beträge mehrfach in die Summe aufnehmen.","Darstellungspräzision erklärt nicht die systematische Verdopplung der Zeilen.","Gleiche Beträge können zu verschiedenen echten Positionen gehören; DISTINCT kann dann Daten verlieren."],"explain":"Richtig: Mehrere Texttreffer können die gleichen fachlichen Beträge mehrfach in die Summe aufnehmen. Nicht passend: Darstellungspräzision erklärt nicht die systematische Verdopplung der Zeilen. Nicht passend: Gleiche Beträge können zu verschiedenen echten Positionen gehören; DISTINCT kann dann Daten verlieren.","sources":["https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/using-abap-annotations-in-cds-views_fcda7ade-1bb7-4c79-8b1f-0f20c7f45a70"],"revision":"2026-11-08-abap-senior-v1"},{"q":"Für eine EUR-Umrechnung fehlt am geforderten Kursdatum der USD-Kurs. Welche Behandlung ist fachlich belastbar?","options":["Den fehlenden Kurs still durch 1 ersetzen und die Summe freigeben.","Den fehlenden Kurs nach festgelegtem Fehlervertrag sichtbar behandeln.","Die Währungsannotation entfernen und die Beträge als Stückzahlen summieren."],"correct":1,"rationales":["Das erzeugt ohne fachliche Grundlage einen falschen Gegenwert.","Fallback, Ablehnung oder Nachpflege müssen ausdrücklich vereinbart sein; keine erfundene Umrechnung.","Die Semantik zu entfernen löst den fehlenden Kurs nicht."],"explain":"Nicht passend: Das erzeugt ohne fachliche Grundlage einen falschen Gegenwert. Richtig: Fallback, Ablehnung oder Nachpflege müssen ausdrücklich vereinbart sein; keine erfundene Umrechnung. Nicht passend: Die Semantik zu entfernen löst den fehlenden Kurs nicht.","sources":["https://learning.sap.com/courses/building-data-models-with-the-abap-dictionary-and-abap-core-data-services/using-abap-annotations-in-cds-views_fcda7ade-1bb7-4c79-8b1f-0f20c7f45a70"],"revision":"2026-11-08-abap-senior-v1"}],"sourceKeys":["semantics"],"order":["body","code","body2"],"researchedAt":"2026-11-08","seniorRevision":"2026-11-08-abap-senior-v1"}];
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
function rpQuestionId(lesson,index){ var q=lesson.quiz[index];return lesson.id+'#'+index+(q.revision?'@'+q.revision:''); }
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
var RP_EXTRA_INDEX=[["x#0@2026-11-07-full-v3","m1-l1"],["x#1@2026-11-07-full-v3","m1-l2"],["x#2@2026-11-07-full-v3","m1-l3"],["x#3@2026-11-07-full-v3","m1-l3"],["x#4@2026-11-07-full-v3","m1-l4"],["x#5@2026-11-07-full-v3","m2-l1"],["x#6@2026-11-07-full-v3","m2-l2"],["x#7@2026-11-07-full-v3","m2-l3"],["x#8@2026-11-07-full-v3","m3-l1"],["x#9@2026-11-07-full-v3","m3-l2"],["x#10@2026-11-07-full-v3","m3-l3"],["x#11@2026-11-07-full-v3","m3-l4"],["x#12@2026-11-07-full-v3","m4-l1"],["x#13@2026-11-07-full-v3","m4-l2"],["x#14@2026-11-07-full-v3","m4-l3"],["x#15@2026-11-07-full-v3","m4-l3"],["x#16@2026-11-07-full-v3","m5-l1"],["x#17@2026-11-07-full-v3","m5-l2"],["x#18@2026-11-07-full-v3","m5-l3"],["x#19@2026-11-07-full-v3","m5-l4"],["x#20@2026-11-07-full-v3","m6-l1"],["x#21@2026-11-07-full-v3","m6-l2"],["x#22@2026-11-07-full-v3","m6-l3"],["x#23@2026-11-07-full-v3","m6-l3"],["x#24@2026-11-07-full-v3","m7-l1"],["x#25@2026-11-07-full-v3","m7-l2"],["x#26@2026-11-07-full-v3","m7-l3"],["x#27@2026-11-07-full-v3","m7-l3"],["x#28@2026-11-07-full-v3","m7-l4"],["x#29@2026-11-07-full-v3","m7-l5"],["x#30@2026-11-07-full-v3","m8-l1"],["x#31@2026-11-07-full-v3","m8-l2"],["x#32@2026-11-07-full-v3","m8-l2"],["x#33@2026-11-07-full-v3","m8-l3"],["x#34@2026-11-07-full-v3","m9-l1"],["x#35@2026-11-07-full-v3","m9-l2"],["x#36@2026-11-07-full-v3","m9-l2"],["x#37@2026-11-07-full-v3","m9-l3"],["x#38@2026-11-07-full-v3","m10-l1"],["x#39@2026-11-07-full-v3","m10-l1"],["x#40@2026-11-07-full-v3","m10-l2"],["x#41@2026-11-07-full-v3","m10-l3"],["x#42@2026-11-07-full-v3","m10-l3"],["x#43@2026-11-07-full-v3","m10-l4"],["x#44@2026-11-07-full-v3","m11-l1"],["x#45@2026-11-07-full-v3","m11-l1"],["x#46@2026-11-07-full-v3","m11-l2"],["x#47@2026-11-07-full-v3","m11-l2"],["x#48@2026-11-07-full-v3","m11-l3"],["x#49@2026-11-07-full-v3","m11-l4"],["x#50@2026-11-07-full-v3","m12-l1"],["x#51@2026-11-07-full-v3","m12-l1"],["x#52@2026-11-07-full-v3","m12-l2"],["x#53@2026-11-07-full-v3","m12-l3"],["x#54@2026-11-07-full-v3","m12-l4"],["x#55@2026-11-07-full-v3","m12-l5"],["x#56@2026-11-07-full-v3","m13-l1"],["x#57@2026-11-07-full-v3","m13-l1"],["x#58@2026-11-07-full-v3","m13-l2"],["x#59@2026-11-07-full-v3","m13-l2"],["x#60@2026-11-07-full-v3","m13-l3"],["x#61@2026-11-07-full-v3","m14-l1"],["x#62@2026-11-07-full-v3","m14-l1"],["x#63@2026-11-07-full-v3","m14-l2"],["x#64@2026-11-07-full-v3","m14-l2"],["x#65@2026-11-07-full-v3","m14-l3"],["x#66@2026-11-07-full-v3","m14-l4"],["x#67@2026-11-07-full-v3","m15-l1"],["x#68@2026-11-07-full-v3","m15-l2"],["x#69@2026-11-07-full-v3","m15-l3"],["x#70@2026-11-07-full-v3","m15-l3"],["x#71@2026-11-07-full-v3","m15-l3"],["x#72@2026-11-07-full-v3","m15-l4"],["x#73@2026-11-07-full-v3","m15-l4"],["x#74@2026-11-07-full-v3","m16-l1"],["x#75@2026-11-07-full-v3","m16-l1"],["x#76@2026-11-07-full-v3","m16-l2"],["x#77@2026-11-07-full-v3","m16-l2"],["x#78@2026-11-07-full-v3","m16-l3"],["x#79@2026-11-07-full-v3","m16-l3"],["x#80@2026-11-07-full-v3","m16-l4"],["x#81@2026-11-07-full-v3","m16-l4"],["x#82@2026-11-07-full-v3","m16-l4"],["x#83@2026-11-07-full-v3","m17-l1"],["x#84@2026-11-07-full-v3","m17-l2"],["x#85@2026-11-07-full-v3","m17-l2"],["x#86@2026-11-07-full-v3","m17-l2"],["x#87@2026-11-07-full-v3","m17-l3"],["x#88@2026-11-07-full-v3","m17-l3"],["x#89@2026-11-07-full-v3","m18-l1"],["x#90@2026-11-07-full-v3","m18-l2"],["x#91@2026-11-07-full-v3","m18-l2"],["x#92@2026-11-07-full-v3","m18-l3"],["x#93@2026-11-07-full-v3","m18-l3"],["x#94@2026-11-07-full-v3","m18-l4"],["x#95@2026-11-07-full-v3","m18-l4"],["x#96@2026-11-07-full-v3","m18-l4"],["x#97@2026-11-07-full-v3","m19-l1"],["x#98@2026-11-07-full-v3","m19-l1"],["x#99@2026-11-07-full-v3","m19-l2"],["x#100@2026-11-07-full-v3","m19-l2"],["x#101@2026-11-07-full-v3","m19-l3"],["x#102@2026-11-07-full-v3","m19-l3"],["x#103@2026-11-07-full-v3","m19-l4"],["x#104@2026-11-07-full-v3","m19-l4"],["x#105@2026-11-07-full-v3","m19-l4"],["x#106@2026-11-07-full-v3","m20-l1"],["x#107@2026-11-07-full-v3","m20-l1"],["x#108@2026-11-07-full-v3","m20-l2"],["x#109@2026-11-07-full-v3","m20-l2"],["x#110@2026-11-07-full-v3","m20-l3"],["x#111@2026-11-07-full-v3","m20-l3"],["x#112@2026-11-07-full-v3","m20-l4"],["x#113@2026-11-07-full-v3","m20-l4"],["x#114@2026-11-07-full-v3","m21-l1"],["x#115@2026-11-07-full-v3","m21-l1"],["x#116@2026-11-07-full-v3","m21-l2"],["x#117@2026-11-07-full-v3","m21-l2"],["x#118@2026-11-07-full-v3","m21-l3"],["x#119@2026-11-07-full-v3","m21-l3"],["x#120@2026-11-07-full-v3","m21-l4"],["x#121@2026-11-07-full-v3","m21-l4"],["x#122@2026-11-07-full-v3","m21-l5"],["x#123@2026-11-07-full-v3","m21-l5"],["x#124@2026-11-07-full-v3","m22-l1"],["x#125@2026-11-07-full-v3","m22-l1"],["x#126@2026-11-07-full-v3","m22-l1"],["x#127@2026-11-07-full-v3","m22-l2"],["x#128@2026-11-07-full-v3","m22-l2"],["x#129@2026-11-07-full-v3","m22-l3"],["x#130@2026-11-07-full-v3","m22-l3"],["x#131@2026-11-07-full-v3","m23-l1"],["x#132@2026-11-07-full-v3","m23-l1"],["x#133@2026-11-07-full-v3","m23-l2"],["x#134@2026-11-07-full-v3","m23-l2"],["x#135@2026-11-07-full-v3","m23-l3"],["x#136@2026-11-07-full-v3","m23-l3"],["x#137@2026-11-07-full-v3","m23-l3"],["x#138@2026-11-07-full-v3","m24-l1"],["x#139@2026-11-07-full-v3","m24-l1"],["x#140@2026-11-07-full-v3","m24-l2"],["x#141@2026-11-07-full-v3","m24-l2"],["x#142@2026-11-07-full-v3","m24-l2"],["x#143@2026-11-07-full-v3","m24-l3"],["x#144@2026-11-07-full-v3","m24-l3"],["x#145@2026-11-07-full-v3","m24-l4"],["x#146@2026-11-07-full-v3","m24-l4"],["x#147@2026-11-07-full-v3","m25-l1"],["x#148@2026-11-07-full-v3","m25-l1"],["x#149@2026-11-07-full-v3","m25-l2"],["x#150@2026-11-07-full-v3","m25-l2"],["x#151@2026-11-07-full-v3","m25-l3"],["x#152@2026-11-07-full-v3","m25-l3"],["x#153@2026-11-07-full-v3","m25-l3"],["x#154@2026-11-07-full-v3","m26-l1"],["x#155@2026-11-07-full-v3","m26-l1"],["x#156@2026-11-07-full-v3","m26-l2"],["x#157@2026-11-07-full-v3","m26-l2"],["x#158@2026-11-07-full-v3","m26-l3"],["x#159@2026-11-07-full-v3","m26-l3"],["x#160@2026-11-07-full-v3","m27-l1"],["x#161@2026-11-07-full-v3","m27-l1"],["x#162@2026-11-07-full-v3","m27-l2"],["x#163@2026-11-07-full-v3","m27-l2"],["x#164@2026-11-07-full-v3","m28-l1"],["x#165@2026-11-07-full-v3","m28-l1"],["x#166@2026-11-07-full-v3","m28-l2"],["x#167@2026-11-07-full-v3","m28-l2"],["x#168@2026-11-07-full-v3","m28-l2"],["x#169@2026-11-07-full-v3","m28-l3"],["x#170@2026-11-07-full-v3","m28-l3"],["x#171@2026-11-07-full-v3","m28-l4"],["x#172@2026-11-07-full-v3","m28-l4"],["x#173@2026-11-07-full-v3","m28-l4"],["x#174@2026-11-07-full-v3","m28-l4"],["x#175@2026-11-07-full-v3","m29-l1"],["x#176@2026-11-07-full-v3","m29-l1"],["x#177@2026-11-07-full-v3","m29-l1"],["x#178@2026-11-07-full-v3","m29-l1"],["x#179@2026-11-07-full-v3","m29-l2"],["x#180@2026-11-07-full-v3","m29-l2"],["x#181@2026-11-07-full-v3","m29-l3"],["x#182@2026-11-07-full-v3","m29-l3"],["x#183@2026-11-07-full-v3","m30-l1"],["x#184@2026-11-07-full-v3","m30-l1"],["x#185@2026-11-07-full-v3","m30-l1"],["x#186@2026-11-07-full-v3","m30-l1"],["x#187@2026-11-07-full-v3","m30-l2"],["x#188@2026-11-07-full-v3","m30-l2"],["x#189@2026-11-07-full-v3","m30-l2"],["x#190@2026-11-07-full-v3","m30-l3"],["x#191@2026-11-07-full-v3","m30-l3"],["x#192@2026-11-07-full-v3","m30-l3"],["x#193@2026-11-07-full-v3","m31-l1"],["x#194@2026-11-07-full-v3","m31-l2"],["x#195@2026-11-07-full-v3","m31-l3"],["x#196@2026-11-07-full-v3","m31-l4"],["x#197@2026-11-07-full-v3","m31-l5"],["x#198@2026-11-07-full-v3","m32-l1"],["x#199@2026-11-07-full-v3","m32-l2"],["x#200@2026-11-07-full-v3","m32-l3"],["x#201@2026-11-07-full-v3","m32-l4"],["x#202@2026-11-07-full-v3","m33-l1"],["x#203@2026-11-07-full-v3","m33-l2"],["x#204@2026-11-07-full-v3","m33-l3"],["x#205@2026-11-07-full-v3","m33-l4"],["x#206@2026-11-07-full-v3","m34-l1"],["x#207@2026-11-07-full-v3","m34-l2"],["x#208@2026-11-07-full-v3","m34-l3"],["x#209@2026-11-07-full-v3","m34-l4"],["x#210@2026-11-07-full-v3","m34-l5"],["x#211@2026-11-07-full-v3","m35-l1"],["x#212@2026-11-07-full-v3","m35-l2"],["x#213@2026-11-07-full-v3","m35-l3"],["x#214@2026-11-07-full-v3","abap-m1-l1"],["x#215@2026-11-07-full-v3","abap-m1-l2"],["x#216@2026-11-07-full-v3","abap-m1-l4"],["x#217@2026-11-07-full-v3","abap-m1-l4"],["x#218@2026-11-07-full-v3","abap-m2-l1"],["x#219@2026-11-07-full-v3","abap-m2-l2"],["x#220@2026-11-07-full-v3","abap-m3-l2"],["x#221@2026-11-07-full-v3","abap-m3-l3"],["x#222@2026-11-07-full-v3","abap-m4-l1"],["x#223@2026-11-07-full-v3","abap-m5-l2"],["x#224@2026-11-07-full-v3","abap-m6-l1"],["x#225@2026-11-07-full-v3","abap-m7-l0"],["x#226@2026-11-07-full-v3","abap-m7-l1"],["x#227@2026-11-07-full-v3","abap-m7-l2"],["x#228@2026-11-07-full-v3","abap-m8-l1"],["x#229@2026-11-07-full-v3","abap-m8-l3"],["x#230@2026-11-07-full-v3","abap-m9-l1"],["x#231@2026-11-07-full-v3","abap-m9-l2"],["x#232@2026-11-07-full-v3","abap-m10-l1"],["x#233@2026-11-07-full-v3","abap-m10-l4"],["x#234@2026-11-07-full-v3","abap-m11-l1"],["x#235@2026-11-07-full-v3","abap-m12-l1"],["x#236@2026-11-07-full-v3","abap-m12-l2"],["x#237@2026-11-07-full-v3","abap-m13-l2"],["x#238@2026-11-07-full-v3","abap-m14-l1"],["x#239@2026-11-07-full-v3","abap-m15-l1"],["x#240@2026-11-07-full-v3","abap-m16-l1"],["x#241@2026-11-07-full-v3","abap-m17-l1"],["x#242@2026-11-07-full-v3","abap-m17-l2"],["x#243@2026-11-07-full-v3","abap-m18-l1"],["x#244@2026-11-07-full-v3","abap-m19-l1"],["x#245@2026-11-07-full-v3","abap-m20-l3"],["x#246@2026-11-07-full-v3","java-m1-l1"],["x#247@2026-11-07-full-v3","java-m1-l2"],["x#248@2026-11-07-full-v3","java-m1-l4"],["x#249@2026-11-07-full-v3","java-m1-l4"],["x#250@2026-11-07-full-v3","java-m2-l2"],["x#251@2026-11-07-full-v3","java-m3-l3"],["x#252@2026-11-07-full-v3","java-m4-l1"],["x#253@2026-11-07-full-v3","java-m5-l2"],["x#254@2026-11-07-full-v3","java-m6-l1"],["x#255@2026-11-07-full-v3","java-m7-l1"],["x#256@2026-11-07-full-v3","java-m7-l2"],["x#257@2026-11-07-full-v3","java-m7-l2"],["x#258@2026-11-07-full-v3","java-m7-l3"],["x#259@2026-11-07-full-v3","java-m7-l4"],["x#260@2026-11-07-full-v3","java-m8-l1"],["x#261@2026-11-07-full-v3","java-m8-l2"],["x#262@2026-11-07-full-v3","java-m8-l3"],["x#263@2026-11-07-full-v3","java-m8-l4"],["x#264@2026-11-07-full-v3","java-m9-l1"],["x#265@2026-11-07-full-v3","java-m9-l2"],["x#266@2026-11-07-full-v3","java-m9-l3"],["x#267@2026-11-07-full-v3","java-m9-l4"],["x#268@2026-11-07-full-v3","java-m10-l1"],["x#269@2026-11-07-full-v3","java-m10-l2"],["x#270@2026-11-07-full-v3","java-m11-l1"],["x#271@2026-11-07-full-v3","java-m11-l2"],["x#272@2026-11-07-full-v3","java-m11-l4"],["x#273@2026-11-07-full-v3","java-m12-l1"],["x#274@2026-11-07-full-v3","java-m12-l3"],["x#275@2026-11-07-full-v3","java-m13-l2"],["x#276@2026-11-07-full-v3","java-m13-l3"],["x#277@2026-11-07-full-v3","java-m14-l1"],["x#278@2026-11-07-full-v3","java-m14-l2"],["x#279@2026-11-07-full-v3","java-m15-l1"],["x#280@2026-11-07-full-v3","java-m15-l3"],["x#281@2026-11-07-full-v3","java-m16-l1"],["x#282@2026-11-07-full-v3","java-m16-l2"],["x#283@2026-11-07-full-v3","java-m17-l1"],["x#284@2026-11-07-full-v3","java-m17-l2"],["x#285@2026-11-07-full-v3","java-m18-l1"],["x#286@2026-11-07-full-v3","java-m19-l1"],["x#287@2026-11-07-full-v3","java-m19-l3"],["x#288@2026-11-07-full-v3","java-m20-l1"],["x#289@2026-11-07-full-v3","java-m20-l2"],["x#290@2026-11-07-full-v3","java-m20-l3"],["x#291@2026-11-07-full-v3","java-m21-l1"],["x#292@2026-11-07-full-v3","java-m21-l2"],["x#293@2026-11-07-full-v3","java-m21-l2"],["x#294@2026-11-07-full-v3","java-m21-l3"],["x#295@2026-11-07-full-v3","java-m22-l1"],["x#296@2026-11-07-full-v3","java-m22-l1"],["x#297@2026-11-07-full-v3","java-m22-l2"],["x#298@2026-11-07-full-v3","java-m22-l3"],["x#299@2026-11-07-full-v3","java-m23-l1"],["x#300@2026-11-07-full-v3","java-m23-l2"],["x#301@2026-11-07-full-v3","java-m23-l2"],["x#302@2026-11-07-full-v3","java-m23-l3"],["x#303@2026-11-07-full-v3","java-m24-l1"],["x#304@2026-11-07-full-v3","java-m24-l2"],["x#305@2026-11-07-full-v3","java-m24-l3"]];
RP_EXTRA_INDEX.forEach(function(row){
  var mod=MODULES.find(function(m){ return m.lessons.some(function(l){ return l.id === row[1]; }); });
  var les=mod.lessons.find(function(l){ return l.id === row[1]; });
  CARDS.push({ id:row[0], lessonId:row[1], lessonTitle:les.title, moduleTitle:mod.title, part:mod.part });
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
  if(!host) return null;
  var el = document.createElement('div');
  el.className = 'toast' + (cls ? ' ' + cls : '');
  el.innerHTML = html;
  /* Höchstens zwei Hinweise gleichzeitig, damit sie auf dem Handy nicht den Inhalt überdecken. */
  while(host.children.length >= 2) host.removeChild(host.firstChild);
  host.appendChild(el);
  setTimeout(function(){ el.classList.add('out'); }, 2600);
  setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 3100);
  return el;
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
  /* „+0 XP“ ist kein Ereignis, das einen Hinweis verdient (z. B. Prüfung ohne richtige Antwort). */
  if(amount > 0){
    var toast = showToast('<span class="t-xp">+'+amount+' XP</span><span class="t-reason">'+esc(reason)+'</span>');
    /* Größere Erfolge (ab 50 XP) bekommen zusätzlich Glanz und einen kleinen Ausbruch; kleine bleiben ruhig. */
    if(toast && amount >= xpAnzeige(25) && window.rpCelebrate){
      toast.classList.add('celebrate');
      window.rpCelebrate(toast, amount >= xpAnzeige(50) ? 'burst' : 'spark');
    }
  }
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
  var badgeToast = showToast('<span class="t-xp">'+b.icon+' Abzeichen</span><span class="t-reason">'+esc(b.name)+'</span>', 'badge');
  if(badgeToast && window.rpCelebrate){ badgeToast.classList.add('celebrate'); window.rpCelebrate(badgeToast, 'burst'); }
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
  if(window.rpCelebrateAfterRender) window.rpCelebrateAfterRender(el.querySelector('.lu-icon'), 'confetti');
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
  if(checked && window.rpCelebrateAfterRender) window.rpCelebrateAfterRender('.complete-toggle.on', 'burst');
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
  /* Beim Start rendert bootstrap.js genau einmal, wenn alle Skripte geladen sind; frühere Aufrufe aus Skript-Endstücken wären verworfene Arbeit. */
  if(window.RP_BOOTING) return;
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
function fuelleModulKnoepfe(det, m){
  if(det.dataset.gefuellt) return;
  det.dataset.gefuellt = '1';
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
}
function oeffneModulKnoepfe(det){
  if(!det || !det.matches || !det.matches('details.module') || det.dataset.gefuellt) return;
  var m = (typeof rpCatalog !== 'undefined' ? rpCatalog.modules : MODULES).find(function(x){ return x.id === det.dataset.modul; });
  if(m) fuelleModulKnoepfe(det, m);
}
function renderSidebar(){
  var nav = document.getElementById('moduleNav');
  nav.innerHTML = '';
  if(!nav.dataset.lazyKnoepfe){
    nav.dataset.lazyKnoepfe = '1';
    /* Klick auf die Zusammenfassung füllt vor dem Aufklappen (kein leerer Frame); toggle fängt programmatisches Öffnen ab (Aufnahmephase, da toggle nicht sprudelt). */
    nav.addEventListener('click', function(e){ var sum = e.target.closest && e.target.closest('summary'); if(sum) oeffneModulKnoepfe(sum.parentElement); });
    nav.addEventListener('toggle', function(e){ if(e.target.open) oeffneModulKnoepfe(e.target); }, true);
  }
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
    det.dataset.modul = m.id;
    /* Die Lektionsknöpfe entstehen erst, wenn das Modul geöffnet wird (aktuelles Modul sofort): spart beim Rendern rund 2.500 Elemente. */
    if(det.open) fuelleModulKnoepfe(det, m);
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
    html += '<fieldset class="qcard" id="q_'+lesson.id+'_'+qi+'"><legend><span class="qnum">Frage '+(qi+1)+' von '+lesson.quiz.length+'</span>'+esc(q.q)+'</legend>';
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
  var rightOptions = [];
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
    /* Richtige Option immer markieren, falsch gewählte zusätzlich; Markierungen früherer Prüfungen zuerst löschen. */
    var optionRoot = document.getElementById('q_'+lessonId+'_'+qi);
    optionRoot.querySelectorAll('.opt').forEach(function(label){
      var radio = label.querySelector('input');
      var index = parseInt(radio.value, 10);
      label.classList.toggle('is-correct', index === q.correct);
      label.classList.toggle('is-wrong', index === val && !ok);
    });
    var cardId = rpQuestionId(lesson,qi);
    recordAnswer(cardId, ok);
    /* Antwort aus der Lektion heraus plant die Karte ins Wiederholungssystem ein. */
    if(ok){ if(!state.srs[cardId]) rateCard(cardId, 2); }
    else { rateCard(cardId, 0); }
    var firstRight = ok && !state.xpLog['quiz:' + cardId];
    if(firstRight){ state.xpLog['quiz:' + cardId] = 1; gain += 10; }
    if(ok) rightOptions.push({ el: optionRoot.querySelector('.opt.is-correct'), fresh: firstRight });

    if(ok){
      fb.className = 'qfeedback show correct';
      /* Bei richtiger Antwort liegt die Erklärung eingeklappt; nach einem Fehler bleibt sie sichtbar. */
      fb.textContent = '✓ Richtig. ';
      var explain = document.createElement('details');
      explain.className = 'qexplain';
      var summary = document.createElement('summary');
      summary.textContent = 'Erklärung anzeigen';
      var explainText = document.createElement('p');
      explainText.textContent = q.explain;
      explain.append(summary, explainText);
      fb.appendChild(explain);
    } else {
      fb.className = 'qfeedback show wrong';
      fb.textContent = '✗ Nicht ganz. Richtig ist: „' + q.options[q.correct] + '". ' + q.explain;
    }
  });
  if(gain) awardXp(gain, 'Quizfragen richtig');
  /* Richtige Antworten leuchten kurz auf; Funken nur bei der ersten richtigen Antwort einer Frage (höchstens drei). */
  if(window.rpCelebrate){
    var sparks = 0;
    rightOptions.forEach(function(r){
      if(!r.el) return;
      if(r.fresh && sparks < 3){ sparks++; window.rpCelebrate(r.el, 'spark'); }
      else window.rpCelebrate(r.el, 'none');
    });
  }
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
    var justSolved = true;
  }
  saveProgress();
  renderContent();
  if(justSolved && window.rpCelebrateAfterRender) window.rpCelebrateAfterRender('#sv_' + id, 'burst');
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
function ueUmschalten(exId){
  var box = document.getElementById('ue_' + exId);
  if(!box) return;
  box.hidden = !box.hidden;
  ue.offen[exId] = !box.hidden;
  if(!box.hidden){
    if(!tutor.ready) tutorInit();
    var f = document.getElementById('ueFeld_' + exId);
    if(f) f.focus();
  }
}
function ueSchreiben(exId, wert){
  state.ueTexte = state.ueTexte || {};
  var w = String(wert == null ? '' : wert);
  if(w.trim()) state.ueTexte[exId] = w; else delete state.ueTexte[exId];
  clearTimeout(ue.speichern);
  ue.speichern = setTimeout(saveProgress, 900);
}
function reviewBeenden(){ review.queue = []; renderContent(); }
function pruefungNeuStarten(){ exam.active = false; renderContent(); }
function traceAuswahl(){ tracer.id = null; renderContent(); }
function seiteNeuLaden(){ location.reload(); }
function ueTaste(ev, exId){
  if((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter'){ ev.preventDefault(); uePruefen(exId); }
}
function ueLeeren(exId){
  var f = document.getElementById('ueFeld_' + exId);
  if(f){ f.value = ''; f.focus(); }
  ueSchreiben(exId, '');
  delete ue.erg[exId];
  delete ue.fehler[exId];
  ueErgZeichnen(exId);
  var n = document.getElementById('ueNote_' + exId);
  if(n){ n.className = 'ue-note'; n.textContent = 'Strg + Enter prüft · +' + xpAnzeige(10) + ' XP'; }
}
function ueKnopfStand(exId){
  var b = document.getElementById('ueBtn_' + exId);
  if(!b) return;
  b.disabled = !!ue.busy[exId];
  b.textContent = ue.busy[exId] ? 'Claude korrigiert …' : 'Lösung prüfen lassen';
}
function ueErgZeichnen(exId){
  var box = document.getElementById('ueErg_' + exId);
  if(!box) return;
  var h = ueErgHtml(exId);
  box.innerHTML = h;
  box.hidden = !h;
}
function ueErgHtml(exId){
  if(ue.busy[exId]){
    return '<div class="ue-warten"><span class="kl-spinner" aria-hidden="true"></span>'+
           '<span>Claude liest deine Lösung gegen die Musterlösung und vergibt Teilpunkte auf den Rechenweg.</span></div>';
  }
  if(ue.fehler[exId]){
    return '<div class="kl-rueck luecke"><span class="kl-rueck-lbl">Kein Ergebnis</span>'+esc(ue.fehler[exId])+'</div>';
  }
  var r = ue.erg[exId];
  if(!r) return '';
  var q = r.max ? r.punkte / r.max : 0;
  var klasse = q >= 0.8 ? 'gut' : (q >= 0.5 ? 'teils' : 'schwach');
  var h = '<div class="ue-kopf"><span class="ue-punkte '+klasse+'">'+r.punkte+' / '+r.max+' Punkte</span>'+
          (r.urteil ? '<span class="ue-urteil">'+esc(r.urteil)+'</span>' : '')+'</div>';
  if(r.staerken) h += '<div class="kl-rueck gut"><span class="kl-rueck-lbl">Das war richtig</span>'+esc(r.staerken)+'</div>';
  if(r.luecken)  h += '<div class="kl-rueck luecke"><span class="kl-rueck-lbl">Das hat gefehlt</span>'+esc(r.luecken)+'</div>';
  if(r.tipp)     h += '<div class="kl-rueck tipp"><span class="kl-rueck-lbl">Fürs nächste Mal</span>'+esc(r.tipp)+'</div>';
  h += '<div class="ex-meta">Eine Einschätzung, kein amtliches Ergebnis — im Zweifel zählt die Musterlösung. '+
       'Mit „Lösung anzeigen“ vergleichst du selbst.</div>';
  return h;
}
function ueFehlertext(code){
  switch(code){
    case 'not_granted':
    case 'not_declared':
    case 'capability_disabled':
    case 'sampling_disabled':
      return 'Die Prüfung durch Claude ist hier nicht freigegeben. Vergleiche über „Lösung anzeigen“ selbst — '+
             'oder nimm den Prüfauftrag mit in den Chat.';
    case 'rate_limited':
      return 'Gerade zu viele Anfragen. Warte einen Moment und prüfe dann erneut — dein Text bleibt stehen.';
    case 'session_expired':
      return 'Deine Sitzung ist abgelaufen. Melde dich neu an und prüfe noch einmal.';
    case 'prompt_too_large':
      return 'Deine Lösung ist zu lang für eine Bewertung. Kürze sie auf den Rechenweg und das Ergebnis.';
    case 'refused':
      return 'Diese Antwort konnte nicht bewertet werden. Formuliere sie bitte anders.';
    case 'invalid_json':
    case 'empty_completion':
      return 'Die Bewertung kam nicht in verwertbarer Form zurück. Versuch es gleich noch einmal.';
    default:
      return 'Die Prüfung hat nicht geklappt. Versuch es gleich noch einmal — dein Text bleibt stehen.';
  }
}
