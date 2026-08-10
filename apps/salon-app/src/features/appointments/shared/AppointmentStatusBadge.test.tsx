// @vitest-environment happy-dom

import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AppointmentStatusBadge } from './AppointmentStatusBadge.js';

afterEach(cleanup);

describe('AppointmentStatusBadge', () => {
  it('renders the supplied status label without knowing salon-specific copy', () => {
    render(<AppointmentStatusBadge status="confirmed" label="Confirmed" />);

    expect(screen.getByText('Confirmed').getAttribute('data-status')).toBe('confirmed');
  });
});
