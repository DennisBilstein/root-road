/* Große Datensätze werden erst beim Öffnen der jeweiligen Ansicht geladen (je Datei einmal, auch bei mehreren Aufrufen). */
/* Solange die Skripte laden, bleibt die Oberfläche unsichtbar. Ihre Start-Aufrufe von render() werden deshalb übersprungen
   (if(!window.RP_BOOTING)); bootstrap rendert danach einmal. Das spart mehrere vollständige Renderläufe beim Start. */
window.RP_BOOTING=true;
(function(){
  var geladen={};
  window.rpLoadScriptOnce=function(src){
    if(!geladen[src])geladen[src]=new Promise(function(resolve,reject){
      var element=document.createElement('script');element.src=src;element.onload=resolve;
      element.onerror=function(){delete geladen[src];element.remove();reject(new Error('Datei konnte nicht geladen werden: '+src));};
      document.body.appendChild(element);
    });
    return geladen[src];
  };
  /* Abruf-/Bewertungskriterien (ca. 2,4 MB) gibt es erst, wenn ein Quiz oder die Wiederholung sie braucht (quiz-learning-contracts.js). */
  window.rpLoadQuizContracts=function(){return window.RP_QUIZ_CONTRACTS_READY?Promise.resolve():window.rpLoadScriptOnce('assets/quiz-contracts-data.js');};
})();
/* Lektionstexte (body, body2, code, tip …) liegen je Modul in assets/lesson-bodies/<Modul>.json und werden beim Öffnen einer Lektion
   (rpLoadBodies) oder für die Volltextsuche (rpHydrateAll) in die vorhandenen Lektionsobjekte übernommen. Lektionen ohne geladene Texte tragen lazy:true. */
(function(){
  var laufend={};
  window.rpLoadBodies=function(moduleIds){
    return Promise.all(moduleIds.map(function(id){
      var datei=window.RP_BODY_FILES&&window.RP_BODY_FILES[id];
      if(!datei)return null;
      if(!laufend[id])laufend[id]=fetch(datei).then(function(response){
        if(!response.ok)throw new Error('Lektionstexte nicht verfügbar: '+id);return response.json();
      }).then(function(texte){
        var modul=MODULES.find(function(m){return m.id===id;});
        if(modul)modul.lessons.forEach(function(lektion){if(texte[lektion.id])Object.assign(lektion,texte[lektion.id]);delete lektion.lazy;});
      }).catch(function(error){delete laufend[id];throw error;});
      return laufend[id];
    }));
  };
  window.rpHydrateAll=async function(){
    var ids=Object.keys(window.RP_BODY_FILES||{});
    for(var i=0;i<ids.length;i+=8)await window.rpLoadBodies(ids.slice(i,i+8));
    await window.rpLoadQuizzes();
    await window.rpLoadExercises();
  };
})();
/* Quizfragen (Frage, Optionen, Lösung, Erklärung) liegen in assets/quiz-data.json. Der Start kennt je Lektion nur Platzhalter ({revision} je Frage,
   lazyQuiz:true) und Karten ohne Fragetext; rpLoadQuizzes setzt beides ein (dieselben Objekte, damit Verweise gültig bleiben) und setzt RP_QUIZ_READY. */
(function(){
  var laufend=null;
  window.rpLoadQuizzes=function(){
    if(window.RP_QUIZ_READY)return Promise.resolve();
    if(!window.RP_QUIZ_FILE)return Promise.reject(new Error('Quizdaten nicht verfügbar.'));
    if(!laufend)laufend=fetch(window.RP_QUIZ_FILE).then(function(response){
      if(!response.ok)throw new Error('Quizdaten nicht verfügbar.');return response.json();
    }).then(function(daten){
      var karten={};rpCatalog.cards.forEach(function(karte){karten[karte.id]=karte;});
      function fuelle(karte,frage){if(karte){karte.q=frage.q;karte.options=frage.options;karte.correct=frage.correct;karte.explain=frage.explain;}}
      rpCatalog.modules.forEach(function(modul){modul.lessons.forEach(function(lektion){
        if(!lektion.lazyQuiz)return;
        lektion.quiz=daten.lessons[lektion.id]||[];delete lektion.lazyQuiz;
        lektion.quiz.forEach(function(frage,i){fuelle(karten[rpQuestionId(lektion,i)],frage);});
      });});
      daten.extras.forEach(function(extra){fuelle(karten[extra.id],extra);});
      window.RP_QUIZ_READY=true;
    }).catch(function(error){laufend=null;throw error;});
    return laufend;
  };
})();
/* Übungsaufgaben: Der Start kennt je Aufgabe nur ID, Stufe, Thema und Titel (lazy:true). assets/exercise-data.json liefert Aufgabentext, Tipps und Lösung;
   rpLoadExercises setzt sie in dieselben Objekte ein (Verweise in rpCatalog bleiben gültig) und setzt RP_EXERCISES_READY. */
