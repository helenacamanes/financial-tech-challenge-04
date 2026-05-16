import {
  ITransactionsRepository,
  PaginatedResult,
  PaginationCursor,
} from "../repositories/ITransactionsRepository";

import { Transaction }
  from "../entities/Transaction";

export class GetTransactionsUseCase {
  constructor(
    private repository: ITransactionsRepository,
  ) {}

  execute(
    pageLimit: number,
    cursor?: PaginationCursor | null,
  ): Promise<PaginatedResult<Transaction>> {
    return this.repository.getTransactionsPaginated(
      pageLimit,
      cursor,
    );
  }
}
