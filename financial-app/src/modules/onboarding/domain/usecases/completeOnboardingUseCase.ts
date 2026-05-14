import { IOnboardingRepository }
  from "../repositories/IOnboardingRepository";

export class CompleteOnboardingUseCase {
  constructor(
    private repository:
      IOnboardingRepository,
  ) {}

  async execute() {
    await this.repository.completeOnboarding();
  }
}
