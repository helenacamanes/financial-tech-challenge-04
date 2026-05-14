import { Goal }
  from "../entities/Goal";

export interface IGoalsRepository {
  subscribeToGoals(
    callback: (goals: Goal[]) => void,
  ): () => void;

  createGoal(
    goal: Omit<Goal, "id">,
  ): Promise<void>;

  getGoals(): Promise<Goal[]>;

  updateGoal(
    id: string,
    data: Partial<Goal>,
  ): Promise<void>;

  deleteGoal(
    id: string,
  ): Promise<void>;
}
