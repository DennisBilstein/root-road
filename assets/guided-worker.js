// Runs only inside a sandboxed opaque-origin frame. No app state or credentials.
// Der Lernercode steht in new Function nach 3 Kopfzeilen; Zeilen in Fehlermeldungen werden darauf zurückgerechnet.
var HEADER_LINES=3;
function errorPosition(error,lineCount){
  var match=/<anonymous>:(\d+):(\d+)/.exec(String(error&&error.stack||''));
  if(!match)return {};
  var line=Number(match[1])-HEADER_LINES;
  return line>=1&&line<=lineCount?{line:line,col:Number(match[2])}:{};
}
/* Objekte gelten als gleich, auch wenn ihre Schlüssel in anderer Reihenfolge stehen. */
function canonical(value){
  if(Array.isArray(value))return value.map(canonical);
  if(value&&typeof value==='object'){var sorted={};Object.keys(value).sort().forEach(function(key){sorted[key]=canonical(value[key]);});return sorted;}
  return value;
}
addEventListener('message', async function(event){
  var input=event.data;
  if(!input || input.type!=='run')return;
  var lineCount=String(input.code).split('\n').length;
  try{
    var names=input.functionNames||[input.functionName];
    var exposed=names.map(function(name){return JSON.stringify(name)+': typeof '+name+' === "function" ? '+name+' : null';}).join(',');
    var execute=new Function('"use strict";\n'+input.code+'\nreturn {'+exposed+'};');
    var functions=execute();
    names.forEach(function(name){if(!functions[name])throw Error('Die geforderte Funktion '+name+' fehlt.');});
    var results=[];
    for(var item of input.cases){
      var fn=functions[item.fn||input.functionName];
      var args=JSON.parse(JSON.stringify(item.args)),before=JSON.stringify(args);
      if(item.throws){
        var threw=false;
        try{await fn.apply(undefined,args);}catch(error){threw=!item.throwsMatch||new RegExp(item.throwsMatch).test(String(error&&error.message));}
        results.push({ok:threw,actual:threw?'Fehler':'kein passender Fehler',expected:'Fehler'+(item.throwsMatch?' mit '+item.throwsMatch:'')});
        continue;
      }
      var value;
      try{value=await fn.apply(undefined,args);}
      catch(error){var at=errorPosition(error,lineCount);postMessage({type:'result',error:String(error&&error.message||error).slice(0,500),line:at.line,col:at.col});return;}
      var equal=JSON.stringify(canonical(value))===JSON.stringify(canonical(item.expected)),untouched=JSON.stringify(args)===before;
      results.push({ok:equal&&untouched,mutated:equal&&!untouched,actual:String(JSON.stringify(value)).slice(0,300),expected:JSON.stringify(item.expected)});
    }
    postMessage({type:'result',results:results});
  }catch(error){var position=errorPosition(error,lineCount);postMessage({type:'result',error:String(error.message||error).slice(0,500),line:position.line,col:position.col});}
});
