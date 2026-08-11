import { createContext } from 'react';

import { can, type Permission } from '../access-control/permissions.js';

export interface PermissionContextValue {
  readonly permissions: readonly Permission[];
  can(permission: Permission): boolean;
}

export const PermissionContext = createContext<PermissionContextValue | null>(null);

export function createPermissionContext(permissions: readonly Permission[]): PermissionContextValue {
  return {
    permissions,
    can: (permission) => can(permissions, permission),
  };
}
