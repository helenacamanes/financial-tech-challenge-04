import type React from "react";

type ScreenLoader = () => React.ComponentType<any>;

function preloadScreens(
  loaders: ScreenLoader[],
) {
  setTimeout(
    () => {
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
    },
    0,
  );
}

export const getOnboardingScreen = () =>
  require("../../modules/onboarding/presentation/screens/Onboarding").default;

export const getLoginScreen = () =>
  require("../../modules/auth/presentation/screens/Login").default;

export const getRegisterScreen = () =>
  require("../../modules/register/presentation/screens/Register").default;

export const getForgotPasswordScreen = () =>
  require("../../modules/auth/presentation/screens/ForgotPassword").default;

export const getHomeScreen = () =>
  require("../../modules/home/presentation/screens/Home").default;

export const getAddTransactionScreen = () =>
  require("../../modules/transactions/presentation/screens/AddTransaction").default;

export const getTransactionsScreen = () =>
  require("../../modules/transactions/presentation/screens/Transactions").default;

export const getGoalsScreen = () =>
  require("../../modules/goals/presentation/screens/Goals").default;

export const getProfileScreen = () =>
  require("../../modules/profile/presentation/screens/Profile").default;

export const getChangePasswordScreen = () =>
  require("../../modules/auth/presentation/screens/ChangePassword").default;

export const getInsightsScreen = () =>
  require("../../modules/insights/presentation/screens/Insights").default;

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
