/* Werkstattaufgaben der Spur apis (Original Root Road). Wird erst geladen, wenn die Spur in der Werkstatt geöffnet wird. */
(function(){
var W=window.RP_WS,L=W.L,need=W.need,bad=W.bad;
var tasks=[
  {id:'apis-w1',modules:['api-m1'],level:'schwer',type:'write',language:'http',rows:18,
    title:'HTTP-Austausch: Ressource anlegen',
    text:'Schreibe einen vollständigen HTTP-Austausch: einen Request, der eine Aufgabe anlegt, und die passende Antwort des Servers.',
    details:['Request: POST auf /tasks mit JSON-Body {"title":"HTTP lesen","minutes":25}, Host api.example.test, Content-Type und Accept für JSON.','Antwort: Die Ressource wurde neu angelegt. Sie hat die ID 42, der Server nennt ihre Adresse im passenden Header, die Antwort ist JSON und enthält die angelegte Aufgabe mit id.','Trenne Kopfzeilen und Body mit einer Leerzeile.'],
    starter:L('POST /tasks HTTP/1.1','','','HTTP/1.1','',''),
    rules:[
      need('Request-Zeile POST /tasks HTTP/1.1',/^POST\s+\/tasks\s+HTTP\/1\.1\s*$/i),
      need('Host: api.example.test',/^Host:\s*api\.example\.test\s*$/im),
      need('Content-Type und Accept mit application/json',/^Content-Type:\s*application\/json\b[\s\S]*^Accept:\s*application\/json\b|^Accept:\s*application\/json\b[\s\S]*^Content-Type:\s*application\/json\b/im),
      need('JSON-Body mit title und minutes',/"title"\s*:\s*"HTTP lesen"[\s\S]*"minutes"\s*:\s*25|"minutes"\s*:\s*25[\s\S]*"title"\s*:\s*"HTTP lesen"/),
      need('Statuszeile 201 Created',/^HTTP\/1\.1\s+201\s+Created\s*$/im),
      need('Location-Header mit /tasks/42',/^Location:\s*\/tasks\/42\s*$/im),
      need('Antwort ist JSON mit "id": 42',/"id"\s*:\s*42\b/),
      need('Antwort trägt Content-Type: application/json',/^Content-Type:\s*application\/json\b[^\n]*$[\s\S]*^Content-Type:\s*application\/json\b/im),
      bad(/^HTTP\/1\.1\s+200\b/im,'Neu angelegt heißt 201 Created, nicht 200 OK.'),
      bad(/^(?:GET|PUT|DELETE)\s+\/tasks\b/im,'Zum Anlegen nutzt man POST auf die Sammlung.')
    ],
    solution:L('POST /tasks HTTP/1.1','Host: api.example.test','Content-Type: application/json','Accept: application/json','','{"title":"HTTP lesen","minutes":25}','','HTTP/1.1 201 Created','Content-Type: application/json','Location: /tasks/42','','{"id":42,"title":"HTTP lesen","minutes":25}'),
    hint:'Anlegen = POST auf die Sammlung /tasks. Der Server antwortet mit 201 und sagt im Location-Header, wo die neue Ressource liegt.',
    why:'Statuscode, Location-Header und Medientyp sind der Vertrag zwischen Client und Server. Ein Client kann sich nur darauf verlassen, was ausdrücklich vereinbart ist.'},
  {id:'apis-w2',modules:['api-m2'],level:'schwer',type:'write',language:'http',rows:18,
    title:'Fehlerantwort nach RFC 9457',
    text:'Der Client sendet eine Aufgabe mit minutes = 0. Schreibe die Fehlerantwort des Servers im Format „Problem Details“.',
    details:['Statuszeile für eine inhaltlich ungültige Anfrage (422), Content-Type application/problem+json.','Body mit den Feldern type (eine URI), title, status (als Zahl), detail und einer Liste errors mit dem Feld und der Ursache.','Keine internen Details wie Stacktraces oder SQL in der Antwort.'],
    starter:L('HTTP/1.1','','',''),
    rules:[
      need('Statuszeile 422',/^HTTP\/1\.1\s+422\b/im),
      need('Content-Type: application/problem+json',/^Content-Type:\s*application\/problem\+json\b/im),
      need('Feld "type"',/"type"\s*:\s*"[^"]+"/),
      need('Feld "title"',/"title"\s*:\s*"[^"]+"/),
      need('Feld "status" als Zahl 422',/"status"\s*:\s*422\b/),
      need('Feld "detail"',/"detail"\s*:\s*"[^"]+"/),
      need('Liste "errors" mit Feld und Ursache',/"errors"\s*:\s*\[[\s\S]*"field"\s*:\s*"minutes"[\s\S]*\]/),
      bad(/"status"\s*:\s*"/,'status ist eine Zahl, kein Text.'),
      bad(/stack\s*trace|stacktrace|\bat\s+\w+\.\w+\(|\bSQLSTATE\b|\bSELECT\b/i,'Gib keine Interna wie Stacktraces oder SQL nach außen.'),
      bad(/^HTTP\/1\.1\s+(?:200|500)\b/im,'Ein Eingabefehler ist weder 200 OK noch ein Serverfehler 500.')
    ],
    solution:L('HTTP/1.1 422 Unprocessable Content','Content-Type: application/problem+json','','{','  "type": "https://api.example.test/problems/validation-error",','  "title": "Ungültige Eingabe",','  "status": 422,','  "detail": "Die Aufgabe konnte nicht gespeichert werden.",','  "errors": [','    { "field": "minutes", "message": "muss mindestens 1 sein" }','  ]','}'),
    hint:'422 passt, wenn die Anfrage lesbar ist, aber inhaltlich nicht stimmt. status im Body wiederholt den Statuscode als Zahl.',
    why:'Ein einheitliches Fehlerformat lässt Clients Fehler maschinell auswerten. Interna gehören nicht in die Antwort (OWASP).'}
];
W.add('apis',tasks);
})();
