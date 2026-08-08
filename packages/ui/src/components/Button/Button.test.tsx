// @vitest-environment happy-dom

import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Button } from './Button.js';

describe('Button', () => {
  afterEach(cleanup);

  it('has an accessible name and activates from the keyboard', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Save changes</Button>);
    const button = screen.getByRole('button', { name: 'Save changes' });

    await user.tab();
    expect(document.activeElement).toBe(button);
    await user.keyboard('{Enter}');
    await user.keyboard('[Space]');

    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('does not activate when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick}>
        Save changes
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Save changes' });

    expect(button).toHaveProperty('disabled', true);
    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it('marks loading buttons busy and prevents activation', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button loading onClick={onClick}>
        Save changes
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Save changes' });

    expect(button).toHaveProperty('disabled', true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });
});
