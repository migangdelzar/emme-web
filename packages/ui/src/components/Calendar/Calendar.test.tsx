// @vitest-environment happy-dom

import { cleanup, render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Calendar } from './Calendar.js';

describe('Calendar', () => {
  afterEach(cleanup);

  it('exposes date buttons to the keyboard and selects an enabled day', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { container } = render(
      <Calendar defaultMonth={new Date(2026, 7, 1)} mode="single" onSelect={onSelect} />,
    );
    const day = container.querySelector<HTMLButtonElement>('button[data-day]');

    expect(day).not.toBeNull();
    day?.focus();
    await user.keyboard('{Enter}');

    expect(day?.getAttribute('aria-label')).toBeTruthy();
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('does not select a disabled day', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { container } = render(
      <Calendar
        defaultMonth={new Date(2026, 7, 1)}
        disabled={{ before: new Date(2026, 8, 1) }}
        mode="single"
        onSelect={onSelect}
      />,
    );
    const day = container.querySelector<HTMLButtonElement>('button[data-day]');

    expect(day).not.toBeNull();
    await user.click(day!);

    expect(day).toHaveProperty('disabled', true);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
