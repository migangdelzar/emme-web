import { getInitialLocale, normalizeLocale, persistLocale } from './app/locale';
import { getResources, type Locale } from '@emme/i18n';

export const NAMESPACES = ['translation'] as const;

type LanguageChangedListener = (locale: Locale) => void;

const listeners = new Set<LanguageChangedListener>();
let currentLocale = getInitialLocale();

function synchronizeDocumentLanguage(locale: Locale): void {
  if (typeof document !== 'undefined') document.documentElement.lang = locale;
}

synchronizeDocumentLanguage(currentLocale);

const i18n = {
  get language(): Locale {
    return currentLocale;
  },
  on(event: 'languageChanged', listener: LanguageChangedListener): void {
    if (event === 'languageChanged') listeners.add(listener);
  },
  off(event: 'languageChanged', listener: LanguageChangedListener): void {
    if (event === 'languageChanged') listeners.delete(listener);
  },
  async changeLanguage(locale: string): Promise<void> {
    const nextLocale = normalizeLocale(locale);
    currentLocale = nextLocale;
    persistLocale(nextLocale);
    synchronizeDocumentLanguage(nextLocale);
    listeners.forEach((listener) => listener(nextLocale));
  },
};

export async function setApplicationLocale(locale: Locale): Promise<void> {
  await i18n.changeLanguage(locale);
}

export async function changeLanguage(locale: Locale): Promise<void> {
  await setApplicationLocale(locale);
}

export function getAvailableLocales(): readonly { code: Locale; name: string; flag: string }[] {
  return [
    { code: 'es-MX', name: 'Español (México)', flag: '🇲🇽' },
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  ];
}

export { getResources };
export default i18n;
