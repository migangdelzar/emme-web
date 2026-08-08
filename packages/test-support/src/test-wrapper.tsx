import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ComponentType, PropsWithChildren, ReactNode } from 'react';
import {
  AuthProvider,
  TenantProvider,
  type AuthContextValue,
  type TenantContext,
} from '@emme/core';
import { I18nTestProvider, type Locale } from '@emme/i18n';
import { createFakeAuthState } from './mock-auth.js';
import { createFakeTenant } from './mock-tenancy.js';

export interface TestWrapperOptions {
  readonly auth?: Partial<AuthContextValue>;
  readonly tenant?: Partial<TenantContext>;
  readonly locale?: Locale;
}

export function createTestWrapper(
  options: TestWrapperOptions = {},
): ComponentType<PropsWithChildren> {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const auth = createFakeAuthState(options.auth);
  const tenant = createFakeTenant(options.tenant);
  const locale = options.locale ?? 'en-US';

  return function TestWrapper({ children }: PropsWithChildren): ReactNode {
    return (
      <QueryClientProvider client={queryClient}>
        <I18nTestProvider locale={locale}>
          <AuthProvider value={auth}>
            <TenantProvider value={tenant}>{children}</TenantProvider>
          </AuthProvider>
        </I18nTestProvider>
      </QueryClientProvider>
    );
  };
}
