export interface TenantRequestContext {
  readonly tenantId: string;
}

export function createTenantRequestContext(tenantId: string): TenantRequestContext {
  if (tenantId.trim().length === 0) {
    throw new Error('Tenant ID is required');
  }

  return { tenantId };
}
