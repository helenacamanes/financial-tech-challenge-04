import React from "react";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import Onboarding from "../../modules/onboarding/presentation/screens/Onboarding";
import { RootStackParamList }
  from "../../core/@types/navigation";

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
        component={Onboarding}
      />
    </Stack.Navigator>
  );
}
