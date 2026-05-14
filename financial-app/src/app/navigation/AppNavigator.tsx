import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { RootStackParamList } from "../../core/@types/navigation";
import { useAuth } from "../providers/AuthProviders";

import Onboarding from "../../modules/onboarding/presentation/screens/Onboarding";
import Login from "../../modules/auth/presentation/screens/Login";
import Register from "../../modules/register/presentation/screens/Register";
import Home from "../../modules/home/presentation/screens/Home";
import AddTransaction from "../../modules/auth/presentation/screens/AddTransaction";
import ForgotPassword from "../../modules/auth/presentation/screens/ForgotPassword";
import Transactions from "../../modules/transactions/presentation/screens/Transactions";
import Goals from "../../modules/goals/presentation/screens/Goals";
import Profile from "../../modules/profile/presentation/screens/Profile";
import ChangePassword from "../../modules/auth/presentation/screens/ChangePassword";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isAuthenticated, initializing } = useAuth();
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkFirstLaunch() {
      try {
        const hasLaunched = await AsyncStorage.getItem(
          "@lighthouse:alreadyLaunched",
        );

        if (hasLaunched === null) {
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (error) {
        setIsFirstLaunch(false);
      }
    }

    checkFirstLaunch();
  }, []);

  if (initializing || isFirstLaunch === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0A1128",
        }}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        {!isAuthenticated ? (
          <>
            {isFirstLaunch && (
              <Stack.Screen name="Onboarding" component={Onboarding} />
            )}
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="AddTransaction" component={AddTransaction} />
            <Stack.Screen name="Transactions" component={Transactions} />
            <Stack.Screen
              name="AddGoal"
              component={Goals}
              options={{
                presentation: "transparentModal",
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="ChangePassword" component={ChangePassword} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
