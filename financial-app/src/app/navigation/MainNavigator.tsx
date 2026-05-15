import React from "react";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import { RootStackParamList }
  from "../../core/@types/navigation";
import {
  getAddTransactionScreen,
  getChangePasswordScreen,
  getGoalsScreen,
  getHomeScreen,
  getProfileScreen,
  getTransactionsScreen,
} from "./lazyScreens";

const Stack =
  createNativeStackNavigator<RootStackParamList>();

export function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="Home"
        getComponent={getHomeScreen}
      />

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

      <Stack.Screen
        name="Profile"
        getComponent={getProfileScreen}
      />

      <Stack.Screen
        name="ChangePassword"
        getComponent={getChangePasswordScreen}
      />
    </Stack.Navigator>
  );
}
