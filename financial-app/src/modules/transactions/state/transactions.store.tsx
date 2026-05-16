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
  getTransactionsUseCase,
  updateTransactionUseCase,
} from "@/infra/di/container";

import { useAuthState }
  from "@/modules/auth";

import { Transaction }
  from "../domain/entities/Transaction";

import {
  CreateTransactionInput,
  PaginationCursor,
  UpdateTransactionInput,
} from "../domain/repositories/ITransactionsRepository";

const PAGE_SIZE = 20;

type TransactionsStatus =
  | "idle"
  | "loading"
  | "success"
  | "error";

type TransactionsState = {
  transactions: Transaction[];
  status: TransactionsStatus;
  error: string | null;
  lastUpdated: number | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  refreshing: boolean;
};

type TransactionsAction =
  | { type: "TRANSACTIONS_LOADING" }
  | {
      type: "TRANSACTIONS_LOADED";
      payload: Transaction[];
      hasMore: boolean;
      updatedAt?: number;
    }
  | { type: "TRANSACTIONS_APPENDED"; payload: Transaction[]; hasMore: boolean }
  | { type: "TRANSACTIONS_ERROR"; payload: string }
  | { type: "TRANSACTIONS_REFRESHING" }
  | { type: "TRANSACTIONS_LOADING_MORE" }
  | { type: "TRANSACTIONS_CLEAR" };

type TransactionActionsContextData = {
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
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
};

const TransactionStateContext =
  createContext<TransactionsState | null>(null);

const TransactionActionsContext =
  createContext<TransactionActionsContextData | null>(null);

const initialState: TransactionsState = {
  transactions: [],
  status: "idle",
  error: null,
  lastUpdated: null,
  hasMore: true,
  isLoadingMore: false,
  refreshing: false,
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
        refreshing: false,
      };

    case "TRANSACTIONS_LOADED":
      return {
        ...state,
        transactions: action.payload,
        status: "success",
        error: null,
        lastUpdated:
          action.updatedAt ?? Date.now(),
        hasMore: action.hasMore,
        isLoadingMore: false,
        refreshing: false,
      };

    case "TRANSACTIONS_APPENDED":
      return {
        ...state,
        transactions: [
          ...state.transactions,
          ...action.payload,
        ],
        status: "success",
        hasMore: action.hasMore,
        isLoadingMore: false,
      };

    case "TRANSACTIONS_ERROR":
      return {
        ...state,
        status: state.transactions.length > 0
          ? "success"
          : "error",
        error: action.payload,
        isLoadingMore: false,
        refreshing: false,
      };

    case "TRANSACTIONS_REFRESHING":
      return {
        ...state,
        refreshing: true,
        error: null,
      };

    case "TRANSACTIONS_LOADING_MORE":
      return {
        ...state,
        isLoadingMore: true,
      };

    case "TRANSACTIONS_CLEAR":
      return { ...initialState };

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

let paginationCursorRef: PaginationCursor | null = null;

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
      dispatch({ type: "TRANSACTIONS_CLEAR" });
      return;
    }

    paginationCursorRef = null;
    loadPage();

    async function loadPage() {
      dispatch({ type: "TRANSACTIONS_LOADING" });

      try {
        const result =
          await getTransactionsUseCase.execute(
            PAGE_SIZE,
          );

        paginationCursorRef = result.cursor;

        dispatch({
          type: "TRANSACTIONS_LOADED",
          payload: result.data,
          hasMore: result.hasMore,
        });
      } catch (error) {
        dispatch({
          type: "TRANSACTIONS_ERROR",
          payload: getErrorMessage(error),
        });
      }
    }
  }, [user?.uid]);

  async function loadPage() {
    dispatch({ type: "TRANSACTIONS_LOADING" });

    try {
      const result =
        await getTransactionsUseCase.execute(
          PAGE_SIZE,
        );

      paginationCursorRef = result.cursor;

      dispatch({
        type: "TRANSACTIONS_LOADED",
        payload: result.data,
        hasMore: result.hasMore,
      });
    } catch (error) {
      dispatch({
        type: "TRANSACTIONS_ERROR",
        payload: getErrorMessage(error),
      });
    }
  }

  const addTransaction = useCallback(
    async (
      transaction: CreateTransactionInput,
    ) => {
      await createTransactionUseCase.execute(
        transaction,
      );
      await loadPage();
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
      await loadPage();
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
      await loadPage();
    },
    [],
  );

  const loadMore = useCallback(
    async () => {
      if (
        state.isLoadingMore ||
        !state.hasMore ||
        !paginationCursorRef
      ) {
        return;
      }

      dispatch({
        type: "TRANSACTIONS_LOADING_MORE",
      });

      try {
        const result =
          await getTransactionsUseCase.execute(
            PAGE_SIZE,
            paginationCursorRef,
          );

        paginationCursorRef = result.cursor;

        dispatch({
          type: "TRANSACTIONS_APPENDED",
          payload: result.data,
          hasMore: result.hasMore,
        });
      } catch (_error) {
        dispatch({
          type: "TRANSACTIONS_ERROR",
          payload: "Erro ao carregar mais transações.",
        });
      }
    },
    [
      state.isLoadingMore,
      state.hasMore,
    ],
  );

  const refresh = useCallback(
    async () => {
      dispatch({ type: "TRANSACTIONS_REFRESHING" });

      paginationCursorRef = null;

      try {
        const result =
          await getTransactionsUseCase.execute(
            PAGE_SIZE,
          );

        paginationCursorRef = result.cursor;

        dispatch({
          type: "TRANSACTIONS_LOADED",
          payload: result.data,
          hasMore: result.hasMore,
        });
      } catch (error) {
        dispatch({
          type: "TRANSACTIONS_ERROR",
          payload: getErrorMessage(error),
        });
      }
    },
    [],
  );

  const actionsValue = useMemo(
    () => ({
      addTransaction,
      updateTransaction,
      removeTransaction,
      loadMore,
      refresh,
    }),
    [
      addTransaction,
      updateTransaction,
      removeTransaction,
      loadMore,
      refresh,
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
