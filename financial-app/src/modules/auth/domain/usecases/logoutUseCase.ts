import { IAuthRepository }
  from "../repositories/IAuthRepository";

export class LogoutUseCase {
  constructor(
    private repository:
      IAuthRepository,
  ) {}

  async execute() {
    await this.repository.logout();
  }
}
