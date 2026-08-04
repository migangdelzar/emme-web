import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/restClient';
import { createAppointmentApi, type Appointment as ContractAppointment } from '@emme/contracts';
import { createMutationOptions, createQueryResource, createResourceKey } from '@/api/queryFactory';

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

const appointmentsContract = createAppointmentApi(api);

function mapContractAppointment(raw: ContractAppointment): Appointment {
  return {
    ...raw,
    customerName: raw.customerName ?? '',
  };
}

const APPOINTMENTS_KEY = createResourceKey('appointments');

const appointmentsResource = createQueryResource<
  AppointmentListParams,
  AppointmentListResponse,
  'appointments'
>({
  key: 'appointments',
  queryKey: (params) => [...APPOINTMENTS_KEY, 'list', params],
  queryFn: async (params) => ({
    appointments: (await appointmentsContract.list(params)).map(mapContractAppointment),
  }),
});

export function useAppointmentsRest(date?: string) {
  return useQuery(appointmentsResource.listOptions({ date }));
}

export function useCreateAppointmentRest() {
  const queryClient = useQueryClient();
  return useMutation(
    createMutationOptions(
      {
        key: 'appointments',
        mutationFn: (input: CreateAppointmentInput) => {
          const [date, startTimeWithSeconds] = input.startTime.split('T');
          const [, endTimeWithSeconds] = input.endTime.split('T');
          return appointmentsContract.create({
            clientId: input.clientId ?? '',
            serviceId: input.serviceId ?? '',
            artistId: input.artistId,
            date,
            startTime: startTimeWithSeconds?.slice(0, 5) ?? input.startTime,
            endTime: endTimeWithSeconds?.slice(0, 5) ?? input.endTime,
            status: 'pending',
          });
        },
      },
      queryClient
    )
  );
}

export function useCancelAppointmentRest() {
  const queryClient = useQueryClient();
  return useMutation(
    createMutationOptions(
      {
        key: 'appointments',
        mutationFn: (id: string) => appointmentsContract.cancel(id),
      },
      queryClient
    )
  );
}
