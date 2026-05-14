import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

import { auth, db }
  from "@/infra/firebase/firebaseConfig";

import { Goal }
  from "../../domain/entities/Goal";

function getCurrentUserId() {
  const uid = auth.currentUser?.uid;

  if (!uid) {
    throw new Error("Usuário não autenticado.");
  }

  return uid;
}

function getUserRef(
  uid: string,
) {
  return doc(
    db,
    "users",
    uid,
  );
}

function getGoalsCollection(
  uid: string,
) {
  return collection(
    db,
    "users",
    uid,
    "goals",
  );
}

async function ensureUserRootDoc(
  uid: string,
) {
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

function mapGoal(
  id: string,
  data: Record<string, any>,
): Goal {
  return {
    id,
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
}

export class FirebaseGoalsDatasource {
  subscribeToGoals(
    callback: (goals: Goal[]) => void,
  ) {
    const uid = getCurrentUserId();
    const goalsQuery = query(
      getGoalsCollection(uid),
      orderBy(
        "createdAt",
        "desc",
      ),
    );

    return onSnapshot(
      goalsQuery,
      (snapshot) => {
        callback(
          snapshot.docs.map(
            (docItem) => mapGoal(
              docItem.id,
              docItem.data(),
            ),
          ),
        );
      },
      () => {
        callback([]);
      },
    );
  }

  async createGoal(
    data: Omit<Goal, "id">,
  ) {
    const uid = getCurrentUserId();

    await ensureUserRootDoc(uid);

    return addDoc(
      getGoalsCollection(uid),
      {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
    );
  }

  async getGoals() {
    const uid = getCurrentUserId();

    return getDocs(
      getGoalsCollection(uid),
    );
  }

  async updateGoal(
    id: string,
    data: Partial<Goal>,
  ) {
    const uid = getCurrentUserId();

    return updateDoc(
      doc(db, "users", uid, "goals", id),
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
    );
  }

  async deleteGoal(
    id: string,
  ) {
    const uid = getCurrentUserId();

    return deleteDoc(
      doc(db, "users", uid, "goals", id),
    );
  }
}
