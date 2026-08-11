import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDate, formatNumber, formatTime } from '../index.js';

describe('locale-aware presentation formatters', () => {
  const instant = '2025-01-15T12:30:45.000Z';

  it('formats dates for en-US and es-MX using the supplied time zone', () => {
    expect(formatDate(instant, { locale: 'en-US', timeZone: 'UTC', dateStyle: 'long' })).toBe(
      'January 15, 2025',
    );
    expect(formatDate(instant, { locale: 'es-MX', timeZone: 'UTC', dateStyle: 'long' })).toBe(
      '15 de enero de 2025',
    );
    expect(formatDate(new Date(instant), { locale: 'en-US', timeZone: 'America/Los_Angeles', dateStyle: 'short' })).toBe(
      '1/15/25',
    );
  });

  it('formats times in the supplied time zone', () => {
    expect(formatTime(instant, { locale: 'en-US', timeZone: 'America/New_York', timeStyle: 'short' })).toBe(
      '7:30 AM',
    );
    expect(formatTime(instant, { locale: 'es-MX', timeZone: 'America/Mexico_City', timeStyle: 'short' })).toBe(
      '6:30 a.m.',
    );
  });

  it('formats currencies using the supplied locale and currency', () => {
    expect(formatCurrency(1234.5, { locale: 'en-US', currency: 'USD' })).toBe('$1,234.50');
    expect(formatCurrency(1234.5, { locale: 'es-MX', currency: 'MXN' })).toBe('$1,234.50');
    expect(formatCurrency(1234.5, { locale: 'en-US', currency: 'EUR', currencyDisplay: 'code' })).toBe(
      'EUR 1,234.50',
    );
  });

  it('rounds decimal values according to explicit fraction digit rules', () => {
    expect(
      formatNumber(1234.567, {
        locale: 'en-US',
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }),
    ).toBe('1,234.57');
    expect(
      formatNumber(1234567.5, { locale: 'es-MX', maximumFractionDigits: 0 }),
    ).toBe('1,234,568');
  });

  it('rejects invalid decimal rules deterministically', () => {
    expect(() =>
      formatNumber(1, {
        locale: 'en-US',
        maximumFractionDigits: 1,
        minimumFractionDigits: 2,
      }),
    ).toThrow('maximumFractionDigits must be greater than or equal to minimumFractionDigits.');
  });

  it('throws a deterministic RangeError for invalid dates', () => {
    expect(() => formatDate('not-a-date', { locale: 'en-US', timeZone: 'UTC', dateStyle: 'long' })).toThrow(
      new RangeError('Invalid date value.'),
    );
    expect(() => formatTime(new Date('invalid'), { locale: 'es-MX', timeZone: 'UTC', timeStyle: 'short' })).toThrow(
      new RangeError('Invalid date value.'),
    );
  });
});
