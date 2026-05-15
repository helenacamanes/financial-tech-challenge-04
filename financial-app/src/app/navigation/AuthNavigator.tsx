import React from "react";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import { RootStackParamList }
  from "../../core/@types/navigation";
import {
  getForgotPasswordScreen,
  getLoginScreen,
  getRegisterScreen,
} from "./lazyScreens";

const Stack =
  createNativeStackNavigator<RootStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Login"
        getComponent={getLoginScreen}
      />

      <Stack.Screen
        name="Register"
        getComponent={getRegisterScreen}
      />

      <Stack.Screen
        name="ForgotPassword"
        getComponent={getForgotPasswordScreen}
      />
    </Stack.Navigator>
  );
}
