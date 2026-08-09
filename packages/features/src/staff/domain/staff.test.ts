import { describe, expect, it } from 'vitest';
import { createAvailabilityRange, isStaffBookable } from './index.js';
const staff = { id: 'staff-1', tenantId: 'tenant-1', name: 'Artist', role: 'artist' as const, isActive: true };
describe('staff domain', () => {
  it('limits bookability to active staff', () => { expect(isStaffBookable(staff)).toBe(true); expect(isStaffBookable({ ...staff, isActive: false })).toBe(false); });
  it('rejects invalid availability ranges', () => { expect(createAvailabilityRange('09:00', '17:00')).toEqual({ startTime: '09:00', endTime: '17:00' }); expect(() => createAvailabilityRange('17:00', '09:00')).toThrow(); });
});
