import { createAppointmentApi, type AppointmentApi } from './appointments/api.js';
import { createClientApi, type ClientApi } from './clients/api.js';
import { createServiceApi, type ServiceApi } from './services/api.js';
import type { HttpClient } from './ports/http-client.js';

export interface Api {
  readonly clients: ClientApi;
  readonly appointments: AppointmentApi;
  readonly services: ServiceApi;
}

export function createApi(http: HttpClient): Api {
  return {
    clients: createClientApi(http),
    appointments: createAppointmentApi(http),
    services: createServiceApi(http),
  };
}
