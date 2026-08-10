import { describe, expect, it } from 'vitest';

import { createSessionModel, selectDefaultTenant } from './session-model.js';
import type { CurrentUser, TenantMembership } from '@emme/api';

function createCurrentUser(
  memberships: TenantMembership[],
  overrides: Partial<CurrentUser> = {}
): CurrentUser {
  return {
    userId: 'user-1',
    email: 'owner@example.com',
    displayName: 'Owner',
    memberships,
    profile: null,
    ...overrides,
  };
}

describe('createSessionModel', () => {
  it('returns signed out when no access token is available', () => {
    const session = createSessionModel({
      accessToken: null,
      currentUser: null,
      memberships: [],
      selectedTenantSlug: null,
    });

    expect(session).toEqual({ status: 'signedOut' });
  });

  it('requires tenant selection when the user has multiple active tenants and no selection', () => {
    const memberships = [
      createMembership({ tenantSlug: 'studio-a' }),
      createMembership({ tenantSlug: 'studio-b' }),
    ];
    const user = createCurrentUser(memberships);

    const session = createSessionModel({
      accessToken: 'token',
      currentUser: user,
      memberships,
      selectedTenantSlug: null,
    });

    expect(session).toEqual({
      status: 'tenantRequired',
      user,
      memberships,
    });
  });

  it('selects the only active tenant automatically', () => {
    const membership = createMembership({ tenantSlug: 'studio-a' });
    const user = createCurrentUser([membership]);

    const session = createSessionModel({
      accessToken: 'token',
      currentUser: user,
      memberships: [membership],
      selectedTenantSlug: null,
    });

    expect(session).toEqual({
      status: 'ready',
      user,
      tenant: membership,
    });
  });

  it('uses the selected active tenant when present', () => {
    const studioA = createMembership({ tenantSlug: 'studio-a' });
    const studioB = createMembership({ tenantSlug: 'studio-b', role: 'MANAGER' });
    const user = createCurrentUser([studioA, studioB], {
      email: 'manager@example.com',
      displayName: 'Manager',
    });

    const session = createSessionModel({
      accessToken: 'token',
      currentUser: user,
      memberships: [studioA, studioB],
      selectedTenantSlug: 'studio-b',
    });

    expect(session).toMatchObject({
      status: 'ready',
      tenant: studioB,
    });
  });

  it('ignores suspended tenants for default tenant selection', () => {
    const active = createMembership({ tenantSlug: 'studio-a' });
    const suspended = createMembership({ tenantSlug: 'studio-b', status: 'SUSPENDED' });

    expect(selectDefaultTenant([suspended, active])).toEqual(active);
  });
});

function createMembership(overrides: Partial<TenantMembership> = {}): TenantMembership {
  return {
    tenantId: 'tenant-1',
    tenantSlug: 'studio-a',
    tenantName: 'Studio A',
    displayName: 'Studio A',
    role: 'OWNER',
    status: 'ACTIVE',
    permissions: ['platform:access'],
    ...overrides,
  };
}
