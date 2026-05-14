import { IAuthRepository }
  from "../repositories/IAuthRepository";

import { User }
  from "../entities/User";

export class ObserveAuthStateUseCase {
  constructor(
    private repository:
      IAuthRepository,
  ) {}

  execute(
    callback: (user: User | null) => void,
  ) {
    return this.repository.observeAuthState(
      callback,
    );
  }
}
