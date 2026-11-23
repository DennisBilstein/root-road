/* Werkstattaufgaben der Spur mcp (Original Root Road). Wird erst geladen, wenn die Spur in der Werkstatt geöffnet wird. */
(function(){
var W=window.RP_WS,L=W.L,need=W.need,bad=W.bad;
var tasks=[
  {id:'mcp-w1',modules:['mcp-m1'],level:'schwer',type:'write',language:'json',rows:20,
    title:'MCP-Tool mit enger Capability definieren',
    text:'Schreibe die Definition des Tools read_task als JSON-Objekt, wie ein MCP-Server sie in tools/list meldet.',
    details:['name: read_task, eine kurze description.','inputSchema: ein Objekt mit genau einer Pflichteigenschaft id (ganze Zahl, mindestens 1). Weitere Eigenschaften sind nicht erlaubt.','annotations: Das Tool liest nur, ändert nichts (readOnlyHint true).'],
    starter:L('{','','}'),
    rules:[
      need('name ist read_task',/"name"\s*:\s*"read_task"/),
      need('description vorhanden',/"description"\s*:\s*"[^"]{8,}"/),
      need('inputSchema mit type object',/"inputSchema"\s*:\s*\{[\s\S]*"type"\s*:\s*"object"/),
      need('id ist eine ganze Zahl (integer) mit minimum 1',/"id"\s*:\s*\{[^}]*"type"\s*:\s*"integer"[^}]*"minimum"\s*:\s*1[^}]*\}|"id"\s*:\s*\{[^}]*"minimum"\s*:\s*1[^}]*"type"\s*:\s*"integer"[^}]*\}/),
      need('required enthält id',/"required"\s*:\s*\[\s*"id"\s*\]/),
      need('additionalProperties ist false',/"additionalProperties"\s*:\s*false/),
      need('readOnlyHint ist true',/"readOnlyHint"\s*:\s*true/),
      bad(/"type"\s*:\s*"(?:number|string)"/,'Eine ID ist eine ganze Zahl: "integer" statt "number" oder "string".'),
      bad(/"additionalProperties"\s*:\s*true/,'Weitere Eigenschaften nicht zulassen: additionalProperties muss false sein.'),
      bad(/"readOnlyHint"\s*:\s*false|"destructiveHint"\s*:\s*true/,'Ein reines Lese-Tool ist nicht schreibend oder destruktiv.')
    ],
    solution:L('{','  "name": "read_task",','  "description": "Liest eine einzelne Aufgabe anhand ihrer ID.",','  "inputSchema": {','    "type": "object",','    "properties": {','      "id": { "type": "integer", "minimum": 1 }','    },','    "required": ["id"],','    "additionalProperties": false','  },','  "annotations": { "readOnlyHint": true }','}'),
    hint:'Je enger das Schema, desto kleiner die Angriffsfläche: Typ, Untergrenze, Pflichtfeld und keine zusätzlichen Eigenschaften.',
    why:'Ein präzises Eingabeschema und ehrliche Annotationen begrenzen, was ein Modell mit dem Tool tun kann. Hinweise wie readOnlyHint sind aber nur Angaben des Servers, keine Sicherheitsgarantie.'},
  {id:'mcp-w2',modules:['agents-m1'],level:'schwer',type:'write',language:'json',rows:20,
    title:'Ehrlichen Prüfbericht schreiben',
    text:'Du hast zwei Tests ausgeführt (unit bestanden, lint fehlgeschlagen). Den Integrationstest konntest du nicht ausführen, weil Docker nicht lief. Schreibe den Bericht als JSON.',
    details:['Felder: summary (Text) und tests (Liste mit name, status und bei Bedarf reason).','Erlaubte Status: passed, failed, not_run. Ein nicht ausgeführter Test braucht eine Begründung in reason.','Der Bericht darf nicht behaupten, alles sei geprüft oder grün.'],
    starter:L('{','','}'),
    rules:[
      need('Feld summary',/"summary"\s*:\s*"[^"]{8,}"/),
      need('Liste tests',/"tests"\s*:\s*\[/),
      need('unit mit status passed',/"name"\s*:\s*"unit"[^}]*"status"\s*:\s*"passed"|"status"\s*:\s*"passed"[^}]*"name"\s*:\s*"unit"/),
      need('lint mit status failed',/"name"\s*:\s*"lint"[^}]*"status"\s*:\s*"failed"|"status"\s*:\s*"failed"[^}]*"name"\s*:\s*"lint"/),
      need('Integrationstest mit status not_run',/"name"\s*:\s*"integration"[^}]*"status"\s*:\s*"not_run"|"status"\s*:\s*"not_run"[^}]*"name"\s*:\s*"integration"/),
      need('reason erklärt den nicht ausgeführten Test',/"reason"\s*:\s*"[^"]*(?:Docker|docker)[^"]*"/),
      bad(/alle\s+tests?\s+(?:bestanden|grün|erfolgreich)|all\s+tests?\s+pass(?:ed)?|everything\s+(?:works|passed)|alles\s+(?:geprüft|grün|in\s+ordnung)/i,'Behaupte nichts, was nicht ausgeführt wurde. Nenne offene und fehlgeschlagene Tests ehrlich.'),
      bad(/"status"\s*:\s*"(?!passed"|failed"|not_run")[^"]*"/,'Erlaubte Status sind nur passed, failed und not_run.')
    ],
    solution:L('{','  "summary": "Unit-Test bestanden, Lint fehlgeschlagen, Integrationstest nicht ausgeführt.",','  "tests": [','    { "name": "unit", "status": "passed" },','    { "name": "lint", "status": "failed", "reason": "3 Verstöße gegen die Formatregeln" },','    { "name": "integration", "status": "not_run", "reason": "Docker lief nicht" }','  ]','}'),
    hint:'Ein Bericht ist nur so viel wert, wie er ehrlich ist. Was nicht lief, bekommt den Status not_run und einen Grund.',
    why:'Wer ungeprüfte Teile als erledigt meldet, nimmt anderen die Chance, die Lücke zu schließen. Offenlegen ist Teil des Ergebnisses.'}
];
W.add('mcp',tasks);
})();
