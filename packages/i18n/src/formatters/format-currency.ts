import { validateFractionDigits } from './validate-number-options.js';

export type CurrencyFormatOptions = Omit<Intl.NumberFormatOptions, 'currency' | 'style'> & {
  locale: string;
  currency: string;
  style?: 'currency';
};

export function formatCurrency(value: number, options: CurrencyFormatOptions): string {
  const { locale, currency, ...numberOptions } = options;
  validateFractionDigits(numberOptions);
  return new Intl.NumberFormat(locale, {
    ...numberOptions,
    style: 'currency',
    currency,
  }).format(value);
}
