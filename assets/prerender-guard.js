/* Läuft vor dem ersten Zeichnen. Die im HTML vorgerenderte Startseite zeigt den Zustand eines neuen Besuchers (kein Lernstand, Pfad „Alle“).
   Passt sie nicht (anderer Einstieg per Adresse, gewählter Lernpfad, vorhandener Lernstand), blendet die Klasse rp-ohne-vorschau sie bis
   zum App-Start aus – wie bisher bleibt dann der ganze Inhalt unsichtbar, statt kurz falsche Zahlen zu zeigen. Das Lesen des eigenen
   Lernstands gehört zum angeforderten Dienst und schreibt nichts. */
(function(){
  var abweichend=false;
  try{
    var hash=location.hash;
    if(hash&&hash!=='#'&&hash!=='#/')abweichend=true;
    var pfad=localStorage.getItem('rootpfad-learning-path');
    if(pfad&&pfad!=='all')abweichend=true;
    for(var i=0;!abweichend&&i<localStorage.length;i++){
      var key=localStorage.key(i);
      if(key!=='ap1-expertenpfad-progress-v1'&&!/^rootpfad-user-.+-progress$/.test(key))continue;
      var stand=JSON.parse(localStorage.getItem(key));
      if(stand&&((stand.completed&&stand.completed.length)||stand.xp))abweichend=true;
    }
  }catch(error){
    /* Gesperrter Speicher: die App startet ebenfalls ohne Lernstand, die Vorschau passt. Unlesbarer Lernstand: lieber ausblenden. */
    abweichend=error instanceof SyntaxError;
  }
  if(abweichend)document.documentElement.classList.add('rp-ohne-vorschau');
})();
