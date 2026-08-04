import { API } from "./routes.js";
import type { HttpClient } from "./transport.js";

export interface SyncStatus {
  status: string;
}

export interface CalendarSyncApi {
  syncNow(): Promise<SyncStatus>;
  unsync(appointmentId: string): Promise<void>;
}

export function createCalendarSyncApi(http: HttpClient): CalendarSyncApi {
  return {
    syncNow: async () => http.post<SyncStatus>(API.CALENDAR_SYNC),
    unsync: async (id) => http.delete<void>(`${API.CALENDAR_SYNC}/${id}`),
  };
}
