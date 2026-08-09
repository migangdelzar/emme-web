import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppointmentsRest } from '../../appointments/api/appointments.queries';
import { useNailServicesRest } from '../../services/api/services.queries';
import { mapAppointmentView } from '../../appointments/mappers/appointmentViewMapper';
import { mapNailServiceView } from '../../services/mappers/serviceViewMapper';
import type { Appointment, Service } from '@emme/api';
import { createDashboardStreamUrl } from './dashboardStream';
import { createDashboardStreamRequest, parseDashboardStream } from './dashboardStream';
import { useAuth } from '@emme/core';

interface DashboardData {
  loading: boolean;
  error: string | null;
  appointments: Appointment[];
  services: Service[];
  incomeToday: number;
  confirmedToday: number;
  occupancy: number;
  newClientsThisMonth: number;
  monthlyIncome: number;
  todayAppointments: Appointment[];
  monthlyAppointments: Appointment[];
  // SSE fields
  connected: boolean;
  notifications: string[];
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function isCurrentMonth(dateStr: string): boolean {
  const now = new Date();
  const d = new Date(dateStr);
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function useDashboardData(): DashboardData {
  const { accessToken, tenant } = useAuth();
  const today = getToday();

  const { data: aptData, isLoading: aptLoading, error: aptError } = useAppointmentsRest(today);
  const { data: allAptData } = useAppointmentsRest();
  const { data: svcData, isLoading: svcLoading, error: svcError } = useNailServicesRest();

  // SSE real-time connection
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    // Vite development mode is used by mock E2E tests and HMR. The production
    // artifact is the environment where the authenticated stream is enabled.
    if (!import.meta.env.PROD) {
      setConnected(false);
      return;
    }

    if (!accessToken) return;

    const controller = new AbortController();
    let active = true;

    async function connect() {
      try {
        const response = await fetch(
          createDashboardStreamUrl(window.location.origin),
          { ...createDashboardStreamRequest(accessToken, tenant?.tenantSlug ?? null), signal: controller.signal },
        );
        if (!response.ok || !response.body) throw new Error(`Dashboard stream failed: ${response.status}`);

        setConnected(true);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (active) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parsed = parseDashboardStream(buffer);
          buffer = parsed.remainder;
          for (const event of parsed.events) {
            if (event.type !== 'notification') continue;
            try {
              const data = JSON.parse(event.data) as { message?: string };
              setNotifications((prev) => [...prev.slice(-9), data.message || 'New notification']);
            } catch {
              /* ignore malformed payloads */
            }
          }
        }
      } catch {
        if (!controller.signal.aborted) setConnected(false);
      }
    }

    void connect();

    return () => {
      active = false;
      controller.abort();
      setConnected(false);
    };
  }, [accessToken, tenant?.tenantSlug]);

  const appointments = useMemo(
    () => (aptData?.appointments || []).map(mapAppointmentView),
    [aptData]
  );

  const allAppointments = useMemo(
    () => (allAptData?.appointments || []).map(mapAppointmentView),
    [allAptData]
  );

  const services = useMemo(() => (svcData?.services || []).map(mapNailServiceView), [svcData]);

  const serviceMap = useMemo(() => {
    const map = new Map<string, Service>();
    services.forEach((s) => map.set(s.id, s));
    return map;
  }, [services]);

  const incomeToday = useMemo(
    () =>
      appointments
        .filter((a) => a.status === 'confirmed' || a.status === 'completed')
        .reduce((sum, a) => sum + (serviceMap.get(a.serviceId)?.price || 0), 0),
    [appointments, serviceMap]
  );

  const confirmedToday = useMemo(
    () => appointments.filter((a) => a.status === 'confirmed').length,
    [appointments]
  );

  const occupancy = useMemo(() => {
    const totalMinutes = appointments.reduce(
      (sum, a) => sum + (serviceMap.get(a.serviceId)?.duration || 0),
      0
    );
    return Math.min(100, Math.round((totalMinutes / 480) * 100));
  }, [appointments, serviceMap]);

  const newClientsThisMonth = useMemo(() => {
    const monthly = allAppointments.filter((a) => isCurrentMonth(a.date));
    const clientIds = new Set(monthly.map((a) => a.clientId).filter(Boolean));
    return clientIds.size;
  }, [allAppointments]);

  const monthlyIncome = useMemo(
    () =>
      allAppointments
        .filter(
          (a) => isCurrentMonth(a.date) && (a.status === 'confirmed' || a.status === 'completed')
        )
        .reduce((sum, a) => sum + (serviceMap.get(a.serviceId)?.price || 0), 0),
    [allAppointments, serviceMap]
  );

  const monthlyAppointments = useMemo(
    () => allAppointments.filter((a) => isCurrentMonth(a.date)),
    [allAppointments]
  );

  const error = aptError?.message || svcError?.message || null;

  return {
    loading: aptLoading || svcLoading,
    error,
    appointments,
    services,
    incomeToday,
    confirmedToday,
    occupancy,
    newClientsThisMonth,
    monthlyIncome,
    todayAppointments: appointments,
    monthlyAppointments,
    connected,
    notifications,
  };
}
