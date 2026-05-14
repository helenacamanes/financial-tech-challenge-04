import { env } from "./env";

export const firebaseConfig = {
  apiKey: env.firebaseApiKey,
  authDomain: env.firebaseAuthDomain,
  projectId: env.firebaseProjectId,
  storageBucket: env.firebaseStorageBucket,
  messagingSenderId:
    env.firebaseMessagingSenderId,
  appId: env.firebaseAppId,
};