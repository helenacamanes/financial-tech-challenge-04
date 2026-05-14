import React from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../core/@types/navigation";
import { useAuth } from "../providers/AuthProviders";
import { useOnboardingStore } from "../../modules/onboarding/state/onboarding.store";

import Onboarding from "../../modules/onboarding/presentation/screens/Onboarding";
import Login from "../../modules/auth/presentation/screens/Login";
import Register from "../../modules/register/presentation/screens/Register";
import Home from "../../modules/home/presentation/screens/Home";
import AddTransaction from "../../modules/auth/presentation/screens/AddTransaction";
import ForgotPassword from "../../modules/auth/presentation/screens/ForgotPassword";
import Transactions from "../../modules/transactions/presentation/screens/Transactions";
import Goals from "../../modules/goals/presentation/screens/Goals";
import Profile from "../../modules/profile/presentation/screens/Profile";
import ChangePassword from "../../modules/auth/presentation/screens/ChangePassword";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isAuthenticated, initializing } = useAuth();
  const {
    loading: onboardingLoading,
    hasSeenOnboarding,
  } = useOnboardingStore();

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
            <Stack.Screen name="Onboarding" component={Onboarding} />
          )}
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        </>
      ) : (
        <>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="AddTransaction" component={AddTransaction} />
          <Stack.Screen name="Transactions" component={Transactions} />
          <Stack.Screen
            name="AddGoal"
            component={Goals}
            options={{
              presentation: "transparentModal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="ChangePassword" component={ChangePassword} />
        </>
      )}
    </Stack.Navigator>
  );
}
