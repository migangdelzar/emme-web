import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from '@emme/i18n';

export const NAMESPACES = ['common', 'dashboard', 'appointments', 'clients', 'services', 'finances', 'settings', 'auth'] as const;

const DEFAULT_LOCALE = 'es-MX';

const i18nBackend = {
  type: 'backend' as const,
  init() {},
  read(locale: string, namespace: string, callback: Function) {
    try {
      const all = (translations as Record<string, any>)[locale] || translations[DEFAULT_LOCALE];
      // Return namespace-specific portion (e.g., namespace "nav" → all.nav)
      callback(null, all[namespace] || all);
    } catch {
      callback(null, null);
    }
  },
};

i18n
  .use(i18nBackend)
  .use(initReactI18next)
  .init({
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    ns: NAMESPACES as unknown as string[],
    defaultNS: 'common',
    fallbackNS: 'common',
    debug: false,
    interpolation: { escapeValue: false },
    partialBundledLanguages: true,
    returnObjects: true,
    returnNull: false,
  });

export async function changeLanguage(locale: string): Promise<void> {
  await i18n.changeLanguage(locale);
  document.documentElement.lang = locale;
}

export function getAvailableLocales() {
  return [
    { code: 'es-MX', name: 'Español (México)', flag: '🇲🇽' },
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  ];
}

export default i18n;
