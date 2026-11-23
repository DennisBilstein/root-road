/* Gemeinsame Hilfen der Werkstattaufgaben (Original Root Road, nichts aus fremden Kursen kopiert).
   Aufgabentypen: run = JavaScript wird isoliert ausgeführt und gegen Tests geprüft; write = Code wird mit Regeln auf Struktur geprüft (keine Ausführung).
   Regeln: need() = Anforderung (label steht in der Checkliste, fehlt sie, wird optional die Ankerzeile markiert), bad() = typischer Fehler, wird an der Fundstelle rot
   markiert (unless hebt die Regel auf). modules nennt die Module, die die Aufgabe abdeckt; die Lektion ist standardmäßig die erste des ersten Moduls. */
window.RP_WORKSHOP=window.RP_WORKSHOP||{};
window.RP_WS={
  L:function(){return Array.prototype.join.call(arguments,'\n');},
  need:function(label,pattern,anchor,min){return {kind:'required',label:label,pattern:pattern,anchor:anchor,min:min,message:'Es fehlt: '+label+'.'};},
  bad:function(pattern,message,unless){return {kind:'forbidden',pattern:pattern,message:message,unless:unless};},
  add:function(track,tasks){
    tasks.forEach(function(task){task.lesson=task.lesson||(task.modules&&task.modules[0]?task.modules[0]+'-l1':undefined);});
    window.RP_WORKSHOP[track]=(window.RP_WORKSHOP[track]||[]).concat(tasks);
  }
};
