import type { ReactNode } from 'react';
import { useAuth } from '@emme/core';

export interface AuthGateProps {
  readonly children: ReactNode;
  readonly loadingFallback?: ReactNode;
  readonly signedOutFallback?: ReactNode;
  readonly tenantRequiredFallback?: ReactNode;
}

export function AuthGate({
  children,
  loadingFallback,
  signedOutFallback,
  tenantRequiredFallback,
}: AuthGateProps) {
  const { status } = useAuth();

  if (status === 'loading') {
    return loadingFallback ?? <div role="status">Loading authentication</div>;
  }

  if (status === 'signedOut') {
    return signedOutFallback ?? <div role="status">Authentication required</div>;
  }

  if (status === 'tenantRequired') {
    return tenantRequiredFallback ?? <div role="status">Tenant selection required</div>;
  }

  return <>{children}</>;
}
