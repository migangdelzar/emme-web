import { useContext } from 'react';
import { LocaleContext, type LocaleContextValue } from './locale-context.js';

export function useTranslation(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (context === null) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
