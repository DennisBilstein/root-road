# Mehrstufiges Image: Stufe "test" führt die Tests im Build aus. Stufe "runtime" übernimmt den getesteten Quelltext aus dieser Stufe,
# deshalb entsteht kein Image, wenn ein Test fehlschlägt. Das Image läuft ohne Root-Rechte.
# Basis: lokales Image node:24-slim (Tag, kein Digest; ein echtes Projekt fixiert zusätzlich den Digest).
FROM node:24-slim AS test
WORKDIR /app
COPY package.json ./
RUN node -e "console.log('Abhängigkeiten installieren (hier gibt es keine)')"
COPY src ./src
COPY tests ./tests
RUN node --test "tests/*.test.js"

FROM node:24-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
RUN node -e "console.log('Abhängigkeiten installieren (hier gibt es keine)')"
COPY --from=test --chown=node:node /app/src ./src
# Datenverzeichnis gehört dem unprivilegierten Benutzer node (UID 1000), damit ein Volume beschreibbar ist.
RUN mkdir /data && chown node:node /data
USER node
EXPOSE 3000
HEALTHCHECK --interval=2s --timeout=2s --start-period=2s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.js"]
