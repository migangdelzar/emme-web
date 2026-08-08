import { createContext } from 'react';
import type { Locale, TranslationKey } from './index';

export type TranslationLookup = (key: TranslationKey) => string;

export interface LocaleContextValue {
  readonly fallbackLocale: Locale;
  readonly locale: Locale;
  readonly t: TranslationLookup;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);
