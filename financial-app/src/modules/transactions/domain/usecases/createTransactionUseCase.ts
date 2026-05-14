import {
  CreateTransactionInput,
  ITransactionsRepository,
} from "../repositories/ITransactionsRepository";

export class CreateTransactionUseCase {
  constructor(
    private repository:
      ITransactionsRepository,
  ) {}

  async execute(
    transaction: CreateTransactionInput,
  ) {
    await this.repository.createTransaction(
      transaction,
    );
  }
}
