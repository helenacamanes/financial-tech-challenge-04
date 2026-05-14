export interface IOnboardingRepository {
  hasSeenOnboarding(): Promise<boolean>;

  completeOnboarding(): Promise<void>;

  resetOnboarding(): Promise<void>;
}
