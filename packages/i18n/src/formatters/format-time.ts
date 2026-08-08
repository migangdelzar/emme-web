import { normalizeDate } from './normalize-date.js';

export type TimeFormatOptions = Intl.DateTimeFormatOptions & {
  locale: string;
};

export function formatTime(value: Date | string, options: TimeFormatOptions): string {
  const { locale, ...dateTimeOptions } = options;
  return new Intl.DateTimeFormat(locale, dateTimeOptions).format(normalizeDate(value));
}
