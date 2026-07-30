import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/restClient';
import { mapAppointmentApiResponse, type AppointmentApiResponse } from './salonApiAdapters';

export interface Appointment {
  id: string;
  tenantId?: string;
  customerName: string;
  clientId?: string | null;
  serviceId?: string | null;
  startTime: string;
  endTime: string;
  status: string;
}

interface AppointmentListResponse {
  appointments: Appointment[];
}

export interface CreateAppointmentInput {
  clientId?: string;
  serviceId?: string;
  artistId?: string;
  startTime: string;
  endTime: string;
}

export function useAppointmentsRest(date?: string) {
  return useQuery<AppointmentListResponse>({
    queryKey: ['appointments', { date }],
    queryFn: async () => ({
      appointments: (await api.get<AppointmentApiResponse[]>(
        '/api/v1/appointments',
        date ? { date } : undefined,
      )).map(mapAppointmentApiResponse),
    }),
  });
}

export function useCreateAppointmentRest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAppointmentInput) => api.post<AppointmentApiResponse>(
      '/api/v1/appointments',
      {
        customerId: input.clientId,
        serviceId: input.serviceId,
        artistId: input.artistId,
        startsAt: input.startTime,
        endsAt: input.endTime,
      },
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useCancelAppointmentRest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post(`/api/v1/appointments/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}
