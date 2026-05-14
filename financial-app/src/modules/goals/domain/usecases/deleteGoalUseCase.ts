import { IGoalsRepository }
  from "../repositories/IGoalsRepository";

export class DeleteGoalUseCase {
  constructor(
    private repository:
      IGoalsRepository,
  ) {}

  async execute(
    id: string,
  ) {
    await this.repository.deleteGoal(
      id,
    );
  }
}
