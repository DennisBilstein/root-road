var rpPractice={track:null,index:0,mode:'guided',feedback:'',drafts:{},answers:{},hints:{},solutions:{},busy:false,loading:false,result:{},gapBad:{},won:{},lastXp:0};
var rpPracticeWorkerSource=null;
var rpPracticeStop=null;

/* ---------- Aufgabenverwaltung ---------- */
function rpPracticeAllowed(track){return rpMatches(track.path);}
/* Geführte Spuren (guided-practice-data.js) plus Spuren, die nur aus Werkstattaufgaben bestehen (RP_WORKSHOP_TRACKS). */
function rpPracticeTracks(){return RP_PRACTICE_TRACKS.concat(window.RP_WORKSHOP_TRACKS||[]);}
function rpPracticeTrack(){return rpPracticeTracks().find(function(t){return t.id===rpPractice.track;});}
/* Werkstattaufgaben liegen je Spur in assets/workshop/<spur>.js (plus gemeinsame Hilfen in core.js) und laden erst bei Bedarf. */
function rpPracticeLoadWorkshop(id){return rpLoadScriptOnce('assets/workshop/core.js').then(function(){return rpLoadScriptOnce('assets/workshop/'+id+'.js');});}
function rpPracticeTasks(track){
  if(!track)return [];
  return rpPractice.mode==='werkstatt'?((window.RP_WORKSHOP&&window.RP_WORKSHOP[track.id])||[]):track.tasks;
}
function rpPracticeTask(){return rpPracticeTasks(rpPracticeTrack())[rpPractice.index];}
function rpPracticeKey(){
  var task=rpPracticeTask();
  return rpPractice.mode==='werkstatt'&&task?'workshop:'+rpPractice.track+':'+task.id:'guided:'+rpPractice.track+':'+rpPractice.index;
}
function rpPracticeStart(id){
  var track=rpPracticeTracks().find(function(t){return t.id===id;});if(!track||!rpPracticeAllowed(track))return;
  rpPracticeStop?.();rpPractice.track=id;rpPractice.index=0;rpPractice.feedback='';state.currentId='guided';
  /* Wer in der Werkstatt ist, bleibt beim Spurwechsel dort; Spuren ohne geführte Aufgaben öffnen immer die Werkstatt. */
  if(rpPractice.mode==='werkstatt'||!track.tasks.length){rpPracticeSetMode('werkstatt',true);return;}
  rpPractice.mode='guided';renderContent();
}
async function rpPracticeSetMode(mode,force){
  if((mode===rpPractice.mode&&!force)||rpPractice.loading)return;
  rpPracticeStoreDraft();rpPracticeStop?.();
  var track=rpPracticeTrack();
  if(mode==='werkstatt'&&track&&!(window.RP_WORKSHOP&&window.RP_WORKSHOP[track.id])){
    rpPractice.loading=true;rpPractice.feedback='Werkstattaufgaben werden geladen …';renderContent();
    try{await rpPracticeLoadWorkshop(track.id);}
    catch(error){rpPractice.loading=false;rpPractice.feedback='Die Werkstattaufgaben konnten nicht geladen werden. Prüfe die Verbindung und versuche es erneut.';if(state.currentId==='guided')renderContent();return;}
    rpPractice.loading=false;
  }
  rpPractice.mode=mode;rpPractice.index=0;rpPractice.feedback='';
  if(state.currentId==='guided')renderContent();
}
function rpPracticeGo(index){
  rpPracticeStoreDraft();rpPracticeStop?.();
  var tasks=rpPracticeTasks(rpPracticeTrack());
  rpPractice.index=Math.max(0,Math.min(tasks.length-1,index));rpPractice.feedback='';renderContent();
}
function rpPracticeStoreDraft(){
  var key=rpPracticeKey(),editor=document.getElementById('rpCodeEditor');
  if(editor){rpPractice.drafts[key]=editor.value;rpEditorSync();}
  var inputs=document.querySelectorAll('[data-rp-gap]');if(inputs.length){rpPractice.answers[key]=Array.from(inputs).map(function(x){return x.value;});delete rpPractice.gapBad[key];inputs.forEach(function(x){x.removeAttribute('aria-invalid');x.classList.remove('gp-bad');});}
  /* Jede Änderung nach dem Erfolg nimmt das Erfolgsfeld wieder weg: Es gilt nur für genau diesen Stand. */
  var won=rpPractice.won[key];
  if(won&&won.snapshot!==rpPracticeSnapshot(rpPracticeTask(),key)){delete rpPractice.won[key];var panel=document.getElementById('gpWin');if(panel)panel.remove();var solved=document.querySelector('.gp-solved');if(solved)solved.classList.remove('gp-solved');}
}
function rpPracticeMove(delta){
  rpPracticeStoreDraft();rpPracticeStop?.();
  var tasks=rpPracticeTasks(rpPracticeTrack());
  rpPractice.index=Math.max(0,Math.min(tasks.length-1,rpPractice.index+delta));rpPractice.feedback='';renderContent();
}
function rpPracticeHint(solution){
  rpPracticeStoreDraft();var key=rpPracticeKey();rpPractice.hints[key]=true;
  if(solution)rpPractice.solutions[key]=true;
  rpPractice.feedback=solution?'Lösung angesehen. Das zählt nicht als selbstständiger Nachweis.':'Hinweis genutzt – übe danach eine andere Aufgabe ohne Hilfe.';
  renderContent();
}
function rpPracticeComplete(){
  var key=rpPracticeKey(),task=rpPracticeTask();
  // Uses existing synced progress fields, not another untracked local database.
  if(!state.solved[key])state.solved[key]=Date.now();
  var xpKey='practice:'+key;
  rpPractice.lastXp=0;
  if(!rpPractice.solutions[key]&&!state.xpLog[xpKey]){state.xpLog[xpKey]=1;rpPractice.lastXp=awardXp(task&&task.level==='schwer'?25:10,rpPractice.mode==='werkstatt'?'Werkstattaufgabe':'Geführte Codeübung');}
  saveProgress();
}

