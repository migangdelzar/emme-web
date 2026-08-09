import { describe, expect, it } from 'vitest';
import { validateTenantConfiguration } from './index.js';
const config = { tenantId: 'tenant-1', businessName: 'Studio', timezone: 'America/Mexico_City', hours: [{ day: 1, startTime: '09:00', endTime: '17:00', active: true }], cancellationNoticeHours: 24, advanceBookingDays: 30 };
describe('tenant configuration domain', () => { it('accepts valid policy and hours', () => { expect(validateTenantConfiguration(config)).toEqual(config); }); it('rejects invalid hours and policies', () => { expect(() => validateTenantConfiguration({ ...config, advanceBookingDays: 0 })).toThrow(); expect(() => validateTenantConfiguration({ ...config, hours: [{ ...config.hours[0], startTime: '18:00' }] })).toThrow(); }); });
