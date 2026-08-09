import { asRecord, optionalStringField, stringField, booleanField } from '@emme/api';
import type { Customer } from '../domain/index.js';
export function mapCustomerPayload(payload: unknown): Customer {
  const raw = asRecord(payload, 'customer');
  return {
    id: stringField(raw, 'id', 'customer'), tenantId: stringField(raw, 'tenantId', 'customer'),
    name: stringField(raw, 'name', 'customer'), phone: stringField(raw, 'phone', 'customer'),
    isActive: booleanField(raw, 'isActive', true),
    ...(optionalStringField(raw, 'email') ? { email: optionalStringField(raw, 'email') } : {}),
    ...(optionalStringField(raw, 'notes') ? { notes: optionalStringField(raw, 'notes') } : {}),
  };
}
