import { describe, expect, it } from 'vitest';
import { getInitialLocale, normalizeLocale, persistLocale } from './locale';

describe('application locale', () => {
  it('normalizes browser language variants to supported locales', () => {
    expect(normalizeLocale('es_MX')).toBe('es-MX');
    expect(normalizeLocale('en-GB')).toBe('en-US');
  });

  it('prefers an explicitly persisted locale over browser preferences', () => {
    const storage = { getItem: () => 'es-MX' };
    expect(getInitialLocale(storage, ['en-US'])).toBe('es-MX');
  });

  it('falls back to English when browser preferences are unsupported', () => {
    expect(getInitialLocale(undefined, ['fr-FR'])).toBe('en-US');
  });

  it('persists an explicit locale through the storage boundary', () => {
    let saved = '';
    persistLocale('es-MX', { setItem: (_key, value) => (saved = value) });
    expect(saved).toBe('es-MX');
  });
});
