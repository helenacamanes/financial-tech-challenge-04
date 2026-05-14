import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../core/@types/navigation";
import { MainTabs } from "./tabs/MainTabs";
import AddTransaction from "../../modules/auth/presentation/screens/AddTransaction";
import Insights from "../../modules/insights/presentation/screens/Insights";
import ChangePassword from "../../modules/auth/presentation/screens/ChangePassword";

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
      <Stack.Screen name="AddTransaction" component={AddTransaction} />
      <Stack.Screen name="Insights" component={Insights} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
    </Stack.Navigator>
  );
}
