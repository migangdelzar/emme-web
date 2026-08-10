import type { TenantRole, TenantStatus } from "../common/common.types.js";

export interface TenantMembership {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  displayName: string; // alias for tenantName
  role: TenantRole;
  status: TenantStatus;
  permissions: string[]; // RBAC permission codes
}

export interface BusinessProfile {
  tenantId: string;
  businessName: string | null;
  ownerName: string | null;
  monthlyGoal: string | null;
  workingHours: string | null;
  language: string | null;
  notificationsEnabled: boolean;
}

export interface MeResponse {
  userId: string;
  email: string;
  displayName: string;
  memberships: TenantMembership[];
  profile: BusinessProfile | null;
}

export type CurrentUser = MeResponse;

export interface TenantMembershipsResponse {
  memberships: TenantMembership[];
}
