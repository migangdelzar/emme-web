export type FieldErrors = Record<string, string[]>;

export type ValidationResult<T> =
  | { success: true; data: T; errors?: never }
  | { success: false; errors: FieldErrors; data?: never };
