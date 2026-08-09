import { EmptyState } from '@emme/ui';

export function TenantManagementPage() {
  return <section aria-labelledby="tenant-management-title"><h1 id="tenant-management-title">Tenant management</h1><EmptyState title="No tenants loaded" description="Tenant records will appear after administrator authentication." /></section>;
}
