// @vitest-environment happy-dom

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Input } from '../components/Input/index.js';
import { FormField } from './FormField.js';

describe('FormField', () => {
  it('associates its label and error message with the control', () => {
    render(
      <FormField id="email" label="Email" error="Enter a valid email address.">
        <Input id="email" aria-describedby="email-error" />
      </FormField>,
    );

    expect(screen.getByLabelText('Email')).toBe(screen.getByRole('textbox'));
    expect(screen.getByText('Enter a valid email address.')).toHaveAttribute('id', 'email-error');
  });
});
