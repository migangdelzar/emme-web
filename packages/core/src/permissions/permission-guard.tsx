import type { ReactNode } from 'react';

import type { Permission } from '../access-control/permissions.js';
import { useCan } from './use-can.js';

export interface PermissionGuardProps {
  readonly permission: Permission;
  readonly children?: ReactNode;
  readonly fallback?: ReactNode;
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps): ReactNode {
  return useCan(permission) ? children : fallback;
}
