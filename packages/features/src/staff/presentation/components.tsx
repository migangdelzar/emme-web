import type { StaffMember } from '../domain/index.js';
export function StaffAvatar({ staff }: { readonly staff: StaffMember }) { return <span aria-label={staff.name}>{staff.name.slice(0, 1)}</span>; }
export function StaffSummary({ staff }: { readonly staff: StaffMember }) { return <article><h2>{staff.name}</h2><p>{staff.role}</p></article>; }
