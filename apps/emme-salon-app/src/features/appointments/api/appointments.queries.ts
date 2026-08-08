import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@emme/core';
import type { Appointment as ContractAppointment } from '@emme/api';
import { createMutationOptions, createResourceKey } from '@/api/queryFactory';

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
  status?: ContractAppointment['status'];
  notes?: string;
}

function mapContractAppointment(raw: ContractAppointment): Appointment {
  return {
    ...raw,
    customerName: raw.customerName ?? '',
  };
}

const APPOINTMENTS_KEY = createResourceKey('appointments');

export function useAppointmentsRest(date?: string) {
  const api = useApi();
  const params: AppointmentListParams = { date };

  return useQuery<AppointmentListResponse>({
    queryKey: [...APPOINTMENTS_KEY, 'list', params],
    queryFn: async () => ({
      appointments: (await api.appointments.list(params)).map(mapContractAppointment),
    }),
  });
}

export function useCreateAppointmentRest() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation(
    createMutationOptions(
      {
        key: 'appointments',
        mutationFn: (input: CreateAppointmentInput) => {
          const [date, startTimeWithSeconds] = input.startTime.split('T');
          const [, endTimeWithSeconds] = input.endTime.split('T');
          return api.appointments.create({
            clientId: input.clientId ?? '',
            serviceId: input.serviceId ?? '',
            artistId: input.artistId,
            date,
            startTime: startTimeWithSeconds?.slice(0, 5) ?? input.startTime,
            endTime: endTimeWithSeconds?.slice(0, 5) ?? input.endTime,
            status: input.status ?? 'pending',
            notes: input.notes,
          });
        },
      },
      queryClient
    )
  );
}

export function useCancelAppointmentRest() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation(
    createMutationOptions(
      { key: 'appointments', mutationFn: (id: string) => api.appointments.cancel(id) },
      queryClient
    )
  );
}

export function useConfirmAppointmentRest() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation(
    createMutationOptions(
      { key: 'appointments', mutationFn: (id: string) => api.appointments.confirm(id) },
      queryClient
    )
  );
}

export function useStartAppointmentRest() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation(
    createMutationOptions(
      { key: 'appointments', mutationFn: (id: string) => api.appointments.start(id) },
      queryClient
    )
  );
}

export function useCompleteAppointmentRest() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation(
    createMutationOptions(
      { key: 'appointments', mutationFn: (id: string) => api.appointments.complete(id) },
      queryClient
    )
  );
}

export function useMarkNoShowAppointmentRest() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation(
    createMutationOptions(
      { key: 'appointments', mutationFn: (id: string) => api.appointments.markNoShow(id) },
      queryClient
    )
  );
}

export function useRescheduleAppointmentRest() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation(
    createMutationOptions(
      {
        key: 'appointments',
        mutationFn: ({
          id,
          newStartsAt,
          newEndsAt,
        }: {
          id: string;
          newStartsAt: string;
          newEndsAt: string;
        }) => api.appointments.reschedule(id, newStartsAt, newEndsAt),
      },
      queryClient
    )
  );
}
