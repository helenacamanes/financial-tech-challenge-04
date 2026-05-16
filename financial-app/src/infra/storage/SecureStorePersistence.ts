import * as SecureStore from "expo-secure-store";

function getKey(key: string) {
  return `firebase:auth:${key}`;
}

export const secureStorePersistence = {
  type: "LOCAL" as const,

  _isAvailable: () =>
    SecureStore.isAvailableAsync(),

  _set: (
    key: string,
    value: string,
  ) =>
    SecureStore.setItemAsync(
      getKey(key),
      value,
    ),

  _get: (
    key: string,
  ) =>
    SecureStore.getItemAsync(
      getKey(key),
    ),

  _remove: (
    key: string,
  ) =>
    SecureStore.deleteItemAsync(
      getKey(key),
    ),
};
