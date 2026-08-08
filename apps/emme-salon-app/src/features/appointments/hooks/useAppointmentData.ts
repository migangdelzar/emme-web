import { useMemo, useCallback } from 'react';
import {
  useAppointmentsRest,
  useCreateAppointmentRest,
  useCancelAppointmentRest,
  useConfirmAppointmentRest,
  useStartAppointmentRest,
  useCompleteAppointmentRest,
  useMarkNoShowAppointmentRest,
  useRescheduleAppointmentRest,
} from '@/features/appointments/api/appointments.queries';
import { useNailServicesRest } from '@/features/services/api/services.queries';
import { mapAppointmentView } from '@/features/appointments/mappers/appointmentViewMapper';
import { mapNailServiceView } from '@/features/services/mappers/serviceViewMapper';
import type { Appointment, Service } from '@emme/api';

interface AppointmentData {
  loading: boolean;
  error: string | null;
  appointments: Appointment[];
  services: Service[];
  createAppointment: (input: {
    clientId: string;
    serviceId: string;
    customerName: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => Promise<void>;
  cancelAppointment: (appointmentId: string) => Promise<void>;
  confirmAppointment: (appointmentId: string) => Promise<void>;
  startAppointment: (appointmentId: string) => Promise<void>;
  completeAppointment: (appointmentId: string) => Promise<void>;
  markNoShowAppointment: (appointmentId: string) => Promise<void>;
  rescheduleAppointment: (id: string, newStartsAt: string, newEndsAt: string) => Promise<void>;
}

export function useAppointmentData(dateFilter?: string): AppointmentData {
  const { data: aptData, isLoading: aptLoading, error: aptError } = useAppointmentsRest(dateFilter);
  const { data: svcData, isLoading: svcLoading, error: svcError } = useNailServicesRest();
  const createMutation = useCreateAppointmentRest();
  const cancelMutation = useCancelAppointmentRest();
  const confirmMutation = useConfirmAppointmentRest();
  const startMutation = useStartAppointmentRest();
  const completeMutation = useCompleteAppointmentRest();
  const markNoShowMutation = useMarkNoShowAppointmentRest();
  const rescheduleMutation = useRescheduleAppointmentRest();

  const appointments = useMemo(
    () => (aptData?.appointments || []).map(mapAppointmentView),
    [aptData]
  );

  const services = useMemo(() => (svcData?.services || []).map(mapNailServiceView), [svcData]);

  const createAppointment = useCallback(
    async (input) => {
      const startDateTime = `${input.date}T${input.startTime}:00`;
      const endDateTime = `${input.date}T${input.endTime}:00`;
      await createMutation.mutateAsync({
        clientId: input.clientId,
        serviceId: input.serviceId,
        startTime: startDateTime,
        endTime: endDateTime,
      });
    },
    [createMutation]
  );

  const cancelAppointment = useCallback(
    async (appointmentId: string) => {
      await cancelMutation.mutateAsync(appointmentId);
    },
    [cancelMutation]
  );

  const confirmAppointment = useCallback(
    async (appointmentId: string) => {
      await confirmMutation.mutateAsync(appointmentId);
    },
    [confirmMutation]
  );

  const startAppointment = useCallback(
    async (appointmentId: string) => {
      await startMutation.mutateAsync(appointmentId);
    },
    [startMutation]
  );

  const completeAppointment = useCallback(
    async (appointmentId: string) => {
      await completeMutation.mutateAsync(appointmentId);
    },
    [completeMutation]
  );

  const markNoShowAppointment = useCallback(
    async (appointmentId: string) => {
      await markNoShowMutation.mutateAsync(appointmentId);
    },
    [markNoShowMutation]
  );

  const rescheduleAppointment = useCallback(
    async (id: string, newStartsAt: string, newEndsAt: string) => {
      await rescheduleMutation.mutateAsync({ id, newStartsAt, newEndsAt });
    },
    [rescheduleMutation]
  );

  const error = aptError?.message || svcError?.message || null;

  return {
    loading: aptLoading || svcLoading,
    error,
    appointments,
    services,
    createAppointment,
    cancelAppointment,
    confirmAppointment,
    startAppointment,
    completeAppointment,
    markNoShowAppointment,
    rescheduleAppointment,
  };
}
