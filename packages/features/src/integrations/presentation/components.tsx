import type { CalendarConnection } from '../domain/index.js';
export function ConnectionStatus({ connection }: { readonly connection: CalendarConnection | null }) { return <p role="status">{connection?.connected ? `Connected: ${connection.accountEmail}` : 'Not connected'}</p>; }
export function ExportStatus({ status }: { readonly status: string }) { return <p data-status={status}>{status}</p>; }
