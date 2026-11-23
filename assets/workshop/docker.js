/* Werkstattaufgaben der Spur docker. Wird erst geladen, wenn die Spur in der Werkstatt geöffnet wird. */
(function(){
var W=window.RP_WS,L=W.L,need=W.need,bad=W.bad;
W.add('docker',[
{id:'docker-w1',modules:['dk-m1'],level:'schwer',type:'write',language:'dockerfile',rows:30,
  title:'Gehärtetes Multi-Stage-Dockerfile',
  text:'Schreibe ein Dockerfile für eine Node.js-Anwendung: Gebaut wird in einer ersten Stufe, ausgeführt in einer schlanken zweiten Stufe ohne Root-Rechte.',
  details:['Stufe "build": FROM node:22-alpine AS build, WORKDIR /app, COPY package.json package-lock.json ./, RUN npm ci, COPY . ., RUN npm run build. (Die Abhängigkeiten stehen vor dem Quelltext, damit der Cache hält.)','Stufe 2: FROM node:22-alpine, ENV NODE_ENV=production, WORKDIR /app.','Aus der Build-Stufe kopierst du nur das Nötige mit Besitzer: COPY --from=build --chown=node:node /app/dist ./dist sowie package.json und package-lock.json.','Installiere nur Produktionsabhängigkeiten: RUN npm ci --omit=dev && npm cache clean --force.','Laufe als Benutzer node (USER node), EXPOSE 3000, HEALTHCHECK mit wget auf http://127.0.0.1:3000/health und CMD in Exec-Form ["node", "dist/server.js"].','Kein :latest, kein ADD, kein curl | sh, kein USER root, keine Geheimnisse in ENV oder ARG.'],
  starter:L('# Schreibe hier dein Dockerfile','',''),
  rules:[
    need('Stufe build',/^FROM\s+node:22-alpine\s+AS\s+build\s*$/m),
    need('Paketdateien vor dem Quelltext kopieren',/^COPY\s+package\.json\s+package-lock\.json\s+\.\/\s*\nRUN\s+npm\s+ci\s*\nCOPY\s+\.\s+\.\s*\nRUN\s+npm\s+run\s+build\s*$/m),
    need('zweite Stufe mit schlankem Image',/^FROM\s+node:22-alpine\s*$/m),
    need('ENV NODE_ENV=production',/^ENV\s+NODE_ENV=production\s*$/m),
    need('WORKDIR /app (zweimal)',/^WORKDIR\s+\/app\s*$/m,undefined,2),
    need('dist aus der Build-Stufe mit Besitzer',/^COPY\s+--from=build\s+--chown=node:node\s+\/app\/dist\s+\.\/dist\s*$/m),
    need('Paketdateien aus der Build-Stufe',/^COPY\s+--from=build\s+--chown=node:node\s+\/app\/package\.json\s+\/app\/package-lock\.json\s+\.\/\s*$/m),
    need('nur Produktionsabhängigkeiten',/^RUN\s+npm\s+ci\s+--omit=dev\s+&&\s+npm\s+cache\s+clean\s+--force\s*$/m),
    need('USER node',/^USER\s+node\s*$/m),
    need('EXPOSE 3000',/^EXPOSE\s+3000\s*$/m),
    need('HEALTHCHECK mit wget',/^HEALTHCHECK\s+(?:--\w+=\S+\s+)*CMD\s+wget\s+-qO-\s+http:\/\/127\.0\.0\.1:3000\/health\s*(?:\|\|\s*exit\s+1)?\s*$/m),
    need('CMD in Exec-Form',/^CMD\s+\[\s*"node"\s*,\s*"dist\/server\.js"\s*\]\s*$/m),
    need('USER steht vor CMD',/^USER\s+node\s*$[\s\S]*^CMD\b/m),
    bad(/^FROM\s+\S+:latest\b|^FROM\s+[^\s:@]+(?:\s|$)/m,'Ohne feste Version ändert sich das Image unter dir. Pinne ein Tag (node:22-alpine).'),
    bad(/^ADD\b/m,'ADD entpackt und lädt aus dem Netz. COPY ist vorhersagbar.'),
    bad(/\|\s*(?:sh|bash)\b|curl[^\n]*\|\s*\w+/,'Skripte aus dem Netz ungeprüft auszuführen ist ein Lieferkettenrisiko.'),
    bad(/^USER\s+(?:root|0)\b/m,'Der Prozess soll ohne Root-Rechte laufen.'),
    bad(/^(?:ENV|ARG)\s+\w*(?:PASSWORD|SECRET|TOKEN|KEY)\w*\s*=?\s*\S+/mi,'Geheimnisse in ENV oder ARG landen in den Image-Schichten und im Verlauf. Reiche sie zur Laufzeit herein.'),
    bad(/^CMD\s+(?!\[)\S+/m,'CMD in Shell-Form startet über /bin/sh: Signale (SIGTERM) erreichen die App nicht. Nutze die Exec-Form.'),
    bad(/^RUN\s+npm\s+install\b/m,'npm ci installiert exakt nach Lockfile und ist reproduzierbar.')
  ],
  solution:L('FROM node:22-alpine AS build','WORKDIR /app','COPY package.json package-lock.json ./','RUN npm ci','COPY . .','RUN npm run build','','FROM node:22-alpine','ENV NODE_ENV=production','WORKDIR /app','COPY --from=build --chown=node:node /app/dist ./dist','COPY --from=build --chown=node:node /app/package.json /app/package-lock.json ./','RUN npm ci --omit=dev && npm cache clean --force','USER node','EXPOSE 3000','HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:3000/health || exit 1','CMD ["node", "dist/server.js"]'),
  hint:'Jede Anweisung ist eine Schicht. Was sich selten ändert (Abhängigkeiten), kommt nach oben, damit der Build-Cache greift; was sich oft ändert (Quelltext), kommt weiter unten.',
  why:'Multi-Stage-Builds lassen Compiler und Entwicklerwerkzeuge aus dem Endimage. Nicht-Root-Betrieb und Exec-Form begrenzen den Schaden bei einem Einbruch und ermöglichen sauberes Beenden.'}
]);
})();
