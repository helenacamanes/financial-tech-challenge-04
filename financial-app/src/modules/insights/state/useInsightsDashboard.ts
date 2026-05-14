import { useMemo } from "react";

import { buildInsightsDashboardUseCase }
  from "@/infra/di/container";
import { useTransactions }
  from "@/modules/transactions/state/transactions.store";

export function useInsightsDashboard() {
  const { transactions } = useTransactions();

  return useMemo(
    () =>
      buildInsightsDashboardUseCase.execute(
        transactions,
      ),
    [transactions],
  );
}
