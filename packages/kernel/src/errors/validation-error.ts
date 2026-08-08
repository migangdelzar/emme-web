import { DomainError } from './domain-error.js';

export interface ValidationIssue {
  readonly path: readonly string[];
  readonly code: string;
  readonly message: string;
}

export class ValidationError extends DomainError {
  public readonly issues: readonly ValidationIssue[];

  public constructor(issues: readonly ValidationIssue[]) {
    super('validation.failed', 'Validation failed');
    this.name = 'ValidationError';
    this.issues = issues;
  }
}
