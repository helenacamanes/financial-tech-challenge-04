import React, { Suspense } from "react";
import { ActivityIndicator, View } from "react-native";

const SuspenseFallback = () => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#0A1128",
    }}
  >
    <ActivityIndicator size="large" color="#FFFFFF" />
  </View>
);

function lazyScreen(importFn: () => Promise<{ default: React.ComponentType<any> }>) {
  const LazyComponent = React.lazy(importFn);

  return function LazyScreenWrapper(props: any) {
    return (
      <Suspense fallback={<SuspenseFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

export const getOnboardingScreen = () =>
  lazyScreen(() => import("../../modules/onboarding/presentation/screens/Onboarding"));

export const getLoginScreen = () =>
  lazyScreen(() => import("../../modules/auth/presentation/screens/Login"));

export const getRegisterScreen = () =>
  lazyScreen(() => import("../../modules/register/presentation/screens/Register"));

export const getForgotPasswordScreen = () =>
  lazyScreen(() => import("../../modules/auth/presentation/screens/ForgotPassword"));

export const getHomeScreen = () =>
  lazyScreen(() => import("../../modules/home/presentation/screens/Home"));

export const getAddTransactionScreen = () =>
  lazyScreen(() => import("../../modules/transactions/presentation/screens/AddTransaction"));

export const getTransactionsScreen = () =>
  lazyScreen(() => import("../../modules/transactions/presentation/screens/Transactions"));

export const getGoalsScreen = () =>
  lazyScreen(() => import("../../modules/goals/presentation/screens/Goals"));

export const getProfileScreen = () =>
  lazyScreen(() => import("../../modules/profile/presentation/screens/Profile"));

export const getChangePasswordScreen = () =>
  lazyScreen(() => import("../../modules/auth/presentation/screens/ChangePassword"));

export const getInsightsScreen = () =>
  lazyScreen(() => import("../../modules/insights/presentation/screens/Insights"));

function preloadScreens(
  loaders: (() => React.ComponentType<any>)[],
) {
  setTimeout(() => {
    loaders.forEach((load) => {
      try {
        load();
      } catch (error) {
        console.warn(
          "Erro ao pre-carregar tela:",
          error,
        );
      }
    });
  }, 0);
}

export function preloadAuthScreens() {
  preloadScreens([
    getLoginScreen,
    getRegisterScreen,
    getForgotPasswordScreen,
  ]);
}

export function preloadOnboardingScreens() {
  preloadScreens([
    getOnboardingScreen,
    getLoginScreen,
    getRegisterScreen,
  ]);
}

export function preloadAuthenticatedScreens() {
  preloadScreens([
    getHomeScreen,
    getAddTransactionScreen,
    getTransactionsScreen,
    getGoalsScreen,
    getProfileScreen,
    getInsightsScreen,
    getChangePasswordScreen,
  ]);
}
