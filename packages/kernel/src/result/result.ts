export interface MatchHandlers<T, E, R> {
  ok: (value: T) => R;
  err: (error: E) => R;
}

export interface Result<T, E> {
  readonly _tag: 'Ok' | 'Err';
  isOk(): this is Result<T, never>;
  isErr(): this is Result<never, E>;
  map<U>(fn: (value: T) => U): Result<U, E>;
  mapError<F>(fn: (error: E) => F): Result<T, F>;
  match<R>(handlers: MatchHandlers<T, E, R>): R;
  unwrapOr(defaultValue: T): T;
}
