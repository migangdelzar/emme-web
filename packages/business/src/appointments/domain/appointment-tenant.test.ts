import { describe, expect, it } from 'vitest';

import { assertAppointmentTenant } from './appointment-tenant.js';
import { AppointmentTenantMismatchError } from './appointment-errors.js';

describe('assertAppointmentTenant', () => {
  it('accepts an appointment for the active tenant', () => {
    expect(() => assertAppointmentTenant({ tenantId: 'tenant-1' }, 'tenant-1')).not.toThrow();
  });

  it('rejects an appointment from another tenant', () => {
    expect(() => assertAppointmentTenant({ tenantId: 'tenant-2' }, 'tenant-1')).toThrow(
      AppointmentTenantMismatchError
    );
  });

  it('rejects an appointment without tenant identity', () => {
    expect(() => assertAppointmentTenant({}, 'tenant-1')).toThrow(AppointmentTenantMismatchError);
  });
});
