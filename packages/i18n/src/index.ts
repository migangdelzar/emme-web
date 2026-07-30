import elements from './data/elements.json' with { type: 'json' };
import enUS from './data/translations/en-US.json' with { type: 'json' };
import esMX from './data/translations/es-MX.json' with { type: 'json' };

export type Locale = 'en-US' | 'es-MX';

export const translations: Record<Locale, typeof enUS> = {
  'en-US': enUS,
  'es-MX': esMX,
};

export const els = elements as typeof elements;

export function t(key: string, locale: Locale = 'es-MX'): string {
  const keys = key.split('.');
  let value: any = translations[locale];
  for (const k of keys) value = value?.[k];
  return typeof value === 'string' ? value : key;
}

export function tid(key: string): string | undefined {
  const keys = key.split('.');
  let value: any = els;
  for (const k of keys) value = value?.[k];
  return value?.testId;
}

/**
 * Find a testId by its i18nKey value. Searches the entire elements tree.
 * Used when the navigation key doesn't match the i18n path (e.g., nav.agenda.i18nKey = "common.appointments").
 */
export function findTestId(i18nKey: string): string | undefined {
  function search(obj: any): string | undefined {
    if (!obj || typeof obj !== 'object') return undefined;
    if (obj.i18nKey === i18nKey && obj.testId) return obj.testId;
    for (const key of Object.keys(obj)) {
      const result = search(obj[key]);
      if (result) return result;
    }
    return undefined;
  }
  return search(els);
}
