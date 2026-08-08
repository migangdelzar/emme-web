// @vitest-environment happy-dom

import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ConfirmDialog.js';

describe('AlertDialog', () => {
  afterEach(cleanup);

  it('opens from the keyboard and moves focus to its safe cancel action', async () => {
    const user = userEvent.setup();

    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete appointment</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Delete appointment?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Delete</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>,
    );

    await user.tab();
    await user.keyboard('{Enter}');

    await screen.findByRole('alertdialog', { name: 'Delete appointment?' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancel' }));
  });

  it('does not open from a disabled trigger', async () => {
    const user = userEvent.setup();

    render(
      <AlertDialog>
        <AlertDialogTrigger disabled>Delete appointment</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Delete appointment?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Delete</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>,
    );
    const trigger = screen.getByRole('button', { name: 'Delete appointment' });

    await user.tab();
    await user.keyboard('{Enter}');

    expect(trigger).toHaveProperty('disabled', true);
    expect(screen.queryByRole('alertdialog', { name: 'Delete appointment?' })).toBeNull();
  });
});
