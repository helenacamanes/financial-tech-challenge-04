import { IOnboardingRepository }
  from "../../domain/repositories/IOnboardingRepository";

import { AsyncStorageOnboardingDatasource }
  from "../datasources/AsyncStorageOnboardingDatasource";

export class OnboardingRepositoryImpl
  implements IOnboardingRepository
{
  constructor(
    private datasource:
      AsyncStorageOnboardingDatasource,
  ) {}

  async hasSeenOnboarding() {
    return this.datasource.hasSeenOnboarding();
  }

  async completeOnboarding() {
    await this.datasource.completeOnboarding();
  }

  async resetOnboarding() {
    await this.datasource.resetOnboarding();
  }
}
