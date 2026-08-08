import { validateFractionDigits } from './validate-number-options.js';

export type NumberFormatOptions = Intl.NumberFormatOptions & {
  locale: string;
};

export function formatNumber(value: number, options: NumberFormatOptions): string {
  const { locale, ...numberOptions } = options;
  validateFractionDigits(numberOptions);
  return new Intl.NumberFormat(locale, numberOptions).format(value);
}
