import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { getAuth, initializeAuth, type Auth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  type Firestore,
} from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { env } from "../../config/env";

const firebaseConfig = {
  apiKey: env.firebaseApiKey,
  authDomain: env.firebaseAuthDomain,
  projectId: env.firebaseProjectId,
  storageBucket: env.firebaseStorageBucket,
  messagingSenderId: env.firebaseMessagingSenderId,
  appId: env.firebaseAppId,
};

const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

let auth: Auth;
let db: Firestore;

if (Platform.OS === "web") {
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  try {
    const { getReactNativePersistence } = require("firebase/auth/react-native");

    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });

    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch (error) {
    console.warn("Firebase native init failed:", error);

    auth = getAuth(app);
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  }
}

const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };
