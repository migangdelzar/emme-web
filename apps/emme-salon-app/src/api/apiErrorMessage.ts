import { ApiHttpError } from '@emme/api-client';
import type { TranslationKey } from '@emme/i18n';

const API_ERROR_TRANSLATIONS: Record<string, TranslationKey> = {
  CALENDAR_SYNC_CONFLICT: 'common.errors.calendar_sync_conflict',
  GOOGLE_OAUTH_FAILED: 'common.errors.google_oauth_failed',
  SHEETS_EXPORT_FAILED: 'common.errors.sheets_export_failed',
};

export function apiErrorMessage(
  error: unknown,
  translate: (key: string) => string,
  fallback: TranslationKey
): string {
  if (error instanceof ApiHttpError && error.code) {
    const translationKey = API_ERROR_TRANSLATIONS[error.code];
    if (translationKey) return translate(translationKey);
  }

  return translate(fallback);
}
