import { expectTypeOf, it } from 'vitest';

import type { Nullable } from './nullable.js';

it('adds nullability without widening the wrapped type to undefined', () => {
  expectTypeOf<Nullable<string>>().toEqualTypeOf<string | null>();
  expectTypeOf<Nullable<string>>().not.toEqualTypeOf<string | null | undefined>();
});
