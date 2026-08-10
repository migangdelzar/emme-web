import { validateFractionDigits } from '../validate-number-options.js';
import type { FormatContext, NumberFormatterOptions } from '../formatters.types.js';

export type CurrencyFormatOptions = Omit<Intl.NumberFormatOptions, 'currency' | 'style'> & {
  locale: string;
  currency: string;
  style?: 'currency';
};

export function formatCurrency(
  value: number,
  context: FormatContext & { currency: string },
  options?: NumberFormatterOptions,
): string;
export function formatCurrency(value: number, options: CurrencyFormatOptions): string;
export function formatCurrency(
  value: number,
  contextOrOptions: (FormatContext & { currency: string }) | CurrencyFormatOptions,
  options?: NumberFormatterOptions,
): string {
  const { locale, currency, ...legacyOptions } = contextOrOptions;
  const numberOptions = options ?? (legacyOptions as NumberFormatterOptions);
  validateFractionDigits(numberOptions);
  return new Intl.NumberFormat(locale, {
    ...numberOptions,
    style: 'currency',
    currency,
  }).format(value);
}
