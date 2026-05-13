import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { MainTabParamList } from "../@types/navigation";
import Home from "../screens/Home";
import Transactions from "../screens/Transactions";
import Goals from "../screens/Goals";
import Profile from "../screens/Profile";

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0A1128",
          borderTopColor: "#16213E",
          height: 72,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: "#F59E0B",
        tabBarInactiveTintColor: "#7C8DB5",
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 4,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: React.ComponentProps<typeof Ionicons>["name"] =
            "home-outline";

          if (route.name === "Home")
            iconName = focused ? "home" : "home-outline";
          if (route.name === "Transactions")
            iconName = focused ? "list" : "list-outline";
          if (route.name === "Goals")
            iconName = focused ? "flag" : "flag-outline";
          if (route.name === "Profile")
            iconName = focused ? "person" : "person-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{ tabBarLabel: "Início" }}
      />
      <Tab.Screen
        name="Transactions"
        component={Transactions}
        options={{ tabBarLabel: "Transações" }}
      />
      <Tab.Screen
        name="Goals"
        component={Goals}
        options={{ tabBarLabel: "Metas" }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{ tabBarLabel: "Perfil" }}
      />
    </Tab.Navigator>
  );
}