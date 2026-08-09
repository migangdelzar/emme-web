import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

export interface TestQueryProviderProps {
  readonly children?: ReactNode;
  readonly client?: QueryClient;
}

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

export function TestQueryProvider({
  children,
  client = createTestQueryClient(),
}: TestQueryProviderProps): ReactNode {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
