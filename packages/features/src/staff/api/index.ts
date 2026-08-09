import { asRecord, stringField, booleanField } from '@emme/api';
import type { StaffMember } from '../domain/index.js';
export function mapStaffPayload(payload: unknown): StaffMember { const raw = asRecord(payload, 'staff'); return { id: stringField(raw, 'id', 'staff'), tenantId: stringField(raw, 'tenantId', 'staff'), name: stringField(raw, 'name', 'staff'), role: stringField(raw, 'role', 'staff') as StaffMember['role'], isActive: booleanField(raw, 'isActive', true) }; }
