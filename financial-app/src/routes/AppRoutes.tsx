import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { RootStackParamList } from "../@types/navigation";
import { MainTabs } from "./MainTabs";
import AddTransaction from "../screens/AddTransaction";
import Insights from "../screens/Insights";
import ChangePassword from "../screens/ChangePassword";

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
