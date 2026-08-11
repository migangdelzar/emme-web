import type { ZodIssue } from "zod";
import { ROOT_ERROR_KEY } from "./validation-error.js";

export function getIssueFieldPath(issue: ZodIssue): string {
  return issue.path.map(String).join(".") || ROOT_ERROR_KEY;
}
