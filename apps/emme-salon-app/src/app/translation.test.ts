import { describe, expect, it } from 'vitest';
import { getResources, t } from '@emme/i18n';

describe('application translation catalog contract', () => {
  it('resolves nested keys from the Clara-style translation resource shape', () => {
    expect(t('common.dashboard', 'en-US')).toBe('Dashboard');
    expect(t('dashboard.incomeToday', 'es-MX')).toBe('Ingresos hoy');
    expect(getResources()['en-US'].translation.dashboard.incomeToday).toBe('Income today');
  });
});
