import { asRecord, stringField, booleanField } from '@emme/api';
import type { StaffMember, StaffRole } from '../domain/index.js';

function parseStaffRole(value: string): StaffRole {
  if (value === 'owner' || value === 'manager' || value === 'artist' || value === 'receptionist') return value;
  throw new Error(`Invalid staff role: ${value}`);
}

export function mapStaffPayload(payload: unknown): StaffMember {
  const raw = asRecord(payload, 'staff');
  return {
    id: stringField(raw, 'id', 'staff'),
    tenantId: stringField(raw, 'tenantId', 'staff'),
    name: stringField(raw, 'name', 'staff'),
    role: parseStaffRole(stringField(raw, 'role', 'staff')),
    isActive: booleanField(raw, 'isActive', true),
  };
}
