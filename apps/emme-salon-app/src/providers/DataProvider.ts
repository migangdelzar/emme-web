import type { Client, Service, Appointment, CreateClient, CreateService, CreateAppointment, DataProvider } from '@emme/contracts';
import { createClientApi, createServiceApi, createAppointmentApi } from '@emme/contracts';
import { api } from '@/api/restClient';

/** RealDataProvider — calls the live backend via domain API modules. */
class RealDataProvider implements DataProvider {
  private clients = createClientApi(api);
  private services = createServiceApi(api);
  private appointments = createAppointmentApi(api);

  async loadClients() { return this.clients.list(); }
  async addClient(c: CreateClient) { return this.clients.create(c); }

  async loadServices() { return this.services.list(); }
  async addService(s: CreateService) { return this.services.create(s); }

  async loadAppointments() { return this.appointments.list(); }
  async addAppointment(a: CreateAppointment) { return this.appointments.create(a); }
}

/** Global provider — can be overridden by Playwright via window.__provider. */
declare global { interface Window { __emmeProvider?: DataProvider } }

function resolveProvider(): DataProvider {
  if (typeof window !== 'undefined' && window.__emmeProvider) {
    return window.__emmeProvider;
  }
  return new RealDataProvider();
}

export const provider = resolveProvider();
