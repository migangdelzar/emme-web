import { describe, expect, it } from "vitest";

import { cancelAppointment } from "./cancel-appointment.js";
import type { AppointmentRepository } from "./ports/appointment-repository.js";
import type { Appointment } from "@emme/domain";

const appointment: Appointment = {
  id: "appointment-1",
  clientId: "client-1",
  serviceId: "service-1",
  date: "2026-08-07",
  startTime: "10:00",
  endTime: "11:00",
  status: "confirmed",
};

class FakeAppointmentRepository implements AppointmentRepository {
  saved: Appointment[] = [];
  result: Appointment | null = appointment;

  async findById(): Promise<Appointment | null> {
    return this.result;
  }

  async save(value: Appointment): Promise<Appointment> {
    this.saved.push(value);
    return value;
  }
}

describe("cancelAppointment", () => {
  it("cancels an existing cancellable appointment through the repository", async () => {
    const repository = new FakeAppointmentRepository();

    const result = await cancelAppointment({ appointments: repository })({
      appointmentId: appointment.id,
    });

    expect(result.status).toBe("cancelled");
    expect(repository.saved).toEqual([{ ...appointment, status: "cancelled" }]);
  });

  it("throws when the appointment does not exist", async () => {
    const repository = new FakeAppointmentRepository();
    repository.result = null;

    await expect(
      cancelAppointment({ appointments: repository })({ appointmentId: appointment.id }),
    ).rejects.toThrow("Appointment not found");
  });

  it("rejects appointments that the domain says cannot be cancelled", async () => {
    const repository = new FakeAppointmentRepository();
    repository.result = { ...appointment, status: "completed" };

    await expect(
      cancelAppointment({ appointments: repository })({ appointmentId: appointment.id }),
    ).rejects.toThrow("Appointment cannot be cancelled");
  });
});
