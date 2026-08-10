import type { ReactNode } from 'react';

import { TenantProvider, type TenantContext } from '@emme/core';
import { createTenantFixture } from '../fixtures/tenant.fixture.js';

export interface TestTenancyProviderProps {
  readonly children?: ReactNode;
  readonly value?: Partial<TenantContext>;
}

export function TestTenancyProvider({ children, value }: TestTenancyProviderProps): ReactNode {
  return <TenantProvider value={createTenantFixture(value)}>{children}</TenantProvider>;
}
