export type Provider = 'google-calendar' | 'google-sheets';
export type SyncStatus = 'idle' | 'running' | 'completed' | 'partial' | 'failed';
export interface CalendarConnection { readonly id: string; readonly tenantId: string; readonly provider: Provider; readonly accountEmail: string; readonly connected: boolean; }
export interface SyncResult { readonly status: SyncStatus; readonly synced: number; readonly failed: number; readonly idempotencyKey: string; }
export class IntegrationError extends Error { readonly code = 'INTEGRATION_ERROR'; }
export function createIdempotencyKey(value: string): string { if (!value.trim()) throw new IntegrationError('Idempotency key is required'); return value; }
export function canDisconnect(connection: CalendarConnection): boolean { return connection.connected; }
