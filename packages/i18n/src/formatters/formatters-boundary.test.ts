import { describe, expect, it } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatRelativeTime,
  formatTime,
} from './index.js';

describe('grouped presentation formatter API', () => {
  it('accepts explicit format context and formatter options separately', () => {
    expect(
      formatDate(
        '2025-01-15T12:30:45.000Z',
        { locale: 'en-US', timeZone: 'UTC' },
        { dateStyle: 'long' },
      ),
    ).toBe('January 15, 2025');

    expect(
      formatTime(
        '2025-01-15T12:30:45.000Z',
        { locale: 'en-US', timeZone: 'America/New_York' },
        { timeStyle: 'short' },
      ),
    ).toBe('7:30 AM');

    expect(
      formatCurrency(1234.5, { locale: 'en-US', currency: 'USD' }),
    ).toBe('$1,234.50');

    expect(
      formatNumber(1234.567, { locale: 'en-US' }, { maximumFractionDigits: 2 }),
    ).toBe('1,234.57');
  });

  it('formats relative time against an explicit current time', () => {
    expect(
      formatRelativeTime(
        '2025-01-15T11:30:45.000Z',
        { locale: 'en-US', timeZone: 'UTC' },
        new Date('2025-01-15T12:30:45.000Z'),
      ),
    ).toBe('1 hour ago');
  });
});
