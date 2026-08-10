export type ErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_FAILED'
  | 'REQUEST_FAILED'
  | 'UNKNOWN';

export class ApplicationError extends Error {
  public constructor(
    message: string,
    public readonly code: ErrorCode,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = 'ApplicationError';
  }
}

export class AuthorizationError extends ApplicationError {
  public constructor(public readonly permission: string) {
    super(`Missing permission: ${permission}`, 'FORBIDDEN');
    this.name = 'AuthorizationError';
  }
}
