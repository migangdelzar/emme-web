import { createContext } from 'react';

export interface FeatureFlagContextValue {
  readonly flags: ReadonlySet<string>;
  isEnabled(flag: string): boolean;
}

export const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null);

export function createFeatureFlagContext(flags: readonly string[]): FeatureFlagContextValue {
  const enabledFlags = new Set(flags);

  return {
    flags: enabledFlags,
    isEnabled: (flag) => enabledFlags.has(flag),
  };
}
