export interface FormatContext {
  readonly locale: string;
  readonly timeZone?: string;
  readonly currency?: string;
}

export type DateFormatterOptions = Omit<Intl.DateTimeFormatOptions, 'timeZone'>;
export type NumberFormatterOptions = Omit<Intl.NumberFormatOptions, 'style' | 'currency'>;
