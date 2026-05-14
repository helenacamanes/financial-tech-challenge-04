import { IAuthRepository }
  from "../repositories/IAuthRepository";

export class ChangePasswordUseCase {
  constructor(
    private repository:
      IAuthRepository,
  ) {}

  async execute(
    currentPassword: string,
    newPassword: string,
  ) {
    await this.repository.changePassword(
      currentPassword,
      newPassword,
    );
  }
}
