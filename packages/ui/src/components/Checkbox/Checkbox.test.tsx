// @vitest-environment happy-dom

import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Checkbox } from './Checkbox.js';

describe('Checkbox', () => {
  afterEach(cleanup);

  it('has an accessible name and toggles from the keyboard', async () => {
    const user = userEvent.setup();

    render(<Checkbox aria-label="Email notifications" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Email notifications' });

    await user.tab();
    await user.keyboard('[Space]');

    expect(document.activeElement).toBe(checkbox);
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
  });

  it('does not activate when disabled', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(
      <Checkbox
        aria-label="Email notifications"
        disabled
        onCheckedChange={onCheckedChange}
      />,
    );

    await user.click(screen.getByRole('checkbox', { name: 'Email notifications' }));

    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
