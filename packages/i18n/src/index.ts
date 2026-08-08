import elements from './data/elements.json' with { type: 'json' };
import {
  readPath,
  resources,
  translations,
  type Locale as TranslationLocale,
  type TranslationKey as CatalogTranslationKey,
} from './translation-catalog.js';

export {
  translations,
  type Locale,
  type TranslationCatalog,
  type TranslationCatalogs,
  type TranslationKey,
  type TranslationResources,
} from './translation-catalog.js';
export { createTranslationLookup, type TranslationLookupOptions } from './translation-lookup.js';

export const els = elements;

type ElementReference = { testId: string; i18nKey?: string };
type JoinPath<Prefix extends string, Key extends string> = Prefix extends ''
  ? Key
  : `${Prefix}.${Key}`;
type ElementPaths<T, Prefix extends string = ''> = {
  [Key in keyof T & string]: T[Key] extends string | ElementReference
    ? JoinPath<Prefix, Key>
    : T[Key] extends Record<string, unknown>
      ? ElementPaths<T[Key], JoinPath<Prefix, Key>>
      : never;
}[keyof T & string];

export type ElementKey = ElementPaths<typeof els>;

export function getResources(): typeof resources {
  return resources;
}

export function t(key: CatalogTranslationKey, locale: TranslationLocale = 'es-MX'): string {
  const value = readPath(translations[locale], key);
  return typeof value === 'string' ? value : key;
}

export function tid(key: ElementKey): string {
  const value = readPath(els, key);
  return typeof value === 'string'
    ? value
    : typeof value === 'object' && value !== null && 'testId' in value
    ? (value as { testId?: string }).testId ?? key
    : key;
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

export { I18nProvider, type I18nProviderProps } from './i18n-provider.js';
export { LocaleContext, type LocaleContextValue, type TranslationLookup } from './locale-context.js';
export { useTranslation } from './use-translation.js';
export { I18nTestProvider, type I18nTestProviderProps } from './testing/i18n-test-provider.js';

export {
  formatDate,
  formatTime,
  formatRelativeTime,
  formatCurrency,
  formatNumber,
  formatValidationMessage,
  type CurrencyFormatOptions,
  type DateFormatOptions,
  type DateFormatterOptions,
  type FormatContext,
  type NumberFormatOptions,
  type NumberFormatterOptions,
} from './formatters/index.js';
