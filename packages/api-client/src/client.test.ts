import { describe, expect, it, vi } from "vitest";

import { ApiHttpError, createApiClient, createHttpClient } from "./index.js";

type FetchCall = [RequestInfo | URL, RequestInit?];
type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

describe("createApiClient", () => {
  it("sends auth and tenant context headers when providers return values", async () => {
    const fetcher = vi.fn<Fetcher>(async () =>
      new Response(JSON.stringify({ status: "UP" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const client = createApiClient({
      baseUrl: "https://api.emme.app/",
      getAccessToken: async () => "access-token",
      getTenantSlug: () => "studio-a",
      fetcher,
    });

    await client.getHealth();

    const [, init] = fetcher.mock.calls[0] as FetchCall;
    expect(init?.headers).toMatchObject({
      Accept: "application/json",
      Authorization: "Bearer access-token",
      "X-Emme-Tenant-Slug": "studio-a",
    });
  });

  it("does not send optional auth or tenant headers when providers are absent", async () => {
    const fetcher = vi.fn<Fetcher>(async () => new Response("{}", { status: 200 }));
    const client = createApiClient({ baseUrl: "https://api.emme.app", fetcher });

    await client.getHealth();

    const [, init] = fetcher.mock.calls[0] as FetchCall;
    expect(init?.headers).toEqual({ Accept: "application/json" });
  });

  it("throws typed HTTP errors with parsed response body", async () => {
    const fetcher = vi.fn<Fetcher>(async () =>
      new Response(JSON.stringify({ error: "NOT_A_TENANT_MEMBER" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    );
    const client = createApiClient({ baseUrl: "https://api.emme.app", fetcher });

    await expect(client.getHealth()).rejects.toMatchObject({
      status: 403,
      body: { error: "NOT_A_TENANT_MEMBER" },
    });
    await expect(client.getHealth()).rejects.toBeInstanceOf(ApiHttpError);
  });

  it("preserves a backend problem code for localized UI mapping", async () => {
    const fetcher = vi.fn<Fetcher>(async () =>
      new Response(JSON.stringify({ status: 409, code: "CALENDAR_SYNC_CONFLICT" }), {
        status: 409,
        headers: { "Content-Type": "application/problem+json" },
      }),
    );
    const client = createApiClient({ baseUrl: "https://api.emme.app", fetcher });

    await expect(client.getHealth()).rejects.toMatchObject({
      status: 409,
      code: "CALENDAR_SYNC_CONFLICT",
    });
  });

  it("builds URLs without duplicate slashes", async () => {
    const fetcher = vi.fn<Fetcher>(async () => new Response("{}", { status: 200 }));
    const client = createApiClient({ baseUrl: "https://api.emme.app/", fetcher });

    await client.getHealth();

    const [input] = fetcher.mock.calls[0] as FetchCall;
    expect(input.toString()).toBe("https://api.emme.app/q/health");
  });

  it("rejects blank base URLs before issuing a request", async () => {
    const fetcher = vi.fn<Fetcher>(async () => new Response("{}", { status: 200 }));

    expect(() => createApiClient({ baseUrl: " ", fetcher })).toThrow("API base URL is required");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("gets the current user from the platform session endpoint", async () => {
    const fetcher = vi.fn<Fetcher>(async () =>
      new Response(
        JSON.stringify({
          userId: "user-1",
          email: "owner@example.com",
          displayName: "Owner",
          memberships: [],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    );
    const client = createApiClient({ baseUrl: "https://api.emme.app", fetcher });

    await expect(client.getCurrentUser()).resolves.toMatchObject({
      userId: "user-1",
      email: "owner@example.com",
    });

    const [input] = fetcher.mock.calls[0] as FetchCall;
    expect(input.toString()).toBe("https://api.emme.app/api/me");
  });

  it("lists tenant memberships from the platform tenant endpoint", async () => {
    const fetcher = vi.fn<Fetcher>(async () =>
      new Response(
        JSON.stringify({
          memberships: [
            {
              tenantId: "tenant-1",
              tenantSlug: "studio-a",
              displayName: "Studio A",
              role: "OWNER",
              status: "ACTIVE",
            },
          ],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    );
    const client = createApiClient({ baseUrl: "https://api.emme.app", fetcher });

    await expect(client.listTenantMemberships()).resolves.toEqual([
      {
        tenantId: "tenant-1",
        tenantSlug: "studio-a",
        displayName: "Studio A",
        role: "OWNER",
        status: "ACTIVE",
      },
    ]);

    const [input] = fetcher.mock.calls[0] as FetchCall;
    expect(input.toString()).toBe("https://api.emme.app/api/me/tenants");
  });
});

describe("createHttpClient", () => {
  it("shares auth, tenant, and problem-details behavior with domain clients", async () => {
    const fetcher = vi.fn<Fetcher>(async () =>
      new Response(JSON.stringify({ detail: "Conflict", code: "CONFLICT" }), {
        status: 409,
        headers: { "Content-Type": "application/problem+json" },
      }),
    );
    const client = createHttpClient({
      baseUrl: "https://api.emme.app",
      getAccessToken: () => "access-token",
      getTenantSlug: () => "studio-a",
      fetcher,
    });

    await expect(client.post("/api/v1/appointments", {})).rejects.toMatchObject({
      status: 409,
      code: "CONFLICT",
    });
    expect(fetcher.mock.calls[0]?.[1]?.headers).toMatchObject({
      Authorization: "Bearer access-token",
      "X-Emme-Tenant-Slug": "studio-a",
    });
  });

  it("returns undefined for successful no-content responses", async () => {
    const fetcher = vi.fn<Fetcher>(async () => new Response(null, { status: 204 }));
    const client = createHttpClient({ baseUrl: "https://api.emme.app", fetcher });

    await expect(client.delete("/api/v1/appointments/appointment-1")).resolves.toBeUndefined();
  });
});
