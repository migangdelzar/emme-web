import { describe, expect, it } from 'vitest';

import { createStorage } from './local-storage.js';

describe('createStorage', () => {
  it('provides a small key-value storage port over the injected storage', () => {
    const backingStore = new Map<string, string>();
    const storage = createStorage({
      getItem: (key) => backingStore.get(key) ?? null,
      setItem: (key, value) => void backingStore.set(key, value),
      removeItem: (key) => void backingStore.delete(key),
    });

    storage.set('tenant_slug', 'studio-a');

    expect(storage.get('tenant_slug')).toBe('studio-a');

    storage.remove('tenant_slug');

    expect(storage.get('tenant_slug')).toBeNull();
  });
});
