// Speicher im Arbeitsspeicher. Jede Notiz hat eine Versionsnummer; daraus wird das ETag gebildet.
export function createStore(clock) {
  const notes = new Map();
  let sequence = 0;
  return {
    create(owner, data) {
      const id = String(++sequence).padStart(4, '0');
      const note = { id, owner, ...data, version: 1, createdAt: new Date(clock()).toISOString(), updatedAt: new Date(clock()).toISOString() };
      notes.set(id, note);
      return note;
    },
    get: (id) => notes.get(id),
    update(id, data) {
      const note = notes.get(id);
      Object.assign(note, data, { version: note.version + 1, updatedAt: new Date(clock()).toISOString() });
      return note;
    },
    remove: (id) => notes.delete(id),
    // Sortierung nach (createdAt, id): eindeutig, auch wenn zwei Notizen in derselben Millisekunde entstehen.
    listFor: (owner) => [...notes.values()].filter((note) => note.owner === owner).sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : a.id < b.id ? -1 : 1)),
  };
}

export const etagOf = (note) => `"${note.id}-v${note.version}"`;
