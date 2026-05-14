import { Transaction }
  from "../entities/Transaction";

import { ITransactionsRepository }
  from "../repositories/ITransactionsRepository";

export class SubscribeToTransactionsUseCase {
  constructor(
    private repository:
      ITransactionsRepository,
  ) {}

  execute(
    callback: (transactions: Transaction[]) => void,
  ) {
    return this.repository.subscribeToTransactions(
      callback,
    );
  }
}
