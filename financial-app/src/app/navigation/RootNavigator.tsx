import React from "react";

import { LoadingScreen } from "@/presentation/screens/loading/LoadingScreen";

import { useAuthState } from "../providers/AuthProviders";

import { useOnboardingState } from "../../modules/onboarding/state/onboarding.store";

import { AppNavigator } from "./AppNavigator";
import { AuthNavigator } from "./AuthNavigator";
import { OnboardingNavigator } from "./OnboardingNavigator";

export function RootNavigator() {
  const {
    initializing,
    isAuthenticated,
  } = useAuthState();

  const {
    hasSeenOnboarding,
    loading,
  } = useOnboardingState();

  if (initializing || loading) {
    return <LoadingScreen />;
  }

  if (!hasSeenOnboarding) {
    return <OnboardingNavigator />;
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  return <AppNavigator />;
}
