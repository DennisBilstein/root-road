/* Werkstattaufgaben der Spur javascript (Original Root Road). Wird erst geladen, wenn die Spur in der Werkstatt geöffnet wird. */
(function(){
var W=window.RP_WS,L=W.L,need=W.need,bad=W.bad;
var tasks=[
  {id:'js-w1',modules:['js-m1'],level:'schwer',type:'run',language:'javascript',functionName:'summarize',
    title:'Lernzeit-Statistik auswerten',
    text:'Implementiere summarize(entries). Jeder Eintrag hat topic (Text) und minutes (Zahl). Gruppiere nach dem getrimmten Thema und gib je Thema ein Objekt { topic, total, count, average } zurück.',
    details:['Ungültige Einträge werden übersprungen: kein Objekt, topic kein Text oder nach trim leer, minutes keine endliche Zahl oder negativ.','average ist total / count, gerundet auf eine Nachkommastelle.','Sortiere nach total absteigend, bei Gleichstand nach topic alphabetisch aufsteigend.','Die übergebene Liste darf nicht verändert werden.'],
    starter:L('function summarize(entries) {','  // 1. Einträge prüfen und nach Thema sammeln','  // 2. Durchschnitt berechnen und runden','  // 3. sortieren','  return [];','}'),
    cases:[
      {name:'normaler Fall',args:[[{topic:'SQL',minutes:30},{topic:'Java',minutes:45},{topic:'SQL',minutes:20}]],expected:[{topic:'SQL',total:50,count:2,average:25},{topic:'Java',total:45,count:1,average:45}]},
      {name:'leere Liste',args:[[]],expected:[]},
      {name:'trimmen und ungültige Einträge',args:[[{topic:' Java ',minutes:10},{topic:'Java',minutes:20},{topic:'',minutes:5},{topic:'Git',minutes:-1},{topic:'Git',minutes:'20'},{minutes:5}]],expected:[{topic:'Java',total:30,count:2,average:15}]},
      {name:'Gleichstand alphabetisch',args:[[{topic:'B',minutes:10},{topic:'A',minutes:10}]],expected:[{topic:'A',total:10,count:1,average:10},{topic:'B',total:10,count:1,average:10}]},
      {name:'Rundung auf eine Stelle',args:[[{topic:'X',minutes:10},{topic:'X',minutes:11},{topic:'X',minutes:11}]],expected:[{topic:'X',total:32,count:3,average:10.7}]},
      {name:'null-Eintrag und 0 Minuten',args:[[null,{topic:'Y',minutes:0}]],expected:[{topic:'Y',total:0,count:1,average:0}]}
    ],
    rules:[
      bad(/\bvar\b/,'var ist veraltet – nutze const oder let.'),
      bad(/[^=!<>]==[^=]/,'Verwende === statt ==, damit keine stille Typumwandlung passiert.'),
      bad(/\bentries\s*\.\s*sort\s*\(/,'sort() verändert das Original. Sortiere eine neue Liste, die Eingabe bleibt unverändert.'),
      bad(/\.sort\s*\(\s*\)/,'sort() ohne Vergleichsfunktion sortiert Zahlen als Text.')
    ],
    solution:L('function summarize(entries) {','  const groups = new Map();','  for (const entry of entries) {','    if (!entry || typeof entry.topic !== "string" || typeof entry.minutes !== "number") continue;','    if (!Number.isFinite(entry.minutes) || entry.minutes < 0) continue;','    const topic = entry.topic.trim();','    if (topic === "") continue;','    const group = groups.get(topic) ?? { topic, total: 0, count: 0 };','    group.total += entry.minutes;','    group.count += 1;','    groups.set(topic, group);','  }','  return [...groups.values()]','    .map((g) => ({ topic: g.topic, total: g.total, count: g.count, average: Math.round((g.total / g.count) * 10) / 10 }))','    .sort((a, b) => b.total - a.total || (a.topic < b.topic ? -1 : a.topic > b.topic ? 1 : 0));','}'),
    hint:'Sammle zuerst in einer Map (Thema → Summe und Anzahl), prüfe jeden Eintrag vorher, und sortiere erst am Ende die fertige Ergebnisliste.',
    why:'Eingaben prüfen, gruppieren, runden und stabil sortieren ist der Kern vieler Auswertungen. Gerundet wird erst am Schluss, und die Eingabe bleibt unverändert.'},

  {id:'js-w2',modules:['js-m1'],level:'schwer',type:'run',language:'javascript',functionName:'addItem',functionNames:['addItem','cartTotal','applyCoupon'],
    title:'Warenkorb mit Gutschein (Geld in Cent)',
    text:'Implementiere drei Funktionen. Ein Warenkorb ist eine Liste von Zeilen { sku, priceCents, qty }.',
    details:['addItem(cart, item) gibt einen NEUEN Warenkorb zurück. Gleiche sku erhöht qty, eine neue sku wird hinten angehängt. Ist qty keine ganze Zahl ≥ 1, wirf einen Error („Ungültige Menge“).','cartTotal(cart) liefert die Summe priceCents * qty als ganze Zahl.','applyCoupon(totalCents, code): „SAVE10“ zieht 10 % ab (Rabatt auf ganze Cent abgerundet), „FIX5“ zieht 500 Cent ab, aber nie unter 0. Jeder andere Code wirft einen Error („Unbekannter Code“).','Geld bleibt in ganzen Cent, kein toFixed und kein parseFloat.'],
    starter:L('function addItem(cart, item) {','  return cart;','}','','function cartTotal(cart) {','  return 0;','}','','function applyCoupon(totalCents, code) {','  return totalCents;','}'),
    cases:[
      {name:'neue Zeile',fn:'addItem',args:[[],{sku:'A',priceCents:1000,qty:2}],expected:[{sku:'A',priceCents:1000,qty:2}]},
      {name:'gleiche sku summiert',fn:'addItem',args:[[{sku:'A',priceCents:1000,qty:2}],{sku:'A',priceCents:1000,qty:1}],expected:[{sku:'A',priceCents:1000,qty:3}]},
      {name:'andere sku hinten',fn:'addItem',args:[[{sku:'A',priceCents:1000,qty:2}],{sku:'B',priceCents:250,qty:1}],expected:[{sku:'A',priceCents:1000,qty:2},{sku:'B',priceCents:250,qty:1}]},
      {name:'Menge 0 wirft',fn:'addItem',args:[[],{sku:'A',priceCents:1000,qty:0}],throws:true,throwsMatch:'Menge'},
      {name:'Menge 1,5 wirft',fn:'addItem',args:[[],{sku:'A',priceCents:1000,qty:1.5}],throws:true,throwsMatch:'Menge'},
      {name:'Summe',fn:'cartTotal',args:[[{sku:'A',priceCents:1000,qty:3},{sku:'B',priceCents:250,qty:2}]],expected:3500},
      {name:'leerer Warenkorb',fn:'cartTotal',args:[[]],expected:0},
      {name:'SAVE10 rundet ab',fn:'applyCoupon',args:[1999,'SAVE10'],expected:1800},
      {name:'FIX5 nie unter 0',fn:'applyCoupon',args:[300,'FIX5'],expected:0},
      {name:'FIX5 normal',fn:'applyCoupon',args:[1500,'FIX5'],expected:1000},
      {name:'unbekannter Code',fn:'applyCoupon',args:[1000,'GRATIS'],throws:true,throwsMatch:'Unbekannt'}
    ],
    rules:[
      bad(/\btoFixed\b|\bparseFloat\b/,'Geld bleibt in ganzen Cent. toFixed und parseFloat arbeiten mit Gleitkomma und Text.'),
      bad(/\bcart\s*\.\s*push\s*\(/,'cart.push verändert den übergebenen Warenkorb. Baue ein neues Array.'),
      bad(/\bvar\b/,'var ist veraltet – nutze const oder let.')
    ],
    solution:L('function addItem(cart, item) {','  if (!Number.isInteger(item.qty) || item.qty < 1) {','    throw new Error("Ungültige Menge");','  }','  const exists = cart.some((line) => line.sku === item.sku);','  if (!exists) {','    return [...cart, { ...item }];','  }','  return cart.map((line) => (line.sku === item.sku ? { ...line, qty: line.qty + item.qty } : line));','}','','function cartTotal(cart) {','  return cart.reduce((sum, line) => sum + line.priceCents * line.qty, 0);','}','','function applyCoupon(totalCents, code) {','  if (code === "SAVE10") return totalCents - Math.floor((totalCents * 10) / 100);','  if (code === "FIX5") return Math.max(0, totalCents - 500);','  throw new Error("Unbekannter Code");','}'),
    hint:'Baue in addItem mit map und dem Spread-Operator ein neues Array. Für Gutscheine rechnest du ausschließlich mit ganzen Zahlen und rundest mit Math.floor.',
    why:'Unveränderliche Daten, Fehler bei ungültigen Eingaben und Geld in Cent sind die drei Dinge, die in echten Warenkörben am häufigsten schiefgehen.'},

  {id:'js-w3',modules:['js-m1'],level:'schwer',type:'run',language:'javascript',functionName:'parseQuery',functionNames:['parseQuery','buildQuery'],
    title:'Query-Strings lesen und bauen',
    text:'Implementiere parseQuery(query) und buildQuery(params) für URL-Parameter wie ?tag=a&tag=b&q=K%C3%B6ln.',
    details:['parseQuery: führendes ? ist optional, leere Teile (&&) werden ignoriert, ein Schlüssel ohne = bekommt den Wert „“. + steht für ein Leerzeichen. Schlüssel und Werte werden mit decodeURIComponent dekodiert. Kommt ein Schlüssel mehrfach vor, wird der Wert eine Liste in Reihenfolge des Auftretens.','Schlüssel wie constructor müssen ganz normale Schlüssel sein.','buildQuery: Schlüssel alphabetisch, Listen als wiederholte Schlüssel, null-Werte werden übersprungen, Schlüssel und Werte mit encodeURIComponent kodieren, Teile mit & verbinden.'],
    starter:L('function parseQuery(query) {','  return {};','}','','function buildQuery(params) {','  return "";','}'),
    cases:[
      {name:'einfach',fn:'parseQuery',args:['?a=1&b=2'],expected:{a:'1',b:'2'}},
      {name:'Plus und Umlaut',fn:'parseQuery',args:['name=Max+Muster&city=K%C3%B6ln'],expected:{name:'Max Muster',city:'Köln'}},
      {name:'wiederholter Schlüssel',fn:'parseQuery',args:['tag=a&tag=b&tag=c'],expected:{tag:['a','b','c']}},
      {name:'leere Teile und Schlüssel ohne Wert',fn:'parseQuery',args:['&&flag&x='],expected:{flag:'',x:''}},
      {name:'Schlüssel constructor',fn:'parseQuery',args:['constructor=1'],expected:{constructor:'1'}},
      {name:'leer',fn:'parseQuery',args:[''],expected:{}},
      {name:'sortiert',fn:'buildQuery',args:[{b:'2',a:'1'}],expected:'a=1&b=2'},
      {name:'kodiert und Liste',fn:'buildQuery',args:[{q:'a b&c',tag:['x','y']}],expected:'q=a%20b%26c&tag=x&tag=y'},
      {name:'null überspringen, 0 und leer behalten',fn:'buildQuery',args:[{a:null,c:0,d:''}],expected:'c=0&d='},
      {name:'Umlaute in Schlüssel und Wert',fn:'buildQuery',args:[{'ü':'ö'}],expected:'%C3%BC=%C3%B6'},
      {name:'leeres Objekt',fn:'buildQuery',args:[{}],expected:''}
    ],
    rules:[
      need('kodiert mit encodeURIComponent',/encodeURIComponent\s*\(/),
      need('dekodiert mit decodeURIComponent',/decodeURIComponent\s*\(/),
      bad(/\beval\b|\bnew\s+Function\b/,'Niemals Text aus einer URL ausführen.'),
      bad(/\bkey\s+in\s+\w+|\bin\s+result\b/,'in findet auch geerbte Schlüssel wie constructor. Nutze Object.hasOwn oder ein Objekt ohne Prototyp (Object.create(null)).',/Object\.create\s*\(\s*null\s*\)|new\s+Map\s*\(/),
      bad(/\bvar\b/,'var ist veraltet – nutze const oder let.')
    ],
    solution:L('function parseQuery(query) {','  const result = Object.create(null);','  const text = query.startsWith("?") ? query.slice(1) : query;','  for (const part of text.split("&")) {','    if (part === "") continue;','    const index = part.indexOf("=");','    const rawKey = index === -1 ? part : part.slice(0, index);','    const rawValue = index === -1 ? "" : part.slice(index + 1);','    const key = decodeURIComponent(rawKey.replace(/\\+/g, " "));','    const value = decodeURIComponent(rawValue.replace(/\\+/g, " "));','    if (!(key in result)) {','      result[key] = value;','    } else if (Array.isArray(result[key])) {','      result[key].push(value);','    } else {','      result[key] = [result[key], value];','    }','  }','  return result;','}','','function buildQuery(params) {','  const parts = [];','  for (const key of Object.keys(params).sort()) {','    const values = Array.isArray(params[key]) ? params[key] : [params[key]];','    for (const value of values) {','      if (value === null || value === undefined) continue;','      parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(String(value)));','    }','  }','  return parts.join("&");','}'),
    hint:'Ein Objekt ohne Prototyp (Object.create(null)) kennt constructor nicht als geerbten Schlüssel. Ersetze + vor dem Dekodieren durch ein Leerzeichen.',
    why:'URL-Parameter sind Fremddaten. Dekodieren, Mehrfachwerte und Schlüssel wie constructor sind klassische Fehlerquellen, an denen auch Prototype-Pollution-Lücken entstehen.'},

  {id:'js-w4',modules:['js-m1'],level:'schwer',type:'run',language:'javascript',functionName:'planTasks',
    title:'Aufgabenplan mit Fristen sortieren',
    text:'Implementiere planTasks(tasks, today). Eine Aufgabe ist { id, title, due, priority, done }. due ist ein Datum als Text YYYY-MM-DD oder null, priority 1 bis 3 (3 ist am wichtigsten).',
    details:['Nur offene Aufgaben (done === false) kommen ins Ergebnis, jeweils als { id, status }.','status: „überfällig“, wenn due vor today liegt, „heute“, wenn due gleich today ist, sonst „offen“. Datumstexte im ISO-Format lassen sich direkt vergleichen.','Reihenfolge: erst überfällig (älteste Frist zuerst), dann heute, dann offen. Innerhalb von heute und offen: priority absteigend, dann Frist aufsteigend (ohne Frist zuletzt), dann id aufsteigend. Bei überfälligen entscheidet nach der Frist priority, dann id.','Die Eingabeliste darf nicht verändert werden.'],
    starter:L('function planTasks(tasks, today) {','  // offene Aufgaben auswählen, Status bestimmen, sortieren','  return [];','}'),
    cases:[
      {name:'gemischter Plan',args:[[{id:1,title:'a',due:'2026-11-20',priority:1,done:false},{id:2,title:'b',due:'2026-11-23',priority:2,done:false},{id:3,title:'c',due:null,priority:3,done:false},{id:4,title:'d',due:'2026-11-25',priority:3,done:false},{id:5,title:'e',due:'2026-11-18',priority:3,done:false},{id:6,title:'f',due:'2026-11-01',priority:3,done:true},{id:7,title:'g',due:'2026-11-24',priority:1,done:false},{id:8,title:'h',due:null,priority:3,done:false}],'2026-11-23'],expected:[{id:5,status:'überfällig'},{id:1,status:'überfällig'},{id:2,status:'heute'},{id:4,status:'offen'},{id:3,status:'offen'},{id:8,status:'offen'},{id:7,status:'offen'}]},
      {name:'leere Liste',args:[[],'2026-11-23'],expected:[]},
      {name:'alles erledigt',args:[[{id:1,title:'a',due:null,priority:1,done:true}],'2026-11-23'],expected:[]},
      {name:'heute: Priorität vor id',args:[[{id:1,title:'a',due:'2026-11-23',priority:1,done:false},{id:2,title:'b',due:'2026-11-23',priority:3,done:false}],'2026-11-23'],expected:[{id:2,status:'heute'},{id:1,status:'heute'}]},
      {name:'überfällig: gleiche Frist, Priorität dann id',args:[[{id:4,title:'a',due:'2026-11-01',priority:1,done:false},{id:3,title:'b',due:'2026-11-01',priority:1,done:false},{id:9,title:'c',due:'2026-11-01',priority:2,done:false}],'2026-11-23'],expected:[{id:9,status:'überfällig'},{id:3,status:'überfällig'},{id:4,status:'überfällig'}]}
    ],
    rules:[
      bad(/\btasks\s*\.\s*sort\s*\(/,'sort() verändert das Original. Filtere zuerst (das ergibt eine neue Liste) und sortiere diese.'),
      bad(/\.sort\s*\(\s*\)/,'sort() ohne Vergleichsfunktion sortiert nach Text, nicht nach deinen Regeln.'),
      bad(/\bvar\b/,'var ist veraltet – nutze const oder let.'),
      bad(/[^=!<>]==[^=]/,'Verwende === statt ==.')
    ],
    solution:L('function planTasks(tasks, today) {','  const rank = { "überfällig": 0, "heute": 1, "offen": 2 };','  const open = tasks.filter((task) => !task.done).map((task) => {','    let status = "offen";','    if (task.due !== null && task.due < today) status = "überfällig";','    else if (task.due === today) status = "heute";','    return { task, status };','  });','  open.sort((a, b) => {','    if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];','    if (a.status === "überfällig" && a.task.due !== b.task.due) return a.task.due < b.task.due ? -1 : 1;','    if (b.task.priority !== a.task.priority) return b.task.priority - a.task.priority;','    if (a.task.due !== b.task.due && a.status === "offen") {','      if (a.task.due === null) return 1;','      if (b.task.due === null) return -1;','      return a.task.due < b.task.due ? -1 : 1;','    }','    return a.task.id - b.task.id;','  });','  return open.map(({ task, status }) => ({ id: task.id, status }));','}'),
    hint:'Gib jeder Aufgabe zuerst ihren Status, mach daraus einen Rang und schreibe den Vergleich Schritt für Schritt: erst Rang, dann Frist, dann Priorität, zuletzt id.',
    why:'Mehrstufige Sortierregeln gehören in einen einzigen, lesbaren Vergleich. Wer erst filtert und dann auf der Kopie sortiert, verändert die Eingabe nicht.'}
];
W.add('javascript',tasks);
W.add('javascript',[
{id:'js-w5',modules:['pp-m1'],level:'schwer',type:'run',language:'javascript',functionName:'validate',
  title:'DRY: Eine Validierung statt vieler Kopien',
  text:'Drei Formulare prüfen ihre Felder mit fast gleichem Code. Schreibe validate(schema, data) einmal, sodass jedes Formular nur noch ein Schema liefert.',
  details:['schema ist ein Objekt: Feldname → Regeln { type, required, minLength, min, max }. data enthält die Werte.','Gib ein Array von Fehlertexten zurück, in der Reihenfolge der Felder im Schema. Format: "feld: Meldung". Gültige Daten liefern [].','Fehlt ein Wert (undefined, null oder ""), meldet ein Pflichtfeld "feld: fehlt". Ein fehlendes optionales Feld wird übersprungen (keine weiteren Prüfungen).','Ist der Typ falsch (typeof data[feld] !== type), meldet es "feld: muss vom Typ <type> sein" und prüft das Feld nicht weiter.','Zeichenlänge unter minLength: "feld: mindestens <n> Zeichen". Zahl unter min: "feld: mindestens <n>", über max: "feld: höchstens <n>".','Unbekannte Felder in data werden ignoriert. Die Eingaben bleiben unverändert.'],
  starter:L('function validate(schema, data) {','  // eine Schleife über die Felder des Schemas','  return [];','}'),
  cases:[
    {name:'gültige Daten',args:[{name:{type:'string',required:true,minLength:2},age:{type:'number',min:0,max:150}},{name:'Ada',age:36}],expected:[]},
    {name:'Pflichtfeld fehlt',args:[{name:{type:'string',required:true,minLength:2}},{}],expected:['name: fehlt']},
    {name:'leerer Text zählt als fehlend',args:[{name:{type:'string',required:true}},{name:''}],expected:['name: fehlt']},
    {name:'optionales Feld fehlt',args:[{nick:{type:'string',minLength:3}},{}],expected:[]},
    {name:'falscher Typ',args:[{age:{type:'number',min:0}},{age:'12'}],expected:['age: muss vom Typ number sein']},
    {name:'zu kurz',args:[{name:{type:'string',required:true,minLength:3}},{name:'Al'}],expected:['name: mindestens 3 Zeichen']},
    {name:'Zahl zu klein und zu groß',args:[{a:{type:'number',min:1},b:{type:'number',max:10}},{a:0,b:11}],expected:['a: mindestens 1','b: höchstens 10']},
    {name:'Reihenfolge des Schemas',args:[{z:{type:'string',required:true},a:{type:'string',required:true}},{}],expected:['z: fehlt','a: fehlt']},
    {name:'0 ist ein gültiger Wert',args:[{n:{type:'number',required:true,min:0}},{n:0}],expected:[]},
    {name:'unbekannte Felder werden ignoriert',args:[{a:{type:'string'}},{a:'x',extra:1}],expected:[]}
  ],
  rules:[
    bad(/\bvar\b/,'var ist veraltet – nutze const oder let.'),
    bad(/[^=!<>]==[^=]/,'Verwende === statt ==, damit keine stille Typumwandlung passiert.'),
    bad(/\bif\s*\(\s*(?:field|key|name)\s*===?\s*["']/,'Keine Sonderfälle pro Feldname: Die Regeln stehen im Schema, der Code ist für alle Felder gleich.'),
    bad(/\bdata\s*\[[^\]]*\]\s*=[^=]|\bdelete\s+data\b|\bschema\s*\[[^\]]*\]\s*=[^=]/,'Verändere die Eingaben nicht.')
  ],
  solution:L('function validate(schema, data) {','  const errors = [];','  for (const [field, rules] of Object.entries(schema)) {','    const value = data[field];','    if (value === undefined || value === null || value === "") {','      if (rules.required) errors.push(`${field}: fehlt`);','      continue;','    }','    if (typeof value !== rules.type) {','      errors.push(`${field}: muss vom Typ ${rules.type} sein`);','      continue;','    }','    if (rules.minLength !== undefined && value.length < rules.minLength) {','      errors.push(`${field}: mindestens ${rules.minLength} Zeichen`);','    }','    if (rules.min !== undefined && value < rules.min) {','      errors.push(`${field}: mindestens ${rules.min}`);','    }','    if (rules.max !== undefined && value > rules.max) {','      errors.push(`${field}: höchstens ${rules.max}`);','    }','  }','  return errors;','}'),
  hint:'Drehe das Problem um: Der Code geht einmal durch das Schema, die Besonderheiten jedes Formulars stehen als Daten im Schema.',
  why:'DRY heißt: Wissen steht genau einmal. Wenn drei Formulare dieselbe Prüfung kopieren, muss ein Fehler dreimal behoben werden. Ein Schema macht aus Code Daten – kürzer und testbar.'}
]);
})();
