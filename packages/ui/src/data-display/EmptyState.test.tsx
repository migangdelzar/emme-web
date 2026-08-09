// @vitest-environment happy-dom

import { render, screen } from '@testing-library/react';
import { it, expect } from 'vitest';

import { EmptyState } from './EmptyState.js';

it('renders a meaningful empty-state heading and description', () => {
  render(<EmptyState title="No results" description="Try another search." />);

  expect(screen.getByRole('heading', { name: 'No results' })).toBeInTheDocument();
  expect(screen.getByText('Try another search.')).toBeInTheDocument();
});
