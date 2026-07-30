import type { Appointment, Service } from '@/context/AppContext';

export interface AppointmentApiResponse {
  id: string;
  customerId: string;
  customerName: string;
  serviceId: string;
  serviceName: string;
  artistId: string;
  artistName: string;
  startsAt: string;
  endsAt: string;
  status: string;
}

export interface ServiceApiResponse {
  id: string;
  code: string;
  name: string;
  category: string;
  description?: string | null;
  durationMinutes: number;
  basePrice: number;
  status: string;
}

export interface CustomerApiResponse {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  status: string;
}

export const mapAppointmentApiResponse = (item: any) => ({
  id: item.id,
  customerName: item.customerName ?? '',
  clientId: item.customerId ?? item.clientId ?? '',
  serviceId: item.serviceId ?? '',
  startTime: item.startsAt ?? (item.date && item.startTime ? `${item.date}T${item.startTime}:00` : ''),
  endTime: item.endsAt ?? (item.date && item.endTime ? `${item.date}T${item.endTime}:00` : ''),
  status: item.status ?? '',
});

export const mapServiceApiResponse = (item: any) => ({
  id: item.id,
  code: item.code ?? '',
  name: item.name,
  category: item.category ?? '',
  durationMinutes: item.durationMinutes ?? item.duration ?? 0,
  description: item.description ?? null,
  priceRange: String(item.basePrice ?? item.price ?? 0),
  isActive: item.isActive ?? (item.status === 'ACTIVE'),
});

export const mapCustomerApiResponse = (item: any) => ({
  id: item.id,
  name: item.name,
  phone: item.phone ?? '',
  email: item.email ?? '',
});

export function serviceCode(name: string): string {
  const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return normalized.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
}

export function mapAppointmentView(raw: {
  id: string;
  customerName: string;
  clientId?: string | null;
  serviceId?: string | null;
  startTime: string;
  endTime: string;
  status: string;
}): Appointment {
  const dateTime = raw.startTime || '';
  const [date, timeWithMs] = dateTime.split('T');
  const startTime = timeWithMs ? timeWithMs.substring(0, 5) : '';
  const endDateTime = raw.endTime || '';
  const [, endTimeWithMs] = endDateTime.split('T');
  const endTime = endTimeWithMs ? endTimeWithMs.substring(0, 5) : '';

  const statusMap: Record<string, Appointment['status']> = {
    SCHEDULED: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
  };

  return {
    id: raw.id,
    clientId: raw.clientId || '',
    serviceId: raw.serviceId || '',
    date: date || '',
    startTime,
    endTime,
    status: statusMap[raw.status] || 'pending',
  };
}

export function mapNailServiceView(raw: {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  description?: string | null;
  priceRange?: string | null;
  isActive?: boolean;
}): Service {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description || '',
    price: parseInt(raw.priceRange || '0', 10) || 0,
    duration: raw.durationMinutes || 0,
    category: raw.category || '',
    isActive: raw.isActive ?? true,
  };
}
