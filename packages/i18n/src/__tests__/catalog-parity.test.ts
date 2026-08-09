import enUS from '../data/translations/en-US.json' with { type: 'json' };
import esMX from '../data/translations/es-MX.json' with { type: 'json' };
import { describe, expect, it } from 'vitest';

function leafPaths(value: unknown, prefix = ''): string[] {
  if (typeof value === 'string') return [prefix];
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return [];

  return Object.entries(value).flatMap(([key, child]) =>
    leafPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe('translation catalogs', () => {
  it('keep en-US and es-MX leaf keys in exact parity', () => {
    expect(leafPaths(enUS).sort()).toEqual(leafPaths(esMX).sort());
  });
});
