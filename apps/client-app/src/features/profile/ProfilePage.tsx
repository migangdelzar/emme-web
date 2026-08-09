import { EmptyState } from '@emme/ui';

export function ProfilePage() {
  return (
    <section aria-labelledby="profile-title">
      <h1 id="profile-title">My profile</h1>
      <EmptyState title="Profile unavailable" description="Sign in to view and update your profile." />
    </section>
  );
}
