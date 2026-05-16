import { useOnboardingStore }
  from "../../modules/onboarding";

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
