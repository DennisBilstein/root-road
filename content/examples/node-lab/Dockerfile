# Schlankes Image für den Beispielserver. Kein npm install nötig: das Lab hat keine Abhängigkeiten.
FROM node:24-slim
ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
COPY src ./src
# Nicht als root laufen: das Image bringt den Benutzer "node" mit.
USER node
EXPOSE 8080
# Exec-Form, damit Node PID 1 ist und SIGTERM direkt bekommt (kein Shell-Zwischenprozess).
CMD ["node", "src/ops/main.js"]
