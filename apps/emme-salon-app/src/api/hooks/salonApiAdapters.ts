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

type TransportRecord = Record<string, unknown>;

function asRecord(value: unknown, resource: string): TransportRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Invalid ${resource} response`);
  }
  return value as TransportRecord;
}

function requiredString(record: TransportRecord, field: string, resource: string): string {
  const value = record[field];
  if (typeof value !== 'string') {
    throw new Error(`Invalid ${resource} response: ${field} must be a string`);
  }
  return value;
}

function optionalString(record: TransportRecord, field: string): string | undefined {
  const value = record[field];
  return typeof value === 'string' ? value : undefined;
}

function firstString(record: TransportRecord, fields: readonly string[]): string {
  for (const field of fields) {
    const value = record[field];
    if (typeof value === 'string') return value;
  }
  return '';
}

function firstNumber(record: TransportRecord, fields: readonly string[]): number {
  for (const field of fields) {
    const value = record[field];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return 0;
}

function firstBoolean(record: TransportRecord, fields: readonly string[], fallback: boolean): boolean {
  for (const field of fields) {
    const value = record[field];
    if (typeof value === 'boolean') return value;
  }
  return fallback;
}

export const mapAppointmentApiResponse = (payload: unknown) => {
  const item = asRecord(payload, 'appointment');
  return {
    id: requiredString(item, 'id', 'appointment'),
    customerName: firstString(item, ['customerName']),
    clientId: firstString(item, ['customerId', 'clientId']),
    serviceId: firstString(item, ['serviceId']),
    startTime: firstString(item, ['startsAt']) ||
      (firstString(item, ['date']) && firstString(item, ['startTime'])
        ? `${firstString(item, ['date'])}T${firstString(item, ['startTime'])}:00`
        : ''),
    endTime: firstString(item, ['endsAt']) ||
      (firstString(item, ['date']) && firstString(item, ['endTime'])
        ? `${firstString(item, ['date'])}T${firstString(item, ['endTime'])}:00`
        : ''),
    status: firstString(item, ['status']),
  };
};

export const mapServiceApiResponse = (payload: unknown) => {
  const item = asRecord(payload, 'service');
  return {
    id: requiredString(item, 'id', 'service'),
    code: firstString(item, ['code']),
    name: requiredString(item, 'name', 'service'),
    category: firstString(item, ['category']),
    durationMinutes: firstNumber(item, ['durationMinutes', 'duration']),
    description: optionalString(item, 'description') ?? null,
    priceRange: String(firstNumber(item, ['basePrice', 'price'])),
    isActive: firstBoolean(item, ['isActive'], item.status === 'ACTIVE'),
  };
};

export const mapCustomerApiResponse = (payload: unknown) => {
  const item = asRecord(payload, 'customer');
  return {
    id: requiredString(item, 'id', 'customer'),
    name: requiredString(item, 'name', 'customer'),
    phone: firstString(item, ['phone']),
    email: optionalString(item, 'email') ?? '',
  };
};

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
