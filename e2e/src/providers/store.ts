import type { Client, Service, Appointment } from '@emme/contracts';

// ── Functional in-memory store — simulates a DB table ──

type Entity = { id: string };

/** Creates a store for one entity type. Returns closures for pure-like operations. */
const store = <T extends Entity>() => {
  let items: T[] = [];

  return {
    seed: (data: T[]) => { items = [...data]; },

    all: (): readonly T[] => items,

    find: (id: string): T | undefined => items.find(i => i.id === id),

    insert: (item: T): T => {
      items = [...items, item];
      return item;
    },

    update: (id: string, patch: Partial<T>): T | undefined => {
      const idx = items.findIndex(i => i.id === id);
      if (idx === -1) return undefined;
      items = [
        ...items.slice(0, idx),
        { ...items[idx], ...patch },
        ...items.slice(idx + 1),
      ];
      return items[idx];
    },

    remove: (id: string): boolean => {
      const len = items.length;
      items = items.filter(i => i.id !== id);
      return items.length < len;
    },

    clear: () => { items = []; },
  };
};

/** Composed in-memory database — one table per domain entity. */
export const db = {
  customers: store<Client>(),
  services: store<Service>(),
  appointments: store<Appointment>(),
};

export type Store<T extends Entity> = ReturnType<typeof store<T>>;
