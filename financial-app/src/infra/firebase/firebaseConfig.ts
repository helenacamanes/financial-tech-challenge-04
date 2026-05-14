import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseApp,
} from "firebase/app";

import {
  getAuth,
  initializeAuth,
  type Auth,
} from "firebase/auth";

import {
  getFirestore,
  initializeFirestore,
  type Firestore,
} from "firebase/firestore";

import {
  getStorage,
  type FirebaseStorage,
} from "firebase/storage";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { Platform } from "react-native";

import { firebaseConfig } from "../../config/firebase";

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
    const {
      getReactNativePersistence,
    } = require("firebase/auth/react-native");

    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });

    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch (error) {
    console.warn(
      "[Firebase] Native initialization failed:",
      error
    );

    auth = getAuth(app);

    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  }
}

const storage: FirebaseStorage = getStorage(app);

export {
  app,
  auth,
  db,
  storage,
};