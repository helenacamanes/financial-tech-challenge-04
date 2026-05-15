import React from "react";

import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import { Ionicons }
  from "@expo/vector-icons";

import {
  MainTabParamList,
} from "../types";

import {
  tabsConfig,
} from "./tabs.config";

import {
  tabBarStyles,
  tabBarColors,
} from "./tabBar.styles";

const Tab =
  createBottomTabNavigator<
    MainTabParamList
  >();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const config =
          tabsConfig[
            route.name as keyof typeof tabsConfig
          ];

        return {
          headerShown: false,

          tabBarStyle: tabBarStyles,

          tabBarActiveTintColor:
            tabBarColors.active,

          tabBarInactiveTintColor:
            tabBarColors.inactive,

          tabBarLabelStyle: {
            fontSize: 11,
            marginTop: 4,
          },

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? config.activeIcon
                  : config.inactiveIcon
              }
              size={size}
              color={color}
            />
          ),
        };
      }}
    >
      {Object.entries(tabsConfig).map(
        ([name, config]) => (
          <Tab.Screen
            key={name}
            name={
              name as keyof MainTabParamList
            }
            getComponent={config.getComponent}
            options={{
              tabBarLabel: config.label,
            }}
          />
        )
      )}
    </Tab.Navigator>
  );
}
