import { describe, expect, it } from 'vitest';
import { translations } from '@emme/i18n';
import { themeOptions } from './theme-options';

describe('salon theme options', () => {
  it('exposes the existing modes plus the Rosé mode in stable order', () => {
    expect(themeOptions.map((option) => option.id)).toEqual(['light', 'dark', 'system', 'rose']);
  });

  it('uses translated labels and descriptions for every option', () => {
    expect(themeOptions.every((option) => option.labelKey.startsWith('settings.'))).toBe(true);
    expect(themeOptions.every((option) => option.descriptionKey.startsWith('settings.'))).toBe(
      true
    );
  });

  it('defines the Rosé option with the rose identifier and translated copy keys', () => {
    expect(themeOptions[3]).toMatchObject({
      id: 'rose',
      labelKey: 'settings.themeRose',
      descriptionKey: 'settings.themeRoseDescription',
    });
  });

  it('has translated copy for every theme option in both supported locales', () => {
    for (const locale of ['en-US', 'es-MX'] as const) {
      for (const option of themeOptions) {
        expect(translations[locale].settings[option.labelKey.replace('settings.', '')]).toBeTypeOf(
          'string'
        );
        expect(
          translations[locale].settings[option.descriptionKey.replace('settings.', '')]
        ).toBeTypeOf('string');
      }
    }
  });
});
