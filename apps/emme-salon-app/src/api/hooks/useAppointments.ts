import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/restClient';
import {
  createMutationOptions,
  createQueryResource,
  createResourceKey,
} from '@/api/queryFactory';
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

interface AppointmentListParams {
  date?: string;
}

export interface CreateAppointmentInput {
  clientId?: string;
  serviceId?: string;
  artistId?: string;
  startTime: string;
  endTime: string;
}

const APPOINTMENTS_KEY = createResourceKey('appointments');

const appointmentsResource = createQueryResource<AppointmentListParams, AppointmentListResponse, 'appointments'>({
  key: 'appointments',
  queryKey: (params) => [...APPOINTMENTS_KEY, 'list', params],
  queryFn: async (params) => ({
      appointments: (await api.get<AppointmentApiResponse[]>(
        '/api/appointments',
        params.date ? { date: params.date } : undefined,
      )).map(mapAppointmentApiResponse),
    }),
});

export function useAppointmentsRest(date?: string) {
  return useQuery(appointmentsResource.listOptions({ date }));
}

export function useCreateAppointmentRest() {
  const queryClient = useQueryClient();
  return useMutation(createMutationOptions({
    key: 'appointments',
    mutationFn: (input: CreateAppointmentInput) => api.post<AppointmentApiResponse>(
      '/api/appointments',
      {
        customerId: input.clientId,
        serviceId: input.serviceId,
        artistId: input.artistId,
        startsAt: input.startTime,
        endsAt: input.endTime,
      },
    ),
  }, queryClient));
}

export function useCancelAppointmentRest() {
  const queryClient = useQueryClient();
  return useMutation(createMutationOptions({
    key: 'appointments',
    mutationFn: (id: string) =>
      api.post(`/api/appointments/${id}/cancel`),
  }, queryClient));
}
