import { describe, expect, it } from 'vitest';

import { createRuntimeContracts } from './runtime-contracts.js';

describe('createRuntimeContracts', () => {
  it('requires an explicit tenant and permission source', () => {
    const runtime = createRuntimeContracts({
      tenantId: 'tenant-1',
      permissions: ['appointments:view'],
    });

    expect(runtime.tenant.id).toBe('tenant-1');
    expect(runtime.can('appointments:view')).toBe(true);
    expect(runtime.can('appointments:edit')).toBe(false);
  });

  it('evaluates injected feature flags and logger calls', () => {
    const messages: string[] = [];
    const runtime = createRuntimeContracts({
      tenantId: 'tenant-1',
      permissions: [],
      featureFlags: ['new-calendar'],
      logger: { info: (message) => messages.push(message) },
    });

    runtime.logger.info('loaded');
    expect(runtime.isFeatureEnabled('new-calendar')).toBe(true);
    expect(runtime.isFeatureEnabled('legacy-calendar')).toBe(false);
    expect(messages).toEqual(['loaded']);
  });
});
