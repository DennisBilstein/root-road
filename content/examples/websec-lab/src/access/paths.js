// Path Traversal: auflösen, prüfen und dabei auch symbolische Links beachten.
import { realpath } from 'node:fs/promises';
import path from 'node:path';

/** Rein textbasierte Prüfung: schützt vor ../ und absoluten Pfaden, aber nicht vor Links. */
export function joinInside(root, userPath) {
  const base = path.resolve(root);
  const target = path.resolve(base, userPath);
  const relative = path.relative(base, target);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new RangeError('Pfad verlässt das Verzeichnis');
  return target;
}

/** Zusätzlich realpath: Ein Link innerhalb des Ordners, der nach außen zeigt, wird erkannt. */
export async function resolveInside(root, userPath) {
  if (userPath.includes('\0')) throw new TypeError('Ungültiges Zeichen im Pfad');
  const target = joinInside(root, userPath);
  const [realRoot, realTarget] = await Promise.all([realpath(root), realpath(target)]);
  const relative = path.relative(realRoot, realTarget);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new RangeError('Pfad verlässt das Verzeichnis (Link)');
  return realTarget;
}
