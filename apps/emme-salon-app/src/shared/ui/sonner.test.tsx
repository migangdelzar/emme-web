import { render, screen } from '@testing-library/react';
import { toast } from 'sonner';
import { afterEach, describe, expect, it } from 'vitest';

import { Toaster } from './sonner';

describe('Toaster', () => {
  afterEach(() => {
    toast.dismiss();
  });

  it('renders a closeable notification at the app default top-right position', async () => {
    render(<Toaster />);

    toast('Appointment saved');

    const message = await screen.findByText('Appointment saved');
    const toaster = message.closest('[data-sonner-toaster]');

    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    expect(toaster).toHaveAttribute('data-y-position', 'top');
    expect(toaster).toHaveAttribute('data-x-position', 'right');
  });
});
