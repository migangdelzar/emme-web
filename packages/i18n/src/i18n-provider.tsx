import { createElement, useMemo, type ReactNode } from 'react';
import { createTranslationLookup } from './translation-lookup.js';
import type { Locale, TranslationCatalogs } from './translation-catalog.js';
import { LocaleContext } from './locale-context.js';

export interface I18nProviderProps {
  readonly catalogs?: TranslationCatalogs;
  readonly children: ReactNode;
  readonly fallbackLocale?: Locale;
  readonly locale: Locale;
}

export function I18nProvider({
  catalogs,
  children,
  fallbackLocale = 'es-MX',
  locale,
}: I18nProviderProps): ReactNode {
  const value = useMemo(
    () => ({
      fallbackLocale,
      locale,
      t: createTranslationLookup({ catalogs, fallbackLocale, locale }),
    }),
    [catalogs, fallbackLocale, locale],
  );

  return createElement(LocaleContext.Provider, { value }, children);
}
