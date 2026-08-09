import type { ReactNode } from 'react';

import { useFeatureFlag } from './use-feature-flag.js';

export interface FeatureFlagGuardProps {
  readonly flag: string;
  readonly children?: ReactNode;
  readonly fallback?: ReactNode;
}

export function FeatureFlagGuard({ flag, children, fallback = null }: FeatureFlagGuardProps): ReactNode {
  return useFeatureFlag(flag) ? children : fallback;
}
