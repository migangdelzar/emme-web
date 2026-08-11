import { ApplicationError } from './application-error.js';

export function normalizeError(error: unknown): ApplicationError {
  if (error instanceof ApplicationError) {
    return error;
  }

  return new ApplicationError('An unexpected error occurred', 'UNKNOWN', error);
}
