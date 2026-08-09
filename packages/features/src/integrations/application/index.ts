export type { IntegrationRepository, CalendarClient, SheetClient } from './ports.js';
import type { CalendarClient } from './ports.js';
export function syncCalendar(client: CalendarClient) { return (idempotencyKey: string) => client.sync(idempotencyKey); }
