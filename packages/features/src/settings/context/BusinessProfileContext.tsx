import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

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
  workingHours?: Record<
    string,
    {
      open: string;
      close: string;
      active: boolean;
      breakActive?: boolean;
      breakStart?: string;
      breakEnd?: string;
    }
  >;
  notifications?: {
    whatsappEnabled: boolean;
    reminderTime: number;
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

export interface BusinessProfileContextValue {
  profile: BusinessProfile;
  updateProfile: (profile: BusinessProfile) => void;
}

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

const BusinessProfileContext = createContext<BusinessProfileContextValue | undefined>(undefined);

export function BusinessProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const updateProfile = useCallback((nextProfile: BusinessProfile) => setProfile(nextProfile), []);

  return (
    <BusinessProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </BusinessProfileContext.Provider>
  );
}

export function useBusinessProfileContext() {
  const context = useContext(BusinessProfileContext);
  if (!context) {
    throw new Error('useBusinessProfileContext must be used within a BusinessProfileProvider');
  }
  return context;
}
