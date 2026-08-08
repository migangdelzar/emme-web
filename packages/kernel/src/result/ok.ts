import type { MatchHandlers, Result } from './result.js';

export class Ok<T> implements Result<T, never> {
  readonly _tag = 'Ok' as const;

  public constructor(readonly value: T) {}

  isOk(): this is Ok<T> {
    return true;
  }

  isErr(): this is Result<never, never> {
    return false;
  }

  map<U>(fn: (value: T) => U): Ok<U> {
    return new Ok(fn(this.value));
  }

  mapError<F>(_fn: (error: never) => F): Ok<T> {
    return this;
  }

  match<R>(handlers: MatchHandlers<T, never, R>): R {
    return handlers.ok(this.value);
  }

  unwrapOr(_defaultValue: T): T {
    return this.value;
  }
}

export const ok = <T>(value: T): Ok<T> => new Ok(value);
