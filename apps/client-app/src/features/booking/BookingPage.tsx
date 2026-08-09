import { AppointmentSummaryCard } from '@emme/features/appointments';

export function BookingPage() {
  return (
    <section aria-labelledby="booking-title">
      <h1 id="booking-title">Book an appointment</h1>
      <AppointmentSummaryCard appointment={null} loading statusLabel="Select a service and time" />
    </section>
  );
}
