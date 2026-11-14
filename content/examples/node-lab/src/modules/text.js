// ES-Modul mit benannten Exports und einem Standard-Export.
import { pad } from '#format'; // Subpath-Import: "imports" in package.json, nur innerhalb dieses Pakets

export const version = '1.0.0';

export function slugify(text) {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // Akzente entfernen (ä -> a)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function label(id, name) {
  return `${pad(id, 4)} ${slugify(name)}`;
}

export default slugify;
