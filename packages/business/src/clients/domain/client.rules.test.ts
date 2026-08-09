import { describe, expect, it } from "vitest";

import { normalizeClientName } from "./client.rules.js";

describe("normalizeClientName", () => {
  it("trims names and collapses repeated whitespace", () => {
    expect(normalizeClientName("  Ana   López  ")).toBe("Ana López");
  });

  it("rejects a name that becomes empty after normalization", () => {
    expect(() => normalizeClientName("   ")).toThrow("Client name is required");
  });
});
