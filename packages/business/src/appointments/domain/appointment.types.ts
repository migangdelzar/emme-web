import type { AppointmentStatus } from './appointment-status.js';

export interface Appointment {
  id: string;
  clientId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  tenantId?: string;
  customerName?: string;
  notes?: string;
}
