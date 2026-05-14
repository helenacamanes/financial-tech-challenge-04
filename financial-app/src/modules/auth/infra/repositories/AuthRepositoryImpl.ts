import { IAuthRepository }
  from "../../domain/repositories/IAuthRepository";

import { User }
  from "../../domain/entities/User";

import { FirebaseAuthDatasource }
  from "../datasource/FirebaseAuthDatasource";

import { type User as FirebaseUser }
  from "firebase/auth";

function mapFirebaseUser(
  user: FirebaseUser,
): User {
  return {
    id: user.uid,
    uid: user.uid,
    email: user.email ?? "",
    name: user.displayName ?? undefined,
    displayName: user.displayName ?? undefined,
    metadata: {
      creationTime: user.metadata.creationTime,
    },
  };
}

export class AuthRepositoryImpl
  implements IAuthRepository
{
  constructor(
    private datasource:
      FirebaseAuthDatasource,
  ) {}

  observeAuthState(
    callback: (user: User | null) => void,
  ) {
    return this.datasource.observeAuthState(
      (firebaseUser) => {
        callback(
          firebaseUser
            ? mapFirebaseUser(firebaseUser)
            : null,
        );
      },
    );
  }

  async login(
    email: string,
    password: string,
  ) {
    const response =
      await this.datasource.login(
        email,
        password,
      );

    return mapFirebaseUser(response.user);
  }

  async register(
    email: string,
    password: string,
    name: string,
  ) {
    const response =
      await this.datasource.register(
        email,
        password,
        name,
      );

    return mapFirebaseUser(response.user);
  }

  async logout(): Promise<void> {
    await this.datasource.logout();
  }

  async forgotPassword(
    email: string,
  ): Promise<void> {
    await this.datasource.forgotPassword(
      email,
    );
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    await this.datasource.changePassword(
      currentPassword,
      newPassword,
    );
  }
}
