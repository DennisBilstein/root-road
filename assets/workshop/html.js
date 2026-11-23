/* Werkstattaufgaben der Spur html (Original Root Road). Wird erst geladen, wenn die Spur in der Werkstatt geöffnet wird. */
(function(){
var W=window.RP_WS,L=W.L,need=W.need,bad=W.bad;
var tasks=[
  {id:'html-w1',modules:['html-m2'],level:'schwer',type:'write',language:'html',rows:18,
    title:'Zugängliches Anmeldeformular',
    text:'Schreibe ein Anmeldeformular mit E-Mail und Passwort, das mit Tastatur, Screenreader und Passwortmanager funktioniert.',
    details:['Ein <form> mit method="post" und action="/anmelden".','Für beide Felder ein sichtbares <label for=…>, passendes type, name, id und autocomplete (email, current-password) sowie required.','Das E-Mail-Feld verweist mit aria-describedby auf einen Hinweisabsatz mit passender id.','Ein <button type="submit"> mit klarer Beschriftung, kein div mit Klick-Handler.'],
    starter:L('<!-- Schreibe hier das Formular -->','',''),
    rules:[
      need('<form> mit method="post" und action="/anmelden"',/<form\b(?=[^>]*\bmethod=["']post["'])(?=[^>]*\baction=["']\/anmelden["'])[^>]*>/i),
      need('Label für das E-Mail-Feld (for=…)',/<label\b[^>]*\bfor=["']email["'][^>]*>/i),
      need('E-Mail-Feld: type="email", id, name, autocomplete="email", required',/<input\b(?=[^>]*\btype=["']email["'])(?=[^>]*\bid=["']email["'])(?=[^>]*\bname=["']email["'])(?=[^>]*\bautocomplete=["']email["'])(?=[^>]*\brequired\b)[^>]*>/i),
      need('Label für das Passwort-Feld',/<label\b[^>]*\bfor=["']password["'][^>]*>/i),
      need('Passwort-Feld: type="password", id, name, autocomplete="current-password", required',/<input\b(?=[^>]*\btype=["']password["'])(?=[^>]*\bid=["']password["'])(?=[^>]*\bname=["']password["'])(?=[^>]*\bautocomplete=["']current-password["'])(?=[^>]*\brequired\b)[^>]*>/i),
      need('aria-describedby verweist auf einen vorhandenen Hinweis',/\baria-describedby=["'](\w[\w-]*)["'][\s\S]*\bid=["']\1["']|\bid=["'](\w[\w-]*)["'][\s\S]*\baria-describedby=["']\2["']/i),
      need('<button type="submit"> mit Text',/<button\b[^>]*\btype=["']submit["'][^>]*>\s*[^<\s][^<]*<\/button>/i),
      bad(/<div\b[^>]*\bonclick\b|<span\b[^>]*\bonclick\b/i,'Nutze <button> für Aktionen, kein Element mit onclick: Es ist nicht per Tastatur erreichbar.'),
      bad(/<input\b[^>]*\btype=["']password["'][^>]*\bautocomplete=["']off["']/i,'Blockiere keine Passwortmanager: autocomplete="current-password" statt off.'),
      bad(/<(?:font|center|marquee|blink)\b/i,'Veraltetes Element – nutze HTML für Bedeutung, CSS für Aussehen.'),
      bad(/\bstyle=/i,'Keine Inline-Styles; Gestaltung gehört ins Stylesheet.')
    ],
    solution:L('<form method="post" action="/anmelden">','  <p>','    <label for="email">E-Mail-Adresse</label>','    <input type="email" id="email" name="email" autocomplete="email" aria-describedby="email-hint" required>','  </p>','  <p id="email-hint">Wir nutzen deine Adresse nur für die Anmeldung.</p>','  <p>','    <label for="password">Passwort</label>','    <input type="password" id="password" name="password" autocomplete="current-password" required>','  </p>','  <button type="submit">Anmelden</button>','</form>'),
    hint:'Jedes Feld braucht ein Label, dessen for-Wert zur id des Feldes passt. aria-describedby verweist per id auf den Hinweistext.',
    why:'Native Formularelemente liefern Tastaturbedienung, Fehlermeldungen und Autofill gratis. Ohne Label, passende autocomplete-Werte und echten Button geht das verloren (WCAG 2.2).'},
  {id:'html-w2',modules:['html-m1'],level:'schwer',type:'write',language:'html',rows:22,
    title:'Seitengerüst mit Landmarken',
    text:'Schreibe das vollständige Gerüst einer Seite „Lernplan“, das Screenreader über Landmarken navigieren können.',
    details:['<!doctype html>, <html lang="de">, im <head>: Zeichensatz, Viewport und ein <title>.','Im <body>: <header> mit einer Navigation (<nav aria-label="Hauptnavigation"> mit einer Liste von Links), genau ein <main> mit einer <h1> und mindestens einem <section> mit eigener <h2>, und ein <footer>.'],
    starter:L('<!-- Schreibe hier das ganze Dokument -->','',''),
    rules:[
      need('<!doctype html>',/<!doctype\s+html>/i),
      need('<html lang="de">',/<html\b[^>]*\blang=["']de["']/i),
      need('<meta charset="utf-8">',/<meta\b[^>]*\bcharset=["']?utf-8["']?/i),
      need('Viewport-Meta-Tag',/<meta\b[^>]*\bname=["']viewport["'][^>]*\bcontent=["'][^"']*width=device-width/i),
      need('<title> mit Text',/<title>\s*[^<\s][^<]*<\/title>/i),
      need('<header> mit <nav aria-label=…> und Linkliste',/<header\b[\s\S]*<nav\b[^>]*\baria-label=["'][^"']+["'][^>]*>[\s\S]*<ul\b[\s\S]*<a\b[^>]*\bhref=[\s\S]*<\/header>/i),
      need('<main> mit <h1>',/<main\b[\s\S]*<h1\b[\s\S]*<\/main>/i),
      need('<section> mit eigener <h2>',/<section\b[^>]*>\s*<h2\b/i),
      need('<footer>',/<footer\b/i),
      bad(/<div\b[^>]*\b(?:class|id)=["'][^"']*\b(?:header|footer|nav|navigation|main)\b/i,'Nutze die nativen Landmark-Elemente <header>, <nav>, <main>, <footer> statt div mit Klassennamen.'),
      bad(/<h1\b(?=[\s\S]*<h1\b)/i,'Eine Seite hat genau eine <h1>.'),
      bad(/<main\b(?=[\s\S]*<main\b)/i,'Es gibt genau ein <main> pro Seite.')
    ],
    solution:L('<!doctype html>','<html lang="de">','<head>','  <meta charset="utf-8">','  <meta name="viewport" content="width=device-width, initial-scale=1">','  <title>Lernplan</title>','</head>','<body>','  <header>','    <nav aria-label="Hauptnavigation">','      <ul>','        <li><a href="/">Start</a></li>','        <li><a href="/plan">Lernplan</a></li>','      </ul>','    </nav>','  </header>','  <main>','    <h1>Lernplan</h1>','    <section>','      <h2>Diese Woche</h2>','      <p>Drei Lektionen und eine Wiederholung.</p>','    </section>','  </main>','  <footer>','    <p>Root Road</p>','  </footer>','</body>','</html>'),
    hint:'Jedes Landmark-Element hat genau eine Aufgabe: header (Kopf), nav (Navigation), main (Hauptinhalt, einmal), footer (Fuß).',
    why:'Landmarken erlauben Screenreader-Nutzern, direkt zum Hauptinhalt zu springen. Ohne lang rät der Screenreader die Aussprache, ohne Viewport wird die Seite auf dem Handy winzig.'}
];
W.add('html',tasks);
})();
