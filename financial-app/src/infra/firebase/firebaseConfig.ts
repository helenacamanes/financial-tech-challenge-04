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
  persistentLocalCache,
  type Firestore,
} from "firebase/firestore";

import {
  getStorage,
  type FirebaseStorage,
} from "firebase/storage";

import { Platform } from "react-native";

import { firebaseConfig } from "../../config/firebase";

const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

let auth: Auth;
let db: Firestore;

import { secureStorePersistence }
  from "@/infra/storage/SecureStorePersistence";

if (Platform.OS === "web") {
  auth = getAuth(app);

  db = getFirestore(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: secureStorePersistence,
    });

    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      localCache: persistentLocalCache({}),
    });
  } catch (error) {
    console.warn(
      "[Firebase] Native initialization failed:",
      error
    );

    auth = getAuth(app);

    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      localCache: persistentLocalCache({}),
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