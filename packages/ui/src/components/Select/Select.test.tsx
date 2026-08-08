// @vitest-environment happy-dom

import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select.js';

function ExampleSelect({ disabled = false, onValueChange = vi.fn() }: { disabled?: boolean; onValueChange?: (value: string) => void }) {
  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger aria-label="Appointment status" disabled={disabled}>
        <SelectValue placeholder="Choose a status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="confirmed">Confirmed</SelectItem>
      </SelectContent>
    </Select>
  );
}

describe('Select', () => {
  afterEach(cleanup);

  it('has an accessible trigger name and selects an option from the keyboard', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(<ExampleSelect onValueChange={onValueChange} />);
    const trigger = screen.getByRole('combobox', { name: 'Appointment status' });

    await user.tab();
    await user.keyboard('{ArrowDown}{Enter}');

    expect(document.activeElement).toBe(trigger);
    expect(onValueChange).toHaveBeenCalledWith('confirmed');
  });

  it('does not open or change value when disabled', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(<ExampleSelect disabled onValueChange={onValueChange} />);
    const trigger = screen.getByRole('combobox', { name: 'Appointment status' });

    await user.click(trigger);

    expect(trigger).toHaveProperty('disabled', true);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
