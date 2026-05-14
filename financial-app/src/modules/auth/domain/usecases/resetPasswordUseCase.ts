import { IAuthRepository }
  from "../repositories/IAuthRepository";

export class ResetPasswordUseCase {
  constructor(
    private repository:
      IAuthRepository,
  ) {}

  async execute(
    email: string,
  ) {
    await this.repository.forgotPassword(
      email,
    );
  }
}
