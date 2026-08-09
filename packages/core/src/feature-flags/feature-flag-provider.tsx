import type { ReactNode } from 'react';

import { FeatureFlagContext, createFeatureFlagContext } from './feature-flag-context.js';

export interface FeatureFlagProviderProps {
  readonly flags: readonly string[];
  readonly children?: ReactNode;
}

export function FeatureFlagProvider({ flags, children }: FeatureFlagProviderProps): ReactNode {
  return (
    <FeatureFlagContext.Provider value={createFeatureFlagContext(flags)}>
      {children}
    </FeatureFlagContext.Provider>
  );
}
