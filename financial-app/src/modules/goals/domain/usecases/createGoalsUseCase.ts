import { Goal }
  from "../entities/Goal";

import { IGoalsRepository }
  from "../repositories/IGoalsRepository";

export class CreateGoalUseCase {
  constructor(
    private repository:
      IGoalsRepository,
  ) {}

  async execute(
    goal: Omit<Goal, "id">,
  ) {
    await this.repository.createGoal(
      goal,
    );
  }
}
