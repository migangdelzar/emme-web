export type ApiErrorCode = 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION' | 'UNKNOWN';

export interface ApiError {
  readonly code: ApiErrorCode;
  readonly message: string;
  readonly details?: Readonly<Record<string, unknown>>;
}

export function normalizeApiError(value: unknown): ApiError {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    const code = record.code;
    const message = record.message;

    if (
      (code === 'UNAUTHENTICATED' ||
        code === 'FORBIDDEN' ||
        code === 'NOT_FOUND' ||
        code === 'VALIDATION' ||
        code === 'UNKNOWN') &&
      typeof message === 'string'
    ) {
      return { code, message };
    }
  }

  return { code: 'UNKNOWN', message: 'Request failed' };
}
