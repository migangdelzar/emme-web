import type { Err } from './err.js';
import type { Ok } from './ok.js';

export interface MatchHandlers<T, E, R> {
  ok: (value: T) => R;
  err: (error: E) => R;
}

export type Result<T, E> = Ok<T> | Err<E>;
