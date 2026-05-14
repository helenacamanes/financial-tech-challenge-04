import React from "react";

import { LoadingScreen } from "@/presentation/screens/loading/LoadingScreen";

import { useAuth } from "../providers/AuthProviders";

import { useOnboarding } from "../../shared/hooks/UseOnboarding";

import { AppNavigator } from "./AppNavigator";
import { AuthNavigator } from "./AuthNavigator";
import { OnboardingNavigator } from "./OnboardingNavigator";

export function RootNavigator() {
  const {
    initializing,
    isAuthenticated,
  } = useAuth();

  const {
    onboardingDone,
    loading,
  } = useOnboarding();

  if (initializing || loading) {
    return <LoadingScreen />;
  }

  if (!onboardingDone) {
    return <OnboardingNavigator />;
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  return <AppNavigator />;
}