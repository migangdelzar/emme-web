import type { ReactNode } from 'react';

export interface ErrorStateProps {
  readonly title?: string;
  readonly message: string;
  readonly onRetry?: () => void;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps): ReactNode {
  return (
    <section data-slot="error-state" role="alert" aria-live="assertive">
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry ? <button type="button" onClick={onRetry}>Retry</button> : null}
    </section>
  );
}
