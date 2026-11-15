/* Ereignisdelegation statt Inline-Handlern: Die Oberfläche trägt data-onclick, data-onchange, data-oninput, data-onkeydown und
   data-onfocus. Ein Listener am document liest das Attribut, prüft es gegen eine feste Grammatik und ruft nur benannte, in
   assets/action-names.js (erzeugt von scripts/build-action-names.mjs) freigegebene Funktionen mit festen Argumenten auf.
   Die CSP (script-src-attr 'none') blockiert echte Inline-Handler; es wird nie Text als Code ausgewertet.
   Grammatik je Anweisung: name(arg, …) | return false | if(event.key==='X') [{] name(arg, …) [}]
   Argumente: 'Text', Zahl, true, false, null, this, this.value, this.checked, event. */
(function(){
  var EVENTS = { click: 'click', change: 'change', input: 'input', keydown: 'keydown', focusin: 'focus' };
  var allowed = new Set(window.RP_ACTION_NAMES || []);
  var cache = new Map();

  function tokenize(text){
    var tokens = [], i = 0;
    while(i < text.length){
      var c = text[i];
      if(/\s/.test(c)){ i++; continue; }
      if(c === "'"){
        var value = '';
        i++;
        while(i < text.length && text[i] !== "'"){
          if(text[i] === '\\' && i + 1 < text.length) i++;
          value += text[i++];
        }
        if(text[i] !== "'") throw new Error('Zeichenkette nicht beendet');
        i++;
        tokens.push({ t: 'str', v: value });
      }else if(/[0-9]/.test(c) || (c === '-' && /[0-9]/.test(text[i + 1] || ''))){
        var m = /^-?\d+(?:\.\d+)?/.exec(text.slice(i));
        tokens.push({ t: 'num', v: Number(m[0]) });
        i += m[0].length;
      }else if(/[A-Za-z_]/.test(c)){
        var id = /^[A-Za-z_]\w*/.exec(text.slice(i))[0];
        tokens.push({ t: 'id', v: id });
        i += id.length;
      }else if(text.startsWith('===', i)){
        tokens.push({ t: '===' });
        i += 3;
      }else if('(),;.{}'.includes(c)){
        tokens.push({ t: c });
        i++;
      }else throw new Error('Unerwartetes Zeichen „' + c + '“');
    }
    return tokens;
  }

  /* Ergebnis: Liste von { key, name, args } sowie das Kennzeichen preventDefault; die Ausführung prüft nur noch den Schlüssel. */
  function parse(text){
    var tokens = tokenize(text), pos = 0, steps = [], prevent = false;
    function peek(){ return tokens[pos]; }
    function take(type){
      var token = tokens[pos];
      if(!token || token.t !== type) throw new Error('„' + type + '“ erwartet');
      pos++;
      return token;
    }
    function maybe(type){ if(peek() && peek().t === type){ pos++; return true; } return false; }
    function arg(){
      var token = peek();
      if(!token) throw new Error('Argument fehlt');
      if(token.t === 'str' || token.t === 'num'){ pos++; return { k: 'lit', v: token.v }; }
      if(token.t !== 'id') throw new Error('Unerlaubtes Argument');
      pos++;
      if(token.v === 'true') return { k: 'lit', v: true };
      if(token.v === 'false') return { k: 'lit', v: false };
      if(token.v === 'null') return { k: 'lit', v: null };
      if(token.v === 'event') return { k: 'event' };
      if(token.v !== 'this') throw new Error('Unerlaubter Name „' + token.v + '“');
      if(!maybe('.')) return { k: 'this' };
      var prop = take('id').v;
      if(prop !== 'value' && prop !== 'checked') throw new Error('Unerlaubte Eigenschaft „' + prop + '“');
      return { k: 'prop', v: prop };
    }
    function call(key){
      var name = take('id').v;
      if(!allowed.has(name)) throw new Error('Aktion „' + name + '“ ist nicht freigegeben');
      take('(');
      var args = [];
      if(!maybe(')')){
        do args.push(arg()); while(maybe(','));
        take(')');
      }
      steps.push({ key: key, name: name, args: args });
    }
    function statement(){
      var first = peek();
      if(first.t === 'id' && first.v === 'return'){
        pos++;
        var value = take('id');
        if(value.v !== 'false') throw new Error('Nur „return false“ ist erlaubt');
        prevent = true;
      }else if(first.t === 'id' && first.v === 'if'){
        pos++;
        take('(');
        if(take('id').v !== 'event') throw new Error('Nur event.key wird geprüft');
        take('.');
        if(take('id').v !== 'key') throw new Error('Nur event.key wird geprüft');
        take('===');
        var key = take('str').v;
        take(')');
        var braces = maybe('{');
        call(key);
        maybe(';');
        if(braces) take('}');
      }else call(null);
    }
    while(pos < tokens.length){
      if(maybe(';')) continue;
      statement();
    }
    return { steps: steps, prevent: prevent };
  }

  function plan(text){
    if(!cache.has(text)) cache.set(text, parse(text));
    return cache.get(text);
  }

  function run(element, event, text){
    var parsed;
    try{ parsed = plan(text); }
    catch(error){ console.error('Ereignis-Attribut abgelehnt (' + error.message + '): ' + text); return; }
    if(parsed.prevent) event.preventDefault();
    parsed.steps.forEach(function(step){
      if(step.key !== null && event.key !== step.key) return;
      var args = step.args.map(function(a){
        if(a.k === 'lit') return a.v;
        if(a.k === 'event') return event;
        if(a.k === 'this') return element;
        return element[a.v];
      });
      var fn = window[step.name];
      if(typeof fn !== 'function') throw new Error('Aktion „' + step.name + '“ ist nicht definiert');
      fn.apply(window, args);
    });
  }

  /* Wie bei Inline-Handlern laufen alle Treffer vom Ziel nach oben; im Aufnahmephase-Listener, damit ein stopPropagation
     eines Einzel-Listeners die Aktion eines Vorfahren nicht verschluckt. */
  Object.keys(EVENTS).forEach(function(type){
    var attribute = 'data-on' + EVENTS[type];
    document.addEventListener(type, function(event){
      for(var node = event.target instanceof Element ? event.target : null; node; node = node.parentElement){
        var text = node.getAttribute(attribute);
        if(text !== null) run(node, event, text);
      }
    }, true);
  });
})();
