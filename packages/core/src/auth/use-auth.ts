import { useContext } from 'react';
import { AuthContext } from './auth-context.js';
import type { AuthContextValue } from './auth.types.js';

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);

  if (value === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return value;
}
