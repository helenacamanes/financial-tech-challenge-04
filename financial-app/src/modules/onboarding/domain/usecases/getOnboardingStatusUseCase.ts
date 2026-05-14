import { IOnboardingRepository }
  from "../repositories/IOnboardingRepository";

export class GetOnboardingStatusUseCase {
  constructor(
    private repository:
      IOnboardingRepository,
  ) {}

  async execute() {
    return this.repository.hasSeenOnboarding();
  }
}
