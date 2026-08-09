import type { ReactNode } from 'react';

export interface FormFieldProps {
  readonly id: string;
  readonly label: string;
  readonly error?: string;
  readonly hint?: string;
  readonly children: ReactNode;
}

export function FormField({ id, label, error, hint, children }: FormFieldProps): ReactNode {
  return (
    <div data-slot="form-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error ? <p id={`${id}-hint`}>{hint}</p> : null}
      {error ? (
        <p id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