/* ---------- Erfolgsrückmeldung ----------
   Nach einem selbstständig gelösten Auftrag erscheint ein Erfolgsfeld mit Zusammenfassung; der Ausbruch läuft einmal (celebrate.js).
   Wer die Lösung angesehen hat, bekommt keinen Erfolgsmoment. Jede Änderung am Code nimmt das Erfolgsfeld wieder weg. */
function rpPracticeSnapshot(task,key){
  return task&&(task.type==='run'||task.type==='write')?(rpPractice.drafts[key]??task.starter):JSON.stringify(rpPractice.answers[key]||[]);
}
function rpPracticeWin(summary){
  var key=rpPracticeKey(),task=rpPracticeTask();
  if(rpPractice.solutions[key]){delete rpPractice.won[key];return;}
  rpPractice.won[key]={summary:summary,xp:rpPractice.lastXp,fresh:true,snapshot:rpPracticeSnapshot(task,key)};
}
function rpWinHtml(key,isLast){
  var won=rpPractice.won[key];
  if(!won)return '';
  return '<div class="gp-win'+(won.fresh?' is-new':'')+'" id="gpWin"><svg class="gp-win-ring" viewBox="0 0 52 52" aria-hidden="true" focusable="false"><circle cx="26" cy="26" r="23"/><path d="M15 27l8 8 14-16"/></svg>'+
    '<div class="gp-win-text"><p class="gp-win-title">Aufgabe gelöst</p><p class="gp-win-sub">'+esc(won.summary)+'</p></div>'+
    (won.xp?'<span class="gp-win-xp">+'+won.xp+' XP</span>':'')+
    (isLast?'':'<button class="check-btn gp-win-next" type="button" data-onclick="rpPracticeMove(1)">Nächste Aufgabe</button>')+'</div>';
}
/* Nach dem Rendern aufrufen: startet den Ausbruch genau einmal pro Erfolg. */
function rpPracticeCelebrate(){
  var won=rpPractice.won[rpPracticeKey()];
  if(!won||!won.fresh)return;
  won.fresh=false;
  var panel=document.getElementById('gpWin');
  if(panel&&panel.scrollIntoView)panel.scrollIntoView({block:'nearest'});
  if(window.rpCelebrateAfterRender)window.rpCelebrateAfterRender('#gpWin .gp-win-ring','confetti');
}

