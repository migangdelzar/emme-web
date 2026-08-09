import type { ReactNode } from 'react';

import { AuthProvider, type AuthContextValue } from '@emme/core';
import { createFakeAuthState } from '../mock-auth.js';

export interface TestAuthProviderProps {
  readonly children?: ReactNode;
  readonly value?: Partial<AuthContextValue>;
}

export function TestAuthProvider({ children, value }: TestAuthProviderProps): ReactNode {
  return <AuthProvider value={createFakeAuthState(value)}>{children}</AuthProvider>;
}
