// @vitest-environment happy-dom

import { render, screen } from '@testing-library/react';
import { it, expect, vi } from 'vitest';

import { ErrorState } from './ErrorState.js';

it('renders the error and exposes a retry action', async () => {
  const onRetry = vi.fn();
  render(<ErrorState title="Unable to load" message="Try again later." onRetry={onRetry} />);

  expect(screen.getByRole('alert')).toHaveTextContent('Try again later.');
  screen.getByRole('button', { name: 'Retry' }).click();
  expect(onRetry).toHaveBeenCalledOnce();
});
