(function(){
  var rows=document.getElementById('errorRows'),status=document.getElementById('errorsStatus');
  function zelle(text){var td=document.createElement('td');td.textContent=text;return td;}
  async function laden(){
    try{
      var antwort=await fetch('/api/admin/errors');
      if(!antwort.ok)return;
      var daten=await antwort.json();
      rows.replaceChildren();
      daten.errors.forEach(function(eintrag){
        var zeile=document.createElement('tr');
        zeile.append(zelle(eintrag.kind==='server'?'Server':'Browser'),zelle(eintrag.message),zelle(eintrag.source),zelle(String(eintrag.count)),zelle(new Date(eintrag.lastSeen).toLocaleString('de-DE')));
        rows.append(zeile);
      });
      status.textContent=daten.errors.length?daten.errors.length+' verschiedene Fehler in den letzten '+daten.retentionDays+' Tagen.':'Keine Fehler protokolliert.';
    }catch(e){}
  }
  document.getElementById('clearErrors').onclick=async function(){
    try{
      var antwort=await fetch('/api/admin/errors',{method:'DELETE',headers:{'Content-Type':'application/json'},body:'{}'});
      if(!antwort.ok)throw new Error();
      await laden();status.textContent='Protokoll geleert.';
    }catch(e){status.textContent='Protokoll konnte nicht geleert werden.';}
  };
  laden();setInterval(laden,30000);
})();
