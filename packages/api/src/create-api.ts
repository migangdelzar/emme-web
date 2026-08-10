import { createAppointmentApi, type AppointmentApi } from './appointments/api.js';
import { createAuthApi, type AuthApi } from './auth/api.js';
import { createClientApi, type ClientApi } from './clients/api.js';
import { createServiceApi, type ServiceApi } from './services/api.js';
import { createBusinessConfigApi, type BusinessConfigApi } from './configuration/api.js';
import { createCalendarSyncApi, type CalendarSyncApi } from './integrations/calendar-sync/api.js';
import { createGoogleOAuthApi, type GoogleOAuthApi } from './integrations/google-oauth/api.js';
import { createGoogleSheetsApi, type GoogleSheetsApi } from './integrations/google-sheets/api.js';
import type { HttpClient } from './ports/http-client.js';

export interface Api {
  readonly auth: AuthApi;
  readonly clients: ClientApi;
  readonly appointments: AppointmentApi;
  readonly services: ServiceApi;
  readonly calendarSync: CalendarSyncApi;
  readonly googleOAuth: GoogleOAuthApi;
  readonly googleSheets: GoogleSheetsApi;
  readonly businessConfig: BusinessConfigApi;
}

export function createApi(http: HttpClient): Api {
  return {
    auth: createAuthApi(http),
    clients: createClientApi(http),
    appointments: createAppointmentApi(http),
    services: createServiceApi(http),
    calendarSync: createCalendarSyncApi(http),
    googleOAuth: createGoogleOAuthApi(http),
    googleSheets: createGoogleSheetsApi(http),
    businessConfig: createBusinessConfigApi(http),
  };
}
