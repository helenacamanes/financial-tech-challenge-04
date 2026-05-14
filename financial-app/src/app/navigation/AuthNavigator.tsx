import React from "react";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import Login from "../../modules/auth/presentation/screens/Login";
import Register from "../../modules/register/presentation/screens/Register";
import ForgotPassword from "../../modules/auth/presentation/screens/ForgotPassword";

const Stack = createNativeStackNavigator();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Login"
        component={Login}
      />

      <Stack.Screen
        name="Register"
        component={Register}
      />

      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPassword}
      />
    </Stack.Navigator>
  );
}