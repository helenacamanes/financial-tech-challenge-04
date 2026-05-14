import { IGoalsRepository }
  from "../repositories/IGoalsRepository";

export class GetGoalsUseCase {
  constructor(
    private repository:
      IGoalsRepository,
  ) {}

  async execute() {
    return this.repository.getGoals();
  }
}