import { describe, expect, it } from 'vitest';
import { createMetricRange } from './index.js';
describe('analytics domain', () => { it('requires tenant-scoped ordered ranges', () => { expect(createMetricRange({ tenantId: 'tenant-1', from: '2026-01-01', to: '2026-01-31', timezone: 'UTC' }).tenantId).toBe('tenant-1'); expect(() => createMetricRange({ tenantId: 'tenant-1', from: '2026-02-01', to: '2026-01-01', timezone: 'UTC' })).toThrow(); }); });
