import { useOnboardingStore }
  from "../../modules/onboarding/state/onboarding.store";

export function useOnboarding() {
  const {
    loading,
    hasSeenOnboarding,
    completeOnboarding,
    resetOnboarding,
    reload,
  } = useOnboardingStore();

  return {
    loading,

    onboardingDone: hasSeenOnboarding,

    completeOnboarding,

    resetOnboarding,

    reload,
  };
}
