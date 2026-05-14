import { Platform } from "react-native";

export const appConfig = {
  app: {
    name: "Financial App",
    version: "1.0.0",
    environment: __DEV__
      ? "development"
      : "production",
  },

  api: {
    timeout: 15000,
    retryAttempts: 3,
  },

  storage: {
    secureKeys: {
      authToken: "@financial:token",
      refreshToken: "@financial:refresh-token",
      biometric: "@financial:biometric",
    },

    localKeys: {
      onboarding: "@financial:onboarding",
      theme: "@financial:theme",
      currency: "@financial:currency",
    },
  },

  database: {
    enableLogging: __DEV__,
    syncInterval: 1000 * 60 * 5,
  },

  features: {
    enableBiometric: true,
    enableNotifications: true,
    enableOfflineMode: true,
    enableCloudBackup: true,
    enableAnalytics: true,
  },

  charts: {
    animationDuration: 300,
    maxItems: 12,
  },

  pagination: {
    defaultLimit: 20,
  },

  validation: {
    minPasswordLength: 6,
    maxTransactionDescription: 120,
    maxGoalTitle: 50,
  },

  currency: {
    default: "BRL",
    locale: "pt-BR",
  },

  date: {
    locale: "pt-BR",
    firstDayOfWeek: 1,
  },

  notifications: {
    dailyReminderHour: 20,
  },

  platform: {
    isIOS: Platform.OS === "ios",
    isAndroid: Platform.OS === "android",
    isWeb: Platform.OS === "web",
  },
};