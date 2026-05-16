import { ITransactionsRepository }
  from "../repositories/ITransactionsRepository";

import { Transaction }
  from "../entities/Transaction";

export class GetTransactionsInDateRangeUseCase {
  constructor(
    private repository: ITransactionsRepository,
  ) {}

  execute(
    startDate: Date,
    endDate: Date,
  ): Promise<Transaction[]> {
    return this.repository.getTransactionsInDateRange(
      startDate,
      endDate,
    );
  }
}
