import { IAuthRepository }
  from "../repositories/IAuthRepository";

export class RegisterUseCase {
  constructor(
    private repository:
      IAuthRepository,
  ) {}

  async execute(
    name: string,
    email: string,
    password: string,
  ) {
    return this.repository.register(
      email,
      password,
      name,
    );
  }
}
