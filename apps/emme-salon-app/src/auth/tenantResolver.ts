/**
 * Extracts tenant slug from the current URL's subdomain.
 *
 * Production: studio-a.emme.app → slug="studio-a"
 * Local dev: studio-a.lvh.me:3000 → slug="studio-a"
 * Localhost: localhost:3000 → slug=null (uses tenant selector)
 */
export function resolveTenantFromHost(): string | null {
  if (typeof window === 'undefined') return null;

  const host = window.location.hostname;

  // localhost → no subdomain, use tenant selector
  if (host === 'localhost' || host === '127.0.0.1') {
    return null;
  }

  // lvh.me → first subdomain is the tenant slug
  if (host.endsWith('.lvh.me')) {
    const parts = host.split('.');
    if (parts.length >= 3) {
      return parts[0];
    }
    return null;
  }

  // Production: *.emme.app → first subdomain is the tenant slug
  if (host.endsWith('.emme.app') || host.endsWith('.emme.local')) {
    const parts = host.split('.');
    if (parts.length >= 3) {
      return parts[0];
    }
    return null;
  }

  // Other domains: take the first subdomain
  const parts = host.split('.');
  if (parts.length > 2) {
    return parts[0];
  }

  return null;
}
