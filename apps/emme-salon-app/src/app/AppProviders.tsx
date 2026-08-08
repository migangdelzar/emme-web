import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';

import { AuthProvider } from './auth/AuthProvider';
import { BusinessProfileProvider } from '@/features/settings/context/BusinessProfileContext';
import { ErrorBoundary } from './error-boundary/AppErrorBoundary';
import { TooltipProvider } from '@emme/ui';
import { Toaster } from '@/shared/ui/sonner';

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
