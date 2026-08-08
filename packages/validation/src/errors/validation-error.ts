export const ROOT_ERROR_KEY = "_form";

export interface ValidationIssue {
  readonly path: readonly string[];
  readonly code: string;
  readonly message: string;
}

export class ValidationError extends Error {
  readonly issues: readonly ValidationIssue[];

  constructor(issues: readonly ValidationIssue[]) {
    super("Validation failed");
    this.name = "ValidationError";
    this.issues = issues;
  }
}
