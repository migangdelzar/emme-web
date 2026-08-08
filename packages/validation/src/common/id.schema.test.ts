import { describe, expect, it } from "vitest";
import { idSchema } from "./id.schema.js";

describe("idSchema", () => {
  it("accepts an RFC-compliant UUID", () => {
    expect(idSchema.safeParse("550e8400-e29b-41d4-a716-446655440000").success).toBe(true);
  });

  it("rejects a non-UUID identifier", () => {
    expect(idSchema.safeParse("client-123").success).toBe(false);
  });
});
