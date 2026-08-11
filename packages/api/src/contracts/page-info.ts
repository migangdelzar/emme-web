import type { Cursor } from './cursor.js';

export interface PageInfo {
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
  readonly startCursor: Cursor | null;
  readonly endCursor: Cursor | null;
}
