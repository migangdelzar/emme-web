import { useContext } from 'react';

import { FeatureFlagContext } from './feature-flag-context.js';

export function useFeatureFlag(flag: string): boolean {
  const context = useContext(FeatureFlagContext);

  if (context === null) {
    throw new Error('useFeatureFlag must be used within a FeatureFlagProvider');
  }

  return context.isEnabled(flag);
}
