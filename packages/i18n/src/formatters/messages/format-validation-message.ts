import { readPath, translations, type Locale } from '../../translation-catalog.js';
import type { FormatContext } from '../formatters.types.js';

export function formatValidationMessage(
  code: string,
  context: FormatContext,
  fallbackMessage = code,
): string {
  const locale = context.locale as Locale;
  const value = readPath(translations[locale], `validation.${code}`);
  return typeof value === 'string' ? value : fallbackMessage;
}
