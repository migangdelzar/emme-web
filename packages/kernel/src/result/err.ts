import type { MatchHandlers, Result } from './result.js';

export class Err<E> implements Result<never, E> {
  readonly _tag = 'Err' as const;

  public constructor(readonly error: E) {}

  isOk(): this is Result<never, never> {
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
