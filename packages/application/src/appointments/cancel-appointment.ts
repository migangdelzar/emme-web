import { canCancelAppointment, type Appointment } from "@emme/domain";

import type { AppointmentRepository } from "./ports/appointment-repository.js";

interface CancelAppointmentDependencies {
  appointments: AppointmentRepository;
}

interface CancelAppointmentInput {
  appointmentId: string;
}

export function cancelAppointment(dependencies: CancelAppointmentDependencies) {
  return async function execute(input: CancelAppointmentInput): Promise<Appointment> {
    const appointment = await dependencies.appointments.findById(input.appointmentId);

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (!canCancelAppointment(appointment)) {
      throw new Error("Appointment cannot be cancelled");
    }

    return dependencies.appointments.save({ ...appointment, status: "cancelled" });
  };
}
