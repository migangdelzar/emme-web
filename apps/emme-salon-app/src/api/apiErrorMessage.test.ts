import { describe, expect, it } from 'vitest';
import { ApiHttpError } from '@emme/api-client';
import { apiErrorMessage } from './apiErrorMessage';

describe('apiErrorMessage', () => {
  const translate = (key: string) => `translated:${key}`;

  it('maps a known backend problem code to a localized message key', () => {
    const error = new ApiHttpError('Conflict', 409, { code: 'CALENDAR_SYNC_CONFLICT' });

    expect(apiErrorMessage(error, translate, 'common.errors.calendar_sync_failed')).toBe(
      'translated:common.errors.calendar_sync_conflict'
    );
  });

  it('uses the feature fallback for unknown backend problem codes', () => {
    const error = new ApiHttpError('Failure', 500, { code: 'UNKNOWN_CODE' });

    expect(apiErrorMessage(error, translate, 'common.errors.sheets_export_failed')).toBe(
      'translated:common.errors.sheets_export_failed'
    );
  });
});
