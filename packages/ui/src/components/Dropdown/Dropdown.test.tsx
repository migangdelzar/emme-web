// @vitest-environment happy-dom

import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './Dropdown.js';

describe('DropdownMenu', () => {
  afterEach(cleanup);

  it('opens from the keyboard and activates an accessible item', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onEdit}>Edit appointment</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.tab();
    await user.keyboard('{Enter}{Enter}');

    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('does not activate a disabled item', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled onSelect={onDelete}>Delete appointment</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole('menuitem', { name: 'Delete appointment' }));

    expect(onDelete).not.toHaveBeenCalled();
  });

  it('toggles an accessible checkbox item from the keyboard and leaves disabled checkbox items unchanged', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const onDisabledChange = vi.fn();

    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked={false} onCheckedChange={onCheckedChange}>
            Show archived
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem disabled onCheckedChange={onDisabledChange}>
            Show cancelled
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const checkbox = screen.getByRole('menuitemcheckbox', { name: 'Show archived' });
    const disabledCheckbox = screen.getByRole('menuitemcheckbox', { name: 'Show cancelled' });

    checkbox.focus();
    await user.keyboard('[Space]');
    await user.click(disabledCheckbox);

    expect(checkbox.getAttribute('aria-checked')).toBe('false');
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(disabledCheckbox.getAttribute('data-disabled')).not.toBeNull();
    expect(onDisabledChange).not.toHaveBeenCalled();
  });

  it('selects an accessible radio item from the keyboard and leaves disabled radio items unchanged', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup onValueChange={onValueChange} value="week">
            <DropdownMenuRadioItem value="week">This week</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="month">This month</DropdownMenuRadioItem>
            <DropdownMenuRadioItem disabled value="year">This year</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const week = screen.getByRole('menuitemradio', { name: 'This week' });
    const year = screen.getByRole('menuitemradio', { name: 'This year' });

    week.focus();
    await user.keyboard('{ArrowDown}{Enter}');
    await user.click(year);

    expect(onValueChange).toHaveBeenCalledWith('month');
    expect(year.getAttribute('data-disabled')).not.toBeNull();
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('opens an accessible submenu from the keyboard and leaves disabled submenu triggers closed', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Export</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled>Import</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Import CSV</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const exportTrigger = screen.getByRole('menuitem', { name: 'Export' });
    const importTrigger = screen.getByRole('menuitem', { name: 'Import' });

    exportTrigger.focus();
    await user.keyboard('{ArrowRight}');

    expect(await screen.findByRole('menuitem', { name: 'Export as CSV' })).not.toBeNull();

    await user.click(importTrigger);

    expect(importTrigger.getAttribute('data-disabled')).not.toBeNull();
    expect(screen.queryByRole('menuitem', { name: 'Import CSV' })).toBeNull();
  });
});
