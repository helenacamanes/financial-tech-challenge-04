import { Transaction } from "../entities/transaction";

export interface IFinanceRepository {
  create(transaction: Transaction): Promise<void>;
  getTransactions(userId: string): Promise<Transaction[]>;
}