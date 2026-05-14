import AsyncStorage
  from "@react-native-async-storage/async-storage";

const STORAGE_KEY =
  "@lighthouse:alreadyLaunched";

export class AsyncStorageOnboardingDatasource {
  async hasSeenOnboarding() {
    const value =
      await AsyncStorage.getItem(
        STORAGE_KEY,
      );

    return value === "true";
  }

  async completeOnboarding() {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      "true",
    );
  }

  async resetOnboarding() {
    await AsyncStorage.removeItem(
      STORAGE_KEY,
    );
  }
}
