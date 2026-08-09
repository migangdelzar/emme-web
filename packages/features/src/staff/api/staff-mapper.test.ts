import { describe, expect, it } from 'vitest';
import { mapStaffPayload } from './index.js';

const payload = {
  id: 'staff-1',
  tenantId: 'tenant-1',
  name: 'Artist',
  role: 'artist',
  isActive: true,
};

describe('mapStaffPayload', () => {
  it('rejects unknown staff roles', () => {
    expect(() => mapStaffPayload({ ...payload, role: 'unknown' })).toThrow(/role/i);
  });
});
