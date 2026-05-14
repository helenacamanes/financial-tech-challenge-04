import React, { createContext, useContext, useEffect, useState } from "react";
import { notifyGoalReached } from "../../shared/services/notification/notificationService";
import { useAuth } from "./AuthProviders";
import {
  createGoal,
  addValueToGoalInFirestore,
  removeGoalFromFirestore,
  subscribeToGoals,
  type Goal,
  type CreateGoalInput,
} from "../../shared/services/goals/goalsService"

type GoalsContextData = {
  goals: Goal[];
  addGoal: (goal: CreateGoalInput) => Promise<void>;
  addValueToGoal: (goalId: string, amount: number) => Promise<void>;
  removeGoal: (goalId: string) => Promise<void>;
};

const GoalsContext = createContext<GoalsContextData>({} as GoalsContextData);

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    if (!user?.uid) {
      setGoals([]);
      return;
    }

    const unsubscribe = subscribeToGoals(setGoals);

    return () => {
      unsubscribe?.();
    };
  }, [user?.uid]);

  async function addGoal(goal: CreateGoalInput) {
    await createGoal(goal);
  }

  async function addValueToGoal(goalId: string, amount: number) {
    const currentGoal = goals.find((goal) => goal.id === goalId);

    if (!currentGoal) return;

    const newCurrent = Math.min(
      currentGoal.current + amount,
      currentGoal.target,
    );

    await addValueToGoalInFirestore(goalId, amount, currentGoal.target);

    if (
      currentGoal.current < currentGoal.target &&
      newCurrent >= currentGoal.target
    ) {
      notifyGoalReached(currentGoal.title);
    }
  }

  async function removeGoal(goalId: string) {
    await removeGoalFromFirestore(goalId);
  }

  return (
    <GoalsContext.Provider
      value={{ goals, addGoal, addValueToGoal, removeGoal }}
    >
      {children}
    </GoalsContext.Provider>
  );
}

export function useGoals() {
  return useContext(GoalsContext);
}

export type { Goal };
