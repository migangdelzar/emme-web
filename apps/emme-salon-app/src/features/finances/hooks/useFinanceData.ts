import { useMemo } from 'react';
import { useAppointmentsRest } from '@/api/hooks/useAppointments';
import { useNailServicesRest } from '@/api/hooks/useServices';
import { mapAppointmentView } from '@/features/appointments/mappers/appointmentViewMapper';
import { mapNailServiceView } from '@/features/services/mappers/serviceViewMapper';

export function useFinanceData() {
  const { data: aptData, isLoading: aptLoading, error: aptError } = useAppointmentsRest();
  const { data: svcData, isLoading: svcLoading, error: svcError } = useNailServicesRest();

  const appointments = useMemo(
    () => (aptData?.appointments || []).map(mapAppointmentView),
    [aptData]
  );

  const services = useMemo(() => (svcData?.services || []).map(mapNailServiceView), [svcData]);

  const servicePriceMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of services) {
      m.set(s.id, s.price);
    }
    return m;
  }, [services]);

  const completedAppointments = useMemo(
    () =>
      appointments.filter(
        (a: { status: string }) => a.status === 'completed' || a.status === 'confirmed'
      ),
    [appointments]
  );

  const totalRevenue = useMemo(
    () =>
      completedAppointments.reduce(
        (sum: number, a: { serviceId: string }) => sum + (servicePriceMap.get(a.serviceId) || 0),
        0
      ),
    [completedAppointments, servicePriceMap]
  );

  const revenueToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return completedAppointments
      .filter((a: { date: string }) => a.date === today)
      .reduce(
        (sum: number, a: { serviceId: string }) => sum + (servicePriceMap.get(a.serviceId) || 0),
        0
      );
  }, [completedAppointments, servicePriceMap]);

  const averageTicket =
    completedAppointments.length > 0 ? Math.round(totalRevenue / completedAppointments.length) : 0;

  return {
    loading: aptLoading || svcLoading,
    error: aptError?.message || svcError?.message || null,
    appointments,
    services,
    totalRevenue,
    revenueToday,
    averageTicket,
    appointmentCount: appointments.length,
    completedCount: completedAppointments.length,
  };
}
