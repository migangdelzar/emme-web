import { normalizeDate } from '../normalize-date.js';
import type { DateFormatterOptions, FormatContext } from '../formatters.types.js';

export type TimeFormatOptions = Intl.DateTimeFormatOptions & {
  locale: string;
};

export function formatTime(
  value: Date | string | number,
  context: FormatContext,
  options?: DateFormatterOptions,
): string;
export function formatTime(value: Date | string | number, options: TimeFormatOptions): string;
export function formatTime(
  value: Date | string | number,
  contextOrOptions: FormatContext | TimeFormatOptions,
  options?: DateFormatterOptions,
): string {
  const { locale, timeZone, ...legacyOptions } = contextOrOptions;
  const dateTimeOptions = options ?? legacyOptions;

  return new Intl.DateTimeFormat(locale, {
    ...dateTimeOptions,
    ...(timeZone ? { timeZone } : {}),
  }).format(normalizeDate(value));
}
