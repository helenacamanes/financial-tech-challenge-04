import type { Transaction }
  from "@/modules/transactions";

import { IHomeReportRepository }
  from "../../domain/repositories/IHomeReportRepository";

import { ExpoPdfReportDatasource }
  from "../datasources/ExpoPdfReportDatasource";

export class HomeReportRepositoryImpl
  implements IHomeReportRepository
{
  constructor(
    private datasource:
      ExpoPdfReportDatasource,
  ) {}

  async exportMonthlyReport(
    transactions: Transaction[],
    monthName: string,
  ) {
    await this.datasource.exportMonthlyReport(
      transactions,
      monthName,
    );
  }
}
