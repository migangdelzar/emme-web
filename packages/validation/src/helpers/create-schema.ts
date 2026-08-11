import type { ZodSchema } from "zod";
import { formatIssues } from "./format-issues.js";
import type { ValidationResult } from "../types/validation.types.js";

export function parseWithSchema<T>(
  schema: ZodSchema<T>,
  input: unknown,
): ValidationResult<T> {
  const result = schema.safeParse(input);

  return result.success
    ? { success: true, data: result.data }
    : { success: false, errors: formatIssues(result.error.issues) };
}
