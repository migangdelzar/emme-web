export interface OnboardingState {
  readonly tenantId: string;
  readonly completedSteps: readonly string[];
}
export interface OnboardingRepository {
  load(tenantId: string): Promise<OnboardingState>;
  save(state: OnboardingState): Promise<OnboardingState>;
}
