// @vitest-environment happy-dom

import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { Textarea } from './Textarea.js';

describe('Textarea', () => {
  afterEach(cleanup);

  it('uses its label as its accessible name and accepts keyboard input', async () => {
    const user = userEvent.setup();

    render(
      <label>
        Notes
        <Textarea />
      </label>,
    );
    const textarea = screen.getByRole('textbox', { name: 'Notes' });

    await user.tab();
    await user.keyboard('Keyboard note');

    expect(document.activeElement).toBe(textarea);
    expect(textarea).toHaveProperty('value', 'Keyboard note');
  });

  it('does not accept keyboard input when disabled', async () => {
    const user = userEvent.setup();

    render(<Textarea aria-label="Notes" disabled defaultValue="Existing note" />);
    const textarea = screen.getByRole('textbox', { name: 'Notes' });

    await user.type(textarea, ' new');

    expect(textarea).toHaveProperty('disabled', true);
    expect(textarea).toHaveProperty('value', 'Existing note');
  });
});
