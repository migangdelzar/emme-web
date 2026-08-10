import { useMemo } from 'react';
import { useTranslation as useSharedTranslation } from './use-translation.js';
import type { TranslationKey } from './translation-catalog.js';
import { setApplicationLocale } from './application-i18n.js';
import { normalizeLocale } from './locale.js';

/**
 * Application translation boundary.
 *
 * Components use catalog paths instead of legacy namespace syntax or inline
 * user-facing copy. The key type is derived from the shared locale catalog.
 */
export function useAppTranslation() {
  const { locale, t: translate } = useSharedTranslation();
  const t = (key: TranslationKey, defaultValue?: string): string => {
    const translated = translate(key);
    return translated === key && defaultValue !== undefined ? defaultValue : translated;
  };
  const i18n = useMemo(
    () => ({
      language: locale,
      changeLanguage: (nextLocale: string) => setApplicationLocale(normalizeLocale(nextLocale)),
    }),
    [locale]
  );

  return { t, i18n };
}
