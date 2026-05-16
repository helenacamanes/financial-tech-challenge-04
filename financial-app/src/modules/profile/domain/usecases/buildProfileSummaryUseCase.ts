import type { User }
  from "@/modules/auth";
import type { Goal }
  from "@/modules/goals";
import type { Transaction }
  from "@/modules/transactions";

import { ProfileSummary }
  from "../entities/ProfileSummary";

function getDisplayName(
  user: User | null,
) {
  const name =
    user?.displayName?.trim() ||
    user?.name?.trim();

  if (name) return name;

  const emailPrefix =
    user?.email?.split("@")[0]?.trim();

  if (emailPrefix) {
    return emailPrefix.charAt(0).toUpperCase() +
      emailPrefix.slice(1);
  }

  return "Usuário";
}

function getDaysOfUse(
  user: User | null,
) {
  const creationTime =
    user?.metadata?.creationTime;

  if (!creationTime) return 0;

  const createdAt = new Date(creationTime);
  const now = new Date();
  const diff = Math.floor(
    (now.getTime() - createdAt.getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return Math.max(
    diff + 1,
    1,
  );
}

export class BuildProfileSummaryUseCase {
  execute(
    user: User | null,
    transactions: Transaction[],
    goals: Goal[],
  ): ProfileSummary {
    const displayName =
      getDisplayName(user);

    return {
      displayName,
      avatarLetter:
        displayName.charAt(0).toUpperCase(),
      email:
        user?.email ?? "E-mail não disponível",
      daysOfUse: getDaysOfUse(user),
      totalTransactions: transactions.length,
      activeGoals: goals.filter(
        (goal) => goal.current < goal.target,
      ).length,
    };
  }
}
