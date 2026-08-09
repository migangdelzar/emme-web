// @vitest-environment happy-dom

import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { PermissionGuard } from './permission-guard.js';
import { PermissionProvider } from './permission-provider.js';
import type { Permission } from '../access-control/permissions.js';

describe('PermissionProvider', () => {
  function renderGuarded(permissions: readonly Permission[], fallback: ReactNode): string {
    return renderToStaticMarkup(
      createElement(
        PermissionProvider,
        { permissions },
        createElement(
          PermissionGuard,
          { permission: 'appointments:view', fallback },
          createElement('p', null, 'Appointments'),
        ),
      ),
    );
  }

  it('renders guarded content only when the permission is granted', () => {
    const markup = renderGuarded(['appointments:view'], createElement('p', null, 'Denied'));

    expect(markup).toContain('Appointments');
    expect(markup).not.toContain('Denied');
  });

  it('renders the fallback when the permission is missing', () => {
    const markup = renderGuarded([], createElement('p', null, 'Denied'));

    expect(markup).not.toContain('Appointments');
    expect(markup).toContain('Denied');
  });
});
