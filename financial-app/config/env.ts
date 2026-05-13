function required(name: string, value: string | undefined) {
  console.log(`Verificando ${name}:`, value ? "OK" : "VAZIO");
  if (!value) {
    console.warn(`⚠️ Warning: Missing env variable ${name}. Firebase features will fail.`);
    return '';
    // throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  firebaseApiKey: required(
    "EXPO_PUBLIC_FIREBASE_API_KEY",
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  ),
  firebaseAuthDomain: required(
    "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  ),
  firebaseProjectId: required(
    "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  ),
  firebaseStorageBucket: required(
    "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  ),
  firebaseMessagingSenderId: required(
    "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  ),
  firebaseAppId: required(
    "EXPO_PUBLIC_FIREBASE_APP_ID",
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  ),
};
