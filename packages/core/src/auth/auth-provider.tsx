import { type ReactNode } from 'react';
import { AuthContext } from './auth-context.js';
import type { AuthContextValue } from './auth.types.js';

export interface AuthProviderProps {
  readonly value: AuthContextValue;
  readonly children?: ReactNode;
}

export function AuthProvider({ value, children }: AuthProviderProps): ReactNode {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
