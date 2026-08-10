import { describe, expect, it, vi } from 'vitest';

import { createFakeAuthState } from './mock-auth.js';

describe('createFakeAuthState', () => {
  it('creates independent signed-out state with controllable actions', () => {
    const first = createFakeAuthState();
    const second = createFakeAuthState();

    expect(first.status).toBe('signedOut');
    expect(first.user).toBeNull();
    expect(first).not.toBe(second);
    expect(first.login).not.toBe(second.login);
  });

  it('allows tests to override state and actions', async () => {
    const login = vi.fn(async () => undefined);
    const state = createFakeAuthState({ status: 'ready', login });

    await state.login('ada@example.com', 'secret');

    expect(state.status).toBe('ready');
    expect(login).toHaveBeenCalledWith('ada@example.com', 'secret');
  });
});
