import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../core/@types/navigation";
import { MainTabs } from "./tabs/MainTabs";
import {
  getAddTransactionScreen,
  getChangePasswordScreen,
  getInsightsScreen,
} from "./lazyScreens";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppRoutes() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0A1128" },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="AddTransaction"
        getComponent={getAddTransactionScreen}
      />
      <Stack.Screen
        name="Insights"
        getComponent={getInsightsScreen}
      />
      <Stack.Screen
        name="ChangePassword"
        getComponent={getChangePasswordScreen}
      />
    </Stack.Navigator>
  );
}
