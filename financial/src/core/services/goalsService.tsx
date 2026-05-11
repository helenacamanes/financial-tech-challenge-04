import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

export type Goal = {
  id: string;
  title: string;
  current: number;
  target: number;
  icon: string;
  color: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreateGoalInput = {
  title: string;
  current: number;
  target: number;
  icon: string;
  color: string;
};

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

function getGoalsCollection(uid: string) {
  return collection(db, "users", uid, "goals");
}

async function ensureUserRootDoc(uid: string) {
  await setDoc(
    getUserRef(uid),
    {
      uid,
      email: auth.currentUser?.email ?? "",
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function createGoal(data: CreateGoalInput) {
  const uid = getCurrentUserId();

  await ensureUserRootDoc(uid);

  await addDoc(getGoalsCollection(uid), {
    title: data.title,
    current: data.current,
    target: data.target,
    icon: data.icon,
    color: data.color,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function addValueToGoalInFirestore(
  goalId: string,
  amount: number,
  target: number,
) {
  const uid = getCurrentUserId();
  const goalRef = doc(db, "users", uid, "goals", goalId);

  const snapshot = await getDoc(goalRef);

  if (!snapshot.exists()) {
    throw new Error("Meta não encontrada.");
  }

  const data = snapshot.data();
  const current = Number(data.current ?? 0);
  const nextValue = Math.min(current + amount, target);

  await updateDoc(goalRef, {
    current: nextValue,
    updatedAt: serverTimestamp(),
  });
}

export async function removeGoalFromFirestore(goalId: string) {
  const uid = getCurrentUserId();

  await deleteDoc(doc(db, "users", uid, "goals", goalId));
}

export function subscribeToGoals(
  callback: (goals: Goal[]) => void,
): Unsubscribe {
  const uid = getCurrentUserId();
  const q = query(getGoalsCollection(uid), orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const goals: Goal[] = snapshot.docs.map((docItem) => {
        const data = docItem.data();

        return {
          id: docItem.id,
          title: data.title ?? "",
          current: Number(data.current ?? 0),
          target: Number(data.target ?? 0),
          icon: data.icon ?? "star-outline",
          color: data.color ?? "#3B82F6",
          createdAt:
            data.createdAt instanceof Timestamp
              ? data.createdAt.toDate()
              : undefined,
          updatedAt:
            data.updatedAt instanceof Timestamp
              ? data.updatedAt.toDate()
              : undefined,
        };
      });

      callback(goals);
    },
    (error) => {
      console.error("Erro ao buscar metas:", error);
      callback([]);
    },
  );
}