(function(){
  var laufend=null;
  window.rpLoadExercises=function(){
    if(window.RP_EXERCISES_READY)return Promise.resolve();
    if(!window.RP_EXERCISE_FILE)return Promise.reject(new Error('Aufgabendaten nicht verfügbar.'));
    if(!laufend)laufend=fetch(window.RP_EXERCISE_FILE).then(function(response){
      if(!response.ok)throw new Error('Aufgabendaten nicht verfügbar.');return response.json();
    }).then(function(daten){
      rpCatalog.exercises.forEach(function(aufgabe){Object.assign(aufgabe,daten[aufgabe.id]);delete aufgabe.lazy;});
      window.RP_EXERCISES_READY=true;
    }).catch(function(error){laufend=null;throw error;});
    return laufend;
  };
})();
/* Konto (/api/me) und Lerndaten werden gleichzeitig geladen; erst wenn beides vorliegt, laufen die Skripte in Listenreihenfolge. */
(async function(){
  var meFertig=(async function(){
    /* Determine account storage BEFORE any existing app code reads or writes progress. */
    try {
      var response = await fetch('/api/me',{credentials:'same-origin',cache:'no-store'});
      if(response.ok){ var result = await response.json(); window.RP_BOOT_USER = result.user; }
    } catch(e) {}
  })();
  var scripts = Array.from(document.querySelectorAll('script[data-rp-src]'));
  /* Alle Skripte werden gleichzeitig geladen, aber in der Reihenfolge der Liste ausgeführt (async=false bei
     dynamisch eingefügten Skripten). Das Nacheinander-Laden kostete pro Datei einen vollen Netzwerk-Rundlauf. */
  function load(src){return new Promise(function(resolve,reject){var element=document.createElement('script');element.async=false;element.src=src;element.onload=resolve;element.onerror=function(){reject(new Error('Datei konnte nicht geladen werden: '+src));};document.body.appendChild(element);});}
  /* Manifest holen und die JSON-Datensätze abrufen (Skripte, Manifest und Datensätze lädt der Browser schon über die Preload-Links, die der Server in index.html einsetzt). Gibt die Skriptpfade in Ausführungsreihenfolge zurück. */
  async function ladeLerndaten(){
    var manifestResponse=await fetch('assets/learning-manifest.json');if(!manifestResponse.ok)throw Error('Lernmanifest nicht verfügbar. Bitte npm run build ausführen.');
    var manifest=await manifestResponse.json();
    function mitVersion(file){return manifest.versions&&/^[0-9a-f]{10}$/.test(manifest.versions[file]||'')?file+'?v='+manifest.versions[file]:file;}
    var paths=[];
    for(var file of manifest.files){if(!/^assets\/learning\/[a-z0-9-]+\.js$/.test(file))throw Error('Ungültiger Lernskriptpfad.');paths.push(mitVersion(file));}
    /* Die Skripte dürfen erst nach den Datensätzen laufen; heruntergeladen sind sie über die Preload-Links bereits. */
    window.RP_LITERALS={};
    window.RP_BODY_STATS=manifest.stats||{};
    if(manifest.quiz){if(manifest.quiz!=='assets/quiz-data.json')throw Error('Ungültiger Quizpfad.');window.RP_QUIZ_FILE=mitVersion(manifest.quiz);}
    if(manifest.exercises){if(manifest.exercises!=='assets/exercise-data.json')throw Error('Ungültiger Aufgabenpfad.');window.RP_EXERCISE_FILE=mitVersion(manifest.exercises);}
    window.RP_BODY_FILES=Object.fromEntries(Object.entries(manifest.bodies||{}).map(function(entry){if(!/^assets\/lesson-bodies\/[a-z0-9-]+\.json$/.test(entry[1]))throw Error('Ungültiger Textpfad.');return [entry[0],mitVersion(entry[1])];}));
    await Promise.all((manifest.data||[]).map(function(file){var m=/^assets\/learning-data\/literal-(\d+)\.json$/.exec(file);if(!m)throw Error('Ungültiger Datenpfad.');
      return fetch(mitVersion(file)).then(function(r){if(!r.ok)throw Error('Lerndaten nicht verfügbar. Bitte npm run build ausführen.');return r.json();}).then(function(data){window.RP_LITERALS[m[1]]=data;});}));
    return paths;
  }
  try {
    var lernpfade=scripts.some(function(source){return source.dataset.rpSrc.split('?')[0]==='assets/script-01.js';})?ladeLerndaten():Promise.resolve([]);
    var ergebnis=await Promise.all([meFertig,lernpfade]);
    var sources=[];
    for(var source of scripts){
      if(source.dataset.rpSrc.split('?')[0]==='assets/script-01.js')sources.push.apply(sources,ergebnis[1]);
      else sources.push(source.dataset.rpSrc);
    }
    await Promise.all(sources.map(load));
    /* accounts.js gleicht nach dem Laden noch Konto und Fortschritt ab und rendert danach neu. „Bereit“ gilt erst danach. */
    if(window.RP_ACCOUNT_READY)await window.RP_ACCOUNT_READY;
    window.RP_BOOTING=false;render();
  }catch(error){window.RP_APP_ERROR=error.message;var banner=document.createElement('section');banner.setAttribute('role','alert');banner.style.cssText='padding:24px;background:#fff;color:#172438;border:2px solid #b3261e';var title=document.createElement('h1');title.textContent='Root Road konnte nicht vollständig starten';var text=document.createElement('p');text.textContent=error.message+' Bitte die Seite neu laden und prüfen, ob der lokale Server läuft.';var button=document.createElement('button');button.textContent='Neu laden';button.onclick=function(){location.reload();};banner.append(title,text,button);document.body.prepend(banner);window.RP_BOOTING=false;document.documentElement.classList.add('rp-bereit');return;}
  window.RP_APP_READY = true;
  document.documentElement.classList.add('rp-bereit');
})();
