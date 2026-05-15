import { useMemo } from "react";

import { buildProfileSummaryUseCase }
  from "@/infra/di/container";
import { useAuthState }
  from "@/modules/auth/state/auth.store";
import { useGoalsState }
  from "@/modules/goals/state/goals.store";
import { useTransactionsState }
  from "@/modules/transactions/state/transactions.store";

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
