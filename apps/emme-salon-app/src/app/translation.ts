import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { TranslationKey } from '@emme/i18n';

/**
 * Application translation boundary.
 *
 * Components use catalog paths instead of legacy namespace syntax or inline
 * user-facing copy. The key type is derived from the shared locale catalog.
 */
export function useAppTranslation() {
  const { t: translate, i18n } = useTranslation();
  const t = useCallback(
    (key: TranslationKey, defaultValue?: string): string =>
      translate(key, defaultValue === undefined ? undefined : { defaultValue }),
    [translate]
  );

  return { t, i18n };
}
