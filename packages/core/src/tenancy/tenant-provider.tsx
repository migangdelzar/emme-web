import { type ReactNode } from 'react';
import { TenantContextValue } from './tenant-context.js';
import type { TenantContext } from './tenant.types.js';

export interface TenantProviderProps {
  readonly value: TenantContext;
  readonly children?: ReactNode;
}

export function TenantProvider({ value, children }: TenantProviderProps): ReactNode {
  return <TenantContextValue.Provider value={value}>{children}</TenantContextValue.Provider>;
}
