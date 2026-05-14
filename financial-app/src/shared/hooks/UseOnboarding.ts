import {
  useCallback,
  useEffect,
  useState,
} from "react";

import AsyncStorage
  from "@react-native-async-storage/async-storage";

const STORAGE_KEY =
  "@financial-app:onboarding";

export function useOnboarding() {
  const [loading, setLoading] =
    useState(true);

  const [
    onboardingDone,
    setOnboardingDone,
  ] = useState(false);

  const load =
    useCallback(async () => {
      try {
        const value =
          await AsyncStorage.getItem(
            STORAGE_KEY
          );

        setOnboardingDone(
          value === "true"
        );
      } catch (error) {
        console.error(
          "Error loading onboarding:",
          error
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function completeOnboarding() {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        "true"
      );

      setOnboardingDone(true);
    } catch (error) {
      console.error(
        "Error saving onboarding:",
        error
      );
    }
  }

  async function resetOnboarding() {
    try {
      await AsyncStorage.removeItem(
        STORAGE_KEY
      );

      setOnboardingDone(false);
    } catch (error) {
      console.error(
        "Error resetting onboarding:",
        error
      );
    }
  }

  return {
    loading,

    onboardingDone,

    completeOnboarding,

    resetOnboarding,

    reload: load,
  };
}