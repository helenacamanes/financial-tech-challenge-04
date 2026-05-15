import React from "react";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import { RootStackParamList }
  from "../../core/@types/navigation";
import { getOnboardingScreen }
  from "./lazyScreens";

const Stack =
  createNativeStackNavigator<RootStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Onboarding"
        getComponent={getOnboardingScreen}
      />
    </Stack.Navigator>
  );
}
