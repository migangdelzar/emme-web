import type { ReactNode } from 'react';
import { I18nProvider, type I18nProviderProps } from '../i18n-provider.js';

export interface I18nTestProviderProps
  extends Omit<I18nProviderProps, 'children' | 'locale'> {
  readonly children?: ReactNode;
  readonly locale?: I18nProviderProps['locale'];
}

export function I18nTestProvider({
  children,
  locale = 'en-US',
  ...providerOptions
}: I18nTestProviderProps): ReactNode {
  return (
    <I18nProvider {...providerOptions} locale={locale}>
      {children}
    </I18nProvider>
  );
}
