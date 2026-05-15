import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useReducer,
} from "react";

import {
  createTransactionUseCase,
  deleteTransactionUseCase,
  subscribeToTransactionsUseCase,
  updateTransactionUseCase,
} from "@/infra/di/container";

import { useAuthState }
  from "@/modules/auth/state/auth.store";

import { Transaction }
  from "../domain/entities/Transaction";

import {
  CreateTransactionInput,
  UpdateTransactionInput,
} from "../domain/repositories/ITransactionsRepository";

type TransactionsStatus =
  | "idle"
  | "loading"
  | "success"
  | "error";

type TransactionsState = {
  transactions: Transaction[];
  status: TransactionsStatus;
  error: string | null;
};

type TransactionsAction =
  | { type: "TRANSACTIONS_LOADING" }
  | { type: "TRANSACTIONS_LOADED"; payload: Transaction[] }
  | { type: "TRANSACTIONS_ERROR"; payload: string };

type TransactionContextData = TransactionsState & {
  addTransaction: (
    transaction: CreateTransactionInput,
  ) => Promise<void>;
  updateTransaction: (
    id: string,
    transaction: Omit<Transaction, "id">,
  ) => Promise<void>;
  removeTransaction: (
    id: string,
  ) => Promise<void>;
};

type TransactionActionsContextData = Omit<
  TransactionContextData,
  keyof TransactionsState
>;

const TransactionStateContext =
  createContext<TransactionsState | null>(null);

const TransactionActionsContext =
  createContext<TransactionActionsContextData | null>(null);

const initialState: TransactionsState = {
  transactions: [],
  status: "idle",
  error: null,
};

function transactionsReducer(
  state: TransactionsState,
  action: TransactionsAction,
): TransactionsState {
  switch (action.type) {
    case "TRANSACTIONS_LOADING":
      return {
        ...state,
        status: "loading",
        error: null,
      };

    case "TRANSACTIONS_LOADED":
      return {
        transactions: action.payload,
        status: "success",
        error: null,
      };

    case "TRANSACTIONS_ERROR":
      return {
        ...state,
        status: "error",
        error: action.payload,
      };

    default:
      return state;
  }
}

function getErrorMessage(
  error: unknown,
) {
  return error instanceof Error
    ? error.message
    : "Não foi possível carregar as transações.";
}

export function TransactionsStoreProvider({
  children,
}: PropsWithChildren) {
  const { user } = useAuthState();
  const [state, dispatch] =
    useReducer(
      transactionsReducer,
      initialState,
    );
  const transactionsRef =
    useRef<Transaction[]>([]);

  useEffect(() => {
    transactionsRef.current =
      state.transactions;
  }, [state.transactions]);

  useEffect(() => {
    if (!user?.uid) {
      dispatch({
        type: "TRANSACTIONS_LOADED",
        payload: [],
      });
      return;
    }

    dispatch({ type: "TRANSACTIONS_LOADING" });

    try {
      const unsubscribe =
        subscribeToTransactionsUseCase.execute(
          (transactions) => {
            dispatch({
              type: "TRANSACTIONS_LOADED",
              payload: transactions,
            });
          },
        );

      return () => {
        unsubscribe?.();
      };
    } catch (error) {
      dispatch({
        type: "TRANSACTIONS_ERROR",
        payload: getErrorMessage(error),
      });
    }
  }, [user?.uid]);

  const addTransaction = useCallback(
    async (
      transaction: CreateTransactionInput,
    ) => {
      await createTransactionUseCase.execute(
        transaction,
      );
    },
    [],
  );

  const updateTransaction = useCallback(
    async (
      id: string,
      transaction: Omit<Transaction, "id">,
    ) => {
      const currentTransaction =
        transactionsRef.current.find(
          (item) => item.id === id,
        );

      if (!currentTransaction) return;

      const payload: UpdateTransactionInput = {
        type: transaction.type,
        amount: transaction.value,
        category: transaction.title,
        description: transaction.description ?? "",
        date: transaction.date,
        account: transaction.account ?? "",
      };

      await updateTransactionUseCase.execute(
        id,
        payload,
        currentTransaction,
      );
    },
    [],
  );

  const removeTransaction = useCallback(
    async (
      id: string,
    ) => {
      const transaction =
        transactionsRef.current.find(
          (item) => item.id === id,
        );

      if (!transaction) return;

      await deleteTransactionUseCase.execute(
        transaction,
      );
    },
    [],
  );

  const actionsValue = useMemo(
    () => ({
      addTransaction,
      updateTransaction,
      removeTransaction,
    }),
    [
      addTransaction,
      updateTransaction,
      removeTransaction,
    ],
  );

  return (
    <TransactionStateContext.Provider value={state}>
      <TransactionActionsContext.Provider value={actionsValue}>
        {children}
      </TransactionActionsContext.Provider>
    </TransactionStateContext.Provider>
  );
}

export function useTransactionsState() {
  const context = useContext(TransactionStateContext);

  if (!context) {
    throw new Error(
      "useTransactionsState deve ser usado dentro de TransactionsStoreProvider.",
    );
  }

  return context;
}

export function useTransactionsActions() {
  const context = useContext(TransactionActionsContext);

  if (!context) {
    throw new Error(
      "useTransactionsActions deve ser usado dentro de TransactionsStoreProvider.",
    );
  }

  return context;
}

export function useTransactions() {
  return {
    ...useTransactionsState(),
    ...useTransactionsActions(),
  };
}

export type {
  CreateTransactionInput,
  Transaction,
};
