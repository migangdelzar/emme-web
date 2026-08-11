import { AppointmentTenantMismatchError } from './appointment-errors.js';

export interface AppointmentTenantIdentity {
  readonly tenantId?: string;
}

export function assertAppointmentTenant(
  appointment: AppointmentTenantIdentity,
  tenantId: string
): void {
  if (!tenantId || appointment.tenantId !== tenantId) {
    throw new AppointmentTenantMismatchError(tenantId);
  }
}
