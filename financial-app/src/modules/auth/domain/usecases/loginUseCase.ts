import { IAuthRepository }
  from "../repositories/IAuthRepository";

export class LoginUseCase {
  constructor(
    private repository:
      IAuthRepository,
  ) {}

  async execute(
    email: string,
    password: string,
  ) {
    return this.repository.login(
      email,
      password,
    );
  }
}