import { Transaction }
  from "../entities/Transaction";

import type { LocalAttachmentInput }
  from "@/shared/services/storage/storageService";

export type CreateTransactionInput = {
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: Date;
  account?: string;
  attachment?: LocalAttachmentInput | null;
};

export type UpdateTransactionInput = {
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: Date;
  account?: string;
};

export interface ITransactionsRepository {
  subscribeToTransactions(
    callback: (transactions: Transaction[]) => void,
  ): () => void;

  createTransaction(
    transaction: CreateTransactionInput,
  ): Promise<void>;

  updateTransaction(
    id: string,
    transaction: UpdateTransactionInput,
    previousTransaction: Transaction,
  ): Promise<void>;

  deleteTransaction(
    transaction: Transaction,
  ): Promise<void>;
}
