import { User }
  from "@/modules/auth/domain/entities/User";
import { Goal }
  from "@/modules/goals/domain/entities/Goal";
import { Transaction }
  from "@/modules/transactions/domain/entities/Transaction";

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
