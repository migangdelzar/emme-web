import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  formatIssues,
  parseWithSchema,
  type FieldErrors,
  type ValidationResult,
} from "@emme/validation";

describe("@emme/validation public boundary", () => {
  it("represents valid parsed data as a typed validation result", () => {
    const schema = z.object({ name: z.string() });
    const parsed = schema.safeParse({ name: "Emme" });
    const result: ValidationResult<{ name: string }> = parsed.success
      ? { success: true, data: parsed.data }
      : { success: false, errors: {} };

    expect(result).toEqual({ success: true, data: { name: "Emme" } });
  });

  it("maps nested paths and all messages per field deterministically", () => {
    const schema = z.object({
      name: z
        .string()
        .min(3, "Name is too short")
        .regex(/^[A-Z]+$/, "Name must be uppercase"),
    });
    const parsed = schema.safeParse({ name: "a" });
    const errors: FieldErrors = parsed.success ? {} : formatIssues(parsed.error.issues);

    expect(errors).toEqual({
      name: ["Name is too short", "Name must be uppercase"],
    });
  });

  it("maps nested, root, and repeated field issues in source order", () => {
    const schema = z
      .object({
        contact: z.object({
          email: z.string().min(10, "Email is too short").regex(/@/, "Email must include @"),
        }),
      })
      .refine(() => false, "Form is invalid");
    const parsed = schema.safeParse({ contact: { email: "a" } });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(formatIssues(parsed.error.issues)).toEqual({
        "contact.email": ["Email is too short", "Email must include @"],
        _form: ["Form is invalid"],
      });
    }
  });

  it("returns typed data when parsing succeeds", () => {
    const result = parseWithSchema(z.object({ name: z.string() }), { name: "Emme" });

    expect(result).toEqual({ success: true, data: { name: "Emme" } });
  });

  it("returns mapped field errors when parsing fails", () => {
    const result = parseWithSchema(z.object({ name: z.string().min(3, "Name is too short") }), {
      name: "a",
    });

    expect(result).toEqual({ success: false, errors: { name: ["Name is too short"] } });
  });
});
