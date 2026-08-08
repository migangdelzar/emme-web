import { describe, expect, it } from "vitest";
import { emailSchema } from "./email.schema.js";

describe("emailSchema", () => {
  it("accepts a valid email address", () => {
    expect(emailSchema.safeParse("owner@emme.mx").success).toBe(true);
  });

  it("rejects an invalid email address", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
  });
});
