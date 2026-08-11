import {
  readPath,
  translations,
  type Locale,
  type TranslationCatalogs,
  type TranslationKey,
} from './translation-catalog.js';

export interface TranslationLookupOptions {
  readonly catalogs?: TranslationCatalogs;
  readonly fallbackLocale?: Locale;
  readonly locale: Locale;
}

/**
 * Creates a typed translation lookup that resolves the active locale first,
 * then its configured fallback, and finally returns the key when unavailable.
 */
export function createTranslationLookup({
  catalogs = translations,
  fallbackLocale = 'es-MX',
  locale,
}: TranslationLookupOptions): (key: TranslationKey) => string {
  return (key) => {
    const activeValue = readPath(catalogs[locale], key);
    if (typeof activeValue === 'string') return activeValue;

    const fallbackValue = readPath(catalogs[fallbackLocale], key);
    return typeof fallbackValue === 'string' ? fallbackValue : key;
  };
}
