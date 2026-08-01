import type { Locale } from '@emme/i18n';

export const SUPPORTED_LOCALES = ['en-US', 'es-MX'] as const satisfies readonly Locale[];
export const LOCALE_PREFERENCE_STORAGE_KEY = 'emme.locale';

export interface LocaleStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const supportedLocales = new Set<Locale>(SUPPORTED_LOCALES);

function normalized(value: string | undefined): string {
  return value?.trim().replace('_', '-').toLowerCase() ?? '';
}

export function normalizeLocale(value: string | undefined): Locale {
  return normalized(value) === 'es' || normalized(value) === 'es-mx' ? 'es-MX' : 'en-US';
}

function isSupportedPreference(value: string | undefined): boolean {
  const candidate = normalized(value);
  return candidate === 'en' || candidate === 'en-us' || candidate === 'es' || candidate === 'es-mx';
}

export function detectLocale(languages: readonly string[] = browserLanguages()): Locale {
  for (const language of languages) {
    if (isSupportedPreference(language)) {
      const locale = normalizeLocale(language);
      if (supportedLocales.has(locale)) return locale;
    }
  }
  return 'en-US';
}

function browserLanguages(): readonly string[] {
  if (typeof navigator === 'undefined') return [];
  return navigator.languages?.length ? navigator.languages : [navigator.language];
}

function browserStorage(): LocaleStorage | undefined {
  return typeof window === 'undefined' ? undefined : window.localStorage;
}

export function getInitialLocale(
  storage: Pick<LocaleStorage, 'getItem'> | undefined = browserStorage(),
  languages?: readonly string[],
): Locale {
  const savedLocale = storage?.getItem(LOCALE_PREFERENCE_STORAGE_KEY);
  if (savedLocale && isSupportedPreference(savedLocale)) return normalizeLocale(savedLocale);
  return detectLocale(languages ?? browserLanguages());
}

export function persistLocale(
  locale: Locale,
  storage: Pick<LocaleStorage, 'setItem'> | undefined = browserStorage(),
): void {
  storage?.setItem(LOCALE_PREFERENCE_STORAGE_KEY, locale);
}
