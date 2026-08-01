import elements from './data/elements.json' with { type: 'json' };
import enUS from './data/translations/en-US.json' with { type: 'json' };
import esMX from './data/translations/es-MX.json' with { type: 'json' };

export type Locale = 'en-US' | 'es-MX';
export type TranslationCatalog = typeof enUS;

export const translations: Record<Locale, TranslationCatalog> = {
  'en-US': enUS,
  'es-MX': esMX,
};

export const els = elements;

type LeafPaths<T, Prefix extends string = ''> = {
  [Key in keyof T & string]: T[Key] extends string
    ? `${Prefix}${Key}`
    : T[Key] extends Record<string, unknown>
      ? LeafPaths<T[Key], `${Prefix}${Key}.`>
      : never;
}[keyof T & string];

export type TranslationKey = LeafPaths<TranslationCatalog>;

export type TranslationResources = Record<
  Locale,
  Record<keyof TranslationCatalog, TranslationCatalog[keyof TranslationCatalog]>
>;

export function getResources(): TranslationResources {
  return {
    'en-US': enUS,
    'es-MX': esMX,
  };
}

export function t(key: TranslationKey, locale: Locale = 'es-MX'): string {
  const value = readPath(translations[locale], key);
  return typeof value === 'string' ? value : key;
}

export function tid(key: string): string | undefined {
  const value = readPath(els, key);
  return typeof value === 'object' && value !== null && 'testId' in value
    ? (value as { testId?: string }).testId
    : undefined;
}

function readPath(root: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (typeof value !== 'object' || value === null) return undefined;
    return (value as Record<string, unknown>)[key];
  }, root);
}

/**
 * Find a testId by its i18nKey value. Searches the entire elements tree.
 * Used when the navigation key doesn't match the i18n path (e.g., nav.agenda.i18nKey = "common.appointments").
 */
export function findTestId(i18nKey: string): string | undefined {
  function search(obj: unknown): string | undefined {
    if (!obj || typeof obj !== 'object') return undefined;
    const record = obj as Record<string, unknown>;
    if (record.i18nKey === i18nKey && typeof record.testId === 'string') {
      return record.testId;
    }
    for (const value of Object.values(record)) {
      const result = search(value);
      if (result) return result;
    }
    return undefined;
  }
  return search(els);
}
