import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../core/@types/navigation";
import { useAuthState } from "../../modules/auth/state/auth.store";
import { useOnboardingState } from "../../modules/onboarding/state/onboarding.store";

import {
  getAddTransactionScreen,
  getChangePasswordScreen,
  getForgotPasswordScreen,
  getGoalsScreen,
  getHomeScreen,
  getLoginScreen,
  getOnboardingScreen,
  getProfileScreen,
  getRegisterScreen,
  getTransactionsScreen,
  preloadAuthScreens,
  preloadAuthenticatedScreens,
  preloadOnboardingScreens,
} from "./lazyScreens";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isAuthenticated, initializing } = useAuthState();
  const {
    loading: onboardingLoading,
    hasSeenOnboarding,
  } = useOnboardingState();

  useEffect(() => {
    if (initializing || onboardingLoading) return;

    if (isAuthenticated) {
      preloadAuthenticatedScreens();
      return;
    }

    if (!hasSeenOnboarding) {
      preloadOnboardingScreens();
      return;
    }

    preloadAuthScreens();
  }, [
    initializing,
    onboardingLoading,
    isAuthenticated,
    hasSeenOnboarding,
  ]);

  if (initializing || onboardingLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0A1128",
        }}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {!isAuthenticated ? (
        <>
          {!hasSeenOnboarding && (
            <Stack.Screen
              name="Onboarding"
              getComponent={getOnboardingScreen}
            />
          )}
          <Stack.Screen name="Login" getComponent={getLoginScreen} />
          <Stack.Screen name="Register" getComponent={getRegisterScreen} />
          <Stack.Screen
            name="ForgotPassword"
            getComponent={getForgotPasswordScreen}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Home" getComponent={getHomeScreen} />
          <Stack.Screen
            name="AddTransaction"
            getComponent={getAddTransactionScreen}
          />
          <Stack.Screen
            name="Transactions"
            getComponent={getTransactionsScreen}
          />
          <Stack.Screen
            name="AddGoal"
            getComponent={getGoalsScreen}
            options={{
              presentation: "transparentModal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen name="Profile" getComponent={getProfileScreen} />
          <Stack.Screen
            name="ChangePassword"
            getComponent={getChangePasswordScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
