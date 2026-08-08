// @vitest-environment happy-dom

import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from './Modal.js';

describe('Dialog', () => {
  afterEach(cleanup);

  it('opens from the keyboard, moves focus inside, and returns focus on escape', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open profile</DialogTrigger>
        <DialogContent>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Update the profile details.</DialogDescription>
          <button>Save profile</button>
        </DialogContent>
      </Dialog>,
    );
    const trigger = screen.getByRole('button', { name: 'Open profile' });

    await user.tab();
    await user.keyboard('{Enter}');

    const dialog = await screen.findByRole('dialog', { name: 'Edit profile' });
    expect(dialog.contains(document.activeElement)).toBe(true);

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog', { name: 'Edit profile' })).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('does not open from a disabled trigger', async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger disabled>Open profile</DialogTrigger>
        <DialogContent>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Update the profile details.</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    const trigger = screen.getByRole('button', { name: 'Open profile' });

    await user.tab();
    await user.keyboard('{Enter}');

    expect(trigger).toHaveProperty('disabled', true);
    expect(screen.queryByRole('dialog', { name: 'Edit profile' })).toBeNull();
  });
});
