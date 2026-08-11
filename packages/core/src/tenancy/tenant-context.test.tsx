import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TenantProvider } from './tenant-provider.js';
import { useCurrentTenant } from './use-current-tenant.js';

function TenantProbe(): ReactNode {
  const tenant = useCurrentTenant();
  return createElement('output', null, `${tenant.slug}:${tenant.name}`);
}

describe('TenantProvider', () => {
  it('exposes the current tenant through a public hook', () => {
    const markup = renderToStaticMarkup(
      createElement(
        TenantProvider,
        { value: { id: 'tenant-1', slug: 'studio', name: 'Studio' } },
        createElement(TenantProbe),
      ),
    );

    expect(markup).toBe('<output>studio:Studio</output>');
  });
});
