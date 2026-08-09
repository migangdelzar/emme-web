import type { TenantConfiguration } from '../domain/index.js';
export function BusinessProfileSummary({ config }: { readonly config: TenantConfiguration }) { return <section aria-label="Business profile"><h2>{config.businessName}</h2><p>{config.timezone}</p></section>; }
