// @vitest-environment happy-dom
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AppointmentDateTime } from './AppointmentDateTime.js';

afterEach(cleanup);

describe('AppointmentDateTime', () => {
  it('renders an accessible date and time label', () => {
    render(<AppointmentDateTime date="2026-01-15" startTime="10:00" endTime="11:00" />);

    expect(screen.getByRole('time')).toHaveAttribute('aria-label', 'Appointment time');
    expect(screen.getByRole('time')).toHaveTextContent('10:00');
  });
});
