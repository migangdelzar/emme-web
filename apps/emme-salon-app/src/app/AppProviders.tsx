import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { createApi } from '@emme/api';
import { ApiProvider } from '@emme/core';
import { I18nProvider, type Locale } from '@emme/i18n';
import { api as httpApi } from '@/api/restClient';
import i18n from '@/i18n';

import { AuthProvider } from './auth/AuthProvider';
import { BusinessProfileProvider } from '@/features/settings/context/BusinessProfileContext';
import { ErrorBoundary } from './error-boundary/AppErrorBoundary';
import { TooltipProvider } from '@emme/ui';
import { Toaster } from '@/shared/ui/sonner';
import { getInitialLocale, normalizeLocale } from './locale';

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: ReactNode }) {
  const typedApi = useMemo(() => createApi(httpApi), []);
  const [locale, setLocale] = useState<Locale>(() => getInitialLocale());

  useEffect(() => {
    const handleLanguageChanged = (nextLocale: string) => setLocale(normalizeLocale(nextLocale));
    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  return (
    <ApiProvider api={typedApi}>
      <QueryClientProvider client={queryClient}>
        <I18nProvider locale={locale}>
          <AuthProvider>
            <BusinessProfileProvider>
              <ErrorBoundary>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  <TooltipProvider>
                    {children}
                    <Toaster position="top-center" richColors />
                  </TooltipProvider>
                </ThemeProvider>
              </ErrorBoundary>
            </BusinessProfileProvider>
          </AuthProvider>
        </I18nProvider>
      </QueryClientProvider>
    </ApiProvider>
  );
}
