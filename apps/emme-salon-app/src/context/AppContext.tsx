import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../app/auth/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import {
  useClients,
  useServices,
  useAppointments,
  useAddClient,
  useAddService,
  useAddAppointment,
} from '@/hooks/useApiQueries';
import type {
  Service,
  Client,
  Appointment,
  AppointmentStatus,
  CreateService,
  CreateClient,
  CreateAppointment,
} from '@emme/api';

// Re-export for convenience
export type { Service, Client, Appointment, AppointmentStatus };
export type { CreateService, CreateClient, CreateAppointment };

export interface BusinessProfile {
  id: string;
  name: string;
  owner: string;
  ownerName?: string;
  instagram?: string;
  phone?: string;
  description?: string;
  address?: string;
  logo?: string;
  workingHours?: {
    [key: string]: {
      open: string;
      close: string;
      active: boolean;
      breakActive?: boolean;
      breakStart?: string;
      breakEnd?: string;
    };
  };
  notifications?: {
    whatsappEnabled: boolean;
    reminderTime: number; // hours
    template: string;
  };
  language?: string;
  monthlyGoal?: number;
  promotions?: Array<{
    id: string;
    title: string;
    serviceId: string;
    startDate: string;
    endDate: string;
    discountValue: number;
    discountType: 'percentage' | 'fixed';
    isActive: boolean;
  }>;
  whatsappBot?: {
    enabled: boolean;
    autoReply: boolean;
    welcomeMessage: string;
    keywords?: Array<{ trigger: string; response: string }>;
  };
  salonConfig?: {
    specialDates: Array<{
      id: string;
      date: string;
      endDate?: string;
      type: 'holiday' | 'reduced' | 'event' | 'vacation';
      hours?: { open: string; close: string };
      note: string;
      open?: string;
      close?: string;
    }>;
  };
}

interface AppContextType {
  services: Service[];
  clients: Client[];
  appointments: Appointment[];
  profile: BusinessProfile;
  addService: (s: Omit<Service, 'id'>) => void;
  addClient: (c: Omit<Client, 'id'>) => void;
  addAppointment: (a: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, a: Partial<Appointment>) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  updateProfile: (p: BusinessProfile) => void;
  deleteClient: (id: string) => void;
  deleteService: (id: string) => void;
  updateClient: (id: string, c: Partial<Client>) => void;
  updateService: (id: string, s: Partial<Service>) => void;
  toggleServiceStatus: (id: string) => void;
}

const DEFAULT_SERVICES: Service[] = [];

const DEFAULT_CLIENTS: Client[] = [];

const DEFAULT_APPOINTMENTS: Appointment[] = [];