/* ---------- Prüfung: Struktur (Klammern, Anführungszeichen, Tags) und Regeln ---------- */
var RP_SCAN={
  javascript:{line:['//'],block:[['/*','*/']],quotes:['"',"'",'`'],esc:'\\',regex:true},
  java:{line:['//'],block:[['/*','*/']],quotes:['"',"'"],esc:'\\'},
  php:{line:['//','#'],block:[['/*','*/']],quotes:['"',"'"],esc:'\\'},
  sql:{line:['--','#'],block:[['/*','*/']],quotes:['"',"'",'`'],dbl:true},
  css:{block:[['/*','*/']],quotes:['"',"'"],esc:'\\'},
  abap:{line:['"'],lineStart:['*'],quotes:["'",'`','|'],dbl:true},
  shell:{line:['#'],lineWord:true,shebang:true,quotes:['"',"'"],esc:'\\'},
  pseudocode:{line:['//'],quotes:['"',"'"]},
  json:{quotes:['"'],esc:'\\'},
  http:{quotes:['"'],esc:'\\'},
  yaml:{line:['#'],lineWord:true,quotes:['"',"'"]},
  dockerfile:{line:['#'],quotes:['"',"'"],esc:'\\'},
  python:{line:['#'],block:[['"""','"""'],["'''","'''"]],quotes:['"',"'"],esc:'\\'},
  html:{tags:true},
  xml:{tags:true},
  vue:{vue:true}
};
RP_SCAN.typescript=RP_SCAN.javascript;
var RP_VOID_TAGS=['area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr'];
function rpLineOf(code,offset){return code.slice(0,offset).split('\n').length;}
function rpRegexAllowed(code,i){
  var j=i-1;while(j>=0&&(code[j]===' '||code[j]==='\t'))j--;
  if(j<0||code[j]==='\n')return true;
  if('(,=:[!&|?{};+-*%<>~^'.indexOf(code[j])>=0)return true;
  return /(?:^|[^\w$])(?:return|typeof|case|in|of)$/.test(code.slice(Math.max(0,j-8),j+1));
}
/* Liefert zu maskierende Bereiche (Kommentare) und Fehler; Zeichen bleiben an ihren Positionen. */
function rpScanCode(cfg,code,from,to){
  var n=to,i=from,diags=[],ranges=[],stack=[],pairs={'(':')','[':']','{':'}'};
  while(i<n){
    var c=code[i],atLineStart=i===from||code[i-1]==='\n',end;
    if(cfg.lineStart&&atLineStart&&cfg.lineStart.some(function(p){return code.startsWith(p,i);})){end=code.indexOf('\n',i);if(end<0||end>n)end=n;ranges.push([i,end]);i=end;continue;}
    /* Shell/YAML: # beginnt nur am Wortanfang einen Kommentar ($#, ${#x}, a#b nicht); #! in der ersten Zeile ist Code (Shebang). */
    var wordStart=!cfg.lineWord||i===from||' \t\n;|&('.indexOf(code[i-1])>=0;
    if(cfg.shebang&&i===0&&code.startsWith('#!',i)){end=code.indexOf('\n',i);i=end<0||end>n?n:end;continue;}
    var lineComment=wordStart&&(cfg.line||[]).find(function(p){return code.startsWith(p,i);});
    if(lineComment){end=code.indexOf('\n',i);if(end<0||end>n)end=n;ranges.push([i,end]);i=end;continue;}
    var blockComment=(cfg.block||[]).find(function(p){return code.startsWith(p[0],i);});
    if(blockComment){
      var close=code.indexOf(blockComment[1],i+blockComment[0].length);
      if(close<0||close>=n){diags.push({start:i,end:i+blockComment[0].length,msg:'Der Kommentar wird nicht beendet ('+blockComment[1]+' fehlt).'});ranges.push([i,n]);i=n;}
      else{ranges.push([i,close+blockComment[1].length]);i=close+blockComment[1].length;}
      continue;
    }
    if(cfg.quotes&&cfg.quotes.indexOf(c)>=0){
      var j=i+1,closed=false,multi=c==='`';
      while(j<n){
        var d=code[j];
        if(cfg.esc&&d===cfg.esc){j+=2;continue;}
        if(d==='\n'&&!multi)break;
        if(d===c){if(cfg.dbl&&code[j+1]===c){j+=2;continue;}closed=true;break;}
        j++;
      }
      if(!closed)diags.push({start:i,end:Math.max(i+1,Math.min(n,j)),msg:'Der Text ab '+c+' wird nicht beendet – das schließende '+c+' fehlt.'});
      i=closed?j+1:Math.min(n,Math.max(j,i+1));continue;
    }
    if(cfg.regex&&c==='/'&&rpRegexAllowed(code,i)){
      var k=i+1,inClass=false,found=false;
      while(k<n&&code[k]!=='\n'){
        if(code[k]==='\\'){k+=2;continue;}
        if(code[k]==='[')inClass=true;else if(code[k]===']')inClass=false;
        else if(code[k]==='/'&&!inClass){found=true;break;}
        k++;
      }
      if(found){i=k+1;continue;}
    }
    if(pairs[c])stack.push({ch:c,pos:i});
    else if(c===')'||c===']'||c==='}'){
      var top=stack.pop();
      if(!top)diags.push({start:i,end:i+1,msg:'Die Klammer '+c+' hat keine passende öffnende Klammer.'});
      else if(pairs[top.ch]!==c){diags.push({start:i,end:i+1,msg:'Hier steht '+c+', erwartet wird '+pairs[top.ch]+' (zur Klammer '+top.ch+' in Zeile '+rpLineOf(code,top.pos)+').'});stack.push(top);}
    }
    i++;
  }
  stack.forEach(function(open){diags.push({start:open.pos,end:open.pos+1,msg:'Die Klammer '+open.ch+' wird nie geschlossen – erwartet wird '+pairs[open.ch]+'.'});});
  return {ranges:ranges,diags:diags};
}
function rpScanHtml(code,from,to){
  var diags=[],ranges=[],stack=[],text=code.slice(0,to),re=/<!--[\s\S]*?(?:-->|$)/g,m;
  while((m=re.exec(text))){if(m.index>=from)ranges.push([m.index,m.index+m[0].length]);}
  var work=text.split('');ranges.forEach(function(r){for(var k=r[0];k<r[1];k++)if(work[k]!=='\n')work[k]=' ';});
  work=work.join('');
  var tag=/<(\/?)([A-Za-z][\w:-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>/g;tag.lastIndex=from;
  while((m=tag.exec(work))){
    var name=m[2].toLowerCase(),closing=m[1]==='/',selfClosing=/\/\s*$/.test(m[3]);
    if(closing){
      var at=-1;for(var s=stack.length-1;s>=0;s--)if(stack[s].name===name){at=s;break;}
      if(at<0)diags.push({start:m.index,end:m.index+m[0].length,msg:'Das schließende Tag </'+name+'> hat kein passendes öffnendes Tag.'});
      else{
        if(at<stack.length-1)diags.push({start:m.index,end:m.index+m[0].length,msg:'</'+name+'> kommt zu früh: <'+stack[stack.length-1].name+'> aus Zeile '+rpLineOf(code,stack[stack.length-1].pos)+' ist noch offen.'});
        stack.splice(at);
      }
    }else if(RP_VOID_TAGS.indexOf(name)<0&&!selfClosing){
      stack.push({name:name,pos:m.index});
      if(name==='script'||name==='style'){var stop=work.toLowerCase().indexOf('</'+name,tag.lastIndex);if(stop>0)tag.lastIndex=stop;}
    }
  }
  stack.forEach(function(open){diags.push({start:open.pos,end:open.pos+open.name.length+1,msg:'Das Tag <'+open.name+'> wird nie geschlossen (</'+open.name+'> fehlt).'});});
  return {ranges:ranges,diags:diags};
}
function rpScanVue(code){
  /* Script-Block: Klammern und Texte; alles andere: Tags. Beide Prüfungen arbeiten auf denselben Zeichenpositionen. */
  var diags=[],ranges=[],scripts=[],re=/<script\b[^>]*>([\s\S]*?)<\/script>/gi,m;
  while((m=re.exec(code))){scripts.push([m.index+m[0].indexOf('>')+1,m.index+m[0].length-'</script>'.length]);}
  scripts.forEach(function(s){var r=rpScanCode(RP_SCAN.javascript,code,s[0],s[1]);diags=diags.concat(r.diags);ranges=ranges.concat(r.ranges);});
  var html=rpScanHtml(code,0,code.length);diags=diags.concat(html.diags);ranges=ranges.concat(html.ranges);
  return {ranges:ranges,diags:diags};
}
function rpScan(language,code){
  var cfg=RP_SCAN[language]||{},r;
  if(cfg.vue)r=rpScanVue(code);
  else if(cfg.tags)r=rpScanHtml(code,0,code.length);
  else r=rpScanCode(cfg,code,0,code.length);
  var masked=code.split('');
  r.ranges.forEach(function(range){for(var k=range[0];k<range[1]&&k<masked.length;k++)if(masked[k]!=='\n')masked[k]=' ';});
  return {masked:masked.join(''),diags:r.diags};
}
/* Wendet die Regeln der Aufgabe an. Muster sind RegExp-Literale (immer mehrzeilig). forbidden: jede Fundstelle wird rot markiert, außer unless passt.
   required: fehlt das Muster, wird optional die Ankerzeile (anchor) markiert. */
function rpRuleRegex(re){return new RegExp(re.source,re.flags.replace(/[gm]/g,'')+'gm');}
function rpEvaluate(task,code){
  var scan=rpScan(task.language||'javascript',code),diags=scan.diags.slice(),checks=[];
  (task.rules||[]).forEach(function(rule){
    var re=rpRuleRegex(rule.pattern),m,count=0;
    if(rule.kind==='forbidden'){
      if(!(rule.unless&&rpRuleRegex(rule.unless).test(scan.masked))){
        while((m=re.exec(scan.masked))){count++;diags.push({start:m.index,end:m.index+Math.max(1,m[0].length),msg:rule.message});if(m[0]==='')re.lastIndex++;}
      }
      checks.push({rule:rule,ok:count===0});return;
    }
    while((m=re.exec(scan.masked))){count++;if(m[0]==='')re.lastIndex++;}
    var ok=count>=(rule.min||1);
    if(!ok&&rule.anchor){
      var anchor=rpRuleRegex(rule.anchor).exec(scan.masked);
      if(anchor){
        var lineStart=scan.masked.lastIndexOf('\n',anchor.index)+1,lineEnd=scan.masked.indexOf('\n',anchor.index);
        diags.push({start:lineStart,end:lineEnd<0?scan.masked.length:lineEnd,msg:rule.message});
      }
    }
    checks.push({rule:rule,ok:ok});
  });
  diags.sort(function(a,b){return a.start-b.start;});
  return {diags:diags,checks:checks,ok:!diags.length&&checks.every(function(c){return c.ok;})};
}

/* ---------- Editor mit roter Markierung ---------- */
function rpMirrorHtml(code,diags){
  var pos=0;
  return code.split('\n').map(function(line,index){
    var s=pos,e=pos+line.length,html='',cursor=s,bad=false;
    pos=e+1;
    diags.forEach(function(d){
      var a=Math.max(d.start,s),b=Math.min(d.end,e);
      if(d.start<=e&&d.end>s)bad=true;
      if(b>a&&a>=cursor){html+=esc(code.slice(cursor,a))+'<mark class="gp-err">'+esc(code.slice(a,b))+'</mark>';cursor=b;}
    });
    html+=esc(code.slice(cursor,e));
    return '<span class="gp-ln'+(bad?' gp-ln-err':'')+'">'+(html||'​')+'</span>';
  }).join('');
}
function rpPosition(code,offset){
  var before=code.slice(0,offset).split('\n');
  return {line:before.length,col:before[before.length-1].length+1};
}
function rpDiagHtml(code,result){
  if(!result)return '';
  if(!result.diags.length)return result.ok?'<p class="gp-diag-ok">✓ Keine Auffälligkeiten im Code gefunden.</p>':'';
  return '<h3>Fehler im Code</h3><ul class="gp-diag">'+result.diags.map(function(d){
    var p=rpPosition(code,d.start);
    return '<li><button type="button" class="gp-jump" data-onclick="rpEditorJump('+d.start+','+d.end+')">Zeile '+p.line+', Spalte '+p.col+'</button> <span><span aria-hidden="true">✗ </span>'+esc(d.msg)+'</span></li>';
  }).join('')+'</ul>';
}
function rpChecklistHtml(task,result){
  var rules=(task.rules||[]).filter(function(r){return r.kind!=='forbidden'&&r.label;});
  if(!rules.length)return '';
  return '<h3>Anforderungen</h3><ul class="gp-req">'+rules.map(function(rule,index){
    var check=result&&result.checks.find(function(c){return c.rule===rule;});
    var state=!check?'offen':check.ok?'erfüllt':'fehlt';
    return '<li class="gp-req-'+(check?(check.ok?'ok':'bad'):'open')+'" style="--i:'+index+'"><span aria-hidden="true">'+(check?(check.ok?'✓':'✗'):'○')+'</span> '+esc(rule.label)+'<span class="gp-sr"> – '+state+'</span></li>';
  }).join('')+'</ul>';
}
function rpEditorSync(){
  var editor=document.getElementById('rpCodeEditor'),mirror=document.getElementById('rpMirror');
  if(!editor||!mirror)return;
  var task=rpPracticeTask(),key=rpPracticeKey(),result=rpPractice.result[key];
  if(result&&task){
    /* Nach der ersten Prüfung markiert der Editor Strukturfehler und Regelverstöße schon beim Tippen. */
    var live=rpEvaluate(task,editor.value),extra=result.extra&&result.extraCode===editor.value?result.extra:null;
    if(extra){live.diags.push(extra);live.diags.sort(function(a,b){return a.start-b.start;});}
    else result.extra=null;
    result.diags=live.diags;result.checks=live.checks;result.ok=live.ok&&!extra&&result.testsOk!==false;
  }
  mirror.innerHTML=rpMirrorHtml(editor.value,result?result.diags:[]);
  var diag=document.getElementById('gpDiag'),list=document.getElementById('gpChecklist');
  if(diag)diag.innerHTML=rpDiagHtml(editor.value,result);
  if(list&&task)list.innerHTML=rpChecklistHtml(task,result);
  mirror.scrollTop=editor.scrollTop;mirror.scrollLeft=editor.scrollLeft;
  editor.setAttribute('aria-invalid',result&&result.diags.length?'true':'false');
}
function rpEditorJump(start,end){
  var editor=document.getElementById('rpCodeEditor');if(!editor)return;
  editor.focus();editor.setSelectionRange(start,end);
  var line=rpPosition(editor.value,start).line,height=parseFloat(getComputedStyle(editor).lineHeight)||24;
  editor.scrollTop=Math.max(0,(line-3)*height);
}
function rpEditorWire(){
  var editor=document.getElementById('rpCodeEditor'),mirror=document.getElementById('rpMirror');
  if(!editor||!mirror)return;
  editor.addEventListener('scroll',function(){mirror.scrollTop=editor.scrollTop;mirror.scrollLeft=editor.scrollLeft;});
  rpEditorSync();
}
function rpEditorHtml(task,key){
  var value=rpPractice.drafts[key]??task.starter,label=task.label||(task.type==='run'?'JavaScript-Code · Funktion bearbeiten':'Dein Code · '+(RP_LANG_LABEL[task.language]||task.language));
  return '<label for="rpCodeEditor">'+esc(label)+'</label><div class="gp-ed"><pre class="gp-ed-mirror" id="rpMirror" aria-hidden="true"></pre>'+
    '<textarea id="rpCodeEditor" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" maxlength="12000" rows="'+(task.rows||14)+'" aria-describedby="gpDiag" data-oninput="rpPracticeStoreDraft()">'+esc(value)+'</textarea></div>';
}
var RP_LANG_LABEL={python:'Python',dockerfile:'Dockerfile',yaml:'YAML',javascript:'JavaScript',typescript:'TypeScript',vue:'Vue',java:'Java',php:'PHP',sql:'SQL',css:'CSS',html:'HTML',xml:'XML (pom.xml)',abap:'ABAP',shell:'Git-Befehle',pseudocode:'Pseudocode',json:'JSON',yaml:'YAML'};

/* ---------- Prüfen ---------- */
function rpPracticeCheck(){
  if(rpPractice.busy)return;
  rpPracticeStoreDraft();var task=rpPracticeTask(),key=rpPracticeKey();if(!task)return;
  if(task.type==='run'){rpPracticeRun(task);return;}
  if(task.type==='write'){rpPracticeWrite(task);return;}
  var answers=rpPractice.answers[key]||[];
  var normalize=function(s){return String(s||'').trim().replace(/\s+/g,' ');};
  var right=task.answers.map(function(options,i){return options.some(function(a){return normalize(a)===normalize(answers[i]);});});
  var correct=right.filter(Boolean).length;
  if(correct===task.answers.length){
    delete rpPractice.gapBad[key];
    if(!rpPractice.solutions[key])rpPracticeComplete();
    rpPracticeWin('Alle '+task.answers.length+' Ergänzungen richtig');
    rpPractice.feedback='Richtig ergänzt. '+task.why+' Dies war eine Codeverständnisprüfung, keine Programmausführung.';
  }else{
    delete rpPractice.won[key];
    rpPractice.gapBad[key]=right.map(function(ok){return !ok;});
    var wrong=right.map(function(ok,i){return ok?null:i+1;}).filter(Boolean);
    rpPractice.feedback=correct+' / '+task.answers.length+' Ergänzungen stimmen. Rot markiert: Ergänzung '+wrong.join(', ')+'. '+task.hint+' Prüfe Schreibweise und den erklärten Vertrag.';
  }
  renderContent();
  rpPracticeCelebrate();
}
function rpPracticeWrite(task){
  var key=rpPracticeKey(),code=rpPractice.drafts[key]??task.starter,result=rpEvaluate(task,code);
  result.testsOk=true;rpPractice.result[key]=result;
  if(result.ok){
    if(!rpPractice.solutions[key])rpPracticeComplete();
    var required=result.checks.filter(function(c){return c.rule.kind!=='forbidden';}).length;
    rpPracticeWin(required+' von '+required+' Anforderungen erfüllt, keine Fehlerstellen');
    rpPractice.feedback='Alle Anforderungen sind erfüllt. '+task.why+' Das war eine Strukturprüfung mit Regeln, keine Programmausführung.';
  }else{
    delete rpPractice.won[key];
    var open=result.checks.filter(function(c){return !c.ok&&c.rule.kind!=='forbidden';}).length;
    rpPractice.feedback=result.diags.length+' Stelle(n) im Code rot markiert'+(open?', '+open+' Anforderung(en) noch offen':'')+'. '+task.hint;
  }
  renderContent();
  rpPracticeCelebrate();
}
async function rpPracticeRun(task){
  rpPractice.busy=true;rpPractice.feedback='Wird isoliert ausgeführt …';
  var key=rpPracticeKey(),code=rpPractice.drafts[key]||task.starter;
  renderContent();
  var frames=[],timer,listener,stopped=false;
  var clean=function(){clearTimeout(timer);if(listener)window.removeEventListener('message',listener);frames.forEach(function(f){f.remove();});frames=[];};
  rpPracticeStop=function(){stopped=true;clean();rpPractice.busy=false;rpPracticeStop=null;};
  /* Zwei getrennte Frames: Die Syntaxprüfung bettet fremden Code in ein Skript ein und darf das Token der Ausführung nie sehen. */
  var makeFrame=function(){
    // Eigene URL statt srcdoc: Ein srcdoc-Dokument erbt die CSP der Seite; die Sandbox braucht Inline-Skript und eval und bekommt sie deshalb über ihre eigene Antwort (server.mjs).
    var frame=document.createElement('iframe');frame.sandbox='allow-scripts';frame.hidden=true;frame.src='assets/guided-sandbox.html';frame.title='Isolierte JavaScript-Ausführung';
    frames.push(frame);document.body.appendChild(frame);return frame;
  };
  /* Ergebnis speichern: Fehlerstellen aus Syntaxprüfung oder Laufzeit kommen zu den Strukturfehlern und Regelverstößen hinzu. */
  var finish=function(extra,testsOk){
    var result=rpEvaluate(task,code);
    if(extra){
      var offset=0,lines=code.split('\n');for(var i=0;i<extra.line-1&&i<lines.length;i++)offset+=lines[i].length+1;
      var lineText=lines[Math.max(0,Math.min(lines.length,extra.line)-1)]||'';
      var from=extra.col?Math.min(offset+extra.col-1,offset+lineText.length):offset+(lineText.length-lineText.trimStart().length);
      result.extra={start:from,end:Math.max(from+1,offset+lineText.length),msg:extra.message};result.extraCode=code;
      result.diags.push(result.extra);
      result.diags.sort(function(a,b){return a.start-b.start;});
    }
    result.testsOk=testsOk;result.ok=result.ok&&testsOk&&!extra;rpPractice.result[key]=result;return result;
  };
  try{
    if(!rpPracticeWorkerSource){var response=await fetch('assets/guided-worker.js');if(!response.ok)throw Error('Ausführungsmodul nicht verfügbar.');rpPracticeWorkerSource=await response.text();}
    if(stopped)return;
    var syntaxToken=crypto.randomUUID(),runToken=crypto.randomUUID(),syntaxFrame=makeFrame(),runFrame=null;
    listener=function(event){
      var data=event.data;
      if(event.source===syntaxFrame.contentWindow&&data?.token===syntaxToken&&data.type==='rp-practice-syntax'){
        syntaxFrame.remove();
        if(!data.error){
          runFrame=makeFrame();
          runFrame.onload=function(){runFrame.contentWindow.postMessage({type:'start',token:runToken,workerSource:rpPracticeWorkerSource,input:{type:'run',code:code,functionName:task.functionName,functionNames:task.functionNames,cases:task.cases}},'*');};
          return;
        }
        /* Syntaxfehler: genaue Stelle im Editor markieren, nichts ausführen. */
        clean();rpPractice.busy=false;rpPracticeStop=null;
        finish({line:data.error.line,col:data.error.col,message:'Syntaxfehler: '+data.error.message},false);
        rpPractice.feedback='Der Code lässt sich nicht lesen (Syntaxfehler in Zeile '+data.error.line+', rot markiert). Tipp: '+task.hint;
        if(state.currentId==='guided')renderContent();
        return;
      }
      if(!runFrame||event.source!==runFrame.contentWindow||data?.token!==runToken||data.type!=='rp-practice-result')return;
      var result=data.result;clean();rpPractice.busy=false;rpPracticeStop=null;
      delete rpPractice.won[key];
      if(result.error){
        finish(result.line?{line:result.line,col:result.col,message:'Laufzeitfehler: '+result.error}:null,false);
        rpPractice.feedback='Fehler: '+result.error+(result.line?' (Zeile '+result.line+', rot markiert)':'')+' Tipp: '+task.hint;
      }else{
        var passed=result.results.filter(function(r){return r.ok;}).length,allOk=passed===task.cases.length;
        var checked=finish(null,allOk);
        rpPractice.feedback=result.results.map(function(r,i){
          var name=task.cases[i]&&task.cases[i].name?' ('+task.cases[i].name+')':'';
          if(r.ok)return 'Test '+(i+1)+': bestanden'+name;
          return 'Test '+(i+1)+': '+(r.mutated?'Eingabe wurde verändert (die Funktion soll rein sein)':'erwartet '+r.expected+', erhalten '+r.actual)+name;
        }).join('\n');
        if(allOk&&checked.ok){if(!rpPractice.solutions[key])rpPracticeComplete();rpPracticeWin(passed+' von '+task.cases.length+' Tests bestanden, keine Fehlerstellen');rpPractice.feedback+='\n'+task.why+' Die sichtbaren Tests sind ein Lernfeedback, kein manipulationssicherer Kompetenznachweis.';}
        else if(allOk)rpPractice.feedback+='\nAlle Tests laufen, aber der Code verletzt noch Vorgaben (rot markiert).';
      }
      if(state.currentId==='guided'){renderContent();rpPracticeCelebrate();}
    };
    window.addEventListener('message',listener);
    syntaxFrame.onload=function(){syntaxFrame.contentWindow.postMessage({type:'syntax',token:syntaxToken,code:code},'*');};
    timer=setTimeout(function(){clean();rpPractice.busy=false;rpPracticeStop=null;if(state.currentId==='guided'){rpPractice.feedback='Abgebrochen: Zeitlimit von '+((task.timeoutMs||2000)/1000)+' Sekunden erreicht. Prüfe Endbedingungen und Rekursion.';finish(null,false);renderContent();}},(task.timeoutMs||2000)+1000);
  }catch(error){clean();rpPractice.busy=false;rpPracticeStop=null;rpPractice.feedback=error.message;if(state.currentId==='guided')renderContent();}
}

/* ---------- Ansicht ---------- */
/* Modulbezug und Aufgabenliste der Werkstatt (je Modul mindestens eine Aufgabe). */
function rpModuleLabel(task){
  var ids=task.modules||(task.module?[task.module]:[]);
  var titles=ids.map(function(id){var m=rpCatalog.modules.find(function(x){return x.id===id;});return m?m.title:'';}).filter(Boolean);
  return titles.length?'<p class="gp-module"><span class="gp-module-lbl">Modul</span> '+esc(titles.join(' · '))+'</p>':'';
}
function rpTaskListHtml(track,tasks){
  if(tasks.length<2)return '';
  return '<details class="gp-tasklist"><summary>Alle Aufgaben dieser Spur ('+tasks.length+')</summary><ol>'+tasks.map(function(t,i){
    var done=!!state.solved['workshop:'+track.id+':'+t.id];
    return '<li><button type="button" class="gp-go" data-onclick="rpPracticeGo('+i+')"'+(i===rpPractice.index?' aria-current="step"':'')+'>'+esc(t.title)+(done?'<span aria-hidden="true"> ✓</span><span class="gp-sr"> – gelöst</span>':'')+'</button></li>';
  }).join('')+'</ol></details>';
}

function rpRenderPractice(){
  var tracks=rpPracticeTracks().filter(rpPracticeAllowed),track=tracks.find(function(t){return t.id===rpPractice.track;});
  var h='<div class="breadcrumb">Aktiv programmieren · eigene Root-Road-Aufgaben</div><h1>Geführte Codewerkstatt</h1>';
  h+='<p>Erklären → selbst ergänzen → Feedback lesen → Variante lösen. Die JavaScript-Funktionsaufgaben führen Code aus. Alle anderen Sprachen prüfen Ergänzungen und Regeln, keine vollständige fachliche Korrektheit. Keine fremden Kurstexte oder Aufgaben kopiert.</p>';
  h+='<div class="gp-tracks">'+tracks.map(function(t){return '<button class="ex-btn" aria-pressed="'+(track?.id===t.id)+'" data-onclick="rpPracticeStart(\''+t.id+'\')">'+esc(t.title)+'</button>';}).join('')+'</div>';
  if(!track)return h+'<p>Wähle eine Sprache. Die Auswahl folgt deinem Lernpfad.</p>';
  var werkstatt=rpPractice.mode==='werkstatt',tasks=rpPracticeTasks(track),task=tasks[rpPractice.index],key=rpPracticeKey();
  var heavy=window.RP_WORKSHOP&&window.RP_WORKSHOP[track.id];
  var count=heavy?' ('+heavy.length+')':'';
  h+='<div class="gp-modes" role="group" aria-label="Aufgabenart">'+
     (track.tasks.length?'<button class="ex-btn" aria-pressed="'+!werkstatt+'" data-onclick="rpPracticeSetMode(\'guided\')">Geführt · kurze Ergänzungen ('+track.tasks.length+')</button>':'')+
     '<button class="ex-btn" aria-pressed="'+werkstatt+'" '+(rpPractice.loading?'disabled ':'')+'data-onclick="rpPracticeSetMode(\'werkstatt\')">Werkstatt · schwer, mehr Code'+count+'</button></div>';
  if(!task)return h+'<pre class="gp-feedback" role="status" aria-live="polite">'+esc(rpPractice.feedback||'Für diese Sprache gibt es noch keine Aufgaben dieser Art.')+'</pre>';
  var result=rpPractice.result[key];
  h+='<div class="gp-workbench'+(rpPractice.won[key]?' gp-solved':'')+'"><section class="gp-instructions"><p class="badge topic">'+esc(track.title)+(werkstatt?' · Werkstatt':'')+' · Schritt '+(rpPractice.index+1)+' / '+tasks.length+(task.level==='schwer'?' · schwer':'')+'</p><h2>'+esc(task.title)+'</h2>'+rpModuleLabel(task)+'<p>'+esc(track.intro)+'</p><p><strong>Dein Auftrag:</strong> '+esc(task.text)+'</p>'+
     (task.details?'<ul class="gp-details">'+task.details.map(function(d){return '<li>'+esc(d)+'</li>';}).join('')+'</ul>':'')+
     (werkstatt?rpTaskListHtml(track,tasks):'')+
     '<div id="gpChecklist">'+(werkstatt?rpChecklistHtml(task,result):'')+'</div>'+
     '<p><a href="'+esc(track.source)+'" target="_blank" rel="noopener noreferrer">Offizielle Vertiefung</a></p><p>'+(state.solved[key]?'Bereits bearbeitet – Wiederholung möglich.':'Noch offen.')+'</p></section><section class="gp-editor">';
  if(task.type==='run'||task.type==='write'){
    h+=rpEditorHtml(task,key);
    h+='<p class="gp-note">'+(task.type==='run'?'Isolierter Worker ohne Zugriff auf den Lernstand; '+((task.timeoutMs||2000)/1000)+' Sekunden Zeitlimit. Keine Secrets eingeben.':'Geprüft wird die Struktur deines Codes mit Regeln, nichts wird ausgeführt. Fehlerstellen werden rot markiert, auch schon beim Weitertippen.')+'</p>';
  }else{
    h+='<p><strong>Ergänzungsaufgabe · keine Laufzeit</strong></p><pre class="gp-code">';
    var bad=rpPractice.gapBad[key]||[];
    task.code.split(/(\[\[\d+\]\])/g).forEach(function(part){var m=part.match(/^\[\[(\d+)\]\]$/);h+=m?'<input aria-label="Codeergänzung '+(+m[1]+1)+'" data-rp-gap="'+m[1]+'" value="'+esc((rpPractice.answers[key]||[])[+m[1]]||'')+'" spellcheck="false" autocomplete="off"'+(bad[+m[1]]?' class="gp-bad" aria-invalid="true"':'')+' data-oninput="rpPracticeStoreDraft()">':esc(part);});
    h+='</pre>';
  }
  h+='<div class="gp-actions"><button class="check-btn" '+(rpPractice.busy?'disabled':'')+' data-onclick="rpPracticeCheck()">'+(task.type==='run'?'Code ausführen & prüfen':task.type==='write'?'Code prüfen':'Ergänzung prüfen')+'</button><button class="ex-btn" data-onclick="rpPracticeHint(false)">Hinweis</button><button class="ex-btn" data-onclick="rpPracticeHint(true)">Lösung ansehen</button></div>';
  if(rpPractice.hints[key])h+='<p><strong>Hinweis:</strong> '+esc(task.hint)+'</p>';
  if(rpPractice.solutions[key])h+='<details open><summary>Lösung und Begründung</summary><pre>'+esc(task.solution||task.answers.map(function(a){return a[0];}).join('\n'))+'</pre><p>'+esc(task.why)+'</p></details>';
  h+=rpWinHtml(key,rpPractice.index===tasks.length-1);
  h+='<div id="gpDiag" role="status" aria-live="polite"></div><pre class="gp-feedback" role="status" aria-live="polite">'+esc(rpPractice.feedback)+'</pre></section></div><div class="gp-actions"><button class="ex-btn" '+(rpPractice.index===0?'disabled':'')+' data-onclick="rpPracticeMove(-1)">Zurück</button><button class="ex-btn" '+(rpPractice.index===tasks.length-1?'disabled':'')+' data-onclick="rpPracticeMove(1)">Nächste Aufgabe</button><button class="ex-btn" data-onclick="selectLesson(\''+(task.lesson||track.lesson)+'\')">Zur passenden Lektion</button></div>';
  return h;
}
(function(){
  var renderBase=renderContent;
  renderContent=function(){
    if(state.currentId==='guided'){document.getElementById('content').innerHTML=rpRenderPractice();rpEditorWire();return;}
    rpPracticeStop?.();renderBase.apply(this,arguments);
    var lesson=rpCatalog.lessons.find(function(l){return l.id===state.currentId;});
    var applicable=rpPracticeTracks().filter(function(t){return rpPracticeAllowed(t)&&(!lesson||rpLessonPaths[lesson.id]===t.path);});
    if((lesson||['intro','heute'].includes(state.currentId))&&applicable.length){
      var host=document.getElementById('content');host.querySelector('#gp-entry')?.remove();
      host.insertAdjacentHTML('beforeend','<section id="gp-entry" class="callout"><h2>Jetzt selbst ausprobieren</h2><p>Kurze geführte Codeaufgaben mit Hinweisen und direktem Feedback, dazu schwere Werkstattaufgaben mit mehr eigenem Code. Aufgabenpool passend zu deinem Lernpfad – nicht für jede Lektion eine eigene neue Übung.</p><button class="start-btn" data-onclick="selectLesson(\'guided\')">Codewerkstatt öffnen</button></section>');
    }
  };
  var sideBase=renderSidebar;
  renderSidebar=function(){sideBase.apply(this,arguments);var button=document.getElementById('gp-nav');if(!button){button=document.createElement('button');button.id='gp-nav';button.type='button';button.textContent='Geführte Codewerkstatt';button.className='nav-link';button.onclick=function(){selectLesson('guided');};document.getElementById('moduleNav').before(button);}};
  if(!window.RP_BOOTING) render();
})();
