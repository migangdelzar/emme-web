import { CatalogEmptyState } from '@emme/features/catalog';
import { EmptyState } from '@emme/ui';

export function DiscoveryPage() {
  return (
    <section aria-labelledby="discovery-title">
      <h1 id="discovery-title">Discover services</h1>
      <EmptyState
        title="Choose a service"
        description="Services and designs from your selected salon will appear here."
      />
      <CatalogEmptyState />
    </section>
  );
}
