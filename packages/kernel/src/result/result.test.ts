import { expect, it } from 'vitest';

import { err, ok } from './index.js';

it('maps Ok values without evaluating Err branches', () => {
  const value = ok(2).map((number) => number * 3);
  expect(value).toEqual(ok(6));
});

it('preserves Err values without evaluating Ok branches', () => {
  const value = err('failed').map(() => {
    throw new Error('Ok branch evaluated');
  });

  expect(value).toEqual(err('failed'));
});

it('maps Err values without evaluating Ok branches', () => {
  const value = err('failed').mapError((message) => message.toUpperCase());

  expect(value).toEqual(err('FAILED'));
});

it('matches the Ok branch', () => {
  const value = ok(2).match({
    ok: (number) => number * 3,
    err: () => -1,
  });

  expect(value).toBe(6);
});

it('matches the Err branch', () => {
  const value = err('failed').match({
    ok: () => 'unexpected',
    err: (message) => message,
  });

  expect(value).toBe('failed');
});

it('returns the Ok value or a default for Err', () => {
  expect(ok(2).unwrapOr(0)).toBe(2);
  expect(err('failed').unwrapOr(0)).toBe(0);
});
