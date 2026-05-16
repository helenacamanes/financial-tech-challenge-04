import { useEffect, useMemo, useState }
  from "react";

import {
  buildHomeDashboardUseCase,
  exportMonthlyReportUseCase,
  getTransactionsInDateRangeUseCase,
} from "@/infra/di/container";
import { useAuthState }
  from "@/modules/auth/state/auth.store";

import { Transaction }
  from "@/modules/transactions/domain/entities/Transaction";

function getMonthRange() {
  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  );
  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23, 59, 59, 999,
  );
  return { start, end };
}

export function useHomeDashboard() {
  const { user } = useAuthState();
  const [transactions, setTransactions]
    = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user?.uid) return;

    const { start, end } = getMonthRange();

    getTransactionsInDateRangeUseCase.execute(
      start,
      end,
    ).then(setTransactions);
  }, [user?.uid]);

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
