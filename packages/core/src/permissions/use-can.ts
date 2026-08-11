import { useContext } from 'react';

import type { Permission } from '../access-control/permissions.js';
import { PermissionContext } from './permission-context.js';

export function useCan(permission: Permission): boolean {
  const context = useContext(PermissionContext);

  if (context === null) {
    throw new Error('useCan must be used within a PermissionProvider');
  }

  return context.can(permission);
}
