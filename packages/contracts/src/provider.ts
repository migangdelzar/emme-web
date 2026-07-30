import type { Client, CreateClient } from "./clients.js";
import type { Service, CreateService } from "./services.js";
import type { Appointment, CreateAppointment } from "./appointments.js";

/** Shared interface between salon-app and Playwright E2E tests. */
export interface DataProvider {
  loadClients(): Promise<Client[]>;
  addClient(c: CreateClient): Promise<Client>;
  loadServices(): Promise<Service[]>;
  addService(s: CreateService): Promise<Service>;
  loadAppointments(): Promise<Appointment[]>;
  addAppointment(a: CreateAppointment): Promise<Appointment>;
}
