import type { ComponentProps, ReactNode } from 'react';

export interface ButtonProps extends ComponentProps<'button'> {
  loading?: boolean;
  children?: ReactNode;
}

export function Button({
  loading = false,
  disabled = false,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {children}
    </button>
  );
}
