import React, { lazy, Suspense } from "react";
import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../core/@types/navigation";
import {
  getAddTransactionScreen,
  getChangePasswordScreen,
  getInsightsScreen,
} from "./lazyScreens";

const MainTabs = lazy(async () => {
  const mod = await import("./tabs/MainTabs");
  return { default: mod.MainTabs };
});

const Stack = createNativeStackNavigator<RootStackParamList>();

function TabFallback() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0A1128",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" color="#FFFFFF" />
    </View>
  );
}

export function AppRoutes() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0A1128" },
      }}
    >
      <Stack.Screen name="MainTabs">
        {() => (
          <Suspense fallback={<TabFallback />}>
            <MainTabs />
          </Suspense>
        )}
      </Stack.Screen>
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
