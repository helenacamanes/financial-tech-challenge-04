import type { Transaction }
  from "@/modules/transactions";

export type HomeTotals = {
  total: number;
  income: number;
  expense: number;
};

export type HomeDashboard = {
  firstName: string;
  totals: HomeTotals;
  recentTransactions: Transaction[];
  savingsPercent: string;
};
