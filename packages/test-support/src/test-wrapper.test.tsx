import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { useAuth, useCurrentTenant } from '@emme/core';
import { useTranslation } from '@emme/i18n';
import { createTestWrapper } from './test-wrapper.js';

function Probe(): ReactNode {
  const auth = useAuth();
  const tenant = useCurrentTenant();
  const { locale } = useTranslation();

  return createElement('output', null, `${auth.status}|${tenant.slug}|${locale}`);
}

describe('createTestWrapper', () => {
  it('composes fresh query and application providers with per-test overrides', () => {
    const Wrapper = createTestWrapper({
      auth: { status: 'ready' },
      tenant: { slug: 'downtown' },
      locale: 'es-MX',
    });

    expect(renderToStaticMarkup(createElement(Wrapper, null, createElement(Probe)))).toContain(
      'ready|downtown|es-MX',
    );
  });

  it('creates isolated provider state for separate wrappers', () => {
    const first = createTestWrapper({ tenant: { slug: 'first' } });
    const second = createTestWrapper({ tenant: { slug: 'second' } });

    expect(renderToStaticMarkup(createElement(first, null, createElement(Probe)))).toContain(
      'signedOut|first|en-US',
    );
    expect(renderToStaticMarkup(createElement(second, null, createElement(Probe)))).toContain(
      'signedOut|second|en-US',
    );
  });
});
