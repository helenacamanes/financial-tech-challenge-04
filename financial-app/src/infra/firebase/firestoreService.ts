import {
  doc,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import type { UserProfile } from "../../core/@types/finance";

function getCurrentUserId() {
  const uid = auth.currentUser?.uid;

  if (!uid) {
    throw new Error("Usuário não autenticado.");
  }

  return uid;
}

function getUserRef(uid: string) {
  return doc(db, "users", uid);
}

export function subscribeToProfile(
  callback: (profile: UserProfile | null) => void,
) {
  const uid = getCurrentUserId();

  return onSnapshot(
    getUserRef(uid),
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      callback(snapshot.data() as UserProfile);
    },
    (error) => {
      console.error("Erro no subscribeToProfile:", error);
      callback(null);
    },
  );
}
