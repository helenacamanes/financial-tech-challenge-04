import type { Transaction }
  from "@/modules/transactions";

import {
  CategoryTotal,
  InsightsDashboard,
} from "../entities/InsightsDashboard";

const CATEGORY_COLORS: Record<
  string,
  { color: string; icon: string }
> = {
  Mercado: { color: "#3B82F6", icon: "cart-outline" },
  Transporte: { color: "#8B5CF6", icon: "car-outline" },
  Moradia: { color: "#F97316", icon: "home-outline" },
  Alimentação: { color: "#F59E0B", icon: "fast-food-outline" },
  Lazer: { color: "#10B981", icon: "game-controller-outline" },
  Tecnologia: { color: "#06B6D4", icon: "laptop-outline" },
  Saúde: { color: "#EF4444", icon: "medkit-outline" },
  Educação: { color: "#6366F1", icon: "school-outline" },
  Salário: { color: "#22C55E", icon: "cash-outline" },
  Assinaturas: { color: "#EC4899", icon: "repeat-outline" },
  Pets: { color: "#F43F5E", icon: "paw-outline" },
  Viagem: { color: "#14B8A6", icon: "airplane-outline" },
  Outros: { color: "#A855F7", icon: "ellipsis-horizontal-outline" },
};

const MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

function formatCurrency(
  value: number,
) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function isSameMonth(
  date: Date,
  month: number,
  year: number,
) {
  const parsed = new Date(date);

  return (
    parsed.getMonth() === month &&
    parsed.getFullYear() === year
  );
}

export class BuildInsightsDashboardUseCase {
  execute(
    transactions: Transaction[],
    referenceDate = new Date(),
  ): InsightsDashboard {
    const currentMonth =
      referenceDate.getMonth();
    const currentYear =
      referenceDate.getFullYear();

    const currentMonthTransactions =
      transactions.filter((transaction) =>
        isSameMonth(
          transaction.date,
          currentMonth,
          currentYear,
        ),
      );

    const currentMonthExpenses =
      currentMonthTransactions.filter(
        (transaction) => transaction.type === "expense",
      );

    const biggestExpense =
      currentMonthExpenses.length > 0
        ? currentMonthExpenses.reduce(
            (max, transaction) =>
              transaction.value > max.value
                ? transaction
                : max,
            currentMonthExpenses[0],
          )
        : null;

    const categoryMap: Record<string, number> = {};

    currentMonthExpenses.forEach((transaction) => {
      categoryMap[transaction.title] =
        (categoryMap[transaction.title] || 0) +
        transaction.value;
    });

    const categoryTotals: CategoryTotal[] =
      Object.entries(categoryMap)
        .map(([label, value]) => ({
          label,
          value,
          color:
            CATEGORY_COLORS[label]?.color ??
            "#64748B",
          icon:
            CATEGORY_COLORS[label]?.icon ??
            "receipt-outline",
        }))
        .sort((a, b) => b.value - a.value);

    const monthlyData = Array.from(
      { length: 6 },
      (_, index) => {
        const date = new Date(
          currentYear,
          currentMonth - 5 + index,
          1,
        );
        const month = date.getMonth();
        const year = date.getFullYear();

        const income = transactions
          .filter(
            (transaction) =>
              transaction.type === "income" &&
              isSameMonth(
                transaction.date,
                month,
                year,
              ),
          )
          .reduce(
            (acc, transaction) => acc + transaction.value,
            0,
          );

        const expense = transactions
          .filter(
            (transaction) =>
              transaction.type === "expense" &&
              isSameMonth(
                transaction.date,
                month,
                year,
              ),
          )
          .reduce(
            (acc, transaction) => acc + transaction.value,
            0,
          );

        return {
          month: MONTHS[month],
          income,
          expense,
        };
      },
    );

    const income = currentMonthTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce(
        (acc, transaction) => acc + transaction.value,
        0,
      );

    const expense = currentMonthExpenses
      .reduce(
        (acc, transaction) => acc + transaction.value,
        0,
      );

    const monthBalance = {
      income,
      expense,
      balance: income - expense,
    };

    const activeMonths =
      monthlyData.filter(
        (data) => data.income > 0 || data.expense > 0,
      ).length || 1;

    const averageMonthlyBalance =
      monthlyData.reduce(
        (acc, data) => acc + data.income - data.expense,
        0,
      ) / activeMonths;

    const topCategory =
      categoryTotals[0]?.label ??
      "diversas categorias";

    const secondCategory =
      categoryTotals[1]
        ? ` e ${categoryTotals[1].label}`
        : "";

    const expandedAnalysisText =
      monthBalance.balance >= 0
        ? `Com base nas suas transações, os seus maiores gastos estão concentrados em ${topCategory}${secondCategory}. Este mês você tem um saldo positivo de ${formatCurrency(monthBalance.balance)}, o que representa ${Math.round((monthBalance.balance / Math.max(monthBalance.income, 1)) * 100)}% das suas receitas poupadas.`
        : `Com base nas suas transações, os seus maiores gastos estão concentrados em ${topCategory}${secondCategory}. Este mês os gastos superaram as receitas em ${formatCurrency(Math.abs(monthBalance.balance))}. Considere reduzir gastos em ${topCategory}.`;

    return {
      biggestExpense,
      categoryTotals,
      monthlyData,
      monthBalance,
      averageMonthlyBalance,
      expandedAnalysisText,
      collapsedAnalysisText:
        "Clique para ver a análise completa com base nas suas transações...",
    };
  }
}
