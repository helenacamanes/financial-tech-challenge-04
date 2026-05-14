import { Transaction }
  from "@/modules/transactions/domain/entities/Transaction";

export interface IHomeReportRepository {
  exportMonthlyReport(
    transactions: Transaction[],
    monthName: string,
  ): Promise<void>;
}
