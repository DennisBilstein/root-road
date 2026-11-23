/* Werkstattaufgaben der Spur node. Wird erst geladen, wenn die Spur in der Werkstatt geöffnet wird. */
(function(){
var W=window.RP_WS,L=W.L,need=W.need,bad=W.bad;
W.add('node',[
{id:'node-w1',modules:['node-m1'],level:'schwer',type:'write',language:'javascript',rows:30,
  title:'Konfiguration asynchron laden',
  text:'Schreibe das ES-Modul config.js, das eine JSON-Konfiguration asynchron lädt, prüft und Standardwerte nutzt, wenn die Datei fehlt.',
  details:['import { readFile } from "node:fs/promises"; (mit node:-Präfix, ESM-Syntax).','export const defaults = Object.freeze({ port: 3000, logLevel: "info" });','export async function loadConfig(path): liest die Datei mit readFile(path, "utf8") und await, parst mit JSON.parse.','Existiert die Datei nicht (error.code === "ENOENT"), gib { ...defaults } zurück. Jeden anderen Fehler wirfst du weiter (throw error) – auch ein kaputtes JSON.','Ist port keine ganze Zahl zwischen 1 und 65535, wirf new RangeError("Ungültiger Port: " + port). Ergebnis: { ...defaults, ...parsed }.','Kein require, keine Callback-Funktion, kein readFileSync, kein leerer catch.'],
  starter:L('// Schreibe hier das Modul config.js','',''),
  rules:[
    need('import aus node:fs/promises',/\bimport\s*\{\s*readFile\s*\}\s*from\s*["']node:fs\/promises["']/),
    need('export const defaults mit Object.freeze',/\bexport\s+const\s+defaults\s*=\s*Object\s*\.\s*freeze\s*\(\s*\{\s*port\s*:\s*3000\s*,\s*logLevel\s*:\s*["']info["']\s*\}\s*\)/),
    need('export async function loadConfig(path)',/\bexport\s+async\s+function\s+loadConfig\s*\(\s*path\s*\)/),
    need('await readFile(path, "utf8")',/\bawait\s+readFile\s*\(\s*path\s*,\s*["']utf8["']\s*\)/),
    need('JSON.parse',/\bJSON\s*\.\s*parse\s*\(/),
    need('ENOENT liefert Standardwerte',/\.\s*code\s*===\s*["']ENOENT["'][\s\S]*\breturn\s*\{\s*\.\.\.defaults\s*\}/),
    need('andere Fehler weiterwerfen',/\bthrow\s+error\s*;|\bthrow\s+\w+\s*;/),
    need('RangeError bei ungültigem Port',/\bnew\s+RangeError\s*\(\s*["']Ungültiger Port: ["']\s*\+\s*[\w.]+\s*\)|\bnew\s+RangeError\s*\(\s*`Ungültiger Port: \$\{\s*[\w.]+\s*\}`\s*\)/),
    need('Number.isInteger für den Port',/\bNumber\s*\.\s*isInteger\s*\(/),
    need('Ergebnis mit Spread',/\{\s*\.\.\.defaults\s*,\s*\.\.\.\w+\s*\}/),
    bad(/\brequire\s*\(|\bmodule\s*\.\s*exports\b/,'Nutze ES-Module (import/export), nicht CommonJS.'),
    bad(/\breadFileSync\s*\(|\bfs\s*\.\s*readFile\s*\([^)]*,\s*(?:function|\(|\w+\s*=>)/,'Blockierende oder Callback-Varianten halten den Event Loop auf oder verschachteln den Code. Nutze await readFile.'),
    bad(/\bcatch\s*(?:\(\s*\w*\s*\))?\s*\{\s*\}/,'Ein leerer catch verschluckt Fehler.'),
    bad(/\bimport\s*\{[^}]*\}\s*from\s*["'](?:fs|path)(?:\/promises)?["']/,'Nutze für eingebaute Module das Präfix node:.')
  ],
  solution:L('import { readFile } from "node:fs/promises";','','export const defaults = Object.freeze({ port: 3000, logLevel: "info" });','','export async function loadConfig(path) {','  let parsed;','  try {','    parsed = JSON.parse(await readFile(path, "utf8"));','  } catch (error) {','    if (error.code === "ENOENT") {','      return { ...defaults };','    }','    throw error;','  }','  const config = { ...defaults, ...parsed };','  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {','    throw new RangeError("Ungültiger Port: " + config.port);','  }','  return config;','}'),
  hint:'ENOENT heißt „Datei nicht vorhanden“ – das ist ein erwarteter Fall. Alles andere (Rechte, kaputtes JSON) ist ein echter Fehler und soll sichtbar bleiben.',
  why:'Asynchrone I/O hält den Event Loop frei. Wer nur den erwarteten Fehler abfängt und alle anderen weiterreicht, versteckt keine Defekte hinter Standardwerten.'},
{id:'node-w2',modules:['node-m2'],level:'schwer',type:'write',language:'javascript',rows:40,
  title:'HTTP-Server mit Grenzen und sauberem Beenden',
  text:'Schreibe server.js: einen kleinen HTTP-Server ohne Framework, der Anfragen begrenzt und beim Beenden sauber herunterfährt.',
  details:['import { createServer } from "node:http"; const port = Number(process.env.PORT ?? 3000);','Antworten über eine Hilfsfunktion send(res, status, body) mit Content-Type "application/json; charset=utf-8" und JSON.stringify.','GET /health → 200 { status: "ok" }. POST /echo → liest den Body, bricht bei mehr als 1_048_576 Bytes mit 413 ab, parst JSON (ungültig → 400 { error: "Ungültiges JSON" }) und antwortet 200 mit dem Objekt. Alles andere → 404 { error: "Nicht gefunden" }.','Der Body wird mit for await (const chunk of req) gesammelt; die Größe wird beim Sammeln geprüft.','server.listen(port). Bei SIGTERM: server.close(() => process.exit(0)) und ein Notfall-Timer mit setTimeout(() => process.exit(1), 10_000).unref().','Keine Stacktraces an den Client, keine Wildcard-CORS-Header.'],
  starter:L('// Schreibe hier die Datei server.js','',''),
  rules:[
    need('createServer aus node:http',/\bimport\s*\{\s*createServer\s*\}\s*from\s*["']node:http["']/),
    need('Port aus der Umgebung',/\bNumber\s*\(\s*process\s*\.\s*env\s*\.\s*PORT\s*\?\?\s*3000\s*\)/),
    need('send mit JSON-Content-Type',/\bfunction\s+send\s*\(\s*res\s*,\s*status\s*,\s*body\s*\)[\s\S]*application\/json;\s*charset=utf-8[\s\S]*JSON\s*\.\s*stringify\s*\(\s*body\s*\)/),
    need('/health liefert 200',/["']\/health["'][\s\S]*send\s*\(\s*res\s*,\s*200\s*,\s*\{\s*status\s*:\s*["']ok["']\s*\}\s*\)/),
    need('/echo mit POST',/\bPOST\b[\s\S]*["']\/echo["']|["']\/echo["'][\s\S]*\bPOST\b/),
    need('Body mit for await sammeln',/\bfor\s+await\s*\(\s*const\s+chunk\s+of\s+req\s*\)/),
    need('Größenlimit 1_048_576',/\b1_?048_?576\b/),
    need('413 bei zu großem Body',/send\s*\(\s*res\s*,\s*413\s*,/),
    need('400 bei ungültigem JSON',/catch[\s\S]*send\s*\(\s*res\s*,\s*400\s*,\s*\{\s*error\s*:\s*["']Ungültiges JSON["']\s*\}\s*\)/),
    need('404 für alles andere',/send\s*\(\s*res\s*,\s*404\s*,\s*\{\s*error\s*:\s*["']Nicht gefunden["']\s*\}\s*\)/),
    need('server.listen(port)',/\bserver\s*\.\s*listen\s*\(\s*port\s*\)/),
    need('SIGTERM mit server.close',/process\s*\.\s*on\s*\(\s*["']SIGTERM["']\s*,[\s\S]*server\s*\.\s*close\s*\(/),
    need('Notfall-Timer mit unref',/setTimeout\s*\([\s\S]*10_?000\s*\)\s*\.\s*unref\s*\(\s*\)/),
    bad(/\brequire\s*\(|\bmodule\s*\.\s*exports\b/,'Nutze ES-Module (import/export).'),
    bad(/Access-Control-Allow-Origin["']\s*,\s*["']\*["']/,'Ein Stern erlaubt jeder Webseite den Zugriff. Nenne konkrete Herkunft(en), wenn CORS nötig ist.'),
    bad(/\.\s*stack\b|\berror\s*\.\s*message\b|\be\s*\.\s*message\b/,'Gib keine Fehlerdetails oder Stacktraces an den Client.'),
    bad(/\bexpress\b|\bfastify\b|\bkoa\b/i,'Diese Aufgabe nutzt nur eingebaute Module.'),
    bad(/\breadFileSync\b|\bexecSync\b|\bwhile\s*\(\s*true\s*\)/,'Blockierender Code hält den Event Loop an: Jede andere Anfrage wartet.')
  ],
  solution:L('import { createServer } from "node:http";','','const port = Number(process.env.PORT ?? 3000);','const MAX_BODY = 1_048_576;','','function send(res, status, body) {','  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });','  res.end(JSON.stringify(body));','}','','async function readBody(req) {','  const chunks = [];','  let size = 0;','  for await (const chunk of req) {','    size += chunk.length;','    if (size > MAX_BODY) return null;','    chunks.push(chunk);','  }','  return Buffer.concat(chunks).toString("utf8");','}','','const server = createServer(async (req, res) => {','  const { pathname } = new URL(req.url, "http://localhost");','  if (req.method === "GET" && pathname === "/health") {','    return send(res, 200, { status: "ok" });','  }','  if (req.method === "POST" && pathname === "/echo") {','    const text = await readBody(req);','    if (text === null) return send(res, 413, { error: "Anfrage zu groß" });','    try {','      return send(res, 200, JSON.parse(text));','    } catch {','      return send(res, 400, { error: "Ungültiges JSON" });','    }','  }','  return send(res, 404, { error: "Nicht gefunden" });','});','','server.listen(port);','','process.on("SIGTERM", () => {','  server.close(() => process.exit(0));','  setTimeout(() => process.exit(1), 10_000).unref();','});'),
  hint:'Ein Server muss mit bösartigen und kaputten Anfragen rechnen: Größe begrenzen, JSON absichern, nichts Internes ausgeben, geordnet beenden.',
  why:'Ohne Größenlimit kann eine einzige Anfrage den Speicher füllen. Ein geordnetes Herunterfahren (SIGTERM) lässt laufende Anfragen fertig werden, was in Containern und bei Deployments zählt.'}
]);
})();
