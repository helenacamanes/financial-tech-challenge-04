import { useMemo } from "react";

import { buildInsightsDashboardUseCase }
  from "@/infra/di/container";
import { useTransactionsState }
  from "@/modules/transactions";

export function useInsightsDashboard() {
  const { transactions } = useTransactionsState();

  return useMemo(
    () =>
      buildInsightsDashboardUseCase.execute(
        transactions,
      ),
    [transactions],
  );
}
