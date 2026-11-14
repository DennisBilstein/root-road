// Derselbe Code als CommonJS-Datei gestartet: nextTick und Promise tauschen die Reihenfolge.
const seen = [];
setTimeout(() => seen.push('timeout'), 0);
setImmediate(() => seen.push('immediate'));
Promise.resolve().then(() => seen.push('promise'));
process.nextTick(() => seen.push('nextTick'));
seen.push('sync');
setTimeout(() => console.log(seen.join(' > ')), 20);
