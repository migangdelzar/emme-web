import type { Client, CreateClient } from "../clients/api.js";
import type { Service, CreateService } from "../services/api.js";
import type { Appointment, CreateAppointment } from "../appointments/api.js";

/** Shared interface between salon-app and Playwright E2E tests. */
export interface DataProvider {
  loadClients(): Promise<Client[]>;
  addClient(c: CreateClient): Promise<Client>;
  loadServices(): Promise<Service[]>;
  addService(s: CreateService): Promise<Service>;
  loadAppointments(): Promise<Appointment[]>;
  addAppointment(a: CreateAppointment): Promise<Appointment>;
}
