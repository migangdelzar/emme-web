import { expect, expectTypeOf, it } from 'vitest';

import { tokens } from './tokens.js';

it('exports stable generic design tokens', () => {
  expect(tokens.spacing.md).toBe('1rem');
  expect(tokens.colors.primary).toBe('#7c3aed');
  expectTypeOf(tokens.spacing.md).toEqualTypeOf<'1rem'>();
});
