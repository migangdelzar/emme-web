// @vitest-environment happy-dom

import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Switch } from './Switch.js';

describe('Switch', () => {
  afterEach(cleanup);

  it('has an accessible name and toggles from the keyboard', async () => {
    const user = userEvent.setup();

    render(<Switch aria-label="Calendar sync" />);
    const control = screen.getByRole('switch', { name: 'Calendar sync' });

    await user.tab();
    await user.keyboard('[Space]');

    expect(document.activeElement).toBe(control);
    expect(control.getAttribute('aria-checked')).toBe('true');
  });

  it('does not activate when disabled', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(<Switch aria-label="Calendar sync" disabled onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByRole('switch', { name: 'Calendar sync' }));

    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
