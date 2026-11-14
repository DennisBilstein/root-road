// Dateien, Pfade, Buffer und Streams.
import { createReadStream, createWriteStream } from 'node:fs';
import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createGzip } from 'node:zlib';

/** Verbindet root und einen Nutzerpfad so, dass das Ergebnis garantiert unterhalb von root bleibt. */
export function safeJoin(root, userPath) {
  const base = path.resolve(root);
  const target = path.resolve(base, userPath);
  const relative = path.relative(base, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new RangeError(`Pfad verlässt das Verzeichnis: ${userPath}`);
  }
  return target;
}

/** Liest JSON und übersetzt typische Fehler in verständliche Meldungen. */
export async function readJson(file) {
  let text;
  try {
    text = await readFile(file, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') throw new Error(`Datei fehlt: ${path.basename(file)}`, { cause: error });
    if (error.code === 'EACCES') throw new Error(`Kein Zugriff auf ${path.basename(file)}`, { cause: error });
    throw error;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new SyntaxError(`${path.basename(file)} enthält kein gültiges JSON: ${error.message}`, { cause: error });
  }
}

/** Schreibt atomar: erst in eine Nebendatei, dann umbenennen. Ein Absturz hinterlässt nie eine halbe Datei. */
export async function writeJsonAtomic(file, value) {
  const temp = `${file}.${process.pid}.tmp`;
  await writeFile(temp, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });
  await rename(temp, file);
}

/** Zählt Zeilen, ohne die Datei komplett in den Speicher zu laden. */
export async function countLines(file) {
  let lines = 0;
  let sawData = false;
  let lastByte = 0x0a;
  const counter = new Transform({
    transform(chunk, _encoding, callback) {
      sawData = true;
      for (const byte of chunk) if (byte === 0x0a) lines += 1;
      lastByte = chunk[chunk.length - 1];
      callback(null, chunk);
    },
  });
  await pipeline(createReadStream(file), counter, new Transform({ transform(_c, _e, cb) { cb(); } }));
  return sawData && lastByte !== 0x0a ? lines + 1 : lines; // letzte Zeile ohne Zeilenumbruch mitzählen
}

/** Komprimiert eine Datei als Stream. pipeline räumt bei Fehlern alle Streams auf. */
export async function gzipFile(from, to) {
  await pipeline(createReadStream(from), createGzip(), createWriteStream(to));
}

export const bytes = (text) => ({ zeichen: text.length, bytes: Buffer.byteLength(text, 'utf8') });
