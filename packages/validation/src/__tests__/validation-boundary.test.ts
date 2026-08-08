import { describe, expect, it } from "vitest";
import { z } from "zod";
import type { FieldErrors, ValidationResult } from "@emme/validation";

describe("@emme/validation public boundary", () => {
  it("represents valid parsed data as a typed validation result", () => {
    const schema = z.object({ name: z.string() });
    const parsed = schema.safeParse({ name: "Emme" });
    const result: ValidationResult<{ name: string }> = parsed.success
      ? { success: true, data: parsed.data }
      : { success: false, errors: {} };

    expect(result).toEqual({ success: true, data: { name: "Emme" } });
  });

  it("maps Zod issues to field errors with all messages per field", () => {
    const schema = z.object({
      name: z
        .string()
        .min(3, "Name is too short")
        .regex(/^[A-Z]+$/, "Name must be uppercase"),
    });
    const parsed = schema.safeParse({ name: "a" });
    const errors: FieldErrors = {};

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path.join(".") || "_form";
        errors[field] = [...(errors[field] ?? []), issue.message];
      }
    }

    expect(errors).toEqual({
      name: ["Name is too short", "Name must be uppercase"],
    });
  });
});
