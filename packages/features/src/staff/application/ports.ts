import type { AvailabilityRange, StaffMember } from '../domain/index.js';
export interface StaffRepository { list(tenantId: string): Promise<StaffMember[]>; save(staff: StaffMember): Promise<StaffMember>; }
export interface StaffAvailabilityRepository { list(staffId: string): Promise<AvailabilityRange[]>; save(staffId: string, range: AvailabilityRange): Promise<AvailabilityRange>; }
