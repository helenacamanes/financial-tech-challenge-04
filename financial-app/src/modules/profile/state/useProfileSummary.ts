import { useMemo } from "react";

import { buildProfileSummaryUseCase }
  from "@/infra/di/container";
import { useAuth }
  from "@/modules/auth/state/auth.store";
import { useGoals }
  from "@/modules/goals/state/goals.store";
import { useTransactions }
  from "@/modules/transactions/state/transactions.store";

export function useProfileSummary() {
  const { user } = useAuth();
  const { goals } = useGoals();
  const { transactions } = useTransactions();

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
