import { describe, expect, it } from 'vitest';
import enUS from './data/translations/en-US.json';
import esMX from './data/translations/es-MX.json';
import { getResources, t, tid } from './index';

function collectLeafPaths(node: unknown, path = ''): string[] {
  if (typeof node === 'string') return [path];
  if (typeof node !== 'object' || node === null) return [];

  return Object.entries(node).flatMap(([key, value]) =>
    collectLeafPaths(value, path ? `${path}.${key}` : key),
  );
}

describe('i18n catalog', () => {
  it('keeps locale files structurally aligned', () => {
    expect(collectLeafPaths(enUS)).toEqual(collectLeafPaths(esMX));
  });

  it('resolves text and test ids independently', () => {
    expect(t('common.dashboard', 'en-US')).toBe(enUS.common.dashboard);
    expect(tid('nav.dashboard')).toBe('nav-dashboard');
  });

  it('returns the requested key when a translation is unavailable', () => {
    expect(t('common.dashboard', 'es-MX')).toBe(esMX.common.dashboard);
  });

  it('exposes resources for the application i18n adapter', () => {
    expect(getResources()['en-US'].translation).toBe(enUS);
    expect(getResources()['es-MX'].translation).toBe(esMX);
  });

  it('resolves element ids from the typed element catalog', () => {
    expect(tid('dashboard.agenda')).toBe('dashboard-agenda');
  });
});
