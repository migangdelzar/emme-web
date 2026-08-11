import { describe, expect, it } from "vitest";
import { dateSchema } from "./date.schema.js";

describe("dateSchema", () => {
  it("accepts a valid ISO calendar date", () => {
    expect(dateSchema.safeParse("2026-08-08").success).toBe(true);
  });

  it("rejects an invalid calendar date", () => {
    expect(dateSchema.safeParse("2026-02-29").success).toBe(false);
  });
});
