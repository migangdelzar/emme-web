import { normalizeDate } from './normalize-date.js';

export type DateFormatOptions = Intl.DateTimeFormatOptions & {
  locale: string;
};

export function formatDate(value: Date | string, options: DateFormatOptions): string {
  const { locale, ...dateTimeOptions } = options;
  return new Intl.DateTimeFormat(locale, dateTimeOptions).format(normalizeDate(value));
}
