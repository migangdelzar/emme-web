import type { ComponentType, PropsWithChildren, ReactNode } from 'react';

import { I18nTestProvider, type Locale } from '@emme/i18n';
import { createTestQueryClient, TestQueryProvider } from './test-query-provider.js';
import { TestAuthProvider } from './test-auth-provider.js';
import { TestTenancyProvider } from './test-tenancy-provider.js';

export interface TestWrapperOptions {
  readonly auth?: Parameters<typeof TestAuthProvider>[0]['value'];
  readonly tenant?: Parameters<typeof TestTenancyProvider>[0]['value'];
  readonly locale?: Locale;
}

export function createTestWrapper(
  options: TestWrapperOptions = {},
): ComponentType<PropsWithChildren> {
  const queryClient = createTestQueryClient();
  const locale = options.locale ?? 'en-US';

  return function TestWrapper({ children }: PropsWithChildren): ReactNode {
    return (
      <TestQueryProvider client={queryClient}>
        <I18nTestProvider locale={locale}>
          <TestAuthProvider value={options.auth}>
            <TestTenancyProvider value={options.tenant}>{children}</TestTenancyProvider>
          </TestAuthProvider>
        </I18nTestProvider>
      </TestQueryProvider>
    );
  };
}
