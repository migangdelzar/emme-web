// @vitest-environment happy-dom
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AppointmentSummaryCard } from './AppointmentSummaryCard.js';

afterEach(cleanup);

const appointment = {
  id: 'appointment-1',
  clientId: 'client-1',
  serviceId: 'service-1',
  date: '2026-01-15',
  startTime: '10:00',
  endTime: '11:00',
  status: 'confirmed' as const,
};

describe('AppointmentSummaryCard', () => {
  it('renders appointment details and status', () => {
    render(
      <AppointmentSummaryCard
        appointment={appointment}
        customerName="Ada Lovelace"
        serviceName="Cut and style"
        statusLabel="Confirmed"
      />,
    );

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Cut and style')).toBeInTheDocument();
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
  });

  it('renders a loading state without appointment data', () => {
    render(<AppointmentSummaryCard appointment={null} loading statusLabel="Loading" />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading');
  });
});
