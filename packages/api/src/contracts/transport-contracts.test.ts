import { expectTypeOf, it } from 'vitest';

import type { Cursor, PageInfo } from './index.js';

it('keeps cursors opaque and page metadata explicit', () => {
  expectTypeOf<Cursor>().toEqualTypeOf<string>();
  expectTypeOf<PageInfo>().toHaveProperty('hasNextPage');
});