const DEFAULT_PROFILE: BusinessProfile = {
  id: 'st-001-apple',
  name: 'EmmeNails',
  owner: 'Valeria',
  instagram: '@emmenails',
  description: 'Estudio especializado en cuidado de uñas y nail art de alta gama.',
  address: 'Calle Principal 123, Madrid',
  workingHours: {
    lunes: { open: '09:00', close: '20:00', active: true },
    martes: { open: '09:00', close: '20:00', active: true },
    miercoles: { open: '09:00', close: '20:00', active: true },
    jueves: { open: '09:00', close: '20:00', active: true },
    viernes: { open: '09:00', close: '20:00', active: true },
    sabado: { open: '10:00', close: '14:00', active: true },
    domingo: { open: '00:00', close: '00:00', active: false },
  },
  notifications: {
    whatsappEnabled: true,
    reminderTime: 24,
    template:
      'Hola {cliente}, te recordamos tu cita en EmmeNails para {servicio} el día {fecha} a las {hora}. ¡Te esperamos!',
  },
  language: 'es',
  monthlyGoal: 25000,
  promotions: [
    {
      id: '1',
      title: 'Descuento Primavera',
      serviceId: 'm2',
      startDate: '2026-05-01',
      endDate: '2026-05-31',
      discountValue: 15,
      discountType: 'percentage',
      isActive: true,
    },
    {
      id: '2',
      title: 'Promo Soft Gel',
      serviceId: 'e1',
      startDate: '2026-06-01',
      endDate: '2026-06-15',
      discountValue: 10,
      discountType: 'fixed',
      isActive: false,
    },
  ],
  whatsappBot: {
    enabled: true,
    autoReply: true,
    welcomeMessage: '¡Hola! Bienvenida a EmmeNails. ¿En qué podemos ayudarte hoy?',
    keywords: [
      {
        trigger: 'precios',
        response:
          'Puedes ver todos nuestros servicios y precios en la sección de Servicios de nuestra App.',
      },
      { trigger: 'ubicacion', response: 'Estamos ubicados en Calle Principal 123, Madrid.' },
    ],
  },
  salonConfig: {
    specialDates: [
      { id: 'sd1', date: '2026-12-25', type: 'holiday', note: 'Navidad' },
      {
        id: 'sd2',
        date: '2026-12-31',
        type: 'reduced',
        hours: { open: '09:00', close: '14:00' },
        note: 'Fin de Año',
      },
    ],
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();

  const queryClient = useQueryClient();

  const { data: services = DEFAULT_SERVICES } = useServices();
  const { data: clients = DEFAULT_CLIENTS } = useClients();
  const { data: appointments = DEFAULT_APPOINTMENTS } = useAppointments();

  const addServiceMutation = useAddService();
  const addClientMutation = useAddClient();
  const addAppointmentMutation = useAddAppointment();

  const [profile, setProfile] = useState<BusinessProfile>(() => {
    return DEFAULT_PROFILE;
  });

  // -- mutations with optimistic updates ---

  const addService = useCallback(
    async (s: Omit<Service, 'id' | 'isActive'>) => {
      try {
        await addServiceMutation.mutateAsync(s);
      } catch (e) {
        console.error('addService API failed:', e);
      }
    },
    [addServiceMutation]
  );

  const addClient = useCallback(
    async (c: Omit<Client, 'id'>) => {
      try {
        await addClientMutation.mutateAsync(c);
      } catch (e) {
        console.error('addClient API failed:', e);
      }
    },
    [addClientMutation]
  );

  const addAppointment = useCallback(
    async (a: Omit<Appointment, 'id'>) => {
      try {
        await addAppointmentMutation.mutateAsync(a);
      } catch (e) {
        console.error('addAppointment API failed:', e);
        throw e;
      }
    },
    [addAppointmentMutation]
  );

  const updateAppointment = useCallback(
    (id: string, updatedFields: Partial<Appointment>) => {
      queryClient.setQueryData<Appointment[]>(['appointments'], (old) =>
        old?.map((a) => (a.id === id ? { ...a, ...updatedFields } : a))
      );
    },
    [queryClient]
  );

  const updateAppointmentStatus = useCallback(
    (id: string, status: AppointmentStatus) => {
      queryClient.setQueryData<Appointment[]>(['appointments'], (old) =>
        old?.map((a) => (a.id === id ? { ...a, status } : a))
      );
    },
    [queryClient]
  );

  const updateProfile = useCallback((p: BusinessProfile) => {
    setProfile(p);
  }, []);

  const deleteClient = useCallback(
    (id: string) => {
      queryClient.setQueryData<Client[]>(['clients'], (old) => old?.filter((c) => c.id !== id));
    },
    [queryClient]
  );

  const deleteService = useCallback(
    (id: string) => {
      queryClient.setQueryData<Service[]>(['services'], (old) => old?.filter((s) => s.id !== id));
    },
    [queryClient]
  );

  const updateClient = useCallback(
    (id: string, updatedFields: Partial<Client>) => {
      queryClient.setQueryData<Client[]>(['clients'], (old) =>
        old?.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
      );
    },
    [queryClient]
  );

  const updateService = useCallback(
    (id: string, updatedFields: Partial<Service>) => {
      queryClient.setQueryData<Service[]>(['services'], (old) =>
        old?.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
      );
    },
    [queryClient]
  );

  const toggleServiceStatus = useCallback(
    (id: string) => {
      queryClient.setQueryData<Service[]>(['services'], (old) =>
        old?.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
      );
    },
    [queryClient]
  );

  return (
    <AppContext.Provider
      value={{
        services,
        clients,
        appointments,
        profile,
        addService,
        addClient,
        addAppointment,
        updateAppointment,
        updateAppointmentStatus,
        updateProfile,
        deleteClient,
        deleteService,
        updateClient,
        updateService,
        toggleServiceStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
