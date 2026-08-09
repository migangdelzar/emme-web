export type { TenantConfigurationRepository } from './ports.js';
import { validateTenantConfiguration, type TenantConfiguration } from '../domain/index.js';
import type { TenantConfigurationRepository } from './ports.js';
export function updateTenantConfiguration(repository: TenantConfigurationRepository) { return (value: TenantConfiguration) => repository.save(validateTenantConfiguration(value)); }
