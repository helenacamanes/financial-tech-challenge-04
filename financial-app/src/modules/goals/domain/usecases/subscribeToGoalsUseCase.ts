import { Goal }
  from "../entities/Goal";

import { IGoalsRepository }
  from "../repositories/IGoalsRepository";

export class SubscribeToGoalsUseCase {
  constructor(
    private repository:
      IGoalsRepository,
  ) {}

  execute(
    callback: (goals: Goal[]) => void,
  ) {
    return this.repository.subscribeToGoals(
      callback,
    );
  }
}
