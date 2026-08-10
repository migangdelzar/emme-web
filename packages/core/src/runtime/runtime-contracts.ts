import { can, type Permission } from '../access-control/permissions.js';

export interface Logger {
  info(message: string, context?: Readonly<Record<string, unknown>>): void;
  warn?(message: string, context?: Readonly<Record<string, unknown>>): void;
  error?(message: string, context?: Readonly<Record<string, unknown>>): void;
}

export interface RuntimeContractsInput {
  readonly tenantId: string;
  readonly permissions: readonly Permission[];
  readonly featureFlags?: readonly string[];
  readonly logger?: Logger;
}

export interface RuntimeContracts {
  readonly tenant: { readonly id: string };
  readonly permissions: readonly Permission[];
  readonly logger: Logger;
  can(permission: Permission): boolean;
  isFeatureEnabled(flag: string): boolean;
}

const noopLogger: Logger = {
  info: () => undefined,
};

export function createRuntimeContracts(input: RuntimeContractsInput): RuntimeContracts {
  const featureFlags = new Set(input.featureFlags ?? []);
  const logger = input.logger ?? noopLogger;

  return {
    tenant: { id: input.tenantId },
    permissions: input.permissions,
    logger,
    can: (permission) => can(input.permissions, permission),
    isFeatureEnabled: (flag) => featureFlags.has(flag),
  };
}
