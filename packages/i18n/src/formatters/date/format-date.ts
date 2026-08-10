import { normalizeDate } from '../normalize-date.js';
import type { DateFormatterOptions, FormatContext } from '../formatters.types.js';

export type DateFormatOptions = Intl.DateTimeFormatOptions & {
  locale: string;
};

export function formatDate(
  value: Date | string | number,
  context: FormatContext,
  options?: DateFormatterOptions,
): string;
export function formatDate(value: Date | string | number, options: DateFormatOptions): string;
export function formatDate(
  value: Date | string | number,
  contextOrOptions: FormatContext | DateFormatOptions,
  options?: DateFormatterOptions,
): string {
  const { locale, timeZone, ...legacyOptions } = contextOrOptions;
  const dateTimeOptions = options ?? legacyOptions;

  return new Intl.DateTimeFormat(locale, {
    ...dateTimeOptions,
    ...(timeZone ? { timeZone } : {}),
  }).format(normalizeDate(value));
}
