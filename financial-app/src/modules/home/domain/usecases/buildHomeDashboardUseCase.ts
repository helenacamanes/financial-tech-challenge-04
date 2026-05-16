import type { User }
  from "@/modules/auth";
import type { Transaction }
  from "@/modules/transactions";

import { HomeDashboard }
  from "../entities/HomeDashboard";

function getFirstName(
  user: User | null,
) {
  const displayName =
    user?.displayName?.trim();

  if (displayName) {
    return displayName.split(/\s+/)[0];
  }

  const emailName =
    user?.email?.split("@")[0]?.trim();

  if (emailName) {
    return emailName.charAt(0).toUpperCase() +
      emailName.slice(1);
  }

  return "Usuário";
}

export class BuildHomeDashboardUseCase {
  execute(
    user: User | null,
    transactions: Transaction[],
  ): HomeDashboard {
    const income = transactions
      .filter((transaction) => transaction.type === "income")
      .reduce(
        (acc, transaction) => acc + transaction.value,
        0,
      );

    const expense = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce(
        (acc, transaction) => acc + transaction.value,
        0,
      );

    const total = income - expense;

    const recentTransactions = [...transactions]
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime(),
      )
      .slice(0, 5);

    const savingsPercent =
      income > 0
        ? ((total / income) * 100).toFixed(0)
        : "0";

    return {
      firstName: getFirstName(user),
      totals: {
        total,
        income,
        expense,
      },
      recentTransactions,
      savingsPercent,
    };
  }
}
