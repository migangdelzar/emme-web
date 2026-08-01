import { API } from "./routes.js";
import {
  asRecord,
  asRecordArray,
  firstStringField,
  optionalStringField,
  stringField,
  type HttpClient,
} from "./transport.js";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface Appointment {
  id: string;
  clientId: string; // maps to backend customerId
  serviceId: string;
  date: string; // ISO date: "2026-07-10"
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: AppointmentStatus;
  notes?: string;
}

/** Input shape for creating an appointment (no id). */
export type CreateAppointment = Omit<Appointment, "id">;

export const APPOINTMENT_ROUTES = {
  APPOINTMENTS: "/api/v1/appointments",
} as const;

export interface AppointmentApi {
  list(): Promise<Appointment[]>;
  create(data: CreateAppointment): Promise<Appointment>;
  getById(id: string): Promise<Appointment>;
  cancel(id: string): Promise<Appointment>;
}

export function createAppointmentApi(http: HttpClient): AppointmentApi {
  const mapAppointment = (payload: unknown): Appointment => {
    const raw = asRecord(payload, "appointment");
    // Parse ISO datetime from API or use contract fields from mock
    const startsAt = optionalStringField(raw, "startsAt") ?? '';
    const endsAt = optionalStringField(raw, "endsAt") ?? '';
    const [date, timeWithMs] = startsAt.split('T');
    const startTime = timeWithMs ? timeWithMs.substring(0, 5) : firstStringField(raw, ["startTime"]);
    const [, endTimeWithMs] = endsAt.split('T');
    const endTime = endTimeWithMs ? endTimeWithMs.substring(0, 5) : firstStringField(raw, ["endTime"]);

    const statusMap: Record<string, AppointmentStatus> = {
      SCHEDULED: 'pending',
      CONFIRMED: 'confirmed',
      CANCELLED: 'cancelled',
      COMPLETED: 'completed',
    };

    return {
      id: stringField(raw, "id", "appointment"),
      clientId: firstStringField(raw, ["customerId", "clientId"]),
      serviceId: firstStringField(raw, ["serviceId"]),
      date: date || firstStringField(raw, ["date"]),
      startTime,
      endTime,
      status: statusMap[firstStringField(raw, ["status"])] || 'pending',
      notes: optionalStringField(raw, "notes"),
    };
  };

  return {
    list: async () => {
      const arr = await http.get<unknown>(API.APPOINTMENTS);
      return asRecordArray(arr, "appointment").map((item) => mapAppointment(item));
    },
    create: async (data) => {
      const body = {
        customerId: data.clientId,
        serviceId: data.serviceId,
        startsAt: `${data.date}T${data.startTime}:00`,
        endsAt: `${data.date}T${data.endTime}:00`,
      };
      const raw = await http.post<unknown>(API.APPOINTMENTS, body);
      return mapAppointment(raw);
    },
    getById: async (id) => {
      const raw = await http.get<unknown>(`${API.APPOINTMENTS}/${id}`);
      return mapAppointment(raw);
    },
    cancel: async (id) => {
      const raw = await http.post<unknown>(`${API.APPOINTMENTS}/${id}/cancel`);
      return mapAppointment(raw);
    },
  };
}
