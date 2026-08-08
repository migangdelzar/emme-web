import type { Ok } from './ok.js';
import type { MatchHandlers } from './result.js';

export class Err<E> {
  readonly _tag = 'Err' as const;

  public constructor(readonly error: E) {}

  isOk(): this is Ok<never> {
    return false;
  }

  isErr(): this is Err<E> {
    return true;
  }

  map<U>(_fn: (value: never) => U): Err<E> {
    return this;
  }

  mapError<F>(fn: (error: E) => F): Err<F> {
    return new Err(fn(this.error));
  }

  match<R>(handlers: MatchHandlers<never, E, R>): R {
    return handlers.err(this.error);
  }

  unwrapOr<T>(defaultValue: T): T {
    return defaultValue;
  }
}

export const err = <E>(error: E): Err<E> => new Err(error);
