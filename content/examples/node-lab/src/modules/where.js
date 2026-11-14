// In ES-Modulen gibt es kein __dirname; stattdessen import.meta.
export const here = { dir: import.meta.dirname, file: import.meta.filename, hasRequire: typeof require !== 'undefined' };
