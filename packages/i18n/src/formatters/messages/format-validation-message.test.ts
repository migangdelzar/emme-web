import { describe, expect, it } from 'vitest';
import { formatValidationMessage } from './format-validation-message.js';

describe('formatValidationMessage', () => {
  it('maps stable validation codes using the requested locale', () => {
    expect(formatValidationMessage('required', { locale: 'en-US' })).toBe('This field is required.');
    expect(formatValidationMessage('required', { locale: 'es-MX' })).toBe('Este campo es obligatorio.');
  });

  it('falls back to the supplied issue message for unknown codes', () => {
    expect(
      formatValidationMessage('unknown_code', { locale: 'en-US' }, 'The value is invalid.'),
    ).toBe('The value is invalid.');
  });
});
