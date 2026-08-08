import { useContext } from 'react';
import { TenantContextValue } from './tenant-context.js';
import type { TenantContext } from './tenant.types.js';

export function useCurrentTenant(): TenantContext {
  const tenant = useContext(TenantContextValue);

  if (tenant === null) {
    throw new Error('useCurrentTenant must be used within a TenantProvider');
  }

  return tenant;
}
