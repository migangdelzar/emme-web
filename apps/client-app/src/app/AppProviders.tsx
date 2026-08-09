import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiProvider, SessionProvider } from '@emme/core';
import { createApi } from '@emme/api';
import { createBrowserStorage, createHttpClient, createTokenStorage } from '@emme/infrastructure';
import { I18nProvider } from '@emme/i18n';
const queryClient = new QueryClient();
export function AppProviders({ children }: { readonly children: ReactNode }) {
  const storage = createBrowserStorage();
  const tokens = createTokenStorage({ getItem: storage.get, setItem: storage.set, removeItem: storage.remove });
  const http = createHttpClient({ baseUrl: '', getAccessToken: () => tokens.get().accessToken, getTenantSlug: () => storage.get('tenant_slug') });
  return <ApiProvider api={createApi(http)}><QueryClientProvider client={queryClient}><I18nProvider locale="en-US"><SessionProvider tokenStorage={tokens} tenantStorage={storage}>{children}</SessionProvider></I18nProvider></QueryClientProvider></ApiProvider>;
}
