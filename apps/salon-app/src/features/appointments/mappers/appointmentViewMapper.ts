import type { Appointment } from '@emme/api';

export interface AppointmentViewInput {
  id: string;
  customerName: string;
  date?: string;
  clientId?: string | null;
  serviceId?: string | null;
  startTime: string;
  endTime: string;
  status: string;
}

export function mapAppointmentView(raw: AppointmentViewInput): Appointment {
  const [derivedDate, startTimeWithMs] = raw.startTime.split('T');
  const [, endTimeWithMs] = raw.endTime.split('T');
  const statusMap: Record<string, Appointment['status']> = {
    SCHEDULED: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
  };

  return {
    id: raw.id,
    clientId: raw.clientId || '',
    serviceId: raw.serviceId || '',
    date: raw.date || derivedDate || '',
    startTime: startTimeWithMs ? startTimeWithMs.substring(0, 5) : raw.startTime,
    endTime: endTimeWithMs ? endTimeWithMs.substring(0, 5) : raw.endTime,
    status: statusMap[raw.status.toUpperCase()] || 'pending',
  };
}
