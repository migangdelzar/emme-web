import { asRecord, booleanField, stringField } from '@emme/api';
import type { CalendarConnection, Provider } from '../domain/index.js';

function parseProvider(value: string): Provider {
  if (value === 'google-calendar' || value === 'google-sheets') return value;
  throw new Error(`Invalid integration provider: ${value}`);
}

export function mapConnectionPayload(payload: unknown): CalendarConnection {
  const raw = asRecord(payload, 'connection');
  return {
    id: stringField(raw, 'id', 'connection'),
    tenantId: stringField(raw, 'tenantId', 'connection'),
    provider: parseProvider(stringField(raw, 'provider', 'connection')),
    accountEmail: stringField(raw, 'accountEmail', 'connection'),
    connected: booleanField(raw, 'connected', false),
  };
}
