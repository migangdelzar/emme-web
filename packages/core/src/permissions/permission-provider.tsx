import type { ReactNode } from 'react';

import type { Permission } from '../access-control/permissions.js';
import { PermissionContext, createPermissionContext } from './permission-context.js';

export interface PermissionProviderProps {
  readonly permissions: readonly Permission[];
  readonly children?: ReactNode;
}

export function PermissionProvider({ permissions, children }: PermissionProviderProps): ReactNode {
  return (
    <PermissionContext.Provider value={createPermissionContext(permissions)}>
      {children}
    </PermissionContext.Provider>
  );
}
