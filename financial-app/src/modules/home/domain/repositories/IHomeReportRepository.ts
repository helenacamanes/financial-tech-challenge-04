import type { Transaction }
  from "@/modules/transactions";

export interface IHomeReportRepository {
  exportMonthlyReport(
    transactions: Transaction[],
    monthName: string,
  ): Promise<void>;
}
