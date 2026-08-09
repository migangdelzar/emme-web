import type { DashboardSnapshot } from '../domain/index.js';
export function DashboardStatCard({ label, value }: { readonly label: string; readonly value: string | number }) { return <article aria-label={label}><h2>{label}</h2><p>{value}</p></article>; }
export function DashboardEmptyState() { return <p role="status">No analytics data available.</p>; }
export function DashboardSnapshotView({ snapshot }: { readonly snapshot: DashboardSnapshot }) { return <div><DashboardStatCard label="Revenue" value={snapshot.revenue.amountMinor} /><DashboardStatCard label="Appointments" value={snapshot.appointments.total} /></div>; }
