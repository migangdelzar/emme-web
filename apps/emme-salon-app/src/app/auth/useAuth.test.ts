import { AuthContext as CoreAuthContext } from '@emme/core';
import { describe, expect, it } from 'vitest';
import { AuthContext } from './useAuth';

describe('salon auth boundary', () => {
  it('uses the shared core auth context', () => {
    expect(AuthContext).toBe(CoreAuthContext);
  });
});
