import type { Transaction }
  from "@/modules/transactions";

export type CategoryTotal = {
  label: string;
  value: number;
  color: string;
  icon: string;
};

export type MonthlyInsight = {
  month: string;
  income: number;
  expense: number;
};

export type MonthBalance = {
  income: number;
  expense: number;
  balance: number;
};

export type InsightsDashboard = {
  biggestExpense: Transaction | null;
  categoryTotals: CategoryTotal[];
  monthlyData: MonthlyInsight[];
  monthBalance: MonthBalance;
  averageMonthlyBalance: number;
  expandedAnalysisText: string;
  collapsedAnalysisText: string;
};
