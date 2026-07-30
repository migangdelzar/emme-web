import { useMemo, useCallback } from 'react';
import {
  useAppointmentsRest,
  useCreateAppointmentRest,
  useCancelAppointmentRest,
} from '@/api/hooks/useAppointments';
import { useNailServicesRest } from '@/api/hooks/useServices';
import { mapAppointmentView, mapNailServiceView } from '@/api/hooks/salonApiAdapters';
import type { Appointment, Service } from '@/context/AppContext';

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
}

export function useAppointmentData(dateFilter?: string): AppointmentData {
  const { data: aptData, isLoading: aptLoading, error: aptError } = useAppointmentsRest(dateFilter);
  const { data: svcData, isLoading: svcLoading, error: svcError } = useNailServicesRest();
  const createMutation = useCreateAppointmentRest();
  const cancelMutation = useCancelAppointmentRest();

  const appointments = useMemo(
    () => (aptData?.appointments || []).map(mapAppointmentView),
    [aptData],
  );

  const services = useMemo(
    () => (svcData?.services || []).map(mapNailServiceView),
    [svcData],
  );

  const createAppointment = useCallback(
    async (input: {
      clientId: string;
      serviceId: string;
      customerName: string;
      date: string;
      startTime: string;
      endTime: string;
    }) => {
      const startDateTime = `${input.date}T${input.startTime}:00`;
      const endDateTime = `${input.date}T${input.endTime}:00`;

      await createMutation.mutateAsync({
        clientId: input.clientId,
        serviceId: input.serviceId,
        startTime: startDateTime,
        endTime: endDateTime,
      });
    },
    [createMutation],
  );

  const cancelAppointment = useCallback(
    async (appointmentId: string) => {
      await cancelMutation.mutateAsync(appointmentId);
    },
    [cancelMutation],
  );

  const error = aptError?.message || svcError?.message || null;

  return {
    loading: aptLoading || svcLoading,
    error,
    appointments,
    services,
    createAppointment,
    cancelAppointment,
  };
}
