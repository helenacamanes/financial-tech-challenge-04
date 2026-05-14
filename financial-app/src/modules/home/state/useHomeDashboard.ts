import { useMemo } from "react";

import {
  buildHomeDashboardUseCase,
  exportMonthlyReportUseCase,
} from "@/infra/di/container";
import { useAuth }
  from "@/modules/auth/state/auth.store";
import { useTransactions }
  from "@/modules/transactions/state/transactions.store";

export function useHomeDashboard() {
  const { user } = useAuth();
  const { transactions } = useTransactions();

  const dashboard = useMemo(
    () =>
      buildHomeDashboardUseCase.execute(
        user,
        transactions,
      ),
    [
      user,
      transactions,
    ],
  );

  async function exportReport(
    monthName: string,
  ) {
    await exportMonthlyReportUseCase.execute(
      transactions,
      monthName,
    );
  }

  return {
    ...dashboard,
    transactions,
    exportReport,
  };
}
