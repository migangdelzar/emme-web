import { EmptyState } from '@emme/ui';

export function CommunicationsPage() {
  return (
    <section aria-labelledby="communications-title">
      <h1 id="communications-title">Messages</h1>
      <EmptyState title="No conversations" description="Messages from your salon will appear here." />
    </section>
  );
}
