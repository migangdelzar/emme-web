export type AppointmentDtoStatus = 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface AppointmentDto {
  id: string;
  customerId: string;
  serviceId: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentDtoStatus;
  notes?: string;
  customerName?: string;
}
