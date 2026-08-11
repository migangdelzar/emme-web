export interface CreateAppointmentRequest {
  customerId: string;
  serviceId: string;
  artistId?: string;
  startsAt: string;
  endsAt: string;
}
