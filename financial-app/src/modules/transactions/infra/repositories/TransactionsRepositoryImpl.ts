import { Transaction }
  from "../../domain/entities/Transaction";

import {
  CreateTransactionInput,
  ITransactionsRepository,
  PaginatedResult,
  PaginationCursor,
  UpdateTransactionInput,
} from "../../domain/repositories/ITransactionsRepository";

import { FirebaseTransactionsDatasource }
  from "../datasources/FirebaseTransactionsDatasource";

export class TransactionsRepositoryImpl
  implements ITransactionsRepository
{
  constructor(
    private datasource:
      FirebaseTransactionsDatasource,
  ) {}

  subscribeToTransactions(
    callback: (transactions: Transaction[]) => void,
  ) {
    return this.datasource.subscribeToTransactions(
      callback,
    );
  }

  async getTransactionsInDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Transaction[]> {
    return this.datasource.getTransactionsInDateRange(
      startDate,
      endDate,
    );
  }

  async getTransactionsPaginated(
    pageLimit: number,
    cursor?: PaginationCursor | null,
  ): Promise<PaginatedResult<Transaction>> {
    return this.datasource.getTransactionsPaginated(
      pageLimit,
      cursor,
    );
  }

  async createTransaction(
    transaction: CreateTransactionInput,
  ) {
    await this.datasource.createTransaction(
      transaction,
    );
  }

  async updateTransaction(
    id: string,
    transaction: UpdateTransactionInput,
    previousTransaction: Transaction,
  ) {
    await this.datasource.updateTransaction(
      id,
      transaction,
      previousTransaction,
    );
  }

  async deleteTransaction(
    transaction: Transaction,
  ) {
    await this.datasource.deleteTransaction(
      transaction,
    );
  }
}
