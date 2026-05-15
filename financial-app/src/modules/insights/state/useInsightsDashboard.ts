import { useMemo } from "react";

import { buildInsightsDashboardUseCase }
  from "@/infra/di/container";
import { useTransactionsState }
  from "@/modules/transactions/state/transactions.store";

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
