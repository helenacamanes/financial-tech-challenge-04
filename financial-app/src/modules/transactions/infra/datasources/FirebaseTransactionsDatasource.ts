import {
  collection,
  deleteDoc,
  doc,
  increment,
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

import {
  deleteAttachmentByPath,
  uploadTransactionAttachment,
} from "@/shared/services/storage/storageService";

import { Transaction }
  from "../../domain/entities/Transaction";

import {
  CreateTransactionInput,
  UpdateTransactionInput,
} from "../../domain/repositories/ITransactionsRepository";

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

function getTransactionsCollection(
  uid: string,
) {
  return collection(
    db,
    "users",
    uid,
    "transactions",
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

function mapTransaction(
  id: string,
  data: Record<string, any>,
): Transaction {
  return {
    id,
    title: data.category,
    value: data.amount,
    type: data.type,
    date: data.date?.toDate?.() ?? new Date(),
    description: data.description ?? "",
    account: data.account ?? "",
    attachment: data.attachment ?? null,
  };
}

export class FirebaseTransactionsDatasource {
  subscribeToTransactions(
    callback: (transactions: Transaction[]) => void,
  ) {
    const uid = getCurrentUserId();
    const transactionsQuery = query(
      getTransactionsCollection(uid),
      orderBy(
        "date",
        "desc",
      ),
    );

    return onSnapshot(
      transactionsQuery,
      (snapshot) => {
        callback(
          snapshot.docs.map(
            (docItem) => mapTransaction(
              docItem.id,
              docItem.data(),
            ),
          ),
        );
      },
      (error) => {
        console.error(
          "Erro no subscribeToTransactions:",
          error,
        );
        callback([]);
      },
    );
  }

  async createTransaction(
    transaction: CreateTransactionInput,
  ) {
    const uid = getCurrentUserId();
    const transactionRef = doc(
      getTransactionsCollection(uid),
    );

    let uploadedAttachment: Awaited<
      ReturnType<typeof uploadTransactionAttachment>
    > | null = null;

    const transactionPayloadBase = {
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description ?? "",
      account: transaction.account ?? "",
      date: Timestamp.fromDate(transaction.date),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const profilePayload = {
      updatedAt: serverTimestamp(),
      balance: increment(
        transaction.type === "income"
          ? transaction.amount
          : -transaction.amount,
      ),
    };

    try {
      await ensureUserRootDoc(uid);

      if (transaction.attachment) {
        uploadedAttachment =
          await uploadTransactionAttachment(
            uid,
            transactionRef.id,
            transaction.attachment,
          );
      }

      await setDoc(
        transactionRef,
        {
          ...transactionPayloadBase,
          attachment: uploadedAttachment,
        },
      );

      await setDoc(
        getUserRef(uid),
        profilePayload,
        { merge: true },
      );
    } catch (error) {
      if (uploadedAttachment?.path) {
        try {
          await deleteAttachmentByPath(
            uploadedAttachment.path,
          );
        } catch (cleanupError) {
          console.error(
            "Erro ao limpar anexo após falha:",
            cleanupError,
          );
        }
      }

      console.error(
        "Erro dentro de createTransaction:",
        error,
      );
      throw error;
    }
  }

  async updateTransaction(
    id: string,
    transaction: UpdateTransactionInput,
    previousTransaction: Transaction,
  ) {
    const uid = getCurrentUserId();
    const transactionRef = doc(
      db,
      "users",
      uid,
      "transactions",
      id,
    );

    const previousSignedValue =
      previousTransaction.type === "income"
        ? previousTransaction.value
        : -previousTransaction.value;

    const newSignedValue =
      transaction.type === "income"
        ? transaction.amount
        : -transaction.amount;

    const balanceDelta =
      newSignedValue - previousSignedValue;

    await updateDoc(
      transactionRef,
      {
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description ?? "",
        account: transaction.account ?? "",
        date: Timestamp.fromDate(transaction.date),
        updatedAt: serverTimestamp(),
      },
    );

    await setDoc(
      getUserRef(uid),
      {
        updatedAt: serverTimestamp(),
        balance: increment(balanceDelta),
      },
      { merge: true },
    );
  }

  async deleteTransaction(
    transaction: Transaction,
  ) {
    const uid = getCurrentUserId();

    if (transaction.attachment?.path) {
      try {
        await deleteAttachmentByPath(
          transaction.attachment.path,
        );
      } catch (error) {
        console.error(
          "Erro ao excluir anexo da transação:",
          error,
        );
      }
    }

    await deleteDoc(
      doc(
        db,
        "users",
        uid,
        "transactions",
        transaction.id,
      ),
    );

    await setDoc(
      getUserRef(uid),
      {
        updatedAt: serverTimestamp(),
        balance: increment(
          transaction.type === "income"
            ? -transaction.value
            : transaction.value,
        ),
      },
      { merge: true },
    );
  }
}
