import { Transaction }
  from "../entities/Transaction";

import { ITransactionsRepository }
  from "../repositories/ITransactionsRepository";

export class DeleteTransactionUseCase {
  constructor(
    private repository:
      ITransactionsRepository,
  ) {}

  async execute(
    transaction: Transaction,
  ) {
    await this.repository.deleteTransaction(
      transaction,
    );
  }
}
