export type StaffRole = 'owner' | 'manager' | 'artist' | 'receptionist';
export interface StaffMember { readonly id: string; readonly tenantId: string; readonly name: string; readonly role: StaffRole; readonly isActive: boolean; }
export interface AvailabilityRange { readonly startTime: string; readonly endTime: string; }
export function isStaffBookable(staff: StaffMember): boolean { return staff.isActive; }
export function createAvailabilityRange(startTime: string, endTime: string): AvailabilityRange {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime) || startTime >= endTime) throw new Error('Invalid availability range');
  return { startTime, endTime };
}
