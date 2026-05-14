import { Goal }
  from "../entities/Goal";

import { IGoalsRepository }
  from "../repositories/IGoalsRepository";

export class UpdateGoalUseCase {
  constructor(
    private repository:
      IGoalsRepository,
  ) {}

  async execute(
    id: string,
    data: Partial<Goal>,
  ) {
    await this.repository.updateGoal(
      id,
      data,
    );
  }
}
