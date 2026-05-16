import React, { useEffect } from "react";

import { LoadingScreen } from "@/presentation/screens/loading/LoadingScreen";

import { useAuthState } from "../providers/AuthProviders";

import { useOnboardingState } from "../../modules/onboarding";

import { AppRoutes } from "./AppRoutes";
import { AuthNavigator } from "./AuthNavigator";
import { OnboardingNavigator } from "./OnboardingNavigator";
import {
  preloadAuthScreens,
  preloadAuthenticatedScreens,
  preloadOnboardingScreens,
} from "./lazyScreens";

export function RootNavigator() {
  const {
    initializing,
    isAuthenticated,
  } = useAuthState();

  const {
    hasSeenOnboarding,
    loading,
  } = useOnboardingState();

  useEffect(() => {
    if (initializing || loading) return;

    if (!hasSeenOnboarding) {
      preloadOnboardingScreens();
      return;
    }

    if (!isAuthenticated) {
      preloadAuthScreens();
      return;
    }

    preloadAuthenticatedScreens();
  }, [
    initializing,
    loading,
    hasSeenOnboarding,
    isAuthenticated,
  ]);

  if (initializing || loading) {
    return <LoadingScreen />;
  }

  if (!hasSeenOnboarding) {
    return <OnboardingNavigator />;
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  return <AppRoutes />;
}
