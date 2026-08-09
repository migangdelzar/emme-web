import { asRecord, firstBooleanField, firstNumberField, firstStringField, optionalStringField, stringField } from '@emme/api';
import type { Service } from '../domain/index.js';

export function mapCatalogService(payload: unknown): Service {
  const raw = asRecord(payload, 'service');
  const status = optionalStringField(raw, 'status');
  return {
    id: stringField(raw, 'id', 'service'),
    tenantId: stringField(raw, 'tenantId', 'service'),
    name: stringField(raw, 'name', 'service'),
    price: firstNumberField(raw, ['basePrice', 'price']),
    durationMinutes: firstNumberField(raw, ['durationMinutes', 'duration']),
    isActive: firstBooleanField(raw, ['isActive'], status === 'ACTIVE'),
    ...(optionalStringField(raw, 'description') ? { description: optionalStringField(raw, 'description') } : {}),
  };
}
