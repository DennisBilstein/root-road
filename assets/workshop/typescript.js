/* Werkstattaufgaben der Spur typescript (Original Root Road). Wird erst geladen, wenn die Spur in der Werkstatt geöffnet wird. */
(function(){
var W=window.RP_WS,L=W.L,need=W.need,bad=W.bad;
var tasks=[
  {id:'typescript-w1',modules:['ts-m1'],level:'schwer',type:'write',language:'typescript',rows:22,
    title:'Fremde Daten typsicher einlesen',
    text:'Schreibe einen Typ Task, einen Type Guard isTask und die Funktion parseTasks, die unbekannte JSON-Daten sicher in eine Liste von Tasks verwandelt.',
    details:['type Task = { id: number; title: string; status: "open" | "done" }.','isTask(value: unknown): value is Task prüft alle Felder zur Laufzeit (Objekt, id und title mit typeof, status gegen die erlaubten Werte).','parseTasks(data: unknown): Task[] wirft einen Error, wenn data keine Liste ist, und liefert nur die Einträge, für die isTask wahr ist.','Kein any, keine Typ-Behauptung mit as.'],
    starter:L('// Schreibe hier Typ, Type Guard und parseTasks','',''),
    rules:[
      need('type Task mit id, title und status',/\b(?:type|interface)\s+Task\b[\s\S]*\bid\s*:\s*number[\s\S]*\btitle\s*:\s*string[\s\S]*\bstatus\s*:\s*["']open["']\s*\|\s*["']done["']/),
      need('isTask(value: unknown): value is Task',/function\s+isTask\s*\(\s*value\s*:\s*unknown\s*\)\s*:\s*value\s+is\s+Task\b/),
      need('prüft id und title mit typeof',/typeof\s+[\w.]+\s*===\s*["']number["'][\s\S]*typeof\s+[\w.]+\s*===\s*["']string["']|typeof\s+[\w.]+\s*===\s*["']string["'][\s\S]*typeof\s+[\w.]+\s*===\s*["']number["']/),
      need('prüft status gegen "open" und "done"',/["']open["'][\s\S]*["']done["']/),
      need('parseTasks(data: unknown): Task[]',/function\s+parseTasks\s*\(\s*data\s*:\s*unknown\s*\)\s*:\s*Task\[\]/),
      need('prüft mit Array.isArray und wirft einen Error',/Array\.isArray\s*\([\s\S]*throw\s+new\s+Error\s*\(/),
      need('filtert mit isTask',/\.filter\s*\(\s*isTask\s*\)|isTask\s*\(/),
      bad(/\bany\b/,'any schaltet die Typprüfung aus. Nutze unknown und grenze mit Prüfungen ein.'),
      bad(/\bas\s+(?:Task|any|unknown)\b/,'as ist keine Prüfung, sondern ein Versprechen ohne Beweis. Prüfe die Werte zur Laufzeit.'),
      bad(/@ts-ignore|@ts-nocheck/,'Unterdrücke keine Typfehler – behebe ihre Ursache.')
    ],
    solution:L('type Task = { id: number; title: string; status: "open" | "done" };','','function isTask(value: unknown): value is Task {','  if (typeof value !== "object" || value === null) return false;','  const candidate = value as Record<string, unknown>;','  return (','    typeof candidate.id === "number" &&','    typeof candidate.title === "string" &&','    (candidate.status === "open" || candidate.status === "done")','  );','}','','function parseTasks(data: unknown): Task[] {','  if (!Array.isArray(data)) {','    throw new Error("Liste erwartet");','  }','  return data.filter(isTask);','}'),
    hint:'unknown zwingt dich zur Prüfung, bevor du auf Felder zugreifst. Der Type Guard kapselt diese Prüfung einmal und für alle.',
    why:'TypeScript prüft nur zur Übersetzungszeit. Daten aus dem Netz brauchen eine Laufzeitprüfung – sonst ist der Typ nur eine Behauptung.'},
  {id:'typescript-w2',modules:['ts-m2'],level:'schwer',type:'write',language:'typescript',rows:20,
    title:'Generische Funktion groupBy',
    text:'Schreibe die generische Funktion groupBy, die eine Liste anhand eines Schlüssels in Gruppen aufteilt.',
    details:['Signatur: function groupBy<T, K extends string>(items: readonly T[], key: (item: T) => K): Partial<Record<K, T[]>>.','Die Reihenfolge innerhalb der Gruppen bleibt erhalten, die Eingabe wird nicht verändert.','Kein any und kein @ts-ignore.'],
    starter:L('// Schreibe hier groupBy','',''),
    rules:[
      need('function groupBy<T, K extends string>',/function\s+groupBy\s*<\s*T\s*,\s*K\s+extends\s+(?:string|PropertyKey)\s*>/),
      need('items: readonly T[] und key: (item: T) => K',/\(\s*items\s*:\s*readonly\s+T\[\]\s*,\s*key\s*:\s*\(\s*item\s*:\s*T\s*\)\s*=>\s*K\s*\)/),
      need('Rückgabetyp Partial<Record<K, T[]>>',/\)\s*:\s*(?:Partial\s*<\s*Record\s*<\s*K\s*,\s*T\[\]\s*>\s*>|Record\s*<\s*K\s*,\s*T\[\]\s*>)\s*\{/),
      need('durchläuft items (for, reduce oder forEach)',/\bfor\s*\(|\.reduce\s*\(|\.forEach\s*\(/),
      need('ruft key(item) auf',/\bkey\s*\(\s*\w+\s*\)/),
      bad(/\bany\b/,'any schaltet die Typprüfung aus – das generische T ist genau dafür da.'),
      bad(/@ts-ignore|@ts-nocheck/,'Unterdrücke keine Typfehler – behebe ihre Ursache.'),
      bad(/\bitems\s*\.\s*(?:sort|push|splice|reverse)\s*\(/,'readonly-Listen werden nicht verändert; arbeite auf einer Kopie.')
    ],
    solution:L('function groupBy<T, K extends string>(items: readonly T[], key: (item: T) => K): Partial<Record<K, T[]>> {','  const groups: Partial<Record<K, T[]>> = {};','  for (const item of items) {','    const name = key(item);','    const group = groups[name] ?? [];','    group.push(item);','    groups[name] = group;','  }','  return groups;','}'),
    hint:'T beschreibt die Elemente, K den Schlüssel. Partial, weil nicht jeder mögliche Schlüssel in den Daten vorkommen muss.',
    why:'Generics bewahren Typinformation über die Funktion hinweg: Aus einer Liste von Tasks werden Gruppen von Tasks – ohne any und ohne Umwege.'}
];
W.add('typescript',tasks);
})();
