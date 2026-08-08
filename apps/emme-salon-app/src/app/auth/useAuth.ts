import { AuthContext as CoreAuthContext, useAuth as useCoreAuth } from '@emme/core';
import type { AuthContextValue } from '@emme/core';

export type { AuthContextValue, AuthState, AuthStatus } from '@emme/core';

export const AuthContext = CoreAuthContext;

export function useAuth(): AuthContextValue {
  return useCoreAuth();
}
