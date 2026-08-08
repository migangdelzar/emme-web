import type { CurrentUser, TenantMembership } from '@emme/api';

export type AppSession =
  | { status: 'signedOut' }
  | { status: 'tenantRequired'; user: CurrentUser; memberships: TenantMembership[] }
  | { status: 'ready'; user: CurrentUser; tenant: TenantMembership };

export interface SessionModelInput {
  accessToken: string | null;
  currentUser: CurrentUser | null;
  memberships: TenantMembership[];
  selectedTenantSlug: string | null;
}

export function createSessionModel(input: SessionModelInput): AppSession {
  if (!input.accessToken || !input.currentUser) {
    return { status: 'signedOut' };
  }

  const activeMemberships = input.memberships.filter(
    (membership) => membership.status === 'ACTIVE'
  );
  const selectedTenant = input.selectedTenantSlug
    ? activeMemberships.find((membership) => membership.tenantSlug === input.selectedTenantSlug)
    : null;
  const defaultTenant = selectedTenant ?? selectDefaultTenant(activeMemberships);

  if (defaultTenant) {
    return {
      status: 'ready',
      user: input.currentUser,
      tenant: defaultTenant,
    };
  }

  return {
    status: 'tenantRequired',
    user: input.currentUser,
    memberships: activeMemberships,
  };
}

export function selectDefaultTenant(memberships: TenantMembership[]): TenantMembership | null {
  const activeMemberships = memberships.filter((membership) => membership.status === 'ACTIVE');
  return activeMemberships.length === 1 ? activeMemberships[0]! : null;
}
