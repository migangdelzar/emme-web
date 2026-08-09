import { EmptyState } from '@emme/ui';

export function AppointmentsPage() {
  return (
    <section aria-labelledby="appointments-title">
      <h1 id="appointments-title">My appointments</h1>
      <EmptyState title="No appointments yet" description="Your upcoming and past appointments will appear here." />
    </section>
  );
}
