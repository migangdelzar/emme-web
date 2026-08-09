import type { TenantConfiguration } from '../domain/index.js';
export interface TenantConfigurationRepository { load(tenantId: string): Promise<TenantConfiguration>; save(config: TenantConfiguration): Promise<TenantConfiguration>; }
