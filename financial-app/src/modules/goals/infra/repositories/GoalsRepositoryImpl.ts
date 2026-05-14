import { Goal }
  from "../../domain/entities/Goal";

import { IGoalsRepository }
  from "../../domain/repositories/IGoalsRepository";

import { FirebaseGoalsDatasource }
  from "../datasources/FirebaseGoalDatasource";

export class GoalsRepositoryImpl
  implements IGoalsRepository
{
  constructor(
    private datasource:
      FirebaseGoalsDatasource,
  ) {}

  subscribeToGoals(
    callback: (goals: Goal[]) => void,
  ) {
    return this.datasource.subscribeToGoals(
      callback,
    );
  }

  async createGoal(
    goal: Omit<Goal, "id">,
  ) {
    await this.datasource.createGoal(
      goal,
    );
  }

  async getGoals(): Promise<Goal[]> {
    const snapshot =
      await this.datasource.getGoals();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Goal[];
  }

  async updateGoal(
    id: string,
    data: Partial<Goal>,
  ) {
    await this.datasource.updateGoal(
      id,
      data,
    );
  }

  async deleteGoal(
    id: string,
  ) {
    await this.datasource.deleteGoal(
      id,
    );
  }
}
