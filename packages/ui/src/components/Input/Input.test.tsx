// @vitest-environment happy-dom

import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { Input } from './Input.js';

describe('Input', () => {
  afterEach(cleanup);

  it('uses its label as its accessible name and accepts keyboard input', async () => {
    const user = userEvent.setup();

    render(
      <label>
        Email address
        <Input />
      </label>,
    );
    const input = screen.getByRole('textbox', { name: 'Email address' });

    await user.tab();
    await user.keyboard('hello@example.com');

    expect(document.activeElement).toBe(input);
    expect(input).toHaveProperty('value', 'hello@example.com');
  });

  it('does not accept keyboard input when disabled', async () => {
    const user = userEvent.setup();

    render(<Input aria-label="Email address" disabled defaultValue="existing" />);
    const input = screen.getByRole('textbox', { name: 'Email address' });

    await user.type(input, 'new');

    expect(input).toHaveProperty('disabled', true);
    expect(input).toHaveProperty('value', 'existing');
  });
});
