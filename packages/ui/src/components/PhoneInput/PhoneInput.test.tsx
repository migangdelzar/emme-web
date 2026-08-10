import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PhoneInput } from './PhoneInput.js';

describe('PhoneInput', () => {
  it('normalizes the local number to ten digits before reporting it with the LADA', () => {
    const onChange = vi.fn();

    render(<PhoneInput id="phone" value="+52 55-1234 5678" onChange={onChange} />);

    const numberInput = screen.getByLabelText('Teléfono (10 dígs)');
    fireEvent.change(numberInput, { target: { value: '' } });
    fireEvent.change(numberInput, { target: { value: '55a12345678' } });

    expect(numberInput).toHaveValue('5512345678');
    expect(onChange).toHaveBeenLastCalledWith('+52 5512345678');
  });
});
