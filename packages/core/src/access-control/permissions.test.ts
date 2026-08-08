import { describe, expect, it } from "vitest";

import { can, hasPermission } from "./permissions.js";

describe("hasPermission", () => {
  it("returns true when the permission is granted", () => {
    expect(hasPermission(["clients:read", "clients:create"], "clients:read")).toBe(true);
  });

  it("returns false when the permission is missing", () => {
    expect(hasPermission(["clients:read"], "clients:delete")).toBe(false);
  });

  it("provides the application-facing can alias", () => {
    expect(can(["clients:read"], "clients:read")).toBe(true);
  });
});
