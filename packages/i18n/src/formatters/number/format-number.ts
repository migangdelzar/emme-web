import { validateFractionDigits } from '../validate-number-options.js';
import type { FormatContext, NumberFormatterOptions } from '../formatters.types.js';

export type NumberFormatOptions = Intl.NumberFormatOptions & {
  locale: string;
};

export function formatNumber(
  value: number,
  context: FormatContext,
  options?: NumberFormatterOptions,
): string;
export function formatNumber(value: number, options: NumberFormatOptions): string;
export function formatNumber(
  value: number,
  contextOrOptions: FormatContext | NumberFormatOptions,
  options?: NumberFormatterOptions,
): string {
  const { locale, ...legacyOptions } = contextOrOptions;
  const numberOptions = options ?? legacyOptions;
  validateFractionDigits(numberOptions);
  return new Intl.NumberFormat(locale, numberOptions).format(value);
}
