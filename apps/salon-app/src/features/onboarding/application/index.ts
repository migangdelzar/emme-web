export type { OnboardingState, OnboardingRepository } from './ports.js';
import type { OnboardingRepository } from './ports.js';
export function completeOnboardingStep(repository: OnboardingRepository) {
  return async (tenantId: string, step: string) => {
    const state = await repository.load(tenantId);
    if (state.completedSteps.includes(step)) return state;
    return repository.save({ ...state, completedSteps: [...state.completedSteps, step] });
  };
}
