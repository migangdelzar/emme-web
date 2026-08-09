import { describe, expect, it } from 'vitest';

import { FakeStorage } from './fake-storage.js';

describe('FakeStorage', () => {
  it('keeps state isolated between instances', () => {
    const first = new FakeStorage();
    const second = new FakeStorage();

    first.setItem('key', 'first');

    expect(first.getItem('key')).toBe('first');
    expect(second.getItem('key')).toBeNull();
  });

  it('supports explicit error injection', () => {
    const storage = new FakeStorage();
    storage.error = new Error('storage unavailable');

    expect(() => storage.getItem('key')).toThrow('storage unavailable');
  });
});
