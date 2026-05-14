import React from "react";

import { NavigationContainer } from "@react-navigation/native";

import { RootNavigator } from "./RootNavigator";

export function Navigation() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}