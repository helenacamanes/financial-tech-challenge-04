import { Transaction }
  from "../entities/Transaction";

import {
  ITransactionsRepository,
  UpdateTransactionInput,
} from "../repositories/ITransactionsRepository";

export class UpdateTransactionUseCase {
  constructor(
    private repository:
      ITransactionsRepository,
  ) {}

  async execute(
    id: string,
    transaction: UpdateTransactionInput,
    previousTransaction: Transaction,
  ) {
    await this.repository.updateTransaction(
      id,
      transaction,
      previousTransaction,
    );
  }
}
