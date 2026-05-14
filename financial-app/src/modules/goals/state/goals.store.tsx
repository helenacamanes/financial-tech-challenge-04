import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

import {
  createGoalUseCase,
  deleteGoalUseCase,
  subscribeToGoalsUseCase,
  updateGoalUseCase,
} from "@/infra/di/container";

import { useAuth }
  from "@/modules/auth/state/auth.store";

import { notifyGoalReached }
  from "@/shared/services/notification/notificationService";

import { Goal }
  from "../domain/entities/Goal";

export type CreateGoalInput = Omit<
  Goal,
  "id" | "createdAt" | "updatedAt"
>;

type GoalsStatus =
  | "idle"
  | "loading"
  | "success"
  | "error";

type GoalsState = {
  goals: Goal[];
  status: GoalsStatus;
  error: string | null;
};

type GoalsAction =
  | { type: "GOALS_LOADING" }
  | { type: "GOALS_LOADED"; payload: Goal[] }
  | { type: "GOALS_ERROR"; payload: string };

type GoalsContextData = GoalsState & {
  addGoal: (goal: CreateGoalInput) => Promise<void>;
  addValueToGoal: (
    goalId: string,
    amount: number,
  ) => Promise<void>;
  removeGoal: (goalId: string) => Promise<void>;
};

const GoalsContext =
  createContext<GoalsContextData | null>(null);

const initialState: GoalsState = {
  goals: [],
  status: "idle",
  error: null,
};

function goalsReducer(
  state: GoalsState,
  action: GoalsAction,
): GoalsState {
  switch (action.type) {
    case "GOALS_LOADING":
      return {
        ...state,
        status: "loading",
        error: null,
      };

    case "GOALS_LOADED":
      return {
        goals: action.payload,
        status: "success",
        error: null,
      };

    case "GOALS_ERROR":
      return {
        ...state,
        status: "error",
        error: action.payload,
      };

    default:
      return state;
  }
}

function getErrorMessage(
  error: unknown,
) {
  return error instanceof Error
    ? error.message
    : "Não foi possível carregar as metas.";
}

export function GoalsStoreProvider({
  children,
}: PropsWithChildren) {
  const { user } = useAuth();
  const [state, dispatch] =
    useReducer(
      goalsReducer,
      initialState,
    );

  useEffect(() => {
    if (!user?.uid) {
      dispatch({
        type: "GOALS_LOADED",
        payload: [],
      });
      return;
    }

    dispatch({ type: "GOALS_LOADING" });

    try {
      const unsubscribe =
        subscribeToGoalsUseCase.execute(
          (goals) => {
            dispatch({
              type: "GOALS_LOADED",
              payload: goals,
            });
          },
        );

      return () => {
        unsubscribe?.();
      };
    } catch (error) {
      dispatch({
        type: "GOALS_ERROR",
        payload: getErrorMessage(error),
      });
    }
  }, [user?.uid]);

  const addGoal = useCallback(
    async (
      goal: CreateGoalInput,
    ) => {
      await createGoalUseCase.execute(
        goal,
      );
    },
    [],
  );

  const addValueToGoal = useCallback(
    async (
      goalId: string,
      amount: number,
    ) => {
      const currentGoal =
        state.goals.find(
          (goal) => goal.id === goalId,
        );

      if (!currentGoal) return;

      const newCurrent = Math.min(
        currentGoal.current + amount,
        currentGoal.target,
      );

      await updateGoalUseCase.execute(
        goalId,
        {
          current: newCurrent,
        },
      );

      if (
        currentGoal.current < currentGoal.target &&
        newCurrent >= currentGoal.target
      ) {
        notifyGoalReached(
          currentGoal.title,
        );
      }
    },
    [state.goals],
  );

  const removeGoal = useCallback(
    async (
      goalId: string,
    ) => {
      await deleteGoalUseCase.execute(
        goalId,
      );
    },
    [],
  );

  const value = useMemo(
    () => ({
      ...state,
      addGoal,
      addValueToGoal,
      removeGoal,
    }),
    [
      state,
      addGoal,
      addValueToGoal,
      removeGoal,
    ],
  );

  return (
    <GoalsContext.Provider value={value}>
      {children}
    </GoalsContext.Provider>
  );
}

export function useGoals() {
  const context = useContext(GoalsContext);

  if (!context) {
    throw new Error(
      "useGoals deve ser usado dentro de GoalsStoreProvider.",
    );
  }

  return context;
}

export type { Goal };
