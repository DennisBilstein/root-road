/* Meldet unbehandelte Skriptfehler anonym an den eigenen Server (/api/client-errors). Es werden nur Fehlertext, Skriptdatei und
   Zeile gesendet, keine Konto-, Seiten- oder Browserdaten. Je Seitenaufruf höchstens 5 verschiedene Meldungen; Fehler beim Melden
   bleiben still, damit daraus keine Folgefehler entstehen. */
(function(){
  var gesendet=0,bekannt={};
  function melden(text,quelle,zeile){
    try{
      text=String(text||'').slice(0,300);
      if(!text||bekannt[text]||gesendet>=5)return;
      bekannt[text]=true;gesendet+=1;
      var koerper={message:text,source:String(quelle||'').slice(0,300)};
      if(Number.isInteger(zeile)&&zeile>0)koerper.line=zeile;
      fetch('/api/client-errors',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(koerper),keepalive:true,credentials:'omit'}).catch(function(){});
    }catch(e){}
  }
  window.addEventListener('error',function(ereignis){
    /* Ressourcenfehler (Bilder, Skripte) erscheinen hier nicht; nur echte Skriptfehler mit Text. */
    if(ereignis.message)melden(ereignis.message,ereignis.filename,ereignis.lineno);
  });
  window.addEventListener('unhandledrejection',function(ereignis){
    var grund=ereignis.reason;
    melden((grund&&grund.message)||String(grund),'',0);
  });
})();
