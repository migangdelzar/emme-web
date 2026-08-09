// @vitest-environment happy-dom

import { fireEvent, render, screen } from '@testing-library/react';
import { it, expect, vi } from 'vitest';

import { DatePicker } from './DatePicker.js';

it('renders an accessible date input and reports changes', () => {
  const onChange = vi.fn();
  render(<DatePicker label="Start date" value="2026-01-01" onChange={onChange} />);

  expect(screen.getByLabelText('Start date')).toHaveValue('2026-01-01');
  fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-01-02' } });
  expect(onChange).toHaveBeenCalled();
});
