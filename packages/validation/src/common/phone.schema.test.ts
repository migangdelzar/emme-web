import { describe, expect, it } from "vitest";
import { phoneSchema } from "./phone.schema.js";

describe("phoneSchema", () => {
  it("accepts an E.164 phone number", () => {
    expect(phoneSchema.safeParse("+525512345678").success).toBe(true);
  });

  it("rejects a phone number without an international prefix", () => {
    expect(phoneSchema.safeParse("5512345678").success).toBe(false);
  });
});
