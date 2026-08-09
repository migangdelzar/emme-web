import { asRecord, booleanField, stringField } from '@emme/api';
import type { CalendarConnection } from '../domain/index.js';
export function mapConnectionPayload(payload: unknown): CalendarConnection { const raw = asRecord(payload, 'connection'); return { id: stringField(raw, 'id', 'connection'), tenantId: stringField(raw, 'tenantId', 'connection'), provider: stringField(raw, 'provider', 'connection') as CalendarConnection['provider'], accountEmail: stringField(raw, 'accountEmail', 'connection'), connected: booleanField(raw, 'connected', false) }; }
