import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getResources, type Locale } from '@emme/i18n';
import { getInitialLocale, persistLocale } from './app/locale';

export const NAMESPACES = ['translation'] as const;

const DEFAULT_LOCALE: Locale = 'es-MX';

function synchronizeDocumentLanguage(locale: string): void {
  if (typeof document !== 'undefined') document.documentElement.lang = locale;
}

const initialLocale = getInitialLocale();
synchronizeDocumentLanguage(initialLocale);
i18n.on('languageChanged', synchronizeDocumentLanguage);

i18n.use(initReactI18next).init({
  resources: getResources(),
  lng: initialLocale,
  fallbackLng: DEFAULT_LOCALE,
  ns: NAMESPACES as unknown as string[],
  defaultNS: 'translation',
  fallbackNS: 'translation',
  debug: false,
  interpolation: { escapeValue: false },
  partialBundledLanguages: true,
  returnObjects: true,
  returnNull: false,
});

export async function setApplicationLocale(locale: Locale): Promise<void> {
  persistLocale(locale);
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

export default i18n;
