import { Transaction }
  from "@/modules/transactions/domain/entities/Transaction";

import { IHomeReportRepository }
  from "../repositories/IHomeReportRepository";

export class ExportMonthlyReportUseCase {
  constructor(
    private repository:
      IHomeReportRepository,
  ) {}

  async execute(
    transactions: Transaction[],
    monthName: string,
  ) {
    await this.repository.exportMonthlyReport(
      transactions,
      monthName,
    );
  }
}
