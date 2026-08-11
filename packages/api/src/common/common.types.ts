/** Shared types — no domain dependencies. */

export const PACKAGE_VERSION = "0.0.0";

export type TenantRole = "OWNER" | "MANAGER" | "STAFF";

export type TenantStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export interface HealthResponse {
  status: "UP" | "DOWN";
  checks?: Array<{
    name: string;
    status: "UP" | "DOWN";
    data?: Record<string, unknown>;
  }>;
}
