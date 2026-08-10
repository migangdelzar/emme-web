import type { ZodIssue } from "zod";
import { getIssueFieldPath } from "../errors/validation-error.mapper.js";
import type { FieldErrors } from "../types/validation.types.js";

export function formatIssues(issues: readonly ZodIssue[]): FieldErrors {
  return issues.reduce<FieldErrors>((errors, issue) => {
    const field = getIssueFieldPath(issue);
    errors[field] = [...(errors[field] ?? []), issue.message];
    return errors;
  }, {});
}
