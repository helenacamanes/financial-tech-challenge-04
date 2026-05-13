import React, { createContext, useContext, useEffect, useState } from "react";
import { Transaction } from "../@types/transaction";
import {
  createTransaction,
  removeTransactionFromFirestore,
  subscribeToTransactions,
  updateTransactionInFirestore,
  type CreateTransactionInput,
} from "../services/firestoreService";
import { useAuth } from "./AuthContext";

type TransactionContextData = {
  transactions: Transaction[];
  addTransaction: (transaction: CreateTransactionInput) => Promise<void>;
  updateTransaction: (
    id: string,
    transaction: Omit<Transaction, "id">,
  ) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
};

const TransactionContext = createContext<TransactionContextData>(
  {} as TransactionContextData,
);

export function TransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user?.uid) {
      setTransactions([]);
      return;
    }

    let unsubscribe: undefined | (() => void);

    try {
      unsubscribe = subscribeToTransactions(setTransactions);
    } catch (error) {
      console.error("Erro ao assinar transações:", error);
      setTransactions([]);
    }

    return () => {
      unsubscribe?.();
    };
  }, [user?.uid]);

  async function addTransaction(transaction: CreateTransactionInput) {
    await createTransaction(transaction);
  }

  async function updateTransaction(
    id: string,
    transaction: Omit<Transaction, "id">,
  ) {
    const currentTransaction = transactions.find((t) => t.id === id);

    if (!currentTransaction) return;

    await updateTransactionInFirestore(
      id,
      {
        type: transaction.type,
        amount: transaction.value,
        category: transaction.title,
        description: transaction.description ?? "",
        date: transaction.date,
        account: transaction.account ?? "",
      },
      currentTransaction,
    );
  }

  async function removeTransaction(id: string) {
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return;

    await removeTransactionFromFirestore(transaction);
  }

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        removeTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  return useContext(TransactionContext);
}
