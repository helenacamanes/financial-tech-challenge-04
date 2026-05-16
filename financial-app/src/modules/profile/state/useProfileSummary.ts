import { useMemo } from "react";

import { buildProfileSummaryUseCase }
  from "@/infra/di/container";
import { useAuthState }
  from "@/modules/auth";
import { useGoalsState }
  from "@/modules/goals";
import { useTransactionsState }
  from "@/modules/transactions";

export function useProfileSummary() {
  const { user } = useAuthState();
  const { goals } = useGoalsState();
  const { transactions } = useTransactionsState();

  return useMemo(
    () =>
      buildProfileSummaryUseCase.execute(
        user,
        transactions,
        goals,
      ),
    [
      user,
      transactions,
      goals,
    ],
  );
}
