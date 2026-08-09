import type { CalendarConnection, SyncResult } from '../domain/index.js';
export interface IntegrationRepository { getConnection(tenantId: string, provider: CalendarConnection['provider']): Promise<CalendarConnection | null>; save(connection: CalendarConnection): Promise<CalendarConnection>; }
export interface CalendarClient { connect(): Promise<CalendarConnection>; disconnect(connection: CalendarConnection): Promise<void>; sync(idempotencyKey: string): Promise<SyncResult>; }
export interface SheetClient { exportData(idempotencyKey: string): Promise<SyncResult>; }
