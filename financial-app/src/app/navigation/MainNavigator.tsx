import React from "react";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import Home from "../../modules/home/presentation/screens/Home";
import Transactions from "../../modules/transactions/presentation/screens/Transactions";
import AddTransaction from "../../modules/auth/presentation/screens/AddTransaction";
import Goals from "../../modules/goals/presentation/screens/Goals";
import Profile from "../../modules/profile/presentation/screens/Profile";
import ChangePassword from "../../modules/auth/presentation/screens/ChangePassword";
import { RootStackParamList }
  from "../../core/@types/navigation";

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
        component={Home}
      />

      <Stack.Screen
        name="AddTransaction"
        component={AddTransaction}
      />

      <Stack.Screen
        name="Transactions"
        component={Transactions}
      />

      <Stack.Screen
        name="AddGoal"
        component={Goals}
        options={{
          presentation: "transparentModal",
          animation: "slide_from_bottom",
        }}
      />

      <Stack.Screen
        name="Profile"
        component={Profile}
      />

      <Stack.Screen
        name="ChangePassword"
        component={ChangePassword}
      />
    </Stack.Navigator>
  );
}
