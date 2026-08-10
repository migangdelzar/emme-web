import { describe, expect, it } from "vitest";

import { canCancelAppointment } from "./appointment.rules.js";
import type { Appointment } from "./appointment.types.js";

const appointment: Appointment = {
  id: "appointment-1",
  clientId: "client-1",
  serviceId: "service-1",
  date: "2026-08-07",
  startTime: "10:00",
  endTime: "11:00",
  status: "confirmed",
};

describe("canCancelAppointment", () => {
  it("allows pending and confirmed appointments to be cancelled", () => {
    expect(canCancelAppointment(appointment)).toBe(true);
    expect(canCancelAppointment({ ...appointment, status: "pending" })).toBe(true);
  });

  it("rejects completed and already cancelled appointments", () => {
    expect(canCancelAppointment({ ...appointment, status: "completed" })).toBe(false);
    expect(canCancelAppointment({ ...appointment, status: "cancelled" })).toBe(false);
  });
});
