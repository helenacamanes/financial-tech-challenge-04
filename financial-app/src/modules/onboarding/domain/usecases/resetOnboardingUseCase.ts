import { IOnboardingRepository }
  from "../repositories/IOnboardingRepository";

export class ResetOnboardingUseCase {
  constructor(
    private repository:
      IOnboardingRepository,
  ) {}

  async execute() {
    await this.repository.resetOnboarding();
  }
}
