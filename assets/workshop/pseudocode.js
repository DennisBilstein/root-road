/* Werkstattaufgaben der Spur pseudocode (Original Root Road). Wird erst geladen, wenn die Spur in der Werkstatt geöffnet wird. */
(function(){
var W=window.RP_WS,L=W.L,need=W.need,bad=W.bad;
var tasks=[
  {id:'pseudocode-w1',modules:['m1', 'abap-m1', 'java-m1'],level:'schwer',type:'write',language:'pseudocode',rows:18,
    title:'Position des Maximums finden',
    text:'Schreibe einen Algorithmus, der den Index des größten Elements einer Liste werte mit n Elementen (nullbasiert) ausgibt – und -1 bei einer leeren Liste.',
    details:['Verwende die Schreibweise des Kurses: <- für Zuweisungen, SOLANGE … ENDE, WENN … DANN … ENDEWENN, AUSGABE.','Der Anfangswert für das bisher größte Element ist Position 0. Danach werden die übrigen Positionen durchlaufen.','Achte auf die Grenze: gültige Indizes sind 0 bis n - 1.'],
    starter:L('// Schreibe hier deinen Algorithmus','',''),
    rules:[
      need('Sonderfall n = 0 mit Ausgabe -1',/WENN\s+n\s*=\s*0\s+DANN[\s\S]*AUSGABE\s+-1[\s\S]*ENDEWENN/),
      need('maxIndex <- 0',/\bmaxIndex\s*<-\s*0\b/),
      need('Zähler i startet bei 1',/\bi\s*<-\s*1\b/),
      need('SOLANGE i < n',/SOLANGE\s+i\s*<\s*n\b/),
      need('vergleicht werte[i] > werte[maxIndex]',/WENN\s+werte\s*\[\s*i\s*\]\s*>\s*werte\s*\[\s*maxIndex\s*\]\s+DANN/),
      need('setzt maxIndex <- i',/\bmaxIndex\s*<-\s*i\b/),
      need('erhöht i <- i + 1 (sonst Endlosschleife)',/\bi\s*<-\s*i\s*\+\s*1\b/),
      need('AUSGABE maxIndex',/AUSGABE\s+maxIndex\b/),
      need('schließt Blöcke mit ENDEWENN und ENDE',/ENDEWENN[\s\S]*\bENDE\b/),
      bad(/SOLANGE\s+i\s*<=\s*n\b/,'Bei n Elementen ist i = n schon außerhalb der Liste (gültig: 0 bis n - 1).'),
      bad(/\bmaxIndex\s*<-\s*werte\b/,'maxIndex speichert eine Position, nicht den Wert. Der Wert ist werte[maxIndex].')
    ],
    solution:L('WENN n = 0 DANN','  AUSGABE -1','SONST','  maxIndex <- 0','  i <- 1','  SOLANGE i < n','    WENN werte[i] > werte[maxIndex] DANN','      maxIndex <- i','    ENDEWENN','    i <- i + 1','  ENDE','  AUSGABE maxIndex','ENDEWENN'),
    hint:'Merke dir die Position des bisher größten Werts. Vergleiche jedes weitere Element damit und aktualisiere die Position nur bei einem größeren Wert.',
    why:'Dieses Muster („bester Kandidat bisher“) steckt in Suche, Minimum, Auswahl. Wer Grenzen und Schleifenfortschritt prüft, vermeidet Off-by-one-Fehler und Endlosschleifen.'},
  {id:'pseudocode-w2',modules:['m3'],level:'schwer',type:'write',language:'pseudocode',rows:22,
    title:'Binäre Suche',
    text:'Schreibe die binäre Suche: In der aufsteigend sortierten Liste werte (n Elemente, nullbasiert) wird der Index von ziel gesucht. Ausgabe: Index oder -1.',
    details:['Verwende links und rechts als Grenzen, mitte als Mitte der aktuellen Spanne (DIV ist die ganzzahlige Division).','Ist werte[mitte] = ziel, merke dir mitte in gefunden und beende die Schleife über ihre Bedingung. Ist der Wert zu klein, suche rechts davon weiter, sonst links davon.','Beide Grenzen müssen sich bei jedem Schritt verändern, sonst bleibt die Suche hängen.'],
    starter:L('// Schreibe hier deinen Algorithmus','',''),
    rules:[
      need('links <- 0',/\blinks\s*<-\s*0\b/),
      need('rechts <- n - 1',/\brechts\s*<-\s*n\s*-\s*1\b/),
      need('gefunden <- -1 am Anfang',/\bgefunden\s*<-\s*-1\b/),
      need('SOLANGE links <= rechts',/SOLANGE\s+links\s*<=\s*rechts\b/),
      need('mitte <- (links + rechts) DIV 2',/\bmitte\s*<-\s*\(\s*links\s*\+\s*rechts\s*\)\s*DIV\s*2\b/),
      need('Treffer: werte[mitte] = ziel',/WENN\s+werte\s*\[\s*mitte\s*\]\s*=\s*ziel\s+DANN[\s\S]*\bgefunden\s*<-\s*mitte\b/),
      need('zu klein: links <- mitte + 1',/\blinks\s*<-\s*mitte\s*\+\s*1\b/),
      need('zu groß: rechts <- mitte - 1',/\brechts\s*<-\s*mitte\s*-\s*1\b/),
      need('Schleife endet nach Fund (… UND gefunden = -1)',/SOLANGE\s+links\s*<=\s*rechts\s+UND\s+gefunden\s*=\s*-1\b/),
      need('AUSGABE gefunden',/AUSGABE\s+gefunden\b/),
      bad(/\blinks\s*<-\s*mitte\s*$/m,'Ohne + 1 bleibt links bei mitte stehen: die Suche hängt in einer Endlosschleife.'),
      bad(/\brechts\s*<-\s*mitte\s*$/m,'Ohne - 1 bleibt rechts bei mitte stehen: die Suche hängt in einer Endlosschleife.'),
      bad(/SOLANGE\s+links\s*<\s*rechts\b/,'Mit < wird die Spanne aus genau einem Element nie geprüft. Nutze <=.')
    ],
    solution:L('links <- 0','rechts <- n - 1','gefunden <- -1','SOLANGE links <= rechts UND gefunden = -1','  mitte <- (links + rechts) DIV 2','  WENN werte[mitte] = ziel DANN','    gefunden <- mitte','  SONST','    WENN werte[mitte] < ziel DANN','      links <- mitte + 1','    SONST','      rechts <- mitte - 1','    ENDEWENN','  ENDEWENN','ENDE','AUSGABE gefunden'),
    hint:'Nach jedem Vergleich fällt mindestens die Mitte aus der Spanne. Deshalb +1 beziehungsweise -1.',
    why:'Die binäre Suche halbiert die Spanne in jedem Schritt (O(log n)), setzt aber eine sortierte Liste voraus. Die Grenzen +1/-1 sind die klassische Fehlerquelle.'}
];
W.add('pseudocode',tasks);
W.add('pseudocode',[
{id:'pseudocode-w3',modules:['m4'],level:'schwer',type:'write',language:'pseudocode',rows:16,
  title:'Fehler im Algorithmus finden und beheben',
  text:'Der Algorithmus soll die Summe aller geraden Zahlen in werte[0] bis werte[n - 1] ausgeben. Er enthält vier Fehler. Finde sie mit einem Trockenlauf und korrigiere den Code.',
  details:['Der Zähler startet an der falschen Stelle.','Die Schleifenbedingung liest ein Element zu viel.','Es werden die ungeraden statt der geraden Zahlen addiert.','Der Zähler wird nie erhöht, die Schleife endet nie.','Prüfe mit werte = [4, 7, 10], n = 3: Erwartet wird die Ausgabe 14.'],
  starter:L('summe <- 0','i <- 1','SOLANGE i <= n','  WENN werte[i] MOD 2 = 1 DANN','    summe <- summe + werte[i]','  ENDEWENN','ENDE','AUSGABE summe'),
  rules:[
    need('Zähler startet bei 0',/\bi\s*<-\s*0\b/,/\bi\s*<-\s*\d+/),
    need('Bedingung SOLANGE i < n',/SOLANGE\s+i\s*<\s*n\b/,/SOLANGE\b/),
    need('gerade Zahlen: MOD 2 = 0',/\bMOD\s+2\s*=\s*0\b/,/\bMOD\s+2/),
    need('Zähler erhöhen: i <- i + 1',/\bi\s*<-\s*i\s*\+\s*1\b/,/ENDEWENN/),
    need('summe <- summe + werte[i]',/\bsumme\s*<-\s*summe\s*\+\s*werte\s*\[\s*i\s*\]/),
    need('AUSGABE summe',/AUSGABE\s+summe\b/),
    bad(/\bi\s*<-\s*1\b/,'Das erste Element hat den Index 0. Mit i <- 1 wird werte[0] übersprungen.'),
    bad(/SOLANGE\s+i\s*<=\s*n\b/,'Bei n Elementen ist i = n schon außerhalb der Liste (gültig: 0 bis n - 1).'),
    bad(/\bMOD\s+2\s*=\s*1\b/,'MOD 2 = 1 trifft die UNGERADEN Zahlen. Gerade Zahlen haben Rest 0.')
  ],
  solution:L('summe <- 0','i <- 0','SOLANGE i < n','  WENN werte[i] MOD 2 = 0 DANN','    summe <- summe + werte[i]','  ENDEWENN','  i <- i + 1','ENDE','AUSGABE summe'),
  hint:'Trockenlauf mit werte = [4, 7, 10]: Notiere i, werte[i] und summe in jeder Runde. Wo stimmt die Tabelle nicht mit dem erwarteten Ergebnis 14 überein?',
  why:'Ein Trockenlauf mit einem kleinen Beispiel deckt Off-by-one-Fehler, falsche Bedingungen und Endlosschleifen auf, bevor der Code je läuft.'}
]);
})();
